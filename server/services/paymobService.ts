import crypto from 'crypto';
import type { OrderDocument } from '../models/types.ts';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { Logger } from '../utils/logger.ts';
import { createNotification } from './notificationService.ts';

export interface PaymobConfig {
  secretKey?: string;
  publicKey?: string;
  cardIntegrationId?: string;
  walletIntegrationId?: string;
  iframeId?: string;
  hmacSecret?: string;
  environment: 'live' | 'test';
}

function getKeyEnvironment(value?: string): 'live' | 'test' | undefined {
  const match = value?.match(/(?:^|_)(?:pk|sk)_(test|live)(?:_|$)/i);
  return match?.[1]?.toLowerCase() as 'live' | 'test' | undefined;
}

export function getPaymobConfig(): PaymobConfig {
  const configuredEnvironment = process.env.PAYMOB_ENVIRONMENT?.trim().toLowerCase();
  if (configuredEnvironment && configuredEnvironment !== 'test' && configuredEnvironment !== 'live') {
    throw new Error('قيمة PAYMOB_ENVIRONMENT غير صالحة. استخدم TEST أو LIVE.');
  }

  const environment: PaymobConfig['environment'] =
    configuredEnvironment === 'live' ? 'live' : 'test';
  return {
    secretKey: process.env.PAYMOB_SECRET_KEY?.trim(),
    publicKey: process.env.PAYMOB_PUBLIC_KEY?.trim(),
    cardIntegrationId: (
      process.env.PAYMOB_INTEGRATION_ID_CARD ||
      process.env.PAYMOB_CARD_INTEGRATION_ID ||
      process.env.PAYMOB_INTEGRATION_ID
    )?.trim(),
    walletIntegrationId: (
      process.env.PAYMOB_INTEGRATION_ID_WALLET ||
      process.env.PAYMOB_WALLET_INTEGRATION_ID
    )?.trim(),
    iframeId: process.env.PAYMOB_IFRAME_ID?.trim(),
    hmacSecret: process.env.PAYMOB_HMAC_SECRET?.trim(),
    environment
  };
}

export interface InitiatePaymentResult {
  paymentUrl: string;
  clientSecret?: string;
  provider: 'paymob' | 'paymob_simulated';
  paymentMethod: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  message?: string;
}

function getPaymobErrorSummary(responseBody: unknown): string | undefined {
  if (!responseBody || typeof responseBody !== 'object') return undefined;

  const body = responseBody as Record<string, unknown>;
  for (const key of ['detail', 'message', 'error_description', 'error']) {
    const value = body[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim().replace(/\s+/g, ' ').slice(0, 300);
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = value as Record<string, unknown>;
      for (const nestedKey of ['message', 'detail', 'code']) {
        const nestedValue = nested[nestedKey];
        if (typeof nestedValue === 'string' && nestedValue.trim()) {
          return nestedValue.trim().replace(/\s+/g, ' ').slice(0, 300);
        }
      }
    }
  }
  return undefined;
}

function sanitizePaymobErrorSummary(summary: string | undefined, config: PaymobConfig): string | undefined {
  if (!summary) return undefined;

  return [config.secretKey, config.hmacSecret]
    .filter((secret): secret is string => Boolean(secret))
    .reduce((message, secret) => message.split(secret).join('[REDACTED]'), summary);
}

/**
 * Initiates a Paymob Unified Checkout intention.
 */
export async function initiatePaymobPayment(
  order: OrderDocument,
  methodType: 'card' | 'wallet' | 'all' = 'all',
  requestOrigin?: string
): Promise<InitiatePaymentResult> {
  const config = getPaymobConfig();
  const keyEnvironments = [
    getKeyEnvironment(config.secretKey),
    getKeyEnvironment(config.publicKey)
  ].filter((mode): mode is 'live' | 'test' => Boolean(mode));
  if (keyEnvironments.some((mode) => mode !== config.environment)) {
    throw new Error(
      `إعداد Paymob غير متطابق: PAYMOB_ENVIRONMENT=${config.environment.toUpperCase()} لكن أحد المفاتيح يحمل وضعاً مختلفاً. استخدم مفاتيح ومعرّفات TEST معاً أو مفاتيح ومعرّفات LIVE معاً.`
    );
  }

  const configuredOrigin =
    requestOrigin ||
    process.env.APP_URL ||
    (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000');
  if (!configuredOrigin) {
    throw new Error('إعداد رابط الموقع العام APP_URL مطلوب لتفعيل Paymob');
  }
  const appUrl = new URL(configuredOrigin);
  if (process.env.NODE_ENV === 'production' && appUrl.protocol !== 'https:') {
    throw new Error('يجب أن يستخدم رابط الموقع APP_URL اتصال HTTPS في بيئة الإنتاج');
  }
  const origin = appUrl.origin;
  const amountCents = Math.round(order.total * 100);

  // Split buyer name into first and last name
  const nameParts = (order.buyerName || 'مشتري صعيدي').trim().split(/\s+/);
  const firstName = nameParts[0] || 'مشتري';
  const lastName = nameParts.slice(1).join(' ') || 'وه';

  const streetAddress =
    order.shippingAddress?.streetAddress ||
    (order.shippingAddress as any)?.addressText ||
    'الصعيد';

  const billingData = {
    first_name: firstName,
    last_name: lastName,
    phone_number: order.buyerPhone || '01000000000',
    email: order.buyerEmail || 'customer@wah-saeed.com',
    apartment: 'NA',
    floor: 'NA',
    street: streetAddress.slice(0, 50),
    building: 'NA',
    postal_code: 'NA',
    city: order.shippingAddress?.city || 'قنا',
    country: 'EGY',
    state: order.shippingAddress?.governorate || 'قنا'
  };

  if (!config.secretKey || !config.publicKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('إعدادات Paymob غير مكتملة. يلزم PAYMOB_SECRET_KEY وPAYMOB_PUBLIC_KEY لإنشاء الدفع الفعلي.');
    }

    const simulatedPaymentUrl = `${origin}/api/payments/paymob/simulator?orderId=${encodeURIComponent(order.id)}&orderNumber=${encodeURIComponent(order.orderNumber)}&amount=${encodeURIComponent(order.total)}&method=${encodeURIComponent(methodType)}`;
    return {
      paymentUrl: simulatedPaymentUrl,
      provider: 'paymob_simulated',
      paymentMethod: methodType,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      message: 'وضع المحاكاة متاح في بيئة التطوير فقط. أضف بيانات Paymob لتفعيل الدفع الفعلي.'
    };
  }

  // Determine integration IDs (must be valid positive numeric IDs for Paymob)
  const parseIntegrationId = (val?: string): number | null => {
    if (!val) return null;
    const clean = val.trim();
    if (/^\d+$/.test(clean)) {
      const num = Number(clean);
      return Number.isSafeInteger(num) && num > 0 ? num : null;
    }
    return null;
  };

  const cardId = parseIntegrationId(config.cardIntegrationId);
  const walletId = parseIntegrationId(config.walletIntegrationId);

  const paymentMethods: number[] = [];
  if (methodType === 'card') {
    if (!cardId) throw new Error('إعداد معرّف تكامل بطاقات Paymob غير مكتمل');
    paymentMethods.push(cardId);
  } else if (methodType === 'wallet') {
    if (!walletId) {
      throw new Error('معرّف تكامل محفظة Paymob مفقود أو غير صالح. اضبط PAYMOB_INTEGRATION_ID_WALLET برقم صحيح من نفس بيئة وحساب التاجر.');
    }
    paymentMethods.push(walletId);
  } else {
    if (cardId) paymentMethods.push(cardId);
    if (walletId) paymentMethods.push(walletId);
    if (paymentMethods.length === 0) {
      throw new Error('أضف معرّف تكامل بطاقة أو محفظة واحداً على الأقل في إعدادات Paymob');
    }
  }

  Logger.info(`[Paymob] Creating payment intention for order #${order.orderNumber} (${order.total} EGP)`, {
    environment: config.environment,
    payment_method: methodType,
    integration_id: paymentMethods[0]
  });
  const intentionPayload = {
    amount: amountCents,
    currency: 'EGP',
    items: [{
      name: `طلب سوق وه ${order.orderNumber}`.slice(0, 50),
      amount: amountCents,
      description: `طلب يشمل ${order.items.length} منتجاً ورسوم الشحن والخصم إن وجدت`,
      quantity: 1
    }],
    payment_methods: paymentMethods,
    billing_data: billingData,
    customer: {
      first_name: firstName,
      last_name: lastName,
      email: order.buyerEmail || 'customer@wah-saeed.com',
      phone_number: order.buyerPhone || '01000000000'
    },
    special_reference: order.orderNumber,
    notification_url: `${origin}/api/payments/paymob/webhook`,
    redirection_url: `${origin}/api/payments/paymob/processed?orderId=${encodeURIComponent(order.id)}`
  };

  let response: Response;
  let responseData: any;
  try {
    response = await fetch('https://accept.paymob.com/v1/intention/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${config.secretKey}`
      },
      body: JSON.stringify(intentionPayload)
    });
    const responseText = await response.text();
    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch {
      responseData = null;
    }
  } catch (error) {
    Logger.error('[Paymob] Failed to contact Paymob Intention API:', error);
    throw new Error('تعذر الاتصال ببوابة Paymob. حاول مرة أخرى بعد قليل.');
  }

  if (!response.ok || typeof responseData?.client_secret !== 'string' || !responseData.client_secret) {
    const errorSummary = sanitizePaymobErrorSummary(getPaymobErrorSummary(responseData), config);
    const normalizedError = errorSummary?.toLowerCase() || '';
    const isUnknownIntegration =
      normalizedError.includes('integration') &&
      (normalizedError.includes('does not exist') || normalizedError.includes('not found'));
    const errorCode = responseData && typeof responseData === 'object'
      ? (responseData as Record<string, unknown>).error_code ??
        (responseData as Record<string, unknown>).code
      : undefined;
    Logger.error('[Paymob] Intention API rejected payment request', {
      status: response.status,
      environment: config.environment,
      payment_method: methodType,
      integration_id: paymentMethods[0],
      code: typeof errorCode === 'string' || typeof errorCode === 'number' ? errorCode : undefined,
      reason: isUnknownIntegration ? 'integration_not_found' : undefined,
      message: isUnknownIntegration ? undefined : errorSummary
    });
    if (isUnknownIntegration) {
      throw new Error(
        `رفض Paymob معرّف تكامل ${methodType === 'wallet' ? 'المحفظة' : 'البطاقة'} في بيئة ${config.environment.toUpperCase()} (HTTP ${response.status}): ${errorSummary || 'Integration ID/Name does not exist'}. تحقق أن المعرّف تابع لنفس حساب وبيئة PAYMOB_SECRET_KEY، ومفعّل كتكامل أونلاين لطريقة الدفع المطلوبة. نوع UIG أو قناة online_new وحدهما لا يثبتان تفعيل المحافظ؛ راجع لوحة Paymob أو الدعم الفني.`
      );
    }
    throw new Error(
      `رفضت بوابة Paymob بدء الدفع (HTTP ${response.status})${errorSummary ? `: ${errorSummary}` : '. راجع سجل الخادم لمعرفة التفاصيل.'}`
    );
  }

  const checkoutUrl = new URL('https://accept.paymob.com/unifiedcheckout/');
  checkoutUrl.searchParams.set('publicKey', config.publicKey);
  checkoutUrl.searchParams.set('clientSecret', responseData.client_secret);

  return {
    paymentUrl: checkoutUrl.toString(),
    clientSecret: responseData.client_secret,
    provider: 'paymob',
    paymentMethod: methodType,
    orderId: order.id,
    orderNumber: order.orderNumber,
    amount: order.total
  };
}

/**
 * Verify Paymob HMAC SHA512 signature for webhooks
 */
export function verifyPaymobHmac(queryOrBody: any, receivedHmac?: string): boolean {
  const config = getPaymobConfig();
  if (!config.hmacSecret) return false;

  const hmac = receivedHmac || queryOrBody?.hmac;
  if (typeof hmac !== 'string' || !/^[a-f\d]{128}$/i.test(hmac)) return false;

  const obj = queryOrBody?.obj || queryOrBody;

  // Paymob specific HMAC ordered fields
  const fields = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.is_voided,
    obj.order?.id || obj['order.id'],
    obj.owner,
    obj.pending,
    obj.source_data?.pan || obj['source_data.pan'],
    obj.source_data?.sub_type || obj['source_data.sub_type'],
    obj.source_data?.type || obj['source_data.type'],
    obj.success
  ];

  const concatenated = fields.map((v) => (v === undefined || v === null ? '' : String(v))).join('');
  const calculatedHmac = crypto
    .createHmac('sha512', config.hmacSecret)
    .update(concatenated)
    .digest('hex');

  const received = Buffer.from(hmac, 'hex');
  const calculated = Buffer.from(calculatedHmac, 'hex');
  return received.length === calculated.length && crypto.timingSafeEqual(received, calculated);
}

/**
 * Mark order as paid upon successful Paymob callback
 */
export async function markOrderPaidByPaymob(
  orderIdentifier: string,
  transactionDetails: {
    transactionId?: string | number;
    paymentMethod?: string;
    integrationId?: string | number;
    paidAmount?: number;
    rawPayload?: any;
  }
): Promise<{ success: boolean; order?: OrderDocument; error?: string }> {
  const { db, isMongo } = await getDatabase();
  const nowIso = new Date().toISOString();

  // Find order by id or orderNumber
  let order: OrderDocument | null = null;
  if (isMongo && db) {
    try {
      order = (await db.collection('orders').findOne({
        $or: [
          { id: orderIdentifier },
          { orderNumber: orderIdentifier }
        ]
      })) as unknown as OrderDocument | null;
    } catch (e) {
      Logger.error('[Paymob] Mongo find order error:', e);
    }
  }

  if (!order) {
    order = memoryDb.orders.find(
      (o) => o.id === orderIdentifier || o.orderNumber === orderIdentifier
    ) || null;
  }

  if (!order) {
    return { success: false, error: 'الطلب غير موجود في النظام' };
  }

  if (!['paymob', 'paymob_card', 'paymob_wallet'].includes(order.paymentMethod)) {
    return { success: false, error: 'طريقة الدفع لهذا الطلب ليست Paymob' };
  }

  if (
    !transactionDetails.transactionId ||
    !Number.isFinite(transactionDetails.paidAmount) ||
    Math.round((transactionDetails.paidAmount as number) * 100) !== Math.round(order.total * 100)
  ) {
    return { success: false, error: 'مبلغ الدفع أو رقم المعاملة غير صحيح' };
  }

  if (transactionDetails.integrationId !== undefined) {
    const config = getPaymobConfig();
    const integrationId = String(transactionDetails.integrationId);
    const expectedIntegrationIds =
      order.paymentMethod === 'paymob_wallet'
        ? [config.walletIntegrationId]
        : order.paymentMethod === 'paymob_card'
          ? [config.cardIntegrationId]
          : [config.cardIntegrationId, config.walletIntegrationId];
    if (
      !expectedIntegrationIds.some(
        (expectedId) => expectedId && Number.isSafeInteger(Number(expectedId)) && Number(expectedId) === Number(integrationId)
      )
    ) {
      return { success: false, error: 'معرّف تكامل Paymob لا يطابق طريقة دفع الطلب' };
    }
  }

  if (order.paymentStatus === 'paid') {
    return { success: true, order };
  }

  const txId = String(transactionDetails.transactionId);
  const methodLabel = transactionDetails.paymentMethod === 'wallet'
    ? 'محفظة إلكترونية (Paymob)'
    : 'بطاقة بنكية (Paymob)';

  // Update in Mongo
  if (isMongo && db) {
    try {
      const result = await db.collection('orders').updateOne(
        { id: order.id, paymentStatus: { $ne: 'paid' } },
        {
          $set: {
            paymentStatus: 'paid',
            status: order.status === 'pending' ? 'processing' : order.status,
            paymentReference: txId,
            updatedAt: nowIso
          },
          $push: {
            timeline: {
              status: 'processing',
              title: 'تم تأكيد الدفع الإلكتروني بنجاح',
              time: 'الآن',
              description: `تم سداد قيمة الطلب (${order.total} ج.م) عبر بوابة Paymob الإلكترونية. رقم المعاملة: ${txId}`,
              done: true
            } as any
          }
        }
      );
      if (result.matchedCount === 0) {
        const latestOrder = (await db.collection('orders').findOne({ id: order.id })) as unknown as OrderDocument | null;
        if (latestOrder?.paymentStatus === 'paid') return { success: true, order: latestOrder };
        return { success: false, error: 'تعذر تحديث حالة دفع الطلب' };
      }
    } catch (e) {
      Logger.error('[Paymob] Mongo update order error:', e);
      throw e;
    }
  }

  // Update in Memory DB
  order.paymentStatus = 'paid';
  if (order.status === 'pending') {
    order.status = 'processing';
  }
  order.paymentReference = txId;
  order.updatedAt = nowIso;
  order.timeline = order.timeline || [];
  order.timeline.push({
    status: 'processing',
    title: 'تم تأكيد الدفع الإلكتروني بنجاح',
    description: `تم سداد قيمة الطلب (${order.total} ج.م) عبر بوابة Paymob (${methodLabel}). رقم المعاملة: ${txId}`,
    time: 'الآن',
    done: true
  });

  // Notify buyer and sellers
  try {
    await createNotification({
      userId: order.buyerId,
      recipientId: order.buyerId,
      title: `تم تأكيد سداد طلبك #${order.orderNumber}`,
      message: `تم استلام دفعتك بقيمة ${order.total} ج.م بنجاح عبر Paymob. جاري تجهيز منتجاتك بالورشة.`,
      type: 'order_status',
      link: 'orders',
      recipientRole: 'buyer',
      metadata: { orderId: order.id, orderNumber: order.orderNumber }
    });
  } catch (notifErr) {
    Logger.warn('[Paymob] Failed to create buyer notification:', notifErr);
  }

  Logger.info(`[Paymob] Order #${order.orderNumber} successfully marked as PAID (Tx: ${txId})`);

  return { success: true, order };
}

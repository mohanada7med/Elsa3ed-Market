import crypto from 'crypto';
import type { OrderDocument } from '../models/types.ts';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { Logger } from '../utils/logger.ts';
import { createNotification } from './notificationService.ts';

export interface PaymobConfig {
  apiKey?: string;
  secretKey?: string;
  publicKey?: string;
  cardIntegrationId?: string;
  walletIntegrationId?: string;
  iframeId?: string;
  hmacSecret?: string;
  environment: 'live' | 'test';
}

export function getPaymobConfig(): PaymobConfig {
  return {
    apiKey: process.env.PAYMOB_API_KEY?.trim(),
    secretKey: (process.env.PAYMOB_SECRET_KEY || process.env.PAYMOB_API_KEY)?.trim(),
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
    environment: (process.env.PAYMOB_ENVIRONMENT === 'live' ? 'live' : 'test') as 'live' | 'test'
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

/**
 * Initiates an online payment with Paymob.
 * Supports both modern Paymob Unified Intention API and fallback simulation if keys are pending.
 */
export async function initiatePaymobPayment(
  order: OrderDocument,
  methodType: 'card' | 'wallet' | 'all' = 'all',
  requestOrigin?: string
): Promise<InitiatePaymentResult> {
  const config = getPaymobConfig();
  const origin = requestOrigin || process.env.APP_URL || 'http://localhost:3000';
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

  // Determine integration IDs (must be valid positive numeric IDs for Paymob)
  const parseIntegrationId = (val?: string): number | null => {
    if (!val) return null;
    const clean = val.trim();
    if (/^\d+$/.test(clean)) {
      const num = parseInt(clean, 10);
      return num > 0 ? num : null;
    }
    return null;
  };

  const cardId = parseIntegrationId(config.cardIntegrationId);
  const walletId = parseIntegrationId(config.walletIntegrationId);

  const paymentMethods: number[] = [];
  if (methodType === 'card' && cardId) {
    paymentMethods.push(cardId);
  } else if (methodType === 'wallet' && walletId) {
    paymentMethods.push(walletId);
  } else {
    if (cardId) paymentMethods.push(cardId);
    if (walletId) paymentMethods.push(walletId);
  }

  // 1. If live or test Secret Key is provided, use Paymob Unified Checkout (Intention API)
  if (config.secretKey) {
    try {
      Logger.info(`[Paymob] Creating payment intention for order #${order.orderNumber} (${order.total} EGP)`);

      const intentionPayload: any = {
        amount: amountCents,
        currency: 'EGP',
        items: order.items.map((item) => ({
          name: (item.productTitle || (item as any).title || 'منتج صعيدي').slice(0, 50),
          amount: Math.round((item.unitPrice || (item as any).price || 0) * 100),
          description: `${item.sellerName || 'حرفي صعيدي'} - كمية ${item.quantity}`,
          quantity: item.quantity
        })),
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

      if (paymentMethods.length > 0) {
        intentionPayload.payment_methods = paymentMethods;
      }

      let response = await fetch('https://accept.paymob.com/v1/intention/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${config.secretKey}`
        },
        body: JSON.stringify(intentionPayload)
      });

      let responseData = (await response.json()) as any;

      // If specific integration ID was rejected by Paymob ("does not exist in our system"), retry without payment_methods filter
      if (!response.ok && intentionPayload.payment_methods) {
        const errorDetail = JSON.stringify(responseData || '');
        if (errorDetail.includes('Integration ID') || errorDetail.includes('does not exist') || response.status === 400) {
          Logger.warn('[Paymob] Integration ID was not found in merchant account, retrying without payment_methods restriction...');
          delete intentionPayload.payment_methods;

          response = await fetch('https://accept.paymob.com/v1/intention/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Token ${config.secretKey}`
            },
            body: JSON.stringify(intentionPayload)
          });
          responseData = (await response.json()) as any;
        }
      }

      if (response.ok && responseData?.client_secret) {
        const clientSecret = responseData.client_secret;
        const publicKey = config.publicKey || '';
        const paymentUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${clientSecret}`;

        // Save paymentUrl to order
        await updateOrderPaymentUrl(order.id, paymentUrl, clientSecret);

        return {
          paymentUrl,
          clientSecret,
          provider: 'paymob',
          paymentMethod: methodType,
          orderId: order.id,
          orderNumber: order.orderNumber,
          amount: order.total
        };
      } else {
        Logger.warn('[Paymob] Intention API error or missing client_secret, falling back to simulator:', responseData);
      }
    } catch (apiError: any) {
      Logger.error('[Paymob] Failed to contact Paymob Intention API, falling back to simulator:', apiError?.message || apiError);
    }
  }

  // 2. Simulated/Sandbox Fallback
  // When Paymob credentials are not yet configured in `.env`, provide an in-app interactive simulator
  // so the payment flow works seamlessly in development and preview without breaking.
  const simulatedPaymentUrl = `${origin}/api/payments/paymob/simulator?orderId=${encodeURIComponent(order.id)}&orderNumber=${encodeURIComponent(order.orderNumber)}&amount=${encodeURIComponent(order.total)}&method=${encodeURIComponent(methodType)}`;

  await updateOrderPaymentUrl(order.id, simulatedPaymentUrl, 'simulated');

  return {
    paymentUrl: simulatedPaymentUrl,
    provider: 'paymob_simulated',
    paymentMethod: methodType,
    orderId: order.id,
    orderNumber: order.orderNumber,
    amount: order.total,
    message: 'تم تفعيل بوابة الدفع. لربط حساب Paymob الفعلي، ضع PAYMOB_SECRET_KEY و PAYMOB_PUBLIC_KEY في ملف .env'
  };
}

/**
 * Verify Paymob HMAC SHA512 signature for webhooks
 */
export function verifyPaymobHmac(queryOrBody: any, receivedHmac?: string): boolean {
  const config = getPaymobConfig();
  if (!config.hmacSecret) {
    // If HMAC secret is not configured, accept in test mode
    return config.environment === 'test';
  }

  const hmac = receivedHmac || queryOrBody?.hmac;
  if (!hmac) return false;

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

  return calculatedHmac.toLowerCase() === hmac.toLowerCase();
}

/**
 * Mark order as paid upon successful Paymob callback
 */
export async function markOrderPaidByPaymob(
  orderIdentifier: string,
  transactionDetails: {
    transactionId?: string | number;
    paymentMethod?: string;
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

  if (order.paymentStatus === 'paid') {
    return { success: true, order };
  }

  const txId = transactionDetails.transactionId ? String(transactionDetails.transactionId) : `TXN-${Date.now()}`;
  const methodLabel = transactionDetails.paymentMethod === 'wallet'
    ? 'محفظة إلكترونية (Paymob)'
    : 'بطاقة بنكية (Paymob)';

  // Update in Mongo
  if (isMongo && db) {
    try {
      await db.collection('orders').updateOne(
        { id: order.id },
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
              label: 'تم تأكيد الدفع الإلكتروني بنجاح',
              timestamp: nowIso,
              description: `تم سداد قيمة الطلب (${order.total} ج.م) عبر بوابة Paymob الإلكترونية. رقم المعاملة: ${txId}`
            } as any
          }
        }
      );
    } catch (e) {
      Logger.error('[Paymob] Mongo update order error:', e);
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

/**
 * Helper to update order paymentUrl in database
 */
async function updateOrderPaymentUrl(orderId: string, paymentUrl: string, clientSecret?: string): Promise<void> {
  const { db, isMongo } = await getDatabase();
  const updateData: any = { paymentUrl };
  if (clientSecret) updateData.paymentReference = clientSecret;

  if (isMongo && db) {
    try {
      await db.collection('orders').updateOne({ id: orderId }, { $set: updateData });
    } catch (e) {
      Logger.error('[Paymob] Update order paymentUrl error:', e);
    }
  }

  const memOrder = memoryDb.orders.find((o) => o.id === orderId);
  if (memOrder) {
    memOrder.paymentUrl = paymentUrl;
    if (clientSecret) memOrder.paymentReference = clientSecret;
  }
}

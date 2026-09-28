import crypto from 'crypto';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { OrderDocument } from '../models/types.ts';
import { getPaymentConfig } from './paymentConfigService.ts';
import { createNotification } from './notificationService.ts';
import { addAuditLog } from './auditService.ts';
import { Logger } from '../utils/logger.ts';

export interface InitiatePaymentResult {
  success: boolean;
  invoiceUrl: string;
  invoiceId?: number | string;
  invoiceKey?: string;
  isMock?: boolean;
  message?: string;
}

/**
 * Initiates an electronic payment invoice link via Fawaterak (فاتورتك)
 */
export async function initiateFawaterakInvoice(
  order: OrderDocument,
  originUrl?: string
): Promise<InitiatePaymentResult> {
  const config = await getPaymentConfig();
  const apiKey = (config.fawaterakApiKey || process.env.FAWATERAK_API_KEY || '').trim();
  const isLive = config.fawaterakEnv === 'live';
  const baseUrl = isLive
    ? 'https://app.fawaterk.com/api/v2'
    : 'https://staging.fawaterk.com/api/v2';

  const frontendBase = originUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Customer Name splitting
  const nameParts = (order.buyerName || 'عميل سوق وه').trim().split(' ');
  const firstName = nameParts[0] || 'عميل';
  const lastName = nameParts.slice(1).join(' ') || 'وه';

  // Cart items formatting for Fawaterak
  const cartItems = (order.items || []).map((it) => ({
    name: it.productTitle || 'منتج تراثي',
    price: Number(it.unitPrice) || 0,
    quantity: Number(it.quantity) || 1
  }));

  // Add shipping as a cart item if applicable
  if (order.shippingFee && order.shippingFee > 0) {
    cartItems.push({
      name: 'رسوم الشحن والتوصيل',
      price: Number(order.shippingFee),
      quantity: 1
    });
  }

  // Fallback / Mock mode if API key not yet configured in admin settings
  if (!apiKey) {
    Logger.warn('[Fawaterak] API Key not configured in Admin Settings. Using simulated sandbox link.');

    const mockInvoiceKey = `SIM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const mockInvoiceUrl = `${frontendBase}/?page=orders&payment_status=success&orderId=${order.id}&simulated=true`;

    await updateOrderWithFawaterakInfo(order.id, {
      paymentReference: mockInvoiceKey,
      paymentUrl: mockInvoiceUrl
    });

    return {
      success: true,
      invoiceUrl: mockInvoiceUrl,
      invoiceId: 'simulated',
      invoiceKey: mockInvoiceKey,
      isMock: true,
      message: 'تم إنشاء رابط محاكاة للدفع الإلكتروني بنجاح (يرجى إدخال مفتاح API في لوحة التحكم للربط الحي).'
    };
  }

  const payload = {
    cartTotal: Number(order.total).toFixed(2),
    currency: 'EGP',
    customer: {
      first_name: firstName,
      last_name: lastName,
      email: order.buyerEmail || 'customer@elsa3ed.com',
      phone: order.buyerPhone || '01000000000',
      address: `${order.shippingAddress?.governorate || 'مصر'} - ${order.shippingAddress?.city || ''} - ${order.shippingAddress?.streetAddress || ''}`
    },
    redirectionUrls: {
      successUrl: `${frontendBase}/?page=orders&payment_status=success&orderId=${order.id}`,
      failUrl: `${frontendBase}/?page=orders&payment_status=failed&orderId=${order.id}`,
      pendingUrl: `${frontendBase}/?page=orders&payment_status=pending&orderId=${order.id}`
    },
    cartItems
  };

  try {
    const response = await fetch(`${baseUrl}/createInvoiceLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const resJson = await response.json().catch(() => null);

    if (!response.ok || !resJson || resJson.status !== 'success') {
      const errMsg =
        resJson?.message ||
        resJson?.error ||
        (resJson?.data && JSON.stringify(resJson.data)) ||
        `خطأ من خادم فاتورتك (${response.status})`;

      Logger.error('[Fawaterak] Invoice creation error:', errMsg);
      throw new Error(`تعذر إنشاء فاتورة الدفع من فاتورتك: ${errMsg}`);
    }

    const invoiceData = resJson.data || {};
    const invoiceUrl = invoiceData.url || invoiceData.invoice_url;
    const invoiceId = invoiceData.invoice_id;
    const invoiceKey = invoiceData.invoice_key;

    if (!invoiceUrl) {
      throw new Error('لم يرجع خادم فاتورتك رابط الدفع المطلوب.');
    }

    await updateOrderWithFawaterakInfo(order.id, {
      paymentReference: String(invoiceKey || invoiceId || order.orderNumber),
      paymentUrl: invoiceUrl
    });

    return {
      success: true,
      invoiceUrl,
      invoiceId,
      invoiceKey
    };
  } catch (error: any) {
    Logger.error('[Fawaterak] Request failed:', error);
    throw new Error(error.message || 'فشل الاتصال ببوابة دفع فاتورتك');
  }
}

/**
 * Handle incoming Fawaterak Webhook for payment status updates
 */
export async function handleFawaterakWebhook(body: any): Promise<{ success: boolean; message: string }> {
  Logger.info('[Fawaterak Webhook] Received payload:', body);

  if (!body) {
    return { success: false, message: 'حمولة الـ Webhook فارغة' };
  }

  const {
    invoice_id,
    invoice_key,
    invoice_status,
    payment_method,
    referenceNumber,
    hashKey
  } = body;

  const config = await getPaymentConfig();
  const vendorKey = (config.fawaterakVendorKey || process.env.FAWATERAK_VENDOR_KEY || '').trim();

  // Validate HMAC SHA256 HashKey if vendor key is configured
  if (vendorKey && hashKey && invoice_id && invoice_key) {
    const rawData = `InvoiceId=${invoice_id}&InvoiceKey=${invoice_key}&PaymentMethod=${payment_method || ''}`;
    const calculatedHash = crypto.createHmac('sha256', vendorKey).update(rawData).digest('hex');

    if (calculatedHash.toLowerCase() !== String(hashKey).toLowerCase()) {
      Logger.warn('[Fawaterak Webhook] Hash validation mismatch:', { calculatedHash, received: hashKey });
      return { success: false, message: 'فشل التحقق الأمني من توقيع HashKey' };
    }
  }

  const { db, isMongo } = await getDatabase();

  // Find order by invoice_key, invoice_id, or referenceNumber
  let order: OrderDocument | null = null;
  const searchQueries: any[] = [];
  if (invoice_key) searchQueries.push({ paymentReference: String(invoice_key) });
  if (invoice_id) searchQueries.push({ paymentReference: String(invoice_id) });
  if (referenceNumber) searchQueries.push({ paymentReference: String(referenceNumber) });

  if (isMongo && db && searchQueries.length > 0) {
    try {
      order = (await db.collection('orders').findOne({ $or: searchQueries })) as unknown as OrderDocument | null;
    } catch (e) {
      Logger.error('[Fawaterak Webhook] Mongo find order error:', e);
    }
  }

  if (!order && searchQueries.length > 0) {
    order = memoryDb.orders.find((o) =>
      o.paymentReference === String(invoice_key) ||
      o.paymentReference === String(invoice_id) ||
      o.paymentReference === String(referenceNumber)
    ) || null;
  }

  if (!order) {
    Logger.warn('[Fawaterak Webhook] No matching order found for reference:', { invoice_key, invoice_id, referenceNumber });
    return { success: true, message: 'تم استلام الـ Webhook ولكن لم يتم العثور على طلب مطابق' };
  }

  const normalizedStatus = String(invoice_status || '').toLowerCase();

  if (normalizedStatus === 'paid') {
    const nowIso = new Date().toISOString();
    const updatedTimeline = [
      ...(order.timeline || []),
      {
        status: order.status,
        title: 'تم السداد الإلكتروني بنجاح',
        description: `تم سداد كامل قيمة الطلب (${order.total} ج.م) عبر بوابة فاتورتك (${payment_method || 'دفع إلكتروني'}).`,
        time: 'الآن',
        done: true
      }
    ];

    if (isMongo && db) {
      try {
        await db.collection('orders').updateOne(
          { id: order.id },
          {
            $set: {
              paymentStatus: 'paid',
              updatedAt: nowIso,
              timeline: updatedTimeline
            }
          }
        );
      } catch (e) {
        Logger.error('[Fawaterak Webhook] Failed to update Mongo order:', e);
      }
    }

    const memIdx = memoryDb.orders.findIndex((o) => o.id === order.id);
    if (memIdx >= 0) {
      memoryDb.orders[memIdx] = {
        ...memoryDb.orders[memIdx],
        paymentStatus: 'paid',
        updatedAt: nowIso,
        timeline: updatedTimeline
      };
    }

    // Send buyer notification
    await createNotification({
      userId: order.buyerId,
      recipientId: order.buyerId,
      title: 'تم الدفع الإلكتروني بنجاح 🎉',
      message: `تم تأكيد سداد طلبك #${order.orderNumber} بنجاح عبر فاتورتك (${order.total.toLocaleString('ar-EG')} ج.م). جاري تجهيز القطع من ورش الصعيد.`,
      type: 'payment_status',
      link: 'buyer-orders',
      recipientRole: 'buyer',
      metadata: { orderId: order.id, orderNumber: order.orderNumber, paymentStatus: 'paid' }
    });

    // Add audit log
    await addAuditLog({
      userName: 'بوابة دفع فاتورتك (Fawaterak)',
      userRole: 'admin',
      action: 'تأكيد السداد التلقائي عبر Webhook',
      resource: 'الطلبات',
      resourceId: order.id,
      status: 'نجاح',
      details: `تم تأكيد دفع الطلب #${order.orderNumber} بقيمة ${order.total} ج.م عبر فاتورتك (رقم العملية: ${referenceNumber || invoice_id || 'غير متوفر'}).`
    });

    Logger.info(`[Fawaterak Webhook] Order #${order.orderNumber} marked as PAID.`);
    return { success: true, message: 'تم تحديث حالة الطلب إلى مدفوع بنجاح' };
  }

  return { success: true, message: `تم استلام الـ Webhook بحالة ${invoice_status}` };
}

/**
 * Helper to update order reference & payment URL in Mongo & Memory
 */
async function updateOrderWithFawaterakInfo(
  orderId: string,
  updates: { paymentReference?: string; paymentUrl?: string }
): Promise<void> {
  const { db, isMongo } = await getDatabase();
  const nowIso = new Date().toISOString();

  if (isMongo && db) {
    try {
      await db.collection('orders').updateOne(
        { id: orderId },
        {
          $set: {
            ...updates,
            updatedAt: nowIso
          }
        }
      );
    } catch (e) {
      Logger.error('[Fawaterak] Failed to update order in Mongo:', e);
    }
  }

  const memIdx = memoryDb.orders.findIndex((o) => o.id === orderId);
  if (memIdx >= 0) {
    memoryDb.orders[memIdx] = {
      ...memoryDb.orders[memIdx],
      ...updates,
      updatedAt: nowIso
    };
  }
}

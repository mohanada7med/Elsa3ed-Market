import express from 'express';
import type { Request, Response } from 'express';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { OrderDocument } from '../models/types.ts';
import {
  initiatePaymobPayment,
  verifyPaymobHmac,
  markOrderPaidByPaymob,
  getPaymobConfig
} from '../services/paymobService.ts';
import { Logger } from '../utils/logger.ts';

const router = express.Router();

/**
 * GET /api/payments/status/:orderId
 * Get current payment status of an order
 */
router.get('/status/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { db, isMongo } = await getDatabase();
    let order: OrderDocument | null = null;

    if (isMongo && db) {
      try {
        order = (await db.collection('orders').findOne({ id: orderId })) as unknown as OrderDocument | null;
      } catch (e) {
        console.error('[PaymentRoutes] Status check Mongo error:', e);
      }
    }

    if (!order) {
      order = memoryDb.orders.find((o) => o.id === orderId) || null;
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'الطلب غير موجود',
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        paymentUrl: order.paymentUrl,
        paymentReference: order.paymentReference,
        total: order.total
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || 'فشل في الاستعلام عن حالة الدفع'
    });
  }
});

/**
 * POST /api/payments/paymob/initiate
 * Initiate Paymob online payment for an order
 */
router.post('/paymob/initiate', async (req: Request, res: Response) => {
  try {
    const { orderId, methodType = 'all' } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'رقم تعريف الطلب مطلوب'
      });
    }

    const { db, isMongo } = await getDatabase();
    let order: OrderDocument | null = null;

    if (isMongo && db) {
      try {
        order = (await db.collection('orders').findOne({ id: orderId })) as unknown as OrderDocument | null;
      } catch (e) {
        Logger.error('[PaymentRoutes] Find order Mongo error:', e);
      }
    }

    if (!order) {
      order = memoryDb.orders.find((o) => o.id === orderId) || null;
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'الطلب المطلوب غير موجود'
      });
    }

    // Determine request host for redirection
    const proto = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const requestOrigin = `${proto}://${host}`;

    const result = await initiatePaymobPayment(
      order,
      methodType as 'card' | 'wallet' | 'all',
      requestOrigin
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    Logger.error('[PaymentRoutes] Paymob initiate error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'تعذر بدء عملية الدفع عبر Paymob'
    });
  }
});

/**
 * POST /api/payments/paymob/webhook
 * Paymob server-to-server transaction webhook callback
 */
router.post('/paymob/webhook', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    Logger.info('[Paymob Webhook] Received notification payload');

    const obj = payload?.obj || payload;
    const isSuccess = Boolean(obj?.success === true || obj?.success === 'true');
    const orderRef = obj?.order?.merchant_order_id || obj?.special_reference || obj?.merchant_order_id;
    const transactionId = obj?.id;
    const paidAmount = obj?.amount_cents ? obj.amount_cents / 100 : undefined;
    const methodType = obj?.source_data?.type || 'card';

    // Verify HMAC if configured
    const hmacHeader = (req.headers['x-paymob-hmac'] || req.query.hmac) as string | undefined;
    const isHmacValid = verifyPaymobHmac(payload, hmacHeader);

    if (!isHmacValid) {
      Logger.warn('[Paymob Webhook] HMAC validation mismatch or missing signature');
    }

    if (isSuccess && orderRef) {
      await markOrderPaidByPaymob(orderRef, {
        transactionId,
        paymentMethod: methodType,
        paidAmount,
        rawPayload: obj
      });
    }

    // Paymob expects 200 OK
    res.status(200).json({ success: true, received: true });
  } catch (error: any) {
    Logger.error('[Paymob Webhook] Processing error:', error);
    res.status(500).json({ success: false, error: error?.message });
  }
});

/**
 * GET /api/payments/paymob/processed
 * Customer redirection URL from Paymob after transaction
 */
router.get('/paymob/processed', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.query;
    const isSuccess = String(req.query.success).toLowerCase() === 'true';
    const txnId = req.query.id || req.query.txn_response_code;

    if (orderId && isSuccess) {
      await markOrderPaidByPaymob(String(orderId), {
        transactionId: txnId ? String(txnId) : undefined
      });
    }

    const redirectPath = isSuccess
      ? `/orders?orderId=${encodeURIComponent(String(orderId || ''))}&payment=success`
      : `/orders?orderId=${encodeURIComponent(String(orderId || ''))}&payment=failed`;

    res.redirect(302, redirectPath);
  } catch (error: any) {
    Logger.error('[Paymob Redirection] Error:', error);
    res.redirect(302, '/orders?payment=error');
  }
});

/**
 * GET /api/payments/paymob/simulator
 * Interactive test simulator when Paymob test credentials are being configured
 */
router.get('/paymob/simulator', (req: Request, res: Response) => {
  const { orderId, orderNumber, amount, method } = req.query;
  const config = getPaymobConfig();

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>بوابة الدفع الإلكتروني Paymob - سوق وه</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #FFF9EE;
      color: #3B1E0E;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 16px;
    }
    .card {
      background: #FFFFFF;
      border: 2px solid #C99444;
      border-radius: 24px;
      max-width: 480px;
      width: 100%;
      padding: 32px 24px;
      box-shadow: 0 20px 40px rgba(59, 30, 14, 0.12);
      text-align: center;
    }
    .badge {
      display: inline-block;
      background: rgba(201, 148, 68, 0.15);
      color: #6B3A1F;
      font-weight: 800;
      font-size: 11px;
      padding: 6px 14px;
      border-radius: 999px;
      margin-bottom: 16px;
    }
    .title {
      font-size: 22px;
      font-weight: 900;
      margin-bottom: 8px;
    }
    .desc {
      font-size: 13px;
      color: #7D664F;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .order-box {
      background: #FFF9EE;
      border: 1px dashed #C99444;
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 24px;
      text-align: right;
      font-size: 13px;
    }
    .order-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .order-row:last-child {
      margin-bottom: 0;
      font-weight: 900;
      font-size: 16px;
      color: #E66A2E;
      border-top: 1px solid rgba(201, 148, 68, 0.3);
      padding-top: 8px;
    }
    .btn {
      display: block;
      width: 100%;
      padding: 14px;
      border-radius: 14px;
      font-weight: 800;
      font-size: 14px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
      border: none;
      margin-bottom: 10px;
    }
    .btn-success {
      background: #2E7D32;
      color: #FFFFFF;
    }
    .btn-success:hover {
      background: #1B5E20;
    }
    .btn-cancel {
      background: transparent;
      color: #7D664F;
      border: 1px solid #E0C79B;
    }
    .btn-cancel:hover {
      background: #F8EBD7;
    }
    .note {
      font-size: 11px;
      color: #999;
      margin-top: 16px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">بيئة اختبار وتجربة Paymob Sandbox</div>
    <div class="title">سوق صعيد مصر • بوابة Paymob</div>
    <p class="desc">
      هذه نافذة محاكاة لتجربة الدفع الإلكتروني عبر بوابة Paymob (بطاقات بنكية ومحافظ ذكية).
    </p>

    <div class="order-box">
      <div class="order-row">
        <span>رقم الطلب:</span>
        <span>${orderNumber || 'SAED-123'}</span>
      </div>
      <div class="order-row">
        <span>طريقة الدفع:</span>
        <span>${method === 'wallet' ? 'محفظة إلكترونية (فودافون كاش)' : 'بطاقة بنكية (Visa / Mastercard / Meeza)'}</span>
      </div>
      <div class="order-row">
        <span>المبلغ الإجمالي:</span>
        <span>${amount || 0} ج.م</span>
      </div>
    </div>

    <form method="POST" action="/api/payments/paymob/simulate-success">
      <input type="hidden" name="orderId" value="${orderId || ''}">
      <input type="hidden" name="method" value="${method || 'card'}">
      <button type="submit" class="btn btn-success">
        ✓ تأكيد الدفع الإلكتروني بنجاح (محاكاة)
      </button>
    </form>

    <a href="/orders?orderId=${encodeURIComponent(String(orderId || ''))}&payment=cancelled" class="btn btn-cancel">
      إلغاء والعودة لمتجر وه
    </a>

    <div class="note">
      لربط حسابك الفعلي مع Paymob: أضف <code>PAYMOB_SECRET_KEY</code> و <code>PAYMOB_PUBLIC_KEY</code> و <code>PAYMOB_INTEGRATION_ID_CARD</code> في ملف <code>.env</code>.
    </div>
  </div>
</body>
</html>`);
});

/**
 * POST / GET /api/payments/paymob/simulate-success
 * Simulates a successful Paymob payment for local testing
 */
const handleSimulateSuccess = async (req: Request, res: Response) => {
  try {
    const orderId = req.body?.orderId || req.query?.orderId;
    const method = req.body?.method || req.query?.method;
    if (orderId) {
      await markOrderPaidByPaymob(String(orderId), {
        transactionId: `PAYMOB-SIM-${Math.floor(100000 + Math.random() * 900000)}`,
        paymentMethod: method || 'card'
      });
    }
    res.redirect(302, `/orders?orderId=${encodeURIComponent(String(orderId || ''))}&payment=success`);
  } catch (err: any) {
    res.redirect(302, '/orders?payment=error');
  }
};

router.post('/paymob/simulate-success', handleSimulateSuccess);
router.get('/paymob/simulate-success', handleSimulateSuccess);

export default router;

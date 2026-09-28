import express from 'express';
import type { Request, Response } from 'express';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { OrderDocument } from '../models/types.ts';
import { initiateFawaterakInvoice, handleFawaterakWebhook } from '../services/fawaterakService.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';

const router = express.Router();

/**
 * POST /api/payments/fawaterak/initiate
 * Initiate a Fawaterak invoice payment link for an order
 */
router.post('/fawaterak/initiate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'رقم الطلب (orderId) مطلوب لبدء عملية الدفع',
        code: 'VALIDATION_ERROR'
      });
    }

    const { db, isMongo } = await getDatabase();
    let order: OrderDocument | null = null;

    if (isMongo && db) {
      try {
        order = (await db.collection('orders').findOne({ id: orderId })) as unknown as OrderDocument | null;
      } catch (e) {
        console.error('[PaymentRoutes] Error finding order in Mongo:', e);
      }
    }

    if (!order) {
      order = memoryDb.orders.find((o) => o.id === orderId) || null;
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'الطلب غير موجود في النظام',
        code: 'ORDER_NOT_FOUND'
      });
    }

    // Determine host origin for redirection
    const origin =
      req.get('origin') ||
      req.get('referer') ||
      `${req.protocol}://${req.get('host')}`;

    const paymentResult = await initiateFawaterakInvoice(order, origin);

    res.json({
      success: true,
      data: paymentResult
    });
  } catch (error: any) {
    console.error('[PaymentRoutes] Fawaterak initiate error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'تعذر بدء الدفع عبر فاتورتك',
      code: 'FAWATERAK_INIT_FAILED'
    });
  }
});

/**
 * POST /api/payments/fawaterak/webhook & /fawaterak/webhook_json
 * Fawaterak webhook endpoint for automatic payment confirmations
 */
router.post(['/fawaterak/webhook', '/fawaterak/webhook_json'], async (req: Request, res: Response) => {
  try {
    const result = await handleFawaterakWebhook(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('[PaymentRoutes] Webhook processing error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'خطأ أثناء معالجة إشعار فاتورتك'
    });
  }
});

/**
 * GET /api/payments/fawaterak/status/:orderId
 * Get current payment status of an order
 */
router.get('/fawaterak/status/:orderId', async (req: Request, res: Response) => {
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

export default router;

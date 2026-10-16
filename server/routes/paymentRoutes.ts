import express from 'express';
import type { Request, Response } from 'express';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { OrderDocument } from '../models/types.ts';

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

export default router;

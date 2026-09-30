import express from 'express';
import type { Response } from 'express';
import { requireAdmin, requireAuth, type AuthenticatedRequest } from '../middleware/auth.ts';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { OrderDocument } from '../models/types.ts';
import {
  getShippingConfig,
  updateShippingConfig,
  getBostaPickupLocations,
  createBostaShipment,
  trackBostaShipment,
  handleBostaWebhook
} from '../services/bostaService.ts';

const router = express.Router();

/**
 * GET /api/shipping/config - Get platform shipping & Bosta settings (Admin only)
 */
router.get('/config', requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const config = await getShippingConfig();
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('[ShippingRoutes] Error getting shipping config:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'فشل في جلب إعدادات الشحن وبوسطة',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PUT /api/shipping/config - Update platform shipping & Bosta settings (Admin only)
 */
router.put('/config', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await updateShippingConfig(req.user!, req.body);
    res.json({
      success: true,
      message: 'تم تحديث إعدادات الشحن وربط بوسطة بنجاح',
      data: updated
    });
  } catch (error) {
    console.error('[ShippingRoutes] Error updating shipping config:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر تحديث إعدادات الشحن',
      code: 'UPDATE_ERROR'
    });
  }
});

/**
 * GET /api/shipping/bosta/pickup-locations - Fetch Bosta configured pickup addresses (Admin only)
 */
router.get('/bosta/pickup-locations', requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await getBostaPickupLocations();
    if (result.success) {
      return res.json({
        success: true,
        data: result.list
      });
    }

    return res.status(400).json({
      success: false,
      error: result.error || 'فشل جلب عناوين الاستلام من بوسطة',
      code: 'BOSTA_API_ERROR'
    });
  } catch (error) {
    console.error('[ShippingRoutes] Error fetching pickup locations:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'خطأ في الاتصال بشركة بوسطة',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/shipping/bosta/create-shipment/:orderId - Create a shipment for an order on Bosta (Admin or Seller)
 */
router.post('/bosta/create-shipment/:orderId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { notes, allowSimulationFallback } = req.body;
    const user = req.user!;

    const { db, isMongo } = await getDatabase();
    let order: OrderDocument | null = null;

    if (isMongo && db) {
      order = (await db.collection('orders').findOne({ id: orderId })) as unknown as OrderDocument | null;
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

    // Role check: Only admin or the seller of this order can initiate shipping
    const sellerId = user.sellerId || user.id;
    if (user.role !== 'admin' && !order.sellerIds?.includes(sellerId)) {
      return res.status(403).json({
        success: false,
        error: 'غير مصرح لك بإنشاء شحنة لهذا الطلب',
        code: 'FORBIDDEN'
      });
    }

    const result = await createBostaShipment(order, {
      notes,
      allowSimulationFallback: allowSimulationFallback !== false
    });

    res.json({
      success: true,
      message: result.message,
      data: {
        trackingNumber: result.trackingNumber,
        bostaDeliveryId: result.bostaDeliveryId,
        awbUrl: result.awbUrl,
        isSimulated: result.isSimulated,
        order: result.order
      }
    });
  } catch (error) {
    console.error('[ShippingRoutes] Error creating Bosta shipment:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر إصدار الشحنة عبر بوسطة',
      code: 'BOSTA_SHIPMENT_FAILED'
    });
  }
});

/**
 * GET /api/shipping/bosta/track/:trackingNumber - Real-time tracking of Bosta delivery
 */
router.get('/bosta/track/:trackingNumber', async (req: express.Request, res: Response) => {
  try {
    const { trackingNumber } = req.params;
    const result = await trackBostaShipment(trackingNumber);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[ShippingRoutes] Error tracking Bosta shipment:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'فشل جلب تفاصيل التتبع',
      code: 'TRACKING_ERROR'
    });
  }
});

/**
 * POST /api/shipping/bosta/webhook - Automated webhook endpoint for Bosta status updates
 */
router.post('/bosta/webhook', async (req: express.Request, res: Response) => {
  try {
    const result = await handleBostaWebhook(req.body);
    res.json(result);
  } catch (error) {
    console.error('[ShippingRoutes] Error handling Bosta webhook:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'خطأ في معالجة إشعار بوسطة'
    });
  }
});

export default router;

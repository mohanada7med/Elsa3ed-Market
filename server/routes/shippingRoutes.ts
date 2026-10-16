import express from 'express';
import type { Response } from 'express';
import { requireAdmin, requireAuth, requireSeller, type AuthenticatedRequest } from '../middleware/auth.ts';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { OrderDocument } from '../models/types.ts';
import {
  getShippingConfig,
  updateShippingConfig,
  getApprovedShippingCompanies,
  getAllShippingCompanies,
  createShippingCompany,
  updateShippingCompany,
  getSellerShipments,
  getSellerReadyOrders,
  createShipment,
  updateShipmentStatus,
  getAdminShipments
} from '../services/shippingService.ts';

const router = express.Router();

/**
 * GET /api/shipping/config - Get platform shipping rates & rules (Admin only)
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
      error: (error as Error).message || 'فشل في جلب إعدادات الشحن',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PUT /api/shipping/config - Update platform shipping rates & rules (Admin only)
 */
router.put('/config', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await updateShippingConfig(req.user!, req.body);
    res.json({
      success: true,
      message: 'تم تحديث إعدادات وأسعار الشحن بنجاح',
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

// =========================================================================
// APPROVED SHIPPING COMPANIES (ADMIN MANAGEMENT & SELLER VIEW)
// =========================================================================

/**
 * GET /api/shipping/companies - Active & approved shipping companies (Sellers & Public)
 * Never exposes API keys, vendor credentials or internal secrets.
 */
router.get('/companies', async (_req: express.Request, res: Response) => {
  try {
    const companies = await getApprovedShippingCompanies();
    res.json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error: any) {
    console.error('[ShippingRoutes] Error getting approved companies:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'فشل في جلب شركات الشحن المعتمدة',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/shipping/admin/companies - All companies including inactive (Admin only)
 */
router.get('/admin/companies', requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const companies = await getAllShippingCompanies();
    res.json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error: any) {
    console.error('[ShippingRoutes] Error getting all companies for admin:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'فشل في جلب قائمة شركات الشحن',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/shipping/admin/companies - Add new approved shipping company (Admin only)
 */
router.post('/admin/companies', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const created = await createShippingCompany(req.user!, req.body);
    res.status(201).json({
      success: true,
      message: `تم اعتماد شركة الشحن "${created.name}" بنجاح`,
      data: created
    });
  } catch (error: any) {
    console.error('[ShippingRoutes] Error creating shipping company:', error);
    res.status(400).json({
      success: false,
      error: error?.message || 'تعذر إضافة شركة الشحن',
      code: 'VALIDATION_ERROR'
    });
  }
});

/**
 * PUT /api/shipping/admin/companies/:id - Update shipping company (Admin only)
 */
router.put('/admin/companies/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await updateShippingCompany(req.user!, req.params.id, req.body);
    res.json({
      success: true,
      message: 'تم تحديث بيانات وحالة شركة الشحن بنجاح',
      data: updated
    });
  } catch (error: any) {
    console.error('[ShippingRoutes] Error updating shipping company:', error);
    res.status(400).json({
      success: false,
      error: error?.message || 'تعذر تحديث شركة الشحن',
      code: 'UPDATE_ERROR'
    });
  }
});

// =========================================================================
// ARTISAN SELLER SHIPMENT WORKFLOWS & MANAGEMENT
// =========================================================================

/**
 * GET /api/shipping/seller/shipments - Seller's shipments with statistics and filters
 */
router.get('/seller/shipments', requireSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.user!.sellerId || req.user!.id;
    const { search, status, companyId, paymentMethod, dateFrom, dateTo } = req.query;

    const result = await getSellerShipments(sellerId, {
      search: typeof search === 'string' ? search : undefined,
      status: (typeof status === 'string' ? status : undefined) as any,
      companyId: typeof companyId === 'string' ? companyId : undefined,
      paymentMethod: typeof paymentMethod === 'string' ? paymentMethod : undefined,
      dateFrom: typeof dateFrom === 'string' ? dateFrom : undefined,
      dateTo: typeof dateTo === 'string' ? dateTo : undefined
    });

    res.json({
      success: true,
      data: result.shipments,
      stats: result.stats
    });
  } catch (error: any) {
    console.error('[ShippingRoutes] Error getting seller shipments:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'فشل في جلب شحنات الورشة',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/shipping/seller/ready-orders - Orders ready for shipment booking
 */
router.get('/seller/ready-orders', requireSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.user!.sellerId || req.user!.id;
    const readyOrders = await getSellerReadyOrders(sellerId);
    res.json({
      success: true,
      count: readyOrders.length,
      data: readyOrders
    });
  } catch (error: any) {
    console.error('[ShippingRoutes] Error getting seller ready orders:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'فشل في جلب الطلبات الجاهزة للشحن',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/shipping/seller/shipments - Create/register a shipment for an order
 */
router.post('/seller/shipments', requireSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const shipment = await createShipment(req.user!, req.body);
    res.status(201).json({
      success: true,
      message: `تم تسجيل بوليصة الشحن بنجاح لدى ${shipment.companyName}`,
      data: shipment
    });
  } catch (error: any) {
    console.error('[ShippingRoutes] Error creating shipment:', error);
    res.status(400).json({
      success: false,
      error: error?.message || 'تعذر تسجيل بيانات الشحنة',
      code: 'SHIPMENT_CREATION_FAILED'
    });
  }
});

/**
 * PUT /api/shipping/seller/shipments/:id/status - Update shipment lifecycle status
 */
router.put('/seller/shipments/:id/status', requireSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, note, handoverDate, failureReason, proofOfDeliveryNote, proofOfDeliveryUrl } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'حالة الشحنة الجديدة مطلوبة',
        code: 'VALIDATION_ERROR'
      });
    }

    const updatedShipment = await updateShipmentStatus(req.user!, req.params.id, status, {
      note,
      handoverDate,
      failureReason,
      proofOfDeliveryNote,
      proofOfDeliveryUrl
    });

    res.json({
      success: true,
      message: 'تم تحديث مسار الشحنة بنجاح',
      data: updatedShipment
    });
  } catch (error: any) {
    console.error('[ShippingRoutes] Error updating shipment status:', error);
    res.status(400).json({
      success: false,
      error: error?.message || 'تعذر تحديث حالة الشحنة',
      code: 'STATUS_UPDATE_FAILED'
    });
  }
});

// =========================================================================
// ADMIN SHIPMENTS SUPERVISION & EXCEPTION RESOLUTION
// =========================================================================

/**
 * GET /api/shipping/admin/shipments - Platform-wide shipments list and analytics
 */
router.get('/admin/shipments', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, status, companyId, paymentMethod } = req.query;
    const result = await getAdminShipments({
      search: typeof search === 'string' ? search : undefined,
      status: (typeof status === 'string' ? status : undefined) as any,
      companyId: typeof companyId === 'string' ? companyId : undefined,
      paymentMethod: typeof paymentMethod === 'string' ? paymentMethod : undefined
    });

    res.json({
      success: true,
      data: result.shipments,
      stats: result.stats
    });
  } catch (error: any) {
    console.error('[ShippingRoutes] Error fetching admin shipments:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'فشل في جلب شحنات المنصة',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PUT /api/shipping/admin/shipments/:id/status - Admin override of shipment status
 */
router.put('/admin/shipments/:id/status', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, note, failureReason, proofOfDeliveryNote } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'الحالة الجديدة للشحنة مطلوبة',
        code: 'VALIDATION_ERROR'
      });
    }

    const updatedShipment = await updateShipmentStatus(req.user!, req.params.id, status, {
      note,
      failureReason,
      proofOfDeliveryNote
    });

    res.json({
      success: true,
      message: 'تم تحديث حالة الشحنة من قبل إدارة المنصة بنجاح',
      data: updatedShipment
    });
  } catch (error: any) {
    console.error('[ShippingRoutes] Error admin updating shipment status:', error);
    res.status(400).json({
      success: false,
      error: error?.message || 'تعذر تحديث الشحنة',
      code: 'ADMIN_UPDATE_FAILED'
    });
  }
});

export default router;

import express from 'express';
import type { Response } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import {
  createReport,
  getMyReports,
  getAdminReports,
  updateAdminReport,
  deleteAdminReport
} from '../services/reportService.ts';

const router = express.Router();

/**
 * Helper to get user info if authenticated or from headers/body
 */
function resolveSubmitter(req: AuthenticatedRequest) {
  if (req.user) {
    return {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role,
      phone: req.user.phone,
      email: req.user.email,
      governorate: req.user.governorate
    };
  }
  return {
    id: (req.headers['x-user-id'] as string) || req.body.userId || 'guest',
    name: (req.headers['x-user-name'] as string) || req.body.userName || 'زائر',
    role: ((req.headers['x-user-role'] as string) || req.body.userRole || 'buyer') as any,
    phone: (req.headers['x-user-phone'] as string) || req.body.userPhone || '',
    email: req.body.userEmail || '',
    governorate: req.body.userGovernorate || ''
  };
}

/**
 * POST /api/reports
 * Submit a new ticket/complaint (Buyer, Seller, or Guest)
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      subject,
      description,
      category,
      priority,
      userName,
      userPhone,
      userEmail,
      userGovernorate,
      relatedOrderId,
      relatedOrderNumber,
      relatedProductId,
      relatedProductName,
      relatedSellerId,
      relatedSellerName,
      attachments
    } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, error: 'عنوان أو موضوع البلاغ مطلوب' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, error: 'تفاصيل وشرح المشكلة مطلوبة' });
    }

    const user = resolveSubmitter(req);

    const name = (userName || user.name || '').trim();
    const phone = (userPhone || user.phone || '').trim();

    if (!name) {
      return res.status(400).json({ success: false, error: 'اسم مقدم البلاغ مطلوب' });
    }

    if (!phone) {
      return res.status(400).json({ success: false, error: 'رقم الهاتف للتواصل والمتابعة مطلوب' });
    }

    const ticket = await createReport(
      {
        userId: user.id,
        userName: name,
        userEmail: userEmail || user.email,
        userPhone: phone,
        userRole: user.role,
        userGovernorate: userGovernorate || user.governorate,
        category: category || 'other',
        priority: priority || 'medium',
        subject,
        description,
        relatedOrderId,
        relatedOrderNumber,
        relatedProductId,
        relatedProductName,
        relatedSellerId,
        relatedSellerName,
        attachments
      },
      user
    );

    return res.status(201).json({
      success: true,
      message: 'تم إرسال بلاغك بنجاح وجاري مراجعته من الإدارة',
      data: ticket
    });
  } catch (err: any) {
    console.error('[ReportRoutes] POST / error:', err);
    return res.status(500).json({ success: false, error: err.message || 'فشل تسجيل البلاغ' });
  }
});

/**
 * GET /api/reports/my
 * Get current user's submitted reports
 */
router.get('/my', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = resolveSubmitter(req);
    const queryPhone = (req.query.phone as string) || user.phone;

    const reports = await getMyReports({
      id: user.id,
      phone: queryPhone
    });

    return res.json({
      success: true,
      data: reports
    });
  } catch (err: any) {
    console.error('[ReportRoutes] GET /my error:', err);
    return res.status(500).json({ success: false, error: err.message || 'تعذر جلب سجل البلاغات' });
  }
});

/**
 * GET /api/reports/admin
 * Admin: Get all tickets with filtering
 */
router.get('/admin', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if admin
    const userRole = (req.user?.role || req.headers['x-user-role'] || req.query.userRole) as string;
    if (userRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'غير مصرح لك بالوصول لإدارة البلاغات' });
    }

    const { status, category, role, q } = req.query;

    const reports = await getAdminReports({
      status: status as any,
      category: category as any,
      userRole: role as string,
      searchTerm: q as string
    });

    return res.json({
      success: true,
      data: reports
    });
  } catch (err: any) {
    console.error('[ReportRoutes] GET /admin error:', err);
    return res.status(500).json({ success: false, error: err.message || 'تعذر جلب البلاغات للإدارة' });
  }
});

/**
 * PATCH /api/reports/admin/:id
 * Admin: Update status, admin response, or internal notes
 */
router.patch('/admin/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userRole = (req.user?.role || req.headers['x-user-role'] || req.body.userRole) as string;
    if (userRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'صلاحيات الإدارة مطلوبة' });
    }

    const reportId = req.params.id;
    const { status, adminResponse, internalNotes } = req.body;

    const updated = await updateAdminReport(
      reportId,
      { status, adminResponse, internalNotes },
      { id: req.user?.id || 'admin', name: req.user?.name || 'إدارة منصة وه' }
    );

    return res.json({
      success: true,
      message: 'تم تحديث حالة البلاغ وحفظ الرد بنجاح',
      data: updated
    });
  } catch (err: any) {
    console.error('[ReportRoutes] PATCH /admin/:id error:', err);
    return res.status(500).json({ success: false, error: err.message || 'فشل تحديث البلاغ' });
  }
});

/**
 * DELETE /api/reports/admin/:id
 * Admin: Delete a report
 */
router.delete('/admin/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userRole = (req.user?.role || req.headers['x-user-role'] || req.query.userRole) as string;
    if (userRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'صلاحيات الإدارة مطلوبة' });
    }

    const reportId = req.params.id;
    const success = await deleteAdminReport(reportId);

    if (!success) {
      return res.status(404).json({ success: false, error: 'البلاغ غير موجود أو تم حذفه مسبقاً' });
    }

    return res.json({
      success: true,
      message: 'تم حذف البلاغ بنجاح'
    });
  } catch (err: any) {
    console.error('[ReportRoutes] DELETE /admin/:id error:', err);
    return res.status(500).json({ success: false, error: err.message || 'فشل حذف البلاغ' });
  }
});

export default router;

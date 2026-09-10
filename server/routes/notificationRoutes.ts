import express from 'express';
import type { Response } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import {
  getUserNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllUserNotifications,
  sendAdminBroadcastNotification,
  getAdminBroadcastHistory
} from '../services/notificationService.ts';

const router = express.Router();

// Require authentication for ALL notification endpoints
router.use(requireAuth);

/**
 * POST /api/notifications/send
 * POST /api/notifications/broadcast
 * Send real, server-validated broadcast or targeted notification from an authorized Admin.
 */
router.post(['/send', '/broadcast'], requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, message, targetType, targetUserId, idempotencyKey, actionPage, link } = req.body;
    const result = await sendAdminBroadcastNotification(req.user!, {
      title,
      message,
      targetType,
      targetUserId,
      idempotencyKey,
      actionPage,
      link
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in POST /api/notifications/send:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'فشل في إرسال الإشعار والتنبيه',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/notifications/broadcasts
 * Get real sent admin broadcasts history from MongoDB.
 */
router.get('/broadcasts', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
    const history = await getAdminBroadcastHistory(limit);

    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error: any) {
    console.error('Error in GET /api/notifications/broadcasts:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'فشل في استعراض سجل الإعلانات المرسلة',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/notifications
 * Get paginated real notifications belonging strictly to the authenticated user.
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
    const notifications = await getUserNotifications(userId, limit);

    res.json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || 'فشل في جلب الإشعارات',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/notifications/unread-count
 * Real unread count from the database. Never hardcoded.
 */
router.get('/unread-count', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const count = await getUnreadNotificationsCount(userId);

    res.json({
      success: true,
      count
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || 'فشل في جلب عدد الإشعارات غير المقروءة',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications for the authenticated user as read.
 */
router.patch('/read-all', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    await markAllNotificationsAsRead(userId);

    res.json({
      success: true,
      message: 'تم تحديد جميع الإشعارات كمقروءة'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || 'فشل في تحديث حالة الإشعارات',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read (strictly owned by req.user.id).
 */
router.patch('/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        error: 'معرف الإشعار مطلوب',
        code: 'VALIDATION_ERROR'
      });
    }

    const success = await markNotificationAsRead(userId, notificationId);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'الإشعار غير موجود أو لا تملك صلاحية الوصول إليه',
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديد الإشعار كمقروء'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || 'فشل في تحديث الإشعار',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * DELETE /api/notifications/clear-all
 * Clear all notifications for the authenticated user.
 */
router.delete('/clear-all', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    await clearAllUserNotifications(userId);

    res.json({
      success: true,
      message: 'تم مسح كافة الإشعارات بنجاح'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || 'فشل في مسح الإشعارات',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a single notification (strictly owned by req.user.id).
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        error: 'معرف الإشعار مطلوب',
        code: 'VALIDATION_ERROR'
      });
    }

    const success = await deleteNotification(userId, notificationId);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'الإشعار غير موجود أو لا تملك صلاحية حذفه',
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف الإشعار بنجاح'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || 'فشل في حذف الإشعار',
      code: 'SERVER_ERROR'
    });
  }
});

export default router;

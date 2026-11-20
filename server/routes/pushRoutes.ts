import express from 'express';
import type { Request, Response } from 'express';
import { webPushService } from '../services/webPushService.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';

const router = express.Router();

/**
 * GET /api/push/vapid-public-key
 * Returns the VAPID public key needed by browser to subscribe to push notifications.
 */
router.get('/vapid-public-key', (req: Request, res: Response) => {
  try {
    const publicKey = webPushService.getVapidPublicKey();
    return res.json({
      success: true,
      publicKey
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'فشل في استرجاع مفتاح VAPID العام'
    });
  }
});

/**
 * POST /api/push/subscribe
 * Register or renew a browser Web Push subscription for this device.
 */
router.post('/subscribe', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { endpoint, keys, expirationTime } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({
        success: false,
        error: 'بيانات الاشتراك في إشعارات الويب غير مكتملة (endpoint and keys required)'
      });
    }

    const userId = req.user?.id || req.body.userId;
    const role = req.user?.role || req.body.role || 'guest';
    const userAgent = req.headers['user-agent'] || '';

    const subscription = await webPushService.saveSubscription({
      endpoint,
      keys,
      expirationTime,
      userId,
      role,
      userAgent
    });

    return res.status(200).json({
      success: true,
      message: 'تم تفعيل وتثبيت اشتراك الإشعارات الفورية بنجاح',
      subscriptionId: subscription.id
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'فشل في حفظ اشتراك الإشعارات الفورية'
    });
  }
});

/**
 * POST /api/push/unsubscribe
 * Unregister a browser Web Push subscription.
 */
router.post('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        error: 'عنوان الاشتراك (endpoint) مطلوب لإلغاء التفعيل'
      });
    }

    await webPushService.removeSubscription(endpoint);

    return res.status(200).json({
      success: true,
      message: 'تم إلغاء تفعيل الإشعارات الفورية لهذا الجهاز بنجاح'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'فشل في إلغاء تفعيل الإشعارات'
    });
  }
});

/**
 * POST /api/push/test
 * Send an immediate test Web Push notification to verify browser receipt.
 */
router.post('/test', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { endpoint } = req.body;
    const userId = req.user?.id;

    const payload = {
      title: 'وه | WAH — تجربة الإشعارات الفورية 🏺✨',
      body: 'تهانينا! تطبيق وه التفاعلي والإشعارات الفورية (Web Push) تعمل بأعلى كفاءة على جهازك.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      url: '/?source=pwa_test_notification',
      tag: `wah-test-${Date.now()}`
    };

    if (endpoint) {
      const keys = req.body.keys || { p256dh: '', auth: '' };
      const subDoc = {
        id: 'temp-test',
        endpoint,
        keys,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const ok = await webPushService.sendToSubscription(subDoc, payload);
      return res.json({
        success: ok,
        message: ok ? 'تم إرسال إشعار التجربة بنجاح' : 'تعذر إرسال الإشعار إلى هذا المعرف'
      });
    }

    if (userId) {
      const result = await webPushService.sendPushToUser(userId, payload);
      return res.json({
        success: result.sent > 0,
        sent: result.sent,
        total: result.total,
        message: result.sent > 0 ? `تم إرسال الإشعار إلى ${result.sent} جهاز` : 'لا توجد أجهزة مسجلة لهذا الحساب حالياً'
      });
    }

    return res.status(400).json({
      success: false,
      error: 'يرجى تسجيل الدخول أو تمرير endpoint لإرسال إشعار التجربة'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'فشل في إرسال إشعار التجربة'
    });
  }
});

export default router;

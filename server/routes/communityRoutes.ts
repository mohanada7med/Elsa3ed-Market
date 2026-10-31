import express from 'express';
import type { Response } from 'express';
import { requireBuyer } from '../middleware/auth.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import {
  followSeller,
  getActivePaidPromotion,
  getSellerFollowState,
  unfollowSeller
} from '../services/communityService.ts';

const router = express.Router();

router.get('/promotion', async (_req, res: Response) => {
  try {
    res.json({ success: true, data: await getActivePaidPromotion() });
  } catch (error) {
    console.error('[CommunityRoutes] Failed to load active promotion:', error);
    res.status(500).json({ success: false, error: 'تعذر تحميل مساحة الترويج', code: 'SERVER_ERROR' });
  }
});

router.get('/sellers/:sellerId/follow', requireBuyer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await getSellerFollowState(req.user!.id, req.params.sellerId);
    res.json({ success: true, data });
  } catch (error) {
    console.error('[CommunityRoutes] Failed to load seller follow state:', error);
    res.status(500).json({ success: false, error: 'تعذر تحميل حالة متابعة الورشة', code: 'SERVER_ERROR' });
  }
});

router.post('/sellers/:sellerId/follow', requireBuyer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await followSeller(req.user!, req.params.sellerId);
    res.json({ success: true, data: await getSellerFollowState(req.user!.id, req.params.sellerId) });
  } catch (error) {
    const message = (error as Error).message || 'تعذر متابعة الورشة';
    res.status(message.includes('غير موجود') ? 404 : 400).json({
      success: false,
      error: message,
      code: 'FOLLOW_ERROR'
    });
  }
});

router.delete('/sellers/:sellerId/follow', requireBuyer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await unfollowSeller(req.user!, req.params.sellerId);
    res.json({ success: true, data: await getSellerFollowState(req.user!.id, req.params.sellerId) });
  } catch (error) {
    console.error('[CommunityRoutes] Failed to unfollow seller:', error);
    res.status(500).json({ success: false, error: 'تعذر إلغاء متابعة الورشة', code: 'UNFOLLOW_ERROR' });
  }
});

export default router;

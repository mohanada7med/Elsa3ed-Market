import express from 'express';
import type { Response } from 'express';
import { requireAuth, requireCreator } from '../middleware/auth.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import {
  applyForCreator,
  getCreatorProfile,
  updateCreatorProfile,
  getPublicCreatorProfile,
  listPublicCreators,
  createCreatorPhoto,
  updateCreatorPhoto,
  deleteCreatorPhoto,
  getCreatorOwnPhotos,
  getPublicPhotos,
  likeCreatorPhoto,
  incrementPhotoView
} from '../services/creatorService.ts';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { CraftReelDocument } from '../models/types.ts';

const router = express.Router();

/**
 * GET /api/creators/status
 * Get the current user's creator status
 */
router.get('/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const creator = await getCreatorProfile(user.creatorId || user.id);
    if (!creator) {
      return res.json({
        success: true,
        creatorStatus: 'none',
        data: null
      });
    }

    return res.json({
      success: true,
      creatorStatus: creator.status,
      data: creator
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'فشل في جلب حالة صانع المحتوى',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/creators/apply
 * Apply to become a Content Creator
 */
router.post('/apply', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        error: 'حساب مدير المنصة مخصص للإدارة العليا ولا يتطلب التقديم كصانع محتوى',
        code: 'ADMIN_CANNOT_BE_CREATOR'
      });
    }

    const { name, avatar, bio, governorate, city, specialties, socialLinks, phone, email } = req.body;

    const creator = await applyForCreator(user, {
      name,
      avatar,
      bio,
      governorate: governorate || user.governorate,
      city,
      specialties,
      socialLinks,
      phone: phone || user.phone,
      email: email || user.email || ''
    });

    return res.status(201).json({
      success: true,
      message: 'تم تقديم طلب انضمامك كصانع محتوى بنجاح، ويجري مراجعته وتدقيقه من قبل إدارة منصة وه',
      data: creator
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.message || 'فشل في تقديم الطلب',
      code: 'APPLICATION_ERROR'
    });
  }
});

/**
 * GET /api/creators/me
 * Get current authenticated creator profile
 */
router.get('/me', requireCreator, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const creator = await getCreatorProfile(user.creatorId || user.id);
    if (!creator) {
      return res.status(404).json({
        success: false,
        error: 'لم يتم العثور على ملف صانع المحتوى',
        code: 'NOT_FOUND'
      });
    }

    return res.json({
      success: true,
      data: creator
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'فشل في جلب بيانات الصانع',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * PUT /api/creators/me
 * Update creator profile details
 */
router.put('/me', requireCreator, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const updated = await updateCreatorProfile(user, req.body);
    return res.json({
      success: true,
      message: 'تم تحديث بيانات ملفك الشخصي بنجاح',
      data: updated
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.message || 'فشل في تحديث البيانات',
      code: 'UPDATE_ERROR'
    });
  }
});

/**
 * GET /api/creators/my-reels
 * Get creator's own reels (including draft, pending, approved, rejected)
 */
router.get('/my-reels', requireCreator, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const creatorId = user.creatorId || user.id;
    const { status } = req.query;

    const { db, isMongo } = await getDatabase();
    let reels: CraftReelDocument[] = [];

    const query: any = {
      $or: [{ creatorId }, { sellerId: creatorId }, { sellerId: user.id }]
    };
    if (status && status !== 'all') {
      query.status = status;
    }

    if (isMongo && db) {
      reels = (await db
        .collection<CraftReelDocument>('reels')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray()) as any[];
    } else {
      reels = memoryDb.reels.filter((r) => {
        const matchesOwner = r.creatorId === creatorId || r.sellerId === creatorId || r.sellerId === user.id;
        if (!matchesOwner) return false;
        if (status && status !== 'all' && (r.status || 'approved') !== status) return false;
        return true;
      });
    }

    return res.json({
      success: true,
      data: reels
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'فشل في جلب قائمة الفيديوهات',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/creators/my-photos
 * Get creator's own photos (all statuses)
 */
router.get('/my-photos', requireCreator, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const creatorId = user.creatorId || user.id;
    const { status } = req.query;

    const photos = await getCreatorOwnPhotos(creatorId, {
      status: typeof status === 'string' ? status : undefined
    });

    return res.json({
      success: true,
      data: photos
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'فشل في جلب الصور',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/creators/photos
 * Publish / Submit a new photo post
 */
router.post('/photos', requireCreator, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const photo = await createCreatorPhoto(user, req.body);
    return res.status(201).json({
      success: true,
      message:
        user.role === 'admin'
          ? 'تم نشر معرض الصور بنجاح'
          : 'تم إرسال معرض الصور للمراجعة والاعتماد، وسيظهر للجمهور فور موافقة الإدارة',
      data: photo
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.message || 'فشل في نشر الصور',
      code: 'PUBLISH_ERROR'
    });
  }
});

/**
 * PUT /api/creators/photos/:id
 * Edit photo post (triggers re-moderation for approved/rejected content)
 */
router.put('/photos/:id', requireCreator, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const updated = await updateCreatorPhoto(user, id, req.body);
    return res.json({
      success: true,
      message:
        user.role === 'admin'
          ? 'تم تحديث منشور الصور بنجاح'
          : 'تم تحديث المنشور وإعادة إرساله للمراجعة الإدارية بنجاح',
      data: updated
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.message || 'فشل في تحديث منشور الصور',
      code: 'UPDATE_ERROR'
    });
  }
});

/**
 * DELETE /api/creators/photos/:id
 * Delete photo post
 */
router.delete('/photos/:id', requireCreator, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    await deleteCreatorPhoto(user, id);
    return res.json({
      success: true,
      message: 'تم حذف منشور الصور بنجاح'
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.message || 'فشل في حذف منشور الصور',
      code: 'DELETE_ERROR'
    });
  }
});

/**
 * GET /api/creators/public
 * Public list of approved creators
 */
router.get('/public', async (req, res: Response) => {
  try {
    const { governorate, specialty, search, verifiedOnly } = req.query;
    const creators = await listPublicCreators({
      governorate: typeof governorate === 'string' ? governorate : undefined,
      specialty: typeof specialty === 'string' ? specialty : undefined,
      search: typeof search === 'string' ? search : undefined,
      verifiedOnly: verifiedOnly === 'true'
    });

    return res.json({
      success: true,
      data: creators
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'فشل في جلب قائمة صناع المحتوى',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/creators/public/:id
 * Public creator profile details + approved content
 */
router.get('/public/:id', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const data = await getPublicCreatorProfile(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'صانع المحتوى غير موجود أو حسابه غير معتمد حالياً',
        code: 'NOT_FOUND'
      });
    }

    return res.json({
      success: true,
      data
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'فشل في جلب بيانات صانع المحتوى',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/creators/photos/public
 * Public feed of approved photos
 */
router.get('/photos/public', async (req, res: Response) => {
  try {
    const { category, governorate, search, limit } = req.query;
    const photos = await getPublicPhotos({
      category: typeof category === 'string' ? category : undefined,
      governorate: typeof governorate === 'string' ? governorate : undefined,
      search: typeof search === 'string' ? search : undefined,
      limit: limit ? Number(limit) : 50
    });

    return res.json({
      success: true,
      data: photos
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'فشل في جلب معرض الصور التراثي',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/creators/photos/:id/like
 */
router.post('/photos/:id/like', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const likes = await likeCreatorPhoto(id);
    return res.json({
      success: true,
      likesCount: likes
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'فشل في تسجيل الإعجاب'
    });
  }
});

/**
 * POST /api/creators/photos/:id/view
 */
router.post('/photos/:id/view', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const views = await incrementPhotoView(id);
    return res.json({
      success: true,
      viewsCount: views
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'فشل في تسجيل المشاهدة'
    });
  }
});

export default router;

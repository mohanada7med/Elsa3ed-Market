import express from 'express';
import type { Response } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { CraftReelDocument, CraftReelCommentDocument } from '../models/types.ts';
import { Logger } from '../utils/logger.ts';

import { storageService } from '../services/storage/storageProvider.ts';
import { extractCloudinaryPublicId, cloudinaryStorage } from '../services/storage/cloudinaryProvider.ts';
import { uploadLimiter } from '../middleware/rateLimiter.ts';

const router = express.Router();

// Configure Multer for streaming/binary multipart video uploads (up to 250MB fallback)
const videoMulter = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 250 * 1024 * 1024 // 250 MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/ogg',
      'video/x-matroska',
      'video/3gpp',
      'video/x-msvideo'
    ];
    if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. يرجى اختيار ملف فيديو صالح (MP4, WebM, MOV, OGG)'));
    }
  }
});


// GET /api/reels - Get all reels with optional filters
router.get('/', async (req, res: Response) => {
  try {
    const { sellerId, governorate, craftType, search, featuredOnly, limit = 50 } = req.query;
    const { db, isMongo } = await getDatabase();

    let reels: CraftReelDocument[] = [];

    if (isMongo && db) {
      const query: any = {};
      if (sellerId && sellerId !== 'all') {
        query.sellerId = sellerId;
      }
      if (governorate && governorate !== 'all') {
        query.governorate = governorate;
      }
      if (craftType && craftType !== 'all') {
        query.craftType = craftType;
      }
      if (featuredOnly === 'true') {
        query.isFeatured = true;
      }
      if (search && typeof search === 'string' && search.trim() !== '') {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { title: regex },
          { artisanName: regex },
          { workshopName: regex },
          { craftType: regex },
          { productTitle: regex },
          { hashtags: regex }
        ];
      }

      reels = (await db
        .collection<CraftReelDocument>('reels')
        .find(query)
        .sort({ isPinned: -1, createdAt: -1 })
        .limit(Number(limit) || 50)
        .toArray()) as any[];
    }

    if (!reels || reels.length === 0) {
      let memoryList = [...memoryDb.reels];
      if (sellerId && sellerId !== 'all') {
        memoryList = memoryList.filter((r) => r.sellerId === sellerId);
      }
      if (governorate && governorate !== 'all') {
        memoryList = memoryList.filter((r) => r.governorate === governorate);
      }
      if (craftType && craftType !== 'all') {
        memoryList = memoryList.filter((r) => r.craftType === craftType);
      }
      if (featuredOnly === 'true') {
        memoryList = memoryList.filter((r) => r.isFeatured);
      }
      if (search && typeof search === 'string' && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        memoryList = memoryList.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.artisanName.toLowerCase().includes(q) ||
            r.workshopName.toLowerCase().includes(q) ||
            r.craftType.toLowerCase().includes(q) ||
            r.productTitle.toLowerCase().includes(q)
        );
      }
      reels = memoryList;
    }

    return res.json({
      success: true,
      data: reels,
      count: reels.length
    });
  } catch (err: any) {
    Logger.error('[Reels] Error fetching reels:', err);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب مقاطع الفيديو من قاعدة البيانات',
      code: 'SERVER_ERROR'
    });
  }
});

// GET & POST /api/reels/upload-signature - Request secure Cloudinary direct signed upload parameters
const handleUploadSignature = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        error: 'فقط البائع المعتمد أو مدير المنصة يملك صلاحية رفع فيديوهات الريلز'
      });
    }

    if (!cloudinaryStorage.isAvailable()) {
      return res.json({
        success: true,
        directUpload: false,
        message: 'Cloudinary direct upload not available; using server multipart upload'
      });
    }

    let effectiveSellerId: string | undefined;
    if (user.role === 'seller') {
      // Strictly derive sellerId from server session token, NEVER from client request
      effectiveSellerId = user.sellerId || user.id;
    } else if (user.role === 'admin') {
      effectiveSellerId = ((req.body?.targetSellerId || req.query.targetSellerId) as string) || undefined;
    }

    const rawFilename = (req.body?.filename || req.query.filename as string) || 'reel_video.mp4';
    const signatureData = cloudinaryStorage.generateVideoUploadSignature({
      role: user.role,
      sellerId: effectiveSellerId,
      filename: rawFilename
    });

    Logger.info(`[Reels] Generated direct upload signature for ${user.role} (Seller: ${effectiveSellerId || 'admin'}, Folder: ${signatureData.folder})`);

    return res.json({
      success: true,
      directUpload: true,
      data: signatureData
    });
  } catch (err: any) {
    Logger.error('[Reels] Error generating video signature:', err?.message || err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'فشل في توليد توقيع الرفع السحابي'
    });
  }
};

router.get('/upload-signature', requireAuth, handleUploadSignature);
router.post('/upload-signature', requireAuth, handleUploadSignature);

// POST /api/reels/upload-video - Upload Reel Video to Cloudinary/Storage with isolated seller/admin folders
router.post(
  '/upload-video',
  uploadLimiter,
  requireAuth,
  (req: AuthenticatedRequest, res: Response, next) => {
    videoMulter.single('videoFile')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'حجم ملف الفيديو يتجاوز الحد الأقصى المسموح به (250 ميجابايت)'
          });
        }
        return res.status(400).json({
          success: false,
          error: err?.message || 'فشل في قراءة ملف الفيديو المرفوع'
        });
      }
      next();
    });
  },
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;
      if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          error: 'فقط البائع المعتمد أو مدير المنصة يملك صلاحية رفع فيديوهات الريلز'
        });
      }

      let uploadData: string | Buffer;
      let filename = 'reel_video.mp4';
      let mimeType = 'video/mp4';

      if (req.file) {
        uploadData = req.file.buffer;
        filename = req.file.originalname || filename;
        mimeType = req.file.mimetype || mimeType;
      } else if (req.body?.video) {
        const rawVideo = req.body.video;
        if (typeof rawVideo === 'string' && rawVideo.trim().startsWith('blob:')) {
          return res.status(400).json({
            success: false,
            error: 'لا يمكن رفع رابط blob مؤقت. يرجى إرسال ملف الفيديو الفعلي'
          });
        }
        uploadData = rawVideo;
        filename = req.body.filename || filename;
        mimeType = req.body.mimeType || mimeType;
      } else {
        return res.status(400).json({
          success: false,
          error: 'يرجى اختيار وتمرير ملف الفيديو لرفعه'
        });
      }

      // Determine strict isolated folder and seller identity server-side
      let effectiveSellerId: string | undefined;
      if (user.role === 'seller') {
        // Strictly derive sellerId from server session token, NEVER from client request
        effectiveSellerId = user.sellerId || user.id;
      } else if (user.role === 'admin') {
        effectiveSellerId = (req.body.targetSellerId || req.query.targetSellerId) as string || undefined;
      }

      const uploadResult = await storageService.upload({
        data: uploadData,
        filename,
        mimeType,
        folder: 'videos',
        resourceType: 'video',
        sellerId: effectiveSellerId,
        role: user.role,
        ownerId: user.id
      });

      Logger.info(`[Reels] Video uploaded to storage: ${uploadResult.url} (Key: ${uploadResult.fileKey})`);

      res.status(201).json({
        success: true,
        message: `تم رفع الفيديو بنجاح وحفظه (${user.role === 'seller' ? 'مجلد الحرفي' : 'مجلد الإدارة'})`,
        data: {
          url: uploadResult.url,
          fileKey: uploadResult.fileKey,
          cloudinaryPublicId: uploadResult.fileKey,
          resourceType: 'video',
          duration: uploadResult.duration,
          format: uploadResult.mimeType
        }
      });
    } catch (err: any) {
      Logger.error('[Reels] Video upload error:', err?.message || err);
      res.status(500).json({
        success: false,
        error: err?.message || 'فشل في رفع الفيديو إلى خدمة التخزين'
      });
    }
  }
);

// POST /api/reels/delete-asset - Clean up uploaded asset if upload is cancelled or creation fails
router.post('/delete-asset', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        error: 'غير مصرح بحذف الأصول الإعلامية'
      });
    }

    const { fileKey, publicId } = req.body;
    const targetKey = publicId || fileKey;

    if (!targetKey || typeof targetKey !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'يرجى تحديد المفتاح السحابي للملف المراد حذفه'
      });
    }

    // Security check: sellers can only delete assets from their own folder
    if (user.role === 'seller') {
      const sellerId = user.sellerId || user.id;
      const cleanSellerId = sellerId.replace(/[^a-zA-Z0-9_-]/g, '_');
      if (!targetKey.includes(cleanSellerId) && !targetKey.includes(sellerId)) {
        return res.status(403).json({
          success: false,
          error: 'غير مصرح بحذف ملف لا ينتمي لمجلد ورشتك'
        });
      }
    }

    const deleted = await storageService.delete(targetKey, { id: user.id, role: user.role });
    Logger.info(`[Reels] Cleaned up asset: ${targetKey} (Deleted: ${deleted})`);

    return res.json({
      success: true,
      deleted,
      message: 'تم تنظيف الملف بنجاح'
    });
  } catch (err: any) {
    Logger.error('[Reels] Error deleting asset:', err?.message || err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'فشل في تنظيف الملف'
    });
  }
});

// GET /api/reels/:id - Get single reel
router.get('/:id', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const { db, isMongo } = await getDatabase();

    let reel: CraftReelDocument | null = null;
    if (isMongo && db) {
      reel = await db.collection<CraftReelDocument>('reels').findOne({ id });
    }
    if (!reel) {
      reel = memoryDb.reels.find((r) => r.id === id) || null;
    }

    if (!reel) {
      return res.status(404).json({
        success: false,
        error: 'مقطع الفيديو غير موجود',
        code: 'NOT_FOUND'
      });
    }

    return res.json({
      success: true,
      data: reel
    });
  } catch (err: any) {
    Logger.error('[Reels] Error getting reel by id:', err);
    return res.status(500).json({
      success: false,
      error: 'تعذر جلب تفاصيل الفيديو',
      code: 'SERVER_ERROR'
    });
  }
});

// POST /api/reels - Create new reel (Seller or Admin)
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    if (user.role !== 'seller' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'عفواً، إضافة مقاطع الفيديو متاح فقط للحرفيين البائعين وإدارة المنصة',
        code: 'FORBIDDEN'
      });
    }

    const {
      title,
      artisanName,
      artisanAvatar,
      workshopName,
      sellerId: requestedSellerId,
      governorate,
      craftType,
      videoUrl,
      cloudinaryPublicId,
      posterUrl,
      duration,
      productId,
      productTitle,
      productPrice,
      productOriginalPrice,
      productImage,
      productRating,
      description,
      hashtags,
      musicTrack,
      isFeatured,
      isVerifiedArtisan
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'عنوان مقطع الفيديو مطلوب',
        code: 'VALIDATION_ERROR'
      });
    }

    if (!videoUrl?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'رابط الفيديو السحابي مطلوب',
        code: 'VALIDATION_ERROR'
      });
    }

    // Critical: strictly forbid saving temporary blob URLs in MongoDB or DB
    if (videoUrl.trim().startsWith('blob:')) {
      return res.status(400).json({
        success: false,
        error: 'لا يمكن حفظ رابط blob مؤقت في قاعدة البيانات. يرجى التأكد من رفع الفيديو بنجاح إلى Cloudinary أولاً للحصول على رابط دائم.',
        code: 'INVALID_BLOB_URL'
      });
    }

    // Role Ownership Resolution
    let effectiveSellerId: string;
    let effectiveArtisanName = artisanName || user.name || 'أسطى الحرفة';
    let effectiveWorkshopName = workshopName || 'ورشة الصعيد التراثية';

    if (user.role === 'seller') {
      // Strictly bind to seller's own authenticated id
      effectiveSellerId = user.sellerId || user.id;
    } else {
      // Admin can assign to any seller or platform-admin
      effectiveSellerId = requestedSellerId || user.sellerId || 'platform-admin';
    }

    const resolvedPublicId =
      cloudinaryPublicId ||
      extractCloudinaryPublicId(videoUrl.trim()) ||
      undefined;

    const newReel: CraftReelDocument = {
      id: `reel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      artisanName: effectiveArtisanName.trim(),
      artisanAvatar:
        artisanAvatar ||
        user.avatar ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      workshopName: effectiveWorkshopName.trim(),
      sellerId: effectiveSellerId,
      governorate: governorate || user.governorate || 'قنا',
      craftType: craftType || 'حرفة يدوية صعيدية',
      videoUrl: videoUrl.trim(),
      cloudinaryPublicId: resolvedPublicId,
      resourceType: 'video',
      posterUrl:
        posterUrl?.trim() ||
        productImage ||
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
      duration: duration || '0:30',
      likesCount: 0,
      viewsCount: 1,
      sharesCount: 0,
      productId: productId || `prod-${Date.now()}`,
      productTitle: productTitle?.trim() || title.trim(),
      productPrice: Number(productPrice) || 200,
      productOriginalPrice: productOriginalPrice ? Number(productOriginalPrice) : undefined,
      productImage:
        productImage ||
        posterUrl ||
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
      productRating: Number(productRating) || 5.0,
      inStock: true,
      description: description?.trim() || title.trim(),
      hashtags: Array.isArray(hashtags)
        ? hashtags
        : typeof hashtags === 'string'
        ? hashtags.split(/[,،\s]+/).filter(Boolean)
        : ['#تراث_الصعيد', '#صناعة_يدوية'],
      musicTrack: musicTrack || 'نغمات صعيدية أصيلة',
      isVerifiedArtisan: isVerifiedArtisan ?? true,
      isFeatured: user.role === 'admin' ? Boolean(isFeatured) : false,
      createdAt: new Date().toISOString().split('T')[0],
      comments: []
    };

    // Save to Database
    const { db, isMongo } = await getDatabase();
    if (isMongo && db) {
      await db.collection('reels').insertOne(newReel);
    }
    memoryDb.reels.unshift(newReel);

    // Audit Log
    memoryDb.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userName: user.name,
      userRole: user.role,
      action: 'إضافة فيديو ريلز جديد',
      resource: 'craft_reels',
      timestamp: new Date().toISOString(),
      status: 'نجاح',
      details: `تم إضافة الفيديو "${newReel.title}" للورشة "${newReel.workshopName}" (${newReel.governorate}) [${newReel.id}]`
    });

    Logger.info(`[Reels] Created new reel: ${newReel.id} by ${user.role} (${user.id}) - Cloudinary Public ID: ${resolvedPublicId || 'N/A'}`);

    return res.status(201).json({
      success: true,
      data: newReel,
      message: 'تم إضافة مقطع الفيديو بنجاح وحفظه في قاعدة البيانات'
    });
  } catch (err: any) {
    Logger.error('[Reels] Error creating reel:', err);
    return res.status(500).json({
      success: false,
      error: 'فشل في إضافة مقطع الفيديو',
      code: 'SERVER_ERROR'
    });
  }
});

// PUT /api/reels/:id - Edit Reel (Seller edits ONLY their own, Admin edits ALL)
router.put('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    if (user.role !== 'seller' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'غير مصرح لك بتعديل مقاطع الفيديو',
        code: 'FORBIDDEN'
      });
    }

    const { db, isMongo } = await getDatabase();
    let existingReel: CraftReelDocument | null = null;

    if (isMongo && db) {
      existingReel = await db.collection<CraftReelDocument>('reels').findOne({ id });
    }
    if (!existingReel) {
      existingReel = memoryDb.reels.find((r) => r.id === id) || null;
    }

    if (!existingReel) {
      return res.status(404).json({
        success: false,
        error: 'مقطع الفيديو غير موجود',
        code: 'NOT_FOUND'
      });
    }

    // Strict Seller Ownership Check
    if (user.role === 'seller') {
      const sellerOwnId = user.sellerId || user.id;
      if (existingReel.sellerId !== sellerOwnId) {
        return res.status(403).json({
          success: false,
          error: 'غير مصرح لك بتعديل فيديو يخص ورشة بائع آخر. يمكنك فقط التحكم في فيديوهات ورشتك.',
          code: 'FORBIDDEN_OWNERSHIP'
        });
      }
    }

    const updates = req.body;
    const sanitizedUpdates: Partial<CraftReelDocument> = {
      updatedAt: new Date().toISOString()
    };

    if (updates.title !== undefined) sanitizedUpdates.title = updates.title.trim();
    if (updates.description !== undefined) sanitizedUpdates.description = updates.description.trim();

    // Check videoUrl update and clean up old Cloudinary asset if replaced
    if (updates.videoUrl !== undefined) {
      const newVideoUrl = updates.videoUrl.trim();
      if (newVideoUrl.startsWith('blob:')) {
        return res.status(400).json({
          success: false,
          error: 'لا يمكن حفظ رابط blob مؤقت في قاعدة البيانات',
          code: 'INVALID_BLOB_URL'
        });
      }
      sanitizedUpdates.videoUrl = newVideoUrl;

      if (newVideoUrl !== existingReel.videoUrl) {
        // Old video is being replaced: destroy old Cloudinary asset to avoid orphaned files
        const oldPublicId = existingReel.cloudinaryPublicId || extractCloudinaryPublicId(existingReel.videoUrl);
        if (oldPublicId) {
          Logger.info(`[Reels] Replacing video for reel ${id}. Deleting old asset: ${oldPublicId}`);
          cloudinaryStorage.delete(oldPublicId, { id: user.id, role: user.role }).catch((delErr) => {
            Logger.warn(`[Reels] Could not delete old video asset: ${oldPublicId}`, delErr);
          });
        }

        sanitizedUpdates.cloudinaryPublicId =
          updates.cloudinaryPublicId ||
          extractCloudinaryPublicId(newVideoUrl) ||
          undefined;
        sanitizedUpdates.resourceType = 'video';
      }
    }

    if (updates.cloudinaryPublicId !== undefined) sanitizedUpdates.cloudinaryPublicId = updates.cloudinaryPublicId;
    if (updates.posterUrl !== undefined) sanitizedUpdates.posterUrl = updates.posterUrl.trim();
    if (updates.duration !== undefined) sanitizedUpdates.duration = updates.duration;
    if (updates.governorate !== undefined) sanitizedUpdates.governorate = updates.governorate;
    if (updates.craftType !== undefined) sanitizedUpdates.craftType = updates.craftType;
    if (updates.musicTrack !== undefined) sanitizedUpdates.musicTrack = updates.musicTrack;
    if (updates.hashtags !== undefined) {
      sanitizedUpdates.hashtags = Array.isArray(updates.hashtags)
        ? updates.hashtags
        : String(updates.hashtags).split(/[,،\s]+/).filter(Boolean);
    }
    if (updates.productId !== undefined) sanitizedUpdates.productId = updates.productId;
    if (updates.productTitle !== undefined) sanitizedUpdates.productTitle = updates.productTitle;
    if (updates.productPrice !== undefined) sanitizedUpdates.productPrice = Number(updates.productPrice);
    if (updates.productOriginalPrice !== undefined) sanitizedUpdates.productOriginalPrice = Number(updates.productOriginalPrice);
    if (updates.productImage !== undefined) sanitizedUpdates.productImage = updates.productImage;
    if (updates.inStock !== undefined) sanitizedUpdates.inStock = Boolean(updates.inStock);

    // Admin-Only Privileges
    if (user.role === 'admin') {
      if (updates.artisanName !== undefined) sanitizedUpdates.artisanName = updates.artisanName;
      if (updates.workshopName !== undefined) sanitizedUpdates.workshopName = updates.workshopName;
      if (updates.artisanAvatar !== undefined) sanitizedUpdates.artisanAvatar = updates.artisanAvatar;
      if (updates.sellerId !== undefined) sanitizedUpdates.sellerId = updates.sellerId;
      if (updates.isFeatured !== undefined) sanitizedUpdates.isFeatured = Boolean(updates.isFeatured);
      if (updates.isPinned !== undefined) sanitizedUpdates.isPinned = Boolean(updates.isPinned);
      if (updates.isVerifiedArtisan !== undefined) sanitizedUpdates.isVerifiedArtisan = Boolean(updates.isVerifiedArtisan);
      if (updates.likesCount !== undefined) sanitizedUpdates.likesCount = Number(updates.likesCount);
      if (updates.viewsCount !== undefined) sanitizedUpdates.viewsCount = Number(updates.viewsCount);
    }

    const updatedReel: CraftReelDocument = {
      ...existingReel,
      ...sanitizedUpdates
    };

    if (isMongo && db) {
      await db.collection('reels').updateOne({ id }, { $set: sanitizedUpdates });
    }

    const memIdx = memoryDb.reels.findIndex((r) => r.id === id);
    if (memIdx !== -1) {
      memoryDb.reels[memIdx] = updatedReel;
    }

    // Audit Log
    memoryDb.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userName: user.name,
      userRole: user.role,
      action: 'تعديل مقطع فيديو ريلز',
      resource: 'craft_reels',
      timestamp: new Date().toISOString(),
      status: 'نجاح',
      details: `قام ${user.name} بتعديل بيانات الفيديو "${updatedReel.title}" [${id}]`
    });

    Logger.info(`[Reels] Updated reel ${id} by ${user.role} (${user.id})`);

    return res.json({
      success: true,
      data: updatedReel,
      message: 'تم تحديث بيانات مقطع الفيديو بنجاح في قاعدة البيانات'
    });
  } catch (err: any) {
    Logger.error('[Reels] Error updating reel:', err);
    return res.status(500).json({
      success: false,
      error: 'فشل في تحديث مقطع الفيديو',
      code: 'SERVER_ERROR'
    });
  }
});

// DELETE /api/reels/:id - Delete Reel (Seller deletes ONLY their own, Admin deletes ANY) + Cloudinary deletion
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    if (user.role !== 'seller' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'غير مصرح لك بحذف مقاطع الفيديو',
        code: 'FORBIDDEN'
      });
    }

    const { db, isMongo } = await getDatabase();
    let existingReel: CraftReelDocument | null = null;

    if (isMongo && db) {
      existingReel = await db.collection<CraftReelDocument>('reels').findOne({ id });
    }
    if (!existingReel) {
      existingReel = memoryDb.reels.find((r) => r.id === id) || null;
    }

    if (!existingReel) {
      return res.status(404).json({
        success: false,
        error: 'مقطع الفيديو غير موجود',
        code: 'NOT_FOUND'
      });
    }

    // Strict Seller Ownership Check
    if (user.role === 'seller') {
      const sellerOwnId = user.sellerId || user.id;
      if (existingReel.sellerId !== sellerOwnId) {
        return res.status(403).json({
          success: false,
          error: 'غير مصرح لك بحذف فيديو يخص ورشة بائع آخر. يمكنك فقط إدارة مقاطع ورشتك.',
          code: 'FORBIDDEN_OWNERSHIP'
        });
      }
    }

    // Clean up video asset from Cloudinary to avoid orphaned media files
    const videoPublicId = existingReel.cloudinaryPublicId || extractCloudinaryPublicId(existingReel.videoUrl);
    if (videoPublicId) {
      Logger.info(`[Reels] Deleting video asset from Cloudinary: ${videoPublicId}`);
      cloudinaryStorage.delete(videoPublicId, { id: user.id, role: user.role }).catch((delErr) => {
        Logger.warn(`[Reels] Cloudinary deletion error for ${videoPublicId}:`, delErr);
      });
    }

    if (isMongo && db) {
      await db.collection('reels').deleteOne({ id });
    }
    memoryDb.reels = memoryDb.reels.filter((r) => r.id !== id);

    // Audit Log
    memoryDb.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userName: user.name,
      userRole: user.role,
      action: 'حذف مقطع فيديو ريلز',
      resource: 'craft_reels',
      timestamp: new Date().toISOString(),
      status: 'تنبيه',
      details: `تم حذف الفيديو "${existingReel.title}" من ورشة "${existingReel.workshopName}" بواسطة ${user.name} [${id}]`
    });

    Logger.info(`[Reels] Deleted reel ${id} by ${user.role} (${user.id})`);

    return res.json({
      success: true,
      message: 'تم حذف مقطع الفيديو بنجاح من المنصة وقاعدة البيانات والتخزين السحابي'
    });
  } catch (err: any) {
    Logger.error('[Reels] Error deleting reel:', err);
    return res.status(500).json({
      success: false,
      error: 'فشل في حذف مقطع الفيديو',
      code: 'SERVER_ERROR'
    });
  }
});

// POST /api/reels/bulk-delete - Bulk delete multiple reels (Admin only) + Cloudinary cleanup
router.post('/bulk-delete', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { ids } = req.body;

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'عفواً، الحذف المتعدد للفيديوهات مقتصر على مدير المنصة فقط',
        code: 'FORBIDDEN'
      });
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'يرجى تحديد معرفات مقاطع الفيديو المراد حذفها',
        code: 'BAD_REQUEST'
      });
    }

    const { db, isMongo } = await getDatabase();
    let reelsToDelete: CraftReelDocument[] = [];

    if (isMongo && db) {
      reelsToDelete = await db.collection<CraftReelDocument>('reels').find({ id: { $in: ids } }).toArray();
    } else {
      reelsToDelete = memoryDb.reels.filter((r) => ids.includes(r.id));
    }

    // Clean up all Cloudinary video assets
    for (const r of reelsToDelete) {
      const videoPublicId = r.cloudinaryPublicId || extractCloudinaryPublicId(r.videoUrl);
      if (videoPublicId) {
        cloudinaryStorage.delete(videoPublicId, { id: user.id, role: user.role }).catch(() => {});
      }
    }

    if (isMongo && db) {
      await db.collection('reels').deleteMany({ id: { $in: ids } });
    }

    const initialCount = memoryDb.reels.length;
    memoryDb.reels = memoryDb.reels.filter((r) => !ids.includes(r.id));

    // Audit Log
    memoryDb.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userName: user.name,
      userRole: user.role,
      action: 'حذف جماعي لفيديوهات ريلز',
      resource: 'craft_reels',
      timestamp: new Date().toISOString(),
      status: 'تنبيه',
      details: `قام المدير ${user.name} بحذف ${ids.length} مقطع فيديو دفعة واحدة وتطهيرها من الكلاود`
    });

    Logger.info(`[Reels] Bulk deleted ${ids.length} reels by admin (${user.id})`);

    return res.json({
      success: true,
      deletedCount: ids.length,
      message: `تم حذف ${ids.length} مقطع فيديو بنجاح من قاعدة البيانات والمنصة والتخزين السحابي`
    });
  } catch (err: any) {
    Logger.error('[Reels] Error bulk deleting reels:', err);
    return res.status(500).json({
      success: false,
      error: 'فشل في الحذف الجماعي لمقاطع الفيديو',
      code: 'SERVER_ERROR'
    });
  }
});

// POST /api/reels/audit-videos - Audit and sanitize any invalid or blob: video URLs in database
router.post('/audit-videos', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'غير مصرح' });
    }

    const { db, isMongo } = await getDatabase();
    let invalidCount = 0;
    const repairedList: string[] = [];

    if (isMongo && db) {
      const allDbReels = await db.collection<CraftReelDocument>('reels').find({}).toArray();
      for (const r of allDbReels) {
        if (!r.videoUrl || r.videoUrl.startsWith('blob:') || r.videoUrl.trim() === '') {
          invalidCount++;
          // Remove invalid blob reel
          await db.collection('reels').deleteOne({ id: r.id });
          repairedList.push(r.id);
        }
      }
    }

    // Also sanitize memoryDb
    memoryDb.reels = memoryDb.reels.filter((r) => r.videoUrl && !r.videoUrl.startsWith('blob:') && r.videoUrl.trim() !== '');

    return res.json({
      success: true,
      message: `تم فحص قاعدة البيانات: تم تنظيف ${invalidCount} فيديوهات غير صالحة`,
      invalidCount,
      repairedList
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// POST /api/reels/:id/like - Like / Unlike Reel
router.post('/:id/like', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const { isLiked } = req.body; // boolean
    const increment = isLiked === false ? -1 : 1;

    const { db, isMongo } = await getDatabase();
    if (isMongo && db) {
      await db.collection('reels').updateOne({ id }, { $inc: { likesCount: increment } });
    }

    const reel = memoryDb.reels.find((r) => r.id === id);
    if (reel) {
      reel.likesCount = Math.max(0, reel.likesCount + increment);
    }

    return res.json({
      success: true,
      likesCount: reel?.likesCount || 0
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to update like' });
  }
});

// POST /api/reels/:id/view - Increment Views Count
router.post('/:id/view', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const { db, isMongo } = await getDatabase();
    if (isMongo && db) {
      await db.collection('reels').updateOne({ id }, { $inc: { viewsCount: 1 } });
    }

    const reel = memoryDb.reels.find((r) => r.id === id);
    if (reel) {
      reel.viewsCount += 1;
    }

    return res.json({ success: true, viewsCount: reel?.viewsCount || 0 });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update view' });
  }
});

// POST /api/reels/:id/share - Increment Shares Count
router.post('/:id/share', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const { db, isMongo } = await getDatabase();
    if (isMongo && db) {
      await db.collection('reels').updateOne({ id }, { $inc: { sharesCount: 1 } });
    }

    const reel = memoryDb.reels.find((r) => r.id === id);
    if (reel) {
      reel.sharesCount += 1;
    }

    return res.json({ success: true, sharesCount: reel?.sharesCount || 0 });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update share' });
  }
});

// POST /api/reels/:id/comments - Add Comment to Reel
router.post('/:id/comments', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const { userName, userAvatar, governorate, comment } = req.body;

    if (!comment?.trim()) {
      return res.status(400).json({ success: false, error: 'التعليق لا يمكن أن يكون فارغاً' });
    }

    const newComment: CraftReelCommentDocument = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userName: userName?.trim() || 'محب للتراث الصعيدي',
      userAvatar: userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      governorate: governorate || 'مصر',
      comment: comment.trim(),
      createdAt: 'الآن',
      likesCount: 0
    };

    const { db, isMongo } = await getDatabase();
    if (isMongo && db) {
      await db.collection('reels').updateOne(
        { id },
        {
          $push: {
            comments: {
              $each: [newComment],
              $position: 0
            }
          } as any
        }
      );
    }

    const reel = memoryDb.reels.find((r) => r.id === id);
    if (reel) {
      reel.comments = [newComment, ...(reel.comments || [])];
    }

    return res.status(201).json({
      success: true,
      data: newComment,
      message: 'تم إضافة التعليق بنجاح'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to add comment' });
  }
});

export default router;

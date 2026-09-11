import express from 'express';
import type { Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { requireAdmin } from '../middleware/auth.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import {
  uploadAdminMedia,
  confirmAdminVideo,
  replaceAdminMedia,
  deleteAdminMedia,
  updateAdminMediaMetadata,
  getAdminMediaList,
  saveExternalUrlMedia,
  setPrimaryAdminMedia,
  reorderGalleryMedia,
  manageEntityGallery,
  reassignMediaEntity,
  buildMediaIdFilter
} from '../services/mediaService.ts';
import { getDatabase } from '../db/mongodb.ts';
import { isValidWahEntityType } from '../utils/cloudinaryFolders.ts';
import { cloudinaryStorage } from '../services/storage/cloudinaryProvider.ts';
import { Logger } from '../utils/logger.ts';

const router = express.Router();

// Enforce strict Admin authorization across all media endpoints
// Any unauthorized request (unauthenticated, buyer, or seller) strictly returns 403 Forbidden
router.use((req: AuthenticatedRequest, res: Response, next) => {
  if (!req.user || !req.user.id || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'عفواً، هذه العملية مخصصة لمدراء منصة وه | WAH فقط',
      code: 'FORBIDDEN'
    });
  }
  next();
});

// Configure Multer with disk storage for streaming/binary multipart video and media uploads
// Streaming to temporary disk avoids exhausting Node.js heap memory on large video files (up to 1GB)
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, os.tmpdir());
    },
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      cb(null, `admin_media_${unique}_${file.originalname || 'file'}`);
    }
  }),
  limits: {
    fileSize: 1024 * 1024 * 1024 // 1 GB (1,073,741,824 bytes) max file size
  },
  fileFilter: (_req, file, cb) => {
    const allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const allowedVideoMimes = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/ogg',
      'video/x-matroska',
      'video/3gpp',
      'video/x-msvideo'
    ];
    const mime = file.mimetype.toLowerCase();
    if (
      allowedImageMimes.includes(mime) ||
      allowedVideoMimes.includes(mime) ||
      mime.startsWith('image/') ||
      mime.startsWith('video/')
    ) {
      cb(null, true);
    } else {
      cb(new Error('صيغة الملف غير مدعومة. الصيغ المدعومة هي: صور (JPEG, PNG, WEBP) وفيديوهات (MP4, WEBM, MOV, OGG, MKV)'));
    }
  }
});

// =========================================================================
// 1. POST /api/admin/media/upload - Direct File or Base64 Upload
// =========================================================================
router.post('/upload', (req: AuthenticatedRequest, res: Response, next) => {
  // If multipart form data, run multer; otherwise proceed to json handler
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'حجم الفيديو لازم يكون 300 ميجاأو أقل.',
            code: 'FILE_TOO_LARGE'
          });
        }
        return res.status(400).json({
          success: false,
          error: `خطأ في معالجة الملف: ${err.message}`,
          code: 'UPLOAD_ERROR'
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          error: err.message || 'فشل في قراءة ملف الوسائط',
          code: 'INVALID_FILE'
        });
      }
      next();
    });
  } else {
    next();
  }
}, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const file = req.file;
    const body = req.body || {};

    let buffer: Buffer | string;
    let filename = file?.originalname || body.filename || 'media_asset';
    let mimeType = file?.mimetype || body.mimeType || 'image/jpeg';

    if (file && (file as any).path) {
      try {
        buffer = fs.readFileSync((file as any).path);
      } finally {
        fs.unlink((file as any).path, () => { });
      }
    } else if (file && file.buffer) {
      buffer = file.buffer;
    } else if (body.data || body.fileData || body.base64) {
      buffer = body.data || body.fileData || body.base64;
    } else {
      return res.status(400).json({
        success: false,
        error: 'لم يتم إرسال أي ملف وسائط أو بيانات Base64',
        code: 'NO_FILE_PROVIDED'
      });
    }

    const isVideo =
      mimeType.toLowerCase().startsWith('video/') ||
      filename.toLowerCase().endsWith('.mp4') ||
      filename.toLowerCase().endsWith('.webm') ||
      filename.toLowerCase().endsWith('.mov') ||
      filename.toLowerCase().endsWith('.ogg') ||
      filename.toLowerCase().endsWith('.mkv') ||
      body.resourceType === 'video' ||
      body.entityType === 'video' ||
      body.entityType === 'videos';

    const resolvedResourceType: 'image' | 'video' = isVideo ? 'video' : 'image';

    const rawEntityType = body.entityType ? String(body.entityType).trim() : (isVideo ? 'videos' : 'general');
    if (!isValidWahEntityType(rawEntityType)) {
      return res.status(400).json({
        success: false,
        error: `نوع الكيان "${body.entityType}" غير صالح أو غير معتمد في بنية مجلدات WAH السحابية`,
        code: 'UNKNOWN_ENTITY_TYPE'
      });
    }
    const entityType = rawEntityType;

    if (body.folder || body.publicId || body.public_id) {
      Logger.warn('[Security] Client attempted to specify custom folder/publicId. Overriding with centralized server-generated path.');
    }

    const entitySlug = body.entitySlug || body.slug || '';
    const entityId = body.entityId || '';
    const alt = body.alt || '';
    const caption = body.caption || '';
    const isPrimary = body.isPrimary === 'true' || body.isPrimary === true;
    const addToGallery = body.addToGallery === 'true' || body.addToGallery === true;

    const media = await uploadAdminMedia({
      data: buffer,
      filename,
      mimeType,
      resourceType: resolvedResourceType,
      entityType,
      entitySlug,
      entityId,
      alt,
      caption,
      isPrimary,
      addToGallery,
      user: {
        id: req.user!.id,
        role: req.user!.role,
        name: req.user!.name
      }
    });

    return res.status(201).json({
      success: true,
      message: isVideo ? 'تم رفع الفيديو وتوثيقه بنجاح' : 'تم رفع الصورة وتوثيقها بنجاح',
      data: media
    });
  } catch (error: any) {
    Logger.error('[AdminMedia] Upload error:', error?.message || error);
    const isVideoReq = req.body?.resourceType === 'video' || req.file?.mimetype?.startsWith('video/');
    return res.status(400).json({
      success: false,
      error: error?.message || (isVideoReq ? 'فشل في رفع مقطع الفيديو' : 'فشل في رفع الصورة'),
      code: 'UPLOAD_FAILED'
    });
  }
});

// =========================================================================
// 1.1 Direct Video Upload Signature: GET/POST /api/admin/media/upload-signature
// Enables direct chunked frontend uploads to Cloudinary without Node.js RAM overhead
// =========================================================================
const handleAdminVideoSignature = (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawFilename = (req.body?.filename || req.query.filename as string) || 'place_video.mp4';
    const entityType = (req.body?.entityType || req.query.entityType as string) || 'heritage-place';
    const entitySlug = (req.body?.entitySlug || req.query.entitySlug as string) || '';

    const signatureData = cloudinaryStorage.generateVideoUploadSignature({
      role: 'admin',
      filename: rawFilename,
      entityType,
      entitySlug
    });

    Logger.info(`[AdminMedia] Generated direct video signature for ${entityType}/${entitySlug || 'general'}`);

    return res.json({
      success: true,
      directUpload: true,
      data: signatureData
    });
  } catch (err: any) {
    Logger.error('[AdminMedia] Error generating video signature:', err?.message || err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'فشل في توليد توقيع الرفع السحابي للفيديو',
      code: 'SIGNATURE_FAILED'
    });
  }
};

router.get('/upload-signature', handleAdminVideoSignature);
router.post('/upload-signature', handleAdminVideoSignature);

// =========================================================================
// 1.2 Video Asset Verification: GET/POST /api/admin/media/verify-upload
// Enables client-side lifecycle polling while Cloudinary processes video
// =========================================================================
const handleAdminVerifyUpload = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const publicId = (req.body?.publicId || req.body?.fileKey || req.query?.publicId || req.query?.fileKey) as string;
    if (!publicId || typeof publicId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'المعرف السحابي للملف مطلوب',
        code: 'MISSING_PUBLIC_ID'
      });
    }

    const verification = await cloudinaryStorage.verifyVideoAsset(publicId);
    return res.json({
      success: true,
      data: verification
    });
  } catch (err: any) {
    Logger.error('[AdminMedia] Video asset verification error:', err?.message || err);
    return res.status(500).json({
      success: false,
      error: 'فشل في التحقق من حالة الفيديو السحابي',
      code: 'VERIFICATION_FAILED'
    });
  }
};

router.get('/verify-upload', handleAdminVerifyUpload);
router.post('/verify-upload', handleAdminVerifyUpload);

// =========================================================================
// 1.3 Confirm & Persist Video Asset: POST /api/admin/media/confirm-video
// Persists verified direct-uploaded video to wah_media and syncs with entity
// =========================================================================
router.post('/confirm-video', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      publicId,
      secureUrl,
      url,
      entityType = 'heritage-place',
      entityId,
      entitySlug,
      filename,
      duration,
      format,
      bytes,
      width,
      height,
      alt,
      caption
    } = req.body || {};

    if (!publicId || (!secureUrl && !url)) {
      return res.status(400).json({
        success: false,
        error: 'بيانات الفيديو غير مكتملة (المعرف والرابط السحابي مطلوبان)',
        code: 'MISSING_FIELDS'
      });
    }

    const media = await confirmAdminVideo({
      publicId,
      secureUrl: secureUrl || url,
      url: url || secureUrl,
      entityType,
      entityId,
      entitySlug,
      filename,
      duration,
      format,
      bytes,
      width,
      height,
      alt,
      caption,
      user: {
        id: req.user!.id,
        role: req.user!.role,
        name: req.user!.name
      }
    });

    return res.status(201).json({
      success: true,
      message: 'تم حفظ وتوثيق مقطع الفيديو بنجاح',
      data: media
    });
  } catch (err: any) {
    Logger.error('[AdminMedia] Confirm video error:', err?.message || err);
    return res.status(400).json({
      success: false,
      error: err?.message || 'فشل في توثيق مقطع الفيديو في قاعدة البيانات',
      code: 'CONFIRM_FAILED'
    });
  }
});

// =========================================================================
// 2. POST /api/admin/media/url - Save External Safe Image URL
// =========================================================================
router.post('/url', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { url, entitySlug = '', entityId = '', alt = '', caption = '', isPrimary, addToGallery, resourceType } = req.body;

    const rawEntityType = req.body.entityType ? String(req.body.entityType).trim() : 'general';
    if (!isValidWahEntityType(rawEntityType)) {
      return res.status(400).json({
        success: false,
        error: `نوع الكيان "${req.body.entityType}" غير صالح أو غير معتمد في بنية مجلدات WAH السحابية`,
        code: 'UNKNOWN_ENTITY_TYPE'
      });
    }
    const entityType = rawEntityType;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال رابط وسيط صالح',
        code: 'INVALID_URL'
      });
    }

    const media = await saveExternalUrlMedia({
      url,
      entityType,
      entitySlug,
      entityId,
      alt,
      caption,
      isPrimary: Boolean(isPrimary),
      addToGallery: Boolean(addToGallery),
      resourceType: resourceType === 'video' || resourceType === 'image' ? resourceType : undefined,
      user: {
        id: req.user!.id,
        role: req.user!.role
      }
    });

    return res.status(201).json({
      success: true,
      message: 'تم تسجيل رابط الوسيط بنجاح',
      data: media
    });
  } catch (error: any) {
    Logger.error('[AdminMedia] URL save error:', error?.message || error);
    return res.status(400).json({
      success: false,
      error: error?.message || 'فشل في حفظ رابط الصورة',
      code: 'URL_SAVE_FAILED'
    });
  }
});

// =========================================================================
// 3. POST /api/admin/media/replace/:id or /:id/replace - Replace existing media
// =========================================================================
router.post(['/replace/:id', '/:id/replace'], (req: AuthenticatedRequest, res: Response, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    upload.single('file')(req, res, next);
  } else {
    next();
  }
}, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const mediaId = req.params.id;
    const file = req.file;
    const body = req.body || {};

    let buffer: Buffer | string;
    let filename = file?.originalname || body.filename || 'replacement_image';
    let mimeType = file?.mimetype || body.mimeType || 'image/jpeg';

    if (file && file.buffer) {
      buffer = file.buffer;
    } else if (body.data || body.fileData || body.base64) {
      buffer = body.data || body.fileData || body.base64;
    } else {
      return res.status(400).json({
        success: false,
        error: 'لم يتم تزويد الصورة البديلة',
        code: 'NO_FILE_PROVIDED'
      });
    }

    const updated = await replaceAdminMedia({
      mediaId,
      data: buffer,
      filename,
      mimeType,
      alt: body.alt,
      caption: body.caption,
      user: {
        id: req.user!.id,
        role: req.user!.role
      }
    });

    return res.json({
      success: true,
      message: 'تم استبدال الصورة بنجاح',
      data: updated
    });
  } catch (error: any) {
    Logger.error('[AdminMedia] Replace error:', error?.message || error);
    return res.status(400).json({
      success: false,
      error: error?.message || 'فشل استبدال الصورة',
      code: 'REPLACE_FAILED'
    });
  }
});

// =========================================================================
// 4. PATCH /api/admin/media/:id - Update Media Metadata
// =========================================================================
router.patch('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const mediaId = req.params.id;
    const { alt, caption, isPrimary } = req.body;

    const updated = await updateAdminMediaMetadata(
      mediaId,
      { alt, caption, isPrimary },
      { id: req.user!.id, role: req.user!.role }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'سجل الصورة غير موجود',
        code: 'NOT_FOUND'
      });
    }

    return res.json({
      success: true,
      message: 'تم تحديث بيانات الصورة بنجاح',
      data: updated
    });
  } catch (error: any) {
    Logger.error('[AdminMedia] Metadata update error:', error?.message || error);
    return res.status(400).json({
      success: false,
      error: error?.message || 'فشل تحديث بيانات الصورة',
      code: 'UPDATE_FAILED'
    });
  }
});

// =========================================================================
// 5. DELETE /api/admin/media/:id & POST /api/admin/media/delete
// =========================================================================
router.post('/delete', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const mediaId = req.body.mediaId || req.body.id || req.body.publicId || req.body.url;
    if (!mediaId) {
      return res.status(400).json({ success: false, error: 'معرف أو رابط الصورة مطلوب للحذف' });
    }

    await deleteAdminMedia(mediaId, {
      id: req.user!.id,
      role: req.user!.role
    });

    return res.json({
      success: true,
      message: 'تم حذف الصورة من التخزين السحابي وقاعدة البيانات بنجاح'
    });
  } catch (error: any) {
    Logger.error('[AdminMedia] POST deletion error:', error?.message || error);
    return res.status(400).json({
      success: false,
      error: error?.message || 'فشل حذف الصورة',
      code: 'DELETE_FAILED'
    });
  }
});

router.delete(['/:id', '/:id(*)'], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const mediaId = req.params.id || (req.params as any)[0] || (req.query.id as string);
    if (!mediaId) {
      return res.status(400).json({ success: false, error: 'معرف الصورة مطلوب' });
    }

    await deleteAdminMedia(mediaId, {
      id: req.user!.id,
      role: req.user!.role
    });

    return res.json({
      success: true,
      message: 'تم حذف الصورة من التخزين السحابي وقاعدة البيانات بنجاح'
    });
  } catch (error: any) {
    Logger.error('[AdminMedia] Deletion error:', error?.message || error);
    return res.status(400).json({
      success: false,
      error: error?.message || 'فشل حذف الصورة',
      code: 'DELETE_FAILED'
    });
  }
});

// =========================================================================
// 6. GET /api/admin/media - Media Library List with Filters
// =========================================================================
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, entityType, folder, entityId, resourceType, type, page, limit, sort } = req.query;

    const result = await getAdminMediaList({
      search: search as string,
      entityType: entityType as string,
      folder: folder as string,
      entityId: entityId as string,
      resourceType: (resourceType || type) as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 24,
      sort: sort as any
    });

    return res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    Logger.error('[AdminMedia] Media list error:', error?.message || error);
    return res.status(500).json({
      success: false,
      error: 'فشل في جلب قائمة وسائط المنصة',
      code: 'FETCH_FAILED'
    });
  }
});

// =========================================================================
// 7. POST /api/admin/media/:id/primary - Set Media as Primary Cover
// =========================================================================
router.post('/:id/primary', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const mediaId = req.params.id;
    const updated = await setPrimaryAdminMedia(mediaId, {
      id: req.user!.id,
      role: req.user!.role
    });

    return res.json({
      success: true,
      message: 'تم تعيين الصورة كصورة غلاف رئيسية بنجاح',
      data: updated
    });
  } catch (error: any) {
    Logger.error('[AdminMedia] Set primary error:', error?.message || error);
    return res.status(400).json({
      success: false,
      error: error?.message || 'فشل تعيين الصورة كصورة رئيسية',
      code: 'SET_PRIMARY_FAILED'
    });
  }
});

// =========================================================================
// 8. POST /api/admin/media/gallery/reorder - Reorder Gallery Images
// =========================================================================
router.post('/gallery/reorder', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { entityType, entityId, galleryUrls, items } = req.body || {};

    if (Array.isArray(items)) {
      const { db, isMongo } = await getDatabase();
      if (isMongo && db) {
        for (const item of items) {
          if (item.id !== undefined && item.displayOrder !== undefined) {
            await db.collection('wah_media').updateOne(
              buildMediaIdFilter(item.id),
              { $set: { displayOrder: item.displayOrder, updatedAt: new Date().toISOString() } }
            );
          }
        }
      }
      return res.json({
        success: true,
        message: 'تم تحديث ترتيب عناصر المعرض بنجاح'
      });
    }

    if (!entityType || !entityId || !Array.isArray(galleryUrls)) {
      return res.status(400).json({
        success: false,
        error: 'يرجى تزويد نوع الكيان ومعرفه ومصفوفة روابط المعرض بالترتيب الجديد',
        code: 'INVALID_GALLERY_PAYLOAD'
      });
    }

    const result = await reorderGalleryMedia({
      entityType,
      entityId,
      galleryUrls,
      user: {
        id: req.user!.id,
        role: req.user!.role
      }
    });

    return res.json({
      success: true,
      message: 'تم تحديث ترتيب صور المعرض بنجاح',
      data: result
    });
  } catch (error: any) {
    Logger.error('[AdminMedia] Reorder gallery error:', error?.message || error);
    return res.status(400).json({
      success: false,
      error: error?.message || 'فشل إعادة ترتيب صور المعرض',
      code: 'REORDER_FAILED'
    });
  }
});

// =========================================================================
// 8.1 POST /api/admin/media/gallery/manage - Add, Remove, Set Cover, Update Gallery
// =========================================================================
router.post('/gallery/manage', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { entityType, entityId, entitySlug, action, imageUrl, videoUrl, galleryUrls, coverImage } = req.body || {};

    const targetId = entityId || entitySlug;
    if (!entityType || !targetId || !action) {
      return res.status(400).json({
        success: false,
        error: 'يرجى تزويد نوع الكيان، ومعرفه، والإجراء المطلوب (add, remove, setCover, updateGallery, setVideo, removeVideo)',
        code: 'MISSING_FIELDS'
      });
    }

    const result = await manageEntityGallery({
      entityType,
      entityId: targetId,
      entitySlug: entitySlug || entityId,
      action,
      imageUrl,
      videoUrl,
      galleryUrls,
      coverImage,
      user: {
        id: req.user!.id,
        role: req.user!.role
      }
    });

    return res.json(result);
  } catch (error: any) {
    Logger.error('[AdminMedia] Manage gallery error:', error?.message || error);
    return res.status(400).json({
      success: false,
      error: error?.message || 'فشل تعديل معرض صور المكان',
      code: 'GALLERY_MANAGE_FAILED'
    });
  }
});

// =========================================================================
// 9. PATCH /api/admin/media/:id/reassign - Reassign Media to Another Entity
// =========================================================================
router.patch('/:id/reassign', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const mediaId = req.params.id;
    const { targetEntityType, targetEntityId, targetEntitySlug } = req.body;

    if (!targetEntityType || typeof targetEntityType !== 'string' || !isValidWahEntityType(targetEntityType)) {
      return res.status(400).json({
        success: false,
        error: `نوع الكيان المستهدف "${targetEntityType || ''}" غير صالح أو غير معتمد في بنية مجلدات WAH السحابية`,
        code: 'UNKNOWN_ENTITY_TYPE'
      });
    }

    const updated = await reassignMediaEntity({
      mediaId,
      targetEntityType,
      targetEntityId,
      targetEntitySlug,
      user: {
        id: req.user!.id,
        role: req.user!.role
      }
    });

    return res.json({
      success: true,
      message: 'تمت إعادة تعيين الصورة إلى الكيان الجديد بنجاح',
      data: updated
    });
  } catch (error: any) {
    Logger.error('[AdminMedia] Reassign error:', error?.message || error);
    return res.status(400).json({
      success: false,
      error: error?.message || 'فشل إعادة تعيين الصورة',
      code: 'REASSIGN_FAILED'
    });
  }
});

export default router;

import express from 'express';
import type { Response } from 'express';
import multer from 'multer';
import { requireAdmin } from '../middleware/auth.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import {
  uploadAdminMedia,
  replaceAdminMedia,
  deleteAdminMedia,
  updateAdminMediaMetadata,
  getAdminMediaList,
  saveExternalUrlMedia
} from '../services/mediaService.ts';
import { Logger } from '../utils/logger.ts';

const router = express.Router();

// Enforce Admin authorization across all media endpoints
router.use(requireAdmin);

// Configure Multer for in-memory file streaming with strict limits
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max image size
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('صيغة الملف غير مدعومة. الصيغ المدعومة هي: JPEG, PNG, WEBP'));
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
            error: 'حجم الصورة يتجاوز الحد المسموح (10 ميجابايت)',
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
          error: err.message || 'فشل في قراءة ملف الصورة',
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

    if (file && file.buffer) {
      buffer = file.buffer;
    } else if (body.data || body.fileData || body.base64) {
      buffer = body.data || body.fileData || body.base64;
    } else {
      return res.status(400).json({
        success: false,
        error: 'لم يتم إرسال أي ملف صورة أو بيانات Base64',
        code: 'NO_FILE_PROVIDED'
      });
    }

    const entityType = body.entityType || 'general';
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
      message: 'تم رفع الصورة وتوثيقها بنجاح',
      data: media
    });
  } catch (error: any) {
    Logger.error('[AdminMedia] Upload error:', error?.message || error);
    return res.status(400).json({
      success: false,
      error: error?.message || 'فشل في رفع الصورة',
      code: 'UPLOAD_FAILED'
    });
  }
});

// =========================================================================
// 2. POST /api/admin/media/url - Save External Safe Image URL
// =========================================================================
router.post('/url', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { url, entityType = 'general', entitySlug = '', entityId = '', alt = '', caption = '', isPrimary, addToGallery } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال رابط صورة صالح',
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
      user: {
        id: req.user!.id,
        role: req.user!.role
      }
    });

    return res.status(201).json({
      success: true,
      message: 'تم تسجيل رابط الصورة بنجاح',
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
// 3. POST /api/admin/media/replace/:id - Replace existing media
// =========================================================================
router.post('/replace/:id', (req: AuthenticatedRequest, res: Response, next) => {
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
// 5. DELETE /api/admin/media/:id - Delete Media from Cloudinary & DB
// =========================================================================
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const mediaId = req.params.id;

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
    const { search, entityType, folder, entityId, page, limit, sort } = req.query;

    const result = await getAdminMediaList({
      search: search as string,
      entityType: entityType as string,
      folder: folder as string,
      entityId: entityId as string,
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

export default router;

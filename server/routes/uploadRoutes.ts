import express from 'express';
import type { Response } from 'express';
import { requireAuth } from '../middleware/auth.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import { storageService } from '../services/storage/storageProvider.ts';
import { uploadLimiter } from '../middleware/rateLimiter.ts';
import { getDatabase, memoryDb } from '../db/mongodb.ts';

const router = express.Router();

const MAX_PRODUCT_IMAGES = 5;

// POST /api/upload - Upload single or multiple images to Cloudinary
router.post('/', uploadLimiter, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uploadedResults: any[] = [];
  try {
    const { image, images, folder = 'products', filename, mimeType, productId } = req.body;

    if (!image && (!images || !Array.isArray(images) || images.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'اختار الصورة اللي عايز ترفعها الأول',
        code: 'VALIDATION_ERROR'
      });
    }

    // 1. Role & Approval Security Checks
    if (folder === 'products') {
      if (req.user!.role !== 'seller' && req.user!.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'رفع صور المنتجات مخصص لأصحاب الورش والبائعين المعتمدين بس',
          code: 'FORBIDDEN_SELLER_ONLY'
        });
      }

      if (req.user!.role === 'seller') {
        // Enforce approved seller status strictly from server context or database
        let sellerStatus = req.user!.sellerStatus;
        if (!sellerStatus) {
          const { db, isMongo } = await getDatabase();
          const sellerId = req.user!.sellerId || req.user!.id;
          if (isMongo && db) {
            const sellerDoc = await db.collection('sellers').findOne({
              $or: [{ id: sellerId }, { userId: req.user!.id }]
            });
            sellerStatus = sellerDoc?.status;
          }
        }

        if (sellerStatus !== 'approved') {
          return res.status(403).json({
            success: false,
            error: 'حساب ورشتك لسه بيتراجع، مش هتقدر ترفع صور منتجات لحد ما الحساب يعتمد',
            code: 'SELLER_NOT_APPROVED'
          });
        }
      }
    }

    // 2. Server-Determined Ownership (never trust client-supplied ownerId)
    const ownerId = req.user!.role === 'seller' ? (req.user!.sellerId || req.user!.id) : req.user!.id;

    // 3. Product ID Resolution for Cloudinary Folder: WAH/products/{productId}/
    let targetProductId = productId;
    if (!targetProductId) {
      targetProductId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    } else {
      // If editing existing product, verify seller ownership
      if (req.user!.role === 'seller') {
        const { db, isMongo } = await getDatabase();
        let existingProd: any = null;
        if (isMongo && db) {
          existingProd = await db.collection('products').findOne({ id: targetProductId });
        }
        if (!existingProd) {
          existingProd = memoryDb.products.find((p) => p.id === targetProductId);
        }
        if (existingProd && existingProd.sellerId !== ownerId) {
          return res.status(403).json({
            success: false,
            error: 'معندكش صلاحية ترفع صور لمنتج يخص ورشة تانية',
            code: 'OWNERSHIP_VIOLATION'
          });
        }
      }
    }

    // 4. Single Image Upload
    if (image) {
      const result = await storageService.upload({
        data: image,
        filename,
        mimeType,
        folder: folder as any,
        productId: targetProductId,
        ownerId
      });

      return res.status(201).json({
        success: true,
        message: 'الصورة اترفعت واتحفظت بأمان',
        data: {
          ...result,
          productId: targetProductId
        }
      });
    }

    // 5. Batch Image Upload (Enforce limit)
    const imageList = images as string[];
    if (imageList.length > MAX_PRODUCT_IMAGES) {
      return res.status(400).json({
        success: false,
        error: `أكتر حاجة مسموحة لصور المنتج هي ${MAX_PRODUCT_IMAGES} صور بس`,
        code: 'MAX_IMAGES_EXCEEDED'
      });
    }

    // Sequential upload to handle partial failure and cleanup
    for (let i = 0; i < imageList.length; i++) {
      const imgData = imageList[i];
      const result = await storageService.upload({
        data: imgData,
        filename: `image_${i + 1}`,
        folder: folder as any,
        productId: targetProductId,
        ownerId
      });
      uploadedResults.push(result);
    }

    res.status(201).json({
      success: true,
      message: `اترفعت ${uploadedResults.length} صور بنجاح`,
      count: uploadedResults.length,
      productId: targetProductId,
      data: uploadedResults
    });
  } catch (error: any) {
    console.error('[UploadRoutes] Error uploading image:', error?.message || error);

    // Rollback: Clean up any uploaded assets from this batch to avoid orphaned files
    if (uploadedResults.length > 0) {
      console.log(`[UploadRoutes] Rolling back ${uploadedResults.length} uploaded assets after error...`);
      for (const item of uploadedResults) {
        if (item.fileKey) {
          await storageService.delete(item.fileKey).catch(() => { });
        }
      }
    }

    res.status(400).json({
      success: false,
      error: error.message || 'حصلت مشكلة في رفع الصور، جرب تاني',
      code: 'UPLOAD_FAILED'
    });
  }
});

// DELETE /api/upload - Delete an image by file key with ownership authorization
router.delete('/:folder/:key(*)', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const fileKey = `${req.params.folder}/${req.params.key}`;
    const deleted = await storageService.delete(fileKey, req.user);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'الملف ده مش موجود أو اتحذف قبل كده',
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'الصورة اتحذفت بنجاح'
    });
  } catch (error: any) {
    console.error('Error deleting image:', error);
    res.status(403).json({
      success: false,
      error: error.message || 'معرفناش نحذف الصورة، جرب تاني',
      code: 'DELETE_FAILED'
    });
  }
});

export default router;

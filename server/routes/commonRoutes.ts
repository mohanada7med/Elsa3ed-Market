import express from 'express';
import type { Request, Response } from 'express';
import { memoryDb, getDatabase } from '../db/mongodb.ts';
import { validateAndCalculateDiscount } from '../services/discountService.ts';
import { getProductReviews, createProductReview } from '../services/reviewService.ts';
import { getRecommendedProducts } from '../services/recommendationService.ts';
import { requireBuyer } from '../middleware/auth.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';

const router = express.Router();

// GET /api/categories
router.get('/categories', async (req: Request, res: Response) => {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const cats = await db.collection('categories').find({ active: { $ne: false } }).sort({ displayOrder: 1 }).toArray();
      if (cats.length > 0) {
        return res.json({ success: true, data: cats });
      }
    } catch (e) {
      console.error('Error fetching categories from Mongo:', e);
    }
  }
  res.json({ success: true, data: memoryDb.categories });
});

// GET /api/sellers
router.get('/sellers', async (req: Request, res: Response) => {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const sellers = await db.collection('sellers').find({ status: { $ne: 'suspended' } }).toArray();
      return res.json({ success: true, data: sellers });
    } catch (e) {
      console.error('Error fetching sellers from Mongo:', e);
    }
  }
  res.json({ success: true, data: memoryDb.sellers });
});

// GET /api/sellers/:id
router.get('/sellers/:id', async (req: Request, res: Response) => {
  const sellerId = req.params.id;
  const { db, isMongo } = await getDatabase();
  let seller: any = null;

  if (isMongo && db) {
    try {
      seller = await db.collection('sellers').findOne({ id: sellerId });
      if (seller) {
        return res.json({ success: true, data: seller });
      }
      return res.status(404).json({ success: false, error: 'الورشة غير موجودة' });
    } catch (e) {
      console.error('Error fetching seller from Mongo:', e);
    }
  }

  if (!seller) {
    seller = memoryDb.sellers.find((s) => s.id === sellerId);
  }

  if (!seller) {
    return res.status(404).json({ success: false, error: 'الورشة غير موجودة' });
  }

  res.json({ success: true, data: seller });
});

// POST /api/discounts/validate
router.post('/discounts/validate', async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'كود الخصم مطلوب' });
    }
    const result = await validateAndCalculateDiscount(code, Number(subtotal) || 0);
    if (!result.valid) {
      return res.status(400).json({ success: false, error: result.message || 'كود الخصم غير صالح' });
    }
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل في التحقق من كود الخصم' });
  }
});

// GET /api/reviews
router.get('/reviews', async (req: Request, res: Response) => {
  try {
    const productId = req.query.productId as string;
    if (!productId) {
      return res.status(400).json({ success: false, error: 'معرف المنتج مطلوب' });
    }
    const reviews = await getProductReviews(productId);
    res.json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل في جلب التقييمات' });
  }
});

// POST /api/reviews - Buyer only
router.post('/reviews', requireBuyer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId, rating, comment } = req.body;
    const result = await createProductReview(req.user!, { productId, rating, comment });
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'فشل في إضافة التقييم' });
  }
});

// GET /api/recommendations
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const productId = req.query.productId as string;
    const categoryId = req.query.categoryId as string;
    const limit = Number(req.query.limit) || 4;
    const prods = await getRecommendedProducts({ productId, categoryId, limit });
    res.json({ success: true, data: prods });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل في جلب الترشيحات' });
  }
});

export default router;

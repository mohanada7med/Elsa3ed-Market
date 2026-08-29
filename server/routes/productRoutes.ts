import express from 'express';
import type { Request, Response } from 'express';
import { getPublicProducts, getProductById } from '../services/productService.ts';
import { getProductReviews, createProductReview } from '../services/reviewService.ts';
import { requireBuyer } from '../middleware/auth.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';

const router = express.Router();

// GET /api/products - Public query: Returns ONLY approved products
router.get('/', async (req: Request, res: Response) => {
  try {
    const { categoryId, governorate, minPrice, maxPrice, search, sortBy } = req.query;

    const products = await getPublicProducts({
      categoryId: categoryId as string,
      governorate: governorate as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      search: search as string,
      sortBy: sortBy as string
    });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching public products:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب المنتجات من الخادم',
      code: 'SERVER_ERROR'
    });
  }
});

// GET /api/products/:id/reviews - Public product reviews
router.get('/:id/reviews', async (req: Request, res: Response) => {
  try {
    const reviews = await getProductReviews(req.params.id, false);
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب التقييمات',
      code: 'SERVER_ERROR'
    });
  }
});

// POST /api/products/:id/reviews - Buyer submit review with verified purchase verification
router.post('/:id/reviews', requireBuyer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { rating, comment } = req.body;
    const result = await createProductReview(req.user!, {
      productId: req.params.id,
      rating: Number(rating),
      comment: String(comment || '')
    });

    res.status(201).json({
      success: true,
      message: 'تم إضافة تقييمك الموثق بنجاح',
      data: result.review,
      productRating: result.updatedProductRating
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'فشل في حفظ التقييم',
      code: 'REVIEW_ERROR'
    });
  }
});

// GET /api/products/:id - Single product (enforces approval check for non-owners)
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const productId = req.params.id;
    const product = await getProductById(productId, req.user);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'المنتج غير موجود أو غير متاح للعرض العام',
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب تفاصيل المنتج',
      code: 'SERVER_ERROR'
    });
  }
});

export default router;

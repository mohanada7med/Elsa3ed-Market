import { Router, Request, Response } from 'express';
import { getAllCategories, getCategoryById } from '../services/categoryService.ts';

const router = Router();

// GET /api/categories - Public list of active categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.all === 'true';
    const categories = await getAllCategories(includeInactive);
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب تصنيفات المنتجات',
      code: 'SERVER_ERROR'
    });
  }
});

// GET /api/categories/:idOrSlug - Single category details
router.get('/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const category = await getCategoryById(req.params.idOrSlug);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'القسم التراثي غير موجود',
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب تفاصيل القسم',
      code: 'SERVER_ERROR'
    });
  }
});

export default router;

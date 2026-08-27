import { Router, Request, Response } from 'express';
import { getAllCraftStories, getCraftStoryById } from '../services/craftStoryService.ts';

const router = Router();

// GET /api/craft-stories - Public list of active craft stories
router.get('/', async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.all === 'true';
    const stories = await getAllCraftStories(includeInactive);
    res.json({
      success: true,
      count: stories.length,
      data: stories
    });
  } catch (error) {
    console.error('Error fetching craft stories:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب قصص الصنعة وأسرار الأجداد',
      code: 'SERVER_ERROR'
    });
  }
});

// GET /api/craft-stories/:id - Single craft story details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const story = await getCraftStoryById(req.params.id);
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'قصة الصنعة التراثية غير موجودة',
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    console.error('Error fetching craft story:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب تفاصيل قصة الصنعة',
      code: 'SERVER_ERROR'
    });
  }
});

export default router;

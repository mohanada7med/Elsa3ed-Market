import express from 'express';
import type { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { isCloudinaryAvailable } from '../services/storage/cloudinaryProvider.ts';
import { Logger } from '../utils/logger.ts';

const router = express.Router();

export const CURATED_CLOUDINARY_IMAGES = [
  {
    id: 'cloud-qena-pottery-1',
    public_id: 'WAH/crafts/qena-pottery',
    title: 'فخار قنا والجرار النيلية',
    region: 'قنا',
    craft: 'صناعة الفخار التراثي',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788789051/%D9%81%D8%AE%D8%A7%D8%B1%D8%B1%D8%B1%D8%B1.jpg',
    secure_url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788789051/%D9%81%D8%AE%D8%A7%D8%B1%D8%B1%D8%B1%D8%B1.jpg'
  },
  {
    id: 'cloud-qena-pottery-2',
    public_id: 'WAH/crafts/qena-pottery-workshop',
    title: 'ورش القلل القناوي بالصعيد',
    region: 'قنا - المحروسة',
    craft: 'الفخار الصعيدي',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788789133/WAH/crafts/qena-pottery/img_1788789133627_u027.jpg',
    secure_url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788789133/WAH/crafts/qena-pottery/img_1788789133627_u027.jpg'
  },
  {
    id: 'cloud-tally-asyut',
    public_id: 'WAH/crafts/asyut-tally',
    title: 'التلي الأسيوطي وفنون النول',
    region: 'أسيوط',
    craft: 'التطريز بأسلاك الفضة',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788712725/%D8%A7%D9%84%D8%AA%D9%84%D9%89.jpg',
    secure_url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788712725/%D8%A7%D9%84%D8%AA%D9%84%D9%89.jpg'
  },
  {
    id: 'cloud-palm-khous',
    public_id: 'WAH/crafts/khous-palm',
    title: 'الخوص والمشغولات النخيلية',
    region: 'الواحات وقنا',
    craft: 'تضفير سعف النخيل',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788712795/%D8%A7%D9%84%D8%AE%D9%88%D8%B5_%D9%88%D8%A7%D9%84%D9%85%D8%B4%D8%BA%D9%88%D9%84%D8%A7%D8%AA_%D8%A7%D9%84%D9%86%D8%AE%D9%8A%D9%84%D9%8A%D8%A9.jpg',
    secure_url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788712795/%D8%A7%D9%84%D8%AE%D9%88%D8%B5_%D9%88%D8%A7%D9%84%D9%85%D8%B4%D8%BA%D9%88%D9%84%D8%A7%D8%AA_%D8%A7%D9%84%D9%86%D8%AE%D9%8A%D9%84%D9%8A%D8%A9.jpg'
  },
  {
    id: 'cloud-dates-oasis',
    public_id: 'WAH/products/oasis-dates',
    title: 'تمور الواحات وسيوة الصعيدية',
    region: 'الوادي الجديد',
    craft: 'محاصيل صعيدية أصيلة',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788712728/%D8%AA%D9%85%D9%88%D8%B1.jpg',
    secure_url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788712728/%D8%AA%D9%85%D9%88%D8%B1.jpg'
  },
  {
    id: 'cloud-sidr-honey',
    public_id: 'WAH/products/sidr-honey',
    title: 'عسل السدر الصعيدي الجبلي',
    region: 'أسوان وسوهاج',
    craft: 'منتجات طبيعية',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788712728/%D8%B9%D8%B3%D9%84.jpg',
    secure_url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788712728/%D8%B9%D8%B3%D9%84.jpg'
  },
  {
    id: 'cloud-dendera-temple',
    public_id: 'WAH/heritage-places/dendera-temple',
    title: 'معبد دندرة والزخارف الصعيدية',
    region: 'قنا',
    craft: 'نقوش وتراث فرعوني',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788715194/WAH/heritage-places/dendera-temple/img_2330_1788715194855_ea88.jpg',
    secure_url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788715194/WAH/heritage-places/dendera-temple/img_2330_1788715194855_ea88.jpg'
  },
  {
    id: 'cloud-karnak-temples',
    public_id: 'WAH/heritage-places/karnak-temples',
    title: 'معابد الكرنك وأعمدة طيبة',
    region: 'الأقصر',
    craft: 'معالم حضارية خالدة',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788715371/WAH/heritage-places/karnak-temples/img_2332_1788715371753_8g8m.jpg',
    secure_url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788715371/WAH/heritage-places/karnak-temples/img_2332_1788715371753_8g8m.jpg'
  },
  {
    id: 'cloud-aswan-nubia',
    public_id: 'WAH/provinces/aswan',
    title: 'نوبة أسوان وبيوت غرب سهيل',
    region: 'أسوان',
    craft: 'تراث نوبي ملون',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015791/WAH/provinces/aswan/cover.jpg',
    secure_url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015791/WAH/provinces/aswan/cover.jpg'
  },
  {
    id: 'cloud-luxor-heritage',
    public_id: 'WAH/provinces/luxor',
    title: 'طيبة عاصمة الفنون التراثية',
    region: 'الأقصر',
    craft: 'ألاباستر وحفر حجري',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015791/WAH/provinces/luxor/cover.jpg',
    secure_url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015791/WAH/provinces/luxor/cover.jpg'
  },
  {
    id: 'cloud-sohag-weaving',
    public_id: 'WAH/provinces/sohag',
    title: 'أخميم مهد النسيج والحرير',
    region: 'سوهاج',
    craft: 'نسيج أخميم اليدوي',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015790/WAH/provinces/sohag/cover.jpg',
    secure_url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015790/WAH/provinces/sohag/cover.jpg'
  },
  {
    id: 'cloud-asyut-heritage',
    public_id: 'WAH/provinces/asyut',
    title: 'أسيوط قلب الصعيد النابض',
    region: 'أسيوط',
    craft: 'تطريز ونحاس وخشب',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015789/WAH/provinces/asyut/cover.jpg',
    secure_url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015789/WAH/provinces/asyut/cover.jpg'
  }
];

// GET /api/cloudinary/images or GET /cloudinary/images
router.get('/images', async (req: Request, res: Response) => {
  try {
    if (isCloudinaryAvailable()) {
      try {
        const result = await cloudinary.api.resources({
          type: 'upload',
          prefix: 'WAH',
          max_results: 40,
          resource_type: 'image'
        });

        if (result && Array.isArray(result.resources) && result.resources.length > 0) {
          const liveImages = result.resources.map((r: any, idx: number) => ({
            id: `cloud-live-${idx}`,
            public_id: r.public_id,
            title: r.public_id.split('/').pop() || `صورة سحابية ${idx + 1}`,
            region: 'ورشة معتمدة',
            craft: 'تراث صعيدي أصيل',
            url: r.secure_url || r.url,
            secure_url: r.secure_url || r.url
          }));

          const merged = [...liveImages];
          for (const curated of CURATED_CLOUDINARY_IMAGES) {
            if (!merged.some((m) => m.url === curated.url)) {
              merged.push(curated);
            }
          }

          return res.json({
            success: true,
            count: merged.length,
            images: merged
          });
        }
      } catch (cloudErr: any) {
        Logger.info('[Cloudinary] Admin API resources query failed; serving curated heritage library:', cloudErr?.message || cloudErr);
      }
    }

    return res.json({
      success: true,
      count: CURATED_CLOUDINARY_IMAGES.length,
      images: CURATED_CLOUDINARY_IMAGES
    });
  } catch (error: any) {
    Logger.error('[Cloudinary] Handler error:', error);
    return res.json({
      success: true,
      count: CURATED_CLOUDINARY_IMAGES.length,
      images: CURATED_CLOUDINARY_IMAGES
    });
  }
});

export default router;

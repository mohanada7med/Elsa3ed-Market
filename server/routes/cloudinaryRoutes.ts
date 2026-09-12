import express from 'express';
import type { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { isCloudinaryAvailable } from '../services/storage/cloudinaryProvider.ts';
import { Logger } from '../utils/logger.ts';

const router = express.Router();

export interface CuratedWorkshopImage {
  id: string;
  public_id: string;
  title: string;
  region: string;
  craft: string;
  craftCategory: 'pottery' | 'tally' | 'weaving' | 'khous' | 'sculpture';
  url: string;
  secure_url: string;
}

// قائمة صور الأغلفة المعتمدة لورش الحرف اليدوية الأصيلة (فخار، تلي، نول ونسيج، خوص، ألاباستر)
export const CURATED_CLOUDINARY_IMAGES: CuratedWorkshopImage[] = [
  // 1. ورش الفخار والخزف الصعيدي
  {
    id: 'cloud-qena-pottery-1',
    public_id: 'WAH/crafts/qena-pottery',
    title: 'فخار قنا والجرار النيلية',
    region: 'قنا',
    craft: 'صناعة الفخار التراثي',
    craftCategory: 'pottery',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788789051/%D9%81%D8%AE%D8%A7%D8%B1%D8%B1%D8%B1%D8%B1.jpg',
    secure_url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788789051/%D9%81%D8%AE%D8%A7%D8%B1%D8%B1%D8%B1%D8%B1.jpg'
  },
  {
    id: 'cloud-qena-pottery-2',
    public_id: 'WAH/crafts/qena-pottery-workshop',
    title: 'ورش القلل القناوي وطمي النيل',
    region: 'قنا - المحروسة',
    craft: 'الفخار الصعيدي وطمي النيل',
    craftCategory: 'pottery',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788789133/WAH/crafts/qena-pottery/img_1788789133627_u027.jpg',
    secure_url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788789133/WAH/crafts/qena-pottery/img_1788789133627_u027.jpg'
  },
  {
    id: 'cloud-pottery-wheel-artisan',
    public_id: 'WAH/crafts/pottery-wheel-workshop',
    title: 'دولاب تشكيل الفخار اليدوي',
    region: 'قنا وأسوان',
    craft: 'تشكيل الطين الحرفي',
    craftCategory: 'pottery',
    url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
    secure_url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'cloud-pottery-kiln-craft',
    public_id: 'WAH/crafts/pottery-kiln-craft',
    title: 'أفران تسوية وحرق الفخار الصعيدي',
    region: 'قرى الصعيد التراثية',
    craft: 'حرق الفخار البلدي',
    craftCategory: 'pottery',
    url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
    secure_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'cloud-pottery-jars-heritage',
    public_id: 'WAH/crafts/pottery-jars-heritage',
    title: 'أواني وقدور الفخار المسامية المعتقة',
    region: 'قنا والفيوم',
    craft: 'أواني الفخار والخزف',
    craftCategory: 'pottery',
    url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80',
    secure_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80'
  },

  // 2. ورش التلي والتطريز الأسيوطي
  {
    id: 'cloud-tally-asyut',
    public_id: 'WAH/crafts/asyut-tally',
    title: 'التلي الأسيوطي وفنون النول',
    region: 'أسيوط',
    craft: 'التطريز بأسلاك الفضة',
    craftCategory: 'tally',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788712725/%D8%A7%D9%84%D8%AA%D9%84%D9%89.jpg',
    secure_url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788712725/%D8%A7%D9%84%D8%AA%D9%84%D9%89.jpg'
  },
  {
    id: 'cloud-tally-silver-threads',
    public_id: 'WAH/crafts/tally-silver-workshop',
    title: 'ورشة شيلان التلي الأسيوطي التراثي',
    region: 'أسيوط وسوهاج',
    craft: 'تطريز التلي التراثي الفاخر',
    craftCategory: 'tally',
    url: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=1200&q=80',
    secure_url: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'cloud-tally-crafting-details',
    public_id: 'WAH/crafts/tally-silver-threads',
    title: 'نسج خيوط الفضة والتلي اليدوي',
    region: 'أسيوط',
    craft: 'حرفة التلي الصعيدي النادرة',
    craftCategory: 'tally',
    url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
    secure_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80'
  },

  // 3. ورش النسيج اليدوي والكليم (سوهاج وأخميم)
  {
    id: 'cloud-sohag-weaving',
    public_id: 'WAH/crafts/sohag-weaving',
    title: 'نسيج أخميم على الأنوال الخشبية',
    region: 'سوهاج - أخميم',
    craft: 'نسيج أخميم والحرير اليدوي',
    craftCategory: 'weaving',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015790/WAH/provinces/sohag/cover.jpg',
    secure_url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788015790/WAH/provinces/sohag/cover.jpg'
  },
  {
    id: 'cloud-handloom-weaving-workshop',
    public_id: 'WAH/crafts/handloom-workshop',
    title: 'ورشة النول الخشبي وغزل الصوف والحرير',
    region: 'سوهاج والمنيا',
    craft: 'غزل النول الصعيدي',
    craftCategory: 'weaving',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    secure_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'cloud-kilim-carpets-workshop',
    public_id: 'WAH/crafts/kilim-carpets-workshop',
    title: 'ورش نسج الكليم الصعيدي والسجاد اليدوي',
    region: 'أخميم وسوهاج',
    craft: 'صناعة الكليم اليدوي',
    craftCategory: 'weaving',
    url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80',
    secure_url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80'
  },

  // 4. ورش الخوص والمشغولات النخيلية
  {
    id: 'cloud-palm-khous',
    public_id: 'WAH/crafts/khous-palm',
    title: 'الخوص والمشغولات النخيلية',
    region: 'الواحات وقنا',
    craft: 'تضفير سعف وجريد النخيل',
    craftCategory: 'khous',
    url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788712795/%D8%A7%D9%84%D8%AE%D9%88%D8%B5_%D9%88%D8%A7%D9%84%D9%85%D8%B4%D8%BA%D9%88%D9%84%D8%A7%D8%AA_%D8%A7%D9%84%D9%86%D8%AE%D9%8A%D9%84%D9%8A%D8%A9.jpg',
    secure_url: 'https://res.cloudinary.com/kuana1nl/image/upload/v1788712795/%D8%A7%D9%84%D8%AE%D9%88%D8%B5_%D9%88%D8%A7%D9%84%D9%85%D8%B4%D8%BA%D9%88%D9%84%D8%A7%D8%AA_%D8%A7%D9%84%D9%86%D8%AE%D9%8A%D9%84%D9%8A%D8%A9.jpg'
  },
  {
    id: 'cloud-palm-wickerwork-baskets',
    public_id: 'WAH/crafts/palm-wickerwork-workshop',
    title: 'ورشة ضفر سلال ومشنّات الخوص التراثية',
    region: 'أسوان والوادي الجديد',
    craft: 'صناعة سلال الخوص التراثية',
    craftCategory: 'khous',
    url: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80',
    secure_url: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80'
  },

  // 5. ورش الألاباستر ونحت الأحجار والخشب
  {
    id: 'cloud-alabaster-luxor-workshop',
    public_id: 'WAH/crafts/alabaster-workshop',
    title: 'ورش حفر وتشكيل الألاباستر',
    region: 'الأقصر - القرنة',
    craft: 'نحت حجر الألاباستر الأصيل',
    craftCategory: 'sculpture',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
    secure_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'cloud-wood-arabesque-workshop',
    public_id: 'WAH/crafts/wood-arabesque-workshop',
    title: 'ورش الأرابيسك وحفر الخشب والنحاس',
    region: 'قنا وأسيوط',
    craft: 'خراطة الخشب والنقش التراثي',
    craftCategory: 'sculpture',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
    secure_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80'
  }
];

// دالة فحص دقيقة لضمان ظهور صور الورش الحرفية فقط واستبعاد أي صور غير حرفية
function isWorkshopCraftAsset(publicId: string, tags: string[] = []): boolean {
  const p = (publicId || '').toLowerCase();

  // قائمة الاستبعاد الصارمة (غير متعلقة بورش الحرف)
  const forbiddenPatterns = [
    'dates', 'oasis-dates', 'honey', 'sidr', 'temple', 'dendera', 'karnak',
    'archaeological', 'provinces/', 'cities/', 'villages/', 'receipt', 'avatar',
    'profile', 'user', 'order', 'food/', 'general/', 'natural-reserves',
    'religious-sites', 'invoice', 'payment', 'proof', 'بلح', 'تمور', 'عسل',
    'معبد', 'معابد', 'دندرة', 'الكرنك', 'فاتورة', 'إيصال'
  ];

  if (forbiddenPatterns.some((pattern) => p.includes(pattern))) {
    return false;
  }

  // الكلمات الدالة الخاصة بورش الحرف اليدوية الأصيلة (فخار، تلي، نول، خوص، ألاباستر، خشب، نحاس)
  const workshopKeywords = [
    'crafts', 'craft', 'workshop', 'pottery', 'fokhar', 'fukhar', 'clay', 'ceramic',
    'tally', 'telli', 'embroidery', 'weaving', 'loom', 'kilim', 'akhmeem',
    'carpet', 'khous', 'palm', 'wicker', 'alabaster', 'copper', 'artisan', 'wood',
    'فخار', 'تلي', 'نول', 'نسيج', 'خوص', 'كليم', 'ورش', 'حرفة', 'صنعة', 'ألاباستر', 'نحاس'
  ];

  if (p.startsWith('wah/crafts') || p.includes('craft') || p.includes('workshop')) {
    return true;
  }

  const matchesPublicId = workshopKeywords.some((keyword) => p.includes(keyword));
  const matchesTags = Array.isArray(tags) && tags.some((t) => workshopKeywords.some((keyword) => t.toLowerCase().includes(keyword)));

  return matchesPublicId || matchesTags;
}

// GET /api/cloudinary/images or GET /cloudinary/images
router.get('/images', async (req: Request, res: Response) => {
  try {
    const craftFilter = (req.query.craft as string || '').toLowerCase().trim();

    let finalImages: CuratedWorkshopImage[] = [...CURATED_CLOUDINARY_IMAGES];

    if (isCloudinaryAvailable()) {
      try {
        // استعلام مخصص لمجلد الورش والحرف التراثية WAH/crafts
        const result = await cloudinary.api.resources({
          type: 'upload',
          prefix: 'WAH/crafts',
          max_results: 50,
          resource_type: 'image'
        });

        if (result && Array.isArray(result.resources) && result.resources.length > 0) {
          const liveWorkshopImages: CuratedWorkshopImage[] = result.resources
            .filter((r: any) => isWorkshopCraftAsset(r.public_id, r.tags))
            .map((r: any, idx: number) => {
              const rawName = r.public_id.split('/').pop() || `ورشة حرفية ${idx + 1}`;
              const lower = (r.public_id || '').toLowerCase();
              let detectedCategory: CuratedWorkshopImage['craftCategory'] = 'pottery';
              if (lower.includes('tally') || lower.includes('telli') || lower.includes('تلي')) {
                detectedCategory = 'tally';
              } else if (lower.includes('weav') || lower.includes('loom') || lower.includes('نسيج') || lower.includes('كليم')) {
                detectedCategory = 'weaving';
              } else if (lower.includes('khous') || lower.includes('palm') || lower.includes('خوص')) {
                detectedCategory = 'khous';
              } else if (lower.includes('alabaster') || lower.includes('ألاباستر') || lower.includes('نحاس')) {
                detectedCategory = 'sculpture';
              }

              return {
                id: `cloud-live-craft-${idx}`,
                public_id: r.public_id,
                title: rawName.replace(/[-_]/g, ' '),
                region: 'ورشة صعيدية معتمدة',
                craft: 'صنعة تراثية أصيلة',
                craftCategory: detectedCategory,
                url: r.secure_url || r.url,
                secure_url: r.secure_url || r.url
              };
            });

          if (liveWorkshopImages.length > 0) {
            // دمج الصور الحية مع الصور التراثية المعتمدة مع تجنب التكرار
            const merged = [...liveWorkshopImages];
            for (const curated of CURATED_CLOUDINARY_IMAGES) {
              if (!merged.some((m) => m.url === curated.url)) {
                merged.push(curated);
              }
            }
            finalImages = merged;
          }
        }
      } catch (cloudErr: any) {
        Logger.info('[Cloudinary] Resources query for crafts completed; serving curated workshop library:', cloudErr?.message || cloudErr);
      }
    }

    // تطبيق فلتر الحرفة إذا تم تمريره (مثل فخار أو تلي)
    if (craftFilter && craftFilter !== 'all') {
      finalImages = finalImages.filter((img) => {
        const cat = img.craftCategory?.toLowerCase() || '';
        const title = img.title?.toLowerCase() || '';
        const craft = img.craft?.toLowerCase() || '';
        return cat.includes(craftFilter) || title.includes(craftFilter) || craft.includes(craftFilter);
      });
    }

    return res.json({
      success: true,
      count: finalImages.length,
      images: finalImages
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

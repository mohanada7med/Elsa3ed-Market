import { Router, Request, Response } from 'express';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { Logger } from '../utils/logger.ts';
import { requireAdmin } from '../middleware/auth.ts';
import {
  GovernorateDoc,
  HeritagePlaceDoc,
  CulturalCraftDoc,
  WahStoryDoc,
  LocalPersonDoc,
  UpperEgyptFoodDoc,
  CulturalEventDoc
} from '../models/types.ts';

const router = Router();

// ==========================================
// 1. GOVERNORATES (المحافظات)
// ==========================================

router.get('/governorates', async (req: Request, res: Response) => {
  try {
    const { db, isMongo } = await getDatabase();
    let governorates: GovernorateDoc[] = [];

    if (isMongo && db) {
      governorates = await db.collection<GovernorateDoc>('wah_governorates').find({}).toArray();
      if (governorates.length === 0) {
        // Fallback or seed
        governorates = memoryDb.governorates;
      }
    } else {
      governorates = memoryDb.governorates;
    }

    return res.json({ success: true, data: governorates });
  } catch (err: any) {
    Logger.error('Failed to fetch governorates', err);
    return res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب بيانات المحافظات' });
  }
});

router.get('/governorates/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { db, isMongo } = await getDatabase();
    let governorate: GovernorateDoc | null = null;

    if (isMongo && db) {
      governorate = await db.collection<GovernorateDoc>('wah_governorates').findOne({ slug });
    }
    if (!governorate) {
      governorate = memoryDb.governorates.find((g) => g.slug === slug || g.id === slug) || null;
    }

    if (!governorate) {
      return res.status(404).json({ success: false, message: 'المحافظة غير موجودة' });
    }

    // Also fetch related places, crafts, foods, stories, and products for this governorate
    const govId = governorate.id;
    const govName = governorate.name;

    const places = memoryDb.heritagePlaces.filter(
      (p) => p.governorateId === govId || p.governorateName === govName
    );
    const crafts = memoryDb.culturalCrafts.filter(
      (c) => c.governorates.includes(govName) || governorate?.traditionalCraftsIds.includes(c.id)
    );
    const foods = memoryDb.upperEgyptFood.filter(
      (f) => f.governorateId === govId || f.governorateName === govName
    );
    const stories = memoryDb.wahStories.filter(
      (s) => s.governorateId === govId || s.governorateName === govName
    );
    const people = memoryDb.localPeople.filter(
      (p) => p.governorateId === govId || p.governorateName === govName
    );
    const events = memoryDb.culturalEvents.filter(
      (e) => e.governorateId === govId || e.governorateName === govName
    );
    const products = memoryDb.products.filter(
      (p) => p.sellerGovernorate === govName || p.specifications?.originGovernorate === govName
    );

    return res.json({
      success: true,
      data: {
        ...governorate,
        places,
        crafts,
        foods,
        stories,
        people,
        events,
        products
      }
    });
  } catch (err: any) {
    Logger.error('Failed to fetch governorate details', err);
    return res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب تفاصيل المحافظة' });
  }
});

// Admin Update / Create Governorate
router.post('/governorates', requireAdmin, async (req: Request, res: Response) => {
  try {
    const payload: GovernorateDoc = req.body;
    if (!payload.name || !payload.slug) {
      return res.status(400).json({ success: false, message: 'اسم المحافظة والرابط التعريفي مطلوبان' });
    }

    const { db, isMongo } = await getDatabase();
    payload.updatedAt = new Date().toISOString();

    if (isMongo && db) {
      await db.collection('wah_governorates').updateOne(
        { id: payload.id || payload.slug },
        { $set: payload },
        { upsert: true }
      );
    }

    const idx = memoryDb.governorates.findIndex((g) => g.id === payload.id || g.slug === payload.slug);
    if (idx >= 0) {
      memoryDb.governorates[idx] = { ...memoryDb.governorates[idx], ...payload };
    } else {
      memoryDb.governorates.push({ ...payload, id: payload.id || `gov-${Date.now()}` });
    }

    return res.json({ success: true, message: 'تم حفظ بيانات المحافظة بنجاح', data: payload });
  } catch (err: any) {
    Logger.error('Failed to save governorate', err);
    return res.status(500).json({ success: false, message: 'فشل حفظ بيانات المحافظة' });
  }
});

// ==========================================
// 2. HERITAGE PLACES (الأماكن والتراث)
// ==========================================

router.get('/places', async (req: Request, res: Response) => {
  try {
    const { governorate, category } = req.query;
    let list = memoryDb.heritagePlaces;

    if (governorate) {
      list = list.filter((p) => p.governorateName === governorate || p.governorateId === governorate);
    }
    if (category) {
      list = list.filter((p) => p.category === category);
    }

    return res.json({ success: true, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل جلب الأماكن التراثية' });
  }
});

router.get('/places/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const place = memoryDb.heritagePlaces.find((p) => p.slug === slug || p.id === slug);
    if (!place) {
      return res.status(404).json({ success: false, message: 'المعلم التراثي غير موجود' });
    }
    return res.json({ success: true, data: place });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل جلب تفاصيل المعلم' });
  }
});

router.post('/places', requireAdmin, async (req: Request, res: Response) => {
  try {
    const item: HeritagePlaceDoc = req.body;
    item.updatedAt = new Date().toISOString();
    if (!item.id) item.id = `place-${Date.now()}`;

    const idx = memoryDb.heritagePlaces.findIndex((p) => p.id === item.id);
    if (idx >= 0) {
      memoryDb.heritagePlaces[idx] = item;
    } else {
      memoryDb.heritagePlaces.push(item);
    }
    return res.json({ success: true, message: 'تم حفظ المعلم بنجاح', data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل حفظ المعلم التراثي' });
  }
});

// ==========================================
// 3. CULTURAL CRAFTS (الحرف والتراث)
// ==========================================

router.get('/crafts', async (req: Request, res: Response) => {
  try {
    return res.json({ success: true, data: memoryDb.culturalCrafts });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل جلب الحرف التراثية' });
  }
});

router.get('/crafts/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const craft = memoryDb.culturalCrafts.find((c) => c.slug === slug || c.id === slug);
    if (!craft) {
      return res.status(404).json({ success: false, message: 'الحرفة غير موجودة' });
    }

    // Find related products in marketplace
    const relatedProducts = memoryDb.products.filter(
      (p) => (p.categoryName || '').toLowerCase().includes(craft.title.toLowerCase()) || (p.title || '').includes(craft.title)
    );

    return res.json({ success: true, data: { ...craft, relatedProducts } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل جلب بيانات الحرفة' });
  }
});

router.post('/crafts', requireAdmin, async (req: Request, res: Response) => {
  try {
    const item: CulturalCraftDoc = req.body;
    item.updatedAt = new Date().toISOString();
    if (!item.id) item.id = `craft-${Date.now()}`;

    const idx = memoryDb.culturalCrafts.findIndex((c) => c.id === item.id);
    if (idx >= 0) {
      memoryDb.culturalCrafts[idx] = item;
    } else {
      memoryDb.culturalCrafts.push(item);
    }
    return res.json({ success: true, message: 'تم حفظ الحرفة بنجاح', data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل حفظ الحرفة' });
  }
});

// ==========================================
// 4. WAH STORIES (وه بيحكي)
// ==========================================

router.get('/stories', async (req: Request, res: Response) => {
  try {
    const { governorate, category } = req.query;
    let list = memoryDb.wahStories;

    if (governorate) {
      list = list.filter((s) => s.governorateName === governorate || s.governorateId === governorate);
    }
    if (category) {
      list = list.filter((s) => s.category === category);
    }

    return res.json({ success: true, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل جلب القصص والحكايات' });
  }
});

router.get('/stories/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const story = memoryDb.wahStories.find((s) => s.slug === slug || s.id === slug);
    if (!story) {
      return res.status(404).json({ success: false, message: 'القصة غير موجودة' });
    }
    return res.json({ success: true, data: story });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل جلب تفاصيل القصة' });
  }
});

router.post('/stories', requireAdmin, async (req: Request, res: Response) => {
  try {
    const item: WahStoryDoc = req.body;
    item.updatedAt = new Date().toISOString();
    if (!item.id) item.id = `story-${Date.now()}`;

    const idx = memoryDb.wahStories.findIndex((s) => s.id === item.id);
    if (idx >= 0) {
      memoryDb.wahStories[idx] = item;
    } else {
      memoryDb.wahStories.push(item);
    }
    return res.json({ success: true, message: 'تم حفظ القصة بنجاح', data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل حفظ القصة' });
  }
});

// ==========================================
// 5. LOCAL PEOPLE (ناس الصعيد)
// ==========================================

router.get('/people', async (req: Request, res: Response) => {
  try {
    return res.json({ success: true, data: memoryDb.localPeople });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل جلب شخصيات الصعيد' });
  }
});

router.get('/people/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const person = memoryDb.localPeople.find((p) => p.slug === slug || p.id === slug);
    if (!person) {
      return res.status(404).json({ success: false, message: 'الشخصية غير موجودة' });
    }
    return res.json({ success: true, data: person });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل جلب بيانات الشخصية' });
  }
});

router.post('/people', requireAdmin, async (req: Request, res: Response) => {
  try {
    const item: LocalPersonDoc = req.body;
    item.updatedAt = new Date().toISOString();
    if (!item.id) item.id = `person-${Date.now()}`;

    const idx = memoryDb.localPeople.findIndex((p) => p.id === item.id);
    if (idx >= 0) {
      memoryDb.localPeople[idx] = item;
    } else {
      memoryDb.localPeople.push(item);
    }
    return res.json({ success: true, message: 'تم حفظ بيانات الشخصية بنجاح', data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل حفظ الشخصية' });
  }
});

// ==========================================
// 6. UPPER EGYPT FOOD (أكل الصعيد)
// ==========================================

router.get('/food', async (req: Request, res: Response) => {
  try {
    return res.json({ success: true, data: memoryDb.upperEgyptFood });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل جلب أكلات الصعيد' });
  }
});

router.get('/food/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const food = memoryDb.upperEgyptFood.find((f) => f.slug === slug || f.id === slug);
    if (!food) {
      return res.status(404).json({ success: false, message: 'الوصفة غير موجودة' });
    }
    return res.json({ success: true, data: food });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل جلب تفاصيل الوصفة' });
  }
});

router.post('/food', requireAdmin, async (req: Request, res: Response) => {
  try {
    const item: UpperEgyptFoodDoc = req.body;
    item.updatedAt = new Date().toISOString();
    if (!item.id) item.id = `food-${Date.now()}`;

    const idx = memoryDb.upperEgyptFood.findIndex((f) => f.id === item.id);
    if (idx >= 0) {
      memoryDb.upperEgyptFood[idx] = item;
    } else {
      memoryDb.upperEgyptFood.push(item);
    }
    return res.json({ success: true, message: 'تم حفظ بيانات الوصفة بنجاح', data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل حفظ الوصفة' });
  }
});

// ==========================================
// 7. CULTURAL EVENTS (فعاليات الصعيد)
// ==========================================

router.get('/events', async (req: Request, res: Response) => {
  try {
    return res.json({ success: true, data: memoryDb.culturalEvents });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل جلب فعاليات الصعيد' });
  }
});

router.get('/events/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const event = memoryDb.culturalEvents.find((e) => e.slug === slug || e.id === slug);
    if (!event) {
      return res.status(404).json({ success: false, message: 'الفعالية غير موجودة' });
    }
    return res.json({ success: true, data: event });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل جلب تفاصيل الفعالية' });
  }
});

router.post('/events', requireAdmin, async (req: Request, res: Response) => {
  try {
    const item: CulturalEventDoc = req.body;
    item.updatedAt = new Date().toISOString();
    if (!item.id) item.id = `event-${Date.now()}`;

    const idx = memoryDb.culturalEvents.findIndex((e) => e.id === item.id);
    if (idx >= 0) {
      memoryDb.culturalEvents[idx] = item;
    } else {
      memoryDb.culturalEvents.push(item);
    }
    return res.json({ success: true, message: 'تم حفظ الفعالية بنجاح', data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل حفظ الفعالية' });
  }
});

// ==========================================
// 8. INTERACTIVE MAP DATA (خريطة الصعيد التفاعلية)
// ==========================================

router.get('/map', async (req: Request, res: Response) => {
  try {
    const mapData = memoryDb.governorates.map((gov) => {
      const placesCount = memoryDb.heritagePlaces.filter(
        (p) => p.governorateId === gov.id || p.governorateName === gov.name
      ).length;
      const craftsCount = memoryDb.culturalCrafts.filter((c) =>
        c.governorates.includes(gov.name)
      ).length;
      const storiesCount = memoryDb.wahStories.filter(
        (s) => s.governorateId === gov.id || s.governorateName === gov.name
      ).length;
      const foodsCount = memoryDb.upperEgyptFood.filter(
        (f) => f.governorateId === gov.id || f.governorateName === gov.name
      ).length;
      const eventsCount = memoryDb.culturalEvents.filter(
        (e) => e.governorateId === gov.id || e.governorateName === gov.name
      ).length;
      const productsCount = memoryDb.products.filter(
        (p) => p.sellerGovernorate === gov.name || p.specifications?.originGovernorate === gov.name
      ).length;

      return {
        id: gov.id,
        name: gov.name,
        slug: gov.slug,
        shortIntro: gov.shortIntro,
        coverImage: gov.coverImage,
        famousFor: gov.famousFor,
        coordinates: gov.mapCoordinates || { lat: 26.0, lng: 32.0 },
        stats: {
          placesCount,
          craftsCount,
          storiesCount,
          foodsCount,
          eventsCount,
          productsCount
        }
      };
    });

    return res.json({ success: true, data: mapData });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل جلب بيانات الخريطة' });
  }
});

// ==========================================
// 9. UNIFIED GLOBAL SEARCH (البحث الشامل)
// ==========================================

router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || '').trim().toLowerCase();
    if (!query || query.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const results: any[] = [];

    // Search Governorates
    memoryDb.governorates.forEach((g) => {
      if (
        g.name.toLowerCase().includes(query) ||
        g.shortIntro.toLowerCase().includes(query) ||
        g.famousFor.some((f) => f.toLowerCase().includes(query))
      ) {
        results.push({
          id: g.id,
          title: g.name,
          type: 'governorate',
          typeLabel: 'محافظة',
          subtitle: g.shortIntro,
          coverImage: g.coverImage,
          url: `/governorates/${g.slug}`,
          slug: g.slug
        });
      }
    });

    // Search Places
    memoryDb.heritagePlaces.forEach((p) => {
      if (
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.governorateName.toLowerCase().includes(query)
      ) {
        results.push({
          id: p.id,
          title: p.title,
          type: 'place',
          typeLabel: 'معلم وتراث',
          subtitle: `${p.governorateName} — ${p.locationName}`,
          coverImage: p.coverImage,
          url: `/places/${p.slug}`,
          slug: p.slug
        });
      }
    });

    // Search Crafts
    memoryDb.culturalCrafts.forEach((c) => {
      if (
        c.title.toLowerCase().includes(query) ||
        c.shortDescription.toLowerCase().includes(query) ||
        c.governorates.some((gov) => gov.toLowerCase().includes(query))
      ) {
        results.push({
          id: c.id,
          title: c.title,
          type: 'craft',
          typeLabel: 'حرفة تراثية',
          subtitle: `تشتهر بها: ${c.governorates.join('، ')}`,
          coverImage: c.coverImage,
          url: `/crafts/${c.slug}`,
          slug: c.slug
        });
      }
    });

    // Search Stories
    memoryDb.wahStories.forEach((s) => {
      if (
        s.title.toLowerCase().includes(query) ||
        s.excerpt.toLowerCase().includes(query) ||
        s.content.toLowerCase().includes(query)
      ) {
        results.push({
          id: s.id,
          title: s.title,
          type: 'story',
          typeLabel: 'وه بيحكي',
          subtitle: `${s.governorateName} • قراءة ${s.readingTimeMinutes} دقائق`,
          coverImage: s.coverImage,
          url: `/stories/${s.slug}`,
          slug: s.slug
        });
      }
    });

    // Search Food
    memoryDb.upperEgyptFood.forEach((f) => {
      if (
        f.title.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query) ||
        f.ingredients.some((ing) => ing.toLowerCase().includes(query))
      ) {
        results.push({
          id: f.id,
          title: f.title,
          type: 'food',
          typeLabel: 'أكل الصعيد',
          subtitle: `أصل الوصفة: ${f.governorateName}`,
          coverImage: f.coverImage,
          url: `/food/${f.slug}`,
          slug: f.slug
        });
      }
    });

    // Search Products (Market)
    memoryDb.products.forEach((p) => {
      const pTitle = p.title || '';
      const pDesc = p.description || '';
      const pCat = p.categoryName || '';
      const pGov = p.sellerGovernorate || p.specifications?.originGovernorate || '';
      if (
        pTitle.toLowerCase().includes(query) ||
        pDesc.toLowerCase().includes(query) ||
        pCat.toLowerCase().includes(query) ||
        pGov.toLowerCase().includes(query)
      ) {
        results.push({
          id: p.id,
          title: pTitle,
          type: 'product',
          typeLabel: 'سوق وه',
          subtitle: `${p.price} ج.م • صنع في ${pGov || 'الصعيد'}`,
          coverImage: p.images?.[0] || '',
          url: `/products?id=${p.id}`,
          slug: p.id
        });
      }
    });

    return res.json({ success: true, count: results.length, data: results });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل تنفيذ البحث' });
  }
});

// Ecosystem Stats (Admin & Public)
router.get('/stats', async (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      data: {
        governoratesCount: memoryDb.governorates.length,
        placesCount: memoryDb.heritagePlaces.length,
        craftsCount: memoryDb.culturalCrafts.length,
        storiesCount: memoryDb.wahStories.length,
        peopleCount: memoryDb.localPeople.length,
        foodsCount: memoryDb.upperEgyptFood.length,
        eventsCount: memoryDb.culturalEvents.length,
        reelsCount: memoryDb.reels.length,
        productsCount: memoryDb.products.length,
        sellersCount: memoryDb.sellers.length
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'فشل جلب إحصائيات المنصة' });
  }
});

export default router;

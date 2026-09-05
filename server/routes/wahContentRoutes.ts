import express from 'express';
import type { Request, Response } from 'express';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { Logger } from '../utils/logger.ts';
import { requireAdmin } from '../middleware/auth.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import { createAuditLog } from '../services/auditService.ts';
import type {
  GovernorateDoc,
  HeritagePlaceDoc,
  CulturalCraftDoc,
  WahStoryDoc,
  LocalPersonDoc,
  UpperEgyptFoodDoc,
  CulturalEventDoc,
  CityDoc,
  VillageDoc,
  CulturalTraditionDoc,
  PlatformSettingsDoc,
  VerificationStatus
} from '../models/types.ts';

const router = express.Router();

// Helper to ensure MongoDB collection fallback safely
async function getMongoOrMemory() {
  const { db, isMongo } = await getDatabase();
  return { db, isMongo };
}

// ==========================================
// 1. WAH GOVERNORATES (محافظات الصعيد)
// ==========================================

// GET all governorates
router.get('/governorates', async (req: Request, res: Response) => {
  try {
    const { db, isMongo } = await getMongoOrMemory();
    const { status, search } = req.query;

    if (isMongo && db) {
      const query: any = {};
      if (status) query.status = status;
      if (search && typeof search === 'string') {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { shortIntro: { $regex: search, $options: 'i' } },
          { famousFor: { $elemMatch: { $regex: search, $options: 'i' } } }
        ];
      }
      const govs = await db.collection<GovernorateDoc>('wah_governorates').find(query).toArray();
      return res.json({ success: true, count: govs.length, data: govs });
    }

    // In-memory fallback
    let list = memoryDb.governorates;
    if (status) list = list.filter((g) => g.status === status);
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter((g) => g.name.toLowerCase().includes(q) || g.shortIntro.toLowerCase().includes(q));
    }
    return res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    Logger.error('[WAH Content] Error fetching governorates:', err);
    return res.status(500).json({ success: false, error: 'فشل جلب قائمة المحافظات', code: 'SERVER_ERROR' });
  }
});

// GET single governorate by slug or id
router.get('/governorates/:slugOrId', async (req: Request, res: Response) => {
  try {
    const { slugOrId } = req.params;
    const { db, isMongo } = await getMongoOrMemory();

    let gov: GovernorateDoc | null = null;
    if (isMongo && db) {
      gov = await db.collection<GovernorateDoc>('wah_governorates').findOne({
        $or: [{ slug: slugOrId }, { id: slugOrId }]
      });
    } else {
      gov = memoryDb.governorates.find((g) => g.slug === slugOrId || g.id === slugOrId) || null;
    }

    if (!gov) {
      return res.status(404).json({ success: false, error: 'المحافظة غير موجودة', code: 'NOT_FOUND' });
    }
    return res.json({ success: true, data: gov });
  } catch (err: any) {
    Logger.error('[WAH Content] Error fetching single governorate:', err);
    return res.status(500).json({ success: false, error: 'فشل جلب بيانات المحافظة', code: 'SERVER_ERROR' });
  }
});

// POST /governorates - Create new governorate (Admin Only)
router.post('/governorates', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item: GovernorateDoc = req.body;
    if (!item.name || !item.name.trim()) {
      return res.status(400).json({ success: false, error: 'اسم المحافظة مطلوب' });
    }

    item.updatedAt = new Date().toISOString();
    if (!item.id) item.id = `gov-${Date.now()}`;
    if (!item.createdAt) item.createdAt = item.updatedAt;
    if (!item.status) item.status = 'approved';
    if (!item.slug) item.slug = `gov-${encodeURIComponent(item.name.trim().toLowerCase().replace(/\s+/g, '-'))}`;
    if (!item.famousFor) item.famousFor = [];
    if (!item.gallery) item.gallery = item.coverImage ? [item.coverImage] : [];
    if (!item.traditionalCraftsIds) item.traditionalCraftsIds = [];
    if (!item.traditionalFoodIds) item.traditionalFoodIds = [];
    if (!item.culturalTraditions) item.culturalTraditions = [];

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      await db.collection('wah_governorates').updateOne(
        { id: item.id },
        { $set: item },
        { upsert: true }
      );
    }

    // Keep memory in sync
    const idx = memoryDb.governorates.findIndex((g) => g.id === item.id);
    if (idx >= 0) memoryDb.governorates[idx] = item;
    else memoryDb.governorates.push(item);

    await createAuditLog({
      actorId: req.user?.id,
      userName: req.user?.name || 'مدير النظام',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_SAVED_GOVERNORATE',
      resource: 'wah_governorates',
      resourceId: item.id,
      details: `تم إنشاء/تحديث المحافظة التراثية (${item.name}) في قاعدة البيانات`
    });

    return res.status(201).json({ success: true, message: 'تم حفظ المحافظة بنجاح في قاعدة البيانات', data: item });
  } catch (err: any) {
    Logger.error('[WAH Content] Error saving governorate:', err);
    return res.status(500).json({ success: false, error: 'فشل حفظ المحافظة', code: 'SERVER_ERROR' });
  }
});

// PUT /governorates/:id - Update existing governorate (Admin Only)
router.put('/governorates/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date().toISOString() };
    delete updateData._id;

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      const result = await db.collection('wah_governorates').findOneAndUpdate(
        { id },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      if (!result) {
        return res.status(404).json({ success: false, error: 'المحافظة غير موجودة' });
      }

      await createAuditLog({
        actorId: req.user?.id,
        userName: req.user?.name || 'مدير النظام',
        userRole: req.user?.role || 'admin',
        action: 'ADMIN_UPDATED_GOVERNORATE',
        resource: 'wah_governorates',
        resourceId: id,
        details: `تم تحديث بيانات المحافظة (${updateData.name || id}) بنجاح`
      });

      return res.json({ success: true, message: 'تم تحديث المحافظة بنجاح', data: result });
    }

    const idx = memoryDb.governorates.findIndex((g) => g.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'المحافظة غير موجودة' });
    memoryDb.governorates[idx] = { ...memoryDb.governorates[idx], ...updateData };
    return res.json({ success: true, message: 'تم تحديث المحافظة بنجاح', data: memoryDb.governorates[idx] });
  } catch (err: any) {
    Logger.error('[WAH Content] Error updating governorate:', err);
    return res.status(500).json({ success: false, error: 'فشل تحديث بيانات المحافظة' });
  }
});

// DELETE /governorates/:id - Safe deletion with relationship verification (Admin Only)
router.delete('/governorates/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const force = req.query.force === 'true';
    const archive = req.query.archive === 'true';
    const { db, isMongo } = await getMongoOrMemory();

    // 1. Verify existence
    let gov: any = null;
    if (isMongo && db) {
      gov = await db.collection('wah_governorates').findOne({ id });
    } else {
      gov = memoryDb.governorates.find((g) => g.id === id);
    }
    if (!gov) {
      return res.status(404).json({ success: false, error: 'المحافظة غير موجودة' });
    }

    // 2. Relationship Dependency Checks
    const dependencies: Record<string, number> = {};
    if (isMongo && db) {
      dependencies.places = await db.collection('wah_heritage_places').countDocuments({
        $or: [{ governorateId: id }, { governorateName: gov.name }]
      });
      dependencies.cities = await db.collection('wah_cities').countDocuments({ governorateId: id });
      dependencies.villages = await db.collection('wah_villages').countDocuments({ governorateId: id });
      dependencies.crafts = await db.collection('wah_cultural_crafts').countDocuments({ governorates: gov.name });
      dependencies.stories = await db.collection('wah_stories').countDocuments({
        $or: [{ governorateId: id }, { governorateName: gov.name }]
      });
      dependencies.food = await db.collection('wah_food').countDocuments({
        $or: [{ governorateId: id }, { governorateName: gov.name }]
      });
      dependencies.events = await db.collection('wah_events').countDocuments({
        $or: [{ governorateId: id }, { governorateName: gov.name }]
      });
      dependencies.products = await db.collection('products').countDocuments({ sellerGovernorate: gov.name });
    }

    const totalDependencies = Object.values(dependencies).reduce((a, b) => a + b, 0);

    if (totalDependencies > 0 && !force && !archive) {
      return res.status(409).json({
        success: false,
        error: `لا يمكن حذف المحافظة (${gov.name}) مباشرة لوجود بيانات وسجلات مرتبطة بها في المنصة: ${dependencies.places || 0} معالم، ${dependencies.cities || 0} مدن، ${dependencies.villages || 0} قرى، ${dependencies.crafts || 0} حرف، ${dependencies.stories || 0} قصص، ${dependencies.food || 0} أكلات، ${dependencies.events || 0} فعاليات، ${dependencies.products || 0} منتجات. يرجى أرشفة المحافظة أو حذف التبعيات أولاً.`,
        code: 'DEPENDENCY_CONFLICT',
        dependencies
      });
    }

    if (archive) {
      // Safe archival
      if (isMongo && db) {
        await db.collection('wah_governorates').updateOne({ id }, { $set: { status: 'archived', updatedAt: new Date().toISOString() } });
      }
      const idx = memoryDb.governorates.findIndex((g) => g.id === id);
      if (idx >= 0) memoryDb.governorates[idx].status = 'archived';

      await createAuditLog({
        actorId: req.user?.id,
        userName: req.user?.name || 'مدير النظام',
        userRole: req.user?.role || 'admin',
        action: 'ADMIN_ARCHIVED_GOVERNORATE',
        resource: 'wah_governorates',
        resourceId: id,
        details: `تم أرشفة المحافظة (${gov.name}) لحماية السجلات المرتبطة بها`
      });

      return res.json({ success: true, message: `تم أرشفة المحافظة (${gov.name}) بنجاح بدلاً من حذفها نهائياً` });
    }

    // Permanent Deletion
    if (isMongo && db) {
      await db.collection('wah_governorates').deleteOne({ id });
    }
    memoryDb.governorates = memoryDb.governorates.filter((g) => g.id !== id);

    await createAuditLog({
      actorId: req.user?.id,
      userName: req.user?.name || 'مدير النظام',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_DELETED_GOVERNORATE',
      resource: 'wah_governorates',
      resourceId: id,
      details: `تم حذف المحافظة (${gov.name}) نهائياً من قاعدة البيانات`
    });

    return res.json({ success: true, message: `تم حذف المحافظة (${gov.name}) نهائياً من قاعدة البيانات` });
  } catch (err: any) {
    Logger.error('[WAH Content] Error deleting governorate:', err);
    return res.status(500).json({ success: false, error: 'فشل حذف المحافظة' });
  }
});

// ==========================================
// 2. CITIES & VILLAGES (المراكز والمدن والقرى التراثية)
// ==========================================

// GET /cities - List cities
router.get('/cities', async (req: Request, res: Response) => {
  try {
    const { governorateId } = req.query;
    const { db, isMongo } = await getMongoOrMemory();

    if (isMongo && db) {
      const query: any = {};
      if (governorateId) query.governorateId = governorateId;
      const cities = await db.collection<CityDoc>('wah_cities').find(query).toArray();
      return res.json({ success: true, count: cities.length, data: cities });
    }
    return res.json({ success: true, count: 0, data: [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل جلب المدن' });
  }
});

// POST /cities - Create city (Admin Only)
router.post('/cities', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item: CityDoc = req.body;
    if (!item.name || !item.governorateName) {
      return res.status(400).json({ success: false, error: 'اسم المدينة والمحافظة حقول مطلوبة' });
    }
    item.updatedAt = new Date().toISOString();
    if (!item.id) item.id = `city-${Date.now()}`;
    if (!item.createdAt) item.createdAt = item.updatedAt;
    if (!item.status) item.status = 'approved';

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      await db.collection('wah_cities').updateOne({ id: item.id }, { $set: item }, { upsert: true });
    }

    await createAuditLog({
      actorId: req.user?.id,
      userName: req.user?.name || 'مدير النظام',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_SAVED_CITY',
      resource: 'wah_cities',
      resourceId: item.id,
      details: `تم حفظ المدينة (${item.name}) في قاعدة البيانات`
    });

    return res.status(201).json({ success: true, message: 'تم حفظ المدينة بنجاح', data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل حفظ المدينة' });
  }
});

// PUT /cities/:id - Update city (Admin Only)
router.put('/cities/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date().toISOString() };
    delete updateData._id;

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      const updated = await db.collection('wah_cities').findOneAndUpdate({ id }, { $set: updateData }, { returnDocument: 'after' });
      return res.json({ success: true, message: 'تم تحديث بيانات المدينة بنجاح', data: updated });
    }
    return res.status(400).json({ success: false, error: 'قاعدة البيانات غير متاحة' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل تحديث المدينة' });
  }
});

// DELETE /cities/:id - Delete city (Admin Only)
router.delete('/cities/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { db, isMongo } = await getMongoOrMemory();

    if (isMongo && db) {
      const villageCount = await db.collection('wah_villages').countDocuments({ cityId: id });
      if (villageCount > 0 && req.query.force !== 'true') {
        return res.status(409).json({
          success: false,
          error: `لا يمكن حذف هذه المدينة لوجود ${villageCount} قرى تابعة لها. يمكنك حذف القرى أولاً أو استخدام الحذف الإجباري.`
        });
      }
      await db.collection('wah_cities').deleteOne({ id });
      await createAuditLog({
        actorId: req.user?.id,
        userName: req.user?.name || 'مدير النظام',
        userRole: req.user?.role || 'admin',
        action: 'ADMIN_DELETED_CITY',
        resource: 'wah_cities',
        resourceId: id,
        details: `تم حذف المدينة (${id}) من قاعدة البيانات`
      });
    }

    return res.json({ success: true, message: 'تم حذف المدينة بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل حذف المدينة' });
  }
});

// GET /villages - List villages
router.get('/villages', async (req: Request, res: Response) => {
  try {
    const { governorateId, cityId } = req.query;
    const { db, isMongo } = await getMongoOrMemory();

    if (isMongo && db) {
      const query: any = {};
      if (governorateId) query.governorateId = governorateId;
      if (cityId) query.cityId = cityId;
      const villages = await db.collection<VillageDoc>('wah_villages').find(query).toArray();
      return res.json({ success: true, count: villages.length, data: villages });
    }
    return res.json({ success: true, count: 0, data: [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل جلب القرى التراثية' });
  }
});

// POST /villages - Create village (Admin Only)
router.post('/villages', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item: VillageDoc = req.body;
    if (!item.name || !item.governorateName) {
      return res.status(400).json({ success: false, error: 'اسم القرية والمحافظة حقول مطلوبة' });
    }
    item.updatedAt = new Date().toISOString();
    if (!item.id) item.id = `village-${Date.now()}`;
    if (!item.createdAt) item.createdAt = item.updatedAt;
    if (!item.status) item.status = 'approved';

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      await db.collection('wah_villages').updateOne({ id: item.id }, { $set: item }, { upsert: true });
    }

    await createAuditLog({
      actorId: req.user?.id,
      userName: req.user?.name || 'مدير النظام',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_SAVED_VILLAGE',
      resource: 'wah_villages',
      resourceId: item.id,
      details: `تم حفظ القرية التراثية (${item.name}) في قاعدة البيانات`
    });

    return res.status(201).json({ success: true, message: 'تم حفظ القرية التراثية بنجاح', data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل حفظ القرية' });
  }
});

// PUT /villages/:id - Update village (Admin Only)
router.put('/villages/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date().toISOString() };
    delete updateData._id;

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      const updated = await db.collection('wah_villages').findOneAndUpdate({ id }, { $set: updateData }, { returnDocument: 'after' });
      return res.json({ success: true, message: 'تم تحديث بيانات القرية بنجاح', data: updated });
    }
    return res.status(400).json({ success: false, error: 'قاعدة البيانات غير متاحة' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل تحديث بيانات القرية' });
  }
});

// DELETE /villages/:id - Delete village (Admin Only)
router.delete('/villages/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { db, isMongo } = await getMongoOrMemory();

    if (isMongo && db) {
      await db.collection('wah_villages').deleteOne({ id });
      await createAuditLog({
        actorId: req.user?.id,
        userName: req.user?.name || 'مدير النظام',
        userRole: req.user?.role || 'admin',
        action: 'ADMIN_DELETED_VILLAGE',
        resource: 'wah_villages',
        resourceId: id,
        details: `تم حذف القرية (${id}) من قاعدة البيانات`
      });
    }
    return res.json({ success: true, message: 'تم حذف القرية التراثية بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل حذف القرية' });
  }
});

// ==========================================
// 3. HERITAGE PLACES (المعالم والمزارات التراثية)
// ==========================================

router.get('/places', async (req: Request, res: Response) => {
  try {
    const { governorate, category, search, status } = req.query;
    const { db, isMongo } = await getMongoOrMemory();

    if (isMongo && db) {
      const query: any = {};
      if (governorate) {
        query.$or = [{ governorateName: governorate }, { governorateId: governorate }];
      }
      if (category) query.category = category;
      if (status) query.status = status;
      if (search && typeof search === 'string') {
        query.title = { $regex: search, $options: 'i' };
      }
      const places = await db.collection<HeritagePlaceDoc>('wah_heritage_places').find(query).toArray();
      return res.json({ success: true, count: places.length, data: places });
    }

    let list = memoryDb.heritagePlaces;
    if (governorate) list = list.filter((p) => p.governorateName === governorate || p.governorateId === governorate);
    if (category) list = list.filter((p) => p.category === category);
    if (status) list = list.filter((p) => p.status === status);
    return res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل جلب المعالم التراثية' });
  }
});

router.get('/places/:slugOrId', async (req: Request, res: Response) => {
  try {
    const { slugOrId } = req.params;
    const { db, isMongo } = await getMongoOrMemory();

    let place: HeritagePlaceDoc | null = null;
    if (isMongo && db) {
      place = await db.collection<HeritagePlaceDoc>('wah_heritage_places').findOne({
        $or: [{ slug: slugOrId }, { id: slugOrId }]
      });
    } else {
      place = memoryDb.heritagePlaces.find((p) => p.slug === slugOrId || p.id === slugOrId) || null;
    }

    if (!place) return res.status(404).json({ success: false, error: 'المعلم التراثي غير موجود' });
    return res.json({ success: true, data: place });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل جلب تفاصيل المعلم' });
  }
});

router.post('/places', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item: HeritagePlaceDoc = req.body;
    if (!item.title || !item.governorateName) {
      return res.status(400).json({ success: false, error: 'اسم المعلم والمحافظة حقول مطلوبة' });
    }

    item.updatedAt = new Date().toISOString();
    if (!item.id) item.id = `place-${Date.now()}`;
    if (!item.createdAt) item.createdAt = item.updatedAt;
    if (!item.slug) item.slug = `place-${encodeURIComponent(item.title.trim().toLowerCase().replace(/\s+/g, '-'))}`;
    if (!item.status) item.status = 'approved';

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      await db.collection('wah_heritage_places').updateOne({ id: item.id }, { $set: item }, { upsert: true });
    }

    const idx = memoryDb.heritagePlaces.findIndex((p) => p.id === item.id);
    if (idx >= 0) memoryDb.heritagePlaces[idx] = item;
    else memoryDb.heritagePlaces.push(item);

    await createAuditLog({
      actorId: req.user?.id,
      userName: req.user?.name || 'مدير النظام',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_SAVED_PLACE',
      resource: 'wah_heritage_places',
      resourceId: item.id,
      details: `تم حفظ المعلم التراثي (${item.title}) في قاعدة البيانات`
    });

    return res.status(201).json({ success: true, message: 'تم حفظ المعلم التراثي بنجاح', data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل حفظ المعلم' });
  }
});

router.put('/places/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date().toISOString() };
    delete updateData._id;

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      const updated = await db.collection('wah_heritage_places').findOneAndUpdate({ id }, { $set: updateData }, { returnDocument: 'after' });
      await createAuditLog({
        actorId: req.user?.id,
        userName: req.user?.name || 'مدير النظام',
        userRole: req.user?.role || 'admin',
        action: 'ADMIN_UPDATED_PLACE',
        resource: 'wah_heritage_places',
        resourceId: id,
        details: `تم تحديث المعلم التراثي (${updateData.title || id})`
      });
      return res.json({ success: true, message: 'تم تحديث المعلم التراثي بنجاح', data: updated });
    }

    const idx = memoryDb.heritagePlaces.findIndex((p) => p.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'المعلم غير موجود' });
    memoryDb.heritagePlaces[idx] = { ...memoryDb.heritagePlaces[idx], ...updateData };
    return res.json({ success: true, message: 'تم تحديث المعلم بنجاح', data: memoryDb.heritagePlaces[idx] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل تحديث المعلم التراثي' });
  }
});

router.delete('/places/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { db, isMongo } = await getMongoOrMemory();

    if (isMongo && db) {
      await db.collection('wah_heritage_places').deleteOne({ id });
    }
    memoryDb.heritagePlaces = memoryDb.heritagePlaces.filter((p) => p.id !== id);

    await createAuditLog({
      actorId: req.user?.id,
      userName: req.user?.name || 'مدير النظام',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_DELETED_PLACE',
      resource: 'wah_heritage_places',
      resourceId: id,
      details: `تم حذف المعلم التراثي (${id}) من قاعدة البيانات`
    });

    return res.json({ success: true, message: 'تم حذف المعلم التراثي بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل حذف المعلم التراثي' });
  }
});

// ==========================================
// 4. CULTURAL CRAFTS (حرف الصعيد الأصيلة)
// ==========================================

router.get('/crafts', async (req: Request, res: Response) => {
  try {
    const { governorate, status } = req.query;
    const { db, isMongo } = await getMongoOrMemory();

    if (isMongo && db) {
      const query: any = {};
      if (governorate) query.governorates = governorate;
      if (status) query.status = status;
      const crafts = await db.collection<CulturalCraftDoc>('wah_cultural_crafts').find(query).toArray();
      return res.json({ success: true, count: crafts.length, data: crafts });
    }

    let list = memoryDb.culturalCrafts;
    if (governorate) list = list.filter((c) => c.governorates.includes(String(governorate)));
    if (status) list = list.filter((c) => c.status === status);
    return res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل جلب الحرف التراثية' });
  }
});

router.get('/crafts/:slugOrId', async (req: Request, res: Response) => {
  try {
    const { slugOrId } = req.params;
    const { db, isMongo } = await getMongoOrMemory();

    let craft: CulturalCraftDoc | null = null;
    if (isMongo && db) {
      craft = await db.collection<CulturalCraftDoc>('wah_cultural_crafts').findOne({
        $or: [{ slug: slugOrId }, { id: slugOrId }]
      });
    } else {
      craft = memoryDb.culturalCrafts.find((c) => c.slug === slugOrId || c.id === slugOrId) || null;
    }

    if (!craft) return res.status(404).json({ success: false, error: 'الحرفة التراثية غير موجودة' });
    return res.json({ success: true, data: craft });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل جلب تفاصيل الحرفة' });
  }
});

router.post('/crafts', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item: CulturalCraftDoc = req.body;
    if (!item.title) return res.status(400).json({ success: false, error: 'عنوان الحرفة مطلوب' });

    item.updatedAt = new Date().toISOString();
    if (!item.id) item.id = `craft-${Date.now()}`;
    if (!item.createdAt) item.createdAt = item.updatedAt;
    if (!item.slug) item.slug = `craft-${encodeURIComponent(item.title.trim().toLowerCase().replace(/\s+/g, '-'))}`;
    if (!item.status) item.status = 'approved';

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      await db.collection('wah_cultural_crafts').updateOne({ id: item.id }, { $set: item }, { upsert: true });
    }

    const idx = memoryDb.culturalCrafts.findIndex((c) => c.id === item.id);
    if (idx >= 0) memoryDb.culturalCrafts[idx] = item;
    else memoryDb.culturalCrafts.push(item);

    await createAuditLog({
      actorId: req.user?.id,
      userName: req.user?.name || 'مدير النظام',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_SAVED_CRAFT',
      resource: 'wah_cultural_crafts',
      resourceId: item.id,
      details: `تم حفظ الحرفة التراثية (${item.title}) في قاعدة البيانات`
    });

    return res.status(201).json({ success: true, message: 'تم حفظ الحرفة بنجاح', data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل حفظ الحرفة' });
  }
});

router.put('/crafts/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date().toISOString() };
    delete updateData._id;

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      const updated = await db.collection('wah_cultural_crafts').findOneAndUpdate({ id }, { $set: updateData }, { returnDocument: 'after' });
      await createAuditLog({
        actorId: req.user?.id,
        userName: req.user?.name || 'مدير النظام',
        userRole: req.user?.role || 'admin',
        action: 'ADMIN_UPDATED_CRAFT',
        resource: 'wah_cultural_crafts',
        resourceId: id,
        details: `تم تحديث بيانات الحرفة (${updateData.title || id})`
      });
      return res.json({ success: true, message: 'تم تحديث بيانات الحرفة بنجاح', data: updated });
    }

    const idx = memoryDb.culturalCrafts.findIndex((c) => c.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'الحرفة غير موجودة' });
    memoryDb.culturalCrafts[idx] = { ...memoryDb.culturalCrafts[idx], ...updateData };
    return res.json({ success: true, message: 'تم تحديث الحرفة بنجاح', data: memoryDb.culturalCrafts[idx] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل تحديث الحرفة التراثية' });
  }
});

router.delete('/crafts/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const force = req.query.force === 'true';
    const { db, isMongo } = await getMongoOrMemory();

    if (isMongo && db) {
      const craft = await db.collection<CulturalCraftDoc>('wah_cultural_crafts').findOne({ id });
      if (!craft) return res.status(404).json({ success: false, error: 'الحرفة غير موجودة' });

      // Check for related products
      const relatedProductsCount = await db.collection('products').countDocuments({
        $or: [{ title: { $regex: craft.title, $options: 'i' } }, { description: { $regex: craft.title, $options: 'i' } }]
      });

      if (relatedProductsCount > 0 && !force) {
        return res.status(409).json({
          success: false,
          error: `توجد ${relatedProductsCount} منتجات بسوق وه مرتبطة بهذه الحرفة. يرجى أرشفة الحرفة أو استخدام الحذف الإجباري.`,
          code: 'DEPENDENCY_CONFLICT'
        });
      }

      await db.collection('wah_cultural_crafts').deleteOne({ id });
    }

    memoryDb.culturalCrafts = memoryDb.culturalCrafts.filter((c) => c.id !== id);

    await createAuditLog({
      actorId: req.user?.id,
      userName: req.user?.name || 'مدير النظام',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_DELETED_CRAFT',
      resource: 'wah_cultural_crafts',
      resourceId: id,
      details: `تم حذف الحرفة التراثية (${id}) من قاعدة البيانات`
    });

    return res.json({ success: true, message: 'تم حذف الحرفة بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل حذف الحرفة' });
  }
});

// ==========================================
// 5. CULTURAL TRADITIONS (العادات والتقاليد)
// ==========================================

router.get('/traditions', async (req: Request, res: Response) => {
  try {
    const { governorate, category } = req.query;
    const { db, isMongo } = await getMongoOrMemory();

    if (isMongo && db) {
      const query: any = {};
      if (governorate) query.$or = [{ governorateName: governorate }, { governorateId: governorate }];
      if (category) query.category = category;
      const traditions = await db.collection<CulturalTraditionDoc>('wah_traditions').find(query).toArray();
      return res.json({ success: true, count: traditions.length, data: traditions });
    }
    return res.json({ success: true, count: 0, data: [] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل جلب العادات والتقاليد' });
  }
});

router.post('/traditions', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item: CulturalTraditionDoc = req.body;
    item.updatedAt = new Date().toISOString();
    if (!item.id) item.id = `tradition-${Date.now()}`;
    if (!item.createdAt) item.createdAt = item.updatedAt;
    if (!item.status) item.status = 'approved';
    if (!item.slug) item.slug = `tradition-${encodeURIComponent(item.title.trim().toLowerCase().replace(/\s+/g, '-'))}`;

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      await db.collection('wah_traditions').updateOne({ id: item.id }, { $set: item }, { upsert: true });
    }

    await createAuditLog({
      actorId: req.user?.id,
      userName: req.user?.name || 'مدير النظام',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_SAVED_TRADITION',
      resource: 'wah_traditions',
      resourceId: item.id,
      details: `تم حفظ التقليد التراثي (${item.title}) في قاعدة البيانات`
    });

    return res.status(201).json({ success: true, message: 'تم حفظ التقليد بنجاح', data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل حفظ التقليد التراثي' });
  }
});

router.put('/traditions/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date().toISOString() };
    delete updateData._id;

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      const updated = await db.collection('wah_traditions').findOneAndUpdate({ id }, { $set: updateData }, { returnDocument: 'after' });
      return res.json({ success: true, message: 'تم تحديث التقليد بنجاح', data: updated });
    }
    return res.status(400).json({ success: false, error: 'قاعدة البيانات غير متاحة' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل تحديث التقليد' });
  }
});

router.delete('/traditions/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      await db.collection('wah_traditions').deleteOne({ id });
      await createAuditLog({
        actorId: req.user?.id,
        userName: req.user?.name || 'مدير النظام',
        userRole: req.user?.role || 'admin',
        action: 'ADMIN_DELETED_TRADITION',
        resource: 'wah_traditions',
        resourceId: id,
        details: `تم حذف التقليد (${id}) من قاعدة البيانات`
      });
    }
    return res.json({ success: true, message: 'تم حذف التقليد بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل حذف التقليد' });
  }
});

// ==========================================
// 6. WAH STORIES (وه بيحكي - قصص وحكايات التراث)
// ==========================================

router.get('/stories', async (req: Request, res: Response) => {
  try {
    const { governorate, category, status } = req.query;
    const { db, isMongo } = await getMongoOrMemory();

    if (isMongo && db) {
      const query: any = {};
      if (governorate) query.$or = [{ governorateName: governorate }, { governorateId: governorate }];
      if (category) query.category = category;
      if (status) query.status = status;
      const stories = await db.collection<WahStoryDoc>('wah_stories').find(query).toArray();
      return res.json({ success: true, count: stories.length, data: stories });
    }

    let list = memoryDb.wahStories;
    if (governorate) list = list.filter((s) => s.governorateName === governorate || s.governorateId === governorate);
    if (category) list = list.filter((s) => s.category === category);
    if (status) list = list.filter((s) => s.status === status);
    return res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل جلب القصص' });
  }
});

router.get('/stories/:slugOrId', async (req: Request, res: Response) => {
  try {
    const { slugOrId } = req.params;
    const { db, isMongo } = await getMongoOrMemory();

    let story: WahStoryDoc | null = null;
    if (isMongo && db) {
      story = await db.collection<WahStoryDoc>('wah_stories').findOne({
        $or: [{ slug: slugOrId }, { id: slugOrId }]
      });
    } else {
      story = memoryDb.wahStories.find((s) => s.slug === slugOrId || s.id === slugOrId) || null;
    }

    if (!story) return res.status(404).json({ success: false, error: 'القصة غير موجودة' });
    return res.json({ success: true, data: story });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل جلب تفاصيل القصة' });
  }
});

router.post('/stories', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item: WahStoryDoc = req.body;
    if (!item.title) return res.status(400).json({ success: false, error: 'عنوان القصة مطلوب' });

    item.updatedAt = new Date().toISOString();
    if (!item.id) item.id = `story-${Date.now()}`;
    if (!item.createdAt) item.createdAt = item.updatedAt;
    if (!item.slug) item.slug = `story-${encodeURIComponent(item.title.trim().toLowerCase().replace(/\s+/g, '-'))}`;
    if (!item.status) item.status = 'approved';

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      await db.collection('wah_stories').updateOne({ id: item.id }, { $set: item }, { upsert: true });
    }

    const idx = memoryDb.wahStories.findIndex((s) => s.id === item.id);
    if (idx >= 0) memoryDb.wahStories[idx] = item;
    else memoryDb.wahStories.push(item);

    await createAuditLog({
      actorId: req.user?.id,
      userName: req.user?.name || 'مدير النظام',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_SAVED_STORY',
      resource: 'wah_stories',
      resourceId: item.id,
      details: `تم حفظ القصة التراثية (${item.title}) في قاعدة البيانات`
    });

    return res.status(201).json({ success: true, message: 'تم حفظ القصة بنجاح', data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل حفظ القصة' });
  }
});

router.put('/stories/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date().toISOString() };
    delete updateData._id;

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      const updated = await db.collection('wah_stories').findOneAndUpdate({ id }, { $set: updateData }, { returnDocument: 'after' });
      await createAuditLog({
        actorId: req.user?.id,
        userName: req.user?.name || 'مدير النظام',
        userRole: req.user?.role || 'admin',
        action: 'ADMIN_UPDATED_STORY',
        resource: 'wah_stories',
        resourceId: id,
        details: `تم تحديث القصة (${updateData.title || id})`
      });
      return res.json({ success: true, message: 'تم تحديث القصة بنجاح', data: updated });
    }

    const idx = memoryDb.wahStories.findIndex((s) => s.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'القصة غير موجودة' });
    memoryDb.wahStories[idx] = { ...memoryDb.wahStories[idx], ...updateData };
    return res.json({ success: true, message: 'تم تحديث القصة بنجاح', data: memoryDb.wahStories[idx] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل تحديث القصة' });
  }
});

router.delete('/stories/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      await db.collection('wah_stories').deleteOne({ id });
    }
    memoryDb.wahStories = memoryDb.wahStories.filter((s) => s.id !== id);

    await createAuditLog({
      actorId: req.user?.id,
      userName: req.user?.name || 'مدير النظام',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_DELETED_STORY',
      resource: 'wah_stories',
      resourceId: id,
      details: `تم حذف القصة (${id}) من قاعدة البيانات`
    });

    return res.json({ success: true, message: 'تم حذف القصة بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل حذف القصة' });
  }
});

// ==========================================
// 7. LOCAL PEOPLE (ناس وشخصيات الصعيد)
// ==========================================

router.get('/people', async (req: Request, res: Response) => {
  try {
    const { governorate, status } = req.query;
    const { db, isMongo } = await getMongoOrMemory();

    if (isMongo && db) {
      const query: any = {};
      if (governorate) query.$or = [{ governorateName: governorate }, { governorateId: governorate }];
      if (status) query.status = status;
      const people = await db.collection<LocalPersonDoc>('wah_local_people').find(query).toArray();
      return res.json({ success: true, count: people.length, data: people });
    }

    let list = memoryDb.localPeople;
    if (governorate) list = list.filter((p) => p.governorateName === governorate || p.governorateId === governorate);
    if (status) list = list.filter((p) => p.status === status);
    return res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل جلب شخصيات الصعيد' });
  }
});

router.get('/people/:slugOrId', async (req: Request, res: Response) => {
  try {
    const { slugOrId } = req.params;
    const { db, isMongo } = await getMongoOrMemory();

    let person: LocalPersonDoc | null = null;
    if (isMongo && db) {
      person = await db.collection<LocalPersonDoc>('wah_local_people').findOne({
        $or: [{ slug: slugOrId }, { id: slugOrId }]
      });
    } else {
      person = memoryDb.localPeople.find((p) => p.slug === slugOrId || p.id === slugOrId) || null;
    }

    if (!person) return res.status(404).json({ success: false, error: 'الشخصية غير موجودة' });
    return res.json({ success: true, data: person });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل جلب بيانات الشخصية' });
  }
});

router.post('/people', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item: LocalPersonDoc = req.body;
    if (!item.name) return res.status(400).json({ success: false, error: 'اسم الشخصية مطلوب' });

    item.updatedAt = new Date().toISOString();
    if (!item.id) item.id = `person-${Date.now()}`;
    if (!item.createdAt) item.createdAt = item.updatedAt;
    if (!item.slug) item.slug = `person-${encodeURIComponent(item.name.trim().toLowerCase().replace(/\s+/g, '-'))}`;
    if (!item.status) item.status = 'approved';

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      await db.collection('wah_local_people').updateOne({ id: item.id }, { $set: item }, { upsert: true });
    }

    const idx = memoryDb.localPeople.findIndex((p) => p.id === item.id);
    if (idx >= 0) memoryDb.localPeople[idx] = item;
    else memoryDb.localPeople.push(item);

    await createAuditLog({
      actorId: req.user?.id,
      userName: req.user?.name || 'مدير النظام',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_SAVED_PERSON',
      resource: 'wah_local_people',
      resourceId: item.id,
      details: `تم حفظ الشخصية التراثية (${item.name}) في قاعدة البيانات`
    });

    return res.status(201).json({ success: true, message: 'تم حفظ بيانات الشخصية بنجاح', data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل حفظ الشخصية' });
  }
});

router.put('/people/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date().toISOString() };
    delete updateData._id;

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      const updated = await db.collection('wah_local_people').findOneAndUpdate({ id }, { $set: updateData }, { returnDocument: 'after' });
      return res.json({ success: true, message: 'تم تحديث بيانات الشخصية بنجاح', data: updated });
    }
    return res.status(400).json({ success: false, error: 'قاعدة البيانات غير متاحة' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل تحديث الشخصية' });
  }
});

router.delete('/people/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      await db.collection('wah_local_people').deleteOne({ id });
    }
    memoryDb.localPeople = memoryDb.localPeople.filter((p) => p.id !== id);

    await createAuditLog({
      actorId: req.user?.id,
      userName: req.user?.name || 'مدير النظام',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_DELETED_PERSON',
      resource: 'wah_local_people',
      resourceId: id,
      details: `تم حذف الشخصية (${id}) من قاعدة البيانات`
    });

    return res.json({ success: true, message: 'تم حذف الشخصية بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل حذف الشخصية' });
  }
});

// ==========================================
// 8. UPPER EGYPT FOOD (أكل الصعيد التراثي)
// ==========================================

router.get('/food', async (req: Request, res: Response) => {
  try {
    const { governorate, status } = req.query;
    const { db, isMongo } = await getMongoOrMemory();

    if (isMongo && db) {
      const query: any = {};
      if (governorate) query.$or = [{ governorateName: governorate }, { governorateId: governorate }];
      if (status) query.status = status;
      const foods = await db.collection<UpperEgyptFoodDoc>('wah_food').find(query).toArray();
      return res.json({ success: true, count: foods.length, data: foods });
    }

    let list = memoryDb.upperEgyptFood;
    if (governorate) list = list.filter((f) => f.governorateName === governorate || f.governorateId === governorate);
    if (status) list = list.filter((f) => f.status === status);
    return res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل جلب أكلات الصعيد' });
  }
});

router.get('/food/:slugOrId', async (req: Request, res: Response) => {
  try {
    const { slugOrId } = req.params;
    const { db, isMongo } = await getMongoOrMemory();

    let food: UpperEgyptFoodDoc | null = null;
    if (isMongo && db) {
      food = await db.collection<UpperEgyptFoodDoc>('wah_food').findOne({
        $or: [{ slug: slugOrId }, { id: slugOrId }]
      });
    } else {
      food = memoryDb.upperEgyptFood.find((f) => f.slug === slugOrId || f.id === slugOrId) || null;
    }

    if (!food) return res.status(404).json({ success: false, error: 'الوصفة غير موجودة' });
    return res.json({ success: true, data: food });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل جلب تفاصيل الوصفة' });
  }
});

router.post('/food', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item: UpperEgyptFoodDoc = req.body;
    if (!item.title) return res.status(400).json({ success: false, error: 'اسم الأكلة التراثية مطلوب' });

    item.updatedAt = new Date().toISOString();
    if (!item.id) item.id = `food-${Date.now()}`;
    if (!item.createdAt) item.createdAt = item.updatedAt;
    if (!item.slug) item.slug = `food-${encodeURIComponent(item.title.trim().toLowerCase().replace(/\s+/g, '-'))}`;
    if (!item.status) item.status = 'approved';

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      await db.collection('wah_food').updateOne({ id: item.id }, { $set: item }, { upsert: true });
    }

    const idx = memoryDb.upperEgyptFood.findIndex((f) => f.id === item.id);
    if (idx >= 0) memoryDb.upperEgyptFood[idx] = item;
    else memoryDb.upperEgyptFood.push(item);

    await createAuditLog({
      actorId: req.user?.id,
      userName: req.user?.name || 'مدير النظام',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_SAVED_FOOD',
      resource: 'wah_food',
      resourceId: item.id,
      details: `تم حفظ الأكلة التراثية (${item.title}) في قاعدة البيانات`
    });

    return res.status(201).json({ success: true, message: 'تم حفظ بيانات الوصفة بنجاح', data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل حفظ الوصفة' });
  }
});

router.put('/food/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date().toISOString() };
    delete updateData._id;

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      const updated = await db.collection('wah_food').findOneAndUpdate({ id }, { $set: updateData }, { returnDocument: 'after' });
      return res.json({ success: true, message: 'تم تحديث الوصفة بنجاح', data: updated });
    }
    return res.status(400).json({ success: false, error: 'قاعدة البيانات غير متاحة' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل تحديث الوصفة' });
  }
});

router.delete('/food/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      await db.collection('wah_food').deleteOne({ id });
    }
    memoryDb.upperEgyptFood = memoryDb.upperEgyptFood.filter((f) => f.id !== id);

    await createAuditLog({
      actorId: req.user?.id,
      userName: req.user?.name || 'مدير النظام',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_DELETED_FOOD',
      resource: 'wah_food',
      resourceId: id,
      details: `تم حذف الأكلة التراثية (${id}) من قاعدة البيانات`
    });

    return res.json({ success: true, message: 'تم حذف الوصفة بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل حذف الوصفة' });
  }
});

// ==========================================
// 9. CULTURAL EVENTS (فعاليات ومواسم الصعيد)
// ==========================================

router.get('/events', async (req: Request, res: Response) => {
  try {
    const { governorate, category, status } = req.query;
    const { db, isMongo } = await getMongoOrMemory();

    if (isMongo && db) {
      const query: any = {};
      if (governorate) query.$or = [{ governorateName: governorate }, { governorateId: governorate }];
      if (category) query.category = category;
      if (status) query.status = status;
      const events = await db.collection<CulturalEventDoc>('wah_events').find(query).toArray();
      return res.json({ success: true, count: events.length, data: events });
    }

    let list = memoryDb.culturalEvents;
    if (governorate) list = list.filter((e) => e.governorateName === governorate || e.governorateId === governorate);
    if (category) list = list.filter((e) => e.category === category);
    if (status) list = list.filter((e) => e.status === status);
    return res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل جلب الفعاليات' });
  }
});

router.get('/events/:slugOrId', async (req: Request, res: Response) => {
  try {
    const { slugOrId } = req.params;
    const { db, isMongo } = await getMongoOrMemory();

    let event: CulturalEventDoc | null = null;
    if (isMongo && db) {
      event = await db.collection<CulturalEventDoc>('wah_events').findOne({
        $or: [{ slug: slugOrId }, { id: slugOrId }]
      });
    } else {
      event = memoryDb.culturalEvents.find((e) => e.slug === slugOrId || e.id === slugOrId) || null;
    }

    if (!event) return res.status(404).json({ success: false, error: 'الفعالية غير موجودة' });
    return res.json({ success: true, data: event });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل جلب تفاصيل الفعالية' });
  }
});

router.post('/events', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item: CulturalEventDoc = req.body;
    if (!item.title) return res.status(400).json({ success: false, error: 'عنوان الفعالية مطلوب' });

    item.updatedAt = new Date().toISOString();
    if (!item.id) item.id = `event-${Date.now()}`;
    if (!item.createdAt) item.createdAt = item.updatedAt;
    if (!item.slug) item.slug = `event-${encodeURIComponent(item.title.trim().toLowerCase().replace(/\s+/g, '-'))}`;
    if (!item.status) item.status = 'approved';

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      await db.collection('wah_events').updateOne({ id: item.id }, { $set: item }, { upsert: true });
    }

    const idx = memoryDb.culturalEvents.findIndex((e) => e.id === item.id);
    if (idx >= 0) memoryDb.culturalEvents[idx] = item;
    else memoryDb.culturalEvents.push(item);

    await createAuditLog({
      actorId: req.user?.id,
      userName: req.user?.name || 'مدير النظام',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_SAVED_EVENT',
      resource: 'wah_events',
      resourceId: item.id,
      details: `تم حفظ الفعالية التراثية (${item.title}) في قاعدة البيانات`
    });

    return res.status(201).json({ success: true, message: 'تم حفظ الفعالية بنجاح', data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل حفظ الفعالية' });
  }
});

router.put('/events/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date().toISOString() };
    delete updateData._id;

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      const updated = await db.collection('wah_events').findOneAndUpdate({ id }, { $set: updateData }, { returnDocument: 'after' });
      return res.json({ success: true, message: 'تم تحديث الفعالية بنجاح', data: updated });
    }
    return res.status(400).json({ success: false, error: 'قاعدة البيانات غير متاحة' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل تحديث الفعالية' });
  }
});

router.delete('/events/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      await db.collection('wah_events').deleteOne({ id });
    }
    memoryDb.culturalEvents = memoryDb.culturalEvents.filter((e) => e.id !== id);

    await createAuditLog({
      actorId: req.user?.id,
      userName: req.user?.name || 'مدير النظام',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_DELETED_EVENT',
      resource: 'wah_events',
      resourceId: id,
      details: `تم حذف الفعالية (${id}) من قاعدة البيانات`
    });

    return res.json({ success: true, message: 'تم حذف الفعالية بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل حذف الفعالية' });
  }
});

// ==========================================
// 10. UNIVERSAL MODERATION ENDPOINT
// ==========================================

router.put('/moderation/status', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { entityType, id, status, rejectionReason } = req.body;
    if (!entityType || !id || !status) {
      return res.status(400).json({ success: false, error: 'نوع الكيان، المعرف، والحالة الجديدة حقول مطلوبة' });
    }

    const validStatuses: VerificationStatus[] = ['draft', 'pending_review', 'approved', 'rejected', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'حالة التحقق غير صالحة' });
    }

    const collectionMap: Record<string, string> = {
      governorate: 'wah_governorates',
      place: 'wah_heritage_places',
      craft: 'wah_cultural_crafts',
      tradition: 'wah_traditions',
      story: 'wah_stories',
      person: 'wah_local_people',
      food: 'wah_food',
      event: 'wah_events',
      city: 'wah_cities',
      village: 'wah_villages'
    };

    const collectionName = collectionMap[entityType];
    if (!collectionName) {
      return res.status(400).json({ success: false, error: 'نوع الكيان التراثي غير مدعوم للرقابة' });
    }

    const updateFields: any = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (status === 'approved') {
      updateFields.approvedBy = req.user?.id || 'admin';
      updateFields.approvedAt = updateFields.updatedAt;
    } else if (status === 'rejected') {
      updateFields.rejectedBy = req.user?.id || 'admin';
      updateFields.rejectedAt = updateFields.updatedAt;
      if (rejectionReason) updateFields.rejectionReason = rejectionReason;
    }

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      await db.collection(collectionName).updateOne({ id }, { $set: updateFields });
    }

    await createAuditLog({
      actorId: req.user?.id,
      userName: req.user?.name || 'مدير النظام',
      userRole: req.user?.role || 'admin',
      action: `ADMIN_MODERATED_${entityType.toUpperCase()}`,
      resource: collectionName,
      resourceId: id,
      details: `تم تعديل حالة (${entityType}) صاحب المعرف ${id} إلى (${status})`
    });

    return res.json({ success: true, message: `تم تحديث حالة الكيان إلى (${status}) بنجاح` });
  } catch (err: any) {
    Logger.error('[WAH Moderation] Error updating status:', err);
    return res.status(500).json({ success: false, error: 'فشل تعديل حالة الاعتماد' });
  }
});

// ==========================================
// 11. PLATFORM SETTINGS (إعدادات المنصة والمحتوى المميز)
// ==========================================

router.get('/settings', async (req: Request, res: Response) => {
  try {
    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      const settings = await db.collection<PlatformSettingsDoc>('platform_settings').findOne({});
      if (settings) return res.json({ success: true, data: settings });
    }
    return res.json({
      success: true,
      data: {
        siteName: 'وه | WAH',
        shippingFlatRate: 45,
        freeShippingThreshold: 500,
        featuredGovernorates: [],
        featuredCrafts: [],
        featuredStories: []
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل جلب إعدادات المنصة' });
  }
});

router.put('/settings', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date().toISOString(), updatedBy: req.user?.id || 'admin' };
    delete updateData._id;

    const { db, isMongo } = await getMongoOrMemory();
    if (isMongo && db) {
      await db.collection('platform_settings').updateOne(
        { id: updateData.id || 'platform-settings-default' },
        { $set: updateData },
        { upsert: true }
      );
    }

    await createAuditLog({
      actorId: req.user?.id,
      userName: req.user?.name || 'مدير النظام',
      userRole: req.user?.role || 'admin',
      action: 'ADMIN_UPDATED_PLATFORM_SETTINGS',
      resource: 'platform_settings',
      details: 'تم تحديث إعدادات المنصة والأسعار والمحتوى البارز في قاعدة البيانات'
    });

    return res.json({ success: true, message: 'تم حفظ إعدادات المنصة بنجاح في قاعدة البيانات', data: updateData });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل حفظ إعدادات المنصة' });
  }
});

// ==========================================
// 12. INTERACTIVE MAP DATA (خريطة الصعيد التفاعلية)
// ==========================================

router.get('/map', async (req: Request, res: Response) => {
  try {
    const { db, isMongo } = await getMongoOrMemory();

    if (isMongo && db) {
      const govs = await db.collection<GovernorateDoc>('wah_governorates').find({ status: { $ne: 'archived' } }).toArray();

      const mapData = await Promise.all(
        govs.map(async (gov) => {
          const [placesCount, craftsCount, storiesCount, foodsCount, eventsCount, productsCount, artisansCount, reelsCount] = await Promise.all([
            db.collection('wah_heritage_places').countDocuments({ $or: [{ governorateId: gov.id }, { governorateName: gov.name }], status: { $ne: 'archived' } }),
            db.collection('wah_cultural_crafts').countDocuments({ governorates: gov.name, status: { $ne: 'archived' } }),
            db.collection('wah_stories').countDocuments({ $or: [{ governorateId: gov.id }, { governorateName: gov.name }], status: { $ne: 'archived' } }),
            db.collection('wah_food').countDocuments({ $or: [{ governorateId: gov.id }, { governorateName: gov.name }], status: { $ne: 'archived' } }),
            db.collection('wah_events').countDocuments({ $or: [{ governorateId: gov.id }, { governorateName: gov.name }], status: { $ne: 'archived' } }),
            db.collection('products').countDocuments({ sellerGovernorate: gov.name }),
            db.collection('wah_people').countDocuments({ $or: [{ governorateId: gov.id }, { governorateName: gov.name }], status: { $ne: 'archived' } }),
            db.collection('wah_reels').countDocuments({ $or: [{ governorateId: gov.id }, { governorateName: gov.name }], status: { $ne: 'archived' } })
          ]);

          return {
            id: gov.id,
            name: gov.name,
            slug: gov.slug,
            nickname: gov.nickname || `${gov.name} الأصيلة`,
            region: gov.region || 'جنوب الصعيد',
            nileSegment: gov.nileSegment || 'مجرى النيل الخالد',
            shortIntro: gov.shortIntro,
            coverImage: gov.coverImage,
            capitalCity: gov.capitalCity,
            famousFor: gov.famousFor || [],
            coordinates: gov.mapCoordinates || { lat: 26.0, lng: 32.0 },
            stats: {
              placesCount,
              craftsCount,
              storiesCount,
              foodsCount,
              eventsCount,
              productsCount,
              artisansCount,
              reelsCount
            }
          };
        })
      );

      // Fetch dynamic markers across collections
      const [places, crafts, foods, events, people, stories] = await Promise.all([
        db.collection<HeritagePlaceDoc>('wah_heritage_places').find({ status: { $ne: 'archived' } }).toArray(),
        db.collection<CulturalCraftDoc>('wah_cultural_crafts').find({ status: { $ne: 'archived' } }).toArray(),
        db.collection<UpperEgyptFoodDoc>('wah_food').find({ status: { $ne: 'archived' } }).toArray(),
        db.collection<CulturalEventDoc>('wah_events').find({ status: { $ne: 'archived' } }).toArray(),
        db.collection<LocalPersonDoc>('wah_people').find({ status: { $ne: 'archived' } }).toArray(),
        db.collection<WahStoryDoc>('wah_stories').find({ status: { $ne: 'archived' } }).toArray()
      ]);

      const govCoordsMap = new Map<string, { lat: number; lng: number }>();
      mapData.forEach(g => {
        govCoordsMap.set(g.id, g.coordinates);
        govCoordsMap.set(g.name, g.coordinates);
      });

      const markers: any[] = [];

      // Add Heritage Place markers
      places.forEach((p, idx) => {
        const baseCoord = p.coordinates || govCoordsMap.get(p.governorateId) || govCoordsMap.get(p.governorateName) || { lat: 26.0, lng: 32.0 };
        // If coordinate is default or matches base exactly, add gentle deterministic offset
        const lat = p.coordinates?.lat ?? (baseCoord.lat + ((idx % 5) - 2) * 0.04);
        const lng = p.coordinates?.lng ?? (baseCoord.lng + (((idx * 3) % 5) - 2) * 0.04);

        markers.push({
          id: p.id,
          title: p.title,
          slug: p.slug,
          type: 'place',
          typeLabel: 'معلم تراثي',
          governorateId: p.governorateId,
          governorateName: p.governorateName,
          category: p.category,
          lat,
          lng,
          coverImage: p.coverImage,
          shortDescription: p.description?.substring(0, 150),
          isFeatured: p.isFeatured ?? (idx < 8),
          rating: p.rating ?? 4.9,
          detailsUrl: `/places/${p.slug}`
        });
      });

      // Add Cultural Craft markers
      crafts.forEach((c, idx) => {
        const primaryGov = c.governorates?.[0] || 'الأقصر';
        const baseCoord = c.coordinates || govCoordsMap.get(primaryGov) || { lat: 25.7, lng: 32.6 };
        const lat = c.coordinates?.lat ?? (baseCoord.lat + 0.03 * ((idx % 3) + 1));
        const lng = c.coordinates?.lng ?? (baseCoord.lng - 0.04 * ((idx % 3) + 1));

        markers.push({
          id: c.id,
          title: c.title,
          slug: c.slug,
          type: 'craft',
          typeLabel: 'حرفة تراثية',
          governorateId: primaryGov,
          governorateName: primaryGov,
          category: 'craft',
          lat,
          lng,
          coverImage: c.coverImage,
          shortDescription: c.shortDescription?.substring(0, 150),
          isFeatured: c.isFeatured ?? true,
          detailsUrl: `/crafts/${c.slug}`
        });
      });

      // Add Traditional Foods
      foods.forEach((f, idx) => {
        const baseCoord = f.coordinates || govCoordsMap.get(f.governorateId) || govCoordsMap.get(f.governorateName) || { lat: 26.2, lng: 32.7 };
        const lat = f.coordinates?.lat ?? (baseCoord.lat - 0.03 * ((idx % 3) + 1));
        const lng = f.coordinates?.lng ?? (baseCoord.lng + 0.03 * ((idx % 3) + 1));

        markers.push({
          id: f.id,
          title: f.title,
          slug: f.slug,
          type: 'food',
          typeLabel: 'مأكول تراثي',
          governorateId: f.governorateId,
          governorateName: f.governorateName,
          category: 'food',
          lat,
          lng,
          coverImage: f.coverImage,
          shortDescription: f.description?.substring(0, 150),
          isFeatured: f.isFeatured ?? false,
          detailsUrl: `/food/${f.slug}`
        });
      });

      // Add Cultural Events
      events.forEach((e, idx) => {
        const baseCoord = e.coordinates || govCoordsMap.get(e.governorateId) || govCoordsMap.get(e.governorateName) || { lat: 26.5, lng: 31.7 };
        markers.push({
          id: e.id,
          title: e.title,
          slug: e.slug,
          type: 'event',
          typeLabel: 'فعالية ثقافية',
          governorateId: e.governorateId,
          governorateName: e.governorateName,
          category: e.category,
          lat: e.coordinates?.lat ?? (baseCoord.lat + 0.02 * ((idx % 2) ? 1 : -1)),
          lng: e.coordinates?.lng ?? (baseCoord.lng + 0.02 * ((idx % 2) ? -1 : 1)),
          coverImage: e.coverImage,
          shortDescription: `${e.eventDate} - ${e.locationName}`,
          isFeatured: e.isFeatured ?? true,
          detailsUrl: `/events/${e.slug}`
        });
      });

      // Add People / Artisans
      people.forEach((p, idx) => {
        const baseCoord = p.coordinates || govCoordsMap.get(p.governorateId) || govCoordsMap.get(p.governorateName) || { lat: 27.2, lng: 31.2 };
        markers.push({
          id: p.id,
          title: p.name,
          slug: p.slug,
          type: 'artisan',
          typeLabel: 'شخصية ومبدع',
          governorateId: p.governorateId,
          governorateName: p.governorateName,
          category: p.craftOrSkill,
          lat: p.coordinates?.lat ?? (baseCoord.lat + 0.025 * ((idx % 3) - 1)),
          lng: p.coordinates?.lng ?? (baseCoord.lng + 0.025 * ((idx % 2) - 1)),
          coverImage: p.avatarUrl,
          shortDescription: p.titleOrRole,
          isFeatured: p.isFeatured ?? false,
          detailsUrl: `/people/${p.slug}`
        });
      });

      // Add Stories
      stories.forEach((s, idx) => {
        const baseCoord = s.coordinates || govCoordsMap.get(s.governorateId) || govCoordsMap.get(s.governorateName) || { lat: 28.1, lng: 30.7 };
        markers.push({
          id: s.id,
          title: s.title,
          slug: s.slug,
          type: 'story',
          typeLabel: 'حكاية وتراث',
          governorateId: s.governorateId,
          governorateName: s.governorateName,
          category: s.category,
          lat: s.coordinates?.lat ?? (baseCoord.lat - 0.02 * ((idx % 3) + 1)),
          lng: s.coordinates?.lng ?? (baseCoord.lng - 0.03 * ((idx % 3) + 1)),
          coverImage: s.coverImage,
          shortDescription: s.excerpt?.substring(0, 150),
          isFeatured: s.isFeatured ?? false,
          detailsUrl: `/stories/${s.slug}`
        });
      });

      const featuredPlaces = markers.filter(m => m.isFeatured);

      const totalStats = {
        governoratesCount: mapData.length,
        placesCount: places.length,
        craftsCount: crafts.length,
        storiesCount: stories.length,
        foodsCount: foods.length,
        artisansCount: people.length,
        eventsCount: events.length,
        productsCount: mapData.reduce((acc, g) => acc + g.stats.productsCount, 0),
        reelsCount: mapData.reduce((acc, g) => acc + (g.stats.reelsCount || 0), 0)
      };

      return res.json({
        success: true,
        data: mapData,
        governorates: mapData,
        markers,
        featuredPlaces,
        stats: totalStats
      });
    }

    // Fallback in-memory
    const mapData = memoryDb.governorates.map((gov) => ({
      id: gov.id,
      name: gov.name,
      slug: gov.slug,
      nickname: gov.nickname || `${gov.name} الأصيلة`,
      region: gov.region || 'جنوب الصعيد',
      nileSegment: gov.nileSegment || 'مجرى النيل الخالد',
      shortIntro: gov.shortIntro,
      coverImage: gov.coverImage,
      capitalCity: gov.capitalCity,
      famousFor: gov.famousFor || [],
      coordinates: gov.mapCoordinates || { lat: 26.0, lng: 32.0 },
      stats: {
        placesCount: 5,
        craftsCount: 4,
        storiesCount: 3,
        foodsCount: 3,
        eventsCount: 2,
        productsCount: 4,
        artisansCount: 3,
        reelsCount: 2
      }
    }));

    return res.json({
      success: true,
      data: mapData,
      governorates: mapData,
      markers: [],
      featuredPlaces: [],
      stats: {
        governoratesCount: mapData.length,
        placesCount: 15,
        craftsCount: 10,
        storiesCount: 8,
        foodsCount: 8,
        artisansCount: 6,
        eventsCount: 5,
        productsCount: 12,
        reelsCount: 6
      }
    });
  } catch (err: any) {
    Logger.error('[WAH Map] Error generating map data:', err);
    return res.status(500).json({ success: false, error: 'فشل جلب بيانات الخريطة' });
  }
});

// Admin endpoint to set or calibrate entity coordinates on the map
router.post('/map/coordinates', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { entityType, id, lat, lng, isFeatured } = req.body;
    if (!entityType || !id || typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ success: false, error: 'نوع الكيان والمعرف والإحداثيات (lat, lng) مطلوبة' });
    }

    const { db, isMongo } = await getMongoOrMemory();

    if (entityType === 'governorate') {
      if (isMongo && db) {
        await db.collection('wah_governorates').updateOne(
          { id },
          { $set: { mapCoordinates: { lat, lng }, updatedAt: new Date().toISOString() } }
        );
      }
      const gov = memoryDb.governorates.find(g => g.id === id);
      if (gov) {
        gov.mapCoordinates = { lat, lng };
        gov.updatedAt = new Date().toISOString();
      }
      return res.json({ success: true, message: 'تم تحديث إحداثيات المحافظة بنجاح' });
    }

    const collectionMap: Record<string, string> = {
      place: 'wah_heritage_places',
      craft: 'wah_cultural_crafts',
      food: 'wah_food',
      event: 'wah_events',
      artisan: 'wah_people',
      story: 'wah_stories'
    };

    const collectionName = collectionMap[entityType];
    if (!collectionName) {
      return res.status(400).json({ success: false, error: 'نوع كيان غير مدعوم' });
    }

    const updateFields: any = {
      coordinates: { lat, lng },
      updatedAt: new Date().toISOString()
    };
    if (typeof isFeatured === 'boolean') {
      updateFields.isFeatured = isFeatured;
    }

    if (isMongo && db) {
      await db.collection(collectionName).updateOne({ id }, { $set: updateFields });
    }

    return res.json({ success: true, message: 'تم تحديث إحداثيات العنصر على الخريطة بنجاح' });
  } catch (err: any) {
    Logger.error('[WAH Map] Error updating coordinates:', err);
    return res.status(500).json({ success: false, error: 'فشل تحديث الإحداثيات' });
  }
});

// ==========================================
// 13. UNIFIED GLOBAL SEARCH (البحث الشامل)
// ==========================================

router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query || query.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const { db, isMongo } = await getMongoOrMemory();
    const results: any[] = [];
    const regex = new RegExp(query, 'i');

    if (isMongo && db) {
      const [govs, places, crafts, stories, foods, products] = await Promise.all([
        db.collection<GovernorateDoc>('wah_governorates').find({ $or: [{ name: regex }, { shortIntro: regex }, { famousFor: regex }] }).limit(5).toArray(),
        db.collection<HeritagePlaceDoc>('wah_heritage_places').find({ $or: [{ title: regex }, { description: regex }, { governorateName: regex }] }).limit(5).toArray(),
        db.collection<CulturalCraftDoc>('wah_cultural_crafts').find({ $or: [{ title: regex }, { shortDescription: regex }, { governorates: regex }] }).limit(5).toArray(),
        db.collection<WahStoryDoc>('wah_stories').find({ $or: [{ title: regex }, { excerpt: regex }, { content: regex }] }).limit(5).toArray(),
        db.collection<UpperEgyptFoodDoc>('wah_food').find({ $or: [{ title: regex }, { description: regex }, { ingredients: regex }] }).limit(5).toArray(),
        db.collection('products').find({ $or: [{ title: regex }, { description: regex }, { categoryName: regex }, { sellerGovernorate: regex }] }).limit(5).toArray()
      ]);

      govs.forEach((g) => {
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
      });

      places.forEach((p) => {
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
      });

      crafts.forEach((c) => {
        results.push({
          id: c.id,
          title: c.title,
          type: 'craft',
          typeLabel: 'حرفة أصيلة',
          subtitle: `تشتهر بها: ${c.governorates?.join('، ') || 'محافظات الصعيد'}`,
          coverImage: c.coverImage,
          url: `/crafts/${c.slug}`,
          slug: c.slug
        });
      });

      stories.forEach((s) => {
        results.push({
          id: s.id,
          title: s.title,
          type: 'story',
          typeLabel: 'وه بيحكي',
          subtitle: `${s.governorateName} • قراءة ${s.readingTimeMinutes || 3} دقائق`,
          coverImage: s.coverImage,
          url: `/stories/${s.slug}`,
          slug: s.slug
        });
      });

      foods.forEach((f) => {
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
      });

      products.forEach((p: any) => {
        results.push({
          id: p.id,
          title: p.title,
          type: 'product',
          typeLabel: 'سوق وه',
          subtitle: `${p.price} ج.م • صنع في ${p.sellerGovernorate || 'الصعيد'}`,
          coverImage: p.images?.[0] || '',
          url: `/products?id=${p.id}`,
          slug: p.id
        });
      });

      return res.json({ success: true, count: results.length, data: results });
    }

    return res.json({ success: true, count: 0, data: [] });
  } catch (err: any) {
    Logger.error('[WAH Search] Error performing unified search:', err);
    return res.status(500).json({ success: false, error: 'فشل تنفيذ البحث' });
  }
});

// ==========================================
// 14. ECOSYSTEM STATS (إحصائيات المنصة الحية من MongoDB)
// ==========================================

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { db, isMongo } = await getMongoOrMemory();

    if (isMongo && db) {
      const [
        governoratesCount,
        citiesCount,
        villagesCount,
        placesCount,
        craftsCount,
        traditionsCount,
        storiesCount,
        peopleCount,
        foodsCount,
        eventsCount,
        productsCount,
        sellersCount,
        ordersCount,
        reelsCount
      ] = await Promise.all([
        db.collection('wah_governorates').countDocuments(),
        db.collection('wah_cities').countDocuments(),
        db.collection('wah_villages').countDocuments(),
        db.collection('wah_heritage_places').countDocuments(),
        db.collection('wah_cultural_crafts').countDocuments(),
        db.collection('wah_traditions').countDocuments(),
        db.collection('wah_stories').countDocuments(),
        db.collection('wah_local_people').countDocuments(),
        db.collection('wah_food').countDocuments(),
        db.collection('wah_events').countDocuments(),
        db.collection('products').countDocuments(),
        db.collection('sellers').countDocuments(),
        db.collection('orders').countDocuments(),
        db.collection('reels').countDocuments()
      ]);

      return res.json({
        success: true,
        data: {
          governoratesCount,
          citiesCount,
          villagesCount,
          placesCount,
          craftsCount,
          traditionsCount,
          storiesCount,
          peopleCount,
          foodsCount,
          eventsCount,
          productsCount,
          sellersCount,
          ordersCount,
          reelsCount
        }
      });
    }

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
        productsCount: memoryDb.products.length,
        sellersCount: memoryDb.sellers.length
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'فشل جلب إحصائيات المنصة' });
  }
});

export default router;

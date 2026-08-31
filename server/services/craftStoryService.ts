import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { CraftStoryDocument, CraftVerificationStatus, CraftSource, CraftCoordinates } from '../models/types.ts';
import type { AuthenticatedUser } from '../middleware/auth.ts';
import { createAuditLog } from './auditService.ts';
import { cacheService } from './cacheService.ts';

/**
 * Get all craft stories strictly from the database.
 * Public requests retrieve only active & verified/published records.
 * Admin requests can retrieve all records including drafts/inactives.
 */
export async function getAllCraftStories(
  includeInactive = false,
  filters?: { governorate?: string; categoryId?: string; search?: string }
): Promise<CraftStoryDocument[]> {
  const filterKey = `${filters?.governorate || ''}_${filters?.categoryId || ''}_${filters?.search || ''}`;
  const cacheKey = `craft_stories:${includeInactive ? 'all' : 'active'}:${filterKey}`;
  const cached = cacheService.get<CraftStoryDocument[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const { db, isMongo } = await getDatabase();
  let stories: CraftStoryDocument[] = [];

  if (isMongo && db) {
    try {
      const query: any = {};
      if (!includeInactive) {
        query.active = { $ne: false };
        query.verificationStatus = { $nin: ['draft', 'rejected'] };
      }
      if (filters?.governorate) {
        query.governorate = { $regex: new RegExp(filters.governorate, 'i') };
      }
      if (filters?.categoryId) {
        query.categoryId = filters.categoryId;
      }
      if (filters?.search) {
        const searchRegex = { $regex: new RegExp(filters.search, 'i') };
        query.$or = [
          { title: searchRegex },
          { subtitle: searchRegex },
          { description: searchRegex },
          { governorate: searchRegex },
          { city: searchRegex },
          { village: searchRegex }
        ];
      }

      stories = (await db
        .collection('craft_stories')
        .find(query)
        .sort({ displayOrder: 1, createdAt: 1 })
        .toArray()) as unknown as CraftStoryDocument[];

      cacheService.set(cacheKey, stories, 600, ['craft_stories']);
      return stories;
    } catch (e) {
      console.error('[CraftStoryService] MongoDB getAllCraftStories error:', e);
    }
  }

  // Fallback to in-memory store ONLY if MongoDB was unreachable
  stories = (memoryDb.craftStories || []) as unknown as CraftStoryDocument[];
  if (!includeInactive) {
    stories = stories.filter(
      (s) => s.active !== false && s.verificationStatus !== 'draft' && s.verificationStatus !== 'rejected'
    );
  }
  if (filters?.governorate) {
    stories = stories.filter((s) => s.governorate?.includes(filters.governorate!));
  }
  if (filters?.categoryId) {
    stories = stories.filter((s) => s.categoryId === filters.categoryId);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    stories = stories.filter(
      (s) =>
        s.title?.toLowerCase().includes(q) ||
        s.subtitle?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.governorate?.toLowerCase().includes(q)
    );
  }
  stories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  cacheService.set(cacheKey, stories, 600, ['craft_stories']);
  return stories;
}

/**
 * Get craft story by unique ID.
 */
export async function getCraftStoryById(id: string): Promise<CraftStoryDocument | null> {
  const cacheKey = `craft_story:${id}`;
  const cached = cacheService.get<CraftStoryDocument>(cacheKey);
  if (cached) return cached;

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const story = (await db.collection('craft_stories').findOne({ id })) as unknown as CraftStoryDocument | null;
      if (story) {
        cacheService.set(cacheKey, story, 600, ['craft_stories']);
        return story;
      }
      return null;
    } catch (e) {
      console.error('[CraftStoryService] MongoDB getCraftStoryById error:', e);
    }
  }

  const story = (memoryDb.craftStories || []).find((s) => s.id === id);
  if (story) {
    cacheService.set(cacheKey, story as unknown as CraftStoryDocument, 600, ['craft_stories']);
  }
  return (story as unknown as CraftStoryDocument) || null;
}

/**
 * Create a new craft story by platform admin.
 */
export async function createCraftStory(
  adminUser: AuthenticatedUser,
  data: Partial<CraftStoryDocument>
): Promise<CraftStoryDocument> {
  if (adminUser.role !== 'admin') {
    throw new Error('فقط مدير المنصة يملك صلاحية إضافة وتوثيق الحرف التراثية');
  }

  if (!data.title || !data.title.trim()) {
    throw new Error('عنوان الحرفة التراثية مطلوب');
  }

  if (!data.description || !data.description.trim()) {
    throw new Error('وصف وتوثيق الحرفة مطلوب');
  }

  if (!data.governorate || !data.governorate.trim()) {
    throw new Error('محافظة المنشأ مطلوبة لتوثيق الحرفة');
  }

  const newId = data.id?.trim() || `craft-${Date.now()}`;

  // Check ID uniqueness
  const existing = await getCraftStoryById(newId);
  if (existing) {
    throw new Error(`معرّف الحرفة "${newId}" مستخدم بالفعل، يرجى اختيار معرّف آخر`);
  }

  // Parse and clean sources array
  const sources: CraftSource[] = Array.isArray(data.sources)
    ? data.sources.map((s) => ({
        sourceName: s.sourceName?.trim() || '',
        sourceUrl: s.sourceUrl?.trim() || '',
        sourceType: s.sourceType?.trim() || '',
        sourceDate: s.sourceDate?.trim() || ''
      })).filter((s) => s.sourceName || s.sourceUrl)
    : [];

  // Parse coordinates
  let coordinates: CraftCoordinates | undefined;
  if (
    data.coordinates &&
    typeof data.coordinates.lat === 'number' &&
    typeof data.coordinates.lng === 'number' &&
    !isNaN(data.coordinates.lat) &&
    !isNaN(data.coordinates.lng)
  ) {
    coordinates = {
      lat: data.coordinates.lat,
      lng: data.coordinates.lng
    };
  }

  const newStory: CraftStoryDocument = {
    id: newId,
    title: data.title.trim(),
    subtitle: data.subtitle?.trim() || '',
    governorate: data.governorate.trim(),
    city: data.city?.trim() || undefined,
    village: data.village?.trim() || undefined,
    location: data.location?.trim() || undefined,
    historyAge: data.historyAge?.trim() || '',
    image: data.image?.trim() || '',
    images: Array.isArray(data.images)
      ? data.images.filter((img) => typeof img === 'string' && img.trim().length > 0)
      : data.image?.trim()
      ? [data.image.trim()]
      : [],
    description: data.description.trim(),
    materials: Array.isArray(data.materials)
      ? data.materials.filter((m) => typeof m === 'string' && m.trim().length > 0)
      : [],
    techniques: Array.isArray(data.techniques)
      ? data.techniques.filter((t) => typeof t === 'string' && t.trim().length > 0)
      : [],
    heritageSignificance: data.heritageSignificance?.trim() || undefined,
    artisan: data.artisan?.trim() || undefined,
    sources,
    coordinates,
    keyFeatures: Array.isArray(data.keyFeatures)
      ? data.keyFeatures.filter((f) => typeof f === 'string' && f.trim().length > 0)
      : [],
    categoryId: data.categoryId?.trim() || 'pottery',
    subCategory: data.subCategory?.trim() || undefined,
    verificationStatus: data.verificationStatus || 'verified',
    displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 99,
    active: data.active ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('craft_stories').insertOne(newStory as any);
    } catch (e) {
      console.error('[CraftStoryService] MongoDB createCraftStory error:', e);
    }
  }

  if (!memoryDb.craftStories) {
    memoryDb.craftStories = [];
  }
  memoryDb.craftStories.push(newStory as any);

  cacheService.invalidateCraftStories();

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'CRAFT_STORY_CREATED',
    resource: 'توثيق حرفة تراثية',
    resourceId: newStory.id,
    status: 'نجاح',
    details: `تم توثيق حرفة تراثية جديدة "${newStory.title}" بمحافظة ${newStory.governorate}`
  });

  return newStory;
}

/**
 * Update an existing craft story by admin.
 */
export async function updateCraftStory(
  adminUser: AuthenticatedUser,
  storyId: string,
  updates: Partial<CraftStoryDocument>
): Promise<CraftStoryDocument> {
  if (adminUser.role !== 'admin') {
    throw new Error('فقط مدير المنصة يملك صلاحية تعديل الحرف التراثية');
  }

  const story = await getCraftStoryById(storyId);
  if (!story) {
    throw new Error('سجل الحرفة التراثية غير موجود');
  }

  const safeUpdates: Partial<CraftStoryDocument> = {
    ...updates,
    updatedAt: new Date().toISOString()
  };

  if (safeUpdates.title) safeUpdates.title = safeUpdates.title.trim();
  if (safeUpdates.subtitle !== undefined) safeUpdates.subtitle = safeUpdates.subtitle?.trim();
  if (safeUpdates.governorate) safeUpdates.governorate = safeUpdates.governorate.trim();
  if (safeUpdates.city !== undefined) safeUpdates.city = safeUpdates.city?.trim();
  if (safeUpdates.village !== undefined) safeUpdates.village = safeUpdates.village?.trim();
  if (safeUpdates.description) safeUpdates.description = safeUpdates.description.trim();

  // Clean arrays if provided
  if (safeUpdates.keyFeatures && Array.isArray(safeUpdates.keyFeatures)) {
    safeUpdates.keyFeatures = safeUpdates.keyFeatures.filter(
      (f) => typeof f === 'string' && f.trim().length > 0
    );
  }
  if (safeUpdates.materials && Array.isArray(safeUpdates.materials)) {
    safeUpdates.materials = safeUpdates.materials.filter(
      (m) => typeof m === 'string' && m.trim().length > 0
    );
  }
  if (safeUpdates.techniques && Array.isArray(safeUpdates.techniques)) {
    safeUpdates.techniques = safeUpdates.techniques.filter(
      (t) => typeof t === 'string' && t.trim().length > 0
    );
  }
  if (safeUpdates.sources && Array.isArray(safeUpdates.sources)) {
    safeUpdates.sources = safeUpdates.sources.filter((s) => s.sourceName || s.sourceUrl);
  }

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('craft_stories').updateOne({ id: story.id }, { $set: safeUpdates });
    } catch (e) {
      console.error('[CraftStoryService] MongoDB updateCraftStory error:', e);
    }
  }

  const memStory = (memoryDb.craftStories || []).find((s) => s.id === story.id);
  if (memStory) {
    Object.assign(memStory, safeUpdates);
  }

  cacheService.invalidateCraftStories(story.id);

  const updatedStory = { ...story, ...safeUpdates };

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'CRAFT_STORY_UPDATED',
    resource: 'توثيق حرفة تراثية',
    resourceId: story.id,
    status: 'نجاح',
    details: `تم تحديث توثيق الحرفة التراثية "${story.title}" [${story.id}]`
  });

  return updatedStory;
}

/**
 * Delete a craft story by admin.
 */
export async function deleteCraftStory(adminUser: AuthenticatedUser, storyId: string): Promise<boolean> {
  if (adminUser.role !== 'admin') {
    throw new Error('فقط مدير المنصة يملك صلاحية حذف الحرف التراثية');
  }

  const story = await getCraftStoryById(storyId);
  if (!story) {
    throw new Error('سجل الحرفة التراثية غير موجود');
  }

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('craft_stories').deleteOne({ id: story.id });
    } catch (e) {
      console.error('[CraftStoryService] MongoDB deleteCraftStory error:', e);
    }
  }

  const idx = (memoryDb.craftStories || []).findIndex((s) => s.id === story.id);
  if (idx !== -1) {
    memoryDb.craftStories.splice(idx, 1);
  }

  cacheService.invalidateCraftStories(story.id);

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'CRAFT_STORY_DELETED',
    resource: 'توثيق حرفة تراثية',
    resourceId: story.id,
    status: 'تنبيه',
    details: `تم حذف توثيق الحرفة التراثية "${story.title}" [${story.id}] بواسطة الإدارة`
  });

  return true;
}

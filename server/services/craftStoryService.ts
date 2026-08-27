import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { CraftStoryDocument } from '../models/types.ts';
import { AuthenticatedUser } from '../middleware/auth.ts';
import { createAuditLog } from './auditService.ts';
import { cacheService } from './cacheService.ts';

/**
 * Get all craft stories with caching.
 * Public requests retrieve only active: true.
 * Admin requests can retrieve all (active and inactive).
 */
export async function getAllCraftStories(includeInactive = false): Promise<CraftStoryDocument[]> {
  const cacheKey = `craft_stories:${includeInactive ? 'all' : 'active'}`;
  const cached = cacheService.get<CraftStoryDocument[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const { db, isMongo } = await getDatabase();
  let stories: CraftStoryDocument[] = [];

  if (isMongo && db) {
    try {
      const query = includeInactive ? {} : { active: { $ne: false } };
      stories = (await db
        .collection('craft_stories')
        .find(query)
        .sort({ displayOrder: 1, createdAt: 1 })
        .toArray()) as unknown as CraftStoryDocument[];
      if (stories.length > 0) {
        cacheService.set(cacheKey, stories, 600, ['craft_stories']);
        return stories;
      }
    } catch (e) {
      console.error('[CraftStoryService] MongoDB getAllCraftStories error:', e);
    }
  }

  // Fallback to in-memory store
  stories = (memoryDb.craftStories || []) as unknown as CraftStoryDocument[];
  if (!includeInactive) {
    stories = stories.filter((s) => s.active !== false);
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
    throw new Error('فقط مدير المنصة يملك صلاحية إضافة قصص صنعة جديدة');
  }

  if (!data.title || !data.title.trim()) {
    throw new Error('عنوان الحرفة التراثية مطلوب');
  }

  if (!data.description || !data.description.trim()) {
    throw new Error('وصف وقصة الحرفة مطلوب');
  }

  const newId = data.id?.trim() || `craft-${Date.now()}`;

  // Check ID uniqueness
  const existing = await getCraftStoryById(newId);
  if (existing) {
    throw new Error(`معرّف القصة "${newId}" مستخدم بالفعل، يرجى اختيار معرّف آخر`);
  }

  const newStory: CraftStoryDocument = {
    id: newId,
    title: data.title.trim(),
    subtitle: data.subtitle?.trim() || '',
    governorate: data.governorate?.trim() || 'صعيد مصر',
    historyAge: data.historyAge?.trim() || 'متوارثة عبر الأجيال',
    image: data.image?.trim() || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
    description: data.description.trim(),
    keyFeatures: Array.isArray(data.keyFeatures)
      ? data.keyFeatures.filter((f) => typeof f === 'string' && f.trim().length > 0)
      : [],
    categoryId: data.categoryId?.trim() || 'pottery',
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
    resource: 'قصة صنعة تراثية',
    resourceId: newStory.id,
    status: 'نجاح',
    details: `تم إنشاء قصة صنعة تراثية جديدة "${newStory.title}" بمحافظة ${newStory.governorate}`
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
    throw new Error('فقط مدير المنصة يملك صلاحية تعديل قصص الصنعة');
  }

  const story = await getCraftStoryById(storyId);
  if (!story) {
    throw new Error('قصة الصنعة غير موجودة');
  }

  const safeUpdates: Partial<CraftStoryDocument> = {
    ...updates,
    updatedAt: new Date().toISOString()
  };

  // Clean keyFeatures array if provided
  if (safeUpdates.keyFeatures && Array.isArray(safeUpdates.keyFeatures)) {
    safeUpdates.keyFeatures = safeUpdates.keyFeatures.filter(
      (f) => typeof f === 'string' && f.trim().length > 0
    );
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
    resource: 'قصة صنعة تراثية',
    resourceId: story.id,
    status: 'نجاح',
    details: `تم تحديث قصة الصنعة التراثية "${story.title}" [${story.id}]`
  });

  return updatedStory;
}

/**
 * Delete a craft story by admin.
 */
export async function deleteCraftStory(adminUser: AuthenticatedUser, storyId: string): Promise<boolean> {
  if (adminUser.role !== 'admin') {
    throw new Error('فقط مدير المنصة يملك صلاحية حذف قصص الصنعة');
  }

  const story = await getCraftStoryById(storyId);
  if (!story) {
    throw new Error('قصة الصنعة غير موجودة');
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
    resource: 'قصة صنعة تراثية',
    resourceId: story.id,
    status: 'تنبيه',
    details: `تم حذف قصة الصنعة التراثية "${story.title}" [${story.id}] بواسطة الإدارة`
  });

  return true;
}

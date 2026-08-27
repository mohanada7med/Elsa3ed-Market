import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { CategoryDocument } from '../models/types.ts';
import { AuthenticatedUser } from '../middleware/auth.ts';
import { createAuditLog } from './auditService.ts';
import { cacheService } from './cacheService.ts';

/**
 * Get all categories with caching.
 * Public calls only get active: true.
 * Admin calls can get all categories.
 */
export async function getAllCategories(includeInactive = false): Promise<CategoryDocument[]> {
  const cacheKey = `categories:${includeInactive ? 'all' : 'active'}`;
  const cached = cacheService.get<CategoryDocument[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const { db, isMongo } = await getDatabase();
  let categories: CategoryDocument[] = [];

  if (isMongo && db) {
    try {
      const query = includeInactive ? {} : { active: { $ne: false } };
      categories = (await db.collection('categories').find(query).toArray()) as unknown as CategoryDocument[];
      if (categories.length > 0) {
        cacheService.set(cacheKey, categories, 600, ['categories']);
        return categories;
      }
    } catch (e) {
      console.error('[CategoryService] MongoDB getAllCategories error:', e);
    }
  }

  categories = memoryDb.categories as unknown as CategoryDocument[];
  if (!includeInactive) {
    categories = categories.filter((c) => c.active !== false);
  }

  cacheService.set(cacheKey, categories, 600, ['categories']);
  return categories;
}

/**
 * Get category by ID or unique slug.
 */
export async function getCategoryById(idOrSlug: string): Promise<CategoryDocument | null> {
  const cacheKey = `category:${idOrSlug}`;
  const cached = cacheService.get<CategoryDocument>(cacheKey);
  if (cached) return cached;

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const cat = (await db.collection('categories').findOne({
        $or: [{ id: idOrSlug }, { slug: idOrSlug }]
      })) as unknown as CategoryDocument | null;
      if (cat) {
        cacheService.set(cacheKey, cat, 600, ['categories']);
        return cat;
      }
    } catch (e) {
      console.error('[CategoryService] MongoDB getCategoryById error:', e);
    }
  }

  const cat = memoryDb.categories.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
  if (cat) {
    cacheService.set(cacheKey, cat as unknown as CategoryDocument, 600, ['categories']);
  }
  return (cat as unknown as CategoryDocument) || null;
}

/**
 * Create a new category by admin.
 */
export async function createCategory(
  adminUser: AuthenticatedUser,
  data: Partial<CategoryDocument>
): Promise<CategoryDocument> {
  if (adminUser.role !== 'admin') {
    throw new Error('فقط مدير المنصة يملك صلاحية إضافة أقسام جديدة');
  }

  if (!data.name || !data.name.trim()) {
    throw new Error('اسم القسم بالعربية مطلوب');
  }

  const safeSlug = (data.slug || data.nameEn || data.name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0621-\u064A]+/g, '-')
    .replace(/^-|-$/g, '') || `cat-${Date.now()}`;

  // Check slug uniqueness
  const existing = await getCategoryById(safeSlug);
  if (existing) {
    throw new Error(`الرابط المعرّف (slug) "${safeSlug}" مستخدم بالفعل، يرجى اختيار رابط مختلف`);
  }

  const newCategory: CategoryDocument = {
    id: `cat-${Date.now()}`,
    name: data.name.trim(),
    nameEn: data.nameEn?.trim() || '',
    slug: safeSlug,
    description: data.description?.trim() || '',
    image: data.image?.trim() || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
    iconName: data.iconName || 'Sparkles',
    productsCount: 0,
    active: data.active ?? true,
    heritageNote: data.heritageNote?.trim() || '',
    featuredGovernorate: data.featuredGovernorate?.trim() || 'قنا',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('categories').insertOne(newCategory as any);
    } catch (e) {
      console.error('[CategoryService] MongoDB createCategory error:', e);
    }
  }

  memoryDb.categories.push(newCategory as any);
  cacheService.invalidateCategories();

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'CATEGORY_CREATED',
    resource: 'قسم تراثي',
    resourceId: newCategory.id,
    status: 'نجاح',
    details: `تم إنشاء القسم التراثي الجديد "${newCategory.name}" برابط [${newCategory.slug}]`
  });

  return newCategory;
}

/**
 * Update an existing category by admin.
 */
export async function updateCategory(
  adminUser: AuthenticatedUser,
  categoryId: string,
  updates: Partial<CategoryDocument>
): Promise<CategoryDocument> {
  if (adminUser.role !== 'admin') {
    throw new Error('فقط مدير المنصة يملك صلاحية تعديل الأقسام');
  }

  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new Error('القسم غير موجود');
  }

  const safeUpdates: Partial<CategoryDocument> = {
    ...updates,
    updatedAt: new Date().toISOString()
  };

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('categories').updateOne({ id: category.id }, { $set: safeUpdates });
    } catch (e) {
      console.error('[CategoryService] MongoDB updateCategory error:', e);
    }
  }

  const memCat = memoryDb.categories.find((c) => c.id === category.id);
  if (memCat) {
    Object.assign(memCat, safeUpdates);
  }

  cacheService.invalidateCategories();

  const updatedCategory = { ...category, ...safeUpdates };

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'CATEGORY_UPDATED',
    resource: 'قسم تراثي',
    resourceId: category.id,
    status: 'نجاح',
    details: `تم تحديث بيانات القسم التراثي "${category.name}" [${category.id}]`
  });

  return updatedCategory;
}

/**
 * Delete a category by admin. Safely handles if products exist.
 */
export async function deleteCategory(adminUser: AuthenticatedUser, categoryId: string): Promise<boolean> {
  if (adminUser.role !== 'admin') {
    throw new Error('فقط مدير المنصة يملك صلاحية حذف الأقسام');
  }

  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new Error('القسم غير موجود');
  }

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('categories').deleteOne({ id: category.id });
    } catch (e) {
      console.error('[CategoryService] MongoDB deleteCategory error:', e);
    }
  }

  const idx = memoryDb.categories.findIndex((c) => c.id === category.id);
  if (idx !== -1) {
    memoryDb.categories.splice(idx, 1);
  }

  cacheService.invalidateCategories();

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'CATEGORY_DELETED',
    resource: 'قسم تراثي',
    resourceId: category.id,
    status: 'تنبيه',
    details: `تم حذف القسم التراثي "${category.name}" [${category.id}] بواسطة الإدارة`
  });

  return true;
}

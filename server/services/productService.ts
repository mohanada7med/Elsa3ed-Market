import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { ProductDocument, ProductStatus } from '../models/types.ts';
import { createAuditLog } from './auditService.ts';
import { AuthenticatedUser } from '../middleware/auth.ts';
import { cacheService } from './cacheService.ts';
import { Logger } from '../utils/logger.ts';

export interface PublicProductFilters {
  categoryId?: string;
  governorate?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  products: ProductDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Public catalog query: Returns ONLY approved products with caching and pagination.
 */
export async function getPublicProducts(filters?: PublicProductFilters): Promise<ProductDocument[]> {
  const page = Math.max(1, Number(filters?.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(filters?.limit) || 50));
  
  // Cache key based on filter values
  const filterKey = JSON.stringify({ ...filters, page, limit });
  const cacheKey = `products:public:${filterKey}`;
  const cached = cacheService.get<ProductDocument[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const { db, isMongo } = await getDatabase();
  let products: ProductDocument[] = [];

  if (isMongo && db) {
    try {
      const query: any = { approvalStatus: 'approved' };

      if (filters?.categoryId && filters.categoryId !== 'all') {
        query.categoryId = filters.categoryId;
      }
      if (filters?.governorate && filters.governorate !== 'all') {
        query.sellerGovernorate = filters.governorate;
      }
      if (filters?.minPrice !== undefined) {
        query.price = { ...(query.price || {}), $gte: Number(filters.minPrice) };
      }
      if (filters?.maxPrice !== undefined) {
        query.price = { ...(query.price || {}), $lte: Number(filters.maxPrice) };
      }
      if (filters?.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { sellerGovernorate: { $regex: filters.search, $options: 'i' } },
          { categoryName: { $regex: filters.search, $options: 'i' } }
        ];
      }

      let cursor = db.collection('products').find(query);
      if (filters?.sortBy === 'price-low') {
        cursor = cursor.sort({ price: 1 });
      } else if (filters?.sortBy === 'price-high') {
        cursor = cursor.sort({ price: -1 });
      } else if (filters?.sortBy === 'rating') {
        cursor = cursor.sort({ rating: -1 });
      } else {
        cursor = cursor.sort({ createdAt: -1 });
      }

      products = (await cursor.toArray()) as unknown as ProductDocument[];
      cacheService.set(cacheKey, products, 180, ['products']);
      return products;
    } catch (e) {
      console.error('[ProductService] MongoDB query error:', e);
    }
  }

  // Memory store fallback: ALWAYS filter strictly by approvalStatus === 'approved'
  products = memoryDb.products.filter((p) => p.approvalStatus === 'approved');

  if (filters?.categoryId && filters.categoryId !== 'all') {
    products = products.filter((p) => p.categoryId === filters.categoryId);
  }
  if (filters?.governorate && filters.governorate !== 'all') {
    products = products.filter((p) => p.sellerGovernorate === filters.governorate);
  }
  if (filters?.minPrice !== undefined) {
    products = products.filter((p) => p.price >= Number(filters.minPrice));
  }
  if (filters?.maxPrice !== undefined) {
    products = products.filter((p) => p.price <= Number(filters.maxPrice));
  }
  if (filters?.search) {
    const term = filters.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.sellerGovernorate.toLowerCase().includes(term) ||
        p.categoryName.toLowerCase().includes(term)
    );
  }

  if (filters?.sortBy === 'price-low') {
    products.sort((a, b) => a.price - b.price);
  } else if (filters?.sortBy === 'price-high') {
    products.sort((a, b) => b.price - a.price);
  } else if (filters?.sortBy === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  } else {
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  cacheService.set(cacheKey, products, 180, ['products']);
  return products;
}

/**
 * Get single product by ID. If not approved, only owning seller or admin can view.
 */
export async function getProductById(productId: string, user?: AuthenticatedUser): Promise<ProductDocument | null> {
  const cacheKey = `product:${productId}`;
  
  // Only use public cache for unauthenticated / non-admin / non-owner lookups
  if (!user) {
    const cached = cacheService.get<ProductDocument>(cacheKey);
    if (cached) return cached;
  }

  const { db, isMongo } = await getDatabase();
  let product: ProductDocument | null = null;

  if (isMongo && db) {
    try {
      product = (await db.collection('products').findOne({ id: productId })) as unknown as ProductDocument | null;
    } catch (e) {
      console.error('[ProductService] MongoDB findOne error:', e);
    }
  }

  if (!product) {
    product = (memoryDb.products.find((p) => p.id === productId) as ProductDocument) || null;
  }

  if (!product) return null;

  // Authorization check: unapproved products are only accessible to their seller or admins
  if (product.approvalStatus !== 'approved') {
    if (!user) return null;
    const isOwner = user.role === 'seller' && (user.sellerId === product.sellerId || user.id === product.sellerId);
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return null;
    }
  } else {
    // Cache approved product
    cacheService.set(cacheKey, product, 300, ['products']);
  }

  return product;
}

/**
 * Seller-specific query: Returns all products belonging to the seller.
 */
export async function getSellerProducts(sellerId: string): Promise<ProductDocument[]> {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const prods = await db.collection('products').find({ sellerId }).sort({ createdAt: -1 }).toArray();
      return prods as unknown as ProductDocument[];
    } catch (e) {
      console.error('[ProductService] MongoDB seller products error:', e);
    }
  }
  return memoryDb.products.filter((p) => p.sellerId === sellerId) as ProductDocument[];
}

/**
 * Admin-specific query: Returns all products awaiting moderation.
 */
export async function getPendingProducts(): Promise<ProductDocument[]> {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const prods = await db.collection('products').find({ approvalStatus: 'pending' }).sort({ createdAt: -1 }).toArray();
      return prods as unknown as ProductDocument[];
    } catch (e) {
      console.error('[ProductService] MongoDB pending products error:', e);
    }
  }
  return memoryDb.products.filter((p) => p.approvalStatus === 'pending') as ProductDocument[];
}

/**
 * Admin query: Returns all products across the platform with moderation info.
 */
export async function getAllAdminProducts(statusFilter?: ProductStatus): Promise<ProductDocument[]> {
  const { db, isMongo } = await getDatabase();
  const query: any = statusFilter ? { approvalStatus: statusFilter } : {};

  if (isMongo && db) {
    try {
      const prods = await db.collection('products').find(query).sort({ createdAt: -1 }).toArray();
      return prods as unknown as ProductDocument[];
    } catch (e) {
      console.error('[ProductService] MongoDB all admin products error:', e);
    }
  }

  let prods = memoryDb.products as ProductDocument[];
  if (statusFilter) {
    prods = prods.filter((p) => p.approvalStatus === statusFilter);
  }
  return prods;
}

/**
 * Create a new product by a seller.
 */
export async function createProduct(
  sellerUser: AuthenticatedUser,
  data: Partial<ProductDocument>,
  initialStatus: ProductStatus = 'pending'
): Promise<ProductDocument> {
  const sellerId = sellerUser.sellerId || sellerUser.id;
  const sellerName = sellerUser.name || 'ورشة معتمدة';
  const sellerGovernorate = sellerUser.governorate || 'قنا';

  const productId = data.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const newProduct: ProductDocument = {
    id: productId,
    title: data.title?.trim() || 'منتج يدوي جديد',
    titleEn: data.titleEn?.trim() || '',
    categoryId: data.categoryId || 'cat-pottery',
    categoryName: data.categoryName || 'الفخار والخزف',
    sellerId: sellerId,
    sellerName: sellerName,
    sellerGovernorate: sellerGovernorate,
    price: Number(data.price) || 100,
    originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
    discountPercent: data.discountPercent ? Number(data.discountPercent) : undefined,
    rating: 5.0,
    reviewCount: 0,
    inStock: data.inStock ?? true,
    stockCount: Number(data.stockCount) || 10,
    images: data.images && data.images.length > 0 ? data.images : [],
    description: data.description?.trim() || '',
    specifications: {
      material: data.specifications?.material || 'خامات صعيدية طبيعية',
      originGovernorate: data.specifications?.originGovernorate || sellerGovernorate,
      craftsmanship: data.specifications?.craftsmanship || 'صناعة يدوية أصيلة',
      dimensions: data.specifications?.dimensions || '',
      weight: data.specifications?.weight || '',
      careInstructions: data.specifications?.careInstructions || '',
      estimatedMakingTime: data.specifications?.estimatedMakingTime || '٣ أيام'
    },
    tags: data.tags || ['تراث_صعيدي', 'يدوي', sellerGovernorate],
    isHandmade: data.isHandmade ?? true,
    isHeritage: data.isHeritage ?? true,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    approvalStatus: initialStatus,
    approvedAt: null,
    approvedBy: null,
    rejectionReason: null
  };

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('products').insertOne(newProduct as any);
      Logger.info(`[ProductService] Created product in MongoDB: ${newProduct.id} for seller: ${sellerId}`);
    } catch (e: any) {
      console.error('[ProductService] MongoDB insert error:', e);
      throw new Error(`فشل في حفظ بيانات المنتج في قاعدة البيانات: ${e?.message || e}`);
    }
  }

  memoryDb.products.unshift(newProduct as any);
  cacheService.invalidateProducts(newProduct.id);

  // Log audit
  await createAuditLog({
    actorId: sellerUser.id,
    userName: sellerName,
    userRole: 'seller',
    action: initialStatus === 'pending' ? 'SELLER_SUBMITTED_PRODUCT' : 'SELLER_CREATED_DRAFT',
    resource: 'منتج',
    resourceId: newProduct.id,
    status: 'نجاح',
    details: `قام الحرفي ${sellerName} بإضافة منتج جديد: "${newProduct.title}" برقم [${newProduct.id}] - الحالة: ${initialStatus === 'pending' ? 'قيد المراجعة' : 'مسودة'}`,
    metadata: { productId: newProduct.id, status: initialStatus, price: newProduct.price }
  });

  return newProduct;
}

/**
 * Submit a draft or rejected product for review.
 */
export async function submitProductForReview(sellerUser: AuthenticatedUser, productId: string): Promise<ProductDocument> {
  const sellerId = sellerUser.sellerId || sellerUser.id;
  const product = await getProductById(productId, sellerUser);

  if (!product) {
    throw new Error('المنتج غير موجود');
  }

  if (sellerUser.role !== 'admin' && product.sellerId !== sellerId) {
    throw new Error('غير مصرح لك بتعديل هذا المنتج (IDOR Check Failed)');
  }

  const updatedFields = {
    approvalStatus: 'pending' as ProductStatus,
    rejectionReason: null,
    updatedAt: new Date().toISOString().split('T')[0]
  };

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('products').updateOne({ id: productId }, { $set: updatedFields });
    } catch (e) {
      console.error('[ProductService] MongoDB submit update error:', e);
    }
  }

  // Update memory
  const memProd = memoryDb.products.find((p) => p.id === productId);
  if (memProd) {
    Object.assign(memProd, updatedFields);
  }

  cacheService.invalidateProducts(productId);
  const updatedProduct = { ...product, ...updatedFields };

  await createAuditLog({
    actorId: sellerUser.id,
    userName: sellerUser.name,
    userRole: 'seller',
    action: 'SELLER_SUBMITTED_PRODUCT',
    resource: 'منتج',
    resourceId: productId,
    status: 'نجاح',
    details: `تم تقديم المنتج "${product.title}" للمراجعة والاعتماد من قبل إدارة المنصة`,
    metadata: { productId, previousStatus: product.approvalStatus, newStatus: 'pending' }
  });

  return updatedProduct;
}

/**
 * Admin approves a product.
 */
export async function approveProduct(adminUser: AuthenticatedUser, productId: string): Promise<ProductDocument> {
  if (adminUser.role !== 'admin') {
    throw new Error('فقط مدير المنصة يملك صلاحية اعتماد المنتجات');
  }

  const product = await getProductById(productId, adminUser);
  if (!product) {
    throw new Error('المنتج غير موجود');
  }

  const nowStr = new Date().toISOString();
  const updatedFields = {
    approvalStatus: 'approved' as ProductStatus,
    approvedAt: nowStr,
    approvedBy: adminUser.name,
    rejectionReason: null,
    updatedAt: nowStr.split('T')[0]
  };

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('products').updateOne({ id: productId }, { $set: updatedFields });
    } catch (e) {
      console.error('[ProductService] MongoDB approve error:', e);
    }
  }

  const memProd = memoryDb.products.find((p) => p.id === productId);
  if (memProd) {
    Object.assign(memProd, updatedFields);
  }

  cacheService.invalidateProducts(productId);
  const approvedProduct = { ...product, ...updatedFields };

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'ADMIN_APPROVED_PRODUCT',
    resource: 'منتج',
    resourceId: productId,
    status: 'نجاح',
    details: `وافق المدير ${adminUser.name} على نشر المنتج "${product.title}" وأصبح متاحاً للجمهور بالسوق العام`,
    metadata: { productId, sellerId: product.sellerId, approvedAt: nowStr }
  });

  return approvedProduct;
}

/**
 * Admin rejects a product with reason.
 */
export async function rejectProduct(
  adminUser: AuthenticatedUser,
  productId: string,
  rejectionReason: string
): Promise<ProductDocument> {
  if (adminUser.role !== 'admin') {
    throw new Error('فقط مدير المنصة يملك صلاحية رفض المنتجات');
  }

  if (!rejectionReason || !rejectionReason.trim()) {
    throw new Error('يجب تحديد سبب الرفض لتوضيحه للحرفي');
  }

  const product = await getProductById(productId, adminUser);
  if (!product) {
    throw new Error('المنتج غير موجود');
  }

  const nowStr = new Date().toISOString();
  const updatedFields = {
    approvalStatus: 'rejected' as ProductStatus,
    rejectionReason: rejectionReason.trim(),
    approvedAt: null,
    approvedBy: null,
    updatedAt: nowStr.split('T')[0]
  };

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('products').updateOne({ id: productId }, { $set: updatedFields });
    } catch (e) {
      console.error('[ProductService] MongoDB reject error:', e);
    }
  }

  const memProd = memoryDb.products.find((p) => p.id === productId);
  if (memProd) {
    Object.assign(memProd, updatedFields);
  }

  cacheService.invalidateProducts(productId);
  const rejectedProduct = { ...product, ...updatedFields };

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'ADMIN_REJECTED_PRODUCT',
    resource: 'منتج',
    resourceId: productId,
    status: 'تنبيه',
    details: `رفض المدير ${adminUser.name} إدراج المنتج "${product.title}". السبب: "${rejectionReason.trim()}"`,
    metadata: { productId, sellerId: product.sellerId, rejectionReason: rejectionReason.trim() }
  });

  return rejectedProduct;
}

/**
 * Update product specifications or details.
 */
export async function updateProduct(
  user: AuthenticatedUser,
  productId: string,
  updates: Partial<ProductDocument>
): Promise<ProductDocument> {
  const product = await getProductById(productId, user);
  if (!product) {
    throw new Error('المنتج غير موجود');
  }

  const isOwner = user.role === 'seller' && (user.sellerId === product.sellerId || user.id === product.sellerId);
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new Error('غير مصرح لك بتعديل هذا المنتج');
  }

  // Security: prevent seller from setting status to approved directly
  const safeUpdates = { ...updates };
  if (!isAdmin) {
    delete safeUpdates.approvalStatus;
    delete safeUpdates.approvedAt;
    delete safeUpdates.approvedBy;
  }
  safeUpdates.updatedAt = new Date().toISOString().split('T')[0];

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('products').updateOne({ id: productId }, { $set: safeUpdates });
    } catch (e) {
      console.error('[ProductService] MongoDB update error:', e);
    }
  }

  const memProd = memoryDb.products.find((p) => p.id === productId);
  if (memProd) {
    Object.assign(memProd, safeUpdates);
  }

  cacheService.invalidateProducts(productId);
  return { ...product, ...safeUpdates };
}

/**
 * Delete product.
 */
export async function deleteProduct(user: AuthenticatedUser, productId: string): Promise<boolean> {
  const product = await getProductById(productId, user);
  if (!product) {
    throw new Error('المنتج غير موجود');
  }

  const isOwner = user.role === 'seller' && (user.sellerId === product.sellerId || user.id === product.sellerId);
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new Error('غير مصرح لك بحذف هذا المنتج');
  }

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('products').deleteOne({ id: productId });
    } catch (e) {
      console.error('[ProductService] MongoDB delete error:', e);
    }
  }

  const idx = memoryDb.products.findIndex((p) => p.id === productId);
  if (idx !== -1) {
    memoryDb.products.splice(idx, 1);
  }

  cacheService.invalidateProducts(productId);

  await createAuditLog({
    actorId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'DELETE_PRODUCT',
    resource: 'منتج',
    resourceId: productId,
    status: 'تنبيه',
    details: `تم حذف المنتج "${product.title}" [${productId}] بواسطة ${user.name}`
  });

  return true;
}

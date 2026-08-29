import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { ReviewDocument, ProductDocument, OrderDocument } from '../models/types.ts';
import type { AuthenticatedUser } from '../middleware/auth.ts';
import { createAuditLog } from './auditService.ts';

/**
 * Get published reviews for a product.
 */
export async function getProductReviews(productId: string, includeHidden = false): Promise<ReviewDocument[]> {
  const { db, isMongo } = await getDatabase();
  let reviews: ReviewDocument[] = [];

  if (isMongo && db) {
    try {
      const query: any = { productId };
      if (!includeHidden) {
        query.status = { $ne: 'hidden' };
      }
      reviews = (await db.collection('reviews').find(query).sort({ createdAt: -1 }).toArray()) as unknown as ReviewDocument[];
      if (reviews.length > 0) return reviews;
    } catch (e) {
      console.error('[ReviewService] MongoDB getProductReviews error:', e);
    }
  }

  reviews = memoryDb.reviews.filter((r) => {
    if (r.productId !== productId) return false;
    if (!includeHidden && r.status === 'hidden') return false;
    return true;
  });

  return reviews;
}

/**
 * Verified purchase check & submit review.
 */
export async function createProductReview(
  buyerUser: AuthenticatedUser,
  data: {
    productId: string;
    rating: number;
    comment: string;
  }
): Promise<{ review: ReviewDocument; updatedProductRating: { rating: number; reviewCount: number } }> {
  if (!buyerUser || !buyerUser.id) {
    throw new Error('يجب تسجيل الدخول لإضافة تقييم');
  }

  const { productId, rating, comment } = data;

  if (!productId) {
    throw new Error('معرف المنتج مطلوب');
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    throw new Error('التقييم يجب أن يكون بين 1 و 5 نجوم');
  }

  if (!comment || !comment.trim()) {
    throw new Error('يرجى كتابة تعليق يوضح تجربتك مع المنتج التراثي');
  }

  const { db, isMongo } = await getDatabase();

  // 1. Verify product exists
  let product: ProductDocument | null = null;
  if (isMongo && db) {
    product = (await db.collection('products').findOne({ id: productId })) as unknown as ProductDocument | null;
  }
  if (!product) {
    product = (memoryDb.products.find((p) => p.id === productId) as ProductDocument) || null;
  }
  if (!product) {
    throw new Error('المنتج المراد تقييمه غير موجود');
  }

  // 2. Verified Purchase check: Verify user actually purchased this product in an active/delivered order
  let hasPurchased = false;
  let matchingOrderId = '';

  if (isMongo && db) {
    try {
      const order = await db.collection('orders').findOne({
        buyerId: buyerUser.id,
        'items.productId': productId
      });
      if (order) {
        hasPurchased = true;
        matchingOrderId = (order as any).id || (order as any).orderNumber;
      }
    } catch (e) {
      console.error('[ReviewService] Order purchase check error:', e);
    }
  }

  if (!hasPurchased) {
    const memOrder = memoryDb.orders.find(
      (o) => o.buyerId === buyerUser.id && o.items.some((item) => item.productId === productId)
    );
    if (memOrder) {
      hasPurchased = true;
      matchingOrderId = memOrder.id;
    }
  }

  // If not found by strict buyerId, check by buyer name or email if logged in as buyer
  if (!hasPurchased && buyerUser.role === 'buyer') {
    const memOrder2 = memoryDb.orders.find((o) =>
      o.items.some((item) => item.productId === productId)
    );
    if (memOrder2) {
      hasPurchased = true;
      matchingOrderId = memOrder2.id;
    }
  }

  if (!hasPurchased) {
    throw new Error('عذراً، التقييم متاح فقط للعملاء الذين اشتروا هذا المنتج من سوق الصعيد (Verified Purchase Check)');
  }

  // 3. Check for duplicate review by same user on same product
  let existingReview: any = null;
  if (isMongo && db) {
    try {
      existingReview = await db.collection('reviews').findOne({
        userId: buyerUser.id,
        productId: productId
      });
    } catch (e) {
      console.error('[ReviewService] Duplicate check error:', e);
    }
  }
  if (!existingReview) {
    existingReview = memoryDb.reviews.find((r) => r.userId === buyerUser.id && r.productId === productId);
  }

  if (existingReview) {
    throw new Error('لقد قمت بتقييم هذا المنتج مسبقاً');
  }

  const now = new Date();
  const newReview: ReviewDocument = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    productId,
    productTitle: product.title,
    userId: buyerUser.id,
    userName: buyerUser.name || 'مشتري معتمد',
    userGovernorate: buyerUser.governorate || 'القاهرة',
    orderId: matchingOrderId,
    rating: Math.round(numRating),
    comment: comment.trim(),
    date: 'الآن',
    verifiedPurchase: true,
    status: 'published',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  if (isMongo && db) {
    try {
      await db.collection('reviews').insertOne(newReview as any);
    } catch (e) {
      console.error('[ReviewService] MongoDB insert review error:', e);
    }
  }

  memoryDb.reviews.unshift(newReview);

  // 4. Recalculate average rating & review count for product
  const allReviews = await getProductReviews(productId, false);
  const totalRatings = allReviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = allReviews.length > 0 ? Number((totalRatings / allReviews.length).toFixed(1)) : 5.0;
  const reviewCount = allReviews.length;

  // Update in product document
  if (isMongo && db) {
    try {
      await db.collection('products').updateOne(
        { id: productId },
        { $set: { rating: avgRating, reviewCount: reviewCount } }
      );
    } catch (e) {
      console.error('[ReviewService] MongoDB update product rating error:', e);
    }
  }

  const memProd = memoryDb.products.find((p) => p.id === productId);
  if (memProd) {
    memProd.rating = avgRating;
    memProd.reviewCount = reviewCount;
  }

  await createAuditLog({
    actorId: buyerUser.id,
    userName: buyerUser.name,
    userRole: 'buyer',
    action: 'REVIEW_CREATED',
    resource: 'تقييم منتج',
    resourceId: newReview.id,
    status: 'نجاح',
    details: `أضاف المشتري ${buyerUser.name} تقييماً (${avgRating} نجوم) للمنتج "${product.title}" [${productId}] (شراء موثق)`,
    metadata: { productId, rating: numRating, orderId: matchingOrderId }
  });

  return {
    review: newReview,
    updatedProductRating: { rating: avgRating, reviewCount }
  };
}

/**
 * Admin: Get all reviews across the platform.
 */
export async function getAdminReviews(filters?: {
  productId?: string;
  status?: string;
  search?: string;
}): Promise<ReviewDocument[]> {
  const { db, isMongo } = await getDatabase();
  let reviews: ReviewDocument[] = [];

  if (isMongo && db) {
    try {
      const query: any = {};
      if (filters?.productId) query.productId = filters.productId;
      if (filters?.status && filters.status !== 'all') query.status = filters.status;
      if (filters?.search) {
        query.$or = [
          { comment: { $regex: filters.search, $options: 'i' } },
          { userName: { $regex: filters.search, $options: 'i' } },
          { productTitle: { $regex: filters.search, $options: 'i' } }
        ];
      }
      reviews = (await db.collection('reviews').find(query).sort({ createdAt: -1 }).toArray()) as unknown as ReviewDocument[];
      if (reviews.length > 0) return reviews;
    } catch (e) {
      console.error('[ReviewService] MongoDB getAdminReviews error:', e);
    }
  }

  reviews = memoryDb.reviews;
  if (filters?.productId) {
    reviews = reviews.filter((r) => r.productId === filters.productId);
  }
  if (filters?.status && filters.status !== 'all') {
    reviews = reviews.filter((r) => r.status === filters.status);
  }
  if (filters?.search) {
    const term = filters.search.toLowerCase();
    reviews = reviews.filter(
      (r) =>
        r.comment.toLowerCase().includes(term) ||
        r.userName.toLowerCase().includes(term) ||
        (r.productTitle && r.productTitle.toLowerCase().includes(term))
    );
  }

  return reviews;
}

/**
 * Admin: Moderate a review (publish or hide inappropriate content).
 */
export async function moderateReview(
  adminUser: AuthenticatedUser,
  reviewId: string,
  status: 'published' | 'hidden',
  reason?: string
): Promise<ReviewDocument> {
  if (adminUser.role !== 'admin') {
    throw new Error('فقط مدير المنصة يملك صلاحية إدارة التقييمات');
  }

  const { db, isMongo } = await getDatabase();
  let review: ReviewDocument | null = null;

  if (isMongo && db) {
    try {
      review = (await db.collection('reviews').findOne({ id: reviewId })) as unknown as ReviewDocument | null;
    } catch (e) {
      console.error('[ReviewService] MongoDB find review error:', e);
    }
  }

  if (!review) {
    review = memoryDb.reviews.find((r) => r.id === reviewId) || null;
  }

  if (!review) {
    throw new Error('التقييم غير موجود');
  }

  const updatedFields = {
    status,
    updatedAt: new Date().toISOString()
  };

  if (isMongo && db) {
    try {
      await db.collection('reviews').updateOne({ id: reviewId }, { $set: updatedFields });
    } catch (e) {
      console.error('[ReviewService] MongoDB update review error:', e);
    }
  }

  const memRev = memoryDb.reviews.find((r) => r.id === reviewId);
  if (memRev) {
    Object.assign(memRev, updatedFields);
  }

  const updatedReview = { ...review, ...updatedFields };

  // Recalculate product rating after hiding/restoring review
  const activeReviews = await getProductReviews(review.productId, false);
  const total = activeReviews.reduce((sum, r) => sum + r.rating, 0);
  const avg = activeReviews.length > 0 ? Number((total / activeReviews.length).toFixed(1)) : 5.0;

  if (isMongo && db) {
    try {
      await db.collection('products').updateOne(
        { id: review.productId },
        { $set: { rating: avg, reviewCount: activeReviews.length } }
      );
    } catch (e) {
      console.error('[ReviewService] Error updating product rating after moderation:', e);
    }
  }
  const memProd = memoryDb.products.find((p) => p.id === review!.productId);
  if (memProd) {
    memProd.rating = avg;
    memProd.reviewCount = activeReviews.length;
  }

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'REVIEW_MODERATED',
    resource: 'تقييم منتج',
    resourceId: reviewId,
    status: status === 'hidden' ? 'تنبيه' : 'نجاح',
    details: `قام المدير ${adminUser.name} بتعديل حالة التقييم إلى [${status === 'published' ? 'منشور' : 'مخفي'}] - السبب: ${reason || 'مراجعة دورية'}`
  });

  return updatedReview;
}

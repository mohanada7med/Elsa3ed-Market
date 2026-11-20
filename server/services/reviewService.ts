import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type {
  ReviewDocument,
  ProductDocument,
  OrderDocument,
  SellerDocument,
  SellerReviewDocument
} from '../models/types.ts';
import type { AuthenticatedUser } from '../middleware/auth.ts';
import { createAuditLog } from './auditService.ts';

/**
 * Get published reviews for a product. Unapproved and hidden reviews stay private.
 */
export async function getProductReviews(productId: string, includeUnpublished = false): Promise<ReviewDocument[]> {
  const { db, isMongo } = await getDatabase();
  let reviews: ReviewDocument[] = [];

  if (isMongo && db) {
    try {
      const query: any = { productId };
      if (!includeUnpublished) query.status = 'published';
      reviews = (await db.collection('reviews').find(query).sort({ createdAt: -1 }).toArray()) as unknown as ReviewDocument[];
      if (reviews.length > 0) return reviews;
    } catch (e) {
      console.error('[ReviewService] MongoDB getProductReviews error:', e);
    }
  }

  reviews = memoryDb.reviews.filter((r) => {
    if (r.productId !== productId) return false;
    if (!includeUnpublished && r.status !== 'published') return false;
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

  // Reviews are only available after the buyer has received this exact product.
  let hasCompletedPurchase = false;
  let matchingOrderId = '';

  if (isMongo && db) {
    const order = await db.collection('orders').findOne({
      buyerId: buyerUser.id,
      status: 'delivered',
      'items.productId': productId
    });
    if (order) {
      hasCompletedPurchase = true;
      matchingOrderId = (order as any).id || (order as any).orderNumber;
    }
  } else {
    const memOrder = memoryDb.orders.find(
      (o) =>
        o.buyerId === buyerUser.id &&
        o.status === 'delivered' &&
        o.items.some((item) => item.productId === productId)
    );
    if (memOrder) {
      hasCompletedPurchase = true;
      matchingOrderId = memOrder.id;
    }
  }

  if (!hasCompletedPurchase) {
    throw new Error('التقييم متاح للمشتري بعد استلام المنتج فقط.');
  }

  // 3. Check for duplicate review by same user on same product
  let existingReview: any = null;
  if (isMongo && db) {
    existingReview = await db.collection('reviews').findOne({
      userId: buyerUser.id,
      productId
    });
  } else {
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
    verifiedBuyerId: buyerUser.id,
    userId: buyerUser.id,
    userName: buyerUser.name || 'مشتري معتمد',
    userGovernorate: buyerUser.governorate || 'القاهرة',
    orderId: matchingOrderId,
    rating: Math.round(numRating),
    comment: comment.trim(),
    date: now.toLocaleDateString('ar-EG', { timeZone: 'Africa/Cairo' }),
    verifiedPurchase: true,
    status: 'pending',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  if (isMongo && db) {
    try {
      await db.collection('reviews').insertOne(newReview as any);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
        throw new Error('لقد قمت بتقييم هذا المنتج مسبقاً');
      }
      throw error;
    }
  } else {
    memoryDb.reviews.unshift(newReview);
  }

  await createAuditLog({
    actorId: buyerUser.id,
    userName: buyerUser.name,
    userRole: 'buyer',
    action: 'REVIEW_CREATED',
    resource: 'تقييم منتج',
    resourceId: newReview.id,
    status: 'تنبيه',
    details: `أرسل المشتري ${buyerUser.name} تقييماً (${newReview.rating} نجوم) للمنتج "${product.title}" [${productId}] (شراء موثق) بانتظار مراجعة الإدارة`,
    metadata: { productId, rating: numRating, orderId: matchingOrderId }
  });

  return {
    review: newReview,
    updatedProductRating: { rating: product.rating, reviewCount: product.reviewCount }
  };
}

export async function getSellerReviews(
  sellerId: string,
  includeUnpublished = false
): Promise<SellerReviewDocument[]> {
  const { db, isMongo } = await getDatabase();
  let reviews: SellerReviewDocument[] = [];

  if (isMongo && db) {
    try {
      const query: Record<string, unknown> = { sellerId };
      if (!includeUnpublished) query.status = 'published';
      reviews = (await db.collection('seller_reviews')
        .find(query)
        .sort({ createdAt: -1 })
        .toArray()) as unknown as SellerReviewDocument[];
      if (reviews.length > 0) return reviews;
    } catch (error) {
      console.error('[ReviewService] MongoDB getSellerReviews error:', error);
    }
  }

  return memoryDb.sellerReviews
    .filter((review) => review.sellerId === sellerId)
    .filter((review) => includeUnpublished || review.status === 'published')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getBuyerSellerReview(
  buyerId: string,
  sellerId: string
): Promise<SellerReviewDocument | null> {
  const { db, isMongo } = await getDatabase();
  let seller: SellerDocument | null = null;

  if (isMongo && db) {
    seller = (await db.collection('sellers').findOne({
      $or: [{ id: sellerId }, { userId: sellerId }]
    })) as unknown as SellerDocument | null;
  }
  if (!seller) {
    seller = (memoryDb.sellers.find((entry) => entry.id === sellerId || entry.userId === sellerId) as SellerDocument) || null;
  }

  const sellerIds = new Set([sellerId, seller?.id, seller?.userId].filter((id): id is string => Boolean(id)));
  if (isMongo && db) {
    const review = (await db.collection('seller_reviews').findOne({
      userId: buyerId,
      sellerId: { $in: Array.from(sellerIds) }
    })) as unknown as SellerReviewDocument | null;
    if (review) return review;
  }

  return memoryDb.sellerReviews.find(
    (review) => review.userId === buyerId && sellerIds.has(review.sellerId)
  ) || null;
}

export async function createSellerReview(
  buyerUser: AuthenticatedUser,
  data: { sellerId: string; rating: number; comment: string }
): Promise<SellerReviewDocument> {
  if (!buyerUser?.id || buyerUser.role !== 'buyer') {
    throw new Error('يجب تسجيل الدخول بحساب مشتري لإضافة تقييم');
  }

  const numRating = Number(data.rating);
  if (!data.sellerId) throw new Error('معرف البائع مطلوب');
  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    throw new Error('التقييم يجب أن يكون بين 1 و5 نجوم');
  }
  if (!data.comment?.trim()) throw new Error('يرجى كتابة تعليق عن تجربتك مع البائع');

  const { db, isMongo } = await getDatabase();
  let seller: SellerDocument | null = null;
  if (isMongo && db) {
    seller = (await db.collection('sellers').findOne({
      $or: [{ id: data.sellerId }, { userId: data.sellerId }]
    })) as unknown as SellerDocument | null;
  }
  if (!seller) {
    seller = (memoryDb.sellers.find(
      (entry) => entry.id === data.sellerId || entry.userId === data.sellerId
    ) as SellerDocument) || null;
  }
  if (!seller) throw new Error('البائع غير موجود');

  const sellerIds = new Set(
    [seller.id, seller.userId, data.sellerId].filter((id): id is string => Boolean(id))
  );
  let matchingOrder: OrderDocument | null = null;

  if (isMongo && db) {
    matchingOrder = (await db.collection('orders').findOne({
      buyerId: buyerUser.id,
      status: 'delivered',
      'items.sellerId': { $in: Array.from(sellerIds) }
    })) as unknown as OrderDocument | null;
  } else {
    matchingOrder = memoryDb.orders.find(
      (order) =>
        order.buyerId === buyerUser.id &&
        order.status === 'delivered' &&
        order.items.some((item) => sellerIds.has(item.sellerId))
    ) || null;
  }
  if (!matchingOrder) throw new Error('يمكنك تقييم البائع بعد استلام طلب منه فقط');

  let existingReview: SellerReviewDocument | null = null;
  if (isMongo && db) {
    existingReview = (await db.collection('seller_reviews').findOne({
      userId: buyerUser.id,
      sellerId: seller.id
    })) as unknown as SellerReviewDocument | null;
  } else {
    existingReview = memoryDb.sellerReviews.find(
      (review) => review.userId === buyerUser.id && review.sellerId === seller!.id
    ) || null;
  }
  if (existingReview) throw new Error('لقد قمت بتقييم هذا البائع مسبقاً');

  const now = new Date();
  const review: SellerReviewDocument = {
    id: `seller-review-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    sellerId: seller.id,
    sellerName: seller.brandName || seller.name,
    verifiedBuyerId: buyerUser.id,
    userId: buyerUser.id,
    userName: buyerUser.name || 'مشتري موثق',
    userGovernorate: buyerUser.governorate,
    orderId: matchingOrder.id,
    rating: numRating,
    comment: data.comment.trim(),
    date: now.toLocaleDateString('ar-EG', { timeZone: 'Africa/Cairo' }),
    verifiedPurchase: true,
    status: 'pending',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  if (isMongo && db) {
    try {
      await db.collection('seller_reviews').insertOne(review as any);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
        throw new Error('لقد قمت بتقييم هذا البائع مسبقاً');
      }
      throw error;
    }
  } else {
    memoryDb.sellerReviews.unshift(review);
  }

  await createAuditLog({
    actorId: buyerUser.id,
    userName: buyerUser.name,
    userRole: 'buyer',
    action: 'SELLER_REVIEW_CREATED',
    resource: 'تقييم بائع',
    resourceId: review.id,
    status: 'تنبيه',
    details: `أرسل المشتري ${review.userName} تقييماً (${review.rating} نجوم) للبائع "${review.sellerName}" بانتظار مراجعة الإدارة`,
    metadata: { sellerId: seller.id, rating: review.rating, orderId: matchingOrder.id }
  });

  return review;
}

async function updateSellerRating(sellerId: string): Promise<void> {
  const reviews = await getSellerReviews(sellerId);
  const rating = reviews.length
    ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
    : 0;
  const { db, isMongo } = await getDatabase();

  if (isMongo && db) {
    await db.collection('sellers').updateOne(
      { id: sellerId },
      { $set: { rating, reviewCount: reviews.length } }
    );
  }
  const memorySeller = memoryDb.sellers.find((seller) => seller.id === sellerId);
  if (memorySeller) {
    memorySeller.rating = rating;
    memorySeller.reviewCount = reviews.length;
  }
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
  let sellerReviews: SellerReviewDocument[] = [];

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
      if (!filters?.productId) {
        const sellerQuery: Record<string, unknown> = {};
        if (filters?.status && filters.status !== 'all') sellerQuery.status = filters.status;
        if (filters?.search) {
          sellerQuery.$or = [
            { comment: { $regex: filters.search, $options: 'i' } },
            { userName: { $regex: filters.search, $options: 'i' } },
            { sellerName: { $regex: filters.search, $options: 'i' } }
          ];
        }
        sellerReviews = (await db.collection('seller_reviews')
          .find(sellerQuery)
          .sort({ createdAt: -1 })
          .toArray()) as unknown as SellerReviewDocument[];
      }
      if (reviews.length > 0 || sellerReviews.length > 0) {
        return [
          ...reviews,
          ...sellerReviews.map((review) => ({
            ...review,
            productId: '',
            productTitle: review.sellerName,
            reviewType: 'seller' as const
          }))
        ].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      }
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

  const adminSellerReviews = filters?.productId
    ? []
    : memoryDb.sellerReviews
        .filter((review) => !filters?.status || filters.status === 'all' || review.status === filters.status)
        .filter((review) =>
          !filters?.search ||
          review.comment.toLowerCase().includes(filters.search.toLowerCase()) ||
          review.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
          review.sellerName.toLowerCase().includes(filters.search.toLowerCase())
        )
        .map((review) => ({
          ...review,
          productId: '',
          productTitle: review.sellerName,
          reviewType: 'seller' as const
        }));

  return [...reviews, ...adminSellerReviews].sort(
    (a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')
  );
}

/**
 * Admin: Moderate a review (publish or hide inappropriate content).
 */
export async function moderateReview(
  adminUser: AuthenticatedUser,
  reviewId: string,
  status: 'published' | 'hidden',
  reason?: string
): Promise<ReviewDocument | SellerReviewDocument> {
  if (adminUser.role !== 'admin') {
    throw new Error('فقط مدير المنصة يملك صلاحية إدارة التقييمات');
  }

  const { db, isMongo } = await getDatabase();
  let review: ReviewDocument | null = null;
  let sellerReview: SellerReviewDocument | null = null;

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

  if (!review && isMongo && db) {
    try {
      sellerReview = (await db.collection('seller_reviews').findOne({ id: reviewId })) as unknown as SellerReviewDocument | null;
    } catch (error) {
      console.error('[ReviewService] MongoDB find seller review error:', error);
    }
  }
  if (!review && !sellerReview) {
    sellerReview = memoryDb.sellerReviews.find((r) => r.id === reviewId) || null;
  }

  if (!review && sellerReview) {
    const updatedFields = { status, updatedAt: new Date().toISOString() };
    if (isMongo && db) {
      const result = await db.collection('seller_reviews').updateOne({ id: reviewId }, { $set: updatedFields });
      if (result.matchedCount === 0) throw new Error('التقييم غير موجود');
    }
    const memoryReview = memoryDb.sellerReviews.find((entry) => entry.id === reviewId);
    if (memoryReview) Object.assign(memoryReview, updatedFields);

    await updateSellerRating(sellerReview.sellerId);
    const updatedReview = {
      ...sellerReview,
      ...updatedFields,
      productId: '',
      productTitle: sellerReview.sellerName,
      reviewType: 'seller' as const
    };
    await createAuditLog({
      actorId: adminUser.id,
      userName: adminUser.name,
      userRole: 'admin',
      action: 'SELLER_REVIEW_MODERATED',
      resource: 'تقييم بائع',
      resourceId: reviewId,
      status: status === 'hidden' ? 'تنبيه' : 'نجاح',
      details: `قام المدير ${adminUser.name} بتعديل حالة تقييم البائع "${sellerReview.sellerName}" إلى [${status === 'published' ? 'منشور' : 'مخفي'}] - السبب: ${reason || 'مراجعة دورية'}`
    });
    return updatedReview;
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
      const result = await db.collection('reviews').updateOne({ id: reviewId }, { $set: updatedFields });
      if (result.matchedCount === 0) {
        throw new Error('التقييم غير موجود');
      }
    } catch (e) {
      console.error('[ReviewService] MongoDB update review error:', e);
      throw new Error('تعذر حفظ حالة مراجعة التقييم');
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
      throw new Error('تم تحديث التقييم لكن تعذر تحديث متوسط تقييم المنتج');
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

/**
 * Permanently delete a review by admin and recalculate ratings
 */
export async function deleteProductReview(
  adminUser: AuthenticatedUser,
  reviewId: string
): Promise<boolean> {
  if (adminUser.role !== 'admin') {
    throw new Error('فقط مدير المنصة يملك صلاحية حذف التقييمات');
  }

  const { db, isMongo } = await getDatabase();
  let review: ReviewDocument | null = null;
  let sellerReview: SellerReviewDocument | null = null;
  if (isMongo && db) {
    try {
      review = (await db.collection('reviews').findOne({ id: reviewId })) as unknown as ReviewDocument | null;
    } catch (e) {
      console.error('[ReviewService] Mongo find review error:', e);
    }
    if (!review) {
      try {
        sellerReview = (await db.collection('seller_reviews').findOne({ id: reviewId })) as unknown as SellerReviewDocument | null;
      } catch (e) {
        console.error('[ReviewService] Mongo find seller review error:', e);
      }
    }
  }
  if (!review) {
    review = memoryDb.reviews.find((r) => r.id === reviewId) || null;
  }
  if (!review && !sellerReview) {
    sellerReview = memoryDb.sellerReviews.find((r) => r.id === reviewId) || null;
  }
  if (!review && sellerReview) {
    if (isMongo && db) {
      const result = await db.collection('seller_reviews').deleteOne({ id: reviewId });
      if (result.deletedCount === 0) throw new Error('التقييم غير موجود');
    }
    memoryDb.sellerReviews = memoryDb.sellerReviews.filter((entry) => entry.id !== reviewId);
    await updateSellerRating(sellerReview.sellerId);
    await createAuditLog({
      actorId: adminUser.id,
      userName: adminUser.name,
      userRole: 'admin',
      action: 'SELLER_REVIEW_DELETED',
      resource: 'تقييم بائع',
      resourceId: reviewId,
      status: 'تنبيه',
      details: `قام المدير ${adminUser.name} بحذف تقييم المشتري "${sellerReview.userName}" للبائع "${sellerReview.sellerName}" نهائياً`
    });
    return true;
  }
  if (!review) {
    throw new Error('التقييم غير موجود');
  }

  const productId = review.productId;

  if (isMongo && db) {
    try {
      await db.collection('reviews').deleteOne({ id: reviewId });
    } catch (e) {
      console.error('[ReviewService] Mongo delete review error:', e);
    }
  }

  memoryDb.reviews = memoryDb.reviews.filter((r) => r.id !== reviewId);

  // Recalculate product rating after deleting review
  const activeReviews = await getProductReviews(productId, false);
  const total = activeReviews.reduce((sum, r) => sum + r.rating, 0);
  const avg = activeReviews.length > 0 ? Number((total / activeReviews.length).toFixed(1)) : 5.0;

  if (isMongo && db) {
    try {
      await db.collection('products').updateOne(
        { id: productId },
        { $set: { rating: avg, reviewCount: activeReviews.length } }
      );
    } catch (e) {
      console.error('[ReviewService] Error updating product rating after review deletion:', e);
    }
  }
  const memProd = memoryDb.products.find((p) => p.id === productId);
  if (memProd) {
    memProd.rating = avg;
    memProd.reviewCount = activeReviews.length;
  }

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'REVIEW_DELETED',
    resource: 'تقييم منتج',
    resourceId: reviewId,
    status: 'تنبيه',
    details: `قام المدير ${adminUser.name} بحذف تقييم المشتري "${review.userName}" على المنتج "${productId}" نهائياً`
  });

  return true;
}

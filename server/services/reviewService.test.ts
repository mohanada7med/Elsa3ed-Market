import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Product, Seller } from '../../src/types.ts';
import type { OrderDocument, ReviewDocument } from '../models/types.ts';
import type { AuthenticatedUser } from '../middleware/auth.ts';
import { memoryDb } from '../db/mongodb.ts';
import {
  createProductReview,
  createSellerReview,
  deleteProductReview,
  getAdminReviews,
  getBuyerSellerReview,
  getProductReviews,
  getSellerReviews,
  moderateReview,
  getSellerDashboardReviews,
  replyToReview
} from './reviewService.ts';

const databaseEnvironmentKeys = [
  'MONGODB_URI',
  'MONGODB_CONNECTION_URL',
  'MONGO_URI',
  'DATABASE_URL'
] as const;

test('submitted reviews stay private and do not affect product rating until approved', async () => {
  const originalEnvironment = new Map(
    databaseEnvironmentKeys.map((key) => [key, process.env[key]])
  );
  const originalProducts = memoryDb.products;
  const originalOrders = memoryDb.orders;
  const originalReviews = memoryDb.reviews;
  const originalAuditLogs = memoryDb.auditLogs;

  databaseEnvironmentKeys.forEach((key) => delete process.env[key]);

  try {
    const productId = 'product-review-moderation-test';
    const product: Product = {
      id: productId,
      title: 'منتج تجريبي',
      categoryId: 'category-test',
      categoryName: 'حرف يدوية',
      sellerId: 'seller-test',
      sellerName: 'ورشة تجريبية',
      sellerGovernorate: 'قنا',
      price: 100,
      rating: 4,
      reviewCount: 1,
      inStock: true,
      stockCount: 5,
      images: [],
      description: 'منتج لاختبار مراجعة التقييمات',
      specifications: {
        material: 'خشب',
        originGovernorate: 'قنا',
        craftsmanship: 'يدوي'
      },
      tags: [],
      isHandmade: true,
      isHeritage: true,
      createdAt: new Date().toISOString(),
      approvalStatus: 'approved'
    };
    const deliveredOrder: OrderDocument = {
      id: 'order-review-moderation-test',
      orderNumber: 'SAED-REVIEW-TEST',
      buyerId: 'buyer-review-test',
      buyerName: 'مشتري تجريبي',
      buyerPhone: '01000000000',
      shippingAddress: {
        fullName: 'مشتري تجريبي',
        phone: '01000000000',
        governorate: 'قنا',
        city: 'قنا',
        streetAddress: 'عنوان تجريبي'
      },
      items: [{
        productId,
        productTitle: product.title,
        productImage: '',
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        sellerGovernorate: product.sellerGovernorate,
        quantity: 1,
        unitPrice: product.price,
        subtotal: product.price
      }],
      status: 'delivered',
      paymentMethod: 'cod',
      paymentStatus: 'paid',
      subtotal: product.price,
      shippingFee: 0,
      discountAmount: 0,
      total: product.price,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trackingNumber: 'TRACK-TEST',
      timeline: [],
      sellerIds: [product.sellerId]
    };
    const existingPublishedReview: ReviewDocument = {
      id: 'review-published-test',
      productId,
      userId: 'another-buyer-test',
      userName: 'مشتري آخر',
      rating: 4,
      comment: 'تقييم منشور',
      date: 'الآن',
      verifiedPurchase: true,
      status: 'published'
    };

    memoryDb.products = [product];
    memoryDb.orders = [deliveredOrder];
    memoryDb.reviews = [existingPublishedReview];
    memoryDb.auditLogs = [];

    const buyer: AuthenticatedUser = {
      id: 'buyer-review-test',
      name: 'مشتري تجريبي',
      email: 'buyer@example.test',
      role: 'buyer'
    };
    const admin: AuthenticatedUser = {
      id: 'admin-review-test',
      name: 'مدير تجريبي',
      email: 'admin@example.test',
      role: 'admin'
    };

    const submission = await createProductReview(buyer, {
      productId,
      rating: 5,
      comment: 'تقييم ينتظر الموافقة'
    });

    assert.equal(submission.review.status, 'pending');
    assert.equal(
      submission.review.date,
      new Date(submission.review.createdAt!).toLocaleDateString('ar-EG', { timeZone: 'Africa/Cairo' })
    );
    assert.deepEqual(
      (await getProductReviews(productId)).map((review) => review.id),
      [existingPublishedReview.id]
    );
    assert.equal(product.rating, 4);
    assert.equal(product.reviewCount, 1);

    const approvedReview = await moderateReview(admin, submission.review.id, 'published');

    assert.equal(approvedReview.status, 'published');
    assert.deepEqual(
      new Set((await getProductReviews(productId)).map((review) => review.id)),
      new Set([existingPublishedReview.id, submission.review.id])
    );
    assert.equal(product.rating, 4.5);
    assert.equal(product.reviewCount, 2);
  } finally {
    memoryDb.products = originalProducts;
    memoryDb.orders = originalOrders;
    memoryDb.reviews = originalReviews;
    memoryDb.auditLogs = originalAuditLogs;

    originalEnvironment.forEach((value, key) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
});

test('buyers can submit verified seller reviews that require moderation', async () => {
  const originalEnvironment = new Map(
    databaseEnvironmentKeys.map((key) => [key, process.env[key]])
  );
  const originalSellers = memoryDb.sellers;
  const originalOrders = memoryDb.orders;
  const originalReviews = memoryDb.reviews;
  const originalSellerReviews = memoryDb.sellerReviews;
  const originalAuditLogs = memoryDb.auditLogs;

  databaseEnvironmentKeys.forEach((key) => delete process.env[key]);

  try {
    const seller: Seller = {
      id: 'seller-review-profile-test',
      name: 'حرفي تجريبي',
      brandName: 'ورشة تجريبية',
      governorate: 'قنا',
      rating: 0,
      reviewCount: 0,
      salesCount: 0,
      productsCount: 1,
      badge: '',
      avatar: '',
      coverImage: '',
      bio: '',
      story: '',
      verified: true,
      joinedDate: new Date().toISOString(),
      phone: '01000000000',
      email: 'seller@example.test',
      payoutMethod: 'vodafone_cash',
      payoutAccount: '01000000000',
      status: 'approved',
      specialty: 'فخار'
    };
    const deliveredOrder: OrderDocument = {
      id: 'order-seller-review-test',
      orderNumber: 'SAED-SELLER-REVIEW',
      buyerId: 'buyer-seller-review-test',
      buyerName: 'مشتري تجريبي',
      buyerPhone: '01000000000',
      shippingAddress: {
        fullName: 'مشتري تجريبي',
        phone: '01000000000',
        governorate: 'قنا',
        city: 'قنا',
        streetAddress: 'عنوان تجريبي'
      },
      items: [{
        productId: 'seller-review-product',
        productTitle: 'منتج تجريبي',
        productImage: '',
        sellerId: seller.id,
        sellerName: seller.brandName,
        sellerGovernorate: seller.governorate,
        quantity: 1,
        unitPrice: 100,
        subtotal: 100
      }],
      status: 'delivered',
      paymentMethod: 'cod',
      paymentStatus: 'cash_on_delivery',
      subtotal: 100,
      shippingFee: 0,
      discountAmount: 0,
      total: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trackingNumber: 'TRACK-SELLER-REVIEW',
      timeline: [],
      sellerIds: [seller.id]
    };
    const buyer: AuthenticatedUser = {
      id: 'buyer-seller-review-test',
      name: 'مشتري تجريبي',
      email: 'buyer-seller@example.test',
      role: 'buyer'
    };
    const admin: AuthenticatedUser = {
      id: 'admin-seller-review-test',
      name: 'مدير تجريبي',
      email: 'admin-seller-review@example.test',
      role: 'admin'
    };

    memoryDb.sellers = [seller];
    memoryDb.orders = [deliveredOrder];
    memoryDb.reviews = [];
    memoryDb.sellerReviews = [];
    memoryDb.auditLogs = [];

    const review = await createSellerReview(buyer, {
      sellerId: seller.id,
      rating: 4,
      comment: 'تجربة ممتازة'
    });

    assert.equal(review.status, 'pending');
    assert.equal((await getSellerReviews(seller.id)).length, 0);
    assert.equal((await getBuyerSellerReview(buyer.id, seller.id))?.id, review.id);
    assert.equal((await getAdminReviews({ status: 'pending' }))[0].reviewType, 'seller');
    await assert.rejects(
      createSellerReview(
        { ...buyer, id: 'buyer-without-delivered-order' },
        { sellerId: seller.id, rating: 5, comment: 'تقييم غير مستحق' }
      ),
      /بعد استلام طلب/
    );
    await assert.rejects(
      createSellerReview(buyer, {
        sellerId: seller.id,
        rating: 5,
        comment: 'تقييم آخر'
      }),
      /تقييم هذا البائع مسبقاً/
    );

    await moderateReview(admin, review.id, 'published');
    assert.equal((await getSellerReviews(seller.id)).length, 1);
    assert.equal(seller.rating, 4);
    assert.equal(seller.reviewCount, 1);

    await deleteProductReview(admin, review.id);
    assert.equal((await getSellerReviews(seller.id)).length, 0);
    assert.equal(seller.rating, 0);
    assert.equal(seller.reviewCount, 0);
  } finally {
    memoryDb.sellers = originalSellers;
    memoryDb.orders = originalOrders;
    memoryDb.reviews = originalReviews;
    memoryDb.sellerReviews = originalSellerReviews;
    memoryDb.auditLogs = originalAuditLogs;

    originalEnvironment.forEach((value, key) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
});

test('sellers and admins can view reviews, accept, reject, or reply to them', async () => {
  const originalEnvironment = new Map(
    databaseEnvironmentKeys.map((key) => [key, process.env[key]])
  );
  const originalSellers = memoryDb.sellers;
  const originalOrders = memoryDb.orders;
  const originalReviews = memoryDb.reviews;
  const originalSellerReviews = memoryDb.sellerReviews;
  const originalAuditLogs = memoryDb.auditLogs;

  databaseEnvironmentKeys.forEach((key) => delete process.env[key]);

  try {
    const seller: Seller = {
      id: 'seller-reply-test',
      userId: 'seller-user-reply-test',
      name: 'عم صابر الفخراني',
      brandName: 'فخار قنا الأصيل',
      governorate: 'قنا',
      rating: 0,
      reviewCount: 0,
      salesCount: 1,
      productsCount: 1,
      badge: '',
      avatar: '',
      coverImage: '',
      bio: '',
      story: '',
      verified: true,
      joinedDate: new Date().toISOString(),
      phone: '01011112222',
      email: 'saber@example.test',
      payoutMethod: 'vodafone_cash',
      payoutAccount: '01011112222',
      status: 'approved',
      specialty: 'فخار'
    };

    const deliveredOrder: OrderDocument = {
      id: 'order-reply-test',
      orderNumber: 'SAED-ORDER-REPLY',
      buyerId: 'buyer-reply-user',
      buyerName: 'أحمد محمود',
      buyerPhone: '01099998888',
      shippingAddress: {
        fullName: 'أحمد محمود',
        phone: '01099998888',
        governorate: 'قنا',
        city: 'قنا',
        streetAddress: 'ش البحر'
      },
      items: [{
        productId: 'prod-reply-test',
        productTitle: 'طاجن فخار كبير',
        productImage: '',
        sellerId: seller.id,
        sellerName: seller.brandName,
        sellerGovernorate: seller.governorate,
        quantity: 1,
        unitPrice: 150,
        subtotal: 150
      }],
      status: 'delivered',
      paymentMethod: 'cod',
      paymentStatus: 'paid',
      subtotal: 150,
      shippingFee: 0,
      discountAmount: 0,
      total: 150,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trackingNumber: 'TRACK-REPLY-TEST',
      timeline: [],
      sellerIds: [seller.id]
    };

    const buyer: AuthenticatedUser = {
      id: 'buyer-reply-user',
      name: 'أحمد محمود',
      email: 'ahmed@example.test',
      role: 'buyer'
    };

    const sellerUser: AuthenticatedUser = {
      id: 'seller-user-reply-test',
      sellerId: 'seller-reply-test',
      name: 'عم صابر',
      email: 'saber@example.test',
      role: 'seller'
    };

    const adminUser: AuthenticatedUser = {
      id: 'admin-reply-user',
      name: 'مدير المنصة',
      email: 'admin@example.test',
      role: 'admin'
    };

    memoryDb.sellers = [seller];
    memoryDb.orders = [deliveredOrder];
    memoryDb.reviews = [];
    memoryDb.sellerReviews = [];
    memoryDb.auditLogs = [];

    // 1. Buyer creates review for seller
    const sellerRev = await createSellerReview(buyer, {
      sellerId: seller.id,
      rating: 5,
      comment: 'شغل تحفة وجودة خرافية وتسليم سريع جدا'
    });

    assert.equal(sellerRev.status, 'pending');

    // 2. Seller can see their reviews on dashboard
    const dashboardReviews = await getSellerDashboardReviews(sellerUser);
    assert.equal(dashboardReviews.length, 1);
    assert.equal(dashboardReviews[0].id, sellerRev.id);
    assert.equal(dashboardReviews[0].reviewType, 'seller');

    // 3. Seller can reply to review
    const repliedReview = await replyToReview(
      sellerUser,
      sellerRev.id,
      'تسلم يا هندسة، نورتنا وتحت أمرك دايماً!'
    );
    assert.ok(repliedReview.reply);
    assert.equal(repliedReview.reply.authorRole, 'seller');
    assert.equal(repliedReview.reply.message, 'تسلم يا هندسة، نورتنا وتحت أمرك دايماً!');

    // 4. Seller can accept the review
    const approvedReview = await moderateReview(sellerUser, sellerRev.id, 'published');
    assert.equal(approvedReview.status, 'published');
    assert.equal(seller.rating, 5);
    assert.equal(seller.reviewCount, 1);

    // 5. Admin can also reply or reject
    const adminReplied = await replyToReview(
      adminUser,
      sellerRev.id,
      'شكراً لتقييمك الرائع ودعمك للحرف اليدوية الصعيدية'
    );
    assert.equal(adminReplied.reply?.authorRole, 'admin');

    // 6. Seller or Admin can reject review
    const rejectedReview = await moderateReview(sellerUser, sellerRev.id, 'rejected', 'مخالف للشروط');
    assert.equal(rejectedReview.status, 'rejected');
    assert.equal(rejectedReview.rejectionReason, 'مخالف للشروط');
    assert.equal(seller.rating, 0); // No longer active
  } finally {
    memoryDb.sellers = originalSellers;
    memoryDb.orders = originalOrders;
    memoryDb.reviews = originalReviews;
    memoryDb.sellerReviews = originalSellerReviews;
    memoryDb.auditLogs = originalAuditLogs;

    originalEnvironment.forEach((value, key) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
});

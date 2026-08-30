import express from 'express';
import type { Response } from 'express';
import { requireAdmin } from '../middleware/auth.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import {
  getPendingProducts,
  getAllAdminProducts,
  approveProduct,
  rejectProduct,
  deleteProduct,
  updateProduct,
  createProduct
} from '../services/productService.ts';
import { getAuditLogs } from '../services/auditService.ts';
import {
  getAdminOrders,
  updateAdminOrderStatus,
  adminVerifyOrderPayment,
  adminRejectOrderPayment
} from '../services/orderService.ts';
import { getPaymentConfig, updatePaymentConfig } from '../services/paymentConfigService.ts';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../services/categoryService.ts';
import {
  getAllCraftStories,
  createCraftStory,
  updateCraftStory,
  deleteCraftStory
} from '../services/craftStoryService.ts';
import {
  getAdminReviews,
  moderateReview
} from '../services/reviewService.ts';
import { adminUpdateSellerStatus, adminUpdateSellerProfile } from '../services/sellerService.ts';
import {
  getUsersWithFilters,
  getUserDetailsForAdmin,
  deleteUserCascade,
  updateUserByAdmin,
  resetUserPasswordByAdmin,
  adminCreateNewUser,
  toggleUserStatusByAdmin
} from '../services/userService.ts';
import {
  getPasswordResetRequests,
  completePasswordResetRequest,
  rejectPasswordResetRequest
} from '../services/passwordResetService.ts';
import {
  getAllDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  toggleDiscountStatus
} from '../services/discountService.ts';
import {
  getAdminPayouts,
  getAdminPayoutById,
  adminApprovePayout,
  adminRejectPayout,
  adminMarkProcessing,
  adminMarkPaid
} from '../services/payoutService.ts';
import { memoryDb, getDatabase } from '../db/mongodb.ts';

const router = express.Router();

// Apply requireAdmin to all /api/admin routes
router.use(requireAdmin);

// ==================== CATEGORIES CRUD ====================

// GET /api/admin/categories - List all categories including inactive
router.get('/categories', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await getAllCategories(true);
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching admin categories:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب أقسام المنصة',
      code: 'SERVER_ERROR'
    });
  }
});

// POST /api/admin/categories - Create new category
router.post('/categories', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const created = await createCategory(req.user!, req.body);
    res.status(201).json({
      success: true,
      message: 'تم إضافة القسم التراثي بنجاح',
      data: created
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'فشل في إنشاء القسم',
      code: 'CATEGORY_ERROR'
    });
  }
});

// PUT /api/admin/categories/:id - Update category
router.put('/categories/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await updateCategory(req.user!, req.params.id, req.body);
    res.json({
      success: true,
      message: 'تم تحديث القسم بنجاح',
      data: updated
    });
  } catch (error: any) {
    console.error('Error updating category:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'فشل في تحديث القسم',
      code: 'CATEGORY_ERROR'
    });
  }
});

// DELETE /api/admin/categories/:id - Delete category
router.delete('/categories/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await deleteCategory(req.user!, req.params.id);
    res.json({
      success: true,
      message: 'تم حذف القسم بنجاح'
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'فشل في حذف القسم',
      code: 'CATEGORY_ERROR'
    });
  }
});

// ==================== CRAFT STORIES CRUD (قصص الصنعة وأسرار الأجداد) ====================

// GET /api/admin/craft-stories - List all craft stories including inactive
router.get('/craft-stories', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stories = await getAllCraftStories(true);
    res.json({
      success: true,
      count: stories.length,
      data: stories
    });
  } catch (error) {
    console.error('Error fetching admin craft stories:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب قصص الصنعة وأسرار الأجداد',
      code: 'SERVER_ERROR'
    });
  }
});

// POST /api/admin/craft-stories - Create new craft story
router.post('/craft-stories', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const created = await createCraftStory(req.user!, req.body);
    res.status(201).json({
      success: true,
      message: 'تم إضافة قصة الصنعة التراثية بنجاح',
      data: created
    });
  } catch (error: any) {
    console.error('Error creating craft story:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'فشل في إضافة قصة الصنعة',
      code: 'CRAFT_STORY_ERROR'
    });
  }
});

// PUT /api/admin/craft-stories/:id - Update craft story
router.put('/craft-stories/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await updateCraftStory(req.user!, req.params.id, req.body);
    res.json({
      success: true,
      message: 'تم تحديث قصة الصنعة بنجاح',
      data: updated
    });
  } catch (error: any) {
    console.error('Error updating craft story:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'فشل في تحديث قصة الصنعة',
      code: 'CRAFT_STORY_ERROR'
    });
  }
});

// DELETE /api/admin/craft-stories/:id - Delete craft story
router.delete('/craft-stories/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await deleteCraftStory(req.user!, req.params.id);
    res.json({
      success: true,
      message: 'تم حذف قصة الصنعة بنجاح'
    });
  } catch (error: any) {
    console.error('Error deleting craft story:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'فشل في حذف قصة الصنعة',
      code: 'CRAFT_STORY_ERROR'
    });
  }
});

// ==================== REVIEWS MODERATION ====================

// GET /api/admin/reviews - List all reviews across platform
router.get('/reviews', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId, status, search } = req.query;
    const reviews = await getAdminReviews({
      productId: productId ? String(productId) : undefined,
      status: status ? String(status) : undefined,
      search: search ? String(search) : undefined
    });
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب التقييمات',
      code: 'SERVER_ERROR'
    });
  }
});

// PUT /api/admin/reviews/:id/moderate - Publish or hide review
router.put('/reviews/:id/moderate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, reason } = req.body;
    if (!status || !['published', 'hidden'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'حالة التقييم يجب أن تكون إما published أو hidden',
        code: 'VALIDATION_ERROR'
      });
    }

    const moderated = await moderateReview(req.user!, req.params.id, status, reason);
    res.json({
      success: true,
      message: `تم ${status === 'published' ? 'إعادة نشر' : 'حجب'} التقييم بنجاح`,
      data: moderated
    });
  } catch (error: any) {
    console.error('Error moderating review:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'فشل في تعديل حالة التقييم',
      code: 'MODERATION_ERROR'
    });
  }
});

// ==================== SELLERS MANAGEMENT ====================

// GET /api/admin/sellers/pending - Quick list of sellers awaiting approval
router.get('/sellers/pending', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { db, isMongo } = await getDatabase();
    let pendingSellers: any[] = [];

    if (isMongo && db) {
      pendingSellers = await db.collection('sellers').find({ status: 'pending' }).toArray();
    } else {
      pendingSellers = memoryDb.sellers.filter((s) => s.status === 'pending');
    }

    const sanitized = pendingSellers.map(({ passwordHash, ...s }) => s);

    res.json({
      success: true,
      count: sanitized.length,
      data: sanitized
    });
  } catch (error) {
    console.error('Error fetching pending sellers:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب طلبات الورش المعلقة',
      code: 'SERVER_ERROR'
    });
  }
});

// GET /api/admin/sellers - List sellers with filtering and search
router.get('/sellers', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    const { db, isMongo } = await getDatabase();
    let sellers: any[] = [];

    const query: any = {};
    if (status && ['approved', 'pending', 'rejected', 'suspended'].includes(String(status))) {
      query.status = String(status);
    }

    if (isMongo && db) {
      sellers = await db.collection('sellers').find(query).toArray();
    } else {
      sellers = memoryDb.sellers.filter((s) => {
        if (status && s.status !== status) return false;
        return true;
      });
    }

    // In-memory search filtering if search term provided
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      sellers = sellers.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.brandName?.toLowerCase().includes(q) ||
          s.governorate?.toLowerCase().includes(q) ||
          s.specialty?.toLowerCase().includes(q) ||
          s.phone?.includes(q) ||
          s.email?.toLowerCase().includes(q)
      );
    }

    // Sanitize: strip any sensitive credentials
    const sanitized = sellers.map(({ passwordHash, ...s }) => s);

    res.json({
      success: true,
      count: sanitized.length,
      data: sanitized
    });
  } catch (error) {
    console.error('Error fetching admin sellers:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب قائمة البائعين',
      code: 'SERVER_ERROR'
    });
  }
});

// PUT /api/admin/sellers/:id/status - Approve/Reject/Suspend/Reactivate seller
router.put('/sellers/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.params.id;
    const { status, reason } = req.body;

    if (!sellerId || !sellerId.trim()) {
      return res.status(400).json({
        success: false,
        error: 'معرف الورشة/البائع مطلوب',
        code: 'VALIDATION_ERROR'
      });
    }

    if (!status || !['approved', 'pending', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'حالة الحساب غير صالحة. الحالات المقبولة: approved, pending, rejected, suspended',
        code: 'VALIDATION_ERROR'
      });
    }

    const updatedSeller = await adminUpdateSellerStatus(req.user!, sellerId, status, reason);
    const { passwordHash, ...sanitized } = updatedSeller as any;

    let message = `تم تحديث حالة الورشة إلى (${status}) بنجاح`;
    if (status === 'approved') message = 'تم اعتماد وتوثيق ورشة الحرفي بنجاح، وأصبح قادراً على الوصول للوحة التحكم';
    else if (status === 'rejected') message = 'تم رفض طلب انضمام الورشة بنجاح';
    else if (status === 'suspended') message = 'تم تعليق حساب الورشة بنجاح';

    res.json({
      success: true,
      message,
      data: sanitized
    });
  } catch (error: any) {
    console.error('Error updating seller status:', error);
    const isNotFound = error.message?.includes('غير موجود');
    res.status(isNotFound ? 404 : 400).json({
      success: false,
      error: error.message || 'فشل في تحديث حالة البائع',
      code: isNotFound ? 'NOT_FOUND' : 'UPDATE_ERROR'
    });
  }
});

// PUT /api/admin/sellers/:id - Admin update any seller's profile, cover image, and details
router.put('/sellers/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.params.id;
    if (!sellerId || !sellerId.trim()) {
      return res.status(400).json({
        success: false,
        error: 'معرف الورشة/البائع مطلوب',
        code: 'VALIDATION_ERROR'
      });
    }

    const updated = await adminUpdateSellerProfile(req.user!, sellerId, req.body);
    const { passwordHash, ...sanitized } = updated as any;

    res.json({
      success: true,
      message: 'تم تحديث بيانات وغلاف الورشة بواسطة الإدارة بنجاح',
      data: sanitized
    });
  } catch (error: any) {
    console.error('Error updating seller profile by admin:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'فشل في تحديث بيانات الورشة',
      code: 'UPDATE_SELLER_ERROR'
    });
  }
});

// ==================== ORDERS MANAGEMENT ====================

// GET /api/admin/orders - List all orders with filters
router.get('/orders', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, governorate, search } = req.query;
    const orders = await getAdminOrders({
      status: status ? String(status) : undefined,
      governorate: governorate ? String(governorate) : undefined,
      search: search ? String(search) : undefined
    });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب طلبات المنصة',
      code: 'SERVER_ERROR'
    });
  }
});

// PUT /api/admin/orders/:id/status - Update order status or payment status by admin
router.put('/orders/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const { status, paymentStatus, trackingNumber } = req.body;

    const updatedOrder = await updateAdminOrderStatus(
      req.user!,
      orderId,
      status,
      paymentStatus,
      trackingNumber
    );

    res.json({
      success: true,
      message: 'تم تحديث بيانات الطلب بنجاح',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating admin order status:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر تحديث الطلب',
      code: 'UPDATE_ERROR'
    });
  }
});

// POST /api/admin/orders/:id/verify-payment - Confirm receipt of transfer payment
router.post('/orders/:id/verify-payment', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const { adminNote } = req.body;
    const verifiedOrder = await adminVerifyOrderPayment(req.user!, orderId, adminNote);

    res.json({
      success: true,
      message: 'تم تأكيد استلام دفعة الطلب بنجاح وتحديث حالته',
      data: verifiedOrder
    });
  } catch (error) {
    console.error('[AdminRoutes] Error verifying order payment:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'فشل تأكيد استلام الدفعة',
      code: 'VERIFY_PAYMENT_ERROR'
    });
  }
});

// POST /api/admin/orders/:id/reject-payment - Reject transfer payment claim
router.post('/orders/:id/reject-payment', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const { reason } = req.body;
    const rejectedOrder = await adminRejectOrderPayment(req.user!, orderId, reason);

    res.json({
      success: true,
      message: 'تم تسجيل رفض تحويل الدفعة وإشعار العميل',
      data: rejectedOrder
    });
  } catch (error) {
    console.error('[AdminRoutes] Error rejecting order payment:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'فشل رفض دفعة الطلب',
      code: 'REJECT_PAYMENT_ERROR'
    });
  }
});

// GET /api/admin/products/pending - List products awaiting approval

router.get('/products/pending', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pendingProducts = await getPendingProducts();
    res.json({
      success: true,
      count: pendingProducts.length,
      data: pendingProducts
    });
  } catch (error) {
    console.error('Error fetching pending products:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب قائمة المنتجات المعلقة',
      code: 'SERVER_ERROR'
    });
  }
});

// GET /api/admin/products - List all products with optional status filter
router.get('/products', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.query;
    const products = await getAllAdminProducts(status as any);
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب منتجات الإدارة',
      code: 'SERVER_ERROR'
    });
  }
});

// POST /api/admin/products/:id/approve - Approve product
router.post('/products/:id/approve', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const productId = req.params.id;
    const approvedProduct = await approveProduct(req.user!, productId);

    res.json({
      success: true,
      message: 'تم اعتماد المنتج ونشره في سوق الصعيد للجمهور بنجاح',
      data: approvedProduct
    });
  } catch (error) {
    console.error('Error approving product:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر اعتماد المنتج',
      code: 'APPROVAL_ERROR'
    });
  }
});

// POST /api/admin/products/:id/reject - Reject product
router.post('/products/:id/reject', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const productId = req.params.id;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        error: 'سبب الرفض إلزامي لتوجيه الحرفي لتصحيح المخالفة',
        code: 'VALIDATION_ERROR'
      });
    }

    const rejectedProduct = await rejectProduct(req.user!, productId, rejectionReason.trim());

    res.json({
      success: true,
      message: 'تم رفض إدراج المنتج وإشعار الورشة بسبب الرفض',
      data: rejectedProduct
    });
  } catch (error) {
    console.error('Error rejecting product:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر رفض المنتج',
      code: 'REJECTION_ERROR'
    });
  }
});

// DELETE /api/admin/products/:id - Delete product by admin
router.delete('/products/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const productId = req.params.id;
    await deleteProduct(req.user!, productId);

    res.json({
      success: true,
      message: 'تم حذف المنتج من قاعدة البيانات'
    });
  } catch (error) {
    console.error('Error deleting product by admin:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر حذف المنتج',
      code: 'DELETE_ERROR'
    });
  }
});

// POST /api/admin/products - Create product by admin
router.post('/products', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      titleEn,
      price,
      originalPrice,
      discountPercent,
      description,
      categoryId,
      categoryName,
      stockCount,
      specifications,
      images,
      tags,
      isHandmade,
      isHeritage,
      sellerId,
      sellerName,
      sellerGovernorate,
      approvalStatus
    } = req.body;

    if (!title || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        error: 'اسم المنتج، السعر، والتصنيف حقول مطلوبة',
        code: 'VALIDATION_ERROR'
      });
    }

    const created = await createProduct(
      req.user!,
      {
        title,
        titleEn,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        discountPercent: discountPercent ? Number(discountPercent) : undefined,
        description: description || '',
        categoryId,
        categoryName: categoryName || 'حرف صعيدية',
        stockCount: Number(stockCount || 0),
        inStock: Number(stockCount || 0) > 0,
        specifications: specifications || {},
        images: images || [],
        tags: tags || [],
        isHandmade: isHandmade !== undefined ? Boolean(isHandmade) : true,
        isHeritage: isHeritage !== undefined ? Boolean(isHeritage) : true,
        sellerId: sellerId || req.user!.id,
        sellerName: sellerName || 'إدارة المنصة',
        sellerGovernorate: sellerGovernorate || 'أسيوط',
        approvalStatus: approvalStatus || 'approved'
      },
      'approved'
    );

    res.status(201).json({
      success: true,
      message: 'تم إضافة ونشر المنتج بواسطة الإدارة بنجاح',
      data: created
    });
  } catch (error) {
    console.error('Error creating product by admin:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر إضافة المنتج',
      code: 'CREATE_ERROR'
    });
  }
});

// PUT /api/admin/products/:id - Update product by admin
router.put('/products/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const productId = req.params.id;
    const updated = await updateProduct(req.user!, productId, req.body);

    res.json({
      success: true,
      message: 'تم تحديث بيانات المنتج بواسطة الإدارة بنجاح',
      data: updated
    });
  } catch (error) {
    console.error('Error updating product by admin:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر تحديث بيانات المنتج',
      code: 'UPDATE_ERROR'
    });
  }
});

// GET /api/admin/audit-logs - View audit trail
router.get('/audit-logs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await getAuditLogs();
    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب سجل العمليات',
      code: 'SERVER_ERROR'
    });
  }
});

// GET /api/admin/stats - Overview statistics
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const allProducts = await getAllAdminProducts();
    const pendingCount = allProducts.filter((p) => p.approvalStatus === 'pending').length;
    const approvedCount = allProducts.filter((p) => p.approvalStatus === 'approved').length;
    const rejectedCount = allProducts.filter((p) => p.approvalStatus === 'rejected').length;

    res.json({
      success: true,
      data: {
        totalProducts: allProducts.length,
        approvedCount,
        pendingCount,
        rejectedCount,
        sellersCount: memoryDb.sellers.length
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب الإحصائيات',
      code: 'SERVER_ERROR'
    });
  }
});

// ==================== USER MANAGEMENT ====================

// GET /api/admin/users - List users with filters and search
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, role, status, governorate } = req.query;
    const users = await getUsersWithFilters({
      search: search as string,
      role: role as string,
      status: status as string,
      governorate: governorate as string
    });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'فشل في استعراض بيانات المستخدمين',
      code: 'USERS_FETCH_ERROR'
    });
  }
});

// GET /api/admin/users/:userId - Get safe user details
router.get('/users/:userId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const userDetails = await getUserDetailsForAdmin(userId);

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم المطلوب غير موجود',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: userDetails
    });
  } catch (error: any) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'فشل في استعراض تفاصيل المستخدم',
      code: 'USER_DETAILS_ERROR'
    });
  }
});

// POST /api/admin/users - Admin Create New User
router.post('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const newUser = await adminCreateNewUser(req.user!, req.body);
    res.status(201).json({
      success: true,
      message: `تم إنشاء حساب ${newUser.name} (@${newUser.username}) بنجاح`,
      data: newUser
    });
  } catch (error: any) {
    console.error('Error creating user by admin:', error);
    res.status(400).json({
      success: false,
      error: error?.message || 'فشل في إنشاء الحساب',
      code: 'USER_CREATE_ERROR'
    });
  }
});

// PUT /api/admin/users/:userId - Admin Update User Details, Role, Governorate, Status
router.put('/users/:userId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const updated = await updateUserByAdmin(req.user!, userId, req.body);
    res.json({
      success: true,
      message: 'تم تحديث بيانات المستخدم بنجاح',
      data: updated
    });
  } catch (error: any) {
    console.error('Error updating user by admin:', error);
    res.status(400).json({
      success: false,
      error: error?.message || 'فشل في تحديث بيانات المستخدم',
      code: 'USER_UPDATE_ERROR'
    });
  }
});

// PATCH /api/admin/users/:userId/status - Quick Toggle / Set Account Status
router.patch('/users/:userId/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    if (!status || !['active', 'suspended', 'blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'حالة الحساب غير صالحة. يجب أن تكون active أو suspended',
        code: 'INVALID_STATUS'
      });
    }
    const updated = await toggleUserStatusByAdmin(req.user!, userId, status);
    res.json({
      success: true,
      message: status === 'active' ? 'تم تنشيط وتفعيل الحساب بنجاح' : 'تم تعليق وتجميد الحساب بنجاح',
      data: updated
    });
  } catch (error: any) {
    console.error('Error toggling user status:', error);
    res.status(400).json({
      success: false,
      error: error?.message || 'فشل في تغيير حالة الحساب',
      code: 'USER_STATUS_ERROR'
    });
  }
});

// POST /api/admin/users/:userId/reset-password - Admin Reset User Password
router.post('/users/:userId/reset-password', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    const result = await resetUserPasswordByAdmin(req.user!, userId, newPassword);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    console.error('Error resetting password by admin:', error);
    res.status(400).json({
      success: false,
      error: error?.message || 'فشل في إعادة تعيين كلمة المرور',
      code: 'PASSWORD_RESET_ERROR'
    });
  }
});

// ==================== PASSWORD RESET REQUESTS (ADMIN) ====================

// GET /api/admin/password-resets - List all password reset requests with optional status filter
router.get('/password-resets', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = req.query.status as any;
    const requests = await getPasswordResetRequests(status);
    res.json({
      success: true,
      data: requests
    });
  } catch (error: any) {
    console.error('Error fetching password reset requests:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'فشل في استعراض طلبات استعادة كلمة المرور',
      code: 'PASSWORD_RESETS_FETCH_ERROR'
    });
  }
});

// POST /api/admin/password-resets/:requestId/complete - Admin assigns temporary password
router.post('/password-resets/:requestId/complete', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const { temporaryPassword } = req.body;

    if (!temporaryPassword || typeof temporaryPassword !== 'string' || temporaryPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'كلمة المرور المؤقتة يجب ألا تقل عن 6 خانات',
        code: 'INVALID_TEMP_PASSWORD'
      });
    }

    const result = await completePasswordResetRequest(req.user!, requestId, temporaryPassword);
    res.json({
      success: true,
      message: result.message,
      data: {
        temporaryPassword: result.temporaryPassword
      }
    });
  } catch (error: any) {
    console.error('Error completing password reset request:', error);
    res.status(400).json({
      success: false,
      error: error?.message || 'فشل في معالجة طلب استعادة كلمة المرور',
      code: 'PASSWORD_RESET_COMPLETE_ERROR'
    });
  }
});

// POST /api/admin/password-resets/:requestId/reject - Admin rejects reset request
router.post('/password-resets/:requestId/reject', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;

    const result = await rejectPasswordResetRequest(req.user!, requestId, reason);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    console.error('Error rejecting password reset request:', error);
    res.status(400).json({
      success: false,
      error: error?.message || 'فشل في رفض طلب استعادة كلمة المرور',
      code: 'PASSWORD_RESET_REJECT_ERROR'
    });
  }
});

// DELETE /api/admin/users/:userId - Cascade delete user account, Cloudinary assets, and handle relations
router.delete('/users/:userId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId || !userId.trim()) {
      return res.status(400).json({
        success: false,
        error: 'معرف المستخدم إلزامي لتنفيذ عملية الحذف',
        code: 'INVALID_USER_ID'
      });
    }

    // Protection against self-deletion
    if (req.user?.id === userId) {
      return res.status(400).json({
        success: false,
        error: 'لا يمكن لمدير المنصة حذف حسابه الشخصي من خلال هذه الواجهة',
        code: 'SELF_DELETION_FORBIDDEN'
      });
    }

    const deletionResult = await deleteUserCascade(req.user!, userId);

    res.json({
      success: true,
      message: `تم حذف حساب ${deletionResult.name} (${deletionResult.role}) وتنظيف أصوله وبياناته المرتبطة بنجاح`,
      data: deletionResult
    });
  } catch (error: any) {
    console.error('Error deleting user by admin:', error);
    const statusCode =
      error?.message?.includes('غير مصرح')
        ? 403
        : error?.message?.includes('غير موجود')
          ? 404
          : error?.message?.includes('حذف حسابه الشخصي')
            ? 400
            : 500;

    res.status(statusCode).json({
      success: false,
      error: error?.message || 'تعذر إتمام عملية حذف الحساب',
      code: 'USER_DELETE_ERROR'
    });
  }
});

// ==================== DISCOUNTS & COUPONS MANAGEMENT ====================

// GET /api/admin/discounts - List all discounts
router.get('/discounts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const discounts = await getAllDiscounts();
    res.json({
      success: true,
      count: discounts.length,
      data: discounts
    });
  } catch (error: any) {
    console.error('Error fetching discounts:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء جلب كوبونات الخصم'
    });
  }
});

// POST /api/admin/discounts - Create a new discount
router.post('/discounts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, discountPercent, maxDiscount, minOrderValue, active, validUntil, description } = req.body;
    if (!code || !discountPercent) {
      return res.status(400).json({
        success: false,
        error: 'كود الخصم ونسبة الخصم حقول إلزامية'
      });
    }

    const newDiscount = await createDiscount({
      code,
      discountPercent: Number(discountPercent),
      maxDiscount: maxDiscount !== undefined ? Number(maxDiscount) : undefined,
      minOrderValue: Number(minOrderValue || 0),
      active: active !== undefined ? Boolean(active) : true,
      validUntil,
      description
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء كود الخصم بنجاح',
      data: newDiscount
    });
  } catch (error: any) {
    console.error('Error creating discount:', error);
    res.status(400).json({
      success: false,
      error: error?.message || 'فشل إنشاء كود الخصم'
    });
  }
});

// PUT /api/admin/discounts/:id - Update discount
router.put('/discounts/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await updateDiscount(req.params.id, req.body);
    res.json({
      success: true,
      message: 'تم تحديث كود الخصم بنجاح',
      data: updated
    });
  } catch (error: any) {
    console.error('Error updating discount:', error);
    res.status(400).json({
      success: false,
      error: error?.message || 'فشل تعديل كود الخصم'
    });
  }
});

// DELETE /api/admin/discounts/:id - Delete discount
router.delete('/discounts/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = await deleteDiscount(req.params.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'كود الخصم غير موجود'
      });
    }
    res.json({
      success: true,
      message: 'تم حذف كود الخصم بنجاح'
    });
  } catch (error: any) {
    console.error('Error deleting discount:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'فشل حذف كود الخصم'
    });
  }
});

// PATCH & PUT /api/admin/discounts/:id/toggle - Toggle discount active state
const handleToggleDiscount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const toggled = await toggleDiscountStatus(req.params.id);
    res.json({
      success: true,
      message: `تم ${toggled.active ? 'تفعيل' : 'تعطيل'} كود الخصم بنجاح`,
      data: toggled
    });
  } catch (error: any) {
    console.error('Error toggling discount:', error);
    res.status(400).json({
      success: false,
      error: error?.message || 'فشل تغيير حالة كود الخصم'
    });
  }
};

router.patch('/discounts/:id/toggle', handleToggleDiscount);
router.put('/discounts/:id/toggle', handleToggleDiscount);

// ==================== ADMIN PAYOUTS MANAGEMENT ====================

// GET /api/admin/payouts - Get all platform payout requests with summary metrics
router.get('/payouts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      search: req.query.search as string
    };
    const result = await getAdminPayouts(filters);
    res.json({
      success: true,
      data: result.payouts,
      summary: result.summary
    });
  } catch (error) {
    console.error('[AdminRoutes] Error fetching payouts:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'فشل في جلب طلبات صرف المستحقات',
      code: 'ADMIN_PAYOUTS_ERROR'
    });
  }
});

// GET /api/admin/payouts/:id - Get single payout request with seller history
router.get('/payouts/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const details = await getAdminPayoutById(req.params.id);
    if (!details) {
      return res.status(404).json({
        success: false,
        error: 'طلب الصرف غير موجود',
        code: 'PAYOUT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: details
    });
  } catch (error) {
    console.error('[AdminRoutes] Error fetching payout details:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'فشل في جلب تفاصيل طلب الصرف',
      code: 'PAYOUT_DETAILS_ERROR'
    });
  }
});

// PATCH /api/admin/payouts/:id/approve - Approve payout request
router.patch('/payouts/:id/approve', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { note } = req.body;
    const payout = await adminApprovePayout(req.user!, req.params.id, note);
    res.json({
      success: true,
      message: 'تمت الموافقة على طلب صرف المستحقات بنجاح',
      data: payout
    });
  } catch (error) {
    console.error('[AdminRoutes] Error approving payout:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر الموافقة على طلب الصرف',
      code: 'PAYOUT_APPROVE_ERROR'
    });
  }
});

// PATCH /api/admin/payouts/:id/reject - Reject payout request
router.patch('/payouts/:id/reject', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        error: 'يرجى كتابة سبب رفض طلب الصرف بشكل واضح',
        code: 'REJECTION_REASON_REQUIRED'
      });
    }

    const payout = await adminRejectPayout(req.user!, req.params.id, reason);
    res.json({
      success: true,
      message: 'تم رفض طلب صرف المستحقات بنجاح وإشعار البائع بالسبب',
      data: payout
    });
  } catch (error) {
    console.error('[AdminRoutes] Error rejecting payout:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر رفض طلب الصرف',
      code: 'PAYOUT_REJECT_ERROR'
    });
  }
});

// PATCH /api/admin/payouts/:id/processing - Mark payout request as processing
router.patch('/payouts/:id/processing', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payout = await adminMarkProcessing(req.user!, req.params.id);
    res.json({
      success: true,
      message: 'تم تحديث حالة الطلب إلى قيد التنفيذ والتحويل',
      data: payout
    });
  } catch (error) {
    console.error('[AdminRoutes] Error marking payout processing:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر تحديث حالة طلب الصرف',
      code: 'PAYOUT_PROCESSING_ERROR'
    });
  }
});

// PATCH /api/admin/payouts/:id/paid - Mark payout as paid with permanent transaction details
router.patch('/payouts/:id/paid', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { transactionReference, paymentMethod, paidAmount, paymentDate, adminNote } = req.body;

    if (!transactionReference || !transactionReference.trim()) {
      return res.status(400).json({
        success: false,
        error: 'رقم المعاملة / إيصال التحويل مطلوب لتأكيد التحويل',
        code: 'TRANSACTION_REFERENCE_REQUIRED'
      });
    }

    const payout = await adminMarkPaid(req.user!, req.params.id, {
      transactionReference,
      paymentMethod,
      paidAmount,
      paymentDate,
      adminNote
    });

    res.json({
      success: true,
      message: 'تم تسجيل تحويل المبلغ وتأكيد الصرف بنجاح وإشعار الحرفي',
      data: payout
    });
  } catch (error) {
    console.error('[AdminRoutes] Error marking payout paid:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر تأكيد صرف المبلغ',
      code: 'PAYOUT_PAID_ERROR'
    });
  }
});

// GET /api/admin/settings/payment - Get platform payment accounts configuration
router.get('/settings/payment', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const config = await getPaymentConfig();
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('[AdminRoutes] Error getting payment config:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'فشل في جلب إعدادات الدفع',
      code: 'SERVER_ERROR'
    });
  }
});

// PUT /api/admin/settings/payment - Update platform payment accounts configuration
router.put('/settings/payment', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { instaPayAccount, vodafoneCashNumber, instaPayInstructions, vodafoneCashInstructions } = req.body;

    if (!instaPayAccount && !vodafoneCashNumber) {
      return res.status(400).json({
        success: false,
        error: 'يجب توفير حساب إنستاباي أو رقم فودافون كاش على الأقل',
        code: 'VALIDATION_ERROR'
      });
    }

    const updated = await updatePaymentConfig(req.user!, {
      instaPayAccount,
      vodafoneCashNumber,
      instaPayInstructions,
      vodafoneCashInstructions
    });

    res.json({
      success: true,
      message: 'تم تحديث إعدادات حسابات الدفع بنجاح',
      data: updated
    });
  } catch (error) {
    console.error('[AdminRoutes] Error updating payment config:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'فشل تحديث إعدادات الدفع',
      code: 'UPDATE_PAYMENT_CONFIG_ERROR'
    });
  }
});

export default router;

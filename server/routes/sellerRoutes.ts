import express from 'express';
import type { Response } from 'express';
import { requireSeller, requireAuth, invalidateAuthSession } from '../middleware/auth.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { SellerStatus } from '../models/types.ts';
import {
  getSellerProducts,
  createProduct,
  submitProductForReview,
  updateProduct,
  deleteProduct
} from '../services/productService.ts';
import { getSellerOrders, updateSellerOrderStatus } from '../services/orderService.ts';
import {
  getSellerInventory,
  updateSellerStock,
  getStockMovements
} from '../services/inventoryService.ts';
import {
  getSellerDashboardStats,
  getSellerAnalytics,
  updateSellerProfile
} from '../services/sellerService.ts';
import {
  createSellerPayoutRequest,
  getSellerPayouts,
  getSellerPayoutById,
  cancelSellerPayout
} from '../services/payoutService.ts';

const router = express.Router();

// GET /api/seller/status - Accessible to any authenticated user to check their seller review / workshop status
router.get('/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { db, isMongo } = await getDatabase();
    const sellerId = req.user?.sellerId || req.user?.id;
    let sellerDoc: any = null;

    if (isMongo && db) {
      try {
        sellerDoc = await db.collection('sellers').findOne({
          $or: [{ id: sellerId }, { userId: req.user?.id }]
        });
      } catch (e) {
        console.error('[SellerRoutes /status] MongoDB error:', e);
      }
    }

    if (!sellerDoc) {
      sellerDoc = memoryDb.sellers.find((s) => s.id === sellerId || (s as any).userId === req.user?.id);
    }

    if (!sellerDoc) {
      return res.status(404).json({
        success: false,
        error: 'لم يتم العثور على بيانات ورشة أو طلب انضمام لهذا الحساب',
        code: 'SELLER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: {
        id: sellerDoc.id,
        name: sellerDoc.name,
        brandName: sellerDoc.brandName,
        governorate: sellerDoc.governorate,
        status: sellerDoc.status,
        verified: sellerDoc.verified,
        specialty: sellerDoc.specialty,
        phone: sellerDoc.phone,
        email: sellerDoc.email,
        bio: sellerDoc.bio,
        story: sellerDoc.story,
        avatar: sellerDoc.avatar,
        coverImage: sellerDoc.coverImage,
        rejectionReason: sellerDoc.rejectionReason,
        suspensionReason: sellerDoc.suspensionReason,
        joinedDate: sellerDoc.joinedDate
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'فشل في جلب حالة البائع',
      code: 'SERVER_ERROR'
    });
  }
});

// POST /api/seller/apply - Submit request to become a seller (accessible to any authenticated user)
router.post('/apply', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      workshopName,
      specialty,
      governorate,
      phone,
      email,
      bio,
      story,
      avatar,
      coverImage,
      payoutMethod,
      payoutAccount
    } = req.body;

    if (!workshopName || typeof workshopName !== 'string' || !workshopName.trim()) {
      return res.status(400).json({
        success: false,
        error: 'اسم الورشة أو العلامة الحرفية مطلوب',
        code: 'VALIDATION_ERROR'
      });
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({
        success: false,
        error: 'رقم هاتف التواصل للورشة مطلوب',
        code: 'VALIDATION_ERROR'
      });
    }

    const { db, isMongo } = await getDatabase();

    // Check if user already has an existing seller application or workshop
    let existingSeller: any = null;
    if (isMongo && db) {
      try {
        existingSeller = await db.collection('sellers').findOne({
          $or: [{ userId: user.id }, ...(user.sellerId ? [{ id: user.sellerId }] : [])]
        });
      } catch (e) {
        console.error('[SellerRoutes /apply] Check existing error:', e);
      }
    }

    if (!existingSeller) {
      existingSeller = memoryDb.sellers.find(
        (s) => (s as any).userId === user.id || (user.sellerId && s.id === user.sellerId)
      );
    }

    if (existingSeller) {
      if (existingSeller.status === 'approved') {
        return res.status(400).json({
          success: false,
          error: 'حساب ورشتك معتمد بالفعل كبائع رسمي بالمنصة',
          code: 'ALREADY_APPROVED'
        });
      }
      if (existingSeller.status === 'pending') {
        return res.status(400).json({
          success: false,
          error: 'طلب انضمام ورشتك قيد المراجعة والاعتماد حالياً من قبل الإدارة',
          code: 'ALREADY_PENDING'
        });
      }

      // If previously rejected, allow re-application by updating the existing record and resetting to pending
      const now = new Date().toISOString();
      const updatedData = {
        name: user.name,
        brandName: workshopName.trim(),
        specialty: specialty?.trim() || 'مشغولات وحرف تراثية',
        governorate: governorate || user.governorate || 'قنا',
        phone: phone.trim(),
        email: email?.trim() || user.email || '',
        bio: bio?.trim() || `ورشة متخصصة في صناعة المشغولات الصعيدية والتراثية الأصيلة في محافظة ${governorate || user.governorate || 'قنا'}.`,
        story: story?.trim() || 'بدأنا بحرفة الأجداد وتوارثناها جيلاً بعد جيل لنقدم لكم أروع ما أبدعت أيادي الصعيد.',
        avatar: avatar || user.avatar || '',
        coverImage: coverImage || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
        payoutMethod: payoutMethod || 'vodafone_cash',
        payoutAccount: payoutAccount?.trim() || phone.trim(),
        status: 'pending' as SellerStatus,
        verified: false,
        rejectionReason: null,
        updatedAt: now
      };

      if (isMongo && db) {
        await db.collection('sellers').updateOne({ id: existingSeller.id }, { $set: updatedData });
        await db.collection('users').updateOne(
          { id: user.id },
          { $set: { sellerId: existingSeller.id, sellerStatus: 'pending', updatedAt: now } }
        );
      }
      Object.assign(existingSeller, updatedData);
      invalidateAuthSession(user.id);

      return res.json({
        success: true,
        message: 'تم إعادة تقديم طلب انضمام ورشتك بنجاح وهو قيد المراجعة والاعتماد من قبل إدارة المنصة',
        data: { ...existingSeller, ...updatedData }
      });
    }

    // Create new seller application in MongoDB
    const sellerId = `seller-${Date.now()}`;
    const now = new Date().toISOString();
    const newSeller = {
      id: sellerId,
      userId: user.id,
      name: user.name,
      brandName: workshopName.trim(),
      specialty: specialty?.trim() || 'مشغولات وحرف تراثية',
      governorate: governorate || user.governorate || 'قنا',
      rating: 5.0,
      salesCount: 0,
      productsCount: 0,
      badge: 'حرفي جديد',
      avatar: avatar || user.avatar || '',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
      bio: bio?.trim() || `ورشة متخصصة في صناعة المشغولات الصعيدية والتراثية الأصيلة في محافظة ${governorate || user.governorate || 'قنا'}.`,
      story: story?.trim() || 'بدأنا بحرفة الأجداد وتوارثناها جيلاً بعد جيل لنقدم لكم أروع ما أبدعت أيادي الصعيد.',
      verified: false,
      joinedDate: now.split('T')[0],
      phone: phone.trim(),
      email: email?.trim() || user.email || '',
      payoutMethod: payoutMethod || 'vodafone_cash',
      payoutAccount: payoutAccount?.trim() || phone.trim(),
      status: 'pending' as SellerStatus,
      createdAt: now,
      updatedAt: now
    };

    if (isMongo && db) {
      await db.collection('sellers').insertOne(newSeller as any);
      await db.collection('users').updateOne(
        { id: user.id },
        { $set: { sellerId, sellerStatus: 'pending', updatedAt: now } }
      );
    }
    memoryDb.sellers.push(newSeller as any);
    invalidateAuthSession(user.id);

    res.status(201).json({
      success: true,
      message: 'تم تقديم طلب اعتماد ورشتك بنجاح! سيتم مراجعته وتدقيقه من قبل إدارة المنصة.',
      data: newSeller
    });
  } catch (error: any) {
    console.error('Error applying to become seller:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'فشل في تقديم طلب الانضمام كبائع',
      code: 'SERVER_ERROR'
    });
  }
});

// Apply requireSeller to all protected /api/seller routes below
router.use(requireSeller);

// ==================== DASHBOARD STATS & ANALYTICS ====================

// GET /api/seller/dashboard-stats - Aggregated real-time metrics
router.get('/dashboard-stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.user!.sellerId || req.user!.id;
    const stats = await getSellerDashboardStats(sellerId);
    res.json({
      success: true,
      sellerId,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching seller dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب إحصائيات لوحة التحكم',
      code: 'SERVER_ERROR'
    });
  }
});

// GET /api/seller/analytics - Sales and orders analytics
router.get('/analytics', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.user!.sellerId || req.user!.id;
    const period = (req.query.period as any) || '30d';
    const analytics = await getSellerAnalytics(sellerId, period);
    res.json({
      success: true,
      sellerId,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching seller analytics:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب التحليلات المالية للورشة',
      code: 'SERVER_ERROR'
    });
  }
});

// ==================== INVENTORY MANAGEMENT ====================

// GET /api/seller/inventory - Stock breakdown & alert statuses
router.get('/inventory', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.user!.sellerId || req.user!.id;
    const inventory = await getSellerInventory(sellerId);
    res.json({
      success: true,
      sellerId,
      count: inventory.length,
      data: inventory
    });
  } catch (error) {
    console.error('Error fetching seller inventory:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب بيانات المخزون',
      code: 'SERVER_ERROR'
    });
  }
});

// PUT /api/seller/inventory/:productId - Quick stock update (does not reset moderation status)
router.put('/inventory/:productId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const productId = req.params.productId;
    const { newStock, reason } = req.body;

    const result = await updateSellerStock(req.user!, productId, newStock, reason);
    res.json({
      success: true,
      message: 'تم تحديث كمية المخزون وتسجيل حركة المخزن بنجاح',
      data: result
    });
  } catch (error: any) {
    console.error('Error updating inventory stock:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'فشل في تحديث كمية المخزون',
      code: 'INVENTORY_ERROR'
    });
  }
});

// GET /api/seller/inventory/movements - Stock history
router.get('/inventory/movements', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.user!.sellerId || req.user!.id;
    const productId = req.query.productId ? String(req.query.productId) : undefined;
    const movements = await getStockMovements(sellerId, productId);
    res.json({
      success: true,
      count: movements.length,
      data: movements
    });
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب سجل حركات المخزون',
      code: 'SERVER_ERROR'
    });
  }
});

// ==================== STORE PROFILE ====================

// PUT /api/seller/profile - Update store information
router.put('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await updateSellerProfile(req.user!, req.body);
    res.json({
      success: true,
      message: 'تم تحديث بيانات الورشة والمتجر بنجاح',
      data: updated
    });
  } catch (error: any) {
    console.error('Error updating seller profile:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'فشل في تحديث بيانات المتجر',
      code: 'PROFILE_ERROR'
    });
  }
});

// ==================== PRODUCTS ====================

// GET /api/seller/products - Returns all products of current seller (all statuses)
router.get('/products', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.user!.sellerId || req.user!.id;
    const products = await getSellerProducts(sellerId);

    res.json({
      success: true,
      sellerId,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب منتجات الورشة',
      code: 'SERVER_ERROR'
    });
  }
});

// GET /api/seller/orders - Returns all orders that contain products from this seller
router.get('/orders', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellerId = req.user!.sellerId || req.user!.id;
    const orders = await getSellerOrders(sellerId);

    res.json({
      success: true,
      sellerId,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب طلبات الورشة',
      code: 'SERVER_ERROR'
    });
  }
});

// PUT /api/seller/orders/:id/status - Update fulfillment status of an order
router.put('/orders/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'حالة الطلب الجديدة مطلوبة',
        code: 'VALIDATION_ERROR'
      });
    }

    const updatedOrder = await updateSellerOrderStatus(req.user!, orderId, status, note);

    res.json({
      success: true,
      message: 'تم تحديث حالة الطلب بنجاح',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating seller order status:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر تحديث حالة الطلب',
      code: 'UPDATE_ERROR'
    });
  }
});

// POST /api/seller/products - Create new product with server-side validation

router.post('/products', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, title, categoryId, categoryName, price, stockCount, description, specifications, images, status } = req.body;

    // Server-side validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'اسم المنتج اليدوي مطلوب ولا يمكن أن يكون فارغاً',
        code: 'VALIDATION_ERROR'
      });
    }

    if (!price || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'سعر المنتج يجب أن يكون أكبر من صفر',
        code: 'VALIDATION_ERROR'
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        error: 'يرجى اختيار القسم التراثي المناسب للمنتج',
        code: 'VALIDATION_ERROR'
      });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'يرجى رفع صورة واحدة على الأقل للمنتج',
        code: 'VALIDATION_ERROR'
      });
    }

    // Force pending status for seller submissions (seller cannot set approved)
    const initialStatus = status === 'draft' ? 'draft' : 'pending';

    const newProduct = await createProduct(
      req.user!,
      {
        id,
        title: title.trim(),
        categoryId,
        categoryName,
        price: Number(price),
        stockCount: stockCount ? Number(stockCount) : 10,
        description: description?.trim() || '',
        specifications,
        images
      },
      initialStatus
    );

    res.status(201).json({
      success: true,
      message: initialStatus === 'pending' ? 'تم إرسال المنتج للمراجعة بنجاح' : 'تم حفظ مسودة المنتج بنجاح',
      data: newProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'حدث خطأ أثناء حفظ المنتج',
      code: 'SERVER_ERROR'
    });
  }
});

// POST /api/seller/products/:id/submit - Submit product to admin review
router.post('/products/:id/submit', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const productId = req.params.id;
    const updatedProduct = await submitProductForReview(req.user!, productId);

    res.json({
      success: true,
      message: 'تم إرسال المنتج للمراجعة بنجاح وسيقوم فريق المنصة بفحصه',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error submitting product for review:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر إرسال المنتج للمراجعة',
      code: 'SUBMISSION_ERROR'
    });
  }
});

// PUT /api/seller/products/:id - Update product
router.put('/products/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const productId = req.params.id;
    const updatedProduct = await updateProduct(req.user!, productId, req.body);

    res.json({
      success: true,
      message: 'تم تحديث بيانات المنتج بنجاح',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر تحديث المنتج',
      code: 'UPDATE_ERROR'
    });
  }
});

// DELETE /api/seller/products/:id - Delete product
router.delete('/products/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const productId = req.params.id;
    await deleteProduct(req.user!, productId);

    res.json({
      success: true,
      message: 'تم حذف المنتج بنجاح'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر حذف المنتج',
      code: 'DELETE_ERROR'
    });
  }
});

// ==================== SELLER PAYOUT REQUESTS ====================

// POST /api/seller/payouts - Create payout request
router.post('/payouts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, notes } = req.body;
    const payout = await createSellerPayoutRequest(req.user!, amount, notes);

    res.status(201).json({
      success: true,
      message: 'تم إرسال طلب صرف المستحقات بنجاح وهو قيد المراجعة',
      data: payout
    });
  } catch (error) {
    console.error('[SellerRoutes] Error creating payout request:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'تعذر إنشاء طلب صرف المستحقات',
      code: 'PAYOUT_REQUEST_ERROR'
    });
  }
});

// GET /api/seller/payouts - Get all payouts and financial balance summary
router.get('/payouts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await getSellerPayouts(req.user!);
    res.json({
      success: true,
      data: result.payouts,
      summary: result.summary
    });
  } catch (error) {
    console.error('[SellerRoutes] Error fetching seller payouts:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'فشل في جلب طلبات صرف المستحقات',
      code: 'PAYOUT_FETCH_ERROR'
    });
  }
});

// GET /api/seller/payouts/:id - Get single payout details
router.get('/payouts/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payout = await getSellerPayoutById(req.user!, req.params.id);
    if (!payout) {
      return res.status(404).json({
        success: false,
        error: 'طلب الصرف غير موجود',
        code: 'PAYOUT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: payout
    });
  } catch (error) {
    console.error('[SellerRoutes] Error fetching payout by ID:', error);
    const msg = (error as Error).message;
    const status = msg.includes('غير مصرح') ? 403 : 400;
    res.status(status).json({
      success: false,
      error: msg || 'تعذر جلب تفاصيل طلب الصرف',
      code: 'PAYOUT_ERROR'
    });
  }
});

// PATCH /api/seller/payouts/:id/cancel - Cancel pending payout
router.patch('/payouts/:id/cancel', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payout = await cancelSellerPayout(req.user!, req.params.id);
    res.json({
      success: true,
      message: 'تم إلغاء طلب صرف المستحقات بنجاح',
      data: payout
    });
  } catch (error) {
    console.error('[SellerRoutes] Error cancelling payout:', error);
    const msg = (error as Error).message;
    const status = msg.includes('غير مصرح') ? 403 : 400;
    res.status(status).json({
      success: false,
      error: msg || 'تعذر إلغاء طلب صرف المستحقات',
      code: 'PAYOUT_CANCEL_ERROR'
    });
  }
});

export default router;

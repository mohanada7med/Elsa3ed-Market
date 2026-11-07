import express from 'express';
import type { Request, Response } from 'express';
import { memoryDb, getDatabase } from '../db/mongodb.ts';
import { validateAndCalculateDiscount } from '../services/discountService.ts';
import { getProductReviews, createProductReview } from '../services/reviewService.ts';
import { getRecommendedProducts } from '../services/recommendationService.ts';
import { getPaymentConfig } from '../services/paymentConfigService.ts';
import { getPaymobConfig, isIntegrationVerified } from '../services/paymobService.ts';
import { requireBuyer } from '../middleware/auth.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';

const router = express.Router();

// GET /api/sellers - Current public list of verified/active sellers
router.get('/sellers', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');

  const { db, isMongo } = await getDatabase();
  let sellers: any[] = [];

  if (isMongo && db) {
    try {
      sellers = await db.collection('sellers').find({ status: { $ne: 'suspended' } }).toArray();
      if (sellers.length > 0) {
        // Count approved products for each seller
        const productCounts = await db.collection('products').aggregate([
          { $match: { approvalStatus: { $in: ['approved', undefined, null] } } },
          { $group: { _id: '$sellerId', count: { $sum: 1 } } }
        ]).toArray();

        const countMap = new Map<string, number>();
        productCounts.forEach((pc: any) => {
          if (pc._id) countMap.set(String(pc._id), pc.count);
        });

        sellers = sellers.map((s) => ({
          ...s,
          productsCount: countMap.get(String(s.id)) ?? countMap.get(String(s.userId)) ?? s.productsCount ?? 0
        }));

        return res.json({ success: true, count: sellers.length, data: sellers });
      }
    } catch (e) {
      console.error('Error fetching sellers from Mongo:', e);
    }
  }

  sellers = memoryDb.sellers.filter((s) => s.status !== 'suspended').map((s) => {
    const pCount = memoryDb.products.filter(
      (p) => (p.sellerId === s.id || (p as any).userId === s.userId) &&
             (!p.approvalStatus || p.approvalStatus === 'approved')
    ).length;
    return { ...s, productsCount: pCount || s.productsCount || 0 };
  });

  res.json({ success: true, count: sellers.length, data: sellers });
});

// GET /api/sellers/:id - Public single seller details
router.get('/sellers/:id', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  const sellerId = req.params.id;

  const { db, isMongo } = await getDatabase();
  let seller: any = null;

  if (isMongo && db) {
    try {
      seller = await db.collection('sellers').findOne({ id: sellerId });
      if (seller) {
        const pCount = await db.collection('products').countDocuments({
          sellerId: { $in: [seller.id, seller.userId].filter(Boolean) },
          approvalStatus: { $in: ['approved', undefined, null] }
        });
        seller.productsCount = pCount;
        return res.json({ success: true, data: seller });
      }
      return res.status(404).json({ success: false, error: 'الورشة غير موجودة' });
    } catch (e) {
      console.error('Error fetching seller from Mongo:', e);
    }
  }

  if (!seller) {
    seller = memoryDb.sellers.find((s) => s.id === sellerId);
    if (seller) {
      const pCount = memoryDb.products.filter(
        (p) => (p.sellerId === seller.id || (p as any).userId === seller.userId) &&
               (!p.approvalStatus || p.approvalStatus === 'approved')
      ).length;
      seller = { ...seller, productsCount: pCount || seller.productsCount || 0 };
    }
  }

  if (!seller) {
    return res.status(404).json({ success: false, error: 'الورشة غير موجودة' });
  }

  res.json({ success: true, data: seller });
});


// POST /api/discounts/validate
router.post('/discounts/validate', async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'كود الخصم مطلوب' });
    }
    const result = await validateAndCalculateDiscount(code, Number(subtotal) || 0);
    if (!result.valid) {
      return res.status(400).json({ success: false, error: result.message || 'كود الخصم غير صالح' });
    }
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل في التحقق من كود الخصم' });
  }
});

// GET /api/reviews
router.get('/reviews', async (req: Request, res: Response) => {
  try {
    const productId = req.query.productId as string;
    if (!productId) {
      return res.status(400).json({ success: false, error: 'معرف المنتج مطلوب' });
    }
    const reviews = await getProductReviews(productId);
    res.json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل في جلب التقييمات' });
  }
});

// POST /api/reviews - Buyer only
router.post('/reviews', requireBuyer, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId, rating, comment } = req.body;
    const result = await createProductReview(req.user!, { productId, rating, comment });
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'فشل في إضافة التقييم' });
  }
});

// GET /api/recommendations
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const productId = req.query.productId as string;
    const categoryId = req.query.categoryId as string;
    const limit = Number(req.query.limit) || 4;
    const prods = await getRecommendedProducts({ productId, categoryId, limit });
    res.json({ success: true, data: prods });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل في جلب الترشيحات' });
  }
});

// GET /api/payment-config & /api/payment/config - Public configuration for customer checkout
router.get(['/payment-config', '/payment/config'], async (_req: Request, res: Response) => {
  try {
    const config = await getPaymentConfig();
    const paymobConfig = getPaymobConfig();
    const hasCredentials = Boolean(paymobConfig.secretKey && paymobConfig.publicKey);
    const canUseSimulator = process.env.NODE_ENV !== 'production' && !hasCredentials;

    let isPaymobCardActive = false;
    let isPaymobWalletActive = false;

    if (config.isOnlinePaymentActive !== false) {
      if (canUseSimulator) {
        isPaymobCardActive = true;
        isPaymobWalletActive = true;
      } else if (hasCredentials) {
        isPaymobCardActive = await isIntegrationVerified('card');
        isPaymobWalletActive = await isIntegrationVerified('wallet');
      }
    }

    res.json({
      success: true,
      data: {
        isOnlinePaymentActive: config.isOnlinePaymentActive !== false,
        isCashOnDeliveryActive: config.isCashOnDeliveryActive !== false,
        isPaymobCardActive,
        isPaymobWalletActive,
        instaPayAccount: config.instaPayAccount,
        vodafoneCashNumber: config.vodafoneCashNumber,
        instaPayInstructions: config.instaPayInstructions,
        vodafoneCashInstructions: config.vodafoneCashInstructions,
        isInstaPayActive: Boolean(config.isInstaPayActive),
        isVodafoneCashActive: Boolean(config.isVodafoneCashActive),
        updatedAt: config.updatedAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'فشل في جلب إعدادات الدفع' });
  }
});

export default router;

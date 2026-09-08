import express from 'express';
import type { Response } from 'express';
import { requireAuth, invalidateAuthSession } from '../middleware/auth.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { SellerStatus } from '../models/types.ts';
import { adminUpdateSellerStatus, notifyAdminsOnSellerRequest } from '../services/sellerService.ts';

const router = express.Router();

/**
 * GET /api/seller-requests/status
 * Check current seller application / approval status for the authenticated user.
 */
router.get('/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const sellerId = user.sellerId || user.id;
    const { db, isMongo } = await getDatabase();
    let sellerDoc: any = null;

    if (isMongo && db) {
      try {
        sellerDoc = await db.collection('sellers').findOne({
          $or: [{ id: sellerId }, { userId: user.id }, ...(user.sellerId ? [{ id: user.sellerId }] : [])]
        });
      } catch (e) {
        console.error('[SellerRequestRoutes /status] MongoDB error:', e);
      }
    }

    if (!sellerDoc) {
      sellerDoc = memoryDb.sellers.find(
        (s) => s.id === sellerId || (s as any).userId === user.id || (user.sellerId && s.id === user.sellerId)
      );
    }

    if (!sellerDoc) {
      return res.json({
        success: true,
        data: null,
        sellerStatus: 'none',
        message: 'لا يوجد طلب اعتماد مسجل لهذا الحساب حتى الآن'
      });
    }

    res.json({
      success: true,
      sellerStatus: sellerDoc.status || 'pending',
      data: {
        id: sellerDoc.id,
        userId: sellerDoc.userId || user.id,
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
        joinedDate: sellerDoc.joinedDate,
        createdAt: sellerDoc.createdAt || sellerDoc.joinedDate
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'فشل في جلب حالة طلب البائع',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * POST /api/seller-requests
 * Submit a request to upgrade from Buyer to Seller / submit workshop application.
 * Prevents duplicate pending submissions.
 */
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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

    // Check for existing seller application or workshop profile
    let existingSeller: any = null;
    if (isMongo && db) {
      try {
        existingSeller = await db.collection('sellers').findOne({
          $or: [{ userId: user.id }, ...(user.sellerId ? [{ id: user.sellerId }] : [])]
        });
      } catch (e) {
        console.error('[SellerRequestRoutes POST /] Check existing error:', e);
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

      // If rejected, allow re-application and resetting to pending
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

      // Notify admins
      await notifyAdminsOnSellerRequest({
        userId: user.id,
        userName: user.name,
        workshopName: workshopName.trim(),
        governorate: governorate || user.governorate,
        isReapply: true
      });

      return res.json({
        success: true,
        message: 'تم إعادة تقديم طلب اعتماد ورشتك بنجاح وهو قيد الفحص الإداري',
        data: { ...existingSeller, ...updatedData }
      });
    }

    // Create brand new seller application in MongoDB
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

    // Notify administrators
    await notifyAdminsOnSellerRequest({
      userId: user.id,
      userName: user.name,
      workshopName: workshopName.trim(),
      governorate: governorate || user.governorate,
      isReapply: false
    });

    res.status(201).json({
      success: true,
      message: 'تم تقديم طلب اعتماد ورشتك بنجاح! سيتم مراجعته وتدقيقه من قبل إدارة المنصة.',
      data: newSeller
    });
  } catch (error: any) {
    console.error('Error submitting seller request:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'فشل في تقديم طلب الانضمام كبائع',
      code: 'SERVER_ERROR'
    });
  }
});

export default router;

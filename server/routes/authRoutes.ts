import { Router, Request, Response } from 'express';
import { register, login, verifyToken } from '../services/authService.ts';
import { findUserById, updateUser } from '../services/userService.ts';
import { getUserFavorites, toggleFavorite } from '../services/favoriteService.ts';
import { getUserNotifications, markNotificationAsRead } from '../services/notificationService.ts';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.ts';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { storageService } from '../services/storage/storageProvider.ts';
import { uploadLimiter } from '../middleware/rateLimiter.ts';

const router = Router();

// Helper: Validate email format
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/auth/register (Standard registration - Buyer or Seller)
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role, governorate, workshopName, specialty } = req.body;

    // Server-side validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'الاسم الكامل مطلوب ويجب ألا يقل عن حرفين'
      });
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال بريد إلكتروني صالح ومكتمل'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'كلمة المرور يجب ألا تقل عن 6 خانات'
      });
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال رقم هاتف صالح'
      });
    }

    // Role enforcement: Never trust admin role from client
    let assignedRole: 'buyer' | 'seller' = 'buyer';
    if (role === 'seller' || workshopName) {
      assignedRole = 'seller';
      if (!workshopName || typeof workshopName !== 'string' || workshopName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'اسم الورشة أو العلامة الحرفية مطلوب لتسجيل البائع'
        });
      }
    }

    const session = await register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim(),
      role: assignedRole,
      governorate: governorate || 'قنا',
      workshopName: workshopName?.trim(),
      specialty: specialty?.trim()
    });

    res.status(201).json({
      success: true,
      message: assignedRole === 'seller'
        ? 'تم تسجيل حساب الورشة بنجاح، وهو قيد المراجعة والاعتماد من قبل إدارة المنصة'
        : 'تم إنشاء الحساب بنجاح',
      data: session
    });
  } catch (error: any) {
    const isConflict = error.message?.includes('مسجل بالفعل');
    res.status(isConflict ? 409 : 400).json({
      success: false,
      error: error.message || 'فشل في إنشاء الحساب'
    });
  }
});

// POST /api/auth/register/seller (Dedicated Seller Registration endpoint)
router.post('/register/seller', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, governorate, workshopName, specialty } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'اسم صاحب الورشة أو الحرفي مطلوب'
      });
    }

    if (!workshopName || typeof workshopName !== 'string' || workshopName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'اسم الورشة أو العلامة الحرفية مطلوب'
      });
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال بريد إلكتروني صالح'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام'
      });
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      return res.status(400).json({
        success: false,
        error: 'رقم هاتف التواصل للورشة مطلوب'
      });
    }

    // Role is strictly assigned server-side as 'seller'
    const session = await register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim(),
      role: 'seller',
      governorate: governorate || 'قنا',
      workshopName: workshopName.trim(),
      specialty: specialty?.trim() || 'مشغولات وحرف تراثية'
    });

    res.status(201).json({
      success: true,
      message: 'تم تسجيل ورشتكم بنجاح في سوق الصعيد! طلبكم قيد الفحص والاعتماد من قبل إدارة المنصة.',
      data: session
    });
  } catch (error: any) {
    const isConflict = error.message?.includes('مسجل بالفعل');
    res.status(isConflict ? 409 : 400).json({
      success: false,
      error: error.message || 'فشل في تسجيل حساب البائع'
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور'
      });
    }

    const session = await login(email, password);
    res.json({
      success: true,
      data: session
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'فشل تسجيل الدخول'
    });
  }
});

// GET /api/auth/me
router.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  let userId = req.user?.id;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const verified = verifyToken(token);
    if (verified) {
      userId = verified.sub;
    }
  }

  if (!userId) {
    return res.status(401).json({ success: false, error: 'غير مصرح' });
  }

  const user = await findUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'المستخدم غير موجود' });
  }

  const { passwordHash, ...sanitized } = user;
  let sellerStatus = user.sellerStatus;
  let sellerDetails: any = null;

  if (user.role === 'seller') {
    const { db, isMongo } = await getDatabase();
    const sellerId = user.sellerId || user.id;
    let sellerDoc: any = null;
    if (isMongo && db) {
      try {
        sellerDoc = await db.collection('sellers').findOne({
          $or: [{ id: sellerId }, { userId: user.id }]
        });
      } catch (e) {
        console.error('[authRoutes /me] Error:', e);
      }
    }
    if (!sellerDoc) {
      sellerDoc = memoryDb.sellers.find((s) => s.id === sellerId || (s as any).userId === user.id);
    }
    if (sellerDoc) {
      sellerStatus = sellerDoc.status;
      sellerDetails = {
        id: sellerDoc.id,
        brandName: sellerDoc.brandName,
        status: sellerDoc.status,
        verified: sellerDoc.verified,
        rejectionReason: sellerDoc.rejectionReason,
        suspensionReason: sellerDoc.suspensionReason
      };
    }
  }

  res.json({
    success: true,
    data: {
      ...sanitized,
      sellerStatus: sellerStatus || 'pending',
      seller: sellerDetails
    }
  });
});

// POST /api/auth/logout - Invalidate server session & confirm client cleanup
router.post('/logout', (req: Request, res: Response) => {
  // Stateless JWT session logout confirms termination
  res.json({
    success: true,
    message: 'تم تسجيل الخروج بنجاح من منصة سوق الصعيد'
  });
});

// PUT /api/auth/profile - Update profile details
router.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: 'غير مصرح' });
  }

  const { name, phone, governorate, avatar, profileImage, savedAddresses } = req.body;
  const updated = await updateUser(userId, {
    ...(name && { name: name.trim() }),
    ...(phone && { phone: phone.trim() }),
    ...(governorate && { governorate }),
    ...(avatar && { avatar }),
    ...(profileImage && { profileImage }),
    ...(savedAddresses && { savedAddresses })
  });

  if (!updated) {
    return res.status(404).json({ success: false, error: 'تعذر تحديث الملف الشخصي' });
  }

  const { passwordHash, ...sanitized } = updated;
  res.json({ success: true, data: sanitized });
});

// POST /api/auth/profile/image - Upload & update profile image via Cloudinary
router.post('/profile/image', uploadLimiter, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. Strictly use authenticated user id (ignore any client-provided userId)
    const userId = req.user!.id;
    const { image, filename, mimeType } = req.body;

    if (!image || typeof image !== 'string' || !image.trim()) {
      return res.status(400).json({
        success: false,
        error: 'يرجى تقديم بيانات الصورة المشفرة لرفعها',
        code: 'VALIDATION_ERROR'
      });
    }

    // 2. Upload to Cloudinary under Elsa3ed-Market/users/{userId}/profile
    const result = await storageService.upload({
      data: image,
      filename: filename || 'profile.jpg',
      mimeType,
      folder: 'users',
      userId: userId,
      customPublicId: 'profile',
      overwrite: true
    });

    // 3. Update MongoDB user record
    const updated = await updateUser(userId, {
      profileImage: {
        secureUrl: result.url,
        publicId: result.fileKey
      },
      avatar: result.url
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود في قاعدة البيانات',
        code: 'USER_NOT_FOUND'
      });
    }

    // 4. If user is a seller, also update avatar in sellers collection for consistency
    if (req.user!.role === 'seller') {
      const { db, isMongo } = await getDatabase();
      const sellerId = req.user!.sellerId || req.user!.id;
      if (isMongo && db) {
        await db.collection('sellers').updateOne(
          { $or: [{ id: sellerId }, { userId: userId }] },
          { $set: { avatar: result.url, updatedAt: new Date().toISOString() } }
        ).catch(() => {});
      }
    }

    const { passwordHash, ...sanitized } = updated;

    res.status(200).json({
      success: true,
      message: 'تم تحديث صورة الملف الشخصي بنجاح',
      data: {
        ...sanitized,
        profileImage: {
          secureUrl: result.url,
          publicId: result.fileKey
        },
        avatar: result.url
      }
    });
  } catch (error: any) {
    console.error('[authRoutes] Error uploading profile image:', error?.message || error);
    res.status(400).json({
      success: false,
      error: error.message || 'فشل في رفع صورة الملف الشخصي',
      code: 'UPLOAD_FAILED'
    });
  }
});

// DELETE /api/auth/profile/image - Remove custom profile image & restore default avatar
router.delete('/profile/image', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const currentUserDoc = await findUserById(userId);

    if (!currentUserDoc) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
        code: 'USER_NOT_FOUND'
      });
    }

    // 1. Delete asset from Cloudinary if custom publicId exists
    if (currentUserDoc.profileImage?.publicId) {
      await storageService.delete(currentUserDoc.profileImage.publicId, req.user).catch((err) => {
        console.warn('[authRoutes] Cloudinary profile asset deletion warning:', err);
      });
    }

    // 2. Restore default avatar and reset profileImage
    const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
    const updated = await updateUser(userId, {
      profileImage: null,
      avatar: defaultAvatar
    });

    // If seller, sync default avatar in sellers collection
    if (req.user!.role === 'seller') {
      const { db, isMongo } = await getDatabase();
      const sellerId = req.user!.sellerId || req.user!.id;
      if (isMongo && db) {
        await db.collection('sellers').updateOne(
          { $or: [{ id: sellerId }, { userId: userId }] },
          { $set: { avatar: defaultAvatar, updatedAt: new Date().toISOString() } }
        ).catch(() => {});
      }
    }

    const { passwordHash, ...sanitized } = (updated || currentUserDoc);

    res.status(200).json({
      success: true,
      message: 'تم حذف صورة الملف الشخصي واستعادة الصورة الافتراضية بنجاح',
      data: {
        ...sanitized,
        profileImage: null,
        avatar: defaultAvatar
      }
    });
  } catch (error: any) {
    console.error('[authRoutes] Error removing profile image:', error?.message || error);
    res.status(500).json({
      success: false,
      error: error.message || 'فشل في حذف صورة الملف الشخصي',
      code: 'DELETE_FAILED'
    });
  }
});

// GET /api/auth/favorites
router.get('/favorites', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.json({ success: true, data: [] });
  }

  const favs = await getUserFavorites(userId);
  res.json({ success: true, data: favs });
});

// POST /api/auth/favorites/toggle
router.post('/favorites/toggle', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ success: false, error: 'معرف المستخدم ومعرف المنتج مطلوبان' });
  }

  const result = await toggleFavorite(userId, productId);
  res.json({ success: true, data: result });
});

// GET /api/auth/notifications
router.get('/notifications', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.json({ success: true, data: [] });
  }

  const notifs = await getUserNotifications(userId);
  res.json({ success: true, data: notifs });
});

// PATCH /api/auth/notifications/:id/read
router.patch('/notifications/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const notificationId = req.params.id;

  if (!userId || !notificationId) {
    return res.status(400).json({ success: false, error: 'بيانات غير مكتملة' });
  }

  await markNotificationAsRead(userId, notificationId);
  res.json({ success: true });
});

export default router;

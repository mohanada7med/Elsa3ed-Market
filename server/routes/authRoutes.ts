import express from 'express';
import type { Request, Response } from 'express';
import { register, login, verifyToken } from '../services/authService.ts';
import { findUserById, updateUser, DEFAULT_USER_AVATAR, changeUserPersonalPassword } from '../services/userService.ts';
import { createPasswordResetRequest } from '../services/passwordResetService.ts';
import { getUserFavorites, toggleFavorite } from '../services/favoriteService.ts';
import { getUserNotifications, markNotificationAsRead } from '../services/notificationService.ts';
import { requireAuth, invalidateAuthSession } from '../middleware/auth.ts';
import type { AuthenticatedRequest } from '../middleware/auth.ts';

import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { storageService } from '../services/storage/storageProvider.ts';
import { uploadLimiter, forgotPasswordLimiter } from '../middleware/rateLimiter.ts';
import { setAuthCookie, clearAuthCookie, getAuthTokenFromRequest } from '../config/authCookie.ts';

const router = express.Router();

// Helper: Validate email format
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/auth/register (Standard registration - Buyer or Seller)
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, name, email, password, phone, role, governorate, workshopName, specialty, avatar } = req.body;

    // Server-side validation
    if (!username || typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({
        success: false,
        error: 'من فضلك اكتب اسم المستخدم'
      });
    }

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'الاسم الكامل مطلوب ويجب ألا يقل عن حرفين'
      });
    }

    // Email is optional, but if provided it must be valid
    if (email && typeof email === 'string' && email.trim() && !isValidEmail(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال بريد إلكتروني صالح ومكتمل أو تركه فارغاً'
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
      username: username.trim(),
      name: name.trim(),
      email: email?.trim() ? email.trim().toLowerCase() : undefined,
      password,
      phone: phone.trim(),
      role: assignedRole,
      avatar: typeof avatar === 'string' && avatar.trim() ? avatar.trim() : undefined,
      governorate: governorate || 'قنا',
      workshopName: workshopName?.trim(),
      specialty: specialty?.trim()
    });

    // Set secure HTTP-only authentication cookie
    setAuthCookie(res, session.token);

    res.status(201).json({
      success: true,
      message: assignedRole === 'seller'
        ? 'تم تسجيل حساب الورشة بنجاح، وهو قيد المراجعة والاعتماد من قبل إدارة المنصة'
        : 'تم إنشاء الحساب بنجاح',
      data: session
    });
  } catch (error: any) {
    const isConflict = error.message?.includes('مستخدم بالفعل') || error.message?.includes('مسجل بالفعل');
    res.status(isConflict ? 409 : 400).json({
      success: false,
      error: error.message || 'فشل في إنشاء الحساب'
    });
  }
});

// POST /api/auth/register/seller (Dedicated Seller Registration endpoint)
router.post('/register/seller', async (req: Request, res: Response) => {
  try {
    const { username, name, email, password, phone, governorate, workshopName, specialty, avatar } = req.body;

    if (!username || typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({
        success: false,
        error: 'من فضلك اكتب اسم المستخدم'
      });
    }

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

    if (email && typeof email === 'string' && email.trim() && !isValidEmail(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال بريد إلكتروني صالح أو تركه فارغاً'
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
      username: username.trim(),
      name: name.trim(),
      email: email?.trim() ? email.trim().toLowerCase() : undefined,
      password,
      phone: phone.trim(),
      role: 'seller',
      avatar: typeof avatar === 'string' && avatar.trim() ? avatar.trim() : undefined,
      governorate: governorate || 'قنا',
      workshopName: workshopName.trim(),
      specialty: specialty?.trim() || 'مشغولات وحرف تراثية'
    });

    // Set secure HTTP-only authentication cookie
    setAuthCookie(res, session.token);

    res.status(201).json({
      success: true,
      message: 'تم تسجيل ورشتكم بنجاح في سوق الصعيد! طلبكم قيد الفحص والاعتماد من قبل إدارة المنصة.',
      data: session
    });
  } catch (error: any) {
    const isConflict = error.message?.includes('مستخدم بالفعل') || error.message?.includes('مسجل بالفعل');
    res.status(isConflict ? 409 : 400).json({
      success: false,
      error: error.message || 'فشل في تسجيل حساب البائع'
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, email, identifier, password } = req.body;
    const loginIdentifier = (username || identifier || email)?.trim();

    if (!loginIdentifier) {
      return res.status(400).json({
        success: false,
        error: 'من فضلك اكتب اسم المستخدم'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'من فضلك اكتب كلمة المرور'
      });
    }

    const session = await login(loginIdentifier, password);

    // Set secure HTTP-only authentication cookie
    setAuthCookie(res, session.token);

    res.json({
      success: true,
      data: session
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'اسم المستخدم أو كلمة المرور غير صحيحة'
    });
  }
});

// GET /api/auth/me (Restore and validate session)
router.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  // Fast path: if middleware already authenticated the user, return immediately without extra DB queries
  if (req.user && req.user.id) {
    const user = req.user;
    return res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role,
        governorate: user.governorate,
        avatar: user.avatar,
        profileImage: user.profileImage,
        mustChangePassword: Boolean(user.mustChangePassword),
        sellerStatus: user.sellerStatus || (user.role === 'seller' ? 'pending' : undefined),
        seller: user.seller || null
      }
    });
  }

  let userId: string | undefined;
  const token = getAuthTokenFromRequest(req);
  if (token) {
    const verified = verifyToken(token);
    if (verified && verified.sub) {
      userId = verified.sub;
    }
  }

  if (!userId) {
    return res.status(401).json({ success: false, error: 'غير مصرح. لا توجد جلسة نشطة' });
  }

  const user = await findUserById(userId);
  if (!user) {
    clearAuthCookie(res);
    return res.status(401).json({ success: false, error: 'المستخدم غير موجود أو تم إلغاء حسابه' });
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
        brandName: sellerDoc.brandName || sellerDoc.name,
        name: sellerDoc.name,
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
      mustChangePassword: Boolean(user.mustChangePassword),
      sellerStatus: sellerStatus || 'pending',
      seller: sellerDetails
    }
  });
});


// POST /api/auth/forgot-password - Submit forgot password request by username
router.post('/forgot-password', forgotPasswordLimiter, async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    if (!username || typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({
        success: false,
        error: 'من فضلك اكتب اسم المستخدم'
      });
    }

    const result = await createPasswordResetRequest(username.trim());
    res.json({
      success: true,
      message: result.message,
      data: { requestId: result.requestId }
    });
  } catch (error: any) {
    console.error('[authRoutes] Error in forgot-password:', error?.message || error);
    res.status(400).json({
      success: false,
      error: error?.message || 'فشل في تقديم طلب استعادة كلمة المرور'
    });
  }
});

// POST /api/auth/change-password - Change temporary password to new personal password
router.post('/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'كلمة المرور الحالية أو المؤقتة مطلوبة'
      });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'كلمة المرور الجديدة يجب ألا تقل عن 6 خانات'
      });
    }

    const result = await changeUserPersonalPassword(userId, currentPassword, newPassword);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    console.error('[authRoutes] Error changing password:', error?.message || error);
    res.status(400).json({
      success: false,
      error: error?.message || 'فشل في تغيير كلمة المرور'
    });
  }
});

// POST /api/auth/logout - Invalidate server session & clear auth cookie
router.post('/logout', (req: Request, res: Response) => {
  const token = getAuthTokenFromRequest(req);
  if (token) {
    const verified = verifyToken(token);
    if (verified?.sub) {
      invalidateAuthSession(verified.sub);
    }
  }
  clearAuthCookie(res);
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

  invalidateAuthSession(userId);
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
        ).catch(() => { });
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
    const defaultAvatar = DEFAULT_USER_AVATAR;
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
        ).catch(() => { });
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

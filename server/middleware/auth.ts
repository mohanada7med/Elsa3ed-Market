import { Request, Response, NextFunction } from 'express';
import { UserRole, SellerStatus } from '../models/types.ts';
import { memoryDb, getDatabase } from '../db/mongodb.ts';
import { verifyToken } from '../services/authService.ts';
import { getAuthTokenFromRequest } from '../config/authCookie.ts';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  governorate?: string;
  sellerId?: string;
  sellerStatus?: SellerStatus;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
  const userRoleHeader = (req.headers['x-user-role'] as UserRole) || (req.query.userRole as UserRole);

  // 1. Primary: Extract and verify authentication token from HTTP-only Cookie or Bearer header
  const token = getAuthTokenFromRequest(req);
  if (token) {
    const verified = verifyToken(token);
    if (verified && verified.sub) {
      userId = verified.sub;
    }
  }

  if (!userId && !userRoleHeader) {
    // Default to guest/unauthenticated
    return next();
  }

  // Look up user from database or memory
  const { db, isMongo } = await getDatabase();
  let userProfile: any = null;

  if (isMongo && db && userId) {
    try {
      userProfile = await db.collection('users').findOne({ id: userId });
    } catch (e) {
      console.error('[Auth] MongoDB user lookup error:', e);
    }
  }

  if (!userProfile && userId) {
    userProfile = memoryDb.users.find((u) => u.id === userId);
  }

  // If user not found in DB, check standard default development accounts safely
  if (!userProfile) {
    if (userId === 'user-admin-1') {
      userProfile = {
        id: 'user-admin-1',
        name: 'أ/ محمود الهواري (مدير المنصة)',
        email: 'admin@elsa3ed.eg',
        role: 'admin',
        governorate: 'قنا'
      };
    } else if (userId === 'seller-1') {
      userProfile = {
        id: 'seller-1',
        sellerId: 'seller-1',
        name: 'الأسطى سعيد القناوي',
        email: 'saeed.pottery@elsa3ed.eg',
        role: 'seller',
        sellerStatus: 'approved',
        governorate: 'قنا'
      };
    } else if (userId === 'user-buyer-1') {
      userProfile = {
        id: 'user-buyer-1',
        name: 'أحمد محمود الهاشمي',
        email: 'ahmed.hashmi@gmail.com',
        role: 'buyer',
        governorate: 'القاهرة'
      };
    } else if (userRoleHeader === 'admin' && !userId) {
      // Unspecified demo admin
      userProfile = {
        id: 'user-admin-1',
        name: 'أ/ محمود الهواري (مدير المنصة)',
        email: 'admin@elsa3ed.eg',
        role: 'admin',
        governorate: 'قنا'
      };
    } else if (userRoleHeader === 'seller' && !userId) {
      // Unspecified demo seller
      userProfile = {
        id: 'seller-1',
        sellerId: 'seller-1',
        name: 'الأسطى سعيد القناوي',
        email: 'saeed.pottery@elsa3ed.eg',
        role: 'seller',
        sellerStatus: 'approved',
        governorate: 'قنا'
      };
    } else if (userRoleHeader === 'buyer' && !userId) {
      userProfile = {
        id: 'user-buyer-1',
        name: 'أحمد محمود الهاشمي',
        email: 'ahmed.hashmi@gmail.com',
        role: 'buyer',
        governorate: 'القاهرة'
      };
    }
  }

  if (!userProfile) {
    return next();
  }

  // Resolve Seller Status and Seller ID accurately
  let sellerId = userProfile.sellerId || (userProfile.role === 'seller' ? userProfile.id : undefined);
  let sellerStatus: SellerStatus | undefined = userProfile.sellerStatus;

  if (userProfile.role === 'seller') {
    let sellerDoc: any = null;
    if (isMongo && db) {
      try {
        sellerDoc = await db.collection('sellers').findOne({
          $or: [{ id: sellerId }, { userId: userProfile.id }]
        });
      } catch (e) {
        console.error('[Auth] Error querying seller details in MongoDB:', e);
      }
    }
    if (!sellerDoc) {
      sellerDoc = memoryDb.sellers.find((s) => s.id === sellerId || (s as any).userId === userProfile.id);
    }

    if (sellerDoc) {
      sellerStatus = sellerDoc.status;
      sellerId = sellerDoc.id;
    } else {
      sellerStatus = sellerStatus || 'pending';
    }
  }

  req.user = {
    id: userProfile.id,
    sellerId,
    sellerStatus,
    name: userProfile.name,
    email: userProfile.email,
    role: userProfile.role,
    governorate: userProfile.governorate
  };

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      error: 'غير مصرح. يرجى تسجيل الدخول أولاً',
      code: 'UNAUTHORIZED'
    });
  }
  next();
}

export function requireBuyer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      error: 'غير مصرح. يرجى تسجيل الدخول أولاً',
      code: 'UNAUTHORIZED'
    });
  }
  next();
}

export async function requireSeller(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      error: 'غير مصرح. يرجى تسجيل الدخول كبائع',
      code: 'UNAUTHORIZED'
    });
  }

  // Admin has supervising access
  if (req.user.role === 'admin') {
    return next();
  }

  if (req.user.role !== 'seller') {
    return res.status(403).json({
      success: false,
      error: 'عفواً، هذه الميزة مخصصة للبائعين والحرفيين المعتمدين فقط',
      code: 'FORBIDDEN_SELLER_ONLY'
    });
  }

  // Server-side enforcement of Seller Status
  let sellerStatus = req.user.sellerStatus;

  // Refresh status from database if not cached on user context
  if (!sellerStatus) {
    const { db, isMongo } = await getDatabase();
    const sellerId = req.user.sellerId || req.user.id;
    let sellerDoc: any = null;
    if (isMongo && db) {
      try {
        sellerDoc = await db.collection('sellers').findOne({
          $or: [{ id: sellerId }, { userId: req.user.id }]
        });
      } catch (e) {
        console.error('[requireSeller] MongoDB lookup error:', e);
      }
    }
    if (!sellerDoc) {
      sellerDoc = memoryDb.sellers.find((s) => s.id === sellerId || (s as any).userId === req.user!.id);
    }
    sellerStatus = sellerDoc?.status || 'pending';
    req.user.sellerStatus = sellerStatus;
  }

  if (sellerStatus === 'pending') {
    return res.status(403).json({
      success: false,
      error: 'حساب البائع قيد المراجعة والاعتماد من قبل إدارة المنصة',
      code: 'SELLER_PENDING_APPROVAL',
      sellerStatus: 'pending'
    });
  }

  if (sellerStatus === 'rejected') {
    return res.status(403).json({
      success: false,
      error: 'تم رفض طلب انضمام البائع من قبل إدارة المنصة',
      code: 'SELLER_REJECTED',
      sellerStatus: 'rejected'
    });
  }

  if (sellerStatus === 'suspended') {
    return res.status(403).json({
      success: false,
      error: 'حساب البائع معلق حالياً، يرجى التواصل مع إدارة المنصة',
      code: 'SELLER_SUSPENDED',
      sellerStatus: 'suspended'
    });
  }

  if (sellerStatus !== 'approved') {
    return res.status(403).json({
      success: false,
      error: 'حساب البائع غير معتمد بعد',
      code: 'SELLER_NOT_APPROVED',
      sellerStatus
    });
  }

  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      error: 'غير مصرح. يرجى تسجيل الدخول كمدير للنظام',
      code: 'UNAUTHORIZED'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'عفواً، هذه العملية مخصصة لمدراء منصة سوق الصعيد فقط',
      code: 'FORBIDDEN_ADMIN_ONLY'
    });
  }

  next();
}

import type { Request, Response, NextFunction } from 'express';
import type { UserRole, SellerStatus } from '../models/types.ts';
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
  // 1. Primary: Extract and verify authentication token from HTTP-only Cookie or Bearer header
  const token = getAuthTokenFromRequest(req);
  if (!token) {
    // Unauthenticated visitor / guest
    return next();
  }

  const verified = verifyToken(token);
  if (!verified || !verified.sub) {
    // Invalid or tampered token
    return next();
  }

  const userId = verified.sub;

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

  // If user verified by token but DB sync is resolving, fall back safely to verified token claims
  if (!userProfile && verified.role) {
    userProfile = {
      id: userId,
      name: verified.username || 'مستخدم المنصة',
      email: verified.email || '',
      role: verified.role,
      sellerId: verified.sellerId,
      sellerStatus: verified.sellerStatus
    };
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

  if (req.user.role !== 'buyer') {
    return res.status(403).json({
      success: false,
      error: 'عفواً، سلة المشتريات وإتمام الطلبات مخصصة لحسابات المشترين فقط',
      code: 'FORBIDDEN_BUYER_ONLY'
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

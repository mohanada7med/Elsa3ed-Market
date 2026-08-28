import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  findUserByEmail,
  findUserById,
  findUserByUsername,
  findUserByIdentifier,
  validateUsername,
  createUser,
  DEFAULT_USER_AVATAR
} from './userService.ts';
import { storageService } from './storage/storageProvider.ts';
import { UserDocument, UserRole, SellerStatus } from '../models/types.ts';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { createAuditLog } from './auditService.ts';
import { Logger } from '../utils/logger.ts';

const JWT_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'elsa3ed-dev-jwt-key' : '');
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('[AuthService] FATAL: AUTH_SECRET or JWT_SECRET must be set in production.');
}

export interface AuthSession {
  token: string;
  user: {
    id: string;
    username: string;
    name: string;
    email?: string;
    phone: string;
    role: UserRole;
    avatar?: string;
    status?: 'active' | 'suspended' | 'blocked';
    mustChangePassword?: boolean;
    profileImage?: {
      secureUrl: string;
      publicId: string;
    } | null;
    governorate?: string;
    sellerId?: string;
    sellerStatus?: SellerStatus;
    savedAddresses?: any[];
  };
}

export const TOKEN_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function generateToken(user: UserDocument): string {
  const now = Date.now();
  const payload = {
    sub: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    sellerId: user.sellerId,
    sellerStatus: user.sellerStatus,
    iat: now,
    exp: now + TOKEN_EXPIRATION_MS
  };
  const str = Buffer.from(JSON.stringify(payload)).toString('base64');
  const hmac = crypto.createHmac('sha256', JWT_SECRET).update(str).digest('hex');
  return `${str}.${hmac}`;
}

export function verifyToken(token: string): {
  sub: string;
  username?: string;
  email?: string;
  role: UserRole;
  sellerId?: string;
  sellerStatus?: SellerStatus;
  exp?: number;
} | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;
    const expectedHmac = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('hex');
    if (signature !== expectedHmac) return null;
    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));

    // Reject expired tokens
    if (decoded.exp && Date.now() > decoded.exp) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

export async function comparePassword(plainPassword: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(plainPassword, hash);
}

export async function register(params: {
  username: string;
  name: string;
  email?: string;
  password: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  governorate?: string;
  workshopName?: string;
  specialty?: string;
}): Promise<AuthSession> {
  // 1. Validate username
  const usernameCheck = validateUsername(params.username);
  if (!usernameCheck.valid) {
    throw new Error(usernameCheck.message || 'اسم المستخدم غير صالح');
  }

  // 2. Enforce uniqueness of username across all roles
  const existingUsername = await findUserByUsername(params.username);
  if (existingUsername) {
    throw new Error('اسم المستخدم مستخدم بالفعل، اختر اسمًا آخر');
  }

  // 3. Check optional email uniqueness if provided
  if (params.email?.trim()) {
    const existingEmail = await findUserByEmail(params.email);
    if (existingEmail) {
      throw new Error('هذا البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد آخر أو تسجيل الدخول.');
    }
  }

  const passwordHash = await hashPassword(params.password);
  const userId = `user-${params.role}-${Date.now()}`;
  let sellerId: string | undefined = undefined;

  // Handle avatar (dataURI upload to Cloudinary or fallback to DEFAULT_USER_AVATAR)
  let finalAvatar = DEFAULT_USER_AVATAR;
  let profileImageObj: { secureUrl: string; publicId: string } | null = null;

  if (params.avatar?.trim()) {
    const trimmedAvatar = params.avatar.trim();
    if (trimmedAvatar.startsWith('data:image/')) {
      try {
        const uploadRes = await storageService.upload({
          data: trimmedAvatar,
          filename: 'profile.jpg',
          folder: 'users',
          userId,
          customPublicId: 'profile',
          overwrite: true
        });
        finalAvatar = uploadRes.url;
        profileImageObj = {
          secureUrl: uploadRes.url,
          publicId: uploadRes.fileKey
        };
      } catch (uploadErr) {
        Logger.warn('[AuthService] Could not upload initial avatar dataUri, using default:', uploadErr);
        finalAvatar = DEFAULT_USER_AVATAR;
      }
    } else {
      finalAvatar = trimmedAvatar;
    }
  }

  // If role is seller, create seller profile in MongoDB `sellers` collection
  if (params.role === 'seller') {
    sellerId = `seller-${Date.now()}`;
    const { db, isMongo } = await getDatabase();
    const newSeller = {
      id: sellerId,
      userId,
      name: params.name,
      brandName: params.workshopName || `ورشة ${params.name}`,
      governorate: params.governorate || 'قنا',
      rating: 5.0,
      salesCount: 0,
      productsCount: 0,
      badge: 'حرفي جديد',
      avatar: finalAvatar,
      coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
      bio: `ورشة متخصصة في صناعة المشغولات الصعيدية والتراثية الأصيلة في محافظة ${params.governorate || 'قنا'}.`,
      story: `بدأنا بحرفة الأجداد وتوارثناها جيلاً بعد جيل لنقدم لكم أروع ما أبدعت أيادي الصعيد.`,
      verified: false,
      joinedDate: new Date().toISOString().split('T')[0],
      phone: params.phone,
      email: params.email || '',
      payoutMethod: 'vodafone_cash',
      payoutAccount: params.phone,
      status: 'pending' as SellerStatus,
      specialty: params.specialty || 'مشغولات وحرف تراثية'
    };

    if (isMongo && db) {
      await db.collection('sellers').insertOne(newSeller as any);
    } else {
      throw new Error('قاعدة البيانات غير متوفرة حالياً، تعذر تسجيل حساب البائع.');
    }
  }

  const createdUser = await createUser({
    id: userId,
    username: params.username,
    name: params.name,
    email: params.email,
    passwordHash,
    phone: params.phone,
    role: params.role,
    avatar: finalAvatar,
    profileImage: profileImageObj,
    governorate: params.governorate || 'قنا',
    sellerId,
    sellerStatus: params.role === 'seller' ? 'pending' : undefined,
    savedAddresses: []
  });

  await createAuditLog({
    userName: createdUser.name,
    userRole: createdUser.role,
    action: 'تسجيل مستخدم جديد',
    resource: 'users',
    resourceId: createdUser.id,
    status: 'نجاح',
    details: `تم تسجيل حساب جديد بنجاح باسم مستخدم: (${createdUser.username}) وصلاحية (${createdUser.role})`
  });

  const token = generateToken(createdUser);
  return {
    token,
    user: {
      id: createdUser.id,
      username: createdUser.username,
      name: createdUser.name,
      email: createdUser.email,
      phone: createdUser.phone,
      role: createdUser.role,
      avatar: createdUser.avatar,
      profileImage: createdUser.profileImage || profileImageObj || null,
      governorate: createdUser.governorate,
      sellerId: createdUser.sellerId,
      sellerStatus: createdUser.sellerStatus,
      savedAddresses: createdUser.savedAddresses
    }
  };
}

export async function login(identifier: string, password: string): Promise<AuthSession> {
  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    throw new Error('من فضلك اكتب اسم المستخدم');
  }
  if (!password || typeof password !== 'string') {
    throw new Error('من فضلك اكتب كلمة المرور');
  }

  const user = await findUserByIdentifier(identifier);
  if (!user || !user.passwordHash) {
    throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
  }

  if (user.status === 'suspended' || user.status === 'blocked') {
    throw new Error('تم تعليق هذا الحساب من قبل إدارة المنصة. يرجى التواصل مع الإدارة.');
  }

  // If role is seller, query latest status from sellers collection
  let sellerStatus: SellerStatus | undefined = user.sellerStatus;
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
        Logger.error('[AuthService] Error fetching seller status during login:', e);
      }
    }
    sellerStatus = sellerDoc?.status || user.sellerStatus || 'pending';
  }

  const userWithStatus: UserDocument = {
    ...user,
    sellerStatus
  };

  await createAuditLog({
    userName: user.name,
    userRole: user.role,
    action: 'تسجيل دخول ناجح',
    resource: 'users',
    resourceId: user.id,
    status: 'نجاح',
    details: `تم تسجيل دخول المستخدم (${user.username || user.name}) بنجاح`
  });

  const token = generateToken(userWithStatus);
  return {
    token,
    user: {
      id: user.id,
      username: user.username || user.name,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      status: user.status || 'active',
      mustChangePassword: Boolean(user.mustChangePassword),
      profileImage: user.profileImage || null,
      governorate: user.governorate,
      sellerId: user.sellerId,
      sellerStatus: userWithStatus.sellerStatus,
      savedAddresses: user.savedAddresses
    }
  };
}

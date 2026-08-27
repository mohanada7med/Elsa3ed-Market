import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { findUserByEmail, findUserById, createUser } from './userService.ts';
import { UserDocument, UserRole, SellerStatus } from '../models/types.ts';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { createAuditLog } from './auditService.ts';
import { Logger } from '../utils/logger.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'elsa3ed-market-secret-jwt-key-2025';

export interface AuthSession {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    avatar?: string;
    governorate?: string;
    sellerId?: string;
    sellerStatus?: SellerStatus;
    savedAddresses?: any[];
  };
}

export function generateToken(user: UserDocument): string {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    sellerId: user.sellerId,
    sellerStatus: user.sellerStatus,
    iat: Date.now()
  };
  const str = Buffer.from(JSON.stringify(payload)).toString('base64');
  const hmac = crypto.createHmac('sha256', JWT_SECRET).update(str).digest('hex');
  return `${str}.${hmac}`;
}

export function verifyToken(token: string): { sub: string; email: string; role: UserRole; sellerId?: string; sellerStatus?: SellerStatus } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;
    const expectedHmac = crypto.createHmac('sha256', JWT_SECRET).update(payloadB64).digest('hex');
    if (signature !== expectedHmac) return null;
    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));
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
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  governorate?: string;
  workshopName?: string;
  specialty?: string;
}): Promise<AuthSession> {
  const existingUser = await findUserByEmail(params.email);
  if (existingUser) {
    throw new Error('هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.');
  }

  const passwordHash = await hashPassword(params.password);
  const userId = `user-${params.role}-${Date.now()}`;
  let sellerId: string | undefined = undefined;

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
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
      bio: `ورشة متخصصة في صناعة المشغولات الصعيدية والتراثية الأصيلة في محافظة ${params.governorate || 'قنا'}.`,
      story: `بدأنا بحرفة الأجداد وتوارثناها جيلاً بعد جيل لنقدم لكم أروع ما أبدعت أيادي الصعيد.`,
      verified: false,
      joinedDate: new Date().toISOString().split('T')[0],
      phone: params.phone,
      email: params.email,
      payoutMethod: 'vodafone_cash',
      payoutAccount: params.phone,
      status: 'pending' as SellerStatus,
      specialty: params.specialty || 'مشغولات وحرف تراثية'
    };

    if (isMongo && db) {
      try {
        await db.collection('sellers').insertOne(newSeller as any);
      } catch (e) {
        Logger.error('[AuthService] Error creating seller record in MongoDB:', e);
      }
    }
    memoryDb.sellers.push(newSeller as any);
  }

  const createdUser = await createUser({
    id: userId,
    name: params.name,
    email: params.email,
    passwordHash,
    phone: params.phone,
    role: params.role,
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
    details: `تم تسجيل حساب جديد بنجاح بصلاحية (${createdUser.role}) والبريد: ${createdUser.email}`
  });

  const token = generateToken(createdUser);
  return {
    token,
    user: {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      phone: createdUser.phone,
      role: createdUser.role,
      avatar: createdUser.avatar,
      governorate: createdUser.governorate,
      sellerId: createdUser.sellerId,
      sellerStatus: createdUser.sellerStatus,
      savedAddresses: createdUser.savedAddresses
    }
  };
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور.');
  }

  // Verify password if passwordHash exists
  if (user.passwordHash) {
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور.');
    }
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
    if (!sellerDoc) {
      sellerDoc = memoryDb.sellers.find((s) => s.id === sellerId || (s as any).userId === user.id);
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
    action: 'تسجيل دخول',
    resource: 'auth',
    resourceId: user.id,
    status: 'نجاح',
    details: `تسجيل دخول ناجح للمستخدم (${user.email}) بدور (${user.role})`
  });

  const token = generateToken(userWithStatus);
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      governorate: user.governorate,
      sellerId: user.sellerId,
      sellerStatus,
      savedAddresses: user.savedAddresses
    }
  };
}

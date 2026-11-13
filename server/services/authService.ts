import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  findUserByEmail,
  findUserById,
  findUserByUsername,
  findUserByIdentifier,
  findUserByGoogleUid,
  updateUser,
  validateUsername,
  createUser,
  DEFAULT_USER_AVATAR
} from './userService.ts';
import { storageService } from './storage/storageProvider.ts';
import type { UserDocument, UserRole, SellerStatus } from '../models/types.ts';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { createAuditLog } from './auditService.ts';
import { notifyAdminsOnSellerRequest } from './sellerService.ts';
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
    hasPassword?: boolean;
    authProvider?: 'local' | 'google' | 'hybrid';
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
    authVersion: user.authVersion || 0,
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
  authVersion?: number;
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
      badge: 'صنايعي جديد',
      avatar: finalAvatar,
      coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
      bio: `ورشة متخصصة في عمل المشغولات الصعيدية والتراثية على أصولها في محافظة ${params.governorate || 'قنا'}.`,
      story: `بدأنا بصنعة أجدادنا وورثناها جيل ورا جيل عشان نوصلكم أحسن ما طلعت إيدين الصعايدة.`,
      verified: false,
      joinedDate: new Date().toISOString().split('T')[0],
      phone: params.phone,
      email: params.email || '',
      payoutMethod: 'vodafone_cash',
      payoutAccount: params.phone,
      status: 'pending' as SellerStatus,
      specialty: params.specialty || 'مشغولات وحرف صعيدية على أصولها'
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
    role: params.role === 'seller' ? 'buyer' : params.role,
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

  if (params.role === 'seller') {
    await notifyAdminsOnSellerRequest({
      userId,
      userName: params.name,
      workshopName: params.workshopName || `ورشة ${params.name}`,
      governorate: params.governorate || 'قنا',
      isReapply: false
    });
  }

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
      hasPassword: Boolean(createdUser.passwordHash),
      authProvider: createdUser.authProvider || 'local',
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
  if (!user) {
    throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
  }

  if (!user.passwordHash && (user.googleUid || user.authProvider === 'google')) {
    throw new Error('هذا الحساب مسجّل عبر Google. اضغط على "المتابعة باستخدام Google" لتسجيل الدخول.');
  }

  if (!user.passwordHash) {
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
      hasPassword: Boolean(user.passwordHash),
      authProvider: user.authProvider || 'local',
      profileImage: user.profileImage || null,
      governorate: user.governorate,
      sellerId: user.sellerId,
      sellerStatus: userWithStatus.sellerStatus,
      savedAddresses: user.savedAddresses
    }
  };
}

// ==================== FIREBASE GOOGLE ID TOKEN VERIFICATION & AUTH ====================

const GOOGLE_CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

interface CertsCacheEntry {
  certs: Record<string, string>;
  expiresAt: number;
}

let googleCertsCache: CertsCacheEntry | null = null;
let cachedFirebaseProjectId: string | null = null;

function getFirebaseProjectId(): string {
  if (cachedFirebaseProjectId) return cachedFirebaseProjectId;
  if (process.env.FIREBASE_PROJECT_ID) {
    cachedFirebaseProjectId = process.env.FIREBASE_PROJECT_ID.trim();
    return cachedFirebaseProjectId;
  }
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed?.projectId && typeof parsed.projectId === 'string') {
      const projectId = parsed.projectId.trim();
      if (projectId) {
        cachedFirebaseProjectId = projectId;
        return projectId;
      }
    }
  } catch (err) {
    Logger.warn('[AuthService] Could not read firebase-applet-config.json:', err);
  }
  throw new Error('إعدادات Firebase غير مكتملة على الخادم');
}

async function fetchGoogleSecureTokenCerts(forceRefresh = false): Promise<Record<string, string>> {
  const now = Date.now();
  if (!forceRefresh && googleCertsCache && now < googleCertsCache.expiresAt) {
    return googleCertsCache.certs;
  }

  const response = await fetch(GOOGLE_CERTS_URL);
  if (!response.ok) {
    throw new Error('تعذر جلب مفاتيح التحقق من Google');
  }

  const certs = (await response.json()) as Record<string, string>;
  const cacheControl = response.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const maxAgeMs = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) * 1000 : 3600 * 1000;

  googleCertsCache = {
    certs,
    expiresAt: now + Math.max(60 * 1000, maxAgeMs)
  };

  return certs;
}

function decodeBase64UrlJson<T = any>(segment: string): T {
  const jsonStr = Buffer.from(segment, 'base64url').toString('utf8');
  return JSON.parse(jsonStr) as T;
}

export interface VerifiedGoogleTokenPayload {
  uid: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture: string;
}

export async function verifyFirebaseGoogleIdToken(idToken: string): Promise<VerifiedGoogleTokenPayload> {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('رمز المصادقة الخاص بـ Google مفقود');
  }

  const segments = idToken.split('.');
  if (segments.length !== 3) {
    throw new Error('صيغة رمز التحقق من Google غير صالحة');
  }

  const [headerSeg, payloadSeg, sigSeg] = segments;
  let header: { alg?: string; kid?: string };
  let payload: any;

  try {
    header = decodeBase64UrlJson(headerSeg);
    payload = decodeBase64UrlJson(payloadSeg);
  } catch {
    throw new Error('تعذر قراءة بيانات التحقق من Google');
  }

  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('خوارزمية توقيع رمز التحقق من Google غير مدعومة');
  }

  let certs = await fetchGoogleSecureTokenCerts(false);
  let certPem = certs[header.kid];
  if (!certPem) {
    certs = await fetchGoogleSecureTokenCerts(true);
    certPem = certs[header.kid];
  }
  if (!certPem) {
    throw new Error('مفتاح توقيع Google غير معترف به');
  }

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${headerSeg}.${payloadSeg}`);
  verifier.end();

  const signatureBuffer = Buffer.from(sigSeg, 'base64url');
  const isSignatureValid = verifier.verify(certPem, signatureBuffer);
  if (!isSignatureValid) {
    throw new Error('توقيع رمز الدخول عبر Google غير صالح');
  }

  const projectId = getFirebaseProjectId();
  const expectedIssuer = `https://securetoken.google.com/${projectId}`;
  const nowSec = Math.floor(Date.now() / 1000);

  if (payload.aud !== projectId) {
    throw new Error('رمز الدخول عبر Google لا يخص هذا التطبيق');
  }
  if (payload.iss !== expectedIssuer) {
    throw new Error('جهة إصدار رمز الدخول عبر Google غير مطابقة');
  }
  if (typeof payload.sub !== 'string' || !payload.sub.trim() || payload.sub.length > 128) {
    throw new Error('معرف مستخدم Google غير صالح');
  }
  if (typeof payload.exp !== 'number' || payload.exp <= nowSec) {
    throw new Error('انتهت صلاحية جلسة Google، حاول مرة أخرى');
  }
  if (typeof payload.iat !== 'number' || payload.iat > nowSec + 300) {
    throw new Error('تاريخ إصدار رمز الدخول غير صالح');
  }
  if (typeof payload.auth_time === 'number' && payload.auth_time > nowSec + 300) {
    throw new Error('توقيت مصادقة Google غير صالح');
  }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const emailVerified = Boolean(payload.email_verified);
  if (!email || !emailVerified) {
    throw new Error('يجب أن يكون البريد الإلكتروني في حساب Google مُوثّقاً');
  }

  const provider = payload.firebase?.sign_in_provider;
  if (provider && provider !== 'google.com') {
    throw new Error('طريقة المصادقة المرسلة ليست حساب Google');
  }

  return {
    uid: payload.sub.trim(),
    email,
    emailVerified,
    name: typeof payload.name === 'string' && payload.name.trim()
      ? payload.name.trim()
      : email.split('@')[0],
    picture: typeof payload.picture === 'string' ? payload.picture.trim() : ''
  };
}

async function generateUniqueUsername(displayName?: string, email?: string): Promise<string> {
  const emailLocal = (email || '').split('@')[0] || '';
  const rawBase = (displayName || emailLocal || 'مستخدم وه')
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z0-9_\- ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  let base = rawBase.length >= 2 ? rawBase.slice(0, 22).trim() : '';
  if (base.length < 2) {
    const cleanEmail = emailLocal.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 20);
    base = cleanEmail.length >= 2 ? cleanEmail : 'عضو وه';
  }

  const checkFirst = validateUsername(base);
  const candidateBase = checkFirst.valid ? base : 'عضو وه';

  if (!(await findUserByUsername(candidateBase))) {
    return candidateBase;
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = Math.floor(100 + Math.random() * 9000).toString();
    const candidate = `${candidateBase.slice(0, 30 - suffix.length - 1)}_${suffix}`;
    if (validateUsername(candidate).valid && !(await findUserByUsername(candidate))) {
      return candidate;
    }
  }

  return `wah_${Date.now().toString().slice(-8)}`;
}

export async function authenticateWithGoogle(params: {
  idToken: string;
  mode?: 'login' | 'register';
  role?: 'buyer' | 'seller';
  phone?: string;
  governorate?: string;
  workshopName?: string;
  specialty?: string;
}): Promise<{ session: AuthSession; isNewUser: boolean }> {
  const verifiedGoogle = await verifyFirebaseGoogleIdToken(params.idToken);

  // 1. Lookup existing account by googleUid or verified email
  let existingUser = await findUserByGoogleUid(verifiedGoogle.uid);
  if (!existingUser) {
    existingUser = await findUserByEmail(verifiedGoogle.email);
  }

  if (existingUser) {
    if (existingUser.status === 'suspended' || existingUser.status === 'blocked') {
      throw new Error('تم تعليق هذا الحساب من قبل إدارة المنصة. يرجى التواصل مع الإدارة.');
    }

    const updates: Partial<UserDocument> = {};
    if (!existingUser.googleUid) {
      updates.googleUid = verifiedGoogle.uid;
    }
    const nextAuthProvider: 'local' | 'google' | 'hybrid' = existingUser.passwordHash
      ? 'hybrid'
      : 'google';
    if (existingUser.authProvider !== nextAuthProvider) {
      updates.authProvider = nextAuthProvider;
    }
    if (
      verifiedGoogle.picture &&
      (!existingUser.avatar || existingUser.avatar === DEFAULT_USER_AVATAR) &&
      !existingUser.profileImage?.secureUrl
    ) {
      updates.avatar = verifiedGoogle.picture;
    }

    if (Object.keys(updates).length > 0) {
      const updated = await updateUser(existingUser.id, updates);
      if (updated) {
        existingUser = updated;
      }
    }

    // Resolve latest seller status if seller
    let sellerStatus: SellerStatus | undefined = existingUser.sellerStatus;
    if (existingUser.role === 'seller' || existingUser.sellerId) {
      const { db, isMongo } = await getDatabase();
      const sellerId = existingUser.sellerId || existingUser.id;
      let sellerDoc: any = null;
      if (isMongo && db) {
        try {
          sellerDoc = await db.collection('sellers').findOne({
            $or: [{ id: sellerId }, { userId: existingUser.id }]
          });
        } catch (e) {
          Logger.error('[AuthService] Error fetching seller status during Google auth:', e);
        }
      }
      if (!sellerDoc) {
        sellerDoc = memoryDb.sellers.find(
          (s) => s.id === sellerId || (s as any).userId === existingUser!.id
        );
      }
      if (sellerDoc?.status) {
        sellerStatus = sellerDoc.status;
      }
    }

    const userWithStatus: UserDocument = {
      ...existingUser,
      sellerStatus
    };

    await createAuditLog({
      userName: existingUser.name,
      userRole: existingUser.role,
      action: 'تسجيل دخول عبر Google',
      resource: 'users',
      resourceId: existingUser.id,
      status: 'نجاح',
      details: `تم تسجيل دخول المستخدم (${existingUser.username || existingUser.name}) باستخدام حساب Google`
    });

    const token = generateToken(userWithStatus);
    return {
      isNewUser: false,
      session: {
        token,
        user: {
          id: existingUser.id,
          username: existingUser.username || existingUser.name,
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone || '',
          role: existingUser.role,
          avatar: existingUser.avatar,
          status: existingUser.status || 'active',
          mustChangePassword: Boolean(existingUser.mustChangePassword),
          hasPassword: Boolean(existingUser.passwordHash),
          authProvider: existingUser.authProvider || (existingUser.passwordHash ? 'hybrid' : 'google'),
          profileImage: existingUser.profileImage || null,
          governorate: existingUser.governorate,
          sellerId: existingUser.sellerId,
          sellerStatus: userWithStatus.sellerStatus,
          savedAddresses: existingUser.savedAddresses || []
        }
      }
    };
  }

  // 2. New User Creation via Google
  const requestedRole: 'buyer' | 'seller' = params.role === 'seller' ? 'seller' : 'buyer';
  const cleanPhone = (params.phone || '').trim();
  const cleanWorkshop = (params.workshopName || '').trim();
  const cleanGovernorate = (params.governorate || '').trim() || 'قنا';

  if (requestedRole === 'seller') {
    if (cleanWorkshop.length < 2 || cleanPhone.length < 8) {
      const err: any = new Error('للتسجيل كبائع عبر Google، يرجى إكمال اسم الورشة ورقم الموبايل أولاً.');
      err.code = 'SELLER_DETAILS_REQUIRED';
      err.googleProfile = {
        name: verifiedGoogle.name,
        email: verifiedGoogle.email,
        picture: verifiedGoogle.picture
      };
      throw err;
    }
  }

  const generatedUsername = await generateUniqueUsername(verifiedGoogle.name, verifiedGoogle.email);
  const userId = `user-${requestedRole}-${Date.now()}`;
  const finalAvatar = verifiedGoogle.picture || DEFAULT_USER_AVATAR;
  let sellerId: string | undefined = undefined;

  if (requestedRole === 'seller') {
    sellerId = `seller-${Date.now()}`;
    const { db, isMongo } = await getDatabase();
    const newSeller = {
      id: sellerId,
      userId,
      name: verifiedGoogle.name,
      brandName: cleanWorkshop,
      governorate: cleanGovernorate,
      rating: 5.0,
      salesCount: 0,
      productsCount: 0,
      badge: 'صنايعي جديد',
      avatar: finalAvatar,
      coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
      bio: `ورشة متخصصة في عمل المشغولات الصعيدية والتراثية على أصولها في محافظة ${cleanGovernorate}.`,
      story: `بدأنا بصنعة أجدادنا وورثناها جيل ورا جيل عشان نوصلكم أحسن ما طلعت إيدين الصعايدة.`,
      verified: false,
      joinedDate: new Date().toISOString().split('T')[0],
      phone: cleanPhone,
      email: verifiedGoogle.email,
      payoutMethod: 'vodafone_cash',
      payoutAccount: cleanPhone,
      status: 'pending' as SellerStatus,
      specialty: params.specialty?.trim() || 'مشغولات وحرف صعيدية على أصولها'
    };

    if (isMongo && db) {
      await db.collection('sellers').insertOne(newSeller as any);
    } else {
      throw new Error('قاعدة البيانات غير متوفرة حالياً، تعذر تسجيل حساب البائع.');
    }
  }

  const createdUser = await createUser({
    id: userId,
    username: generatedUsername,
    name: verifiedGoogle.name,
    email: verifiedGoogle.email,
    passwordHash: '',
    googleUid: verifiedGoogle.uid,
    authProvider: 'google',
    phone: cleanPhone,
    role: 'buyer',
    avatar: finalAvatar,
    profileImage: null,
    governorate: cleanGovernorate,
    sellerId,
    sellerStatus: requestedRole === 'seller' ? 'pending' : undefined,
    savedAddresses: []
  });

  await createAuditLog({
    userName: createdUser.name,
    userRole: createdUser.role,
    action: 'تسجيل مستخدم جديد عبر Google',
    resource: 'users',
    resourceId: createdUser.id,
    status: 'نجاح',
    details: `تم إنشاء حساب جديد عبر Google باسم مستخدم: (${createdUser.username}) وصلاحية (${requestedRole})`
  });

  if (requestedRole === 'seller') {
    await notifyAdminsOnSellerRequest({
      userId,
      userName: verifiedGoogle.name,
      workshopName: cleanWorkshop,
      governorate: cleanGovernorate,
      isReapply: false
    });
  }

  const token = generateToken(createdUser);
  return {
    isNewUser: true,
    session: {
      token,
      user: {
        id: createdUser.id,
        username: createdUser.username,
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone,
        role: createdUser.role,
        avatar: createdUser.avatar,
        hasPassword: false,
        authProvider: 'google',
        profileImage: null,
        governorate: createdUser.governorate,
        sellerId: createdUser.sellerId,
        sellerStatus: createdUser.sellerStatus,
        savedAddresses: createdUser.savedAddresses
      }
    }
  };
}

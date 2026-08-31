import bcrypt from 'bcryptjs';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { UserDocument, UserRole, UserAddress, SellerStatus } from '../models/types.ts';
import { Logger } from '../utils/logger.ts';
import { storageService } from './storage/storageProvider.ts';
import { createAuditLog } from './auditService.ts';
import type { AuthenticatedUser } from '../middleware/auth.ts';

/**
 * Extract Cloudinary public_id from Cloudinary URL or namespace key
 * Example: https://res.cloudinary.com/.../Elsa3ed-Market/products/prod-1/image.png -> Elsa3ed-Market/products/prod-1/image
 */
export function extractCloudinaryPublicId(urlOrId: string): string | null {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  if (urlOrId.startsWith('Elsa3ed-Market/')) {
    return urlOrId.replace(/\.[a-zA-Z0-9]+$/, '');
  }
  const match = urlOrId.match(/(Elsa3ed-Market\/[^\.\?#]+)/);
  return match ? match[1] : null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalizes username for consistent searching and uniqueness checks:
 * - Trims whitespace at both ends
 * - Applies Unicode Normalization Form KC (NFKC)
 * - Converts Latin characters to lowercase (case-insensitive for English)
 * - Leaves Arabic characters completely untouched without transliteration
 * - Collapses consecutive spaces into a single space
 */
export function normalizeUsername(username: string): string {
  if (!username || typeof username !== 'string') return '';
  return username
    .trim()
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Validates username:
 * - Length between 2 and 30 characters
 * - Supports Arabic Unicode letters (\u0600-\u06FF, \u0750-\u077F, \u08A0-\u08FF)
 * - Supports Latin letters (a-z, A-Z)
 * - Supports digits (0-9, Arabic-Indic digits \u0660-\u0669)
 * - Supports underscores, hyphens, and single spaces
 */
export function validateUsername(username: string): { valid: boolean; message?: string } {
  if (!username || typeof username !== 'string' || !username.trim()) {
    return { valid: false, message: 'من فضلك اكتب اسم المستخدم' };
  }
  const trimmed = username.trim();
  if (trimmed.length < 2) {
    return { valid: false, message: 'اسم المستخدم قصير جداً (حرفان على الأقل)' };
  }
  if (trimmed.length > 30) {
    return { valid: false, message: 'اسم المستخدم يجب ألا يتجاوز 30 حرفاً' };
  }

  const validRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z0-9_\- ]+$/;
  if (!validRegex.test(trimmed)) {
    return { valid: false, message: 'اسم المستخدم غير صالح. يمكن استخدام الحروف العربية أو الإنجليزية والأرقام فقط' };
  }

  return { valid: true };
}

export async function findUserByUsername(username: string): Promise<UserDocument | null> {
  const norm = normalizeUsername(username);
  if (!norm) return null;

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const user = await db.collection('users').findOne({
        $or: [
          { usernameNormalized: norm },
          { username: { $regex: new RegExp(`^${escapeRegex(norm)}$`, 'i') } }
        ]
      });
      return user as unknown as UserDocument | null;
    } catch (e) {
      Logger.error('[UserService] Error querying user by username in MongoDB:', e);
    }
  }

  const memUser = memoryDb.users.find(
    (u) => (u.username && normalizeUsername(u.username) === norm) || (u as any).usernameNormalized === norm
  );
  return (memUser as unknown as UserDocument) || null;
}

export async function findUserByIdentifier(identifier: string): Promise<UserDocument | null> {
  if (!identifier || typeof identifier !== 'string') return null;
  const trimmed = identifier.trim();

  // 1. Primary lookup by username
  const userByUsername = await findUserByUsername(trimmed);
  if (userByUsername) return userByUsername;

  // 2. Secondary fallback lookup by email if identifier contains '@'
  if (trimmed.includes('@')) {
    return findUserByEmail(trimmed);
  }

  return null;
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const { db, isMongo } = await getDatabase();

  if (isMongo && db) {
    try {
      const user = await db.collection('users').findOne({
        email: { $regex: new RegExp(`^${escapeRegex(normalizedEmail)}$`, 'i') }
      });
      return user as unknown as UserDocument | null;
    } catch (e) {
      Logger.error('[UserService] Error querying user by email in MongoDB:', e);
    }
  }

  // Memory fallback
  const memUser = memoryDb.users.find(
    (u) => u.email && u.email.toLowerCase() === normalizedEmail
  );
  return (memUser as unknown as UserDocument) || null;
}

export async function findUserById(id: string): Promise<UserDocument | null> {
  const { db, isMongo } = await getDatabase();

  if (isMongo && db) {
    try {
      const user = await db.collection('users').findOne({ id });
      if (user) {
        return user as unknown as UserDocument;
      }
    } catch (e) {
      Logger.error('[UserService] Error querying user by ID in MongoDB:', e);
    }
  }

  const memUser = memoryDb.users.find((u) => u.id === id);
  if (memUser) {
    return memUser as unknown as UserDocument;
  }

  return null;
}

export const DEFAULT_USER_AVATAR = 'https://res.cloudinary.com/kuana1nl/image/upload/v1787924812/user.jpg';

export async function createUser(userData: {
  id?: string;
  username: string;
  name: string;
  email?: string;
  passwordHash?: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  status?: 'active' | 'suspended' | 'blocked';
  profileImage?: {
    secureUrl: string;
    publicId: string;
  } | null;
  governorate?: string;
  sellerId?: string;
  sellerStatus?: import('../models/types.ts').SellerStatus;
  savedAddresses?: UserAddress[];
}): Promise<UserDocument> {
  const now = new Date().toISOString();
  const id = userData.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const trimmedUsername = userData.username.trim();
  const usernameNormalized = normalizeUsername(trimmedUsername);

  const newUser: UserDocument = {
    id,
    username: trimmedUsername,
    usernameNormalized,
    name: userData.name.trim(),
    passwordHash: userData.passwordHash,
    phone: userData.phone.trim(),
    role: userData.role || 'buyer',
    avatar: userData.avatar?.trim() ? userData.avatar.trim() : DEFAULT_USER_AVATAR,
    status: userData.status || 'active',
    profileImage: userData.profileImage || null,
    governorate: userData.governorate || 'قنا',
    sellerId: userData.sellerId,
    sellerStatus: userData.sellerStatus || (userData.role === 'seller' ? 'pending' : undefined),
    savedAddresses: userData.savedAddresses || [],
    createdAt: now,
    updatedAt: now
  };

  if (userData.email?.trim()) {
    newUser.email = userData.email.trim().toLowerCase();
  }

  const { db, isMongo } = await getDatabase();

  if (isMongo && db) {
    try {
      await db.collection('users').insertOne(newUser as any);
      Logger.info(`[UserService] Created user in MongoDB: ${newUser.id} (@${newUser.username})`);
    } catch (e) {
      Logger.error('[UserService] Error creating user in MongoDB:', e);
      throw e;
    }
  }

  // Also sync in memory
  const existingIdx = memoryDb.users.findIndex((u) => u.id === newUser.id);
  if (existingIdx >= 0) {
    memoryDb.users[existingIdx] = newUser as any;
  } else {
    memoryDb.users.push(newUser as any);
  }

  return newUser;
}

export async function updateUser(
  userId: string,
  updates: Partial<Omit<UserDocument, 'id' | 'createdAt'>>
): Promise<UserDocument | null> {
  const now = new Date().toISOString();
  const { db, isMongo } = await getDatabase();
  let updatedUser: UserDocument | null = null;

  if (isMongo && db) {
    try {
      const res = await db.collection('users').findOneAndUpdate(
        { id: userId },
        { $set: { ...updates, updatedAt: now } },
        { returnDocument: 'after' }
      );
      if (res) {
        updatedUser = res as unknown as UserDocument;
      }
    } catch (e) {
      Logger.error('[UserService] Error updating user in MongoDB:', e);
    }
  }

  const memIdx = memoryDb.users.findIndex((u) => u.id === userId);
  if (memIdx >= 0) {
    memoryDb.users[memIdx] = {
      ...memoryDb.users[memIdx],
      ...updates,
      updatedAt: now
    } as any;
    if (!updatedUser) {
      updatedUser = memoryDb.users[memIdx] as unknown as UserDocument;
    }
  }

  return updatedUser;
}

export async function getAllUsers(): Promise<UserDocument[]> {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const users = await db.collection('users').find().toArray();
      return users as unknown as UserDocument[];
    } catch (e) {
      Logger.error('[UserService] Error fetching users from MongoDB:', e);
    }
  }
  return memoryDb.users as unknown as UserDocument[];
}

/**
 * Filter and search users for Admin Dashboard with sensitive fields excluded
 */
export async function getUsersWithFilters(filters: {
  search?: string;
  role?: string;
  status?: string;
  governorate?: string;
}): Promise<Omit<UserDocument, 'passwordHash'>[]> {
  const { db, isMongo } = await getDatabase();
  const conditions: any[] = [];

  if (filters.role && filters.role !== 'all') {
    conditions.push({ role: filters.role });
  }
  if (filters.governorate && filters.governorate !== 'all') {
    conditions.push({ governorate: filters.governorate });
  }
  if (filters.status && filters.status !== 'all') {
    if (filters.status === 'active') {
      conditions.push({ $or: [{ status: 'active' }, { status: { $exists: false } }, { status: null }] });
    } else {
      conditions.push({ status: filters.status });
    }
  }
  if (filters.search && filters.search.trim()) {
    const term = filters.search.trim();
    conditions.push({
      $or: [
        { name: { $regex: term, $options: 'i' } },
        { username: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { phone: { $regex: term, $options: 'i' } }
      ]
    });
  }

  const query = conditions.length > 0 ? { $and: conditions } : {};

  let users: any[] = [];
  if (isMongo && db) {
    try {
      users = await db
        .collection('users')
        .find(query, { projection: { passwordHash: 0 } })
        .sort({ createdAt: -1 })
        .toArray();
      return users;
    } catch (e) {
      Logger.error('[UserService] Error querying users with filters from MongoDB:', e);
    }
  }

  // Memory fallback
  users = memoryDb.users.filter((u) => {
    if (filters.role && filters.role !== 'all' && u.role !== filters.role) return false;
    if (filters.governorate && filters.governorate !== 'all' && u.governorate !== filters.governorate) return false;
    if (filters.status && filters.status !== 'all') {
      const userStatus = u.status || 'active';
      if (userStatus !== filters.status) return false;
    }
    if (filters.search && filters.search.trim()) {
      const term = filters.search.trim().toLowerCase();
      return (
        u.name.toLowerCase().includes(term) ||
        (u.username ? u.username.toLowerCase().includes(term) : false) ||
        (u.email ? u.email.toLowerCase().includes(term) : false) ||
        u.phone.includes(term)
      );
    }
    return true;
  });

  return users.map((u: any) => {
    const { passwordHash, ...safeUser } = u;
    return safeUser;
  });
}

/**
 * Fetch detailed user profile for Admin (never leaks passwords or auth secrets)
 */
export async function getUserDetailsForAdmin(userId: string): Promise<any | null> {
  const { db, isMongo } = await getDatabase();
  let user: any = null;
  let sellerInfo: any = null;
  let stats: any = { ordersCount: 0, productsCount: 0, reviewsCount: 0 };

  if (isMongo && db) {
    try {
      user = await db.collection('users').findOne({ id: userId }, { projection: { passwordHash: 0 } });
      if (user) {
        if (user.role === 'seller') {
          sellerInfo = await db.collection('sellers').findOne({
            $or: [{ id: user.sellerId }, { userId: user.id }]
          });
          const sellerId = sellerInfo?.id || user.sellerId || user.id;
          stats.productsCount = await db.collection('products').countDocuments({ sellerId });
          stats.ordersCount = await db.collection('orders').countDocuments({
            $or: [{ sellerIds: sellerId }, { 'items.sellerId': sellerId }]
          });
        } else if (user.role === 'buyer') {
          stats.ordersCount = await db.collection('orders').countDocuments({ buyerId: user.id });
          stats.reviewsCount = await db.collection('reviews').countDocuments({ userId: user.id });
        }
      }
    } catch (e) {
      Logger.error('[UserService] Error querying user details in MongoDB:', e);
    }
  }

  if (!user) {
    const memUser = memoryDb.users.find((u) => u.id === userId);
    if (memUser) {
      const { passwordHash, ...safeUser } = memUser as any;
      user = safeUser;
      if (user.role === 'seller') {
        sellerInfo = memoryDb.sellers.find((s: any) => s.userId === user.id || s.id === user.sellerId);
      }
    }
  }

  if (!user) return null;
  return { ...user, seller: sellerInfo, stats };
}

export interface DeleteUserResult {
  userId: string;
  role: UserRole;
  name: string;
  email: string;
  deletedProfileImage: boolean;
  deletedProductsCount: number;
  deletedProductImagesCount: number;
  deletedSellerRecord: boolean;
  deletedCart: boolean;
  deletedFavoritesCount: number;
  anonymizedOrdersCount: number;
  deletedNotificationsCount: number;
}

/**
 * Safe Administrative Deletion of a User Account
 * - Enforces admin authorization and prevents self-deletion
 * - Cleans up Cloudinary assets belonging to the user and their products
 * - Preserves business and financial history (Orders) by anonymizing customer references
 * - Logs the destructive action in audit_logs
 */
export async function deleteUserCascade(
  adminUser: AuthenticatedUser,
  targetUserId: string
): Promise<DeleteUserResult> {
  // 1. Authorization and Self-Deletion Protection
  if (!adminUser || adminUser.role !== 'admin') {
    throw new Error('غير مصرح. هذه العملية تتطلب صلاحيات مدير المنصة فقط');
  }

  if (adminUser.id === targetUserId) {
    throw new Error('لا يمكن لمدير المنصة حذف حسابه الشخصي');
  }

  const { db, isMongo } = await getDatabase();

  // Find target user
  let targetUser: any = null;
  if (isMongo && db) {
    targetUser = await db.collection('users').findOne({ id: targetUserId });
  } else {
    targetUser = memoryDb.users.find((u) => u.id === targetUserId);
  }

  if (!targetUser) {
    throw new Error('المستخدم المطلوب غير موجود');
  }

  const result: DeleteUserResult = {
    userId: targetUserId,
    role: targetUser.role,
    name: targetUser.name,
    email: targetUser.email,
    deletedProfileImage: false,
    deletedProductsCount: 0,
    deletedProductImagesCount: 0,
    deletedSellerRecord: false,
    deletedCart: false,
    deletedFavoritesCount: 0,
    anonymizedOrdersCount: 0,
    deletedNotificationsCount: 0
  };

  // 2. Profile Image Cleanup from Cloudinary
  if (targetUser.profileImage?.publicId) {
    try {
      const deleted = await storageService.delete(targetUser.profileImage.publicId, {
        id: adminUser.id,
        role: 'admin'
      });
      result.deletedProfileImage = deleted;
    } catch (err) {
      Logger.warn('[UserService] Cloudinary profile image deletion error:', err);
    }
  }

  // 3. Handle Seller-Specific Cleanup
  if (targetUser.role === 'seller') {
    let sellerDoc: any = null;
    if (isMongo && db) {
      sellerDoc = await db.collection('sellers').findOne({
        $or: [{ id: targetUser.sellerId }, { userId: targetUserId }]
      });
    } else {
      sellerDoc = memoryDb.sellers.find(
        (s: any) => s.userId === targetUserId || s.id === targetUser.sellerId
      );
    }

    const sellerId = sellerDoc?.id || targetUser.sellerId;

    if (sellerId) {
      // Find all products owned by this seller
      let sellerProducts: any[] = [];
      if (isMongo && db) {
        sellerProducts = await db.collection('products').find({ sellerId }).toArray();
      } else {
        sellerProducts = memoryDb.products.filter((p) => p.sellerId === sellerId);
      }

      result.deletedProductsCount = sellerProducts.length;

      // Clean up Cloudinary images belonging strictly to this seller's products
      for (const prod of sellerProducts) {
        if (Array.isArray(prod.images)) {
          for (const imgUrl of prod.images) {
            const publicId = extractCloudinaryPublicId(imgUrl);
            if (publicId && publicId.startsWith('Elsa3ed-Market/products/')) {
              try {
                await storageService.delete(publicId, { id: adminUser.id, role: 'admin' });
                result.deletedProductImagesCount++;
              } catch (err) {
                Logger.warn(`[UserService] Failed deleting product image ${publicId}:`, err);
              }
            }
          }
        }
      }

      // Delete products from MongoDB
      if (isMongo && db) {
        await db.collection('products').deleteMany({ sellerId });
        await db.collection('stock_movements').deleteMany({ sellerId });
        await db.collection('sellers').deleteOne({ id: sellerId });
      }

      // Sync memory
      memoryDb.products = memoryDb.products.filter((p) => p.sellerId !== sellerId);
      memoryDb.sellers = memoryDb.sellers.filter((s: any) => s.id !== sellerId && s.userId !== targetUserId);
      result.deletedSellerRecord = true;
    }
  }

  // 4. Handle Buyer-Specific Cleanup & Order Preservation
  if (targetUser.role === 'buyer') {
    if (isMongo && db) {
      const cartDel = await db.collection('carts').deleteMany({ buyerId: targetUserId });
      result.deletedCart = cartDel.deletedCount > 0;

      const favDel = await db.collection('favorites').deleteMany({ buyerId: targetUserId });
      result.deletedFavoritesCount = favDel.deletedCount;

      // Anonymize orders without destroying legal and seller business records
      const orderUpdate = await db.collection('orders').updateMany(
        { buyerId: targetUserId },
        {
          $set: {
            buyerName: 'مستخدم محذوف',
            buyerPhone: '---',
            buyerEmail: 'deleted@user.local',
            'shippingAddress.fullName': 'مستخدم محذوف',
            'shippingAddress.phone': '---',
            'shippingAddress.streetAddress': 'محذوف لحماية الخصوصية'
          }
        }
      );
      result.anonymizedOrdersCount = orderUpdate.modifiedCount;
    }

    memoryDb.carts = memoryDb.carts.filter((c) => c.buyerId !== targetUserId);
  }

  // 5. Common Cleanup (Notifications & Reviews)
  if (isMongo && db) {
    const notifDel = await db.collection('notifications').deleteMany({ userId: targetUserId });
    result.deletedNotificationsCount = notifDel.deletedCount;

    // Anonymize reviews
    await db.collection('reviews').updateMany(
      { userId: targetUserId },
      { $set: { userName: 'مستخدم محذوف' } }
    );

    // Delete user from users collection
    await db.collection('users').deleteOne({ id: targetUserId });
  }

  // Sync memory store
  memoryDb.users = memoryDb.users.filter((u) => u.id !== targetUserId);

  // 6. Audit Trail Logging
  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'DELETE_USER',
    resource: 'مستخدم',
    resourceId: targetUserId,
    status: 'نجاح',
    details: `قام مدير المنصة بحذف حساب (${targetUser.role}) "${targetUser.name}" [${targetUser.email}] وتنظيف كافة أصوله وكتالوجه السحابي وتجهيل سجلات طلباته`,
    metadata: {
      deletedUserId: targetUserId,
      deletedUserRole: targetUser.role,
      deletedProductsCount: result.deletedProductsCount,
      deletedProductImagesCount: result.deletedProductImagesCount,
      anonymizedOrdersCount: result.anonymizedOrdersCount
    }
  });

  return result;
}

/**
 * Admin Update User (name, username, email, phone, role, status, governorate, etc.)
 */
export async function updateUserByAdmin(
  adminUser: AuthenticatedUser,
  targetUserId: string,
  updates: {
    name?: string;
    username?: string;
    email?: string;
    phone?: string;
    role?: UserRole;
    status?: 'active' | 'suspended' | 'blocked';
    governorate?: string;
    workshopName?: string;
    specialty?: string;
  }
): Promise<Omit<UserDocument, 'passwordHash'>> {
  if (!adminUser || adminUser.role !== 'admin') {
    throw new Error('غير مصرح. هذه العملية تتطلب صلاحيات مدير المنصة');
  }

  const { db, isMongo } = await getDatabase();
  let existingUser: any = null;

  if (isMongo && db) {
    existingUser = await db.collection('users').findOne({ id: targetUserId });
  } else {
    existingUser = memoryDb.users.find((u) => u.id === targetUserId);
  }

  if (!existingUser) {
    throw new Error('المستخدم المطلوب غير موجود');
  }

  // Protection against self role demotion or self suspension
  if (adminUser.id === targetUserId) {
    if (updates.role && updates.role !== 'admin') {
      throw new Error('لا يمكنك تجريد حسابك الشخصي من صلاحية مدير المنصة');
    }
    if (updates.status && updates.status !== 'active') {
      throw new Error('لا يمكنك تعليق أو تجميد حسابك الشخصي');
    }
  }

  const userUpdates: Partial<UserDocument> = {
    updatedAt: new Date().toISOString()
  };

  if (updates.name && updates.name.trim()) {
    userUpdates.name = updates.name.trim();
  }

  if (updates.phone && updates.phone.trim()) {
    userUpdates.phone = updates.phone.trim();
  }

  if (updates.governorate && updates.governorate.trim()) {
    userUpdates.governorate = updates.governorate.trim();
  }

  if (updates.status) {
    userUpdates.status = updates.status;
  }

  if (updates.username && updates.username.trim() && updates.username.trim() !== existingUser.username) {
    const trimmed = updates.username.trim();
    const check = validateUsername(trimmed);
    if (!check.valid) {
      throw new Error(check.message || 'اسم المستخدم الجديد غير صالح');
    }
    const normalized = normalizeUsername(trimmed);
    const existingWithSame = await findUserByUsername(trimmed);
    if (existingWithSame && existingWithSame.id !== targetUserId) {
      throw new Error('اسم المستخدم هذا مستخدم بالفعل من قبل حساب آخر');
    }
    userUpdates.username = trimmed;
    userUpdates.usernameNormalized = normalized;
  }

  if (updates.email !== undefined) {
    const trimmedEmail = updates.email.trim().toLowerCase();
    if (trimmedEmail && trimmedEmail !== existingUser.email) {
      const existingWithEmail = await findUserByEmail(trimmedEmail);
      if (existingWithEmail && existingWithEmail.id !== targetUserId) {
        throw new Error('البريد الإلكتروني مستخدم بالفعل من قبل حساب آخر');
      }
      userUpdates.email = trimmedEmail;
    } else if (!trimmedEmail) {
      userUpdates.email = undefined;
    }
  }

  // Handle role change
  if (updates.role && updates.role !== existingUser.role) {
    userUpdates.role = updates.role;
    if (updates.role === 'seller') {
      let sellerDoc: any = null;
      if (isMongo && db) {
        sellerDoc = await db.collection('sellers').findOne({
          $or: [{ id: existingUser.sellerId }, { userId: targetUserId }]
        });
      } else {
        sellerDoc = memoryDb.sellers.find(
          (s: any) => s.userId === targetUserId || s.id === existingUser.sellerId
        );
      }

      if (!sellerDoc) {
        const sellerId = `seller-${Date.now()}`;
        const newSeller = {
          id: sellerId,
          userId: targetUserId,
          name: updates.name?.trim() || existingUser.name,
          brandName: updates.workshopName?.trim() || `ورشة ${updates.name?.trim() || existingUser.name}`,
          governorate: updates.governorate?.trim() || existingUser.governorate || 'قنا',
          rating: 5.0,
          salesCount: 0,
          productsCount: 0,
          badge: 'حرفي معتمد',
          avatar: existingUser.avatar || DEFAULT_USER_AVATAR,
          coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
          bio: `ورشة متخصصة في صناعة المشغولات الصعيدية الأصيلة.`,
          story: `بدأنا بحرفة الأجداد وتوارثناها لنقدم أجود تراث الصعيد.`,
          verified: true,
          joinedDate: new Date().toISOString().split('T')[0],
          phone: updates.phone?.trim() || existingUser.phone,
          email: updates.email?.trim() || existingUser.email || '',
          payoutMethod: 'vodafone_cash',
          payoutAccount: updates.phone?.trim() || existingUser.phone,
          status: 'approved' as SellerStatus,
          specialty: updates.specialty?.trim() || 'مشغولات وحرف تراثية'
        };

        if (isMongo && db) {
          await db.collection('sellers').insertOne(newSeller as any);
        } else {
          memoryDb.sellers.push(newSeller as any);
        }
        userUpdates.sellerId = sellerId;
        userUpdates.sellerStatus = 'approved';
      } else {
        userUpdates.sellerId = sellerDoc.id;
        userUpdates.sellerStatus = sellerDoc.status;
      }
    }
  }

  // Update in MongoDB
  let updatedDoc: any = null;
  if (isMongo && db) {
    const res = await db.collection('users').findOneAndUpdate(
      { id: targetUserId },
      { $set: userUpdates },
      { returnDocument: 'after', projection: { passwordHash: 0 } }
    );
    updatedDoc = res;
  }

  // Sync memoryDb
  const memIdx = memoryDb.users.findIndex((u) => u.id === targetUserId);
  if (memIdx >= 0) {
    memoryDb.users[memIdx] = { ...memoryDb.users[memIdx], ...userUpdates } as any;
    if (!updatedDoc) {
      const { passwordHash, ...safe } = memoryDb.users[memIdx] as any;
      updatedDoc = safe;
    }
  }

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'UPDATE_USER',
    resource: 'مستخدم',
    resourceId: targetUserId,
    status: 'نجاح',
    details: `تم تحديث بيانات حساب (${existingUser.name} - @${existingUser.username}) بواسطة المدير (${adminUser.name})`
  });

  return updatedDoc;
}

/**
 * Admin Toggle User Status (active <-> suspended)
 */
export async function toggleUserStatusByAdmin(
  adminUser: AuthenticatedUser,
  targetUserId: string,
  status: 'active' | 'suspended' | 'blocked'
): Promise<Omit<UserDocument, 'passwordHash'>> {
  return updateUserByAdmin(adminUser, targetUserId, { status });
}

/**
 * Admin Reset User Password
 */
export async function resetUserPasswordByAdmin(
  adminUser: AuthenticatedUser,
  targetUserId: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  if (!adminUser || adminUser.role !== 'admin') {
    throw new Error('غير مصرح. هذه العملية تتطلب صلاحيات مدير المنصة');
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    throw new Error('كلمة المرور الجديدة يجب ألا تقل عن 6 خانات');
  }

  const { db, isMongo } = await getDatabase();
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const now = new Date().toISOString();

  let targetUser: any = null;
  if (isMongo && db) {
    targetUser = await db.collection('users').findOne({ id: targetUserId });
    if (!targetUser) throw new Error('المستخدم المطلوب غير موجود');
    await db.collection('users').updateOne(
      { id: targetUserId },
      { $set: { passwordHash, updatedAt: now } }
    );
  } else {
    targetUser = memoryDb.users.find((u) => u.id === targetUserId);
    if (!targetUser) throw new Error('المستخدم المطلوب غير موجود');
    targetUser.passwordHash = passwordHash;
    targetUser.updatedAt = now;
  }

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'RESET_PASSWORD',
    resource: 'مستخدم',
    resourceId: targetUserId,
    status: 'نجاح',
    details: `تم إعادة تعيين كلمة المرور للمستخدم (${targetUser.name} - @${targetUser.username}) بواسطة المدير (${adminUser.name})`
  });

  return {
    success: true,
    message: `تم إعادة تعيين كلمة المرور للمستخدم (${targetUser.name}) بنجاح`
  };
}

/**
 * Admin Create New User Directly
 */
export async function adminCreateNewUser(
  adminUser: AuthenticatedUser,
  data: {
    username: string;
    name: string;
    password: string;
    phone: string;
    email?: string;
    role: UserRole;
    governorate?: string;
    workshopName?: string;
    specialty?: string;
    avatar?: string;
  }
): Promise<Omit<UserDocument, 'passwordHash'>> {
  if (!adminUser || adminUser.role !== 'admin') {
    throw new Error('غير مصرح. هذه العملية تتطلب صلاحيات مدير المنصة');
  }

  if (!data.username || !data.username.trim()) {
    throw new Error('اسم المستخدم مطلوب');
  }
  const check = validateUsername(data.username.trim());
  if (!check.valid) {
    throw new Error(check.message || 'اسم المستخدم غير صالح');
  }
  const existingUsername = await findUserByUsername(data.username.trim());
  if (existingUsername) {
    throw new Error('اسم المستخدم مستخدم بالفعل');
  }

  if (!data.name || data.name.trim().length < 2) {
    throw new Error('الاسم الكامل مطلوب');
  }

  if (!data.password || data.password.length < 6) {
    throw new Error('كلمة المرور يجب ألا تقل عن 6 خانات');
  }

  if (!data.phone || data.phone.trim().length < 8) {
    throw new Error('رقم الهاتف غير صالح');
  }

  if (data.email?.trim()) {
    const existingEmail = await findUserByEmail(data.email.trim());
    if (existingEmail) {
      throw new Error('البريد الإلكتروني مسجل بالفعل لمستخدم آخر');
    }
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const userId = `user-${data.role}-${Date.now()}`;
  let sellerId: string | undefined = undefined;

  const finalAvatar = data.avatar?.trim() || DEFAULT_USER_AVATAR;

  if (data.role === 'seller') {
    sellerId = `seller-${Date.now()}`;
    const { db, isMongo } = await getDatabase();
    const newSeller = {
      id: sellerId,
      userId,
      name: data.name.trim(),
      brandName: data.workshopName?.trim() || `ورشة ${data.name.trim()}`,
      governorate: data.governorate || 'قنا',
      rating: 5.0,
      salesCount: 0,
      productsCount: 0,
      badge: 'حرفي معتمد',
      avatar: finalAvatar,
      coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
      bio: `ورشة حرفية معتمدة على منصة سوق الصعيد.`,
      story: `حرف يدوية وتراثية أصيلة من قلب الصعيد.`,
      verified: true,
      joinedDate: new Date().toISOString().split('T')[0],
      phone: data.phone.trim(),
      email: data.email?.trim() || '',
      payoutMethod: 'vodafone_cash',
      payoutAccount: data.phone.trim(),
      status: 'approved' as SellerStatus,
      specialty: data.specialty?.trim() || 'مشغولات وحرف تراثية'
    };

    if (isMongo && db) {
      await db.collection('sellers').insertOne(newSeller as any);
    } else {
      memoryDb.sellers.push(newSeller as any);
    }
  }

  const createdUser = await createUser({
    id: userId,
    username: data.username.trim(),
    name: data.name.trim(),
    email: data.email?.trim() ? data.email.trim().toLowerCase() : undefined,
    passwordHash,
    phone: data.phone.trim(),
    role: data.role,
    avatar: finalAvatar,
    governorate: data.governorate || 'قنا',
    sellerId,
    sellerStatus: data.role === 'seller' ? 'approved' : undefined,
    savedAddresses: []
  });

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'CREATE_USER_BY_ADMIN',
    resource: 'مستخدم',
    resourceId: createdUser.id,
    status: 'نجاح',
    details: `تم إنشاء حساب جديد (${createdUser.name} - @${createdUser.username}) بصلاحية (${createdUser.role}) بواسطة المدير (${adminUser.name})`
  });

  const { passwordHash: _, ...safeUser } = createdUser;
  return safeUser;
}

/**
 * Change user personal password (e.g. after logging in with temporary password)
 */
export async function changeUserPersonalPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  if (!userId || typeof userId !== 'string') {
    throw new Error('معرف المستخدم غير صالح');
  }

  if (!currentPassword || typeof currentPassword !== 'string') {
    throw new Error('كلمة المرور الحالية مطلوبة');
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    throw new Error('كلمة المرور الجديدة يجب ألا تقل عن 6 خانات');
  }

  if (currentPassword === newPassword) {
    throw new Error('كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور المؤقتة');
  }

  const { db, isMongo } = await getDatabase();
  let user: UserDocument | null = null;

  if (isMongo && db) {
    user = (await db.collection('users').findOne({ id: userId })) as any;
  } else {
    user = (memoryDb.users.find((u) => u.id === userId) as any) || null;
  }

  if (!user || !user.passwordHash) {
    throw new Error('المستخدم غير موجود أو لا يملك كلمة مرور مسجلة');
  }

  // Validate current password
  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new Error('كلمة المرور المؤقتة الحالية غير صحيحة');
  }

  // Hash new password
  const newHash = await bcrypt.hash(newPassword, 10);
  const now = new Date().toISOString();

  if (isMongo && db) {
    await db.collection('users').updateOne(
      { id: userId },
      {
        $set: {
          passwordHash: newHash,
          mustChangePassword: false,
          updatedAt: now
        }
      }
    );
  } else {
    (user as any).passwordHash = newHash;
    (user as any).mustChangePassword = false;
    (user as any).updatedAt = now;
  }

  await createAuditLog({
    userName: user.name,
    userRole: user.role,
    action: 'CHANGE_PERSONAL_PASSWORD',
    resource: 'users',
    resourceId: userId,
    status: 'نجاح',
    details: `قام المستخدم (${user.name} - @${user.username}) بتعيين كلمة مرور شخصية جديدة وتأكيد حسابه`
  });

  return {
    success: true,
    message: 'تم تعيين كلمة المرور الشخصية الجديدة وتأكيد حسابك بنجاح'
  };
}


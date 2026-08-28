import { getDatabase, memoryDb } from '../db/mongodb.ts';
import { UserDocument, UserRole, UserAddress } from '../models/types.ts';
import { Logger } from '../utils/logger.ts';
import { storageService } from './storage/storageProvider.ts';
import { createAuditLog } from './auditService.ts';
import { AuthenticatedUser } from '../middleware/auth.ts';

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
      return user as unknown as UserDocument | null;
    } catch (e) {
      Logger.error('[UserService] Error querying user by ID in MongoDB:', e);
    }
  }

  const memUser = memoryDb.users.find((u) => u.id === id);
  return (memUser as unknown as UserDocument) || null;
}

export async function createUser(userData: {
  id?: string;
  username: string;
  name: string;
  email?: string;
  passwordHash?: string;
  phone: string;
  role: UserRole;
  avatar?: string;
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
    avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
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
  const query: any = {};

  if (filters.role && filters.role !== 'all') {
    query.role = filters.role;
  }
  if (filters.governorate && filters.governorate !== 'all') {
    query.governorate = filters.governorate;
  }
  if (filters.search && filters.search.trim()) {
    const term = filters.search.trim();
    query.$or = [
      { name: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
      { phone: { $regex: term, $options: 'i' } }
    ];
  }

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
    if (filters.search && filters.search.trim()) {
      const term = filters.search.trim().toLowerCase();
      return (
        u.name.toLowerCase().includes(term) ||
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


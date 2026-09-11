import { ObjectId } from 'mongodb';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { SellerDocument, ProductDocument, OrderDocument, SellerStatus } from '../models/types.ts';
import type { AuthenticatedUser } from '../middleware/auth.ts';
import { invalidateAuthSession } from '../middleware/auth.ts';
import { createAuditLog } from './auditService.ts';
import { cacheService } from './cacheService.ts';
import { createNotification } from './notificationService.ts';

/**
 * Get aggregated real statistics for a seller dashboard.
 */
export async function getSellerDashboardStats(sellerId: string) {
  const { db, isMongo } = await getDatabase();
  let products: ProductDocument[] = [];
  let orders: OrderDocument[] = [];

  if (isMongo && db) {
    try {
      products = (await db.collection('products').find({ sellerId }).toArray()) as unknown as ProductDocument[];
      orders = (await db.collection('orders').find({ sellerIds: sellerId }).sort({ createdAt: -1 }).toArray()) as unknown as OrderDocument[];
    } catch (e) {
      console.error('[SellerService] MongoDB stats fetch error:', e);
    }
  }

  if (!isMongo) {
    if (products.length === 0) {
      products = memoryDb.products.filter((p) => p.sellerId === sellerId) as ProductDocument[];
    }
    if (orders.length === 0) {
      orders = memoryDb.orders.filter((o) => o.sellerIds.includes(sellerId));
    }
  }

  let totalSales = 0;
  let totalUnitsSold = 0;
  const productSalesMap: Record<string, { title: string; image: string; units: number; revenue: number }> = {};

  for (const order of orders) {
    if (order.status !== 'cancelled') {
      for (const item of order.items || []) {
        if (item.sellerId === sellerId) {
          const revenue = (item.unitPrice || 0) * (item.quantity || 1);
          totalSales += revenue;
          totalUnitsSold += item.quantity || 1;

          if (!productSalesMap[item.productId]) {
            productSalesMap[item.productId] = {
              title: item.productTitle || 'منتج',
              image: item.productImage || '',
              units: 0,
              revenue: 0
            };
          }
          productSalesMap[item.productId].units += item.quantity || 1;
          productSalesMap[item.productId].revenue += revenue;
        }
      }
    }
  }

  const activeApprovedCount = products.filter((p) => p.approvalStatus === 'approved').length;
  const pendingCount = products.filter((p) => p.approvalStatus === 'pending').length;
  const rejectedCount = products.filter((p) => p.approvalStatus === 'rejected').length;
  const lowStockCount = products.filter((p) => Number(p.stockCount) > 0 && Number(p.stockCount) <= 5).length;
  const outOfStockCount = products.filter((p) => Number(p.stockCount) === 0).length;

  const topProducts = Object.entries(productSalesMap)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  const recentOrders = orders.slice(0, 5);

  return {
    totalSales,
    totalUnitsSold,
    ordersCount: orders.length,
    productsCount: products.length,
    activeApprovedCount,
    pendingCount,
    rejectedCount,
    lowStockCount,
    outOfStockCount,
    topProducts,
    recentOrders
  };
}

/**
 * Get seller analytics grouped by time period.
 */
export async function getSellerAnalytics(sellerId: string, period: '7d' | '30d' | '90d' | 'all' = '30d') {
  const { db, isMongo } = await getDatabase();
  let orders: OrderDocument[] = [];
  let products: ProductDocument[] = [];

  if (isMongo && db) {
    try {
      orders = (await db.collection('orders').find({ sellerIds: sellerId }).sort({ createdAt: 1 }).toArray()) as unknown as OrderDocument[];
      products = (await db.collection('products').find({ sellerId }).toArray()) as unknown as ProductDocument[];
    } catch (e) {
      console.error('[SellerService] MongoDB analytics error:', e);
    }
  }

  if (orders.length === 0) {
    orders = memoryDb.orders.filter((o) => o.sellerIds.includes(sellerId));
  }
  if (products.length === 0) {
    products = memoryDb.products.filter((p) => p.sellerId === sellerId) as ProductDocument[];
  }

  const now = new Date();
  let daysToFilter = 30;
  if (period === '7d') daysToFilter = 7;
  if (period === '90d') daysToFilter = 90;
  if (period === 'all') daysToFilter = 3650;

  const cutoffTime = new Date(now.getTime() - daysToFilter * 24 * 60 * 60 * 1000).getTime();
  const filteredOrders = orders.filter((o) => new Date(o.createdAt).getTime() >= cutoffTime);

  const dailyMap: Record<string, { date: string; sales: number; orders: number; units: number }> = {};
  let totalRevenue = 0;
  let totalUnits = 0;

  for (let i = Math.min(daysToFilter, 30) - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    dailyMap[dateStr] = { date: dateStr, sales: 0, orders: 0, units: 0 };
  }

  for (const order of filteredOrders) {
    if (order.status !== 'cancelled') {
      const orderDate = order.createdAt.split('T')[0];
      let orderSellerRevenue = 0;
      let orderSellerUnits = 0;

      for (const item of order.items || []) {
        if (item.sellerId === sellerId) {
          const rev = (item.unitPrice || 0) * (item.quantity || 1);
          orderSellerRevenue += rev;
          orderSellerUnits += item.quantity || 1;
        }
      }

      if (orderSellerRevenue > 0) {
        if (!dailyMap[orderDate]) {
          dailyMap[orderDate] = { date: orderDate, sales: 0, orders: 0, units: 0 };
        }
        dailyMap[orderDate].sales += orderSellerRevenue;
        dailyMap[orderDate].orders += 1;
        dailyMap[orderDate].units += orderSellerUnits;

        totalRevenue += orderSellerRevenue;
        totalUnits += orderSellerUnits;
      }
    }
  }

  const timeline = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  return {
    period,
    totalRevenue,
    totalOrders: filteredOrders.length,
    totalUnits,
    productsCount: products.length,
    timeline
  };
}

/**
 * Update seller store profile.
 */
export async function updateSellerProfile(
  sellerUser: AuthenticatedUser,
  updates: Partial<SellerDocument>
): Promise<SellerDocument> {
  const sellerId = sellerUser.sellerId || sellerUser.id;

  const safeUpdates: Partial<SellerDocument> = {
    brandName: updates.brandName?.trim(),
    name: updates.name?.trim(),
    bio: updates.bio?.trim(),
    story: updates.story?.trim(),
    avatar: updates.avatar?.trim(),
    coverImage: updates.coverImage?.trim(),
    phone: updates.phone?.trim(),
    governorate: updates.governorate,
    specialty: updates.specialty?.trim(),
    payoutMethod: updates.payoutMethod,
    payoutAccount: updates.payoutAccount?.trim()
  };

  Object.keys(safeUpdates).forEach((k) => {
    if ((safeUpdates as any)[k] === undefined) delete (safeUpdates as any)[k];
  });

  const { db, isMongo } = await getDatabase();
  let seller: SellerDocument | null = null;

  if (isMongo && db) {
    try {
      await db.collection('sellers').updateOne({ id: sellerId }, { $set: safeUpdates });
      seller = (await db.collection('sellers').findOne({ id: sellerId })) as unknown as SellerDocument | null;
    } catch (e) {
      console.error('[SellerService] MongoDB update seller error:', e);
    }
  }

  const memSeller = memoryDb.sellers.find((s) => s.id === sellerId);
  if (memSeller) {
    Object.assign(memSeller, safeUpdates);
  }

  if (!seller) {
    seller = (memSeller as unknown as SellerDocument) || null;
  }

  cacheService.invalidateSellers(sellerId);

  await createAuditLog({
    actorId: sellerUser.id,
    userName: sellerUser.name,
    userRole: 'seller',
    action: 'SELLER_UPDATED_PROFILE',
    resource: 'حساب ورشة',
    resourceId: sellerId,
    status: 'نجاح',
    details: `قام الحرفي ${sellerUser.name} بتحديث بيانات المتجر والورشة`
  });

  return seller!;
}

/**
 * Admin: Update any seller's profile, cover image, and store information directly.
 */
export async function adminUpdateSellerProfile(
  adminUser: AuthenticatedUser,
  sellerId: string,
  updates: Partial<SellerDocument>
): Promise<SellerDocument> {
  if (adminUser.role !== 'admin') {
    throw new Error('فقط مدير المنصة يملك صلاحية تعديل بيانات ورش الحرفيين');
  }

  const { db, isMongo } = await getDatabase();
  let seller: SellerDocument | null = null;

  if (isMongo && db) {
    try {
      seller = (await db.collection('sellers').findOne({ id: sellerId })) as unknown as SellerDocument | null;
    } catch (e) {
      console.error('[SellerService] MongoDB find seller error:', e);
    }
  }
  if (!seller) {
    seller = (memoryDb.sellers.find((s) => s.id === sellerId) as unknown as SellerDocument) || null;
  }

  if (!seller) {
    throw new Error('بيانات الورشة/البائع غير موجودة');
  }

  const safeUpdates: Partial<SellerDocument> = {};
  if (updates.brandName !== undefined) safeUpdates.brandName = updates.brandName.trim();
  if (updates.name !== undefined) safeUpdates.name = updates.name.trim();
  if (updates.bio !== undefined) safeUpdates.bio = updates.bio.trim();
  if (updates.story !== undefined) safeUpdates.story = updates.story.trim();
  if (updates.avatar !== undefined) safeUpdates.avatar = updates.avatar.trim();
  if (updates.coverImage !== undefined) safeUpdates.coverImage = updates.coverImage.trim();
  if (updates.phone !== undefined) safeUpdates.phone = updates.phone.trim();
  if (updates.email !== undefined) safeUpdates.email = updates.email.trim();
  if (updates.governorate !== undefined) safeUpdates.governorate = updates.governorate;
  if (updates.specialty !== undefined) safeUpdates.specialty = updates.specialty.trim();
  if (updates.payoutMethod !== undefined) safeUpdates.payoutMethod = updates.payoutMethod;
  if (updates.payoutAccount !== undefined) safeUpdates.payoutAccount = updates.payoutAccount.trim();
  if (updates.verified !== undefined) safeUpdates.verified = Boolean(updates.verified);
  if (updates.status !== undefined) safeUpdates.status = updates.status;

  if (isMongo && db) {
    try {
      await db.collection('sellers').updateOne({ id: sellerId }, { $set: safeUpdates });
      const userUpdate: any = {};
      if (safeUpdates.name) userUpdate.name = safeUpdates.name;
      if (safeUpdates.governorate) userUpdate.governorate = safeUpdates.governorate;
      if (safeUpdates.avatar) userUpdate.avatar = safeUpdates.avatar;
      if (safeUpdates.status) userUpdate.sellerStatus = safeUpdates.status;

      if (Object.keys(userUpdate).length > 0) {
        await db.collection('users').updateMany(
          { $or: [{ sellerId: sellerId }, { id: seller.userId }, { email: seller.email }] },
          { $set: userUpdate }
        );
      }

      seller = (await db.collection('sellers').findOne({ id: sellerId })) as unknown as SellerDocument | null;
    } catch (e) {
      console.error('[SellerService] MongoDB admin update seller error:', e);
    }
  }

  const memSeller = memoryDb.sellers.find((s) => s.id === sellerId);
  if (memSeller) {
    Object.assign(memSeller, safeUpdates);
  }

  if (!seller) {
    seller = (memSeller as unknown as SellerDocument) || null;
  }

  cacheService.invalidateSellers(sellerId);

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'ADMIN_UPDATED_SELLER_PROFILE',
    resource: 'حساب ورشة',
    resourceId: sellerId,
    status: 'نجاح',
    details: `قام المدير ${adminUser.name} بتعديل وتحديث بيانات وغلاف ورشة "${seller?.brandName || sellerId}"`
  });

  return seller!;
}

/**
 * Admin: Update seller status (e.g. approve, reject, suspend, reactivate).
 */
export async function adminUpdateSellerStatus(
  adminUser: AuthenticatedUser,
  sellerId: string,
  status: SellerStatus,
  reason?: string
): Promise<SellerDocument> {
  if (adminUser.role !== 'admin') {
    throw new Error('فقط مدير المنصة يملك صلاحية تغيير حالة البائع');
  }

  const { db, isMongo } = await getDatabase();
  let seller: SellerDocument | null = null;

  if (isMongo && db) {
    try {
      seller = (await db.collection('sellers').findOne({ id: sellerId })) as unknown as SellerDocument | null;
    } catch (e) {
      console.error('[SellerService] MongoDB find seller error:', e);
    }
  }
  if (!seller) {
    seller = (memoryDb.sellers.find((s) => s.id === sellerId) as unknown as SellerDocument) || null;
  }

  if (!seller) {
    throw new Error('بيانات الورشة/البائع غير موجودة');
  }

  const previousStatus = seller.status;
  const now = new Date().toISOString();

  const updatePayload: Partial<SellerDocument> = {
    status,
    verified: status === 'approved'
  };

  if (status === 'approved') {
    updatePayload.approvedAt = now;
    updatePayload.approvedBy = adminUser.name;
    updatePayload.rejectionReason = null;
    updatePayload.suspensionReason = null;
  } else if (status === 'rejected') {
    updatePayload.rejectedAt = now;
    updatePayload.rejectedBy = adminUser.name;
    updatePayload.rejectionReason = reason?.trim() || 'لم يستوفِ الحرفي المعايير التراثية المطلوبة';
  } else if (status === 'suspended') {
    updatePayload.suspendedAt = now;
    updatePayload.suspendedBy = adminUser.name;
    updatePayload.suspensionReason = reason?.trim() || 'تم تعليق الحساب لمخالفة سياسات التوريد أو الجودة';
  }

  const userUpdates: any = {
    sellerStatus: status,
    updatedAt: now
  };

  if (status === 'approved') {
    userUpdates.role = 'seller';
    userUpdates.sellerId = sellerId;
  } else if (status === 'rejected') {
    userUpdates.role = 'buyer';
  }

  if (isMongo && db) {
    try {
      await db.collection('sellers').updateOne({ id: sellerId }, { $set: updatePayload });
      await db.collection('users').updateMany(
        { $or: [{ sellerId: sellerId }, { id: seller.userId }, { email: seller.email }] },
        { $set: userUpdates }
      );
    } catch (e) {
      console.error('[SellerService] MongoDB update status error:', e);
    }
  }

  const memSeller = memoryDb.sellers.find((s) => s.id === sellerId);
  if (memSeller) {
    Object.assign(memSeller, updatePayload);
  }

  const memUser = memoryDb.users.find(
    (u) => u.sellerId === sellerId || u.id === seller!.userId || u.email === seller!.email
  );
  if (memUser) {
    (memUser as any).sellerStatus = status;
    if (status === 'approved') {
      (memUser as any).role = 'seller';
      (memUser as any).sellerId = sellerId;
    } else if (status === 'rejected') {
      (memUser as any).role = 'buyer';
    }
  }

  if (seller.userId) {
    invalidateAuthSession(seller.userId);
  }
  invalidateAuthSession(sellerId);

  const targetUserId = seller.userId || sellerId;
  try {
    if (status === 'approved') {
      await createNotification({
        userId: targetUserId,
        title: 'تهانينا! تم اعتماد حساب ورشتك كبائع رسمي',
        message: `تمت مراجعة واعتماد ورشة "${seller.brandName || seller.name}" بنجاح من قبل الإدارة العليا. يمكنك الآن إدارة منتجاتك واستقبال طلبات العملاء من لوحة التحكم.`,
        type: 'system',
        link: 'seller-dashboard'
      });
    } else if (status === 'rejected') {
      await createNotification({
        userId: targetUserId,
        title: 'تحديث بشأن طلب اعتماد ورشتك الحرفية',
        message: `تم رفض طلب اعتماد ورشة "${seller.brandName || seller.name}". سبب الرفض: ${reason?.trim() || updatePayload.rejectionReason || 'عدم استيفاء المعايير التراثية المطلوبة'}. يمكنك تعديل بياناتك وإعادة تقديم الطلب من صفحة حسابك.`,
        type: 'system',
        link: 'buyer-account'
      });
    } else if (status === 'suspended') {
      await createNotification({
        userId: targetUserId,
        title: 'تم تعليق حساب الورشة مؤقتاً',
        message: `تم تعليق حساب ورشة "${seller.brandName || seller.name}". سبب التعليق: ${reason?.trim() || updatePayload.suspensionReason || 'مخالفة معايير الجودة والتوريد'}.`,
        type: 'system',
        link: 'buyer-account'
      });
    }
  } catch (notifErr) {
    console.error('[SellerService] Error creating status change notification:', notifErr);
  }

  const updatedSeller = { ...seller, ...updatePayload };
  cacheService.invalidateSellers(sellerId);

  let actionName = 'SELLER_STATUS_CHANGED';
  if (status === 'approved' && previousStatus === 'pending') actionName = 'SELLER_APPROVED';
  else if (status === 'approved' && previousStatus === 'suspended') actionName = 'SELLER_REACTIVATED';
  else if (status === 'rejected') actionName = 'SELLER_REJECTED';
  else if (status === 'suspended') actionName = 'SELLER_SUSPENDED';

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: actionName,
    resource: 'حساب ورشة',
    resourceId: sellerId,
    status: status === 'suspended' || status === 'rejected' ? 'تنبيه' : 'نجاح',
    details: `قام المدير ${adminUser.name} بتعديل حالة ورشة "${seller.brandName || seller.name}" من [${previousStatus}] إلى [${status}]${reason ? ` - السبب: ${reason}` : ''
      }`
  });

  return updatedSeller;
}

/**
 * Admin: Delete a seller completely from database and memory,
 * cleaning up all associated products, reels, and user profiles.
 */
export async function deleteSellerCompletely(
  adminUser: AuthenticatedUser,
  sellerIdOrUserId: string
): Promise<{ success: boolean; message: string; deletedProductsCount: number; deletedReelsCount: number }> {
  if (adminUser.role !== 'admin') {
    throw new Error('فقط مدير المنصة يملك صلاحية حذف الورش نهائياً');
  }

  const { db, isMongo } = await getDatabase();
  let targetSellerId = sellerIdOrUserId;
  let targetUserId = sellerIdOrUserId;

  let sellerDoc: any = null;
  if (isMongo && db) {
    const queryFilter: any[] = [{ id: sellerIdOrUserId }, { userId: sellerIdOrUserId }];
    if (ObjectId.isValid(sellerIdOrUserId) && sellerIdOrUserId.length === 24) {
      try {
        queryFilter.push({ _id: new ObjectId(sellerIdOrUserId) });
      } catch { }
    }
    sellerDoc = await db.collection('sellers').findOne({ $or: queryFilter });
    if (sellerDoc) {
      targetSellerId = sellerDoc.id || sellerDoc._id.toString();
      targetUserId = sellerDoc.userId || targetSellerId;
    } else {
      const userFilter: any[] = [{ id: sellerIdOrUserId }];
      if (ObjectId.isValid(sellerIdOrUserId) && sellerIdOrUserId.length === 24) {
        try { userFilter.push({ _id: new ObjectId(sellerIdOrUserId) }); } catch { }
      }
      const userDoc = await db.collection('users').findOne({ $or: userFilter });
      if (userDoc) {
        targetUserId = userDoc.id || userDoc._id?.toString() || sellerIdOrUserId;
        if (userDoc.sellerId) {
          targetSellerId = userDoc.sellerId;
          sellerDoc = await db.collection('sellers').findOne({
            $or: [
              { id: targetSellerId },
              ...(ObjectId.isValid(targetSellerId) && targetSellerId.length === 24 ? [{ _id: new ObjectId(targetSellerId) }] : [])
            ]
          });
        }
      }
    }
  }

  if (!sellerDoc) {
    sellerDoc = memoryDb.sellers.find((s) => s.id === sellerIdOrUserId || (s as any).userId === sellerIdOrUserId);
    if (sellerDoc) {
      targetSellerId = sellerDoc.id;
      targetUserId = (sellerDoc as any).userId || targetSellerId;
    } else {
      const memUser = memoryDb.users.find((u) => u.id === sellerIdOrUserId);
      if (memUser?.sellerId) {
        targetSellerId = memUser.sellerId;
        targetUserId = memUser.id;
        sellerDoc = memoryDb.sellers.find((s) => s.id === targetSellerId);
      }
    }
  }

  const workshopName = sellerDoc?.brandName || sellerDoc?.name || targetSellerId;
  let deletedProductsCount = 0;
  let deletedReelsCount = 0;

  // 1. حذف المنتجات وسجلات المخزون المرتبطة بالورشة
  if (isMongo && db) {
    const sellerProducts = await db.collection('products').find({ sellerId: { $in: [targetSellerId, targetUserId] } }).toArray();
    deletedProductsCount = sellerProducts.length;
    await db.collection('products').deleteMany({ sellerId: { $in: [targetSellerId, targetUserId] } });
    await db.collection('stock_movements').deleteMany({ sellerId: { $in: [targetSellerId, targetUserId] } });
  }
  memoryDb.products = memoryDb.products.filter((p) => p.sellerId !== targetSellerId && p.sellerId !== targetUserId);
  memoryDb.stockMovements = memoryDb.stockMovements.filter((m) => m.sellerId !== targetSellerId && m.sellerId !== targetUserId);

  // 2. حذف فيديوهات الحرفيين (Reels) المرتبطة
  if (isMongo && db) {
    const sellerReels = await db.collection('craft_reels').find({ sellerId: { $in: [targetSellerId, targetUserId] } }).toArray();
    deletedReelsCount = sellerReels.length;
    await db.collection('craft_reels').deleteMany({ sellerId: { $in: [targetSellerId, targetUserId] } });
  }
  memoryDb.craftReels = memoryDb.craftReels.filter((r) => r.sellerId !== targetSellerId && r.sellerId !== targetUserId);

  // 3. حذف سجل الورشة وحساب المستخدم المرتبط
  if (isMongo && db) {
    const sellerFilter: any[] = [{ id: targetSellerId }, { userId: targetUserId }];
    if (ObjectId.isValid(targetSellerId) && targetSellerId.length === 24) {
      try { sellerFilter.push({ _id: new ObjectId(targetSellerId) }); } catch { }
    }
    await db.collection('sellers').deleteMany({ $or: sellerFilter });

    const userFilter: any[] = [{ id: targetUserId }, { id: targetSellerId }];
    if (ObjectId.isValid(targetUserId) && targetUserId.length === 24) {
      try { userFilter.push({ _id: new ObjectId(targetUserId) }); } catch { }
    }
    await db.collection('users').deleteMany({ $or: userFilter });
  }

  memoryDb.sellers = memoryDb.sellers.filter((s) => s.id !== targetSellerId && (s as any).userId !== targetUserId);
  memoryDb.users = memoryDb.users.filter((u) => u.id !== targetUserId && u.id !== targetSellerId);

  cacheService.invalidateSellers(targetSellerId);
  cacheService.invalidateProducts();
  invalidateAuthSession(targetUserId);
  if (targetSellerId !== targetUserId) {
    invalidateAuthSession(targetSellerId);
  }

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'SELLER_DELETED_COMPLETELY',
    resource: 'حساب ورشة',
    resourceId: targetSellerId,
    status: 'نجاح',
    details: `قام المدير ${adminUser.name} بحذف ورشة "${workshopName}" [${targetSellerId}] نهائياً مع تنظيف ${deletedProductsCount} منتج تراثي و ${deletedReelsCount} فيديو ريلز`
  });

  return {
    success: true,
    message: `تم حذف ورشة "${workshopName}" وكل متعلقاتها نهائياً من قاعدة البيانات بنجاح`,
    deletedProductsCount,
    deletedReelsCount
  };
}

/**
 * Helper to dispatch persistent notifications to all administrators when a seller application is submitted.
 */
export async function notifyAdminsOnSellerRequest(params: {
  userId: string;
  userName: string;
  workshopName: string;
  governorate?: string;
  isReapply?: boolean;
}): Promise<void> {
  try {
    const { db, isMongo } = await getDatabase();
    let adminUserIds: string[] = [];
    if (isMongo && db) {
      const adminDocs = await db.collection('users').find({ role: 'admin' }, { projection: { id: 1 } }).toArray();
      adminUserIds = adminDocs.map((a: any) => a.id);
    } else {
      adminUserIds = memoryDb.users.filter((u) => u.role === 'admin').map((u) => u.id);
    }

    const title = params.isReapply ? 'إعادة تقديم طلب اعتماد ورشة' : 'طلب اعتماد ورشة حرفية جديد';
    const message = `قام المستخدم ${params.userName} ${params.isReapply ? 'بإعادة تقديم' : 'بتقديم'} طلب اعتماد ورشة "${params.workshopName}" في محافظة ${params.governorate || 'الصعيد'}. يرجى مراجعة الطلب واتخاذ القرار.`;

    for (const adminId of adminUserIds) {
      await createNotification({
        userId: adminId,
        title,
        message,
        type: 'system',
        link: 'admin-sellers'
      });
    }
  } catch (err) {
    console.error('[SellerService] Error notifying admins on seller request:', err);
  }
}

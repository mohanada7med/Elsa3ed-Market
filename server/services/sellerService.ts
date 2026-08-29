import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { SellerDocument, ProductDocument, OrderDocument, SellerStatus } from '../models/types.ts';
import type { AuthenticatedUser } from '../middleware/auth.ts';
import { createAuditLog } from './auditService.ts';
import { cacheService } from './cacheService.ts';

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

  // Calculate sales and units sold specifically for this seller
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

  // Filter orders by cutoff
  const filteredOrders = orders.filter((o) => new Date(o.createdAt).getTime() >= cutoffTime);

  // Group sales by day
  const dailyMap: Record<string, { date: string; sales: number; orders: number; units: number }> = {};
  let totalRevenue = 0;
  let totalUnits = 0;

  // Prepopulate days
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

  // Remove undefined keys
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

  if (isMongo && db) {
    try {
      // 1. Update seller in sellers collection
      await db.collection('sellers').updateOne({ id: sellerId }, { $set: updatePayload });

      // 2. Sync sellerStatus to users collection
      await db.collection('users').updateMany(
        { $or: [{ sellerId: sellerId }, { id: seller.userId }, { email: seller.email }] },
        { $set: { sellerStatus: status, updatedAt: now } }
      );
    } catch (e) {
      console.error('[SellerService] MongoDB update status error:', e);
    }
  }

  // Update in-memory fallback
  const memSeller = memoryDb.sellers.find((s) => s.id === sellerId);
  if (memSeller) {
    Object.assign(memSeller, updatePayload);
  }

  const memUser = memoryDb.users.find(
    (u) => u.sellerId === sellerId || u.id === seller!.userId || u.email === seller!.email
  );
  if (memUser) {
    (memUser as any).sellerStatus = status;
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
    details: `قام المدير ${adminUser.name} بتعديل حالة ورشة "${seller.brandName || seller.name}" من [${previousStatus}] إلى [${status}]${
      reason ? ` - السبب: ${reason}` : ''
    }`
  });

  return updatedSeller;
}

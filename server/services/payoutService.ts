import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type {
  PayoutDocument,
  PayoutStatus,
  PayoutMethod,
  SellerPayoutSummary,
  AdminPayoutSummary,
  SellerDocument,
  OrderDocument
} from '../models/types.ts';
import type { AuthenticatedUser } from '../middleware/auth.ts';
import { createNotification } from './notificationService.ts';
import { addAuditLog } from './auditService.ts';

/**
 * Calculates a seller's real-time financial balance directly from actual order history and payouts.
 * Prevents double payouts and guarantees that no untrusted frontend numbers are ever used.
 */
export async function calculateSellerBalance(sellerId: string): Promise<{
  totalEarnings: number;
  totalSalesCount: number;
  totalPaid: number;
  pendingProcessing: number;
  availableBalance: number;
  hasPayoutInfo: boolean;
  payoutInfo?: {
    method: PayoutMethod;
    account: string;
  };
  seller: SellerDocument | null;
}> {
  const { db, isMongo } = await getDatabase();

  let seller: SellerDocument | null = null;
  let orders: OrderDocument[] = [];
  let payouts: PayoutDocument[] = [];

  if (isMongo && db) {
    try {
      seller = (await db.collection('sellers').findOne({
        $or: [{ id: sellerId }, { userId: sellerId }]
      })) as unknown as SellerDocument | null;

      const effectiveSellerId = seller ? seller.id : sellerId;

      orders = (await db
        .collection('orders')
        .find({ sellerIds: effectiveSellerId })
        .toArray()) as unknown as OrderDocument[];

      payouts = (await db
        .collection('payouts')
        .find({ sellerId: effectiveSellerId })
        .toArray()) as unknown as PayoutDocument[];
    } catch (e) {
      console.error('[PayoutService] Error querying MongoDB in calculateSellerBalance:', e);
    }
  }

  if (!seller) {
    seller =
      (memoryDb.sellers.find(
        (s) => s.id === sellerId || (s as any).userId === sellerId
      ) as unknown as SellerDocument) || null;
  }

  const effectiveSellerId = seller ? seller.id : sellerId;

  if (orders.length === 0) {
    orders = memoryDb.orders.filter(
      (o) => o.sellerIds && o.sellerIds.includes(effectiveSellerId)
    );
  }

  if (payouts.length === 0) {
    payouts = memoryDb.payouts.filter((p) => p.sellerId === effectiveSellerId);
  }

  // 1. Calculate eligible earnings from non-cancelled, non-refunded orders
  let totalEarnings = 0;
  let totalSalesCount = 0;

  for (const order of orders) {
    if (order.status !== 'cancelled' && order.paymentStatus !== 'refunded') {
      for (const item of order.items || []) {
        if (item.sellerId === effectiveSellerId) {
          const itemRev = (item.unitPrice || 0) * (item.quantity || 1);
          totalEarnings += itemRev;
          totalSalesCount += item.quantity || 1;
        }
      }
    }
  }

  // 2. Sum up total paid payouts
  let totalPaid = 0;
  let pendingProcessing = 0;

  for (const payout of payouts) {
    if (payout.status === 'paid') {
      totalPaid += Number(payout.paidAmount ?? payout.requestedAmount ?? 0);
    } else if (
      payout.status === 'pending' ||
      payout.status === 'approved' ||
      payout.status === 'processing'
    ) {
      pendingProcessing += Number(payout.requestedAmount || 0);
    }
  }

  // 3. Round to 2 decimal places to avoid floating point inaccuracies
  totalEarnings = Math.round(totalEarnings * 100) / 100;
  totalPaid = Math.round(totalPaid * 100) / 100;
  pendingProcessing = Math.round(pendingProcessing * 100) / 100;

  const rawAvailable = totalEarnings - totalPaid - pendingProcessing;
  const availableBalance = Math.max(0, Math.round(rawAvailable * 100) / 100);

  const hasPayoutInfo = Boolean(
    seller?.payoutMethod &&
      seller?.payoutAccount &&
      seller.payoutAccount.trim().length > 0
  );

  return {
    totalEarnings,
    totalSalesCount,
    totalPaid,
    pendingProcessing,
    availableBalance,
    hasPayoutInfo,
    payoutInfo: hasPayoutInfo
      ? {
          method: seller!.payoutMethod,
          account: seller!.payoutAccount
        }
      : undefined,
    seller
  };
}

/**
 * Seller creates a new payout request with comprehensive balance & account checks.
 */
export async function createSellerPayoutRequest(
  sellerUser: AuthenticatedUser,
  requestedAmount: number,
  sellerNotes?: string
): Promise<PayoutDocument> {
  const sellerId = sellerUser.sellerId || sellerUser.id;

  // 1. Calculate live balance and retrieve seller account info
  const balanceInfo = await calculateSellerBalance(sellerId);
  const seller = balanceInfo.seller;

  if (!seller) {
    throw new Error('لم يتم العثور على بيانات الورشة أو حساب البائع');
  }

  // 2. Strict validation of registered payout details
  if (!balanceInfo.hasPayoutInfo || !seller.payoutMethod || !seller.payoutAccount?.trim()) {
    throw new Error('يرجى إضافة بيانات استلام المستحقات أولاً.');
  }

  // 3. Strict amount validation
  const numAmount = Number(requestedAmount);
  if (!numAmount || isNaN(numAmount) || !isFinite(numAmount) || numAmount <= 0) {
    throw new Error('يجب أن يكون المبلغ المطلوب أكبر من 0 جنيه');
  }

  const normalizedAmount = Math.round(numAmount * 100) / 100;

  // 4. Validate that requested amount does not exceed available balance
  if (normalizedAmount > balanceInfo.availableBalance) {
    throw new Error(
      `المبلغ المطلوب (${normalizedAmount.toLocaleString('ar-EG')} ج.م) يتجاوز رصيدك المتاح للسحب حالياً (${balanceInfo.availableBalance.toLocaleString('ar-EG')} ج.م)`
    );
  }

  const now = new Date().toISOString();
  const payoutId = `payout-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const payoutDoc: PayoutDocument = {
    id: payoutId,
    sellerId: seller.id,
    sellerName: seller.name || sellerUser.name,
    sellerBrandName: seller.brandName || seller.name,
    sellerGovernorate: seller.governorate,
    requestedAmount: normalizedAmount,
    currency: 'ج.م',
    status: 'pending',
    paymentMethod: seller.payoutMethod,
    paymentDetailsSnapshot: {
      method: seller.payoutMethod,
      accountNumber: seller.payoutAccount.trim(),
      accountHolderName: seller.name
    },
    sellerBalanceAtRequest: balanceInfo.availableBalance,
    sellerNotes: sellerNotes?.trim() || null,
    requestedAt: now,
    createdAt: now,
    updatedAt: now
  };

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('payouts').insertOne(payoutDoc as any);
    } catch (e) {
      console.error('[PayoutService] MongoDB error inserting payout:', e);
    }
  }

  memoryDb.payouts.unshift(payoutDoc);

  // 5. Create Admin Notification immediately
  const formattedAmount = normalizedAmount.toLocaleString('ar-EG');
  const sellerDisplayName = seller.brandName || seller.name || sellerUser.name;
  
  await createNotification({
    userId: 'user-admin-1', // Default platform admin ID
    title: 'طلب صرف مستحقات جديد',
    message: `البائع ${sellerDisplayName} طلب صرف مستحقات بقيمة ${formattedAmount} جنيه.`,
    type: 'system',
    link: 'admin-payouts'
  });

  // Also create notification for generic 'admin' target
  await createNotification({
    userId: 'admin',
    title: 'طلب صرف مستحقات جديد',
    message: `البائع ${sellerDisplayName} طلب صرف مستحقات بقيمة ${formattedAmount} جنيه.`,
    type: 'system',
    link: 'admin-payouts'
  });

  // 6. Create Seller Notification
  await createNotification({
    userId: sellerUser.id,
    title: 'تم إرسال طلب صرف المستحقات',
    message: `تم إرسال طلب صرف مستحقاتك بنجاح بقيمة ${formattedAmount} ج.م، والطلب قيد مراجعة إدارة المنصة.`,
    type: 'system',
    link: 'seller-payouts'
  });

  // 7. Record in Audit Log
  await addAuditLog({
    actorId: sellerUser.id,
    userName: sellerUser.name,
    userRole: 'seller',
    action: 'SELLER_PAYOUT_REQUESTED',
    resource: 'طلب صرف مستحقات',
    resourceId: payoutDoc.id,
    status: 'نجاح',
    details: `قام الحرفي ${sellerDisplayName} بطلب تحويل مستحقات بقيمة ${normalizedAmount} ج.م عبر ${seller.payoutMethod} (${seller.payoutAccount})`
  });

  return payoutDoc;
}

/**
 * Get all payouts and financial summary for a specific seller.
 */
export async function getSellerPayouts(sellerUser: AuthenticatedUser): Promise<{
  payouts: PayoutDocument[];
  summary: SellerPayoutSummary;
}> {
  const sellerId = sellerUser.sellerId || sellerUser.id;
  const balanceInfo = await calculateSellerBalance(sellerId);
  const effectiveSellerId = balanceInfo.seller ? balanceInfo.seller.id : sellerId;

  const { db, isMongo } = await getDatabase();
  let payouts: PayoutDocument[] = [];

  if (isMongo && db) {
    try {
      payouts = (await db
        .collection('payouts')
        .find({ sellerId: effectiveSellerId })
        .sort({ createdAt: -1 })
        .toArray()) as unknown as PayoutDocument[];
    } catch (e) {
      console.error('[PayoutService] MongoDB query payouts error:', e);
    }
  }

  if (payouts.length === 0) {
    payouts = memoryDb.payouts
      .filter((p) => p.sellerId === effectiveSellerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return {
    payouts,
    summary: {
      totalEarnings: balanceInfo.totalEarnings,
      totalSalesCount: balanceInfo.totalSalesCount,
      totalPaid: balanceInfo.totalPaid,
      pendingProcessing: balanceInfo.pendingProcessing,
      availableBalance: balanceInfo.availableBalance,
      hasPayoutInfo: balanceInfo.hasPayoutInfo,
      payoutInfo: balanceInfo.payoutInfo
    }
  };
}

/**
 * Get single payout request for a seller with IDOR verification.
 */
export async function getSellerPayoutById(
  sellerUser: AuthenticatedUser,
  payoutId: string
): Promise<PayoutDocument | null> {
  const sellerId = sellerUser.sellerId || sellerUser.id;
  const { db, isMongo } = await getDatabase();
  let payout: PayoutDocument | null = null;

  if (isMongo && db) {
    try {
      payout = (await db
        .collection('payouts')
        .findOne({ id: payoutId })) as unknown as PayoutDocument | null;
    } catch (e) {
      console.error('[PayoutService] MongoDB error finding payout:', e);
    }
  }

  if (!payout) {
    payout = memoryDb.payouts.find((p) => p.id === payoutId) || null;
  }

  if (!payout) {
    return null;
  }

  // IDOR Protection
  const balanceInfo = await calculateSellerBalance(sellerId);
  const effectiveSellerId = balanceInfo.seller ? balanceInfo.seller.id : sellerId;

  if (payout.sellerId !== effectiveSellerId && payout.sellerId !== sellerId) {
    throw new Error('غير مصرح لك بالاطلاع على بيانات طلب الصرف هذا');
  }

  return payout;
}

/**
 * Seller cancels their own pending payout request.
 */
export async function cancelSellerPayout(
  sellerUser: AuthenticatedUser,
  payoutId: string
): Promise<PayoutDocument> {
  const payout = await getSellerPayoutById(sellerUser, payoutId);
  if (!payout) {
    throw new Error('طلب الصرف غير موجود');
  }

  if (payout.status !== 'pending') {
    throw new Error('لا يمكن إلغاء طلب الصرف بعد أن بدأت الإدارة في مراجعته أو تنفيذه');
  }

  const now = new Date().toISOString();
  payout.status = 'cancelled';
  payout.cancelledAt = now;
  payout.updatedAt = now;

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('payouts').updateOne(
        { id: payoutId },
        {
          $set: {
            status: 'cancelled',
            cancelledAt: now,
            updatedAt: now
          }
        }
      );
    } catch (e) {
      console.error('[PayoutService] MongoDB cancel payout error:', e);
    }
  }

  const memIdx = memoryDb.payouts.findIndex((p) => p.id === payoutId);
  if (memIdx >= 0) {
    memoryDb.payouts[memIdx] = payout;
  }

  await addAuditLog({
    actorId: sellerUser.id,
    userName: sellerUser.name,
    userRole: 'seller',
    action: 'SELLER_PAYOUT_CANCELLED',
    resource: 'طلب صرف مستحقات',
    resourceId: payoutId,
    status: 'نجاح',
    details: `قام الحرفي بإلغاء طلب الصرف رقم ${payoutId} بقيمة ${payout.requestedAmount} ج.م`
  });

  return payout;
}

/**
 * Admin: Get all platform payout requests with filtering and KPI aggregation.
 */
export async function getAdminPayouts(filters?: {
  status?: string;
  search?: string;
}): Promise<{
  payouts: PayoutDocument[];
  summary: AdminPayoutSummary;
}> {
  const { db, isMongo } = await getDatabase();
  let allPayouts: PayoutDocument[] = [];

  if (isMongo && db) {
    try {
      allPayouts = (await db
        .collection('payouts')
        .find()
        .sort({ createdAt: -1 })
        .toArray()) as unknown as PayoutDocument[];
    } catch (e) {
      console.error('[PayoutService] MongoDB fetch admin payouts error:', e);
    }
  }

  if (allPayouts.length === 0) {
    allPayouts = [...memoryDb.payouts];
  }

  allPayouts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Compute KPI summary from all records
  let totalPendingCount = 0;
  let totalPendingAmount = 0;
  let totalApprovedProcessingCount = 0;
  let totalApprovedProcessingAmount = 0;
  let totalPaidCount = 0;
  let totalPaidAmount = 0;
  let totalRejectedCount = 0;

  for (const p of allPayouts) {
    if (p.status === 'pending') {
      totalPendingCount++;
      totalPendingAmount += Number(p.requestedAmount || 0);
    } else if (p.status === 'approved' || p.status === 'processing') {
      totalApprovedProcessingCount++;
      totalApprovedProcessingAmount += Number(p.requestedAmount || 0);
    } else if (p.status === 'paid') {
      totalPaidCount++;
      totalPaidAmount += Number(p.paidAmount ?? p.requestedAmount ?? 0);
    } else if (p.status === 'rejected') {
      totalRejectedCount++;
    }
  }

  let filtered = allPayouts;

  if (filters?.status && filters.status !== 'all') {
    filtered = filtered.filter((p) => p.status === filters.status);
  }

  if (filters?.search) {
    const q = filters.search.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        (p.sellerName && p.sellerName.toLowerCase().includes(q)) ||
        (p.sellerBrandName && p.sellerBrandName.toLowerCase().includes(q)) ||
        (p.paymentDetailsSnapshot?.accountNumber &&
          p.paymentDetailsSnapshot.accountNumber.includes(q)) ||
        (p.transactionReference && p.transactionReference.toLowerCase().includes(q))
    );
  }

  return {
    payouts: filtered,
    summary: {
      totalPendingCount,
      totalPendingAmount: Math.round(totalPendingAmount * 100) / 100,
      totalApprovedProcessingCount,
      totalApprovedProcessingAmount: Math.round(totalApprovedProcessingAmount * 100) / 100,
      totalPaidCount,
      totalPaidAmount: Math.round(totalPaidAmount * 100) / 100,
      totalRejectedCount
    }
  };
}

/**
 * Admin: Get single payout request with full seller history & live balance.
 */
export async function getAdminPayoutById(payoutId: string): Promise<{
  payout: PayoutDocument;
  seller: SellerDocument | null;
  currentAvailableBalance: number;
  sellerPreviousPayouts: PayoutDocument[];
  totalSellerEarnings: number;
} | null> {
  const { db, isMongo } = await getDatabase();
  let payout: PayoutDocument | null = null;

  if (isMongo && db) {
    try {
      payout = (await db
        .collection('payouts')
        .findOne({ id: payoutId })) as unknown as PayoutDocument | null;
    } catch (e) {
      console.error('[PayoutService] MongoDB find payout error:', e);
    }
  }

  if (!payout) {
    payout = memoryDb.payouts.find((p) => p.id === payoutId) || null;
  }

  if (!payout) {
    return null;
  }

  const balanceInfo = await calculateSellerBalance(payout.sellerId);

  let sellerPreviousPayouts: PayoutDocument[] = [];
  if (isMongo && db) {
    try {
      sellerPreviousPayouts = (await db
        .collection('payouts')
        .find({ sellerId: payout.sellerId, id: { $ne: payoutId } })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray()) as unknown as PayoutDocument[];
    } catch (e) {
      console.error('[PayoutService] MongoDB find previous payouts error:', e);
    }
  }
  if (sellerPreviousPayouts.length === 0) {
    sellerPreviousPayouts = memoryDb.payouts
      .filter((p) => p.sellerId === payout!.sellerId && p.id !== payoutId)
      .slice(0, 10);
  }

  return {
    payout,
    seller: balanceInfo.seller,
    currentAvailableBalance: balanceInfo.availableBalance,
    sellerPreviousPayouts,
    totalSellerEarnings: balanceInfo.totalEarnings
  };
}

/**
 * Admin: Approve a pending payout request (does not send money).
 */
export async function adminApprovePayout(
  adminUser: AuthenticatedUser,
  payoutId: string,
  note?: string
): Promise<PayoutDocument> {
  const adminDetails = await getAdminPayoutById(payoutId);
  if (!adminDetails || !adminDetails.payout) {
    throw new Error('طلب الصرف غير موجود');
  }

  const payout = adminDetails.payout;

  if (payout.status !== 'pending') {
    throw new Error(`لا يمكن الموافقة على طلب حالته الحالية "${payout.status}"`);
  }

  const now = new Date().toISOString();
  payout.status = 'approved';
  payout.approvedAmount = payout.requestedAmount;
  payout.approvedAt = now;
  payout.reviewedBy = adminUser.name;
  if (note?.trim()) payout.adminNote = note.trim();
  payout.updatedAt = now;

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('payouts').updateOne(
        { id: payoutId },
        {
          $set: {
            status: 'approved',
            approvedAmount: payout.approvedAmount,
            approvedAt: now,
            reviewedBy: adminUser.name,
            adminNote: payout.adminNote,
            updatedAt: now
          }
        }
      );
    } catch (e) {
      console.error('[PayoutService] MongoDB approve payout error:', e);
    }
  }

  const memIdx = memoryDb.payouts.findIndex((p) => p.id === payoutId);
  if (memIdx >= 0) {
    memoryDb.payouts[memIdx] = payout;
  }

  // Seller Notification
  const formattedAmount = payout.requestedAmount.toLocaleString('ar-EG');
  await createNotification({
    userId: adminDetails.seller?.userId || payout.sellerId,
    title: 'تمت الموافقة على طلب صرف المستحقات',
    message: `تمت الموافقة على طلب صرف مستحقاتك بقيمة ${formattedAmount} ج.م، وجاري التجهيز لتحويل المبلغ.`,
    type: 'system',
    link: 'seller-payouts'
  });

  // Audit Log
  await addAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'ADMIN_APPROVED_PAYOUT',
    resource: 'طلب صرف مستحقات',
    resourceId: payoutId,
    status: 'نجاح',
    details: `قام المدير ${adminUser.name} بالموافقة على طلب صرف المستحقات #${payoutId} بقيمة ${payout.requestedAmount} ج.م للبائع ${payout.sellerBrandName || payout.sellerName}`
  });

  return payout;
}

/**
 * Admin: Reject a payout request with a mandatory reason.
 */
export async function adminRejectPayout(
  adminUser: AuthenticatedUser,
  payoutId: string,
  rejectionReason: string
): Promise<PayoutDocument> {
  if (!rejectionReason || !rejectionReason.trim()) {
    throw new Error('يرجى كتابة سبب رفض طلب الصرف بشكل واضح');
  }

  const adminDetails = await getAdminPayoutById(payoutId);
  if (!adminDetails || !adminDetails.payout) {
    throw new Error('طلب الصرف غير موجود');
  }

  const payout = adminDetails.payout;

  if (payout.status === 'paid') {
    throw new Error('لا يمكن رفض طلب تم تحويل مبلغه وصرفه بالفعل');
  }
  if (payout.status === 'rejected') {
    throw new Error('هذا الطلب مرفوض بالفعل');
  }

  const now = new Date().toISOString();
  const trimmedReason = rejectionReason.trim();

  payout.status = 'rejected';
  payout.rejectedAt = now;
  payout.reviewedBy = adminUser.name;
  payout.rejectionReason = trimmedReason;
  payout.updatedAt = now;

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('payouts').updateOne(
        { id: payoutId },
        {
          $set: {
            status: 'rejected',
            rejectedAt: now,
            reviewedBy: adminUser.name,
            rejectionReason: trimmedReason,
            updatedAt: now
          }
        }
      );
    } catch (e) {
      console.error('[PayoutService] MongoDB reject payout error:', e);
    }
  }

  const memIdx = memoryDb.payouts.findIndex((p) => p.id === payoutId);
  if (memIdx >= 0) {
    memoryDb.payouts[memIdx] = payout;
  }

  // Seller Notification with rejection reason
  const formattedAmount = payout.requestedAmount.toLocaleString('ar-EG');
  await createNotification({
    userId: adminDetails.seller?.userId || payout.sellerId,
    title: 'تم رفض طلب صرف المستحقات',
    message: `تم رفض طلب صرف مستحقاتك بقيمة ${formattedAmount} ج.م. السبب: ${trimmedReason}`,
    type: 'system',
    link: 'seller-payouts'
  });

  // Audit Log
  await addAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'ADMIN_REJECTED_PAYOUT',
    resource: 'طلب صرف مستحقات',
    resourceId: payoutId,
    status: 'تنبيه',
    details: `قام المدير ${adminUser.name} برفض طلب الصرف #${payoutId} للبائع ${payout.sellerBrandName || payout.sellerName} - السبب: ${trimmedReason}`
  });

  return payout;
}

/**
 * Admin: Mark payout as processing (manual transfer started).
 */
export async function adminMarkProcessing(
  adminUser: AuthenticatedUser,
  payoutId: string
): Promise<PayoutDocument> {
  const adminDetails = await getAdminPayoutById(payoutId);
  if (!adminDetails || !adminDetails.payout) {
    throw new Error('طلب الصرف غير موجود');
  }

  const payout = adminDetails.payout;

  if (payout.status !== 'approved' && payout.status !== 'pending') {
    throw new Error(`لا يمكن تحويل الطلب إلى قيد التنفيذ من حالة "${payout.status}"`);
  }

  const now = new Date().toISOString();
  payout.status = 'processing';
  payout.processingAt = now;
  payout.updatedAt = now;

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('payouts').updateOne(
        { id: payoutId },
        {
          $set: {
            status: 'processing',
            processingAt: now,
            updatedAt: now
          }
        }
      );
    } catch (e) {
      console.error('[PayoutService] MongoDB processing payout error:', e);
    }
  }

  const memIdx = memoryDb.payouts.findIndex((p) => p.id === payoutId);
  if (memIdx >= 0) {
    memoryDb.payouts[memIdx] = payout;
  }

  // Seller Notification
  const formattedAmount = payout.requestedAmount.toLocaleString('ar-EG');
  await createNotification({
    userId: adminDetails.seller?.userId || payout.sellerId,
    title: 'جارٍ تنفيذ تحويل المستحقات',
    message: `جارٍ تنفيذ تحويل مستحقاتك بقيمة ${formattedAmount} ج.م إلى حسابك المسجل (${payout.paymentMethod}).`,
    type: 'system',
    link: 'seller-payouts'
  });

  // Audit Log
  await addAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'ADMIN_PAYOUT_PROCESSING',
    resource: 'طلب صرف مستحقات',
    resourceId: payoutId,
    status: 'نجاح',
    details: `بدأ المدير ${adminUser.name} في تنفيذ التحويل اليدوي لطلب الصرف #${payoutId}`
  });

  return payout;
}

/**
 * Admin: Confirms that money was manually transferred outside the system and marks payout as paid.
 * Requires permanent transaction record details.
 */
export async function adminMarkPaid(
  adminUser: AuthenticatedUser,
  payoutId: string,
  payload: {
    transactionReference: string;
    paymentMethod?: PayoutMethod;
    paidAmount?: number;
    paymentDate?: string;
    adminNote?: string;
  }
): Promise<PayoutDocument> {
  const adminDetails = await getAdminPayoutById(payoutId);
  if (!adminDetails || !adminDetails.payout) {
    throw new Error('طلب الصرف غير موجود');
  }

  const payout = adminDetails.payout;

  if (payout.status === 'paid') {
    throw new Error('تم تسجيل هذا الطلب كمدفوع ومصروف بالفعل مسبقاً');
  }

  if (payout.status === 'rejected' || payout.status === 'cancelled') {
    throw new Error(`لا يمكن صرف طلب تم إلغاؤه أو رفضه (الحالة: ${payout.status})`);
  }

  // Validate transaction reference
  if (!payload.transactionReference || !payload.transactionReference.trim()) {
    throw new Error('رقم المعاملة / إيصال التحويل مطلوب لتأكيد التحويل');
  }

  // Validate paid amount
  const paidAmount = payload.paidAmount !== undefined ? Number(payload.paidAmount) : payout.requestedAmount;
  if (isNaN(paidAmount) || paidAmount <= 0) {
    throw new Error('يجب أن يكون المبلغ المحول أكبر من الصفر');
  }

  if (paidAmount > payout.requestedAmount) {
    throw new Error(
      `لا يمكن أن يتجاوز المبلغ المدفوع (${paidAmount} ج.م) المبلغ المطلوب أصلاً (${payout.requestedAmount} ج.م)`
    );
  }

  const now = new Date().toISOString();
  const paymentDate = payload.paymentDate?.trim() || now;
  const paymentMethod = payload.paymentMethod || payout.paymentMethod;
  const transactionRef = payload.transactionReference.trim();

  payout.status = 'paid';
  payout.paidAmount = paidAmount;
  payout.transactionReference = transactionRef;
  payout.paymentMethod = paymentMethod;
  payout.paymentDate = paymentDate;
  payout.paidAt = paymentDate;
  payout.paidBy = adminUser.name;
  if (payload.adminNote?.trim()) {
    payout.adminNote = payload.adminNote.trim();
  }
  payout.updatedAt = now;

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('payouts').updateOne(
        { id: payoutId },
        {
          $set: {
            status: 'paid',
            paidAmount,
            transactionReference: transactionRef,
            paymentMethod,
            paymentDate,
            paidAt: paymentDate,
            paidBy: adminUser.name,
            adminNote: payout.adminNote,
            updatedAt: now
          }
        }
      );
    } catch (e) {
      console.error('[PayoutService] MongoDB mark paid error:', e);
    }
  }

  const memIdx = memoryDb.payouts.findIndex((p) => p.id === payoutId);
  if (memIdx >= 0) {
    memoryDb.payouts[memIdx] = payout;
  }

  // Method Arabic label
  let methodLabel = 'المحفظة الإلكترونية';
  if (paymentMethod === 'vodafone_cash') methodLabel = 'فودافون كاش';
  else if (paymentMethod === 'instapay') methodLabel = 'إنستاباي InstaPay';
  else if (paymentMethod === 'bank_transfer') methodLabel = 'التحويل البنكي';

  // Seller Notification
  const formattedAmount = paidAmount.toLocaleString('ar-EG');
  await createNotification({
    userId: adminDetails.seller?.userId || payout.sellerId,
    title: 'تم تحويل مستحقاتك بنجاح',
    message: `تم تحويل مستحقاتك بنجاح بقيمة ${formattedAmount} ج.م عبر ${methodLabel}. رقم المعاملة: ${transactionRef}.`,
    type: 'system',
    link: 'seller-payouts'
  });

  // Permanent Audit Log
  await addAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: 'admin',
    action: 'ADMIN_MARKED_PAYOUT_PAID',
    resource: 'طلب صرف مستحقات',
    resourceId: payoutId,
    status: 'نجاح',
    details: `أكد المدير ${adminUser.name} تحويل مبلغ ${paidAmount} ج.م إلى الحرفي ${payout.sellerBrandName || payout.sellerName} عبر ${methodLabel} (رقم المعاملة: ${transactionRef})`
  });

  return payout;
}

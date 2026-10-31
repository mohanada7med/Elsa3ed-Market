import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { AuthenticatedUser } from '../middleware/auth.ts';
import type { ProductDocument, SellerDocument } from '../models/types.ts';
import { createNotification } from './notificationService.ts';

export interface SellerFollow {
  id: string;
  userId: string;
  sellerId: string;
  createdAt: string;
}

export interface PaidPromotionRequest {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerUserId: string;
  message: string;
  status: 'pending' | 'active' | 'rejected' | 'expired';
  createdAt: string;
  updatedAt?: string;
  contentType?: 'product' | 'seller';
  contentId?: string;
  startsAt?: string;
  endsAt?: string;
  durationDays?: number;
  paidAmount?: number;
  homepagePosition?: HomePromotionPosition;
  paymentConfirmedAt?: string;
  paymentConfirmedBy?: string;
  requestId?: string;
}

export type HomePromotionPosition =
  | 'after-hero'
  | 'after-product-of-week'
  | 'after-governorates'
  | 'after-reels'
  | 'before-market'
  | 'after-market'
  | 'after-quiz'
  | 'after-sellers';

export interface PaidPromotionContent {
  contentType: 'product' | 'seller';
  content: ProductDocument | SellerDocument;
  startsAt: string;
  endsAt: string;
  homepagePosition?: HomePromotionPosition;
  requestId?: string;
  paidAmount?: number;
  durationDays?: number;
}

const HOME_PROMOTION_POSITIONS: HomePromotionPosition[] = [
  'after-hero',
  'after-product-of-week',
  'after-governorates',
  'after-reels',
  'before-market',
  'after-market',
  'after-quiz',
  'after-sellers'
];

async function findSeller(sellerId: string): Promise<SellerDocument | null> {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    return await db.collection('sellers').findOne({
      $or: [{ id: sellerId }, { userId: sellerId }]
    }) as unknown as SellerDocument | null;
  }
  return (memoryDb.sellers.find(
    (seller) => seller.id === sellerId || seller.userId === sellerId
  ) as SellerDocument | undefined) || null;
}

export async function getSellerFollowState(userId: string, sellerId: string) {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    const [following, followersCount] = await Promise.all([
      db.collection('seller_follows').findOne({ userId, sellerId }),
      db.collection('seller_follows').countDocuments({ sellerId })
    ]);
    return { following: Boolean(following), followersCount };
  }
  const follows = memoryDb.sellerFollows;
  return {
    following: follows.some((follow) => follow.userId === userId && follow.sellerId === sellerId),
    followersCount: follows.filter((follow) => follow.sellerId === sellerId).length
  };
}

export async function followSeller(user: AuthenticatedUser, sellerId: string): Promise<void> {
  if (user.role !== 'buyer') throw new Error('متابعة الورش متاحة لحسابات المشترين فقط');
  const seller = await findSeller(sellerId);
  if (!seller || seller.status !== 'approved') throw new Error('الورشة غير موجودة أو غير معتمدة');
  if (seller.userId === user.id || seller.id === user.id) throw new Error('لا يمكنك متابعة ورشتك');

  const follow: SellerFollow = {
    id: `follow-${user.id}-${sellerId}`,
    userId: user.id,
    sellerId,
    createdAt: new Date().toISOString()
  };
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    await db.collection('seller_follows').updateOne(
      { userId: user.id, sellerId },
      { $setOnInsert: follow },
      { upsert: true }
    );
    return;
  }
  if (!memoryDb.sellerFollows.some((item) => item.userId === user.id && item.sellerId === sellerId)) {
    memoryDb.sellerFollows.push(follow);
  }
}

export async function unfollowSeller(user: AuthenticatedUser, sellerId: string): Promise<void> {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    await db.collection('seller_follows').deleteOne({ userId: user.id, sellerId });
    return;
  }
  memoryDb.sellerFollows = memoryDb.sellerFollows.filter(
    (item) => item.userId !== user.id || item.sellerId !== sellerId
  );
}

export async function notifySellerFollowers(
  sellerId: string,
  notification: { title: string; message: string; link: string; metadata?: Record<string, unknown> }
): Promise<void> {
  const { db, isMongo } = await getDatabase();
  const follows = isMongo && db
    ? await db.collection('seller_follows').find({ sellerId }, { projection: { userId: 1 } }).toArray() as unknown as SellerFollow[]
    : memoryDb.sellerFollows.filter((follow) => follow.sellerId === sellerId);
  const uniqueUserIds = [...new Set(follows.map((follow) => follow.userId).filter(Boolean))];
  const results = await Promise.allSettled(uniqueUserIds.map((userId) =>
    createNotification({
      userId,
      title: notification.title,
      message: notification.message,
      type: 'product',
      link: notification.link,
      metadata: notification.metadata
    })
  ));
  results.forEach((result) => {
    if (result.status === 'rejected') {
      console.error('[CommunityService] Failed to notify a seller follower:', result.reason);
    }
  });
}

export async function createPaidPromotionRequest(
  user: AuthenticatedUser,
  message: string
): Promise<PaidPromotionRequest> {
  if (user.role !== 'seller') throw new Error('طلب الاشتراك متاح لحسابات الورش فقط');
  const sellerId = user.sellerId || user.id;
  const seller = await findSeller(sellerId);
  if (!seller || seller.status !== 'approved') throw new Error('يجب اعتماد الورشة قبل طلب مساحة الترويج');

  const { db, isMongo } = await getDatabase();
  const existing = isMongo && db
    ? await db.collection('paid_promotion_requests').findOne({ sellerId, status: 'pending' })
    : memoryDb.paidPromotionRequests.find((item) => item.sellerId === sellerId && item.status === 'pending');
  if (existing) throw new Error('لديك طلب اشتراك قيد المراجعة بالفعل');

  const request: PaidPromotionRequest = {
    id: `promo-request-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sellerId,
    sellerName: seller.brandName || seller.name,
    sellerUserId: user.id,
    message: message.trim().slice(0, 1000),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  if (isMongo && db) await db.collection('paid_promotion_requests').insertOne(request);
  else memoryDb.paidPromotionRequests.unshift(request);
  return request;
}

export async function getSellerPaidPromotionRequest(sellerId: string): Promise<PaidPromotionRequest | null> {
  const { db, isMongo } = await getDatabase();
  const requests = isMongo && db
    ? await db.collection('paid_promotion_requests').find({ sellerId }).sort({ createdAt: -1 }).limit(1).toArray()
    : memoryDb.paidPromotionRequests
      .filter((item) => item.sellerId === sellerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 1);
  return (requests[0] as PaidPromotionRequest | undefined) || null;
}

export async function getAdminPaidPromotionRequests(): Promise<PaidPromotionRequest[]> {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    return await db.collection('paid_promotion_requests')
      .find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .toArray() as unknown as PaidPromotionRequest[];
  }
  return memoryDb.paidPromotionRequests.filter((item) => item.status === 'pending') as PaidPromotionRequest[];
}

export async function activatePaidPromotion(
  admin: AuthenticatedUser,
  requestId: string,
  payload: {
    contentType: 'product' | 'seller';
    contentId: string;
    durationDays: number;
    paidAmount: number;
    homepagePosition?: HomePromotionPosition;
  }
): Promise<PaidPromotionRequest> {
  if (payload.contentType !== 'product' && payload.contentType !== 'seller') {
    throw new Error('نوع المحتوى المختار غير صالح');
  }
  if (!payload.contentId?.trim()) {
    throw new Error('اختر المحتوى المراد ترويجه');
  }
  const homepagePosition = payload.homepagePosition || 'after-reels';
  if (!HOME_PROMOTION_POSITIONS.includes(homepagePosition)) {
    throw new Error('موضع الظهور في الصفحة الرئيسية غير صالح');
  }
  if (!Number.isInteger(payload.durationDays) || payload.durationDays < 1 || payload.durationDays > 365) {
    throw new Error('مدة الاشتراك يجب أن تكون من يوم إلى 365 يومًا');
  }
  if (!Number.isFinite(payload.paidAmount) || payload.paidAmount <= 0) {
    throw new Error('أدخل قيمة الدفع المؤكد بشكل صحيح');
  }

  const { db, isMongo } = await getDatabase();
  const request = isMongo && db
    ? await db.collection('paid_promotion_requests').findOne({ id: requestId, status: 'pending' }) as unknown as PaidPromotionRequest | null
    : memoryDb.paidPromotionRequests.find((item) => item.id === requestId && item.status === 'pending') as PaidPromotionRequest | undefined;
  if (!request) throw new Error('طلب الاشتراك غير موجود أو تمت مراجعته');

  const content = payload.contentType === 'product'
    ? (isMongo && db
      ? await db.collection('products').findOne({ id: payload.contentId, approvalStatus: 'approved' }) as unknown as ProductDocument | null
      : memoryDb.products.find((item) => item.id === payload.contentId && item.approvalStatus === 'approved') as ProductDocument | undefined)
    : await findSeller(payload.contentId);
  if (!content) throw new Error('المحتوى المختار غير موجود أو غير معتمد');
  if (payload.contentType === 'seller' && (content as SellerDocument).status !== 'approved') {
    throw new Error('لا يمكن ترويج ورشة غير معتمدة');
  }

  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + payload.durationDays * 86_400_000);
  const updated: PaidPromotionRequest = {
    ...request,
    status: 'active',
    contentType: payload.contentType,
    contentId: payload.contentId,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    durationDays: payload.durationDays,
    paidAmount: payload.paidAmount,
    homepagePosition,
    paymentConfirmedAt: startsAt.toISOString(),
    paymentConfirmedBy: admin.id,
    updatedAt: startsAt.toISOString()
  };

  const slot = { ...updated, id: 'paid_promotion_slot', requestId };
  if (isMongo && db) {
    await Promise.all([
      db.collection('paid_promotion_requests').updateOne(
        { id: requestId, status: 'pending' },
        { $set: updated }
      ),
      db.collection('platform_settings').updateOne(
        { id: 'paid_promotion_slot' },
        { $set: slot },
        { upsert: true }
      )
    ]);
    await db.collection('paid_promotion_requests').updateMany(
      { id: { $ne: requestId }, status: 'active' },
      { $set: { status: 'expired', updatedAt: startsAt.toISOString() } }
    );
  } else {
    const memoryRequest = memoryDb.paidPromotionRequests.find((item) => item.id === requestId);
    if (memoryRequest) Object.assign(memoryRequest, updated);
    memoryDb.paidPromotionRequests.forEach((item) => {
      if (item.id !== requestId && item.status === 'active') item.status = 'expired';
    });
    memoryDb.paidPromotionSlot = slot;
  }

  await createNotification({
    userId: request.sellerUserId,
    title: 'تم تفعيل مساحة الترويج',
    message: `تم تأكيد اشتراك ورشتك، وسيظهر المحتوى المختار لمدة ${payload.durationDays} يومًا.`,
    type: 'promotion',
    link: 'seller-dashboard',
    metadata: { requestId, endsAt: endsAt.toISOString() }
  });
  return updated;
}

export async function getAdminActivePaidPromotion(): Promise<PaidPromotionContent | null> {
  const { db, isMongo } = await getDatabase();
  const slot = isMongo && db
    ? await db.collection('platform_settings').findOne({ id: 'paid_promotion_slot' })
    : memoryDb.paidPromotionSlot;
  if (!slot || slot.status !== 'active') return null;

  const content = slot.contentType === 'product'
    ? (isMongo && db
      ? await db.collection('products').findOne({ id: slot.contentId }) as unknown as ProductDocument | null
      : memoryDb.products.find((item) => item.id === slot.contentId) as ProductDocument | undefined)
    : await findSeller(slot.contentId);
  if (!content) return null;
  const activeRequest = !slot.requestId && isMongo && db
    ? await db.collection('paid_promotion_requests')
      .findOne({ sellerId: slot.sellerId, status: 'active' }, { sort: { updatedAt: -1 } })
    : !slot.requestId
      ? memoryDb.paidPromotionRequests
        .filter((request) => request.sellerId === slot.sellerId && request.status === 'active')
        .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0]
      : null;
  return {
    contentType: slot.contentType,
    content: content as ProductDocument | SellerDocument,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    homepagePosition: HOME_PROMOTION_POSITIONS.includes(slot.homepagePosition)
      ? slot.homepagePosition
      : 'after-reels',
    requestId: slot.requestId || activeRequest?.id,
    paidAmount: slot.paidAmount,
    durationDays: slot.durationDays
  };
}

export async function updateActivePaidPromotion(
  admin: AuthenticatedUser,
  payload: {
    contentType: 'product' | 'seller';
    contentId: string;
    durationDays: number;
    paidAmount: number;
    homepagePosition: HomePromotionPosition;
  }
): Promise<PaidPromotionRequest> {
  if (payload.contentType !== 'product' && payload.contentType !== 'seller') {
    throw new Error('نوع المحتوى المختار غير صالح');
  }
  if (!payload.contentId?.trim()) throw new Error('اختر المحتوى المراد ترويجه');
  if (!Number.isInteger(payload.durationDays) || payload.durationDays < 1 || payload.durationDays > 365) {
    throw new Error('مدة الاشتراك يجب أن تكون من يوم إلى 365 يومًا');
  }
  if (!Number.isFinite(payload.paidAmount) || payload.paidAmount <= 0) {
    throw new Error('أدخل قيمة الدفع المؤكد بشكل صحيح');
  }
  if (!HOME_PROMOTION_POSITIONS.includes(payload.homepagePosition)) {
    throw new Error('موضع الظهور في الصفحة الرئيسية غير صالح');
  }

  const { db, isMongo } = await getDatabase();
  const slot = isMongo && db
    ? await db.collection('platform_settings').findOne({ id: 'paid_promotion_slot', status: 'active' })
    : memoryDb.paidPromotionSlot?.status === 'active' ? memoryDb.paidPromotionSlot : null;
  if (!slot) throw new Error('لا توجد مساحة ترشيح مفعّلة لتعديلها');
  const activeRequest = !slot.requestId && isMongo && db
    ? await db.collection('paid_promotion_requests')
      .findOne({ sellerId: slot.sellerId, status: 'active' }, { sort: { updatedAt: -1 } })
    : !slot.requestId
      ? memoryDb.paidPromotionRequests
        .filter((request) => request.sellerId === slot.sellerId && request.status === 'active')
        .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0]
      : null;
  const requestId = slot.requestId || activeRequest?.id;

  const content = payload.contentType === 'product'
    ? (isMongo && db
      ? await db.collection('products').findOne({ id: payload.contentId, approvalStatus: 'approved' }) as unknown as ProductDocument | null
      : memoryDb.products.find((item) => item.id === payload.contentId && item.approvalStatus === 'approved') as ProductDocument | undefined)
    : await findSeller(payload.contentId);
  if (!content) throw new Error('المحتوى المختار غير موجود أو غير معتمد');
  if (payload.contentType === 'seller' && (content as SellerDocument).status !== 'approved') {
    throw new Error('لا يمكن ترويج ورشة غير معتمدة');
  }

  const now = new Date();
  const updated: PaidPromotionRequest = {
    id: requestId || slot.id,
    requestId,
    sellerId: slot.sellerId,
    sellerName: slot.sellerName,
    sellerUserId: slot.sellerUserId,
    message: slot.message || '',
    status: 'active',
    createdAt: slot.createdAt || now.toISOString(),
    updatedAt: now.toISOString(),
    contentType: payload.contentType,
    contentId: payload.contentId,
    startsAt: now.toISOString(),
    endsAt: new Date(now.getTime() + payload.durationDays * 86_400_000).toISOString(),
    durationDays: payload.durationDays,
    paidAmount: payload.paidAmount,
    homepagePosition: payload.homepagePosition,
    paymentConfirmedAt: now.toISOString(),
    paymentConfirmedBy: admin.id
  };
  const updatedSlot = { ...updated, id: 'paid_promotion_slot', requestId };
  if (isMongo && db) {
    await db.collection('platform_settings').updateOne({ id: 'paid_promotion_slot' }, { $set: updatedSlot });
    if (requestId) {
      await db.collection('paid_promotion_requests').updateOne({ id: requestId }, { $set: updated });
    }
  } else {
    memoryDb.paidPromotionSlot = updatedSlot;
    const request = memoryDb.paidPromotionRequests.find((item) => item.id === requestId);
    if (request) Object.assign(request, updated);
  }
  return updated;
}

export async function removeActivePaidPromotion(): Promise<void> {
  const { db, isMongo } = await getDatabase();
  const slot = isMongo && db
    ? await db.collection('platform_settings').findOne({ id: 'paid_promotion_slot' })
    : memoryDb.paidPromotionSlot;
  if (!slot) return;
  const activeRequest = !slot.requestId && isMongo && db
    ? await db.collection('paid_promotion_requests')
      .findOne({ sellerId: slot.sellerId, status: 'active' }, { sort: { updatedAt: -1 } })
    : !slot.requestId
      ? memoryDb.paidPromotionRequests
        .filter((request) => request.sellerId === slot.sellerId && request.status === 'active')
        .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0]
      : null;
  const requestId = slot.requestId || activeRequest?.id;
  const updatedAt = new Date().toISOString();
  if (isMongo && db) {
    await db.collection('platform_settings').deleteOne({ id: 'paid_promotion_slot' });
    if (requestId) {
      await db.collection('paid_promotion_requests').updateOne(
        { id: requestId },
        { $set: { status: 'expired', updatedAt } }
      );
    }
  } else {
    memoryDb.paidPromotionSlot = null;
    if (requestId) {
      const request = memoryDb.paidPromotionRequests.find((item) => item.id === requestId);
      if (request) Object.assign(request, { status: 'expired', updatedAt });
    }
  }
}

export async function rejectPaidPromotionRequest(requestId: string): Promise<void> {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    const result = await db.collection('paid_promotion_requests').updateOne(
      { id: requestId, status: 'pending' },
      { $set: { status: 'rejected', updatedAt: new Date().toISOString() } }
    );
    if (!result.matchedCount) throw new Error('طلب الاشتراك غير موجود أو تمت مراجعته');
    return;
  }
  const request = memoryDb.paidPromotionRequests.find((item) => item.id === requestId && item.status === 'pending');
  if (!request) throw new Error('طلب الاشتراك غير موجود أو تمت مراجعته');
  Object.assign(request, { status: 'rejected', updatedAt: new Date().toISOString() });
}

export async function getActivePaidPromotion(): Promise<PaidPromotionContent | null> {
  const { db, isMongo } = await getDatabase();
  const slot = isMongo && db
    ? await db.collection('platform_settings').findOne({ id: 'paid_promotion_slot' })
    : memoryDb.paidPromotionSlot;
  if (!slot || slot.status !== 'active' || !slot.endsAt || new Date(slot.endsAt).getTime() <= Date.now()) {
    return null;
  }
  const content = slot.contentType === 'product'
    ? (isMongo && db
      ? await db.collection('products').findOne({ id: slot.contentId, approvalStatus: 'approved' }) as unknown as ProductDocument | null
      : memoryDb.products.find((item) => item.id === slot.contentId && item.approvalStatus === 'approved') as ProductDocument | undefined)
    : await findSeller(slot.contentId);
  if (
    !content ||
    (slot.contentType === 'seller' && (content as SellerDocument).status !== 'approved')
  ) return null;
  return {
    contentType: slot.contentType,
    content: content as ProductDocument | SellerDocument,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    homepagePosition: HOME_PROMOTION_POSITIONS.includes(slot.homepagePosition)
      ? slot.homepagePosition
      : 'after-reels'
  };
}

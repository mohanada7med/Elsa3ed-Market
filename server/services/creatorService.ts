import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type {
  CreatorDocument,
  CreatorPhotoDocument,
  CreatorStatus,
  ContentStatus,
  CraftReelDocument
} from '../models/types.ts';
import type { AuthenticatedUser } from '../middleware/auth.ts';
import { invalidateAuthSession } from '../middleware/auth.ts';
import { createAuditLog } from './auditService.ts';
import { createNotification } from './notificationService.ts';
import { Logger } from '../utils/logger.ts';
import { extractCloudinaryPublicId, cloudinaryStorage } from './storage/cloudinaryProvider.ts';

/**
 * Submit or update a Creator Application
 */
export async function applyForCreator(
  user: AuthenticatedUser,
  data: {
    name?: string;
    avatar?: string;
    bio: string;
    governorate: string;
    city: string;
    specialties: string[];
    socialLinks?: {
      instagram?: string;
      youtube?: string;
      tiktok?: string;
      facebook?: string;
    };
    phone: string;
    email: string;
  }
): Promise<CreatorDocument> {
  const { db, isMongo } = await getDatabase();
  const now = new Date().toISOString();

  // Validate required fields
  if (!data.bio || data.bio.trim().length < 5) {
    throw new Error('النبذة التعريفية مطلوبة ويجب ألا تقل عن 5 أحرف');
  }
  if (!data.governorate || !data.governorate.trim()) {
    throw new Error('المحافظة مطلوبة');
  }
  if (!data.city || !data.city.trim()) {
    throw new Error('المدينة أو المركز مطلوب');
  }
  if (!data.specialties || !Array.isArray(data.specialties) || data.specialties.length === 0) {
    throw new Error('يرجى اختيار تخصص واحد على الأقل في صناعة المحتوى التراثي');
  }
  if (!data.phone || data.phone.trim().length < 8) {
    throw new Error('رقم الهاتف مطلوب للتواصل');
  }

  // Look for existing creator profile
  let existing: CreatorDocument | null = null;
  if (isMongo && db) {
    try {
      existing = (await db.collection('creators').findOne({
        $or: [{ userId: user.id }, ...(user.creatorId ? [{ id: user.creatorId }] : [])]
      })) as unknown as CreatorDocument | null;
    } catch (e) {
      Logger.error('[CreatorService] Error finding existing creator:', e);
    }
  }
  if (!existing) {
    existing = (memoryDb.creators.find(
      (c) => c.userId === user.id || (user.creatorId && c.id === user.creatorId)
    ) as CreatorDocument) || null;
  }

  if (existing) {
    if (existing.status === 'approved') {
      throw new Error('حسابك معتمد بالفعل كصانع محتوى في منصة وه');
    }
    if (existing.status === 'pending') {
      throw new Error('طلب انضمامك كصانع محتوى قيد المراجعة والاعتماد حالياً من قبل الإدارة');
    }

    // Reapplying after rejection
    const updatePayload: Partial<CreatorDocument> = {
      name: data.name?.trim() || user.name,
      avatar: data.avatar || user.avatar || existing.avatar,
      bio: data.bio.trim(),
      governorate: data.governorate.trim(),
      city: data.city.trim(),
      specialties: data.specialties,
      socialLinks: data.socialLinks || {},
      phone: data.phone.trim(),
      email: data.email?.trim() || user.email || '',
      status: 'pending',
      rejectionReason: null,
      updatedAt: now
    };

    if (isMongo && db) {
      await db.collection('creators').updateOne({ id: existing.id }, { $set: updatePayload });
      await db.collection('users').updateOne(
        { id: user.id },
        { $set: { creatorId: existing.id, creatorStatus: 'pending', role: 'creator', updatedAt: now } }
      );
    }
    Object.assign(existing, updatePayload);

    const memUser = memoryDb.users.find((u) => u.id === user.id);
    if (memUser) {
      (memUser as any).creatorId = existing.id;
      (memUser as any).creatorStatus = 'pending';
      (memUser as any).role = 'creator';
    }

    invalidateAuthSession(user.id);

    await createAuditLog({
      actorId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'إعادة تقديم طلب صانع محتوى',
      resource: 'creators',
      resourceId: existing.id,
      status: 'نجاح',
      details: `قام المستخدم (${user.name}) بإعادة تقديم طلب الانضمام كصانع محتوى بعد التعديل`
    });

    await notifyAdminsOnCreatorRequest({
      userId: user.id,
      userName: user.name,
      governorate: data.governorate,
      isReapply: true
    });

    return existing;
  }

  // Create brand new creator application
  const creatorId = `creator-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newCreator: CreatorDocument = {
    id: creatorId,
    userId: user.id,
    name: data.name?.trim() || user.name,
    avatar: data.avatar || user.avatar || '',
    bio: data.bio.trim(),
    governorate: data.governorate.trim(),
    city: data.city.trim(),
    specialties: data.specialties,
    socialLinks: data.socialLinks || {},
    phone: data.phone.trim(),
    email: data.email?.trim() || user.email || '',
    status: 'pending',
    verified: false,
    stats: {
      reelsCount: 0,
      photosCount: 0,
      viewsCount: 0,
      likesCount: 0
    },
    createdAt: now,
    updatedAt: now
  };

  if (isMongo && db) {
    await db.collection('creators').insertOne(newCreator as any);
    await db.collection('users').updateOne(
      { id: user.id },
      { $set: { creatorId, creatorStatus: 'pending', role: 'creator', updatedAt: now } }
    );
  }
  memoryDb.creators.push(newCreator as any);

  const memUser = memoryDb.users.find((u) => u.id === user.id);
  if (memUser) {
    (memUser as any).creatorId = creatorId;
    (memUser as any).creatorStatus = 'pending';
    (memUser as any).role = 'creator';
  }

  invalidateAuthSession(user.id);

  await createAuditLog({
    actorId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'تقديم طلب صانع محتوى جديد',
    resource: 'creators',
    resourceId: creatorId,
    status: 'نجاح',
    details: `قام المستخدم (${user.name}) بتقديم طلب جديد للانضمام كصانع محتوى في محافظة ${data.governorate}`
  });

  await notifyAdminsOnCreatorRequest({
    userId: user.id,
    userName: user.name,
    governorate: data.governorate,
    isReapply: false
  });

  return newCreator;
}

/**
 * Notify all admins of a new creator application
 */
export async function notifyAdminsOnCreatorRequest(params: {
  userId: string;
  userName: string;
  governorate: string;
  isReapply: boolean;
}) {
  try {
    const { db, isMongo } = await getDatabase();
    let adminUsers: any[] = [];
    if (isMongo && db) {
      adminUsers = await db.collection('users').find({ role: 'admin' }).toArray();
    } else {
      adminUsers = memoryDb.users.filter((u) => u.role === 'admin');
    }

    const title = params.isReapply
      ? 'إعادة تقديم طلب صانع محتوى'
      : 'طلب انضمام صانع محتوى جديد';
    const message = `قدّم ${params.userName} من محافظة ${params.governorate} طلباً جديداً للاعتماد كصانع محتوى تراثي في منصة وه.`;

    for (const admin of adminUsers) {
      await createNotification({
        userId: admin.id,
        recipientRole: 'admin',
        title,
        message,
        type: 'system_alert',
        actionPage: 'admin-creators',
        metadata: { applicantUserId: params.userId }
      }).catch(() => {});
    }
  } catch (err) {
    Logger.warn('[CreatorService] Failed to notify admins of creator request:', err);
  }
}

/**
 * Notify all admins when a creator submits or resubmits content for moderation
 */
export async function notifyAdminsOnPendingContent(params: {
  contentType: 'reel' | 'photo';
  contentId: string;
  title: string;
  creatorName: string;
  creatorId: string;
  isResubmit?: boolean;
}) {
  try {
    const { db, isMongo } = await getDatabase();
    let adminUsers: any[] = [];
    if (isMongo && db) {
      adminUsers = await db.collection('users').find({ role: 'admin' }).toArray();
    } else {
      adminUsers = memoryDb.users.filter((u) => u.role === 'admin');
    }

    const isReel = params.contentType === 'reel';
    const notifTitle = params.isResubmit
      ? isReel ? 'إعادة مراجعة فيديو ريلز معدّل' : 'إعادة مراجعة معرض صور معدّل'
      : isReel ? 'فيديو ريلز جديد بانتظار الاعتماد' : 'معرض صور جديد بانتظار الاعتماد';
    const notifMsg = isReel
      ? `أرسل صانع المحتوى "${params.creatorName}" فيديو "${params.title}" للمراجعة والاعتماد.`
      : `أرسل صانع المحتوى "${params.creatorName}" معرض صور "${params.title}" للمراجعة والاعتماد.`;

    for (const admin of adminUsers) {
      await createNotification({
        userId: admin.id,
        recipientRole: 'admin',
        title: notifTitle,
        message: notifMsg,
        type: 'system_alert',
        actionPage: 'admin-creators',
        metadata: {
          contentType: params.contentType,
          contentId: params.contentId,
          creatorId: params.creatorId
        }
      }).catch(() => {});
    }
  } catch (err) {
    Logger.warn('[CreatorService] Failed to notify admins of pending creator content:', err);
  }
}

/**
 * Get Creator profile by creatorId or userId
 */
export async function getCreatorProfile(idOrUserId: string): Promise<CreatorDocument | null> {
  const { db, isMongo } = await getDatabase();
  let creator: CreatorDocument | null = null;
  if (isMongo && db) {
    try {
      creator = (await db.collection('creators').findOne({
        $or: [{ id: idOrUserId }, { userId: idOrUserId }]
      })) as unknown as CreatorDocument | null;
    } catch (e) {
      Logger.error('[CreatorService] getCreatorProfile error:', e);
    }
  }
  if (!creator) {
    creator =
      (memoryDb.creators.find((c) => c.id === idOrUserId || c.userId === idOrUserId) as CreatorDocument) ||
      null;
  }
  return creator;
}

/**
 * Compute & persist Creator aggregate stats (reelsCount, photosCount, viewsCount, likesCount)
 */
export async function syncCreatorStats(creatorId?: string | null): Promise<void> {
  if (!creatorId) return;
  try {
    const creator = await getCreatorProfile(creatorId);
    if (!creator) return;

    const { db, isMongo } = await getDatabase();
    let reels: CraftReelDocument[] = [];
    let photos: CreatorPhotoDocument[] = [];

    const idCandidates = Array.from(new Set([creator.id, creator.userId].filter(Boolean)));

    if (isMongo && db) {
      reels = (await db
        .collection<CraftReelDocument>('reels')
        .find({
          $and: [
            {
              $or: [
                { creatorId: { $in: idCandidates } },
                { sellerId: { $in: idCandidates } }
              ]
            },
            { $or: [{ status: 'approved' }, { status: { $exists: false } }] }
          ]
        })
        .toArray()) as any[];

      photos = (await db
        .collection<CreatorPhotoDocument>('creator_photos')
        .find({
          creatorId: { $in: idCandidates },
          status: 'approved'
        })
        .toArray()) as any[];
    } else {
      reels = memoryDb.reels.filter(
        (r) =>
          (idCandidates.includes(r.creatorId || '') || idCandidates.includes(r.sellerId || '')) &&
          (!r.status || r.status === 'approved')
      );
      photos = memoryDb.creatorPhotos.filter(
        (p) => idCandidates.includes(p.creatorId) && p.status === 'approved'
      );
    }

    const nextStats = {
      reelsCount: reels.length,
      photosCount: photos.length,
      viewsCount:
        reels.reduce((sum, r) => sum + (r.viewsCount || 0), 0) +
        photos.reduce((sum, p) => sum + (p.viewsCount || 0), 0),
      likesCount:
        reels.reduce((sum, r) => sum + (r.likesCount || 0), 0) +
        photos.reduce((sum, p) => sum + (p.likesCount || 0), 0)
    };

    if (isMongo && db) {
      await db.collection('creators').updateOne({ id: creator.id }, { $set: { stats: nextStats } });
    }
    const memCreator = memoryDb.creators.find((c) => c.id === creator.id);
    if (memCreator) {
      (memCreator as any).stats = nextStats;
    }
  } catch (err) {
    Logger.warn('[CreatorService] Failed to sync creator stats:', err);
  }
}

/**
 * Returns IDs (both creator.id and creator.userId) of creators whose status is NOT 'approved'
 * so public feeds automatically hide suspended/rejected/pending creator content.
 */
export async function getInactiveCreatorIds(): Promise<Set<string>> {
  const inactiveIds = new Set<string>();
  try {
    const { db, isMongo } = await getDatabase();
    let inactiveCreators: any[] = [];
    if (isMongo && db) {
      inactiveCreators = await db
        .collection('creators')
        .find({ status: { $ne: 'approved' } }, { projection: { id: 1, userId: 1 } })
        .toArray();
    } else {
      inactiveCreators = memoryDb.creators.filter((c) => c.status !== 'approved');
    }
    for (const c of inactiveCreators) {
      if (c.id) inactiveIds.add(String(c.id));
      if (c.userId) inactiveIds.add(String(c.userId));
    }
  } catch (err) {
    Logger.warn('[CreatorService] Failed to query inactive creator IDs:', err);
  }
  return inactiveIds;
}

/**
 * Update Creator Profile (by creator themselves)
 */
export async function updateCreatorProfile(
  user: AuthenticatedUser,
  updates: {
    avatar?: string;
    bio?: string;
    governorate?: string;
    city?: string;
    specialties?: string[];
    socialLinks?: {
      instagram?: string;
      youtube?: string;
      tiktok?: string;
      facebook?: string;
    };
    phone?: string;
    email?: string;
  }
): Promise<CreatorDocument> {
  const creator = await getCreatorProfile(user.creatorId || user.id);
  if (!creator) {
    throw new Error('ملف صانع المحتوى غير موجود');
  }

  // Security: only creator themselves or admin can update
  if (user.role !== 'admin' && creator.userId !== user.id && creator.id !== user.creatorId) {
    throw new Error('غير مصرح لك بتعديل بيانات هذا الحساب');
  }

  const { db, isMongo } = await getDatabase();
  const now = new Date().toISOString();

  const updateData: Partial<CreatorDocument> = {
    updatedAt: now
  };

  if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
  if (updates.bio !== undefined) updateData.bio = updates.bio.trim();
  if (updates.governorate !== undefined) updateData.governorate = updates.governorate.trim();
  if (updates.city !== undefined) updateData.city = updates.city.trim();
  if (updates.specialties !== undefined && Array.isArray(updates.specialties)) {
    updateData.specialties = updates.specialties;
  }
  if (updates.socialLinks !== undefined) updateData.socialLinks = updates.socialLinks;
  if (updates.phone !== undefined) updateData.phone = updates.phone.trim();
  if (updates.email !== undefined) updateData.email = updates.email.trim();

  if (isMongo && db) {
    await db.collection('creators').updateOne({ id: creator.id }, { $set: updateData });
    if (updates.avatar) {
      await db.collection('users').updateOne({ id: creator.userId }, { $set: { avatar: updates.avatar } });
    }
  }
  Object.assign(creator, updateData);

  const memUser = memoryDb.users.find((u) => u.id === creator.userId);
  if (memUser && updates.avatar) {
    memUser.avatar = updates.avatar;
  }

  invalidateAuthSession(creator.userId);

  return creator;
}

/**
 * Public Creator Profile with approved content only
 */
export async function getPublicCreatorProfile(creatorId: string): Promise<{
  creator: Omit<CreatorDocument, 'phone' | 'email' | 'rejectionReason' | 'suspensionReason'>;
  reels: CraftReelDocument[];
  photos: CreatorPhotoDocument[];
  stats: {
    reelsCount: number;
    photosCount: number;
    viewsCount: number;
    likesCount: number;
  };
} | null> {
  const creator = await getCreatorProfile(creatorId);
  if (!creator) return null;

  // Only approved creators have public profiles unless previewing by creator
  if (creator.status !== 'approved') {
    return null;
  }

  const { db, isMongo } = await getDatabase();
  let reels: CraftReelDocument[] = [];
  let photos: CreatorPhotoDocument[] = [];

  // Query ONLY approved content
  if (isMongo && db) {
    try {
      reels = (await db
        .collection<CraftReelDocument>('reels')
        .find({
          $and: [
            { $or: [{ creatorId: creator.id }, { sellerId: creator.id }, { sellerId: creator.userId }] },
            { $or: [{ status: 'approved' }, { status: { $exists: false } }] }
          ]
        })
        .sort({ createdAt: -1 })
        .toArray()) as any[];

      photos = (await db
        .collection<CreatorPhotoDocument>('creator_photos')
        .find({
          creatorId: creator.id,
          status: 'approved'
        })
        .sort({ createdAt: -1 })
        .toArray()) as any[];
    } catch (e) {
      Logger.error('[CreatorService] Public content query error:', e);
    }
  } else {
    reels = memoryDb.reels.filter(
      (r) =>
        (r.creatorId === creator.id || r.sellerId === creator.id || r.sellerId === creator.userId) &&
        (!r.status || r.status === 'approved')
    );
    photos = memoryDb.creatorPhotos.filter((p) => p.creatorId === creator.id && p.status === 'approved');
  }

  const totalViews =
    reels.reduce((sum, r) => sum + (r.viewsCount || 0), 0) +
    photos.reduce((sum, p) => sum + (p.viewsCount || 0), 0);

  const totalLikes =
    reels.reduce((sum, r) => sum + (r.likesCount || 0), 0) +
    photos.reduce((sum, p) => sum + (p.likesCount || 0), 0);

  // Sanitized public creator object
  const publicCreator = {
    id: creator.id,
    userId: creator.userId,
    name: creator.name,
    avatar: creator.avatar,
    bio: creator.bio,
    governorate: creator.governorate,
    city: creator.city,
    specialties: creator.specialties,
    socialLinks: creator.socialLinks,
    status: creator.status,
    verified: Boolean(creator.verified),
    createdAt: creator.createdAt
  };

  const computedStats = {
    reelsCount: reels.length,
    photosCount: photos.length,
    viewsCount: totalViews,
    likesCount: totalLikes
  };

  return {
    creator: publicCreator as any,
    reels,
    photos,
    stats: computedStats
  };
}

/**
 * List Public Creators (Only APPROVED)
 */
export async function listPublicCreators(filters?: {
  governorate?: string;
  specialty?: string;
  search?: string;
  verifiedOnly?: boolean;
}): Promise<CreatorDocument[]> {
  const { db, isMongo } = await getDatabase();
  let creators: CreatorDocument[] = [];

  const query: any = { status: 'approved' };
  if (filters?.governorate && filters.governorate !== 'all') {
    query.governorate = filters.governorate;
  }
  if (filters?.specialty && filters.specialty !== 'all') {
    query.specialties = filters.specialty;
  }
  if (filters?.verifiedOnly) {
    query.verified = true;
  }
  if (filters?.search && filters.search.trim()) {
    const regex = new RegExp(filters.search.trim(), 'i');
    query.$or = [{ name: regex }, { bio: regex }, { city: regex }, { governorate: regex }];
  }

  if (isMongo && db) {
    try {
      creators = (await db
        .collection('creators')
        .find(query)
        .sort({ verified: -1, 'stats.viewsCount': -1, createdAt: -1 })
        .toArray()) as unknown as CreatorDocument[];
    } catch (e) {
      Logger.error('[CreatorService] listPublicCreators error:', e);
    }
  } else {
    creators = memoryDb.creators.filter((c) => {
      if (c.status !== 'approved') return false;
      if (filters?.governorate && filters.governorate !== 'all' && c.governorate !== filters.governorate) return false;
      if (filters?.specialty && filters.specialty !== 'all' && !c.specialties?.includes(filters.specialty)) return false;
      if (filters?.verifiedOnly && !c.verified) return false;
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.bio?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }

  return creators;
}

/**
 * Admin: List all Creators with status filter and search
 */
export async function adminListCreators(filters?: {
  status?: string;
  search?: string;
}): Promise<CreatorDocument[]> {
  const { db, isMongo } = await getDatabase();
  const query: any = {};
  if (filters?.status && filters.status !== 'all') {
    query.status = filters.status;
  }
  if (filters?.search && filters.search.trim()) {
    const regex = new RegExp(filters.search.trim(), 'i');
    query.$or = [{ name: regex }, { bio: regex }, { phone: regex }, { email: regex }, { governorate: regex }];
  }

  if (isMongo && db) {
    return (await db
      .collection('creators')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()) as unknown as CreatorDocument[];
  }

  return memoryDb.creators.filter((c) => {
    if (filters?.status && filters.status !== 'all' && c.status !== filters.status) return false;
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      if (
        !c.name.toLowerCase().includes(q) &&
        !c.phone?.toLowerCase().includes(q) &&
        !c.email?.toLowerCase().includes(q) &&
        !c.governorate?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Admin: Update Creator Status (Approve, Reject with reason, Suspend, Reactivate)
 */
export async function adminUpdateCreatorStatus(
  adminUser: AuthenticatedUser,
  creatorId: string,
  status: CreatorStatus,
  reason?: string
): Promise<CreatorDocument> {
  if (adminUser.role !== 'admin') {
    throw new Error('صلاحية إدارة صناع المحتوى لمديري المنصة فقط');
  }

  const creator = await getCreatorProfile(creatorId);
  if (!creator) {
    throw new Error('بيانات صانع المحتوى غير موجودة');
  }

  const now = new Date().toISOString();
  const updatePayload: Partial<CreatorDocument> = {
    status,
    updatedAt: now
  };

  if (status === 'approved') {
    updatePayload.approvedAt = now;
    updatePayload.approvedBy = adminUser.name;
    updatePayload.rejectionReason = null;
    updatePayload.suspensionReason = null;
  } else if (status === 'rejected') {
    updatePayload.rejectedAt = now;
    updatePayload.rejectedBy = adminUser.name;
    updatePayload.rejectionReason = reason?.trim() || 'لم يستوفِ الطلب معايير صناعة المحتوى التراثي المعتمدة';
  } else if (status === 'suspended') {
    updatePayload.suspendedAt = now;
    updatePayload.suspendedBy = adminUser.name;
    updatePayload.suspensionReason = reason?.trim() || 'تم تعليق الحساب لمخالفة سياسات التوثيق والنشر بالمنصة';
  }

  const { db, isMongo } = await getDatabase();
  const userUpdates: any = {
    creatorStatus: status,
    updatedAt: now
  };

  if (status === 'approved') {
    userUpdates.role = 'creator';
    userUpdates.creatorId = creator.id;
  }

  if (isMongo && db) {
    await db.collection('creators').updateOne({ id: creator.id }, { $set: updatePayload });
    await db.collection('users').updateOne({ id: creator.userId }, { $set: userUpdates });
  }
  Object.assign(creator, updatePayload);

  const memUser = memoryDb.users.find((u) => u.id === creator.userId);
  if (memUser) {
    (memUser as any).creatorStatus = status;
    if (status === 'approved') {
      (memUser as any).role = 'creator';
      (memUser as any).creatorId = creator.id;
    }
  }

  invalidateAuthSession(creator.userId);

  // Send Notification to Creator
  try {
    let notifTitle = '';
    let notifMsg = '';
    if (status === 'approved') {
      notifTitle = 'تهانينا! تم اعتماد حسابك كصانع محتوى في وه';
      notifMsg = 'تمت الموافقة على طلب انضمامك. يمكنك الآن نشر الريلز والمعارض التراثية عبر استوديو المحتوى.';
    } else if (status === 'rejected') {
      notifTitle = 'تحديث بشأن طلب صانع المحتوى';
      notifMsg = `عفواً، لم يتم قبول طلبك للسبب التالي: ${updatePayload.rejectionReason}. يمكنك تعديل بياناتك وإعادة التقديم.`;
    } else if (status === 'suspended') {
      notifTitle = 'تنبيه: تم تعليق حساب صانع المحتوى';
      notifMsg = `تم إيقاف حساب صانع المحتوى الخاص بك للسبب: ${updatePayload.suspensionReason}`;
    }

    if (notifTitle) {
      await createNotification({
        userId: creator.userId,
        recipientRole: 'all',
        title: notifTitle,
        message: notifMsg,
        type: 'account',
        actionPage: 'creator-dashboard'
      });
    }
  } catch (err) {
    Logger.warn('[CreatorService] Failed to send status notification:', err);
  }

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: adminUser.role,
    action: `تحديث حالة صانع المحتوى إلى (${status})`,
    resource: 'creators',
    resourceId: creator.id,
    status: 'نجاح',
    details: `قام المدير (${adminUser.name}) بتغيير حالة الصانع (${creator.name}) إلى (${status}). ${reason ? 'السبب: ' + reason : ''}`
  });

  return creator;
}

/**
 * Admin: Toggle Verified Badge for Creator
 */
export async function adminToggleCreatorVerification(
  adminUser: AuthenticatedUser,
  creatorId: string,
  verified: boolean
): Promise<CreatorDocument> {
  if (adminUser.role !== 'admin') {
    throw new Error('منح وتوثيق الشارة مخصص لمديري المنصة فقط');
  }

  const creator = await getCreatorProfile(creatorId);
  if (!creator) {
    throw new Error('بيانات صانع المحتوى غير موجودة');
  }

  const now = new Date().toISOString();
  const { db, isMongo } = await getDatabase();

  if (isMongo && db) {
    await db.collection('creators').updateOne({ id: creator.id }, { $set: { verified, updatedAt: now } });
  }
  creator.verified = verified;
  creator.updatedAt = now;

  invalidateAuthSession(creator.userId);

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: adminUser.role,
    action: verified ? 'منح شارة التوثيق لصانع المحتوى' : 'إلغاء توثيق صانع المحتوى',
    resource: 'creators',
    resourceId: creator.id,
    status: 'نجاح',
    details: `قام المدير (${adminUser.name}) بـ ${verified ? 'توثيق' : 'إلغاء توثيق'} حساب الصانع (${creator.name})`
  });

  return creator;
}

/* ========================================================================= */
/*                          PHOTO PUBLISHING SYSTEM                          */
/* ========================================================================= */

/**
 * Create a new Creator Photo Post
 */
export async function createCreatorPhoto(
  user: AuthenticatedUser,
  data: {
    title: string;
    caption: string;
    images: string[];
    category: string;
    governorate: string;
    location?: string;
    tags?: string[];
    status?: ContentStatus;
  }
): Promise<CreatorPhotoDocument> {
  if (user.role !== 'creator' && user.role !== 'admin') {
    throw new Error('نشر معارض الصور متاح لصناع المحتوى المعتمدين وإدارة المنصة فقط');
  }

  if (user.role === 'creator' && user.creatorStatus !== 'approved') {
    throw new Error('حسابك كصانع محتوى غير معتمد للنشر حالياً');
  }

  if (!data.title || !data.title.trim()) {
    throw new Error('عنوان معرض الصور مطلوب');
  }
  if (!data.caption || !data.caption.trim()) {
    throw new Error('وصف أو قصة الصور مطلوبة');
  }
  if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
    throw new Error('يرجى رفع صورة واحدة على الأقل');
  }

  const now = new Date().toISOString();
  const photoId = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const creatorId = user.creatorId || user.id;

  // Approved creators and admins publish directly; drafts stay as 'draft'
  const initialStatus: ContentStatus =
    data.status === 'draft' ? 'draft' : 'approved';

  const newPhoto: CreatorPhotoDocument = {
    id: photoId,
    creatorId,
    creatorName: user.name,
    creatorAvatar: user.avatar,
    creatorGovernorate: data.governorate || user.governorate || 'الصعيد',
    title: data.title.trim(),
    caption: data.caption.trim(),
    images: data.images,
    category: data.category || 'heritage',
    governorate: data.governorate || user.governorate || 'الصعيد',
    location: data.location?.trim() || data.governorate || 'صعيد مصر',
    tags: Array.isArray(data.tags) ? data.tags : ['#تراث_الصعيد', '#وه_عدسة'],
    likesCount: 0,
    viewsCount: 1,
    status: initialStatus,
    submittedAt: now,
    approvedAt: initialStatus === 'approved' ? now : undefined,
    approvedBy: initialStatus === 'approved' ? user.name : undefined,
    createdAt: now,
    updatedAt: now
  };

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    await db.collection('creator_photos').insertOne(newPhoto as any);
  }
  memoryDb.creatorPhotos.unshift(newPhoto as any);

  await createAuditLog({
    actorId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'إضافة منشور صور جديد',
    resource: 'creator_photos',
    resourceId: photoId,
    status: 'نجاح',
    details: `تم إضافة معرض الصور "${newPhoto.title}" بواسطة ${user.name} بالحالة (${initialStatus})`
  });

  if (initialStatus === 'approved') {
    await syncCreatorStats(creatorId);
  }

  return newPhoto;
}

/**
 * Update Creator Photo (Creator edits their own; triggers re-moderation if approved/rejected)
 */
export async function updateCreatorPhoto(
  user: AuthenticatedUser,
  photoId: string,
  data: Partial<CreatorPhotoDocument>
): Promise<CreatorPhotoDocument> {
  const { db, isMongo } = await getDatabase();
  let photo: CreatorPhotoDocument | null = null;

  if (isMongo && db) {
    photo = (await db.collection('creator_photos').findOne({ id: photoId })) as unknown as CreatorPhotoDocument | null;
  }
  if (!photo) {
    photo = (memoryDb.creatorPhotos.find((p) => p.id === photoId) as CreatorPhotoDocument) || null;
  }

  if (!photo) {
    throw new Error('منشور الصور غير موجود');
  }

  // Ownership check
  const creatorId = user.creatorId || user.id;
  if (user.role !== 'admin' && photo.creatorId !== creatorId && photo.creatorId !== user.id) {
    throw new Error('غير مصرح لك بتعديل صور صانع آخر');
  }

  const now = new Date().toISOString();
  const updatePayload: Partial<CreatorPhotoDocument> = {
    updatedAt: now
  };

  if (data.title !== undefined) updatePayload.title = data.title.trim();
  if (data.caption !== undefined) updatePayload.caption = data.caption.trim();
  if (data.images !== undefined && Array.isArray(data.images) && data.images.length > 0) {
    updatePayload.images = data.images;
  }
  if (data.category !== undefined) updatePayload.category = data.category;
  if (data.governorate !== undefined) updatePayload.governorate = data.governorate;
  if (data.location !== undefined) updatePayload.location = data.location;
  if (data.tags !== undefined) updatePayload.tags = data.tags;

  // If editing a previously rejected item, resubmit to 'pending'; keep 'approved' items published live
  if (user.role !== 'admin') {
    if (photo.status === 'rejected') {
      updatePayload.status = 'pending';
      updatePayload.rejectionReason = null;
      updatePayload.submittedAt = now;
    } else if (data.status === 'draft' || data.status === 'approved') {
      updatePayload.status = data.status;
    }
  } else if (data.status) {
    updatePayload.status = data.status;
  }

  if (isMongo && db) {
    await db.collection('creator_photos').updateOne({ id: photoId }, { $set: updatePayload });
  }
  Object.assign(photo, updatePayload);

  if (user.role !== 'admin' && updatePayload.status === 'pending') {
    await notifyAdminsOnPendingContent({
      contentType: 'photo',
      contentId: photoId,
      title: photo.title,
      creatorName: user.name,
      creatorId,
      isResubmit: true
    });
  }

  await syncCreatorStats(photo.creatorId);

  return photo;
}

/**
 * Delete Creator Photo
 */
export async function deleteCreatorPhoto(user: AuthenticatedUser, photoId: string): Promise<boolean> {
  const { db, isMongo } = await getDatabase();
  let photo: CreatorPhotoDocument | null = null;

  if (isMongo && db) {
    photo = (await db.collection('creator_photos').findOne({ id: photoId })) as unknown as CreatorPhotoDocument | null;
  }
  if (!photo) {
    photo = (memoryDb.creatorPhotos.find((p) => p.id === photoId) as CreatorPhotoDocument) || null;
  }

  if (!photo) {
    throw new Error('منشور الصور غير موجود');
  }

  const creatorId = user.creatorId || user.id;
  if (user.role !== 'admin' && photo.creatorId !== creatorId && photo.creatorId !== user.id) {
    throw new Error('غير مصرح لك بحذف هذا المنشور');
  }

  if (Array.isArray(photo.images)) {
    for (const imgUrl of photo.images) {
      const publicId = extractCloudinaryPublicId(imgUrl);
      if (publicId) {
        cloudinaryStorage
          .delete(publicId, {
            id: user.id,
            role: user.role,
            creatorId: user.creatorId
          })
          .catch(() => {});
      }
    }
  }

  if (isMongo && db) {
    await db.collection('creator_photos').deleteOne({ id: photoId });
  }
  const idx = memoryDb.creatorPhotos.findIndex((p) => p.id === photoId);
  if (idx !== -1) {
    memoryDb.creatorPhotos.splice(idx, 1);
  }

  await createAuditLog({
    actorId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'حذف منشور صور',
    resource: 'creator_photos',
    resourceId: photoId,
    status: 'نجاح',
    details: `تم حذف منشور الصور "${photo.title}" بواسطة ${user.name}`
  });

  await syncCreatorStats(photo.creatorId);

  return true;
}

/**
 * Get Creator's own photos (all statuses)
 */
export async function getCreatorOwnPhotos(
  creatorId: string,
  filters?: { status?: string }
): Promise<CreatorPhotoDocument[]> {
  const { db, isMongo } = await getDatabase();
  const query: any = { creatorId };
  if (filters?.status && filters.status !== 'all') {
    query.status = filters.status;
  }

  if (isMongo && db) {
    return (await db
      .collection<CreatorPhotoDocument>('creator_photos')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()) as any[];
  }

  return memoryDb.creatorPhotos.filter((p) => {
    if (p.creatorId !== creatorId) return false;
    if (filters?.status && filters.status !== 'all' && p.status !== filters.status) return false;
    return true;
  });
}

/**
 * Public Feed of Photos (ONLY APPROVED)
 */
export async function getPublicPhotos(filters?: {
  category?: string;
  governorate?: string;
  search?: string;
  limit?: number;
}): Promise<CreatorPhotoDocument[]> {
  const { db, isMongo } = await getDatabase();
  const inactiveIds = await getInactiveCreatorIds();
  const query: any = { status: 'approved' };

  if (inactiveIds.size > 0) {
    query.creatorId = { $nin: Array.from(inactiveIds) };
  }
  if (filters?.category && filters.category !== 'all') {
    query.category = filters.category;
  }
  if (filters?.governorate && filters.governorate !== 'all') {
    query.governorate = filters.governorate;
  }
  if (filters?.search && filters.search.trim()) {
    const regex = new RegExp(filters.search.trim(), 'i');
    query.$or = [{ title: regex }, { caption: regex }, { location: regex }, { tags: regex }, { creatorName: regex }];
  }

  const max = Number(filters?.limit) || 50;

  if (isMongo && db) {
    return (await db
      .collection<CreatorPhotoDocument>('creator_photos')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(max)
      .toArray()) as any[];
  }

  return memoryDb.creatorPhotos
    .filter((p) => {
      if (p.status !== 'approved') return false;
      if (inactiveIds.has(p.creatorId)) return false;
      if (filters?.category && filters.category !== 'all' && p.category !== filters.category) return false;
      if (filters?.governorate && filters.governorate !== 'all' && p.governorate !== filters.governorate) return false;
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.caption.toLowerCase().includes(q) &&
          !(p.creatorName || '').toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    })
    .slice(0, max);
}

/* ========================================================================= */
/*                          CONTENT MODERATION                               */
/* ========================================================================= */

/**
 * Admin: List All Content Pending Review (Reels and Photos)
 */
export async function adminListPendingContent(): Promise<{
  reels: CraftReelDocument[];
  photos: CreatorPhotoDocument[];
  totalCount: number;
}> {
  const { db, isMongo } = await getDatabase();
  let reels: CraftReelDocument[] = [];
  let photos: CreatorPhotoDocument[] = [];

  if (isMongo && db) {
    reels = (await db
      .collection<CraftReelDocument>('reels')
      .find({ status: 'pending' })
      .sort({ submittedAt: -1, createdAt: -1 })
      .toArray()) as any[];

    photos = (await db
      .collection<CreatorPhotoDocument>('creator_photos')
      .find({ status: 'pending' })
      .sort({ submittedAt: -1, createdAt: -1 })
      .toArray()) as any[];
  } else {
    reels = memoryDb.reels.filter((r) => r.status === 'pending');
    photos = memoryDb.creatorPhotos.filter((p) => p.status === 'pending');
  }

  return {
    reels,
    photos,
    totalCount: reels.length + photos.length
  };
}

/**
 * Admin: Moderate a Reel (Approve or Reject with reason)
 */
export async function adminModerateReel(
  adminUser: AuthenticatedUser,
  reelId: string,
  action: 'approve' | 'reject',
  reason?: string
): Promise<CraftReelDocument> {
  if (adminUser.role !== 'admin') {
    throw new Error('اعتماد ورفض الفيديوهات مخصص لمديري المنصة فقط');
  }

  const { db, isMongo } = await getDatabase();
  let reel: CraftReelDocument | null = null;

  if (isMongo && db) {
    reel = (await db.collection<CraftReelDocument>('reels').findOne({ id: reelId })) as any;
  }
  if (!reel) {
    reel = memoryDb.reels.find((r) => r.id === reelId) || null;
  }

  if (!reel) {
    throw new Error('مقطع الفيديو غير موجود');
  }

  const now = new Date().toISOString();
  const newStatus: ContentStatus = action === 'approve' ? 'approved' : 'rejected';
  const updatePayload: Partial<CraftReelDocument> = {
    status: newStatus,
    updatedAt: now
  };

  if (action === 'approve') {
    updatePayload.approvedAt = now;
    updatePayload.approvedBy = adminUser.name;
    updatePayload.rejectionReason = null;
  } else {
    updatePayload.rejectedAt = now;
    updatePayload.rejectedBy = adminUser.name;
    updatePayload.rejectionReason = reason?.trim() || 'لم يستوفِ الفيديو المعايير التراثية والتوثيقية المعتمدة';
  }

  if (isMongo && db) {
    await db.collection('reels').updateOne({ id: reelId }, { $set: updatePayload });
  }
  Object.assign(reel, updatePayload);

  // Notify Creator
  const targetCreatorId = reel.creatorId || reel.sellerId;
  if (targetCreatorId) {
    try {
      const creator = await getCreatorProfile(targetCreatorId);
      const recipientUserId = creator ? creator.userId : targetCreatorId;
      await createNotification({
        userId: recipientUserId,
        recipientRole: 'all',
        title: action === 'approve' ? 'تمت الموافقة على نشر الفيديو' : 'تم رفض مقطع الفيديو',
        message:
          action === 'approve'
            ? `تم اعتماد فيديو "${reel.title}" بنجاح وأصبح متاحاً للجمهور في وه Reels.`
            : `لم تتم الموافقة على فيديو "${reel.title}". السبب: ${updatePayload.rejectionReason}. يمكنك تعديل الفيديو وإعادة تقديمه.`,
        type: 'system_alert',
        actionPage: 'creator-reels'
      });
    } catch (err) {
      Logger.warn('[CreatorService] Failed to notify creator of reel moderation:', err);
    }
  }

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: adminUser.role,
    action: action === 'approve' ? 'اعتماد فيديو ريلز' : 'رفض فيديو ريلز',
    resource: 'reels',
    resourceId: reelId,
    status: 'نجاح',
    details: `قام المدير (${adminUser.name}) بـ ${action === 'approve' ? 'اعتماد' : 'رفض'} الفيديو "${reel.title}". ${reason ? 'السبب: ' + reason : ''}`
  });

  if (targetCreatorId) {
    syncCreatorStats(targetCreatorId).catch(() => {});
  }

  return reel;
}

/**
 * Admin: Moderate a Photo Post (Approve or Reject with reason)
 */
export async function adminModeratePhoto(
  adminUser: AuthenticatedUser,
  photoId: string,
  action: 'approve' | 'reject',
  reason?: string
): Promise<CreatorPhotoDocument> {
  if (adminUser.role !== 'admin') {
    throw new Error('اعتماد ورفض الصور مخصص لمديري المنصة فقط');
  }

  const { db, isMongo } = await getDatabase();
  let photo: CreatorPhotoDocument | null = null;

  if (isMongo && db) {
    photo = (await db.collection('creator_photos').findOne({ id: photoId })) as any;
  }
  if (!photo) {
    photo = (memoryDb.creatorPhotos.find((p) => p.id === photoId) as any) || null;
  }

  if (!photo) {
    throw new Error('منشور الصور غير موجود');
  }

  const now = new Date().toISOString();
  const newStatus: ContentStatus = action === 'approve' ? 'approved' : 'rejected';
  const updatePayload: Partial<CreatorPhotoDocument> = {
    status: newStatus,
    updatedAt: now
  };

  if (action === 'approve') {
    updatePayload.approvedAt = now;
    updatePayload.approvedBy = adminUser.name;
    updatePayload.rejectionReason = null;
  } else {
    updatePayload.rejectedAt = now;
    updatePayload.rejectedBy = adminUser.name;
    updatePayload.rejectionReason = reason?.trim() || 'لم تستوفِ الصور المعايير التراثية والتوثيقية المعتمدة';
  }

  if (isMongo && db) {
    await db.collection('creator_photos').updateOne({ id: photoId }, { $set: updatePayload });
  }
  Object.assign(photo, updatePayload);

  // Notify Creator
  if (photo.creatorId) {
    try {
      const creator = await getCreatorProfile(photo.creatorId);
      const recipientUserId = creator ? creator.userId : photo.creatorId;
      await createNotification({
        userId: recipientUserId,
        recipientRole: 'all',
        title: action === 'approve' ? 'تمت الموافقة على نشر معرض الصور' : 'تم رفض معرض الصور',
        message:
          action === 'approve'
            ? `تم اعتماد معرض صور "${photo.title}" بنجاح وأصبح متاحاً للجمهور في المعرض التراثي.`
            : `لم تتم الموافقة على معرض صور "${photo.title}". السبب: ${updatePayload.rejectionReason}. يمكنك تعديل المنشور وإعادة تقديمه.`,
        type: 'system_alert',
        actionPage: 'creator-photos'
      });
    } catch (err) {
      Logger.warn('[CreatorService] Failed to notify creator of photo moderation:', err);
    }
  }

  await createAuditLog({
    actorId: adminUser.id,
    userName: adminUser.name,
    userRole: adminUser.role,
    action: action === 'approve' ? 'اعتماد معرض صور' : 'رفض معرض صور',
    resource: 'creator_photos',
    resourceId: photoId,
    status: 'نجاح',
    details: `قام المدير (${adminUser.name}) بـ ${action === 'approve' ? 'اعتماد' : 'رفض'} معرض الصور "${photo.title}". ${reason ? 'السبب: ' + reason : ''}`
  });

  if (photo.creatorId) {
    syncCreatorStats(photo.creatorId).catch(() => {});
  }

  return photo;
}

/**
 * Like a photo
 */
export async function likeCreatorPhoto(photoId: string): Promise<number> {
  const { db, isMongo } = await getDatabase();
  let likes = 0;
  let creatorId: string | undefined;
  if (isMongo && db) {
    const res = await db.collection('creator_photos').findOneAndUpdate(
      { id: photoId },
      { $inc: { likesCount: 1 } },
      { returnDocument: 'after' }
    );
    likes = res?.likesCount || 1;
    creatorId = res?.creatorId;
  } else {
    const p = memoryDb.creatorPhotos.find((x) => x.id === photoId);
    if (p) {
      p.likesCount = (p.likesCount || 0) + 1;
      likes = p.likesCount;
      creatorId = p.creatorId;
    }
  }
  if (creatorId) syncCreatorStats(creatorId).catch(() => {});
  return likes;
}

/**
 * Increment photo view
 */
export async function incrementPhotoView(photoId: string): Promise<number> {
  const { db, isMongo } = await getDatabase();
  let views = 0;
  let creatorId: string | undefined;
  if (isMongo && db) {
    const res = await db.collection('creator_photos').findOneAndUpdate(
      { id: photoId },
      { $inc: { viewsCount: 1 } },
      { returnDocument: 'after' }
    );
    views = res?.viewsCount || 1;
    creatorId = res?.creatorId;
  } else {
    const p = memoryDb.creatorPhotos.find((x) => x.id === photoId);
    if (p) {
      p.viewsCount = (p.viewsCount || 0) + 1;
      views = p.viewsCount;
      creatorId = p.creatorId;
    }
  }
  if (creatorId) syncCreatorStats(creatorId).catch(() => {});
  return views;
}

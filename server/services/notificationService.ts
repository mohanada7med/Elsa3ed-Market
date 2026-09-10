import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { NotificationDocument, AdminBroadcastDocument } from '../models/types.ts';
import type { AuthenticatedUser } from '../middleware/auth.ts';
import { chatRealtimeService } from './chatRealtimeService.ts';
import { Logger } from '../utils/logger.ts';

const memoryNotifications: NotificationDocument[] = [];
const memoryBroadcasts: AdminBroadcastDocument[] = [];

/**
 * Fetch paginated real notifications belonging strictly to the authenticated user.
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 50
): Promise<NotificationDocument[]> {
  if (!userId) return [];

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const notifs = await db
        .collection('notifications')
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(Math.min(Math.max(1, limit), 100))
        .toArray();
      return notifs as unknown as NotificationDocument[];
    } catch (e) {
      Logger.error('[NotificationService] Error querying notifications in MongoDB:', e);
    }
  }

  return memoryNotifications.filter((n) => n.userId === userId).slice(0, limit);
}

/**
 * Get real count of unread notifications for a user directly from the database.
 */
export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  if (!userId) return 0;

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const count = await db.collection('notifications').countDocuments({ userId, isRead: false });
      return count;
    } catch (e) {
      Logger.error('[NotificationService] Error counting unread notifications in MongoDB:', e);
    }
  }

  return memoryNotifications.filter((n) => n.userId === userId && !n.isRead).length;
}

/**
 * Create a persistent, real notification linked to a business event in the database.
 */
export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type?:
  | 'seller_request'
  | 'seller_approved'
  | 'seller_rejected'
  | 'new_order'
  | 'order_status'
  | 'payment_status'
  | 'payout_request'
  | 'payout_response'
  | 'password_request'
  | 'password_response'
  | 'account'
  | 'system'
  | 'order'
  | 'product'
  | 'promotion';
  link?: string;
  metadata?: any;
  recipientRole?: 'admin' | 'seller' | 'buyer' | 'all';
}): Promise<NotificationDocument> {
  const doc: NotificationDocument = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: params.userId,
    title: params.title.trim(),
    message: params.message.trim(),
    type: (params.type || 'system') as any,
    isRead: false,
    link: params.link,
    metadata: params.metadata,
    recipientRole: params.recipientRole,
    createdAt: new Date().toISOString()
  };

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('notifications').insertOne(doc as any);
    } catch (e) {
      Logger.error('[NotificationService] Error creating notification in MongoDB:', e);
    }
  }

  memoryNotifications.unshift(doc);
  return doc;
}

/**
 * Mark a single notification as read, strictly validating ownership.
 */
export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<boolean> {
  if (!userId || !notificationId) return false;

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const notif = await db.collection('notifications').findOne({ id: notificationId, userId });
      const res = await db
        .collection('notifications')
        .updateOne({ id: notificationId, userId }, { $set: { isRead: true } });

      if (notif?.broadcastId) {
        await db.collection('admin_broadcasts').updateOne(
          { id: notif.broadcastId },
          { $addToSet: { readBy: userId } }
        );
      }

      return res.modifiedCount > 0 || res.matchedCount > 0;
    } catch (e) {
      Logger.error('[NotificationService] Error updating notification in MongoDB:', e);
    }
  }

  const notif = memoryNotifications.find((n) => n.id === notificationId && n.userId === userId);
  if (notif) {
    notif.isRead = true;
    if (notif.broadcastId) {
      const bcast = memoryBroadcasts.find((b) => b.id === notif.broadcastId);
      if (bcast && !bcast.readBy.includes(userId)) {
        bcast.readBy.push(userId);
      }
    }
    return true;
  }
  return false;
}

/**
 * Mark all notifications for the authenticated user as read.
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  if (!userId) return false;

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const unreadBroadcasts = await db
        .collection('notifications')
        .distinct('broadcastId', { userId, isRead: false, broadcastId: { $exists: true, $ne: null } });

      await db
        .collection('notifications')
        .updateMany({ userId, isRead: false }, { $set: { isRead: true } });

      if (Array.isArray(unreadBroadcasts) && unreadBroadcasts.length > 0) {
        await db.collection('admin_broadcasts').updateMany(
          { id: { $in: unreadBroadcasts } },
          { $addToSet: { readBy: userId } }
        );
      }
      return true;
    } catch (e) {
      Logger.error('[NotificationService] Error marking all notifications as read in MongoDB:', e);
    }
  }

  memoryNotifications.forEach((n) => {
    if (n.userId === userId) {
      n.isRead = true;
      if (n.broadcastId) {
        const bcast = memoryBroadcasts.find((b) => b.id === n.broadcastId);
        if (bcast && !bcast.readBy.includes(userId)) {
          bcast.readBy.push(userId);
        }
      }
    }
  });
  return true;
}

/**
 * Delete a single notification, strictly verifying user ownership.
 */
export async function deleteNotification(
  userId: string,
  notificationId: string
): Promise<boolean> {
  if (!userId || !notificationId) return false;

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const res = await db.collection('notifications').deleteOne({ id: notificationId, userId });
      return res.deletedCount > 0;
    } catch (e) {
      Logger.error('[NotificationService] Error deleting notification from MongoDB:', e);
    }
  }

  const index = memoryNotifications.findIndex((n) => n.id === notificationId && n.userId === userId);
  if (index >= 0) {
    memoryNotifications.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Clear all notifications for the authenticated user.
 */
export async function clearAllUserNotifications(userId: string): Promise<boolean> {
  if (!userId) return false;

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db.collection('notifications').deleteMany({ userId });
      return true;
    } catch (e) {
      Logger.error('[NotificationService] Error clearing user notifications in MongoDB:', e);
    }
  }

  const remaining = memoryNotifications.filter((n) => n.userId !== userId);
  memoryNotifications.length = 0;
  memoryNotifications.push(...remaining);
  return true;
}

/**
 * Resolves a seller ID (or workshop ID) to the actual owner user's ID.
 */
export async function resolveSellerUserId(sellerId: string): Promise<string> {
  if (!sellerId) return '';
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const sDoc = await db.collection('sellers').findOne({ $or: [{ id: sellerId }, { userId: sellerId }] });
      if (sDoc?.userId) return sDoc.userId;
    } catch (e) {
      Logger.error('[NotificationService] Error resolving seller userId:', e);
    }
  }
  const mem = memoryDb.sellers.find((s) => s.id === sellerId || (s as any).userId === sellerId);
  if (mem && (mem as any).userId) return (mem as any).userId;
  return sellerId;
}

/**
 * Sends a notification to all registered administrators without duplication.
 */
export async function notifyAdmins(params: {
  title: string;
  message: string;
  type?:
    | 'seller_request'
    | 'seller_approved'
    | 'seller_rejected'
    | 'new_order'
    | 'order_status'
    | 'payment_status'
    | 'payout_request'
    | 'payout_response'
    | 'password_request'
    | 'password_response'
    | 'account'
    | 'system'
    | 'order'
    | 'product'
    | 'promotion';
  link?: string;
  metadata?: any;
}): Promise<void> {
  try {
    const { db, isMongo } = await getDatabase();
    const adminIdsSet = new Set<string>();

    if (isMongo && db) {
      const adminDocs = await db.collection('users').find({ role: 'admin' }, { projection: { id: 1 } }).toArray();
      adminDocs.forEach((a: any) => {
        if (a.id) adminIdsSet.add(a.id);
      });
    } else {
      memoryDb.users.filter((u) => u.role === 'admin').forEach((u) => {
        if (u.id) adminIdsSet.add(u.id);
      });
    }

    if (adminIdsSet.size === 0) {
      adminIdsSet.add('user-admin-1');
    }

    for (const adminId of adminIdsSet) {
      await createNotification({
        userId: adminId,
        title: params.title,
        message: params.message,
        type: params.type || 'system',
        link: params.link,
        metadata: params.metadata,
        recipientRole: 'admin'
      });
    }
  } catch (err) {
    Logger.error('[NotificationService] Error in notifyAdmins:', err);
  }
}

export interface SendAdminNotificationInput {
  title: string;
  message: string;
  targetType: 'all' | 'user' | 'buyers' | 'sellers';
  targetUserId?: string;
  idempotencyKey?: string;
  actionPage?: string;
  link?: string;
}

export interface SendAdminNotificationResult {
  success: boolean;
  notificationId?: string;
  targetType?: string;
  recipientsCount?: number;
  error?: string;
  code?: string;
}

/**
 * Send an authentic, server-validated broadcast or targeted notification from an authorized Admin.
 * Determines target users on server-side, saves to MongoDB with bulk operations, and delivers in real-time.
 */
export async function sendAdminBroadcastNotification(
  adminUser: AuthenticatedUser,
  input: SendAdminNotificationInput
): Promise<SendAdminNotificationResult> {
  if (!adminUser || adminUser.role !== 'admin') {
    return {
      success: false,
      error: 'غير مصرح. يجب تسجيل الدخول كمدير للنظام لإرسال التنبيهات',
      code: 'UNAUTHORIZED_ADMIN_ONLY'
    };
  }

  const title = (input.title || '').trim();
  const message = (input.message || '').trim();
  const targetType = input.targetType;
  const targetUserId = input.targetUserId ? String(input.targetUserId).trim() : undefined;
  const idempotencyKey = input.idempotencyKey ? String(input.idempotencyKey).trim() : undefined;

  // 1. Input Validation
  if (!title || title.length < 2 || title.length > 150) {
    return {
      success: false,
      error: 'عنوان الإشعار مطلوب ويجب أن يتراوح بين حرفين و 150 حرفاً',
      code: 'INVALID_TITLE'
    };
  }

  if (!message || message.length < 2 || message.length > 2000) {
    return {
      success: false,
      error: 'نص الإشعار مطلوب ويجب أن يتراوح بين حرفين و 2000 حرف',
      code: 'INVALID_MESSAGE'
    };
  }

  if (!['all', 'user', 'buyers', 'sellers'].includes(targetType)) {
    return {
      success: false,
      error: 'الفئة المستهدفة غير صالحة. الخيارات المتاحة: الكل، مستخدم محدد، المشترين فقط، أصحاب الورش فقط',
      code: 'INVALID_TARGET_TYPE'
    };
  }

  const { db, isMongo } = await getDatabase();

  // 2. Duplicate Prevention / Idempotency check
  if (idempotencyKey) {
    if (isMongo && db) {
      try {
        const existing = await db.collection('admin_broadcasts').findOne({ idempotencyKey });
        if (existing) {
          return {
            success: true,
            notificationId: existing.id,
            targetType: existing.targetType,
            recipientsCount: existing.recipientsCount || (Array.isArray(existing.readBy) ? existing.readBy.length : 1)
          };
        }
      } catch (e) {
        Logger.error('[NotificationService] Idempotency check error in MongoDB:', e);
      }
    } else {
      const existing = memoryBroadcasts.find((b) => b.idempotencyKey === idempotencyKey);
      if (existing) {
        return {
          success: true,
          notificationId: existing.id,
          targetType: existing.targetType,
          recipientsCount: existing.recipientsCount
        };
      }
    }
  }

  // 3. Target User Determination (Server-side & strictly validated against MongoDB)
  let recipientUserIds: string[] = [];
  let targetUserName: string | undefined = undefined;

  if (targetType === 'user') {
    if (!targetUserId) {
      return {
        success: false,
        error: 'معرف المستخدم المستهدف مطلوب عند اختيار مستخدم محدد',
        code: 'MISSING_TARGET_USER_ID'
      };
    }

    let foundUser: any = null;
    if (isMongo && db) {
      try {
        foundUser = await db.collection('users').findOne({ id: targetUserId });
      } catch (e) {
        Logger.error('[NotificationService] Error looking up target user in MongoDB:', e);
      }
    }
    if (!foundUser) {
      foundUser = memoryDb.users.find((u) => u.id === targetUserId);
    }

    if (!foundUser) {
      return {
        success: false,
        error: 'المستخدم المحدد غير موجود في قاعدة بيانات المنصة',
        code: 'USER_NOT_FOUND'
      };
    }

    if (foundUser.status === 'blocked') {
      return {
        success: false,
        error: 'حساب المستخدم المحدد محظور أو غير مفعل حالياً',
        code: 'USER_BLOCKED'
      };
    }

    targetUserName = foundUser.name || foundUser.username || foundUser.email || 'مستخدم المنصة';
    recipientUserIds = [foundUser.id];
  } else if (targetType === 'all') {
    if (isMongo && db) {
      try {
        const users = await db
          .collection('users')
          .find({ status: { $ne: 'blocked' } }, { projection: { id: 1 } })
          .toArray();
        recipientUserIds = users.map((u: any) => u.id).filter(Boolean);
      } catch (e) {
        Logger.error('[NotificationService] Error fetching all users in MongoDB:', e);
      }
    }
    if (recipientUserIds.length === 0) {
      recipientUserIds = memoryDb.users.filter((u) => u.status !== 'blocked').map((u) => u.id).filter(Boolean);
    }
  } else if (targetType === 'buyers') {
    if (isMongo && db) {
      try {
        const users = await db
          .collection('users')
          .find({ role: 'buyer', status: { $ne: 'blocked' } }, { projection: { id: 1 } })
          .toArray();
        recipientUserIds = users.map((u: any) => u.id).filter(Boolean);
      } catch (e) {
        Logger.error('[NotificationService] Error fetching buyers in MongoDB:', e);
      }
    }
    if (recipientUserIds.length === 0) {
      recipientUserIds = memoryDb.users
        .filter((u) => u.role === 'buyer' && u.status !== 'blocked')
        .map((u) => u.id)
        .filter(Boolean);
    }
  } else if (targetType === 'sellers') {
    if (isMongo && db) {
      try {
        const users = await db
          .collection('users')
          .find({ role: 'seller', status: { $ne: 'blocked' } }, { projection: { id: 1 } })
          .toArray();
        recipientUserIds = users.map((u: any) => u.id).filter(Boolean);
      } catch (e) {
        Logger.error('[NotificationService] Error fetching sellers in MongoDB:', e);
      }
    }
    if (recipientUserIds.length === 0) {
      recipientUserIds = memoryDb.users
        .filter((u) => u.role === 'seller' && u.status !== 'blocked')
        .map((u) => u.id)
        .filter(Boolean);
    }
  }

  // Deduplicate IDs
  recipientUserIds = Array.from(new Set(recipientUserIds));

  if (recipientUserIds.length === 0) {
    return {
      success: false,
      error: 'لم يتم العثور على أي مستخدمين مؤهلين في الفئة المستهدفة حالياً',
      code: 'NO_TARGET_USERS_FOUND'
    };
  }

  // 4. Create Master Broadcast Record
  const broadcastId = `bcast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const broadcastDoc: AdminBroadcastDocument = {
    id: broadcastId,
    title,
    message,
    targetType,
    targetUserId: targetType === 'user' ? targetUserId : undefined,
    targetUserName,
    senderId: adminUser.id,
    senderRole: 'admin',
    senderName: adminUser.name || adminUser.username || 'مدير المنصة',
    recipientsCount: recipientUserIds.length,
    readBy: [],
    idempotencyKey,
    createdAt: now
  };

  // 5. Prepare Bulk Notification Documents for Each Recipient
  const recipientRole = targetType === 'sellers' ? 'seller' : targetType === 'buyers' ? 'buyer' : 'all';
  const defaultActionPage = targetType === 'sellers' ? 'seller-dashboard' : 'notifications';
  const customActionPage = (input.actionPage || input.link || '').trim().replace(/^\/+/, '');
  const finalActionPage = customActionPage || defaultActionPage;

  const notifDocs: NotificationDocument[] = recipientUserIds.map((uid) => ({
    id: `notif-${broadcastId}-${uid}`,
    userId: uid,
    title,
    message,
    type: 'system_alert',
    isRead: false,
    link: finalActionPage,
    actionPage: finalActionPage,
    recipientRole,
    targetType,
    targetUserId: targetType === 'user' ? targetUserId : undefined,
    senderId: adminUser.id,
    senderRole: 'admin',
    broadcastId,
    readBy: [],
    createdAt: now
  }));

  // 6. Save to MongoDB using High-Performance Bulk Operations
  if (isMongo && db) {
    try {
      await db.collection('admin_broadcasts').insertOne(broadcastDoc as any);

      // Insert notifications in batches to handle large audiences efficiently
      const batchSize = 500;
      for (let i = 0; i < notifDocs.length; i += batchSize) {
        const batch = notifDocs.slice(i, i + batchSize);
        await db.collection('notifications').insertMany(batch as any, { ordered: false });
      }
    } catch (e) {
      Logger.error('[NotificationService] Error during bulk insert in MongoDB:', e);
    }
  }

  // Always keep in-memory backup
  memoryBroadcasts.unshift(broadcastDoc);
  memoryNotifications.unshift(...notifDocs);

  // 7. Deliver in Real-Time to Connected Users via SSE
  for (const uid of recipientUserIds) {
    chatRealtimeService.notifyUser(uid, 'notification:new', {
      id: `notif-${broadcastId}-${uid}`,
      title,
      message,
      type: 'system_alert',
      broadcastId,
      targetType,
      actionPage: finalActionPage,
      link: finalActionPage,
      createdAt: now
    });
  }

  Logger.info(
    `[NotificationService] Admin ${adminUser.id} broadcasted notification "${title}" to ${recipientUserIds.length} users (target: ${targetType})`
  );

  return {
    success: true,
    notificationId: broadcastId,
    targetType,
    recipientsCount: recipientUserIds.length
  };
}

/**
 * Retrieve real Admin Broadcast History from MongoDB.
 */
export async function getAdminBroadcastHistory(limit: number = 50): Promise<any[]> {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const records = await db
        .collection('admin_broadcasts')
        .find({})
        .sort({ createdAt: -1 })
        .limit(Math.min(Math.max(1, limit), 100))
        .toArray();

      return records.map((r: any) => ({
        id: r.id,
        title: r.title,
        message: r.message,
        targetType: r.targetType,
        targetUserId: r.targetUserId,
        targetUserName: r.targetUserName,
        senderId: r.senderId,
        senderRole: r.senderRole,
        senderName: r.senderName,
        recipientsCount: r.recipientsCount || (Array.isArray(r.readBy) ? r.readBy.length : 0),
        readCount: Array.isArray(r.readBy) ? r.readBy.length : 0,
        createdAt: r.createdAt
      }));
    } catch (e) {
      Logger.error('[NotificationService] Error fetching admin broadcasts in MongoDB:', e);
    }
  }

  return memoryBroadcasts.slice(0, limit).map((r) => ({
    id: r.id,
    title: r.title,
    message: r.message,
    targetType: r.targetType,
    targetUserId: r.targetUserId,
    targetUserName: r.targetUserName,
    senderId: r.senderId,
    senderRole: r.senderRole,
    senderName: r.senderName,
    recipientsCount: r.recipientsCount || (Array.isArray(r.readBy) ? r.readBy.length : 0),
    readCount: Array.isArray(r.readBy) ? r.readBy.length : 0,
    createdAt: r.createdAt
  }));
}


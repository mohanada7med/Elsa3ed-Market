import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { NotificationDocument } from '../models/types.ts';
import { Logger } from '../utils/logger.ts';

const memoryNotifications: NotificationDocument[] = [];

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
      const res = await db
        .collection('notifications')
        .updateOne({ id: notificationId, userId }, { $set: { isRead: true } });
      return res.modifiedCount > 0 || res.matchedCount > 0;
    } catch (e) {
      Logger.error('[NotificationService] Error updating notification in MongoDB:', e);
    }
  }

  const notif = memoryNotifications.find((n) => n.id === notificationId && n.userId === userId);
  if (notif) {
    notif.isRead = true;
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
      await db
        .collection('notifications')
        .updateMany({ userId, isRead: false }, { $set: { isRead: true } });
      return true;
    } catch (e) {
      Logger.error('[NotificationService] Error marking all notifications as read in MongoDB:', e);
    }
  }

  memoryNotifications.forEach((n) => {
    if (n.userId === userId) {
      n.isRead = true;
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


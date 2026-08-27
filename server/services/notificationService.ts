import { getDatabase } from '../db/mongodb.ts';
import { NotificationDocument } from '../models/types.ts';
import { Logger } from '../utils/logger.ts';

const memoryNotifications: NotificationDocument[] = [
  {
    id: 'notif-1',
    userId: 'user-buyer-1',
    title: 'طلبك قيد المراجعة',
    message: 'تم استلام طلبك رقم SAED-1042 وتأكيد عملية الدفع بنجاح.',
    type: 'order',
    isRead: false,
    link: 'orders',
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif-2',
    userId: 'seller-1',
    title: 'طلب جديد وارد',
    message: 'لديك طلب جديد رقم SAED-1042 يحتاج للتجهيز والتغليف.',
    type: 'order',
    isRead: false,
    link: 'seller-dashboard',
    createdAt: new Date().toISOString()
  }
];

export async function getUserNotifications(userId: string): Promise<NotificationDocument[]> {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      const notifs = await db
        .collection('notifications')
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();
      return notifs as unknown as NotificationDocument[];
    } catch (e) {
      Logger.error('[NotificationService] Error querying notifications in MongoDB:', e);
    }
  }

  return memoryNotifications.filter((n) => n.userId === userId);
}

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type?: 'order' | 'product' | 'system' | 'promotion';
  link?: string;
}): Promise<NotificationDocument> {
  const doc: NotificationDocument = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: params.userId,
    title: params.title,
    message: params.message,
    type: params.type || 'system',
    isRead: false,
    link: params.link,
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

export async function markNotificationAsRead(userId: string, notificationId: string): Promise<boolean> {
  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    try {
      await db
        .collection('notifications')
        .updateOne({ id: notificationId, userId }, { $set: { isRead: true } });
      return true;
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

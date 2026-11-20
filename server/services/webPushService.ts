import * as webpush from 'web-push';
import { validateAndGetEnv } from '../config/env.ts';
import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { PushSubscriptionDocument } from '../models/types.ts';
import { Logger } from '../utils/logger.ts';

const env = validateAndGetEnv();

// Configure Web Push VAPID keys
try {
  webpush.setVapidDetails(
    env.VAPID_SUBJECT,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );
  Logger.info('[WebPushService] Web Push VAPID details configured successfully');
} catch (err) {
  Logger.error('[WebPushService] Failed to configure VAPID details:', err);
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  link?: string;
  actionPage?: string;
  metadata?: any;
  tag?: string;
  actions?: Array<{ action: string; title: string }>;
}

export class WebPushService {
  /**
   * Return the public VAPID key for client subscriptions
   */
  public getVapidPublicKey(): string {
    return env.VAPID_PUBLIC_KEY;
  }

  /**
   * Register or update a client push subscription
   */
  public async saveSubscription(params: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    expirationTime?: number | null;
    userId?: string;
    role?: string;
    userAgent?: string;
  }): Promise<PushSubscriptionDocument> {
    const { endpoint, keys, expirationTime, userId, role, userAgent } = params;

    const doc: PushSubscriptionDocument = {
      id: `push-sub-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      endpoint,
      keys,
      expirationTime: expirationTime || null,
      userId: userId || undefined,
      role: role || 'guest',
      userAgent: userAgent || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { db, isMongo } = await getDatabase();
    if (isMongo && db) {
      try {
        await db.collection('push_subscriptions').updateOne(
          { endpoint },
          {
            $set: {
              keys,
              expirationTime: doc.expirationTime,
              userId: doc.userId,
              role: doc.role,
              userAgent: doc.userAgent,
              updatedAt: doc.updatedAt
            },
            $setOnInsert: {
              id: doc.id,
              createdAt: doc.createdAt
            }
          },
          { upsert: true }
        );
      } catch (err) {
        Logger.error('[WebPushService] Error saving subscription in MongoDB:', err);
      }
    }

    // Also update in-memory store
    const existingIdx = memoryDb.pushSubscriptions.findIndex((s) => s.endpoint === endpoint);
    if (existingIdx !== -1) {
      memoryDb.pushSubscriptions[existingIdx] = {
        ...memoryDb.pushSubscriptions[existingIdx],
        ...doc,
        id: memoryDb.pushSubscriptions[existingIdx].id,
        createdAt: memoryDb.pushSubscriptions[existingIdx].createdAt
      };
    } else {
      memoryDb.pushSubscriptions.push(doc);
    }

    return doc;
  }

  /**
   * Remove a push subscription by endpoint (e.g. on user unsubscribe or 410 Gone)
   */
  public async removeSubscription(endpoint: string): Promise<boolean> {
    if (!endpoint) return false;

    const { db, isMongo } = await getDatabase();
    if (isMongo && db) {
      try {
        await db.collection('push_subscriptions').deleteOne({ endpoint });
      } catch (err) {
        Logger.error('[WebPushService] Error deleting subscription from MongoDB:', err);
      }
    }

    const initialLen = memoryDb.pushSubscriptions.length;
    memoryDb.pushSubscriptions = memoryDb.pushSubscriptions.filter((s) => s.endpoint !== endpoint);
    return memoryDb.pushSubscriptions.length < initialLen;
  }

  /**
   * Low-level notification dispatcher to a specific subscription
   */
  public async sendToSubscription(
    sub: PushSubscriptionDocument,
    payload: PushNotificationPayload
  ): Promise<boolean> {
    const pushSubscription = {
      endpoint: sub.endpoint,
      expirationTime: sub.expirationTime,
      keys: sub.keys
    };

    const stringifiedPayload = JSON.stringify({
      title: payload.title || 'وه | WAH — إشعار جديد 🏺',
      body: payload.body || '',
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-192x192.png',
      url: payload.url || payload.link || (payload.actionPage ? `/?page=${payload.actionPage}` : '/'),
      actionPage: payload.actionPage,
      metadata: payload.metadata,
      tag: payload.tag || `wah-alert-${Date.now()}`,
      actions: payload.actions || [{ action: 'open', title: 'عرض التفاصيل' }]
    });

    try {
      await webpush.sendNotification(pushSubscription as any, stringifiedPayload);
      return true;
    } catch (error: any) {
      // HTTP 404 or 410 means the subscription has expired or unsubscribed
      if (error?.statusCode === 404 || error?.statusCode === 410) {
        Logger.warn('[WebPushService] Subscription expired or gone, cleaning up:', sub.endpoint);
        await this.removeSubscription(sub.endpoint);
      } else {
        Logger.error('[WebPushService] Error dispatching push notification:', error?.message || error);
      }
      return false;
    }
  }

  /**
   * Send notification to a specific user (across all their registered devices)
   */
  public async sendPushToUser(
    userId: string,
    payload: PushNotificationPayload
  ): Promise<{ sent: number; total: number }> {
    if (!userId) return { sent: 0, total: 0 };

    let userSubs: PushSubscriptionDocument[] = [];
    const { db, isMongo } = await getDatabase();
    if (isMongo && db) {
      try {
        userSubs = (await db
          .collection('push_subscriptions')
          .find({ userId })
          .toArray()) as unknown as PushSubscriptionDocument[];
      } catch (err) {
        Logger.error('[WebPushService] Error fetching user subscriptions:', err);
      }
    }

    if (userSubs.length === 0) {
      userSubs = memoryDb.pushSubscriptions.filter((s) => s.userId === userId);
    }

    if (userSubs.length === 0) {
      return { sent: 0, total: 0 };
    }

    const results = await Promise.allSettled(
      userSubs.map((sub) => this.sendToSubscription(sub, payload))
    );

    const sent = results.filter((r) => r.status === 'fulfilled' && r.value === true).length;
    return { sent, total: userSubs.length };
  }

  /**
   * Send notification to all subscribers belonging to a specific role (e.g. 'seller', 'admin', 'buyer')
   */
  public async sendPushToRole(
    role: string,
    payload: PushNotificationPayload
  ): Promise<{ sent: number; total: number }> {
    let roleSubs: PushSubscriptionDocument[] = [];
    const { db, isMongo } = await getDatabase();
    if (isMongo && db) {
      try {
        roleSubs = (await db
          .collection('push_subscriptions')
          .find({ role })
          .toArray()) as unknown as PushSubscriptionDocument[];
      } catch (err) {
        Logger.error('[WebPushService] Error fetching role subscriptions:', err);
      }
    }

    if (roleSubs.length === 0) {
      roleSubs = memoryDb.pushSubscriptions.filter((s) => s.role === role);
    }

    const results = await Promise.allSettled(
      roleSubs.map((sub) => this.sendToSubscription(sub, payload))
    );

    const sent = results.filter((r) => r.status === 'fulfilled' && r.value === true).length;
    return { sent, total: roleSubs.length };
  }

  /**
   * Broadcast push notification to ALL registered subscribers
   */
  public async sendPushBroadcast(
    payload: PushNotificationPayload
  ): Promise<{ sent: number; total: number }> {
    let allSubs: PushSubscriptionDocument[] = [];
    const { db, isMongo } = await getDatabase();
    if (isMongo && db) {
      try {
        allSubs = (await db
          .collection('push_subscriptions')
          .find({})
          .toArray()) as unknown as PushSubscriptionDocument[];
      } catch (err) {
        Logger.error('[WebPushService] Error fetching all subscriptions:', err);
      }
    }

    if (allSubs.length === 0) {
      allSubs = [...memoryDb.pushSubscriptions];
    }

    const results = await Promise.allSettled(
      allSubs.map((sub) => this.sendToSubscription(sub, payload))
    );

    const sent = results.filter((r) => r.status === 'fulfilled' && r.value === true).length;
    return { sent, total: allSubs.length };
  }
}

export const webPushService = new WebPushService();

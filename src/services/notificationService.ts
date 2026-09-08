import { Governorate, OrderStatus, ProductStatus } from '../types.ts';
import { browserNotificationService } from './browserNotificationService.ts';
import { api } from './api.ts';

export type NotificationType =
  | 'seller_request'
  | 'seller_approved'
  | 'seller_rejected'
  | 'new_order'
  | 'order_status'
  | 'order_status_changed'
  | 'order_cancelled'
  | 'payment_status'
  | 'payout_request'
  | 'payout_requested'
  | 'payout_response'
  | 'payout_approved'
  | 'payout_paid'
  | 'payout_rejected'
  | 'password_request'
  | 'password_reset_requested'
  | 'password_response'
  | 'account'
  | 'system'
  | 'order'
  | 'product'
  | 'product_approved'
  | 'product_rejected'
  | 'product_pending_review'
  | 'promotion'
  | 'low_stock'
  | 'new_review'
  | 'new_seller_registered'
  | 'system_alert'
  | 'reel_liked'
  | 'chat_message';

export interface AppNotification {
  id: string;
  recipientRole: 'seller' | 'admin' | 'buyer' | 'all';
  recipientId?: string; // sellerId, userId or 'admin'
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  isRead?: boolean;
  createdAt: string;
  link?: string;
  actionUrl?: string;
  actionPage?: string;
  actionTab?: string;
  metadata?: {
    orderId?: string;
    orderNumber?: string;
    productId?: string;
    productTitle?: string;
    payoutId?: string;
    amount?: number;
    sellerId?: string;
    sellerName?: string;
    stockCount?: number;
    governorate?: Governorate;
    rating?: number;
    reviewId?: string;
    reelId?: string;
    [key: string]: any;
  };
}

export function normalizeNotification(doc: any): AppNotification {
  const isRead = Boolean(doc.isRead !== undefined ? doc.isRead : doc.read);
  return {
    id: doc.id || doc._id || `notif-${Date.now()}`,
    recipientRole: doc.recipientRole || 'all',
    recipientId: doc.userId || doc.recipientId,
    title: doc.title || '',
    message: doc.message || '',
    type: doc.type || 'system',
    read: isRead,
    isRead,
    createdAt: doc.createdAt || new Date().toISOString(),
    link: doc.link || doc.actionPage,
    actionPage: doc.link || doc.actionPage,
    actionUrl: doc.actionUrl,
    actionTab: doc.actionTab,
    metadata: doc.metadata || doc.data || {}
  };
}

class NotificationService {
  private notifications: AppNotification[] = [];
  private listeners: Set<() => void> = new Set();
  private isFetching = false;

  constructor() {
    // Clean up any legacy mock seeds from previous versions
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('saeed_platform_notifications_v1');
      } catch {}
    }
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notifyListeners() {
    for (const fn of this.listeners) {
      try {
        fn();
      } catch (e) {
        console.error('[NotificationService] Listener error:', e);
      }
    }
  }

  /**
   * Fetch real notifications from the database for the authenticated session.
   */
  async fetchFromDatabase(limit: number = 50): Promise<AppNotification[]> {
    if (this.isFetching) return this.notifications;
    this.isFetching = true;
    try {
      const rawDocs = await api.getNotifications(limit);
      if (Array.isArray(rawDocs)) {
        this.notifications = rawDocs.map(normalizeNotification);
        this.notifyListeners();
      }
    } catch (err) {
      console.warn('[NotificationService] Failed to load database notifications:', err);
    } finally {
      this.isFetching = false;
    }
    return this.notifications;
  }

  /**
   * Set notifications explicitly (e.g. from AppContext).
   */
  setNotifications(list: AppNotification[]) {
    this.notifications = list;
    this.notifyListeners();
  }

  /**
   * Clear notifications from memory on logout.
   */
  clearMemory() {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Get notifications for a user based on role and seller/user ID.
   * For guests, returns empty list.
   */
  getNotifications(role: 'admin' | 'seller' | 'buyer' | 'guest', targetId?: string): AppNotification[] {
    if (role === 'guest') {
      return [];
    }
    if (role === 'admin') {
      return this.notifications.filter((n) => n.recipientRole === 'admin' || n.recipientRole === 'all' || !n.recipientRole);
    }
    if (role === 'seller') {
      return this.notifications.filter(
        (n) =>
          (n.recipientRole === 'seller' && (!n.recipientId || !targetId || n.recipientId === targetId)) ||
          n.recipientRole === 'all' ||
          !n.recipientRole
      );
    }
    if (role === 'buyer') {
      return this.notifications.filter(
        (n) => (n.recipientRole === 'buyer' && (!n.recipientId || n.recipientId === targetId)) || n.recipientRole === 'all' || !n.recipientRole
      );
    }
    return this.notifications;
  }

  getUnreadCount(role: 'admin' | 'seller' | 'buyer' | 'guest', targetId?: string): number {
    if (role === 'guest') return 0;
    const list = this.getNotifications(role, targetId);
    return list.filter((n) => !n.read).length;
  }

  async markAsRead(id: string) {
    if (!id) return;
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read: true, isRead: true } : n
    );
    this.notifyListeners();

    try {
      await api.markNotificationAsRead(id);
    } catch (e) {
      console.warn('[NotificationService] Failed to mark as read on server:', e);
    }
  }

  async markAllAsRead(role?: 'admin' | 'seller' | 'buyer' | 'guest', targetId?: string) {
    this.notifications = this.notifications.map((n) => ({
      ...n,
      read: true,
      isRead: true
    }));
    this.notifyListeners();

    try {
      await api.markAllNotificationsAsRead();
    } catch (e) {
      console.warn('[NotificationService] Failed to mark all as read on server:', e);
    }
  }

  async deleteNotification(id: string) {
    if (!id) return;
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notifyListeners();

    try {
      await api.deleteNotification(id);
    } catch (e) {
      console.warn('[NotificationService] Failed to delete on server:', e);
    }
  }

  async clearAll(role?: 'admin' | 'seller' | 'buyer' | 'guest', targetId?: string) {
    this.notifications = [];
    this.notifyListeners();

    try {
      await api.clearAllNotifications();
    } catch (e) {
      console.warn('[NotificationService] Failed to clear all on server:', e);
    }
  }

  // Compat helpers to avoid breaking any callers
  notifyNewOrder(orderIdOrParams: any, orderNumber?: string, amount?: number, sellerIds?: string[]) {
    // Handled by backend orderService.ts
  }

  notifyOrderStatus(params: { orderId: string; orderNumber?: string; newStatus: string; buyerId?: string; sellerId?: string }) {
    // Handled by backend orderService.ts
  }

  notifyProductApprovalStatus(sellerIdOrParams: any, productTitle?: string, status?: 'approved' | 'rejected', reason?: string) {
    // Handled by backend productService.ts
  }

  notifyPayoutStatus(sellerId: string, amount: number, status: 'approved' | 'paid' | 'rejected', reason?: string) {
    // Handled by backend payoutService.ts
  }

  notifyLowStock(sellerId: string, productTitle: string, currentStock: number) {
    // Optional helper
  }

  notifyNewReview(sellerId: string, productTitle: string, rating: number, comment: string) {
    // Optional helper
  }

  addNotification(notification: any): AppNotification {
    const newNotif: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      read: false,
      isRead: false
    };
    this.notifications = [newNotif, ...this.notifications];
    this.notifyListeners();
    return newNotif;
  }
}

export const notificationService = new NotificationService();

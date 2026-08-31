import { Governorate, OrderStatus, ProductStatus } from '../types.ts';

export type NotificationType =
  | 'new_order'
  | 'order_status_changed'
  | 'order_cancelled'
  | 'product_approved'
  | 'product_rejected'
  | 'product_pending_review'
  | 'low_stock'
  | 'payout_requested'
  | 'payout_approved'
  | 'payout_paid'
  | 'payout_rejected'
  | 'new_review'
  | 'new_seller_registered'
  | 'password_reset_requested'
  | 'system_alert'
  | 'reel_liked';

export interface AppNotification {
  id: string;
  recipientRole: 'seller' | 'admin' | 'buyer' | 'all';
  recipientId?: string; // sellerId, userId or 'admin'
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
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
  };
}

const STORAGE_KEY = 'saeed_platform_notifications_v1';

class NotificationService {
  private notifications: AppNotification[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') {
      this.notifications = [];
      return;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.notifications = JSON.parse(stored);
      } else {
        this.notifications = [];
      }
    } catch {
      this.notifications = [];
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications));
    } catch (e) {
      console.warn('Failed to save notifications to localStorage:', e);
    }
  }

  /**
   * Get notifications for a user based on role and seller/user ID
   */
  getNotifications(role: 'admin' | 'seller' | 'buyer' | 'guest', targetId?: string): AppNotification[] {
    if (role === 'admin') {
      return this.notifications.filter((n) => n.recipientRole === 'admin' || n.recipientRole === 'all');
    }
    if (role === 'seller') {
      return this.notifications.filter(
        (n) =>
          (n.recipientRole === 'seller' && (!n.recipientId || !targetId || n.recipientId === targetId || n.recipientId === 'seller-1')) ||
          n.recipientRole === 'all'
      );
    }
    if (role === 'buyer') {
      return this.notifications.filter(
        (n) => (n.recipientRole === 'buyer' && (!n.recipientId || n.recipientId === targetId)) || n.recipientRole === 'all'
      );
    }
    return [];
  }

  getUnreadCount(role: 'admin' | 'seller' | 'buyer' | 'guest', targetId?: string): number {
    const list = this.getNotifications(role, targetId);
    return list.filter((n) => !n.read).length;
  }

  markAsRead(id: string) {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.saveToStorage();
  }

  markAllAsRead(role: 'admin' | 'seller' | 'buyer' | 'guest', targetId?: string) {
    const idsToMark = new Set(this.getNotifications(role, targetId).map((n) => n.id));
    this.notifications = this.notifications.map((n) => (idsToMark.has(n.id) ? { ...n, read: true } : n));
    this.saveToStorage();
  }

  deleteNotification(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.saveToStorage();
  }

  clearAll(role: 'admin' | 'seller' | 'buyer' | 'guest', targetId?: string) {
    const idsToRemove = new Set(this.getNotifications(role, targetId).map((n) => n.id));
    this.notifications = this.notifications.filter((n) => !idsToRemove.has(n.id));
    this.saveToStorage();
  }

  /**
   * Add a new notification
   */
  addNotification(notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): AppNotification {
    const newNotif: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      read: false
    };

    this.notifications = [newNotif, ...this.notifications];
    this.saveToStorage();
    return newNotif;
  }

  // System Helpers for Triggers
  notifyNewOrder(
    orderIdOrParams: string | { orderId: string; orderNumber: string; total?: number; amount?: number; itemsCount?: number; governorate?: string; sellerIds?: string[] },
    orderNumber?: string,
    amount?: number,
    sellerIds?: string[]
  ) {
    let resolvedOrderId = '';
    let resolvedOrderNumber = '';
    let resolvedAmount = 0;
    let resolvedSellerIds: string[] | undefined = undefined;

    if (typeof orderIdOrParams === 'object') {
      resolvedOrderId = orderIdOrParams.orderId;
      resolvedOrderNumber = orderIdOrParams.orderNumber || orderIdOrParams.orderId;
      resolvedAmount = orderIdOrParams.total || orderIdOrParams.amount || 0;
      resolvedSellerIds = orderIdOrParams.sellerIds;
    } else {
      resolvedOrderId = orderIdOrParams;
      resolvedOrderNumber = orderNumber || orderIdOrParams;
      resolvedAmount = amount || 0;
      resolvedSellerIds = sellerIds;
    }

    // Notify Admin
    this.addNotification({
      recipientRole: 'admin',
      title: `طلب شراء جديد #${resolvedOrderNumber}`,
      message: `تم إنشاء طلب شراء جديد رقم #${resolvedOrderNumber} بإجمالي ${resolvedAmount.toLocaleString()} ج.م بانتظار المتابعة.`,
      type: 'new_order',
      actionPage: 'admin-dashboard',
      actionTab: 'orders',
      metadata: { orderId: resolvedOrderId, orderNumber: resolvedOrderNumber, amount: resolvedAmount }
    });

    // Notify Sellers
    if (resolvedSellerIds && resolvedSellerIds.length > 0) {
      resolvedSellerIds.forEach((sId) => {
        this.addNotification({
          recipientRole: 'seller',
          recipientId: sId,
          title: `طلب شراء جديد لمنتجات ورشتك #${resolvedOrderNumber}`,
          message: `لديك طلب جديد يحتوي على منتجات من ورشتك بقيمة تقريبية ${resolvedAmount.toLocaleString()} ج.م. يرجى تجهيز الطرد.`,
          type: 'new_order',
          actionPage: 'seller-dashboard',
          actionTab: 'orders',
          metadata: { orderId: resolvedOrderId, orderNumber: resolvedOrderNumber, amount: resolvedAmount, sellerId: sId }
        });
      });
    } else {
      this.addNotification({
        recipientRole: 'seller',
        title: `طلب شراء جديد #${resolvedOrderNumber}`,
        message: `لديك طلب جديد يحتوي على منتجات من ورشتك بقيمة ${resolvedAmount.toLocaleString()} ج.م.`,
        type: 'new_order',
        actionPage: 'seller-dashboard',
        actionTab: 'orders',
        metadata: { orderId: resolvedOrderId, orderNumber: resolvedOrderNumber, amount: resolvedAmount }
      });
    }
  }

  notifyOrderStatus(params: {
    orderId: string;
    orderNumber?: string;
    newStatus: string;
    buyerId?: string;
    sellerId?: string;
  }) {
    const statusLabels: Record<string, string> = {
      pending: 'قيد المراجعة والانتظار',
      processing: 'جاري التجهيز والإعداد في الورشة',
      shipped: 'تم الشحن وفي طريقها للتسليم',
      delivered: 'تم التوصيل بنجاح',
      cancelled: 'تم الإلغاء'
    };
    const label = statusLabels[params.newStatus] || params.newStatus;

    // Notify Buyer
    if (params.buyerId) {
      this.addNotification({
        recipientRole: 'buyer',
        recipientId: params.buyerId,
        title: `تحديث حالة طلبك #${params.orderNumber || params.orderId}`,
        message: `تم تحديث حالة طلبك إلى: "${label}".`,
        type: 'order_status_changed',
        actionPage: 'buyer-account',
        actionTab: 'orders',
        metadata: { orderId: params.orderId, orderNumber: params.orderNumber }
      });
    }

    // Notify Seller
    if (params.sellerId) {
      this.addNotification({
        recipientRole: 'seller',
        recipientId: params.sellerId,
        title: `تحديث حالة الطلب #${params.orderNumber || params.orderId}`,
        message: `تم تحديث حالة الطلب إلى "${label}".`,
        type: 'order_status_changed',
        actionPage: 'seller-dashboard',
        actionTab: 'orders',
        metadata: { orderId: params.orderId, orderNumber: params.orderNumber }
      });
    }
  }

  notifyProductApprovalStatus(
    sellerIdOrParams: string | { sellerId?: string; productId?: string; productTitle: string; status: 'approved' | 'rejected'; reason?: string },
    productTitle?: string,
    status?: 'approved' | 'rejected',
    reason?: string
  ) {
    let resolvedSellerId = 'seller-1';
    let resolvedTitle = '';
    let resolvedStatus: 'approved' | 'rejected' = 'approved';
    let resolvedReason: string | undefined = undefined;

    if (typeof sellerIdOrParams === 'object') {
      resolvedSellerId = sellerIdOrParams.sellerId || 'seller-1';
      resolvedTitle = sellerIdOrParams.productTitle;
      resolvedStatus = sellerIdOrParams.status;
      resolvedReason = sellerIdOrParams.reason;
    } else {
      resolvedSellerId = sellerIdOrParams;
      resolvedTitle = productTitle || '';
      resolvedStatus = status || 'approved';
      resolvedReason = reason;
    }

    if (resolvedStatus === 'approved') {
      this.addNotification({
        recipientRole: 'seller',
        recipientId: resolvedSellerId,
        title: 'تمت الموافقة على منتجك بنجاح!',
        message: `تم اعتماد منتجك "${resolvedTitle}" من قِبل إدارة المنصة وهو الآن معروض للشراء.`,
        type: 'product_approved',
        actionPage: 'seller-dashboard',
        actionTab: 'products',
        metadata: { productTitle: resolvedTitle, sellerId: resolvedSellerId }
      });
    } else {
      this.addNotification({
        recipientRole: 'seller',
        recipientId: resolvedSellerId,
        title: 'تم رفض اعتماد المنتج',
        message: `تعذر اعتماد منتج "${resolvedTitle}". ${resolvedReason ? `السبب: ${resolvedReason}` : 'يرجى مراجعة المعايير وتعديل البيانات.'}`,
        type: 'product_rejected',
        actionPage: 'seller-dashboard',
        actionTab: 'products',
        metadata: { productTitle: resolvedTitle, sellerId: resolvedSellerId }
      });
    }
  }

  notifyPayoutStatus(sellerId: string, amount: number, status: 'approved' | 'paid' | 'rejected', reason?: string) {
    if (status === 'paid') {
      this.addNotification({
        recipientRole: 'seller',
        recipientId: sellerId,
        title: 'تم تحويل مستحقاتك المالية',
        message: `تم تحويل مبلغ ${amount.toLocaleString()} ج.م إلى حسابك المسجل بنجاح.`,
        type: 'payout_paid',
        actionPage: 'seller-dashboard',
        actionTab: 'payouts',
        metadata: { amount, sellerId }
      });
    } else if (status === 'approved') {
      this.addNotification({
        recipientRole: 'seller',
        recipientId: sellerId,
        title: 'تمت الموافقة على طلب سحب الأرباح',
        message: `تمت الموافقة على طلب السحب بقيمة ${amount.toLocaleString()} ج.م وجارٍ تنفيذ التحويل.`,
        type: 'payout_approved',
        actionPage: 'seller-dashboard',
        actionTab: 'payouts',
        metadata: { amount, sellerId }
      });
    } else if (status === 'rejected') {
      this.addNotification({
        recipientRole: 'seller',
        recipientId: sellerId,
        title: 'تم رفض طلب سحب الأرباح',
        message: `تم رفض طلب السحب بقيمة ${amount.toLocaleString()} ج.م. ${reason ? `السبب: ${reason}` : ''}`,
        type: 'payout_rejected',
        actionPage: 'seller-dashboard',
        actionTab: 'payouts',
        metadata: { amount, sellerId }
      });
    }
  }

  notifyLowStock(sellerId: string, productTitle: string, currentStock: number) {
    this.addNotification({
      recipientRole: 'seller',
      recipientId: sellerId,
      title: 'تنبيه: اقتراب نفاد المخزون',
      message: `متبقي ${currentStock} قطع فقط من "${productTitle}". يرجى تحديث المخزون بالورشة لتفادي إيقاف البيع.`,
      type: 'low_stock',
      actionPage: 'seller-dashboard',
      actionTab: 'inventory',
      metadata: { productTitle, stockCount: currentStock, sellerId }
    });
  }

  notifyNewReview(sellerId: string, productTitle: string, rating: number, comment: string) {
    this.addNotification({
      recipientRole: 'seller',
      recipientId: sellerId,
      title: `تقييم جديد (${rating} نجوم) لمنتجك`,
      message: `تم تقييم منتج "${productTitle}": "${comment.substring(0, 70)}${comment.length > 70 ? '...' : ''}"`,
      type: 'new_review',
      actionPage: 'seller-dashboard',
      actionTab: 'products',
      metadata: { productTitle, rating, sellerId }
    });

    // Notify Admin about new review
    this.addNotification({
      recipientRole: 'admin',
      title: `تقييم مضاف لمنتج "${productTitle}"`,
      message: `أضاف أحد المشترين تقييم (${rating}★): "${comment.substring(0, 60)}..."`,
      type: 'new_review',
      actionPage: 'admin-dashboard',
      actionTab: 'reviews',
      metadata: { productTitle, rating }
    });
  }
}

export const notificationService = new NotificationService();

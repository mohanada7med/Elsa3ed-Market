/**
 * WAH | وه — Web Push Notification Client Service
 * 
 * Manages VAPID key negotiation, ServiceWorker pushManager subscriptions,
 * server synchronization, and native push permissions.
 */

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PUSH_STORAGE_KEY = 'wah_web_push_subscribed_v1';

class PushNotificationService {
  private vapidPublicKey: string | null = null;

  /**
   * Check if the current browser environment supports Service Worker and Web Push
   */
  public isPushSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Get current browser notification permission
   */
  public getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isPushSupported()) return 'unsupported';
    return Notification.permission;
  }

  /**
   * Fetch the server's public VAPID key
   */
  public async getVapidPublicKey(): Promise<string | null> {
    if (this.vapidPublicKey) return this.vapidPublicKey;

    try {
      const res = await fetch('/api/push/vapid-public-key');
      const data = await res.json();
      if (data.success && data.publicKey) {
        this.vapidPublicKey = data.publicKey;
        return data.publicKey;
      }
    } catch (err) {
      console.warn('[PushService] Could not fetch VAPID key from server:', err);
    }
    return null;
  }

  /**
   * Check if current browser currently has an active Push Subscription
   */
  public async getActiveSubscription(): Promise<PushSubscription | null> {
    if (!this.isPushSupported()) return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (err) {
      console.warn('[PushService] Error reading active subscription:', err);
      return null;
    }
  }

  /**
   * Check if user is marked as subscribed
   */
  public async isSubscribed(): Promise<boolean> {
    const sub = await this.getActiveSubscription();
    return sub !== null;
  }

  /**
   * Subscribe user device to Web Push notifications
   */
  public async subscribeUser(user?: { id?: string; role?: string }): Promise<{
    success: boolean;
    subscription?: PushSubscription;
    error?: string;
  }> {
    if (!this.isPushSupported()) {
      return { success: false, error: 'المتصفح الحالي لا يدعم ميزة الإشعارات الفورية (Web Push)' };
    }

    try {
      // 1. Request Permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return { success: false, error: 'تم رفض إذن الإشعارات من قِبل المتصفح' };
      }

      // 2. Fetch VAPID key
      const key = await this.getVapidPublicKey();
      if (!key) {
        return { success: false, error: 'تعذر الاتصال بخادم الإشعارات الفورية' };
      }

      // 3. Register push with Service Worker
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const convertedVapidKey = urlBase64ToUint8Array(key);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      }

      // 4. Send subscription to backend API
      const subJSON = subscription.toJSON();
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: subJSON.keys,
          expirationTime: subscription.expirationTime,
          userId: user?.id,
          role: user?.role
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل مزامنة اشتراك الإشعار مع الخادم');
      }

      localStorage.setItem(PUSH_STORAGE_KEY, 'true');
      return { success: true, subscription };
    } catch (err: any) {
      console.error('[PushService] Subscription failed:', err);
      return { success: false, error: err?.message || 'حدث خطأ أثناء تفعيل الإشعارات' };
    }
  }

  /**
   * Unsubscribe user device from Web Push notifications
   */
  public async unsubscribeUser(): Promise<boolean> {
    if (!this.isPushSupported()) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        // Notify backend to remove endpoint
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint })
        }).catch(() => {});
      }

      localStorage.removeItem(PUSH_STORAGE_KEY);
      return true;
    } catch (err) {
      console.warn('[PushService] Unsubscription error:', err);
      return false;
    }
  }

  /**
   * Send a test Web Push notification to current device
   */
  public async sendTestNotification(): Promise<boolean> {
    const sub = await this.getActiveSubscription();
    if (!sub) return false;

    try {
      const subJSON = sub.toJSON();
      const res = await fetch('/api/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: subJSON.keys
        })
      });
      const data = await res.json();
      return Boolean(data.success);
    } catch {
      return false;
    }
  }
}

export const pushNotificationService = new PushNotificationService();

/**
 * Browser Web Push & Native Notification Service for Souq El-Saeed
 * Handles browser notification permissions, background notifications, audio chimes, and notification settings.
 */

export interface BrowserNotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  notifyOrders: boolean;
  notifyMessages: boolean;
  notifyStock: boolean;
  notifySystem: boolean;
}

const SETTINGS_STORAGE_KEY = 'saeed_browser_notifications_config_v1';

const DEFAULT_SETTINGS: BrowserNotificationSettings = {
  enabled: true,
  soundEnabled: true,
  notifyOrders: true,
  notifyMessages: true,
  notifyStock: true,
  notifySystem: true
};

class BrowserNotificationService {
  private settings: BrowserNotificationSettings = DEFAULT_SETTINGS;
  private audioCtx: AudioContext | null = null;
  private navigationCallback: ((page: string, tab?: string, meta?: any) => void) | null = null;

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      this.settings = DEFAULT_SETTINGS;
    }
  }

  private saveSettings() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (err) {
      console.warn('Failed to save browser notification settings:', err);
    }
  }

  public getSettings(): BrowserNotificationSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<BrowserNotificationSettings>): BrowserNotificationSettings {
    this.settings = { ...this.settings, ...partial };
    this.saveSettings();
    return this.getSettings();
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  public setNavigationHandler(cb: (page: string, tab?: string, meta?: any) => void) {
    this.navigationCallback = cb;
  }

  /**
   * Request native browser permission for notifications
   */
  public async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.isSupported()) {
      return 'unsupported';
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.updateSettings({ enabled: true });
        // Play a subtle confirmation sound
        this.playSound('message');
      }
      return permission;
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return this.getPermission();
    }
  }

  /**
   * Synthesize harmonic notification chimes using Web Audio API
   * Zero external MP3 dependency, ultra-low latency & 100% reliable across browsers
   */
  public playSound(type: 'order' | 'message' | 'alert' | 'success' = 'message') {
    if (!this.settings.soundEnabled || typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      const now = this.audioCtx.currentTime;

      if (type === 'order') {
        // High-energy celebratory chime for new order (3 ascending melodic bell tones)
        const freqs = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
        freqs.forEach((f, i) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.09);

          gain.gain.setValueAtTime(0.001, now + i * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.2, now + i * 0.09 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.45);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now + i * 0.09);
          osc.stop(now + i * 0.09 + 0.46);
        });
      } else if (type === 'message') {
        // Soft double-tap chime for chat message
        const freqs = [659.25, 880.0]; // E5, A5
        freqs.forEach((f, i) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.1);

          gain.gain.setValueAtTime(0.001, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.1 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.35);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.36);
        });
      } else {
        // Subtle alert note
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(698.46, now); // F5
        osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.25); // C5

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.31);
      }
    } catch (err) {
      // Audio playback fails gracefully if user hasn't interacted with DOM yet
    }
  }

  /**
   * Trigger a push/native browser notification with fallback to sound
   */
  public sendNotification(options: {
    title: string;
    body: string;
    type?: 'order' | 'message' | 'stock' | 'system';
    actionPage?: string;
    actionTab?: string;
    metadata?: any;
    tag?: string;
    onClick?: () => void;
  }) {
    if (!this.settings.enabled) return;

    // Check specific toggle category
    if (options.type === 'order' && !this.settings.notifyOrders) return;
    if (options.type === 'message' && !this.settings.notifyMessages) return;
    if (options.type === 'stock' && !this.settings.notifyStock) return;
    if (options.type === 'system' && !this.settings.notifySystem) return;

    // Play chime sound
    const soundType = options.type === 'order' ? 'order' : options.type === 'message' ? 'message' : 'alert';
    this.playSound(soundType);

    // Native Browser Notification
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        const notif = new Notification(options.title, {
          body: options.body,
          icon: '/favicon.ico',
          tag: options.tag || options.type || 'saeed-alert',
          dir: 'rtl',
          lang: 'ar',
          badge: '/favicon.ico'
        });

        notif.onclick = () => {
          try {
            window.focus();
          } catch {}

          if (options.onClick) {
            options.onClick();
          } else if (options.actionPage && this.navigationCallback) {
            this.navigationCallback(options.actionPage, options.actionTab, options.metadata);
          }
          notif.close();
        };
      } catch (err) {
        console.warn('Native notification spawn failed:', err);
      }
    }
  }

  /**
   * Helper specifically for incoming chat messages
   */
  public notifyIncomingMessage(senderName: string, messageText: string, conversationId?: string) {
    this.sendNotification({
      title: `رسالة جديدة من ${senderName} 💬`,
      body: messageText.length > 90 ? `${messageText.substring(0, 90)}...` : messageText,
      type: 'message',
      actionPage: 'messages',
      metadata: { conversationId },
      tag: `msg-${conversationId || 'chat'}`
    });
  }

  /**
   * Helper specifically for newly placed orders
   */
  public notifyNewOrder(orderNumber: string, amount: number, isSeller: boolean) {
    this.sendNotification({
      title: isSeller ? `طلب شراء جديد لورشة عملك! 📦 (#${orderNumber})` : `تم تأكيد طلبك بنجاح! 🛍️ (#${orderNumber})`,
      body: isSeller
        ? `لديك طلب جديد بإجمالي ${amount.toLocaleString()} ج.م. يرجى مراجعة تفاصيل الطرد وبدء التجهيز.`
        : `شكراً لدعمك الحرف التراثية. طلبك رقم #${orderNumber} قيد المراجعة والإعداد.`,
      type: 'order',
      actionPage: isSeller ? 'seller-dashboard' : 'buyer-account',
      actionTab: 'orders',
      tag: `order-${orderNumber}`
    });
  }

  /**
   * Helper for order status changes
   */
  public notifyOrderStatus(orderNumber: string, statusLabel: string, isBuyer: boolean) {
    this.sendNotification({
      title: `تحديث حالة الطلب #${orderNumber}`,
      body: `حالة طلبك أصبحت الآن: "${statusLabel}"`,
      type: 'order',
      actionPage: isBuyer ? 'buyer-account' : 'seller-dashboard',
      actionTab: 'orders',
      tag: `status-${orderNumber}`
    });
  }

  /**
   * Trigger a test notification for user preview and confirmation
   */
  public sendTestNotification() {
    this.sendNotification({
      title: 'سوق الصعيد - تجربة الإشعارات الفورية ✨',
      body: 'تهانينا! نظام الإشعارات الفورية والتنبيهات الصوتية يعمل بكفاءة تامة على جهازك.',
      type: 'system',
      actionPage: 'home',
      tag: 'test-saeed-push'
    });
  }
}

export const browserNotificationService = new BrowserNotificationService();

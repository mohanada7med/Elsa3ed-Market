import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService } from '../services/pushNotificationService';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [isPushLoading, setIsPushLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Initial connectivity check
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 2. Check device platform
    const userAgent = window.navigator.userAgent || '';
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // 3. Check if running in standalone PWA mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) {
      setIsInstalled(true);
    }

    // 4. Check if early captured prompt already exists
    if ((window as any).__wahDeferredPrompt) {
      setDeferredPrompt((window as any).__wahDeferredPrompt);
      setIsInstallable(true);
    }

    const handlePwaReady = () => {
      if ((window as any).__wahDeferredPrompt) {
        setDeferredPrompt((window as any).__wahDeferredPrompt);
        setIsInstallable(true);
      }
    };
    window.addEventListener('wah:pwa-ready', handlePwaReady);

    // 5. Intercept PWA Install Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__wahDeferredPrompt = e;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      (window as any).__wahDeferredPrompt = null;
      console.log('[WAH PWA] App was successfully installed!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 6. Check push subscription status
    pushNotificationService.isSubscribed().then(setIsPushSubscribed).catch(() => {});

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('wah:pwa-ready', handlePwaReady);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'manual_instructions'> => {
    const prompt = deferredPrompt || (typeof window !== 'undefined' ? (window as any).__wahDeferredPrompt : null);

    if (prompt) {
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
          (window as any).__wahDeferredPrompt = null;
        }
        return choice.outcome;
      } catch (err) {
        console.warn('[WAH PWA] Error displaying native prompt:', err);
      }
    }

    return 'manual_instructions';
  }, [deferredPrompt]);

  const togglePushNotifications = useCallback(
    async (user?: { id?: string; role?: string }): Promise<boolean> => {
      setIsPushLoading(true);
      try {
        if (isPushSubscribed) {
          const unsubscribed = await pushNotificationService.unsubscribeUser();
          if (unsubscribed) {
            setIsPushSubscribed(false);
          }
          return !unsubscribed;
        } else {
          const result = await pushNotificationService.subscribeUser(user);
          if (result.success) {
            setIsPushSubscribed(true);
            return true;
          }
          return false;
        }
      } finally {
        setIsPushLoading(false);
      }
    },
    [isPushSubscribed]
  );

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    isIOS,
    isOnline,
    promptInstall,
    isPushSubscribed,
    isPushLoading,
    togglePushNotifications
  };
}

import React, { useState, useEffect } from 'react';
import { Download, X, WifiOff } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

const DISMISS_STORAGE_KEY = 'wah_pwa_install_dismissed_until';
const DISMISS_DAYS = 7;

const DISPLAY_FONT = "'Lalezar', 'Cairo', system-ui, sans-serif";

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isStandalone, isOnline, promptInstall } = usePWA();
  const [isDismissed, setIsDismissed] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const dismissedUntil = localStorage.getItem(DISMISS_STORAGE_KEY);
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        setIsDismissed(true);
        return;
      }
    } catch { }

    setIsDismissed(false);
  }, []);

  const handleDismiss = () => {
    try {
      const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(DISMISS_STORAGE_KEY, String(until));
    } catch { }
    setIsLeaving(true);
    window.setTimeout(() => setIsDismissed(true), 220);
  };

  const handleInstallClick = async () => {
    const outcome = await promptInstall();
    if (outcome === 'accepted' || outcome === 'dismissed') {
      handleDismiss();
    }
  };

  return (
    <>
      <style>{`
        @keyframes wah-pop {
          0%   { opacity: 0; transform: scale(.4) rotate(-8deg); }
          65%  { opacity: 1; transform: scale(1.06) rotate(1.5deg); }
          100% { opacity: 1; transform: scale(1) rotate(-1.5deg); }
        }
        @keyframes wah-pop-out {
          to { opacity: 0; transform: scale(.5) rotate(6deg); }
        }
        .wah-bubble-in  { animation: wah-pop 460ms cubic-bezier(.2,.9,.3,1) both; transform-origin: 85% 100%; }
        .wah-bubble-out { animation: wah-pop-out 220ms ease-in both; transform-origin: 85% 100%; }
        @media (prefers-reduced-motion: reduce) {
          .wah-bubble-in, .wah-bubble-out { animation: none; }
        }
      `}</style>

      {/* Offline status pill */}
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 rounded-full bg-[#2A180E] text-[#F6E7C8] px-3.5 py-1.5 text-xs font-bold shadow-xl ring-1 ring-[#C99444]/40"
        >
          <WifiOff className="w-3.5 h-3.5 text-[#C99444] shrink-0" />
          <span>أوفلاين — التصفح من الذاكرة المحفوظة</span>
        </div>
      )}

      {/* Install bubble */}
      {!isStandalone && !isInstalled && isInstallable && !isDismissed && (
        <aside
          aria-label="تثبيت تطبيق وه"
          className={`fixed bottom-5 right-4 sm:right-6 z-[9998] ${
            isLeaving ? 'wah-bubble-out' : 'wah-bubble-in'
          }`}
        >
          <div className="relative">
            <button
              type="button"
              onClick={handleInstallClick}
              aria-label="ثبّت تطبيق وه على هاتفك"
              className="group relative flex items-center gap-3 ps-2.5 pe-2.5 py-2.5 rounded-[22px] bg-[#FFF3D6] border-2 border-[#2A180E] shadow-[4px_4px_0_#2A180E] transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_#2A180E] active:translate-x-[4px] active:translate-y-[4px] active:shadow-[0_0_0_#2A180E] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C99444]"
            >
              <img
                src="/icons/icon-192x192.png"
                alt=""
                className="w-11 h-11 rounded-xl object-cover border-2 border-[#2A180E] shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/mascot/logo.png';
                }}
              />

              <span className="text-start leading-tight pe-1">
                <span
                  className="block text-[19px] text-[#2A180E]"
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  خد وه معاك 🏺
                </span>
                <span className="block text-[11px] font-bold text-[#2A180E]/60">
                  ثبّته على شاشتك مجاناً
                </span>
              </span>

              <span className="grid place-items-center w-10 h-10 rounded-full bg-[#C99444] border-2 border-[#2A180E] text-[#2A180E] shrink-0">
                <Download className="w-[18px] h-[18px]" strokeWidth={2.5} />
              </span>
            </button>

            {/* Speech-bubble tail */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-[9px] right-9 w-4 h-4 rotate-45 bg-[#FFF3D6] border-b-2 border-r-2 border-[#2A180E]"
            />

            {/* Dismiss badge on the corner */}
            <button
              type="button"
              onClick={handleDismiss}
              title="إغلاق"
              aria-label="إغلاق التنبيه"
              className="absolute -top-2 -left-2 grid place-items-center w-6 h-6 rounded-full bg-[#2A180E] text-[#FFF3D6] hover:bg-[#4A2C18] transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C99444]"
            >
              <X className="w-3.5 h-3.5" strokeWidth={3} />
            </button>
          </div>
        </aside>
      )}
    </>
  );
};

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Sparkles,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import toastMascotPlaceholders from '../../config/toastMascotPlaceholders.json';

const TOAST_ASSETS = {
  success: {
    png: '/mascot/success.png',
    webp: '/mascot/success.webp',
    placeholder: (toastMascotPlaceholders as Record<string, string>).success || '',
  },
  error: {
    png: '/mascot/wrong.png',
    webp: '/mascot/wrong.webp',
    placeholder: (toastMascotPlaceholders as Record<string, string>).wrong || '',
  },
  warning: {
    png: '/mascot/warning.png',
    webp: '/mascot/warning.webp',
    placeholder: (toastMascotPlaceholders as Record<string, string>).warning || '',
  },
  info: {
    png: '/mascot/info.png',
    webp: '/mascot/info.webp',
    placeholder: (toastMascotPlaceholders as Record<string, string>).info || '',
  },
  // Additional decorative assets
  sparkles: {
    png: '/mascot/sparkles.png',
    webp: '/mascot/sparkles.webp',
  },
  heart: {
    png: '/mascot/heart.png',
    webp: '/mascot/heart.webp',
  },
  fallback: '/mascot/welcoming.png',
  background: '/pattern/pat1.svg',
};
const toastThemes = {
  success: {
    label: 'يا سلام يا غالي!',
    color: '#24966B',
    soft: '#E1F5E9',
    image: TOAST_ASSETS.success.png,
    webp: TOAST_ASSETS.success.webp,
    placeholder: TOAST_ASSETS.success.placeholder,
  },
  error: {
    label: 'يا ساتر!',
    color: '#D94D55',
    soft: '#FCE5E3',
    image: TOAST_ASSETS.error.png,
    webp: TOAST_ASSETS.error.webp,
    placeholder: TOAST_ASSETS.error.placeholder,
  },
  warning: {
    label: 'خد بالك يا صاحبي!',
    color: '#CB852B',
    soft: '#FFF0D5',
    image: TOAST_ASSETS.warning.png,
    webp: TOAST_ASSETS.warning.webp,
    placeholder: TOAST_ASSETS.warning.placeholder,
  },
  info: {
    label: 'عم وه عنده كلام!',
    color: '#B16C3C',
    soft: '#F5E7D6',
    image: TOAST_ASSETS.info.png,
    webp: TOAST_ASSETS.info.webp,
    placeholder: TOAST_ASSETS.info.placeholder,
  },
};

/**
 * Resilient, high-performance Mascot Avatar for Toasts.
 * Guarantees zero blank flashes, instant placeholder display, WebP/PNG support,
 * and graceful fallback.
 */
const ToastMascotAvatar: React.FC<{
  theme: typeof toastThemes.success;
}> = ({ theme }) => {
  const [currentSrc, setCurrentSrc] = useState<string>(theme.webp);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // When theme changes or on mount, verify cached status
  useEffect(() => {
    setCurrentSrc(theme.webp);
    setIsLoaded(false);
  }, [theme.webp]);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* 1. Instant blurred placeholder while the image decodes */}
      {!isLoaded && theme.placeholder && (
        <img
          src={theme.placeholder}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-contain filter blur-[1.5px] opacity-70 transition-opacity duration-200"
        />
      )}

      {/* 2. Primary crisp image with WebP priority + PNG failover */}
      <picture className="relative z-10 flex h-full w-full items-center justify-center">
        <source srcSet={theme.webp} type="image/webp" />
        <motion.img
          src={currentSrc}
          alt="عم وه"
          loading="eager"
          decoding="sync"
          draggable={false}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            if (currentSrc === theme.webp) {
              // Try standard PNG
              setCurrentSrc(theme.image);
            } else if (currentSrc !== TOAST_ASSETS.fallback) {
              // Fallback to welcoming mascot
              setCurrentSrc(TOAST_ASSETS.fallback);
            }
          }}
          className={`relative z-10 h-full w-full object-contain drop-shadow-lg transition-opacity duration-150 ${isLoaded ? 'opacity-100' : 'opacity-90'
            }`}
          animate={{
            scale: [1, 1.035, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </picture>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  // Eagerly pre-warm all 4 mascot images into memory on mount so they appear with 0ms delay
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const preloadList = [
      TOAST_ASSETS.success.webp,
      TOAST_ASSETS.success.png,
      TOAST_ASSETS.error.webp,
      TOAST_ASSETS.error.png,
      TOAST_ASSETS.warning.webp,
      TOAST_ASSETS.warning.png,
      TOAST_ASSETS.info.webp,
      TOAST_ASSETS.info.png,
      TOAST_ASSETS.background,
    ];
    preloadList.forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      id="toast-container"
      aria-live="polite"
      className="
        pointer-events-none fixed
        left-1/2 top-[max(1.25rem,env(safe-area-inset-top))]
        z-[2147483647] flex w-[calc(100vw-24px)]
        max-w-[420px] -translate-x-1/2
        flex-col gap-5 overflow-y-auto
        overscroll-contain px-1 pb-3
        max-h-[calc(100dvh-2rem)]
        sm:left-auto sm:right-7 sm:translate-x-0
      "
      style={{ zIndex: 2147483647 }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const theme =
            toastThemes[toast.type as keyof typeof toastThemes] ||
            toastThemes.success;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{
                opacity: 0,
                x: 120,
                y: 30,
                scale: 0.7,
                rotate: -8,
              }}
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0,
              }}
              exit={{
                opacity: 0,
                x: 120,
                scale: 0.75,
                rotate: 8,
              }}
              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 20,
                mass: 0.75,
              }}
              id={`toast-${toast.id}`}
              role={
                toast.type === 'error' || toast.type === 'warning'
                  ? 'alert'
                  : 'status'
              }
              aria-atomic="true"
              dir="rtl"
              className="pointer-events-auto relative pt-2"
            >
              {/* Floating decorations */}
              <motion.div
                animate={{
                  y: [0, -7, 0],
                  rotate: [0, 12, -8, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-1 left-14 z-20 text-[#E9AC4D]"
              >
                <Star size={15} fill="currentColor" />
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 6, 0],
                  rotate: [0, -15, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="absolute -right-1 top-12 z-20 text-[#D58A50]"
              >
                <Sparkles size={17} />
              </motion.div>

              {/* Main toast */}
              <div
                className="
                  relative overflow-hidden
                  rounded-[27px] border-2
                  border-[#E6D1B6]
                  bg-[#FFF9EF]
                  shadow-[0_10px_0_#D9C3A6,0_20px_40px_rgba(60,40,20,.15)]
                  dark:border-[#66503A]
                  dark:bg-[#292019]
                  dark:shadow-[0_10px_0_#3E2E21,0_20px_40px_rgba(0,0,0,.35)]
                "
              >
                {/* Background image */}
                <img
                  src={TOAST_ASSETS.background}
                  alt=""
                  aria-hidden="true"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                  className="
                    pointer-events-none absolute inset-0
                    h-full w-full object-cover opacity-[0.09]
                    dark:opacity-[0.06]
                  "
                />

                {/* Theme glow */}
                <div
                  className="pointer-events-none absolute right-0 top-0 h-full w-36 opacity-40"
                  style={{
                    background: `radial-gradient(circle at center, ${theme.soft}, transparent 75%)`,
                  }}
                />

                <div className="relative flex items-center gap-2.5 p-3 sm:gap-3 sm:p-4">

                  {/* Uncle Wah character image */}
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                      rotate: [0, 2, -2, 0],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="
                      relative z-10 flex h-[110px] w-[100px]
                      shrink-0 items-center justify-center
                    "
                  >
                    {/* Character shadow */}
                    <div className="
                      absolute bottom-1 h-3 w-16
                      rounded-full bg-black/15 blur-md
                    " />

                    {/* Character with instant loading and fallback */}
                    <ToastMascotAvatar theme={theme} />

                    {/* Floating status glow */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.9, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="
                        absolute right-0 top-2
                        h-3 w-3 rounded-full
                      "
                      style={{
                        backgroundColor: theme.color,
                        boxShadow: `0 0 15px ${theme.color}`,
                      }}
                    />
                  </motion.div>

                  {/* Speech bubble */}
                  <div className="relative min-w-0 flex-1 self-center">

                    {/* Speech tail */}
                    <div
                      className="
                        absolute -right-[7px] top-[23px]
                        h-3 w-3 rotate-45
                        border-b border-r
                        border-[#E7D4BB]
                        bg-[#FFFDF8]
                        dark:border-[#66503A]
                        dark:bg-[#33271E]
                      "
                    />

                    <div
                      className="
                        relative rounded-[19px]
                        border border-[#E7D4BB]
                        bg-[#FFFDF8]/95 p-3
                        shadow-[0_4px_0_rgba(125,88,48,.08)]
                        dark:border-[#66503A]
                        dark:bg-[#33271E]/95
                      "
                    >
                      {/* Label */}
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: theme.color }}
                        />

                        <span
                          className="text-[10px] font-black"
                          style={{ color: theme.color }}
                        >
                          {theme.label}
                        </span>
                      </div>

                      <h4 className="
                        text-[13px] font-black leading-6
                        text-[#3B2B20] dark:text-[#FFF4E5]
                      ">
                        {toast.title}
                      </h4>

                      <p className="
                        mt-1 break-words text-[11px]
                        font-medium leading-[1.9]
                        text-[#806E5C] dark:text-[#D8C6B2]
                      ">
                        {toast.message}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <div className="mt-2 flex items-center justify-between px-1">
                      <span className="
                        text-[9px] font-black tracking-wider
                        text-[#A58D72] dark:text-white/35
                      ">
                        عم وه • WAH
                      </span>

                      <span className="
                        text-[9px] font-semibold
                        text-[#A58D72] dark:text-white/35
                      ">
                        {toast.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Close */}
                  <button
                    type="button"
                    id={`toast-close-${toast.id}`}
                    onClick={() => removeToast(toast.id)}
                    aria-label="إغلاق التنبيه"
                    className="
                      absolute left-2 top-2 z-30
                      flex h-7 w-7 items-center justify-center
                      rounded-full bg-[#EDE2D2]
                      text-[#826B53] transition-all
                      hover:rotate-90 hover:bg-[#E2CDB2]
                      focus-visible:outline focus-visible:outline-2
                      focus-visible:outline-[#B16C3C]
                      dark:bg-white/10 dark:text-white/60
                      dark:hover:bg-white/20
                    "
                  >
                    <X size={13} />
                  </button>
                </div>

                {/* Bottom progress line */}
                <div className="
                  absolute bottom-0 left-5 right-5
                  h-[3px] overflow-hidden rounded-full
                  bg-[#E9DDCC] dark:bg-white/10
                ">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{
                      duration: 1.2,
                      ease: 'easeOut',
                    }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: theme.color }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
};

import React from 'react';
import { Compass, Sparkles, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export interface UncleWahHeroBannerProps {
  doorTitle: string;
  doorBadge: string;
  mascotSrc: string;
  mascotRole: string;
  quote: string;
  statsText?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const UncleWahHeroBanner: React.FC<UncleWahHeroBannerProps> = ({
  doorTitle,
  doorBadge,
  mascotSrc,
  mascotRole,
  quote,
  statsText,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      dir="rtl"
      className={`relative overflow-hidden rounded-3xl sm:rounded-4xl border border-primary/30 bg-gradient-to-br from-surface-subtle via-surface-subtle/95 to-primary/10 p-5 sm:p-7 lg:p-8 shadow-xl backdrop-blur-xl ${className}`}
    >
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />

      {/* Decorative subtle sun-ring */}
      <div className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 h-52 w-52 rounded-full border border-dashed border-primary/20 opacity-60" />

      <div className="relative z-10 grid items-center gap-6 sm:gap-8 lg:grid-cols-[auto_1fr_auto]">
        {/* MASCOT AVATAR / CUTOUT WITH SHADOW & FLOATING */}
        <div className="relative mx-auto flex flex-col items-center justify-end lg:mx-0 shrink-0">
          <div className="absolute -inset-3 rounded-full bg-primary/20 blur-xl animate-pulse pointer-events-none" />
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
            className="relative select-none z-10"
          >
            <img
              src={mascotSrc || '/mascot/char.png'}
              alt={mascotRole}
              style={{
                imageRendering: 'crisp-edges',
                WebkitFontSmoothing: 'antialiased',
              }}
              className="h-40 sm:h-48 lg:h-56 w-auto object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.28)]"
              loading="eager"
            />
          </motion.div>

          {/* Ground shadow synchronized with subtle hover */}
          <motion.div
            animate={{ scale: [1, 0.82, 1], opacity: [0.35, 0.16, 0.35] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-28 sm:w-36 h-2 rounded-[100%] bg-black/45 blur-xs mx-auto -mt-1.5"
          />
        </div>

        {/* NARRATIVE & QUOTE FROM UNCLE WAH */}
        <div className="text-right space-y-3 min-w-0">
          {/* Eyebrow & Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white text-[10px] sm:text-xs font-black shadow-sm">
              <Compass size={12} className="animate-spin-slow shrink-0" />
              <span>{doorBadge}</span>
            </span>

            {/* Founder / Master of Platform Badge */}
            <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-900 dark:text-amber-200 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 shadow-2xs">
              <Sparkles size={11} className="shrink-0 text-amber-500" />
              <span>«عم وه» صاحب وموثّق المنصة</span>
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] font-black text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              <span>{mascotRole}</span>
            </span>

            {statsText && (
              <span className="text-[10px] font-bold text-foreground-disabled bg-background/50 px-2.5 py-0.5 rounded-md border border-border-subtle">
                {statsText}
              </span>
            )}
          </div>

          {/* Door title header */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-main text-foreground leading-tight">
            {doorTitle}
          </h2>

          {/* Speech bubble / Quote */}
          <div className="relative rounded-2xl bg-background/80 border border-primary/25 p-3.5 sm:p-4.5 shadow-sm backdrop-blur-md">
            <p className="text-xs sm:text-sm font-bold text-foreground/95 leading-relaxed sm:leading-7">
              "{quote}"
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[11px] font-black text-primary border-t border-border-subtle/70 pt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                — عم وه، صاحب وموثّق حكاوي وتراث الصعيد
              </span>
              <span className="text-foreground-disabled font-normal text-[10px]">
                توثيق صعيدى أصيل 100%
              </span>
            </div>
          </div>
        </div>

        {/* OPTIONAL ACTION BUTTON */}
        {actionText && (
          <div className="flex justify-center lg:justify-end shrink-0">
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-foreground text-background text-xs font-black shadow-lg hover:bg-primary hover:text-white transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <span>{actionText}</span>
              <ArrowLeft size={14} />
            </button>
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default UncleWahHeroBanner;

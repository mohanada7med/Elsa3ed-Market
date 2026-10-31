import React from 'react';

export interface HeritageSectionDividerProps {
  className?: string;
  variant?: 'diamond' | 'dots' | 'frame' | 'wave';
  label?: string;
}

export const HeritageSectionDivider: React.FC<HeritageSectionDividerProps> = ({
  className = '',
  variant = 'diamond',
  label
}) => {
  // 1. تصميم الجوهرة المزخرفة (Diamond Medallion)
  if (variant === 'diamond') {
    return (
      <div className={`w-full my-3 sm:my-4 flex items-center justify-center gap-4 max-w-4xl mx-auto px-4 pointer-events-none select-none ${className}`} aria-hidden="true">
        <div className="flex-1 h-px bg-[linear-gradient(90deg,transparent,#C99444)] opacity-50" />
        
        <div className="shrink-0 flex items-center gap-2.5 px-4 py-1 rounded-full border border-[#C99444]/40 bg-surface/90 shadow-sm backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C99444]" />
          <div className="w-2.5 h-2.5 rotate-45 bg-[#C99444] shadow-xs" />
          {label && (
            <span className="text-[10px] font-black tracking-[0.2em] text-primary dark:text-[#E0C79B] px-1">
              {label}
            </span>
          )}
          <div className="w-2.5 h-2.5 rotate-45 bg-[#C99444] shadow-xs" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#C99444]" />
        </div>

        <div className="flex-1 h-px bg-[linear-gradient(270deg,transparent,#C99444)] opacity-50" />
      </div>
    );
  }

  // 2. تصميم "النقاط المتتالية المتلاشية" (Faded Dots)
  if (variant === 'dots') {
    return (
      <div className={`w-full my-3 sm:my-4 flex flex-col items-center justify-center gap-2 max-w-4xl mx-auto px-4 pointer-events-none select-none ${className}`} aria-hidden="true">
        <div className="flex items-center gap-3 w-full justify-center">
          <div className="flex-1 h-px bg-[linear-gradient(90deg,transparent,rgba(201,148,68,0.3))]" />
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[#C99444]/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#C99444]/70" />
            <span className="w-2 h-2 rounded-full bg-[#C99444]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#C99444]/70" />
            <span className="w-1 h-1 rounded-full bg-[#C99444]/40" />
          </div>
          <div className="flex-1 h-px bg-[linear-gradient(270deg,transparent,rgba(201,148,68,0.3))]" />
        </div>
        {label && (
          <span className="text-[10px] font-bold tracking-widest text-primary dark:text-[#E0C79B]/80">
            {label}
          </span>
        )}
      </div>
    );
  }

  // 3. تصميم "الإطار المحفور الكلاسيكي" (Engraved Frame)
  if (variant === 'frame') {
    return (
      <div className={`w-full my-3 sm:my-4 flex items-center justify-center gap-3 max-w-4xl mx-auto px-4 pointer-events-none select-none ${className}`} aria-hidden="true">
        <div className="flex-1 h-[2px] bg-[linear-gradient(90deg,transparent,#C99444/60)] rounded-full" />
        
        <div className="shrink-0 px-5 py-1 rounded-lg border border-[#C99444]/30 bg-surface/60 backdrop-blur-xs flex items-center gap-2">
          <span className="w-1 h-3 bg-[#C99444] rounded-xs" />
          {label ? (
            <span className="text-[10px] font-black tracking-widest text-primary dark:text-[#E0C79B]">
              {label}
            </span>
          ) : (
            <span className="text-[10px] text-[#C99444]">✦</span>
          )}
          <span className="w-1 h-3 bg-[#C99444] rounded-xs" />
        </div>

        <div className="flex-1 h-[2px] bg-[linear-gradient(270deg,transparent,#C99444/60)] rounded-full" />
      </div>
    );
  }

  // 4. تصميم "الموجة التراثية الهادئة" (افتراضي - Wave Motif)
  return (
    <div
      className={`w-full my-3 sm:my-4 flex items-center justify-center gap-3 max-w-4xl mx-auto px-4 pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <div className="flex-1 h-px bg-[linear-gradient(90deg,transparent,rgba(201,148,68,0.4))]" />

      <div className="shrink-0 flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#C99444]/25 bg-surface/80 shadow-xs">
        <span className="text-xs text-[#C99444]">❖</span>
        {label && (
          <span className="text-[10px] font-black tracking-widest text-primary dark:text-[#E0C79B]">
            {label}
          </span>
        )}
        <span className="text-xs text-[#C99444]">❖</span>
      </div>

      <div className="flex-1 h-px bg-[linear-gradient(270deg,transparent,rgba(201,148,68,0.4))]" />
    </div>
  );
};

export default HeritageSectionDivider;
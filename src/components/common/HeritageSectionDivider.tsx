import React from 'react';

export interface HeritageSectionDividerProps {
  className?: string;
  variant?: 'ribbon' | 'flanked' | 'dots';
  opacity?: number;
  label?: string;
}

/**
 * HeritageSectionDivider — Official WAH Section Divider
 * Uses authentic WAH pattern (pat1.svg) to create elegant transitions between sections
 * (المحافظات → الأماكن → الحكاوي → السوق)
 */
export const HeritageSectionDivider: React.FC<HeritageSectionDividerProps> = ({
  className = '',
  variant = 'flanked',
  opacity = 0.65,
  label
}) => {
  if (variant === 'ribbon') {
    return (
      <div
        className={`w-full py-4 flex items-center justify-center overflow-hidden pointer-events-none select-none ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        <div
          className="w-full max-w-[1400px] h-3 sm:h-3.5"
          style={{
            backgroundImage: "url('/pattern/pat1.svg')",
            backgroundRepeat: 'repeat-x',
            backgroundSize: '16px 100%',
            maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
          }}
        />
      </div>
    );
  }

  // Flanked with center heritage icon / label
  return (
    <div
      className={`w-full py-6 sm:py-8 flex items-center justify-center gap-4 max-w-[1500px] mx-auto px-6 overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* Right arm pattern */}
      <div
        className="flex-1 h-2.5 sm:h-3"
        style={{
          opacity,
          backgroundImage: "url('/pattern/pat1.svg')",
          backgroundRepeat: 'repeat-x',
          backgroundSize: '15px 100%',
          maskImage: 'linear-gradient(to left, black 40%, transparent)',
          WebkitMaskImage: 'linear-gradient(to left, black 40%, transparent)'
        }}
      />

      {/* Center Medallion */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-1 rounded-full border border-[#C99444]/30 bg-cream/80 dark:bg-espresso-900/80 shadow-xs backdrop-blur-xs">
        <span className="w-1.5 h-1.5 rotate-45 bg-[#C99444] rounded-[1px]" />
        {label ? (
          <span className="text-[11px] font-bold text-[#6B3A1F] dark:text-[#E0C79B] tracking-wider px-1">
            {label}
          </span>
        ) : (
          <span className="w-2 h-2 rotate-45 border border-[#C99444] bg-[#6B3A1F]/20 rounded-[1px]" />
        )}
        <span className="w-1.5 h-1.5 rotate-45 bg-[#C99444] rounded-[1px]" />
      </div>

      {/* Left arm pattern */}
      <div
        className="flex-1 h-2.5 sm:h-3"
        style={{
          opacity,
          backgroundImage: "url('/pattern/pat1.svg')",
          backgroundRepeat: 'repeat-x',
          backgroundSize: '15px 100%',
          maskImage: 'linear-gradient(to right, black 40%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, black 40%, transparent)'
        }}
      />
    </div>
  );
};

export default HeritageSectionDivider;
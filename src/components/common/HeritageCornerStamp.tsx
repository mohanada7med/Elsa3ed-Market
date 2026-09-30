import React from 'react';

interface HeritageCornerStampProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  size?: number; // size in px, default 44
  badgeLabel?: string;
}

/**
 * HeritageCornerStamp — Official WAH Heritage Hallmark Seal
 * Adds a subtle authentic pattern seal in the corner of important cards:
 * (حكاية / تراث / صناعة / مكان)
 */
export const HeritageCornerStamp: React.FC<HeritageCornerStampProps> = ({
  position = 'top-left',
  className = '',
  size = 46,
  badgeLabel
}) => {
  const positionClasses = {
    'top-left': 'top-3 left-3',
    'top-right': 'top-3 right-3',
    'bottom-left': 'bottom-3 left-3',
    'bottom-right': 'bottom-3 right-3'
  }[position];

  return (
    <div
      className={`absolute ${positionClasses} z-20 pointer-events-none select-none flex items-center gap-1.5 ${className}`}
      aria-hidden="true"
    >
      <div
        className="relative rounded-full border border-[#C99444]/40 bg-white/70 dark:bg-[#1B1009]/80 backdrop-blur-xs shadow-xs overflow-hidden flex items-center justify-center"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {/* Subtle authentic pattern texture fill */}
        <div
          className="absolute inset-0 opacity-40 mix-blend-multiply dark:mix-blend-screen"
          style={{
            backgroundImage: "url('/pattern/pat2.png')",
            backgroundRepeat: 'repeat',
            backgroundSize: '180px auto',
            backgroundPosition: 'center'
          }}
        />

        {/* Inner gold circular rim */}
        <div className="w-[78%] h-[78%] rounded-full border border-dashed border-[#C99444]/50 flex items-center justify-center">
          <span className="w-1.5 h-1.5 rotate-45 bg-[#C99444]" />
        </div>
      </div>

      {badgeLabel && (
        <span className="text-[10px] font-bold text-[#6B3A1F] dark:text-[#E0C79B] bg-cream/90 dark:bg-espresso-900/90 px-2 py-0.5 rounded-md border border-[#C99444]/25 shadow-xs">
          {badgeLabel}
        </span>
      )}
    </div>
  );
};

export default HeritageCornerStamp;

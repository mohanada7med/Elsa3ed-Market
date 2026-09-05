import React from 'react';

export const WahLoadingScreen: React.FC = () => {
  return (
    <div
      id="wah-auth-loading-screen"
      className="fixed inset-0 z-[9999] flex min-h-screen flex-col items-center justify-center bg-[#FAF6F0]"
      role="status"
      aria-label="جاري التحقق من الجلسة..."
    >
      {/* WAH Brand Symbol Logo */}
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-sm border border-[#E8E1D9]/60">
        <span className="text-5xl font-bold text-[#B45F42] select-none font-serif">
          وه
        </span>
      </div>

      {/* Brand Title */}
      <h1 className="text-2xl font-bold text-[#2D2A26] tracking-wide">
        وه | WAH
      </h1>

      {/* Brand Tagline */}
      <p className="mt-2 text-sm font-medium text-[#7A746D]">
        العالم الرقمي لصعيد مصر
      </p>

      {/* Smooth Loading Animation Dots */}
      <div className="mt-8 flex items-center gap-2" aria-hidden="true">
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#B45F42]" />
        <span
          className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#B45F42]"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#B45F42]"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
};

export default WahLoadingScreen;

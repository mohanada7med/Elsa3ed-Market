import React from 'react';

export const WahLoadingScreen: React.FC = () => {
  return (
    <div
      id="wah-auth-loading-screen"
      dir="rtl"
      className="fixed inset-0 z-[9999] flex min-h-screen flex-col items-center justify-center bg-[#eee8dc] dark:bg-[#0b0b0a] transition-colors"
      role="status"
      aria-label="جاري التحميل..."
    >
      {/* WAH Brand Symbol Logo */}
      <img
        src="https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png"
        alt="logo"
        width={320}
        height={320}
        className="object-contain max-w-[260px] sm:max-w-[320px]"
      />

      {/* Brand Tagline */}
      <p className="mt-2 text-sm font-black text-black/60 dark:text-white/60">
        العالم الرقمي لصعيد مصر
      </p>

      {/* Smooth Loading Animation Dots */}
      <div className="mt-8 flex items-center gap-2" aria-hidden="true">
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#9a6a35]" />
        <span
          className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#9a6a35]"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#9a6a35]"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
};

export default WahLoadingScreen;

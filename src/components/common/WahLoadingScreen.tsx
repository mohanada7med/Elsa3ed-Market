import React from 'react';

export const WahLoadingScreen: React.FC = () => {
  return (
    <div
      id="wah-auth-loading-screen"
      className="fixed inset-0 z-[9999] flex min-h-screen flex-col items-center justify-center bg-[#FAF7F2] dark:bg-[#110E0C] transition-colors"
      role="status"
      aria-label="جاري التحقق من الجلسة..."
    >
      {/* WAH Brand Symbol Logo */}
      {/* Brand Title */}
      <img
        src="https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png"
        alt="logo"
        width={500}
        height={500}
      />

      {/* Brand Tagline */}
      <p className="mt-2 text-sm font-medium text-[#7A746D] dark:text-[#A89C90]">
        العالم الرقمي لصعيد مصر
      </p>

      {/* Smooth Loading Animation Dots */}
      <div className="mt-8 flex items-center gap-2" aria-hidden="true">
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#B24C2B]" />
        <span
          className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#B24C2B]"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#B24C2B]"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
};

export default WahLoadingScreen;

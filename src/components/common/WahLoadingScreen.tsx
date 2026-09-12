import React, { useState, useEffect } from 'react';
import { ShoppingBag, Film, Landmark, Sparkles, ShieldCheck, Truck } from 'lucide-react';

export const WahLoadingScreen: React.FC = () => {
  const [phaseIndex, setPhaseIndex] = useState(0);

  const loadingMessages = [
    'جاري تجهيز سوق وه للحرف والمنتجات الصعيدية...',
    'جاري تحضير ريلز وتجارب صنايعية الصعيد...',
    'جاري فتح المعالم والوثائقيات التراثية...',
    'أهلاً بك في منصة وه المتكاملة...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [loadingMessages.length]);

  return (
    <div
      id="wah-auth-loading-screen"
      dir="rtl"
      className="fixed inset-0 z-[9999] flex min-h-screen flex-col items-center justify-center bg-[#eee8dc] dark:bg-[#0b0b0a] text-[#211d18] dark:text-[#f5f0e7] transition-colors overflow-y-auto px-4 py-8 select-none"
      role="status"
      aria-label="جاري تحميل منصة وه المتكاملة..."
    >
      {/* Background Subtle Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#d6a15a]/12 blur-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-xl w-full text-center">
        {/* WAH Brand Symbol Logo */}
        <div className="relative flex items-center justify-center mb-4">
          <img
            src="https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png"
            alt="شعار منصة وه"
            width={240}
            height={240}
            className="object-contain max-w-[200px] sm:max-w-[240px] drop-shadow-[0_8px_20px_rgba(154,106,53,0.2)]"
          />
        </div>

        {/* Platform Identity Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#9a6a35]/30 bg-[#9a6a35]/10 dark:bg-[#9a6a35]/20 px-3.5 py-1 text-xs font-bold text-[#805423] dark:text-[#d6aa72] mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>منصة صعيد مصر الرقمية المتكاملة</span>
        </div>

        {/* Main Title & Affirmation */}
        <h1 className="text-xl sm:text-2xl font-black text-[#211d18] dark:text-white leading-tight">
          أول منصة متكاملة: <span className="text-[#9a6a35]">سوق أصيل</span> · ريلز · وثائقيات
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-black/65 dark:text-white/65 max-w-md">
          مش مجرد معلومات؛ تجربة شاملة للتسوق المباشر من ورش الصعيد، مشاهدة الريلز الحية، واستكشاف التراث.
        </p>

        {/* The 3 Core Pillars with Dominant Spotlight on the MARKET */}
        <div className="mt-6 grid grid-cols-1 gap-2.5 w-full text-right">
          {/* 1. The Market (Spotlighted / Prominent Card) */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-[#9a6a35] bg-white/90 dark:bg-zinc-900/90 p-3.5 shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#9a6a35] text-white shadow-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-black text-[#211d18] dark:text-white">
                    سوق وه للحرف والمنتجات
                  </span>
                  <span className="rounded-full bg-[#9a6a35]/15 text-[#805423] dark:text-[#f4d5ad] text-[10px] font-bold px-2 py-0.5 whitespace-nowrap">
                    تسوق وشحن مباشر
                  </span>
                </div>
                <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-black/70 dark:text-white/70">
                  سوق تجاري كامل تشتري منه حِرف ومنتجات الصعيد الأصلية مباشرة من الحرفيين مع دفع إلكتروني آمن وتوصيل لحد باب بيتك.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-bold text-[#805423] dark:text-[#d6aa72]">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> منتجات أصلية 100%
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3" /> شحن لجميع المحافظات
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2 & 3. Secondary Pillars (Reels & Documentaries) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Reels Card */}
            <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-3 shadow-xs">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/5 dark:bg-white/10 text-[#9a6a35]">
                  <Film className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-[#211d18] dark:text-white">
                  ريلز وتجارب حية
                </span>
              </div>
              <p className="text-[10.5px] leading-relaxed text-black/65 dark:text-white/65">
                مقاطع مصورة توثق تفاصيل وسر الصنعة ويوميات صنايعية الصعيد.
              </p>
            </div>

            {/* Documentaries Card */}
            <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-3 shadow-xs">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/5 dark:bg-white/10 text-[#9a6a35]">
                  <Landmark className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-[#211d18] dark:text-white">
                  وثائقيات ومعالم
                </span>
              </div>
              <p className="text-[10.5px] leading-relaxed text-black/65 dark:text-white/65">
                توثيق رقمي عالي الدقة لأهم معالم وأكلات وسير أهل الصعيد.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Loading Status with Smooth Progress */}
        <div className="mt-7 w-full max-w-sm flex flex-col items-center">
          {/* Animated Progress Bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div className="h-full w-1/2 rounded-full bg-[#9a6a35] animate-[pulse_1.2s_ease-in-out_infinite]" />
          </div>

          {/* Changing Loading Phase Text */}
          <p className="mt-3 text-xs font-bold text-[#805423] dark:text-[#d6aa72] transition-all min-h-[1.5rem] flex items-center justify-center">
            {loadingMessages[phaseIndex]}
          </p>

          {/* Smooth Loading Animation Dots */}
          <div className="mt-2 flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 animate-bounce rounded-full bg-[#9a6a35]" />
            <span
              className="h-2 w-2 animate-bounce rounded-full bg-[#9a6a35]"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="h-2 w-2 animate-bounce rounded-full bg-[#9a6a35]"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WahLoadingScreen;

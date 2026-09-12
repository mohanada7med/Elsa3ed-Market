import React, { Suspense } from 'react';
import { useApp } from '../../context/AppContext';
import { HeroSection } from '../public/HeroSection';
import { WahEcosystemPortalSection } from '../public/WahEcosystemPortalSection';
import { FeaturedCategories } from '../public/FeaturedCategories';
import { CraftReelsSection } from '../public/CraftReelsSection';
import { ProductGrid } from '../products/ProductGrid';
import { ArrowLeft, Flame, ShoppingBasket } from 'lucide-react';

// استيراد مباشر بدون تلاعب بالـ exports لتفادي مشكلة الـ undefined
import { DialectDictionaryPage } from './quize';
import { FeaturedSellers } from '../public/FeaturedSellers';
import { AboutSection } from '../public/AboutSection';

export const HomePage: React.FC = () => {
  const { setActivePage } = useApp();

  return (
    <div
      dir="rtl"
      className="
        relative
        min-h-screen
        w-full
        overflow-x-hidden
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors duration-500
        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
      "
    >
      <div className="relative z-10 space-y-6 [&_section]:bg-transparent">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Ecosystem Portals */}
        <div className="[content-visibility:auto] [contain-intrinsic-size:1px_400px]">
          <WahEcosystemPortalSection />
        </div>

        {/* 3. Craft Reels Section */}
        <div className="relative">
          <CraftReelsSection />
        </div>

        {/* 4. Products Section */}
        <section className="py-16 max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 [content-visibility:auto] [contain-intrinsic-size:1px_600px] text-[#211d18] dark:text-[#f5f0e7] select-none">
          {/* Header Section بالتنسيق التايبوغرافي الضخم */}
          <div className="relative z-10 mb-12 sm:mb-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
              <div>
                {/* الشارة العلوية */}
                <div className="mb-6 flex items-center gap-3 text-[10px] font-black tracking-[0.28em] text-[#9a6a35] dark:text-[#d6aa72]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9a6a35]/10 dark:bg-[#d6aa72]/10">
                    <ShoppingBasket size={14} className="text-[#9a6a35] dark:text-[#d6aa72]" />
                  </span>
                  BEST SELLERS / الأكتر طلبًا وإقبالًا
                </div>

                {/* العنوان التايبوغرافي الضخم */}
                <h2 className="text-[14vw] font-black leading-[0.82] tracking-[-0.08em] sm:text-[11vw] lg:text-[7.5rem] xl:text-[8.5rem]">
                  سوق
                  <br />
                  <span className="mr-[4vw] text-[#9a6a35] dark:text-[#d6aa72] lg:mr-16">
                    وه
                  </span>
                </h2>

                {/* الشرح والمؤشر */}
                <div className="mt-8 grid max-w-3xl gap-6 sm:grid-cols-[80px_1fr] items-start">
                  <div className="hidden sm:block">
                    <div className="text-[10px] font-black tracking-[0.2em] text-black/40 dark:text-white/40">
                      منتجات وه
                    </div>
                    <div className="mt-3 h-px w-10 bg-[#9a6a35] dark:bg-[#d6aa72]" />
                  </div>

                  <p className="max-w-2xl text-sm font-medium leading-7 text-black/70 dark:text-white/70 sm:text-base sm:leading-8">
                    حاجات ناس كتير جربوها وحبوها، وبتحكي عن تراث الصعيد وأصالته                  </p>
                </div>
              </div>

              {/* زر عرض كل المنتجات بستايل كبسولة أنيق */}
              <div className="lg:pb-3">
                <button
                  type="button"
                  onClick={() => setActivePage('products')}
                  className="inline-flex items-center gap-2.5 text-xs font-bold text-white bg-[#1a1713] hover:bg-[#9a6a35] dark:bg-zinc-800 dark:hover:bg-[#9a6a35] px-6 py-3.5 rounded-full transition-all duration-200 shadow-md active:scale-95 cursor-pointer"
                >
                  <span>شوف كل المنتجات</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <ProductGrid limit={8} />
        </section>

        {/* 5. باقي الأقسام مع عزل سلس وسريع للموبايل */}
        <div className="[content-visibility:auto] [contain-intrinsic-size:1px_400px]">
          <DialectDictionaryPage />
        </div>

        <div className="[content-visibility:auto] [contain-intrinsic-size:1px_400px]">
          <FeaturedSellers />
        </div>

        <div className="[content-visibility:auto] [contain-intrinsic-size:1px_300px]">
          <AboutSection />
        </div>
      </div>
    </div >
  );
};
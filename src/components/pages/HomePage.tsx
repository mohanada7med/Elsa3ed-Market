import React, { Suspense } from 'react';
import { useApp } from '../../context/AppContext';
import { HeroSection } from '../public/HeroSection';
import { WahEcosystemPortalSection } from '../public/WahEcosystemPortalSection';
import { FeaturedCategories } from '../public/FeaturedCategories';
import { CraftReelsSection } from '../public/CraftReelsSection';
import { ProductGrid } from '../products/ProductGrid';
import { ArrowLeft, Flame } from 'lucide-react';

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
        <section className="py-16 max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 [content-visibility:auto] [contain-intrinsic-size:1px_600px]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#9a6a35] mb-1">
                <Flame className="w-4 h-4 text-[#9a6a35]" />
                <span>الأكتر طلبًا وإقبالًا</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black font-serif tracking-tight">
                أحلى حاجات الصعيد والأكتر شهرة
              </h2>
              <p className="text-xs sm:text-sm text-black/60 dark:text-white/60 mt-1">
                حاجات ناس كتير جربوها وحبوها، وبتحكي عن تراث الصعيد وأصالته
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActivePage('products')}
              className="text-xs sm:text-sm font-bold text-[#9a6a35] hover:text-[#744e26] flex items-center gap-1.5 self-start sm:self-auto hover:underline min-h-[40px] cursor-pointer"
            >
              <span>شوف كل المنتجات</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
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
    </div>
  );
};
import React from 'react';
import { useApp } from '../../context/AppContext';
import { HeroSection } from '../public/HeroSection';
import { WahEcosystemPortalSection } from '../public/WahEcosystemPortalSection';
import { CraftReelsSection } from '../public/CraftReelsSection';
import { ProductGrid } from '../products/ProductGrid';
import { ArrowLeft, ShoppingBasket } from 'lucide-react';
// استيراد مباشر لصفحة/مكون القاموس وتحدي اللهجة الصعيدية بالكامل
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
        bg-cream
        text-espresso
        transition-colors duration-500
        dark:bg-espresso-900
        dark:text-cream
      "
    >
      <div className="relative z-10 space-y-6 [&_section]:bg-transparent">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Ecosystem Portals */}
        <div className="[content-visibility:auto] [contain-intrinsic-size:1px_400px]">
          <WahEcosystemPortalSection />
        </div>

        {/* 3. Craft Reels */}
        <div className="relative">
          <CraftReelsSection />
        </div>

        {/* 4. Products Section - سوق وه */}
        <section className="py-16 max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 [content-visibility:auto] [contain-intrinsic-size:1px_600px] text-espresso dark:text-cream select-none">
          <div className="relative z-10 mb-12 sm:mb-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
              <div>
                <div className="mb-6 flex items-center gap-3 text-[10px] font-black tracking-[0.28em] text-primary dark:text-primary-hover">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 dark:bg-[#d6aa72]/10">
                    <ShoppingBasket size={14} className="text-primary dark:text-primary-hover" />
                  </span>
                  BEST SELLERS / الأكتر طلبًا وإقبالًا
                </div>

                <h1 className="max-w-6xl text-5xl sm:text-7xl lg:text-[8rem] font-black leading-[0.95] tracking-tight">
                  سوق
                  <br />
                  <span className="ps-3 mr-3 sm:mr-8 lg:mr-20 text-primary dark:text-primary-hover">
                    وه
                  </span>
                </h1>

                <div className="mt-8 grid max-w-3xl gap-6 sm:grid-cols-[80px_1fr] items-start">
                  <div className="hidden sm:block">
                    <div className="text-[10px] font-black tracking-[0.2em] text-black/40 dark:text-white/40">
                      منتجات وه
                    </div>
                    <div className="mt-3 h-px w-10 bg-primary dark:bg-[#d6aa72]" />
                  </div>

                  <p className="max-w-2xl text-sm font-medium leading-7 text-black/70 dark:text-white/70 sm:text-base sm:leading-8">
                    حاجات ناس كتير جربوها وحبوها، وبتحكي عن تراث الصعيد وأصالته
                  </p>
                </div>
              </div>

              <div className="lg:pb-3">
                <button
                  type="button"
                  onClick={() => setActivePage('products')}
                  className="inline-flex items-center gap-2.5 text-xs font-bold text-white bg-[#1a1713] hover:bg-primary dark:bg-zinc-800 dark:hover:bg-primary px-6 py-3.5 rounded-full transition-all duration-200 shadow-md active:scale-95 cursor-pointer"
                >
                  <span>شوف كل المنتجات</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <ProductGrid limit={8} />
        </section>

        {/* 5. Dialect Dictionary & Quiz Page */}
        <div className="[content-visibility:auto] [contain-intrinsic-size:1px_400px]">
          <DialectDictionaryPage />
        </div>

        {/* 6. Featured Sellers */}
        <div className="[content-visibility:auto] [contain-intrinsic-size:1px_400px]">
          <FeaturedSellers />
        </div>

        {/* 7. About Section */}
        <div className="[content-visibility:auto] [contain-intrinsic-size:1px_300px]">
          <AboutSection />
        </div>
      </div>
    </div>
  );
};

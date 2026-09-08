import React from 'react';
import { useApp } from '../../context/AppContext';
import { HeroSection } from '../public/HeroSection';
import { WahEcosystemPortalSection } from '../public/WahEcosystemPortalSection';
import { FeaturedCategories } from '../public/FeaturedCategories';
import { CraftReelsSection } from '../public/CraftReelsSection';
import { ProductGrid } from '../products/ProductGrid';
import { GovernorateExplorer } from '../public/GovernorateExplorer';
import { FeaturedSellers } from '../public/FeaturedSellers';
import { AboutSection } from '../public/AboutSection';
import { ArrowLeft, Flame } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setActivePage } = useApp();

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors duration-500
        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
        space-y-4
      "
    >
      {/* 1. Hero Section - WAH Digital Platform of Upper Egypt */}
      <HeroSection />

      {/* 2. WAH Ecosystem Portals (Map, Governorates, Places, Crafts, Stories, People, Food, Events, Market) */}
      <WahEcosystemPortalSection />

      {/* 3. Featured Categories in Marketplace */}
      <FeaturedCategories />

      {/* 4. Live Craft Reels & Stories Showcase (TikTok / Reels Video Feed) */}
      <CraftReelsSection />

      {/* 5. Featured & Best-Selling Products Section */}
      <section className="py-16 max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#9a6a35] mb-1">
              <Flame className="w-4 h-4 text-[#9a6a35]" />
              <span>الأكثر طلباً وإقبالاً</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-serif tracking-tight">
              روائع الصعيد الأكثر شهرة
            </h2>
            <p className="text-xs sm:text-sm text-black/60 dark:text-white/60 mt-1">
              قطع أثبتت جودتها ونالت إعجاب مئات المتسوقين وعشاق التراث المصري
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActivePage('products')}
            className="text-xs sm:text-sm font-bold text-[#9a6a35] hover:text-[#744e26] flex items-center gap-1.5 self-start sm:self-auto hover:underline min-h-[40px] cursor-pointer"
          >
            <span>استعراض كل المنتجات</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <ProductGrid limit={8} />
      </section>

      <GovernorateExplorer />

      <FeaturedSellers />

      <AboutSection />
    </div>
  );
};
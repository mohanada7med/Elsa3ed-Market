import React from 'react';
import { useApp } from '../../context/AppContext';
import { HeroSection } from '../public/HeroSection';
import { FeaturedCategories } from '../public/FeaturedCategories';
import { HeritageCraftsShowcase } from '../public/HeritageCraftsShowcase';
import { CraftReelsSection } from '../public/CraftReelsSection';
import { ProductGrid } from '../products/ProductGrid';
import { GovernorateExplorer } from '../public/GovernorateExplorer';
import { PromotionsBanner } from '../public/PromotionsBanner';
import { FeaturedSellers } from '../public/FeaturedSellers';
import { RecommendationsSection } from '../public/RecommendationsSection';
import { AboutSection } from '../public/AboutSection';
import { Sparkles, ArrowLeft, Flame, Award } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setActivePage } = useApp();

  return (
    <div className="space-y-4">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Featured Categories */}
      <FeaturedCategories />

      {/* 3. Upper Egypt Heritage Crafts Showcase (Deep Interactive Atlas) */}
      <HeritageCraftsShowcase />

      {/* 4. Live Craft Reels & Stories Showcase (TikTok / Reels Video Feed) */}
      <CraftReelsSection />

      {/* 5. Featured & Best-Selling Products Section */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#943310] mb-1">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>الأكثر طلباً وإقبالاً</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-heritage">
              روائع الصعيد الأكثر شهرة
            </h2>
            <p className="text-xs sm:text-sm text-[#8c6b53] mt-1">
              قطع أثبتت جودتها ونالت إعجاب مئات المتسوقين وعشاق التراث المصري
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActivePage('products')}
            className="text-xs sm:text-sm font-bold text-[#943310] hover:text-[#7c280a] flex items-center gap-1.5 self-start sm:self-auto hover:underline min-h-[40px]"
          >
            <span>استعراض كل المنتجات</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <ProductGrid limit={8} />
      </section>

      {/* 5. Governorate Map & Origin Explorer */}
      <GovernorateExplorer />

      {/* 6. Promotional Special Banner */}
      <PromotionsBanner />

      {/* 7. Featured Artisans & Master Workshops */}
      <FeaturedSellers />

      {/* 8. Curated Recommendations (Home Decor, Food, Gifts) */}
      <RecommendationsSection />

      {/* 9. About Elsa3ed Market, Story & Mission */}
      <AboutSection />
    </div>
  );
};

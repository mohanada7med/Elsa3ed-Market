import React from 'react';
import { HeroSection } from '../public/HeroSection';
import { WahEcosystemPortalSection } from '../public/WahEcosystemPortalSection';
import { CraftReelsSection } from '../public/CraftReelsSection';
import { DialectDictionaryPage } from './quize';
import { AboutSection } from '../public/AboutSection';
import { HeritageSectionDivider } from '../common/HeritageSectionDivider';
import { ProductOfWeekSection } from '../public/ProductOfWeekSection';
import { PaidPromotionSection } from '../public/PaidPromotionSection';
import { HomeMarketSection } from '../public/HomeMarketSection';
import { HomeFeaturedSellersSection } from '../public/HomeFeaturedSellersSection';

export const HomePage: React.FC = () => {
  return (
    <div
      dir="rtl"
      className="
        relative
        min-h-screen
        w-full
        overflow-x-hidden
        bg-background
        text-foreground
        transition-colors duration-500
      "
    >
      <div className="relative z-10 space-y-6 [&_section]:bg-transparent">

        {/* 1. Hero Section (تحميل فوري مباشر) */}
        <HeroSection />
        <PaidPromotionSection position="after-hero" />
        <ProductOfWeekSection />
        <PaidPromotionSection position="after-product-of-week" />

        {/* فاصل تراثي أصيل */}
        <HeritageSectionDivider variant="flanked" label="أبواب الصعيد ومحافظاته" />

        {/* 2. Ecosystem Portals (المحافظات والأماكن) */}
        <WahEcosystemPortalSection />
        <PaidPromotionSection position="after-governorates" />

        {/* فاصل تراثي أصيل */}
        <HeritageSectionDivider variant="flanked" label="فيديوهات الصعيد" />

        {/* 3. Craft Reels (وه بيحكي) */}
        <CraftReelsSection />
        <PaidPromotionSection position="after-reels" />

        {/* فاصل تراثي أصيل */}
        <HeritageSectionDivider variant="flanked" label="سوق ومنتجات وه" />
        <PaidPromotionSection position="before-market" />
        <HomeMarketSection />
        <PaidPromotionSection position="after-market" />
        {/* فاصل تراثي أصيل */}
        <HeritageSectionDivider variant="flanked" label="اختبار الصعيد" />

        {/* 5. Dialect Dictionary & Quiz Page */}
        <div style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 500px' }}>
          <DialectDictionaryPage />
        </div>
        <PaidPromotionSection position="after-quiz" />

        {/* فاصل تراثي أصيل */}
        <HeritageSectionDivider
          variant="flanked"
          label="شيوخ الصنعة وأصحاب الورش"
        />

        {/* 6. Featured Sellers — شيوخ الصنعة */}
        <HomeFeaturedSellersSection />
        <PaidPromotionSection position="after-sellers" />


        {/* فاصل تراثي أصيل */}
        <HeritageSectionDivider variant="ribbon" />

        {/* 7. About Section */}
        <div style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 400px' }}>
          <AboutSection />
        </div>
      </div>
    </div>
  );
};
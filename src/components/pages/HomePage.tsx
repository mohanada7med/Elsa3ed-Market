import React from 'react';
import { HeroSection } from '../public/HeroSection';
import { WahEcosystemPortalSection } from '../public/WahEcosystemPortalSection';
import { CraftReelsSection } from '../public/CraftReelsSection';
import { DialectDictionaryPage } from './quize';
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
      {/* تم تصغير المسافات بين الأقسام هنا */}
      <div className="relative z-10 space-y-1.5 sm:space-y-3 [&_section]:bg-transparent">

        {/* Hero Section (تحميل فوري مباشر) */}
        <HeroSection />
        <PaidPromotionSection position="after-hero" />
        <ProductOfWeekSection />
        <PaidPromotionSection position="after-product-of-week" />

        {/* فاصل تراثي - شكل الجوهرة الماسية */}
        <HeritageSectionDivider variant="diamond" label="أبواب الصعيد ومحافظاته" />

        {/* 2. Ecosystem Portals (المحافظات والأماكن) */}
        <WahEcosystemPortalSection />
        <PaidPromotionSection position="after-governorates" />

        {/* فاصل تراثي - شكل الإطار المحفور */}
        <HeritageSectionDivider variant="frame" label="فيديوهات الصعيد" />

        {/* 3. Craft Reels (وه بيحكي) */}
        <CraftReelsSection />
        <PaidPromotionSection position="after-reels" />

        {/* فاصل تراثي - الشكل الموجي */}
        <HeritageSectionDivider variant="wave" label="سوق ومنتجات وه" />
        <PaidPromotionSection position="before-market" />
        <HomeMarketSection />
        <PaidPromotionSection position="after-market" />

        {/* فاصل تراثي - شكل النقاط المتتالية */}
        <HeritageSectionDivider variant="dots" label="اختبار الصعيد" />

        {/* 5. Dialect Dictionary & Quiz Page */}
        <div style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 500px' }}>
          <DialectDictionaryPage />
        </div>
        <PaidPromotionSection position="after-quiz" />

        {/* فاصل تراثي - شكل الجوهرة الماسية */}
        <HeritageSectionDivider
          variant="diamond"
          label="شيوخ الصنعة وأصحاب الورش"
        />

        {/* 6. Featured Sellers — شيوخ الصنعة */}
        <HomeFeaturedSellersSection />
        <PaidPromotionSection position="after-sellers" />

      </div>
    </div>
  );
};
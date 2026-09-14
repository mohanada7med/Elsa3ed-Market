import React, { Suspense, lazy } from 'react';
import { useApp } from '../../context/AppContext';
import { HeroSection } from '../public/HeroSection';
import { WahEcosystemPortalSection } from '../public/WahEcosystemPortalSection';
import { ProductGrid } from '../products/ProductGrid';
import { ArrowLeft, ShoppingBasket } from 'lucide-react';

// تحميل المكونات الكبيرة عند الحاجة لمنع تجميد الصفحة
const CraftReelsSection = lazy(() =>
  import('../public/CraftReelsSection').then(m => ({ default: m.CraftReelsSection }))
);
const DialectDictionaryPage = lazy(() =>
  import('./quize').then(m => ({ default: m.DialectDictionaryPage }))
);
const FeaturedSellers = lazy(() =>
  import('../public/FeaturedSellers').then(m => ({ default: m.FeaturedSellers }))
);
const AboutSection = lazy(() =>
  import('../public/AboutSection').then(m => ({ default: m.AboutSection }))
);

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
        bg-background
        text-foreground
        transition-colors duration-500
      "
    >
      <div className="relative z-10 space-y-12 [&_section]:bg-transparent">
        {/* 1. Hero Section (تحميل فوري مباشر) */}
        <HeroSection />

        {/* 2. Ecosystem Portals (تحميل فوري بدون حجب) */}
        <WahEcosystemPortalSection />

        {/* 3. Craft Reels (تحميل خلفي سلس) */}
        <Suspense fallback={<div className="h-96 w-full animate-pulse bg-espresso/5 rounded-3xl" />}>
          <CraftReelsSection />
        </Suspense>

        {/* 4. Products Section - سوق وه */}
        <section className="py-8 max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 text-foreground select-none">
          <div className="relative z-10 mb-12 sm:mb-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
              <div>
                <div className="mb-6 flex items-center gap-3 text-[10px] font-black tracking-[0.28em] text-accent">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                    <ShoppingBasket size={14} className="text-accent" />
                  </span>
                  BEST SELLERS / الأكتر طلبًا وإقبالًا
                </div>

                <h1 className="max-w-6xl text-5xl sm:text-7xl lg:text-[8rem] font-black leading-[0.95] tracking-tight">
                  سوق
                  <br />
                  <span className="inline-block mr-[2ch] sm:mr-[2.3ch] lg:mr-[2.6ch] text-accent">
                    وه
                  </span>
                </h1>

                <div className="mt-8 grid max-w-3xl gap-6 sm:grid-cols-[80px_1fr] items-start">
                  <div className="hidden sm:block">
                    <div className="text-[10px] font-black tracking-[0.2em] text-foreground-disabled">
                      منتجات وه
                    </div>
                    <div className="mt-3 h-px w-10 bg-accent" />
                  </div>

                  <p className="max-w-2xl text-sm font-medium leading-7 text-foreground-secondary sm:text-base sm:leading-8">
                    حاجات ناس كتير جربوها وحبوها، وبتحكي عن تراث الصعيد وأصالته
                  </p>
                </div>
              </div>

              <div className="lg:pb-3">
                <button
                  type="button"
                  onClick={() => setActivePage('products')}
                  className="inline-flex items-center gap-2.5 text-xs font-bold text-white bg-btn-dark hover:bg-primary px-6 py-3.5 rounded-full transition-all duration-200 shadow-md active:scale-95 cursor-pointer"
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
        <Suspense fallback={<div className="h-64 w-full animate-pulse bg-espresso/5 rounded-3xl" />}>
          <DialectDictionaryPage />
        </Suspense>

        {/* 6. Featured Sellers */}
        <Suspense fallback={<div className="h-64 w-full animate-pulse bg-espresso/5 rounded-3xl" />}>
          <FeaturedSellers />
        </Suspense>

        {/* 7. About Section */}
        <Suspense fallback={<div className="h-64 w-full animate-pulse bg-espresso/5 rounded-3xl" />}>
          <AboutSection />
        </Suspense>
      </div>
    </div>
  );
};
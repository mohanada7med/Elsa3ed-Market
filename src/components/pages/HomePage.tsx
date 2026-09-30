import React from 'react';
import { useApp } from '../../context/AppContext';
import { HeroSection } from '../public/HeroSection';
import { WahEcosystemPortalSection } from '../public/WahEcosystemPortalSection';
import { ProductGrid } from '../products/ProductGrid';
import { ArrowLeft, ShoppingBasket } from 'lucide-react';
import { CraftReelsSection } from '../public/CraftReelsSection';
import { DialectDictionaryPage } from './quize';
import { FeaturedSellers } from '../public/FeaturedSellers';
import { AboutSection } from '../public/AboutSection';
import { HeritageSectionDivider } from '../common/HeritageSectionDivider';

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
      <div className="relative z-10 space-y-6 [&_section]:bg-transparent">
        {/* 1. Hero Section (تحميل فوري مباشر) */}
        <HeroSection />

        {/* فاصل تراثي أصيل */}
        <HeritageSectionDivider variant="flanked" label="أبواب الصعيد ومحافظاته" />

        {/* 2. Ecosystem Portals (المحافظات والأماكن) */}
        <WahEcosystemPortalSection />

        {/* فاصل تراثي أصيل */}
        <HeritageSectionDivider variant="flanked" label="فيديوهات الصعيد" />

        {/* 3. Craft Reels (وه بيحكي) */}
        <CraftReelsSection />

        {/* فاصل تراثي أصيل */}
        <HeritageSectionDivider variant="flanked" label="سوق ومنتجات وه" />

        {/* 4. Products Section - سوق وه */}
        <section
          className="
    relative
    overflow-hidden
    py-8
    max-w-[1600px]
    mx-auto
    px-5
    sm:px-8
    lg:px-12
    text-foreground
    select-none
  "
        >
          {/* Authentic WAH Pattern — السوق فقط */}
          <div
            className="
      pointer-events-none
      absolute
      inset-0
      z-0
      opacity-[0.04]
      mix-blend-screen
    "
            style={{
              backgroundImage: "url('/pattern/pat2.png')",
              backgroundRepeat: 'repeat',
              backgroundSize: '520px auto',
              backgroundPosition: 'center',
              maskImage:
                'radial-gradient(ellipse at center, black 35%, transparent 80%)',
              WebkitMaskImage:
                'radial-gradient(ellipse at center, black 35%, transparent 80%)',
            }}
            aria-hidden="true"
          />

          {/* محتوى السوق */}
          <div className="relative z-10 mb-12 sm:mb-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
              <div>
                <div className="mb-6 flex items-center gap-3 text-[10px] font-black tracking-[0.28em] text-primary dark:text-primary-hover">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                    <ShoppingBasket size={14} className="text-accent" />
                  </span>

                  BEST SELLERS / الأكتر طلبًا وإقبالًا
                </div>

                <h1 className="max-w-6xl text-5xl sm:text-7xl lg:text-[8rem] font-black leading-[0.95] tracking-tight">
                  سوق
                  <br />

                  <span className="ps-18 mr-3 sm:mr-8 lg:mr-20 text-primary dark:text-primary-hover">
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
                  className="
            inline-flex
            items-center
            gap-2.5
            text-xs
            font-bold
            text-white
            bg-btn-dark
            hover:bg-primary
            px-6
            py-3.5
            rounded-full
            transition-all
            duration-200
            shadow-md
            active:scale-95
            cursor-pointer
          "
                >
                  <span>شوف كل المنتجات</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* المنتجات فوق الباترن */}
          <div className="relative z-10">
            <ProductGrid limit={8} />
          </div>
        </section>
        {/* فاصل تراثي أصيل */}
        <HeritageSectionDivider variant="flanked" label="اختبار الصعيد" />

        {/* 5. Dialect Dictionary & Quiz Page */}
        <DialectDictionaryPage />

        {/* فاصل تراثي أصيل */}
        {/* فاصل تراثي أصيل */}
        <HeritageSectionDivider
          variant="flanked"
          label="شيوخ الصنعة وأصحاب الورش"
        />

        {/* 6. Featured Sellers — شيوخ الصنعة */}
        <section className="relative overflow-hidden">
          {/* WAH Pattern — الصنعة فقط */}
          <div
            className="
      pointer-events-none
      absolute
      inset-0
      z-0
      opacity-[0.035]
      mix-blend-screen
    "
            style={{
              backgroundImage: "url('/pattern/pat2.png')",
              backgroundRepeat: 'repeat',
              backgroundSize: '520px auto',
              backgroundPosition: 'center',
              maskImage:
                'radial-gradient(ellipse at center, black 25%, transparent 78%)',
              WebkitMaskImage:
                'radial-gradient(ellipse at center, black 25%, transparent 78%)',
            }}
            aria-hidden="true"
          />

          {/* Featured Sellers Content */}
          <div className="relative z-10">
            <FeaturedSellers />
          </div>
        </section>
        

        {/* فاصل تراثي أصيل */}
        <HeritageSectionDivider variant="ribbon" />

        {/* 7. About Section */}
        <AboutSection />
      </div>
    </div>
  );
};
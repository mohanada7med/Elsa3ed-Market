import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { HeroSection } from '../public/HeroSection';
import { WahEcosystemPortalSection } from '../public/WahEcosystemPortalSection';
import { FeaturedCategories } from '../public/FeaturedCategories';
import { CraftReelsSection } from '../public/CraftReelsSection';
import { ProductGrid } from '../products/ProductGrid';
import { GovernorateExplorer } from '../public/GovernorateExplorer';
import { FeaturedSellers } from '../public/FeaturedSellers';
import { AboutSection } from '../public/AboutSection';
import { ArrowLeft, Flame } from 'lucide-react';
import { DialectDictionaryPage } from './quize';

export const HomePage: React.FC = () => {
  const { setActivePage } = useApp();

  // تحميل مسبق في الكاش لكل صور المحافظات بمجرد فتح الصفحة الرئيسية
  useEffect(() => {
    const preloadGovernoratesImages = async () => {
      try {
        const payload = await wahApi.getFullMapPayload();
        if (payload?.governorates && Array.isArray(payload.governorates)) {
          payload.governorates.forEach((gov: any) => {
            if (gov.coverImage) {
              const img = new Image();
              let url = gov.coverImage.trim();

              // تطبيق نفس التحويل والضغط المستعمل في صفحة الخريطة لحفظها في الكاش فوراً
              if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
                url = url.replace(
                  '/upload/',
                  '/upload/f_auto,q_auto:best,w_1600,c_limit/'
                );
              } else if (url.includes('images.unsplash.com')) {
                try {
                  const urlObj = new URL(url);
                  urlObj.searchParams.set('auto', 'format');
                  urlObj.searchParams.set('fit', 'crop');
                  urlObj.searchParams.set('w', '1600');
                  urlObj.searchParams.set('q', '85');
                  url = urlObj.toString();
                } catch { }
              }

              img.src = url;
            }
          });
        }
      } catch (err) {
        console.error('فشل التحميل المسبق لصور المحافظات:', err);
      }
    };

    // تأخير طفيف (1 ثانية) لعدم مزاحمة عناصر الـ Hero الأساسية أثناء التحميل الأولي
    const timer = setTimeout(() => {
      void preloadGovernoratesImages();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

      {/* 4. Live Craft Reels & Stories Showcase (TikTok / Reels Video Feed) */}
      <CraftReelsSection />

      {/* 5. Featured & Best-Selling Products Section */}
      <section className="py-16 max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
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

      <DialectDictionaryPage />

      <FeaturedSellers />

      <AboutSection />
    </div>
  );
};
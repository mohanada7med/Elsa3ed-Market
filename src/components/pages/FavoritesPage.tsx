import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../products/ProductCard';
import { Heart, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '../../types';

export const FavoritesPage: React.FC = () => {
  const { favorites, products, adminProducts, sellerProducts, setActivePage } = useApp();

  const allAvailableProducts = useMemo(() => {
    const map = new Map<string, Product>();
    (products || []).forEach((p) => { if (p?.id) map.set(p.id, p); });
    (adminProducts || []).forEach((p) => { if (p?.id && !map.has(p.id)) map.set(p.id, p); });
    (sellerProducts || []).forEach((p) => { if (p?.id && !map.has(p.id)) map.set(p.id, p); });
    return map;
  }, [products, adminProducts, sellerProducts]);

  const favoriteProducts = useMemo(() => {
    return favorites
      .map((id) => allAvailableProducts.get(id))
      .filter((p): p is Product => Boolean(p));
  }, [favorites, allAvailableProducts]);

  return (
    <div
      dir="rtl"
      id="favorites-page-root"
      className="
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
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-8 sm:py-10 pt-28 sm:pt-36 pb-24 sm:pb-20 space-y-6 sm:space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-xs text-black/50 dark:text-white/50 font-medium">
          <button
            type="button"
            id="fav-breadcrumb-home"
            onClick={() => setActivePage('home')}
            className="hover:text-[#9a6a35] transition-colors cursor-pointer"
          >
            الرئيسية
          </button>
          <ChevronRight className="w-3.5 h-3.5 rotate-180 text-black/30 dark:text-white/30" />
          <span className="font-bold text-[#211d18] dark:text-[#f5f0e7]">قائمة الرغبات والمفضلة</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-5 sm:pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
              <Heart className="w-4 h-4 fill-rose-600 dark:fill-rose-400" />
              <span>مجموعتك التراثية المفضلة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight">
              القطع التي نالت إعجابك ({favoriteProducts.length})
            </h1>
            <p className="text-xs sm:text-sm text-black/60 dark:text-white/60 mt-1">
              احفظ القطع الحرفية للرجوع إليها في أي وقت أو إضافتها لسلة التسوق بنقرة واحدة
            </p>
          </div>

          {favoriteProducts.length > 0 && (
            <button
              type="button"
              id="fav-browse-more-btn"
              onClick={() => setActivePage('products')}
              className="px-5 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
            >
              تصفح المزيد من المعروضات
            </button>
          )}
        </div>

        {favoriteProducts.length === 0 ? (
          <div className="bg-white/75 dark:bg-[#151513]/90 rounded-[2rem] border border-black/10 dark:border-white/10 p-12 sm:p-16 text-center space-y-4 shadow-lg backdrop-blur-xl max-w-xl mx-auto my-8">
            <div className="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-10 h-10" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-serif">قائمة المفضلة فارغة حالياً</h3>
            <p className="text-xs sm:text-sm text-black/60 dark:text-white/60 max-w-sm mx-auto leading-relaxed">
              انقر على أيقونة القلب على أي قطعة من روائع الفخار أو الكليم أو عسل الصعيد لحفظها في قائمتك الخاصة والعودة إليها بسهولة.
            </p>
            <button
              type="button"
              id="fav-empty-explore-btn"
              onClick={() => setActivePage('products')}
              className="px-6 py-3 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              استكشف سوق الصعيد الآن
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-7">
            {favoriteProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../products/ProductCard';
import { Heart, ChevronRight, ShoppingBag } from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  const { favorites, products, setActivePage } = useApp();

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#8c6b53] dark:text-[var(--wah-text-muted,#A89B8F)]">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#943310] dark:hover:text-[var(--wah-primary,#E0633C)] transition-colors"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="text-gray-900 dark:text-[var(--wah-text,#FAF6F2)] font-bold">قائمة الرغبات والمفضلة</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebdccd] dark:border-[var(--wah-border,#352B24)] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
            <Heart className="w-4 h-4 fill-rose-600 dark:fill-rose-400" />
            <span>مجموعتك التراثية المفضلة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-[var(--wah-text,#FAF6F2)] font-heritage">
            القطع التي نالت إعجابك ({favoriteProducts.length})
          </h1>
          <p className="text-xs text-[#8c6b53] dark:text-[var(--wah-text-muted,#A89B8F)] mt-1">
            احفظ القطع الحرفية للرجوع إليها في أي وقت أو إضافتها لسلة التسوق
          </p>
        </div>

        {favoriteProducts.length > 0 && (
          <button
            type="button"
            onClick={() => setActivePage('products')}
            className="px-5 py-2.5 bg-[#943310] hover:bg-[#7c280a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            تصفح المزيد من المعروضات
          </button>
        )}
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="bg-white dark:bg-[var(--wah-surface,#1B1613)] rounded-3xl border border-[#ebdccd] dark:border-[var(--wah-border,#352B24)] p-16 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-[var(--wah-text,#FAF6F2)]">قائمة المفضلة فارغة حالياً</h3>
          <p className="text-xs text-gray-500 dark:text-[var(--wah-text-muted,#A89B8F)] max-w-sm mx-auto">
            انقر على أيقونة القلب على أي منتج من منتجات الفخار أو الكليم لحفظه في هذه القائمة.
          </p>
          <button
            type="button"
            onClick={() => setActivePage('products')}
            className="px-6 py-2.5 bg-[#943310] hover:bg-[#7c280a] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
          >
            استكشف سوق الصعيد الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {favoriteProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};

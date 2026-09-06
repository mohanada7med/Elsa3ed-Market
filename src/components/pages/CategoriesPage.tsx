import React from 'react';
import { useApp } from '../../context/AppContext';
import { Layers, ChevronRight, MapPin, ArrowLeft, Sparkles } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { categories, navigateToCategory, setActivePage } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#8c6b53] dark:text-[var(--wah-text-muted,#A89B8F)]">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#943310] dark:hover:text-[#E0633C] transition-colors cursor-pointer"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-[#CBBDB0]" />
        <span className="text-gray-900 dark:text-[var(--wah-text,#FAF6F2)] font-bold">التصنيفات التراثية</span>
      </nav>

      {/* Header */}
      <div className="bg-[#241912] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-[#3A2D23]">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>خريطة تصنيفات صعيد مصر</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-heritage leading-tight">
            تراث الصعيد مصنف بأصالته وخاماته
          </h1>

          <p className="text-xs sm:text-sm text-[#c8b7aa] leading-relaxed">
            من فخار طمي النيل في قنا وأسيوط، إلى كليم الصوف في أخميم وسوهاج، وصولاً لتمور النوبة وعسل السدر الجبلي. تصفح حسب مجالك المفضل.
          </p>
        </div>
      </div>

      {/* Detailed Categories Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            id={`category-detail-card-${cat.id}`}
            onClick={() => navigateToCategory(cat.id)}
            className="clay-card bg-white dark:bg-[var(--wah-surface,#1B1613)] p-5 rounded-2xl border border-[#ebdccd] dark:border-[var(--wah-border,#352B24)] hover:border-[#943310] dark:hover:border-[#E0633C] cursor-pointer transition-all duration-300 group flex flex-col sm:flex-row gap-5 shadow-xs"
          >
            {/* Image */}
            <div className="relative w-full sm:w-44 h-44 rounded-xl overflow-hidden shrink-0 bg-[#f4ebe1] dark:bg-[var(--wah-surface-subtle,#26201B)]">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {cat.featuredGovernorate && (
                <div className="absolute top-2 right-2">
                  <span className="bg-[#943310] dark:bg-[#B24C2B] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                    {cat.featuredGovernorate}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-gray-900 dark:text-[var(--wah-text,#FAF6F2)] text-lg group-hover:text-[#943310] dark:group-hover:text-[#E0633C] transition-colors font-heritage">
                    {cat.name}
                  </h3>
                  <span className="bg-[#f4ebe1] dark:bg-amber-950/50 text-[#943310] dark:text-[#E0633C] text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0">
                    {(cat.productsCount ?? 0) > 0 ? `${cat.productsCount} منتجات` : 'حرف أصيلة'}
                  </span>
                </div>

                <p className="text-xs text-gray-600 dark:text-[var(--wah-text-muted,#A89B8F)] mt-2 leading-relaxed">
                  {cat.description}
                </p>

                {cat.heritageNote && (
                  <div className="mt-3 p-2.5 bg-[#FAF7F2] dark:bg-[var(--wah-surface-subtle,#26201B)] rounded-xl border border-[#ebdccd] dark:border-[var(--wah-border,#352B24)] flex items-start gap-1.5 text-xs text-[#8c6b53] dark:text-[var(--wah-text-muted,#A89B8F)]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-snug">{cat.heritageNote}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#f0e4d7] dark:border-[var(--wah-border,#352B24)] flex items-center justify-between text-xs font-bold text-[#943310] dark:text-[var(--wah-primary,#E0633C)]">
                <span>استكشف منتجات هذا القسم</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Layers, ChevronRight, MapPin, ArrowLeft, Sparkles } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { categories, navigateToCategory, setActivePage } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#8c6b53]">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#943310] transition-colors"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="text-gray-900 font-bold">التصنيفات التراثية</span>
      </nav>

      {/* Header */}
      <div className="bg-[#241912] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
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
            className="clay-card bg-white p-5 rounded-2xl border border-[#ebdccd] hover:border-[#943310] cursor-pointer transition-all duration-300 group flex flex-col sm:flex-row gap-5"
          >
            {/* Image */}
            <div className="relative w-full sm:w-44 h-44 rounded-xl overflow-hidden shrink-0 bg-[#f4ebe1]">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {cat.featuredGovernorate && (
                <div className="absolute top-2 right-2">
                  <span className="bg-[#943310] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                    {cat.featuredGovernorate}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#943310] transition-colors font-heritage">
                    {cat.name}
                  </h3>
                  <span className="bg-[#f4ebe1] text-[#943310] text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0">
                    {cat.productsCount > 0 ? `${cat.productsCount} منتجات` : 'حرف أصيلة'}
                  </span>
                </div>

                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  {cat.description}
                </p>

                {cat.heritageNote && (
                  <div className="mt-3 p-2.5 bg-[#faf6f0] rounded-xl border border-[#ebdccd] flex items-start gap-1.5 text-xs text-[#8c6b53]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-snug">{cat.heritageNote}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#f0e4d7] flex items-center justify-between text-xs font-bold text-[#943310]">
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

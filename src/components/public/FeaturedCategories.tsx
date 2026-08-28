import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowLeft, Layers, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

export const FeaturedCategories: React.FC = () => {
  const { categories, navigateToCategory, setActivePage } = useApp();

  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#B45F42] mb-1">
            <Layers className="w-4 h-4" />
            <span>التصنيفات والحرف المتوارثة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#2D2A26] font-heritage">
            تصفح كنوز وخيرات الصعيد
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6F64] mt-1">
            اختر التصنيف لاستكشاف منتجات الحرفيين والورش التراثية بكل محافظة
          </p>
        </div>

        <button
          type="button"
          id="view-all-cats-btn"
          onClick={() => setActivePage('categories')}
          aria-label="عرض جميع التصنيفات التراثية والحرفية"
          className="text-xs sm:text-sm font-bold text-[#B45F42] hover:text-[#9E4F36] flex items-center gap-1.5 self-start sm:self-auto hover:underline min-h-[40px] cursor-pointer"
        >
          <span>عرض جميع التصنيفات</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((cat, idx) => (
          <motion.div
            key={cat.id}
            id={`category-card-${cat.id}`}
            role="button"
            tabIndex={0}
            aria-label={`تصفح منتجات تصنيف ${cat.name}، ${cat.productsCount > 0 ? cat.productsCount + ' منتج متوفر' : ''}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateToCategory(cat.id);
              }
            }}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.35, delay: (idx % 4) * 0.08 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => navigateToCategory(cat.id)}
            className="geometric-card overflow-hidden group cursor-pointer flex flex-col bg-white"
          >
            <div className="relative aspect-4/3 w-full overflow-hidden bg-[#F3EFE9]">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

              {cat.featuredGovernorate && (
                <div className="absolute top-2.5 right-2.5">
                  <span className="bg-[#B45F42]/90 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{cat.featuredGovernorate}</span>
                  </span>
                </div>
              )}

              <div className="absolute bottom-2.5 right-2.5 left-2.5 text-right">
                <h3 className="text-white font-bold text-sm sm:text-base leading-tight drop-shadow-xs">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-amber-200/90 font-medium">
                  {(cat.productsCount ?? 0) > 0 ? `${cat.productsCount} منتج متوفر` : 'حرف أصيلة'}
                </span>
              </div>
            </div>

            <div className="p-3.5 flex-1 flex flex-col justify-between bg-white text-xs">
              <p className="text-[#54493F] line-clamp-2 leading-relaxed">
                {cat.description}
              </p>

              {cat.heritageNote && (
                <div className="mt-2.5 pt-2 border-t border-[#E8E1D9] flex items-center gap-1 text-[10px] text-[#B45F42] font-medium">
                  <Sparkles className="w-3 h-3 shrink-0 text-amber-600" />
                  <span className="truncate">{cat.heritageNote}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowUpLeft, MapPin, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FeaturedCategories: React.FC = () => {
  const { categories, navigateToCategory, setActivePage } = useApp();
  // التصنيف الأول مفتوح افتراضياً
  const [activeId, setActiveId] = useState<string>(categories[0]?.id || '');

  return (
    <section
      dir="rtl"
      className="
        py-16
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors duration-500
        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
        max-w-[1600px]
        mx-auto
        px-5
        sm:px-8
        lg:px-12
      "
    >
      {/* الرأس التحريري الفاخر */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 pb-6 border-b border-black/10 dark:border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#9a6a35] tracking-wider mb-2">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>صنايع وحرف بلادنا</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-serif tracking-tight">
            لفّة في حرف وصنعة الصعيد
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setActivePage('categories')}
          className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#9a6a35] hover:text-[#744e26] transition-colors py-2 px-4 rounded-xl hover:bg-[#9a6a35]/5 self-start sm:self-auto cursor-pointer"
        >
          <span>شوف كل الحرف</span>
          <ArrowUpLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1" />
        </button>
      </div>

      {/* شاشة سطح المكتب: أكورديون أفقي متمدد سينمائي */}
      <div className="hidden lg:flex gap-3 h-[520px] w-full">
        {categories.map((cat, idx) => {
          const isActive = activeId === cat.id;

          return (
            <motion.div
              key={cat.id}
              role="button"
              tabIndex={0}
              onMouseEnter={() => setActiveId(cat.id)}
              onClick={() => navigateToCategory(cat.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigateToCategory(cat.id);
                }
              }}
              animate={{
                flex: isActive ? 4 : 1,
              }}
              transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
              className="relative h-full rounded-[1.5rem] overflow-hidden cursor-pointer shadow-lg select-none group border border-black/10 dark:border-white/10 bg-black"
            >
              {/* صورة الخلفية */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90"
                loading="lazy"
              />

              {/* طبقة التدرج الداكنة */}
              <div
                className={`absolute inset-0 transition-opacity duration-500 ${
                  isActive
                    ? 'bg-gradient-to-t from-black via-black/40 to-black/25'
                    : 'bg-black/65 hover:bg-black/50'
                }`}
              />

              {/* الحالة المنكمشة (Collapsed State): العنوان يظهر رأسياً بشكل أنيق */}
              <div
                className={`absolute inset-0 p-6 flex flex-col justify-between items-center transition-opacity duration-300 ${
                  isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              >
                <span className="font-mono text-xs text-white/50 font-light">
                  0{idx + 1}
                </span>

                <h3 className="text-white font-bold text-lg font-serif tracking-wide [writing-mode:vertical-rl] rotate-180 select-none">
                  {cat.name}
                </h3>

                <div className="w-2 h-2 rounded-full bg-[#9a6a35]/60" />
              </div>

              {/* الحالة المفتوحة (Expanded State): عرض كامل البيانات والتفاصيل */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                    className="absolute inset-0 p-8 flex flex-col justify-between z-10"
                  >
                    {/* الجزء العلوي: الرقم وشارة المحافظة وزر الانتقال */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-amber-200 border border-white/10">
                          0{idx + 1}
                        </span>
                        {cat.featuredGovernorate && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9a6a35] text-white text-xs font-bold backdrop-blur-md">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{cat.featuredGovernorate}</span>
                          </span>
                        )}
                      </div>

                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:bg-[#9a6a35] transition-colors">
                        <ArrowUpLeft className="w-5 h-5" />
                      </div>
                    </div>

                    {/* الجزء السفلي: النصوص والوصف والنفحة التراثية */}
                    <div className="max-w-xl text-right">
                      <span className="text-xs uppercase tracking-widest text-[#9a6a35] font-bold block mb-1">
                        {cat.nameEn || 'Upper Egypt Craft'}
                      </span>

                      <h3 className="text-3xl sm:text-4xl font-black text-white font-serif mb-3 leading-tight">
                        {cat.name}
                      </h3>

                      <p className="text-sm text-white/80 leading-relaxed mb-4 line-clamp-2">
                        {cat.description}
                      </p>

                      {cat.heritageNote && (
                        <div className="pt-3 border-t border-white/20 inline-flex items-center gap-2 text-xs text-amber-200/90">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="italic">{cat.heritageNote}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* شاشات الموبايل والتابلت: بطاقات انسيابية عريضة لسهولة التصفح باللمس */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            role="button"
            tabIndex={0}
            onClick={() => navigateToCategory(cat.id)}
            className="relative h-64 rounded-2xl overflow-hidden shadow-lg cursor-pointer border border-black/10 dark:border-white/10 bg-black"
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover opacity-90"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="absolute top-3 inset-x-3 flex items-center justify-between">
              <span className="font-mono text-[11px] text-white/70 bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10">
                0{idx + 1}
              </span>
              {cat.featuredGovernorate && (
                <span className="text-[10px] bg-[#9a6a35] text-white px-2.5 py-0.5 rounded-full font-bold">
                  {cat.featuredGovernorate}
                </span>
              )}
            </div>

            <div className="absolute bottom-3 inset-x-3 text-right">
              <h3 className="text-xl font-bold text-white font-serif mb-1">
                {cat.name}
              </h3>
              <p className="text-xs text-white/70 line-clamp-1">
                {cat.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
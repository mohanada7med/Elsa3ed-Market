import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  MapPin,
  ArrowUpLeft,
  Sparkles,
  LayoutGrid,
  Rows3,
  ChevronRight,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CategoriesPage: React.FC = () => {
  const { categories, navigateToCategory, setActivePage } = useApp();

  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'interactive' | 'grid'>('interactive');

  // مزامنة فورية: أول ما الـ categories توصل من الـ Context يتم تفعيل أول عنصر
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCatId) {
      setSelectedCatId(categories[0].id);
    }
  }, [categories, selectedCatId]);

  const selectedCategory = categories.find((c) => c.id === selectedCatId) || categories[0];

  return (
    <div className="min-h-screen py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
      {/* مسار الصفحة وأزرار التبديل */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6DFD5]/80 dark:border-[#332A24]/70 pb-5">
        <nav className="flex items-center gap-2 text-xs text-[#8C6B53] dark:text-[#A89B8F]">
          <button
            type="button"
            onClick={() => setActivePage('home')}
            className="hover:text-[#B24C2B] dark:hover:text-[#E8734A] transition-colors cursor-pointer font-medium"
          >
            الرئيسية
          </button>
          <ChevronRight className="w-3.5 h-3.5 rotate-180 text-stone-400" />
          <span className="text-[#26211C] dark:text-[#FAF6F2] font-bold">
            أطلس الحرف والمشغولات التراثية
          </span>
        </nav>

        {/* زر التبديل بين الأنماط */}
        <div className="inline-flex items-center bg-[#F0EAE1] dark:bg-[#1E1916] p-1 rounded-2xl border border-[#E4DACD] dark:border-[#382E26] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('interactive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === 'interactive'
                ? 'bg-white dark:bg-[#2B231D] text-[#B24C2B] dark:text-[#E8734A] shadow-xs'
                : 'text-[#73675B] dark:text-[#9E9084] hover:text-[#26211C]'
              }`}
          >
            <Rows3 className="w-4 h-4" />
            <span>عرض الأطلس التفاعلي</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === 'grid'
                ? 'bg-white dark:bg-[#2B231D] text-[#B24C2B] dark:text-[#E8734A] shadow-xs'
                : 'text-[#73675B] dark:text-[#9E9084] hover:text-[#26211C]'
              }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>عرض الشبكة</span>
          </button>
        </div>
      </div>

      {/* الرأس التحريري الفاخر */}
      <div className="relative rounded-3xl p-6 sm:p-12 bg-[#1C1613] text-white overflow-hidden shadow-2xl border border-[#352922]">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#B24C2B]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold">
            <Compass className="w-3.5 h-3.5" />
            <span>الأرشيف الموثق لحرف صعيد مصر</span>
          </div>
          <h1 className="text-2xl sm:text-5xl font-black font-heritage leading-tight text-stone-100">
            أصالة الصعيد مصنفة بالخامة والنشأة
          </h1>
          <p className="text-xs sm:text-sm text-stone-300/80 leading-relaxed max-w-2xl font-light">
            استكشف الحرف اليدوية ككيانات حية، تنبض بطمي النيل وخيوط الفضة وسعف الواحات. اختر الحرفة لتطلع على توثيقها ومحافظتها ومجموعاتها الحصرية.
          </p>
        </div>
      </div>

      {/* النمط التفاعلي */}
      {viewMode === 'interactive' && selectedCategory && (
        <>
          {/* نسخة سطح المكتب (Desktop: lg+) */}
          <div className="hidden lg:grid grid-cols-12 gap-8 items-stretch">
            {/* القائمة المفهرسة */}
            <div className="col-span-5 flex flex-col gap-3">
              {categories.map((cat, idx) => {
                const isSelected = cat.id === selectedCategory.id;

                return (
                  <div
                    key={cat.id}
                    role="button"
                    tabIndex={0}
                    onMouseEnter={() => setSelectedCatId(cat.id)}
                    onClick={() => navigateToCategory(cat.id)}
                    className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between ${isSelected
                        ? 'bg-[#FAF6F0] dark:bg-[#231B17] border-[#B24C2B] dark:border-[#E8734A] shadow-md shadow-[#B24C2B]/5'
                        : 'bg-transparent border-[#E8DFC5]/60 dark:border-[#2C241E] hover:bg-white/40 dark:hover:bg-white/5'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs font-bold text-[#8C6B53] dark:text-[#8E8075] bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                        0{idx + 1}
                      </span>

                      <div>
                        <h3
                          className={`text-lg font-bold font-heritage transition-colors ${isSelected
                              ? 'text-[#B24C2B] dark:text-[#E8734A]'
                              : 'text-[#26211C] dark:text-[#FAF6F2]'
                            }`}
                        >
                          {cat.name}
                        </h3>
                        <span className="text-[11px] text-stone-400 dark:text-stone-500 uppercase tracking-wider block font-medium">
                          {cat.nameEn || 'Handcrafted Heritage'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {cat.featuredGovernorate && (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold">
                          {cat.featuredGovernorate}
                        </span>
                      )}
                      <ArrowUpLeft
                        className={`w-4 h-4 transition-transform duration-300 ${isSelected
                            ? 'text-[#B24C2B] dark:text-[#E8734A] -translate-x-1 -translate-y-1'
                            : 'text-stone-400 opacity-40 group-hover:opacity-100'
                          }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* المسرح البصري الكبير للديسكتوب */}
            <div className="col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCategory.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="relative h-full min-h-[520px] rounded-3xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 flex flex-col justify-between p-10 text-white"
                >
                  <img
                    src={selectedCategory.image}
                    alt={selectedCategory.name}
                    onClick={() => navigateToCategory(selectedCategory.id)}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120D0B] via-[#120D0B]/60 to-black/30 pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between pointer-events-none">
                    {selectedCategory.featuredGovernorate && (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-amber-200 text-xs font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[#E8734A]" />
                        <span>محافظة {selectedCategory.featuredGovernorate}</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 text-xs text-white/80 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>حرفة تراثية موثقة</span>
                    </span>
                  </div>

                  <div className="relative z-10 space-y-4 max-w-xl text-right">
                    <h2 className="text-4xl lg:text-5xl font-black font-heritage leading-tight text-white drop-shadow-md">
                      {selectedCategory.name}
                    </h2>

                    <p className="text-sm sm:text-base text-stone-200 leading-relaxed drop-shadow-xs">
                      {selectedCategory.description}
                    </p>

                    {selectedCategory.heritageNote && (
                      <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 inline-flex items-start gap-3 text-xs sm:text-sm text-amber-200/95">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span className="italic">{selectedCategory.heritageNote}</span>
                      </div>
                    )}

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => navigateToCategory(selectedCategory.id)}
                        className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[#B24C2B] text-white font-bold text-sm shadow-xl hover:bg-[#8F391E] transition-all duration-300 cursor-pointer"
                      >
                        <span>استكشف منتجات وحرفيي {selectedCategory.name}</span>
                        <ArrowUpLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* نسخة الموبايل والتابلت (Mobile/Tablet View) */}
          <div className="flex flex-col gap-3.5 lg:hidden">
            {categories.map((cat, idx) => {
              const isOpen = selectedCatId === cat.id;

              return (
                <div
                  key={cat.id}
                  className={`relative rounded-2xl border overflow-hidden transition-all duration-300 ${isOpen
                      ? 'bg-[#FAF7F2] dark:bg-[#201814] border-[#B24C2B]/80 dark:border-[#E8734A]/80 shadow-md ring-1 ring-[#B24C2B]/20'
                      : 'bg-white dark:bg-[#1A1512] border-stone-200/80 dark:border-stone-800/80'
                    }`}
                >
                  {/* شريط الإضاءة النحاسي الجانبي للتمييز الاحترافي */}
                  {isOpen && (
                    <span className="absolute top-0 right-0 w-1.5 inset-y-0 bg-[#B24C2B] dark:bg-[#E8734A]" />
                  )}

                  {/* شريط العنوان: النقر عليه يفتح أو يغلق تفاصيل الخيار */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedCatId(isOpen ? '' : cat.id)}
                    className="p-4 pr-5 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${isOpen
                            ? 'bg-[#B24C2B]/10 text-[#B24C2B] dark:text-[#E8734A]'
                            : 'bg-black/5 dark:bg-white/5 text-stone-500'
                          }`}
                      >
                        0{idx + 1}
                      </span>
                      <div>
                        <h3 className="text-base font-bold font-heritage text-[#26211C] dark:text-white">
                          {cat.name}
                        </h3>
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                          {cat.nameEn}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {cat.featuredGovernorate && (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold">
                          {cat.featuredGovernorate}
                        </span>
                      )}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isOpen
                            ? 'bg-[#B24C2B]/10 text-[#B24C2B] dark:text-[#E8734A]'
                            : 'text-stone-400'
                          }`}
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                            }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* الجزء المنسدل عند الفتح */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                        className="overflow-hidden border-t border-stone-200/60 dark:border-stone-800/80"
                      >
                        <div className="p-4 space-y-4">
                          {/* الصورة التفاعلية: النقر عليها ينقل لصفحة القسم */}
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => navigateToCategory(cat.id)}
                            className="relative aspect-[16/10] w-full rounded-xl overflow-hidden cursor-pointer group shadow-md"
                          >
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                            {cat.featuredGovernorate && (
                              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                <MapPin className="w-3 h-3 text-[#E8734A]" />
                                <span>{cat.featuredGovernorate}</span>
                              </div>
                            )}

                            {/* شارة التوجيه بالأسفل */}
                            <div className="absolute bottom-3 inset-x-3.5 flex items-center justify-between text-white">
                              <span className="text-xs font-semibold text-amber-200/90 flex items-center gap-1">
                                <Compass className="w-3.5 h-3.5" />
                                <span>اضغط على الصورة لاستكشاف القطع</span>
                              </span>
                              <div className="w-8 h-8 rounded-full bg-[#B24C2B] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <ArrowUpLeft className="w-4 h-4" />
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                            {cat.description}
                          </p>

                          {cat.heritageNote && (
                            <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 flex items-start gap-2.5 text-xs text-[#8C6B53] dark:text-amber-200/90">
                              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                              <span className="text-[11px] leading-relaxed italic font-light">
                                {cat.heritageNote}
                              </span>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => navigateToCategory(cat.id)}
                            className="w-full py-3.5 rounded-xl bg-[#B24C2B] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-transform cursor-pointer"
                          >
                            <span>تصفح كافة معروضات {cat.name}</span>
                            <ArrowUpLeft className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* النمط الشبكي (Grid View) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              role="button"
              tabIndex={0}
              onClick={() => navigateToCategory(cat.id)}
              className="group relative h-[380px] sm:h-[420px] rounded-3xl overflow-hidden shadow-lg border border-[#E8DFC5] dark:border-[#382E26] cursor-pointer flex flex-col justify-end p-6 sm:p-7 text-white"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#140F0D] via-[#140F0D]/50 to-black/20" />

              <div className="absolute top-5 inset-x-5 flex items-center justify-between z-10">
                <span className="font-mono text-xs text-amber-200/80 bg-black/40 px-2.5 py-1 rounded-full border border-white/10">
                  0{idx + 1}
                </span>
                {cat.featuredGovernorate && (
                  <span className="text-xs bg-[#B24C2B] px-3 py-1 rounded-full font-bold shadow-xs">
                    {cat.featuredGovernorate}
                  </span>
                )}
              </div>

              <div className="relative z-10 space-y-2 text-right">
                <span className="text-[10px] uppercase tracking-widest text-amber-300 font-bold block">
                  {cat.nameEn}
                </span>
                <h3 className="text-2xl font-bold font-heritage">{cat.name}</h3>
                <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>

                <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs text-amber-200 font-medium">
                  <span>تصفح الكتالوج</span>
                  <ArrowUpLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
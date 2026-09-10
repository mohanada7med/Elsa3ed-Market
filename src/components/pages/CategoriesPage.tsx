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
    <div
      dir="rtl"
      className="min-h-screen bg-[#eee8dc] text-[#211d18] dark:bg-[#0b0b0a] dark:text-[#f5f0e7] max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-8 space-y-8 sm:space-y-10"
    >
      {/* مسار الصفحة وأزرار التبديل */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-5">
        <nav className="flex items-center gap-2 text-xs text-[#211d18]/60 dark:text-[#f5f0e7]/60 font-medium">
          <button
            type="button"
            onClick={() => setActivePage('home')}
            className="hover:text-[#9a6a35] dark:hover:text-[#d5a56d] transition-colors cursor-pointer"
          >
            الرئيسية
          </button>
          <ChevronRight className="w-3.5 h-3.5 rotate-180 opacity-50" />
          <span className="text-[#211d18] dark:text-[#f5f0e7] font-bold">
            أطلس حرف وفنون الصعيد
          </span>
        </nav>

        {/* زر التبديل بين الأنماط */}
        <div className="inline-flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-black/10 dark:border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('interactive')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'interactive'
                ? 'bg-white dark:bg-[#151513] text-[#9a6a35] dark:text-[#d5a56d] shadow-sm'
                : 'text-[#211d18]/70 dark:text-[#f5f0e7]/70 hover:text-[#211d18] dark:hover:text-[#f5f0e7]'
            }`}
          >
            <Rows3 className="w-4 h-4" />
            <span>عرض الأطلس التفاعلي</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-[#151513] text-[#9a6a35] dark:text-[#d5a56d] shadow-sm'
                : 'text-[#211d18]/70 dark:text-[#f5f0e7]/70 hover:text-[#211d18] dark:hover:text-[#f5f0e7]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>عرض الشبكة</span>
          </button>
        </div>
      </div>

      {/* الرأس التحريري الفاخر */}
      <div className="relative rounded-[2rem] p-6 sm:p-12 bg-[#211d18] text-[#f5f0e7] overflow-hidden shadow-xl border border-black/10 dark:border-white/10">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#9a6a35]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9a6a35]/20 border border-[#9a6a35]/30 text-[#d5a56d] text-xs font-bold">
            <Compass className="w-3.5 h-3.5 text-[#d5a56d]" />
            <span>حرف وفنون صعيد مصر</span>
          </div>
          <h1 className="text-2xl sm:text-5xl font-black font-serif leading-tight">
            أصالة الصعيد بالخامة والبلد
          </h1>
          <p className="text-xs sm:text-sm text-[#f5f0e7]/80 leading-relaxed max-w-2xl font-light">
            استكشف حرف الصعيد اليدوية بطمي النيل وخيوط الفضة وخوص النخيل. اختار الحرفة عشان تشوف أصلها ومحافظتها وأحلى شغل طالع منها.
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
                    className={`group relative p-5 rounded-[1.5rem] border transition-all duration-300 cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-white/95 dark:bg-[#151513]/95 border-[#9a6a35] dark:border-[#9a6a35] shadow-lg ring-1 ring-[#9a6a35]/30'
                        : 'bg-white/50 dark:bg-[#151513]/50 border-black/10 dark:border-white/10 hover:bg-white/80 dark:hover:bg-[#151513]/80'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg ${
                        isSelected ? 'bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d]' : 'bg-black/5 dark:bg-white/5 text-[#211d18]/60 dark:text-[#f5f0e7]/60'
                      }`}>
                        0{idx + 1}
                      </span>

                      <div>
                        <h3
                          className={`text-lg font-black font-serif transition-colors ${
                            isSelected
                              ? 'text-[#9a6a35] dark:text-[#d5a56d]'
                              : 'text-[#211d18] dark:text-[#f5f0e7]'
                          }`}
                        >
                          {cat.name}
                        </h3>
                        <span className="text-[11px] text-[#211d18]/50 dark:text-[#f5f0e7]/50 uppercase tracking-wider block font-medium">
                          {cat.nameEn || 'Handcrafted Heritage'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {cat.featuredGovernorate && (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#211d18]/80 dark:text-[#f5f0e7]/80 font-bold border border-black/5 dark:border-white/5">
                          {cat.featuredGovernorate}
                        </span>
                      )}
                      <ArrowUpLeft
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isSelected
                            ? 'text-[#9a6a35] dark:text-[#d5a56d] -translate-x-1 -translate-y-1'
                            : 'text-[#211d18]/30 dark:text-[#f5f0e7]/30 group-hover:opacity-100'
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
                  className="relative h-full min-h-[520px] rounded-[2rem] overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 flex flex-col justify-between p-10 text-white"
                >
                  <img
                    src={selectedCategory.image}
                    alt={selectedCategory.name}
                    onClick={() => navigateToCategory(selectedCategory.id)}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between pointer-events-none">
                    {selectedCategory.featuredGovernorate && (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-[#d5a56d] text-xs font-bold">
                        <MapPin className="w-3.5 h-3.5 text-[#9a6a35]" />
                        <span>محافظة {selectedCategory.featuredGovernorate}</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 text-xs text-white/90 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>شغل يدوي أصيل</span>
                    </span>
                  </div>

                  <div className="relative z-10 space-y-4 max-w-xl text-right">
                    <h2 className="text-4xl lg:text-5xl font-black font-serif leading-tight text-white drop-shadow-md">
                      {selectedCategory.name}
                    </h2>

                    <p className="text-sm sm:text-base text-white/90 leading-relaxed drop-shadow-xs">
                      {selectedCategory.description}
                    </p>

                    {selectedCategory.heritageNote && (
                      <div className="p-4 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 inline-flex items-start gap-3 text-xs sm:text-sm text-[#d5a56d]">
                        <Sparkles className="w-4 h-4 text-[#d5a56d] shrink-0 mt-0.5" />
                        <span className="italic">{selectedCategory.heritageNote}</span>
                      </div>
                    )}

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => navigateToCategory(selectedCategory.id)}
                        className="group inline-flex items-center gap-3 px-7 py-4 rounded-[1.25rem] bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] font-black text-sm shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                      >
                        <span>شوف شغل وحرفيين {selectedCategory.name}</span>
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
                  className={`relative rounded-[1.5rem] border overflow-hidden transition-all duration-300 ${
                    isOpen
                      ? 'bg-white/95 dark:bg-[#151513]/95 border-[#9a6a35] shadow-lg ring-1 ring-[#9a6a35]/20'
                      : 'bg-white/75 dark:bg-[#151513]/90 border-black/10 dark:border-white/10'
                  }`}
                >
                  {/* شريط الإضاءة النحاسي الجانبي للتمييز الاحترافي */}
                  {isOpen && (
                    <span className="absolute top-0 right-0 w-1.5 inset-y-0 bg-[#9a6a35]" />
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
                        className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                          isOpen
                            ? 'bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d]'
                            : 'bg-black/5 dark:bg-white/5 text-[#211d18]/60 dark:text-[#f5f0e7]/60'
                        }`}
                      >
                        0{idx + 1}
                      </span>
                      <div>
                        <h3 className="text-base font-black font-serif text-[#211d18] dark:text-[#f5f0e7]">
                          {cat.name}
                        </h3>
                        <span className="text-[10px] text-[#211d18]/50 dark:text-[#f5f0e7]/50 uppercase tracking-wider block">
                          {cat.nameEn}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {cat.featuredGovernorate && (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#211d18]/80 dark:text-[#f5f0e7]/80 font-bold border border-black/5 dark:border-white/5">
                          {cat.featuredGovernorate}
                        </span>
                      )}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          isOpen
                            ? 'bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d]'
                            : 'text-[#211d18]/40 dark:text-[#f5f0e7]/40'
                        }`}
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-300 ${
                            isOpen ? 'rotate-180' : ''
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
                        className="overflow-hidden border-t border-black/10 dark:border-white/10"
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
                              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md border border-white/20 text-[#d5a56d] text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                <MapPin className="w-3 h-3 text-[#9a6a35]" />
                                <span>{cat.featuredGovernorate}</span>
                              </div>
                            )}

                            {/* شارة التوجيه بالأسفل */}
                            <div className="absolute bottom-3 inset-x-3.5 flex items-center justify-between text-white">
                              <span className="text-xs font-semibold text-amber-200/90 flex items-center gap-1">
                                <Compass className="w-3.5 h-3.5 text-[#d5a56d]" />
                                <span>دوس على الصورة عشان تشوف المنتجات</span>
                              </span>
                              <div className="w-8 h-8 rounded-full bg-[#9a6a35] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <ArrowUpLeft className="w-4 h-4" />
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-[#211d18]/80 dark:text-[#f5f0e7]/80 leading-relaxed font-normal">
                            {cat.description}
                          </p>

                          {cat.heritageNote && (
                            <div className="p-3.5 rounded-xl bg-[#9a6a35]/10 border border-[#9a6a35]/20 flex items-start gap-2.5 text-xs text-[#9a6a35] dark:text-[#d5a56d]">
                              <Sparkles className="w-4 h-4 text-[#9a6a35] shrink-0 mt-0.5" />
                              <span className="text-[11px] leading-relaxed italic font-light">
                                {cat.heritageNote}
                              </span>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => navigateToCategory(cat.id)}
                            className="w-full py-3.5 rounded-[1.25rem] bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
                          >
                            <span>شوف كل منتجات {cat.name}</span>
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
              className="group relative h-[380px] sm:h-[420px] rounded-[2rem] overflow-hidden shadow-lg border border-black/10 dark:border-white/10 cursor-pointer flex flex-col justify-end p-6 sm:p-7 text-white"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

              <div className="absolute top-5 inset-x-5 flex items-center justify-between z-10">
                <span className="font-mono text-xs text-[#d5a56d] bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 font-bold">
                  0{idx + 1}
                </span>
                {cat.featuredGovernorate && (
                  <span className="text-xs bg-[#9a6a35] text-white px-3 py-1 rounded-full font-bold shadow-xs">
                    {cat.featuredGovernorate}
                  </span>
                )}
              </div>

              <div className="relative z-10 space-y-2 text-right">
                <span className="text-[10px] uppercase tracking-widest text-[#d5a56d] font-bold block">
                  {cat.nameEn}
                </span>
                <h3 className="text-2xl font-black font-serif text-white">{cat.name}</h3>
                <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>

                <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs text-[#d5a56d] font-bold">
                  <span>شوف المنتجات</span>
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
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Governorate } from '../../types';
import { Filter, Sparkles, MapPin, Layers, ArrowUpDown, X, ChevronDown, ChevronUp } from 'lucide-react';

const GOVERNORATES: (Governorate | 'all')[] = [
  'all',
  'قنا',
  'سوهاج',
  'أسوان',
  'الأقصر',
  'أسيوط',
  'المنيا',
  'الوادي الجديد',
  'بني سويف'
];

export const ProductFilters: React.FC = () => {
  const {
    categories,
    selectedGovernorateFilter,
    setSelectedGovernorateFilter,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    selectedHandmadeOnly,
    setSelectedHandmadeOnly,
    selectedSort,
    setSelectedSort,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const activeCount =
    (selectedGovernorateFilter !== 'all' ? 1 : 0) +
    (selectedCategoryFilter !== 'all' ? 1 : 0) +
    (selectedHandmadeOnly ? 1 : 0) +
    (searchQuery.trim() !== '' ? 1 : 0);

  const hasActiveFilters =
    selectedGovernorateFilter !== 'all' ||
    selectedCategoryFilter !== 'all' ||
    selectedHandmadeOnly ||
    searchQuery.trim() !== '' ||
    selectedSort !== 'featured';

  const resetFilters = () => {
    setSelectedGovernorateFilter('all');
    setSelectedCategoryFilter('all');
    setSelectedHandmadeOnly(false);
    setSearchQuery('');
    setSelectedSort('featured');
  };

  return (
    <div className="wah-card p-4 sm:p-5 space-y-4" dir="rtl">
      {/* Mobile Toggle Button */}
      <div className="flex sm:hidden items-center justify-between">
        <button
          type="button"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="flex items-center gap-2 text-xs font-bold text-[#B24C2B] dark:text-[#FF855D] bg-[#FAF7F2] dark:bg-[#1E1917] hover:bg-[#F3EFE9] dark:hover:bg-[#26201B] px-3.5 py-2.5 rounded-xl border border-[#E5DDD3] dark:border-[#352B24] min-h-[44px] transition-colors cursor-pointer"
        >
          <Filter className="w-4 h-4" />
          <span>{isMobileExpanded ? 'إخفاء خيارات التصفية' : 'تصفية وفرز المعروضات'}</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#B24C2B] text-white text-[10px] flex items-center justify-center font-black">
              {activeCount}
            </span>
          )}
          {isMobileExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-[#B24C2B] dark:text-[#FF855D] hover:underline flex items-center gap-1 font-bold p-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>إعادة ضبط</span>
          </button>
        )}
      </div>

      <div className={`${isMobileExpanded ? 'block' : 'hidden sm:block'} space-y-4 pt-1 sm:pt-0`}>
        {/* Filter Header & Reset (Desktop) */}
        <div className="hidden sm:flex items-center justify-between border-b border-[#E5DDD3] dark:border-[#352B24] pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#2D2A26] dark:text-[#FAF6F2]">
            <Filter className="w-4 h-4 text-[#B24C2B] dark:text-[#FF855D]" />
            <span>تصفية واختيار المنتجات التراثية</span>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#B24C2B] text-white text-[10px] flex items-center justify-center font-bold">
                {activeCount}
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-[#B24C2B] dark:text-[#FF855D] hover:underline flex items-center gap-1 font-bold transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>إعادة ضبط جميع الفلاتر</span>
            </button>
          )}
        </div>

        {/* Governorate Pills (Upper Egypt) */}
        <div>
          <label className="block text-xs font-bold text-[#73675B] dark:text-[#A89C90] mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>المحافظة ومصدر الصنعة بالصعيد</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {GOVERNORATES.map((gov) => {
              const isSelected = selectedGovernorateFilter === gov;
              return (
                <button
                  key={gov}
                  type="button"
                  id={`filter-gov-${gov}`}
                  onClick={() => setSelectedGovernorateFilter(gov)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                    isSelected
                      ? 'bg-[#B24C2B] text-white shadow-xs'
                      : 'bg-[#FAF7F2] dark:bg-[#1E1917] text-[#2D2A26] dark:text-[#FAF6F2] hover:bg-[#F3EFE9] dark:hover:bg-[#26201B] border border-[#E5DDD3] dark:border-[#352B24]'
                  }`}
                >
                  {gov === 'all' ? 'جميع محافظات الصعيد' : gov}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Dropdown/Pills */}
        <div>
          <label className="block text-xs font-bold text-[#73675B] dark:text-[#A89C90] mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>التصنيف ونوع الحرفة</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              id="filter-cat-all"
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                selectedCategoryFilter === 'all'
                  ? 'bg-[#B24C2B] text-white shadow-xs'
                  : 'bg-[#FAF7F2] dark:bg-[#1E1917] text-[#2D2A26] dark:text-[#FAF6F2] hover:bg-[#F3EFE9] dark:hover:bg-[#26201B] border border-[#E5DDD3] dark:border-[#352B24]'
              }`}
            >
              جميع التصنيفات
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  id={`filter-cat-${cat.id}`}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                    isSelected
                      ? 'bg-[#B24C2B] text-white shadow-xs'
                      : 'bg-[#FAF7F2] dark:bg-[#1E1917] text-[#2D2A26] dark:text-[#FAF6F2] hover:bg-[#F3EFE9] dark:hover:bg-[#26201B] border border-[#E5DDD3] dark:border-[#352B24]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggles & Sorting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#E5DDD3] dark:border-[#352B24]">
          {/* Handmade Only Toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer bg-[#FAF7F2] dark:bg-[#1E1917] p-3 rounded-xl border border-[#E5DDD3] dark:border-[#352B24] hover:border-[#B24C2B] dark:hover:border-[#FF855D] transition-colors min-h-[44px]">
            <input
              type="checkbox"
              checked={selectedHandmadeOnly}
              onChange={(e) => setSelectedHandmadeOnly(e.target.checked)}
              className="w-4 h-4 text-[#B24C2B] rounded focus:ring-[#B24C2B] border-[#E5DDD3] cursor-pointer"
            />
            <span className="text-xs font-bold text-[#2D2A26] dark:text-[#FAF6F2] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>مشغولات يدوية 100% فقط بأيدي شيوخ الصنعة</span>
            </span>
          </label>

          {/* Sort Select */}
          <div className="flex items-center gap-2 bg-[#FAF7F2] dark:bg-[#1E1917] px-3.5 py-1 rounded-xl border border-[#E5DDD3] dark:border-[#352B24] min-h-[44px]">
            <ArrowUpDown className="w-4 h-4 text-[#73675B] dark:text-[#A89C90] shrink-0" />
            <select
              id="sort-select"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="w-full bg-transparent text-xs font-bold text-[#2D2A26] dark:text-[#FAF6F2] py-2 outline-none cursor-pointer"
            >
              <option value="featured" className="dark:bg-[#1E1917] dark:text-[#FAF6F2]">الترتيب: الأكثر تميزاً وشهرة بالصعيد</option>
              <option value="rating" className="dark:bg-[#1E1917] dark:text-[#FAF6F2]">الترتيب: الأعلى تقييماً من المشترين</option>
              <option value="price-asc" className="dark:bg-[#1E1917] dark:text-[#FAF6F2]">الترتيب: السعر من الأقل للأعلى</option>
              <option value="price-desc" className="dark:bg-[#1E1917] dark:text-[#FAF6F2]">الترتيب: السعر من الأعلى للأقل</option>
              <option value="newest" className="dark:bg-[#1E1917] dark:text-[#FAF6F2]">الترتيب: أحدث القطع المضافة</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

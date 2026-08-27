import React from 'react';
import { useApp } from '../../context/AppContext';
import { Governorate } from '../../types';
import { Filter, Sparkles, MapPin, Layers, ArrowUpDown, X } from 'lucide-react';

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
    <div className="bg-white rounded-2xl border border-[#ebdccd] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Filter Header & Reset */}
      <div className="flex items-center justify-between border-b border-[#f0e4d7] pb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
          <Filter className="w-4 h-4 text-[#943310]" />
          <span>تصفية واختيار المنتجات</span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-[#943310] hover:text-[#7c280a] flex items-center gap-1 font-semibold transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>إعادة ضبط الفلاتر</span>
          </button>
        )}
      </div>

      {/* Governorate Pills (Upper Egypt) */}
      <div>
        <label className="block text-xs font-bold text-[#8c6b53] mb-2 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-600" />
          <span>المحافظة ومصدر الصنعة</span>
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
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#943310] text-white shadow-xs'
                    : 'bg-[#faf6f0] text-gray-700 hover:bg-[#ede0ca] border border-[#ebdccd]'
                }`}
              >
                {gov === 'all' ? 'جميع المحافظات' : gov}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Dropdown/Pills */}
      <div>
        <label className="block text-xs font-bold text-[#8c6b53] mb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          <span>التصنيف التراثي</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            id="filter-cat-all"
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              selectedCategoryFilter === 'all'
                ? 'bg-[#943310] text-white shadow-xs'
                : 'bg-[#faf6f0] text-gray-700 hover:bg-[#ede0ca] border border-[#ebdccd]'
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
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#943310] text-white shadow-xs'
                    : 'bg-[#faf6f0] text-gray-700 hover:bg-[#ede0ca] border border-[#ebdccd]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggles & Sorting */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#f0e4d7]">
        {/* Handmade Only Toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer bg-[#faf6f0] p-2.5 rounded-xl border border-[#ebdccd] hover:border-amber-400 transition-colors">
          <input
            type="checkbox"
            checked={selectedHandmadeOnly}
            onChange={(e) => setSelectedHandmadeOnly(e.target.checked)}
            className="w-4 h-4 text-[#943310] rounded focus:ring-[#943310] border-gray-300"
          />
          <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>مشغولات يدوية 100% فقط</span>
          </span>
        </label>

        {/* Sort Select */}
        <div className="flex items-center gap-2 bg-[#faf6f0] px-3 py-1 rounded-xl border border-[#ebdccd]">
          <ArrowUpDown className="w-4 h-4 text-gray-500 shrink-0" />
          <select
            id="sort-select"
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value as any)}
            className="w-full bg-transparent text-xs font-bold text-gray-800 py-1.5 outline-none cursor-pointer"
          >
            <option value="featured">الترتيب: الأكثر تميزاً وشهرة</option>
            <option value="rating">الترتيب: الأعلى تقييماً</option>
            <option value="price-asc">الترتيب: السعر من الأقل للأعلى</option>
            <option value="price-desc">الترتيب: السعر من الأعلى للأقل</option>
            <option value="newest">الترتيب: أحدث الإضافات</option>
          </select>
        </div>
      </div>
    </div>
  );
};

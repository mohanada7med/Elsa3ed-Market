import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { UpperEgyptFood } from '../../types';
import {
  Utensils,
  Search,
  ArrowLeft
} from 'lucide-react';
import { WAHFoodCard } from '../../design-system/cards/WAHFoodCard';
import { WAHEmptyState } from '../../design-system/WAHEmptyState';
import { WAHSection } from '../../design-system/WAHSection';

export const FoodHeritagePage: React.FC = () => {
  const { navigateToFood, setActivePage } = useApp();
  const [foods, setFoods] = useState<UpperEgyptFood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [governorateFilter, setGovernorateFilter] = useState<string>('all');

  useEffect(() => {
    const fetchFoods = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getFoods();
        setFoods(data);
      } catch (err) {
        console.warn('Could not load foods:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFoods();
  }, []);

  const governorates = Array.from(new Set(foods.map((f) => f.governorateName))).filter(Boolean);
  const categories = Array.from(
    new Set(foods.map((f) => f.category || f.occasionOrTradition || 'أكلات وتراث الصعيد'))
  ).filter(Boolean);

  const filteredFoods = foods.filter((food) => {
    const foodTitle = food.title || food.name || '';
    const foodCat = food.category || food.occasionOrTradition || 'أكلات وتراث الصعيد';
    const matchesSearch =
      foodTitle.includes(searchQuery) ||
      food.description.includes(searchQuery) ||
      food.governorateName.includes(searchQuery) ||
      (food.ingredients && food.ingredients.some((ing) => ing.includes(searchQuery)));
    const matchesCategory = categoryFilter === 'all' || foodCat === categoryFilter;
    const matchesGov = governorateFilter === 'all' || food.governorateName === governorateFilter;
    return matchesSearch && matchesCategory && matchesGov;
  });

  return (
    <div className="min-h-screen bg-[var(--wah-bg,#FAF7F2)] dark:bg-[var(--wah-bg,#120E0C)] text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] py-6 sm:py-10 px-3 sm:px-6 lg:px-8 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] font-medium">
            <button
              onClick={() => setActivePage('home')}
              className="hover:text-[var(--wah-primary,#B24C2B)] dark:hover:text-[var(--wah-primary,#E0633C)] transition-colors cursor-pointer"
            >
              الرئيسية
            </button>
            <span>/</span>
            <span className="text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] font-bold">
              طعم وأكلات صعيد مصر
            </span>
          </div>

          <button
            onClick={() => setActivePage('governorates')}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] hover:underline cursor-pointer"
          >
            <span>أكلات المحافظات</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--wah-accent-light,#FDF3E7)] dark:bg-[var(--wah-surface-subtle,#26201B)] text-[var(--wah-accent,#D97724)] text-xs font-bold border border-[var(--wah-accent,#D97724)]/20">
            <Utensils className="w-3.5 h-3.5 text-[var(--wah-accent,#D97724)]" />
            <span>مذاق الأصالة من الفرن البلدي</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-heritage tracking-tight">
            طعم الصعيد — المطبخ التراثي
          </h1>
          <p className="text-sm sm:text-base text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] leading-relaxed">
            توثيق المطبخ الصعيدي المتوارث: من الفايش السمسمي بخميرة الحمص، الشلولو، الملوخية الناشفة، حتى العسل الأسود ومشروبات قصب السكر والكركديه الأسواني.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-[var(--wah-surface,#1B1613)] rounded-2xl p-4 sm:p-5 border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن أكلة، مكون، أو محافظة..."
                className="w-full bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)] text-xs sm:text-sm text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] rounded-xl pl-10 pr-4 py-2.5 border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] focus:border-[var(--wah-primary,#B24C2B)] outline-none"
              />
              <Search className="w-4 h-4 text-[var(--wah-text-muted,#73675B)] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-[var(--wah-primary,#B24C2B)] text-white shadow-xs'
                    : 'bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)] text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] hover:bg-[var(--wah-border,#E5DDD3)]'
                }`}
              >
                كافة الأصناف
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-[var(--wah-primary,#B24C2B)] text-white shadow-xs'
                      : 'bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)] text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] hover:bg-[var(--wah-border,#E5DDD3)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Governorate Sub-filter */}
          {governorates.length > 0 && (
            <div className="flex items-center gap-2 pt-3 border-t border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-[var(--wah-text-muted,#73675B)] shrink-0">المحافظة:</span>
              <button
                onClick={() => setGovernorateFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                  governorateFilter === 'all'
                    ? 'bg-[var(--wah-primary,#B24C2B)] text-white'
                    : 'bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)] text-[var(--wah-text-muted,#73675B)]'
                }`}
              >
                الكل
              </button>
              {governorates.map((gov) => (
                <button
                  key={gov}
                  onClick={() => setGovernorateFilter(gov)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                    governorateFilter === gov
                      ? 'bg-[var(--wah-primary,#B24C2B)] text-white'
                      : 'bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)] text-[var(--wah-text-muted,#73675B)]'
                  }`}
                >
                  {gov}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Foods Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-72 rounded-2xl bg-white dark:bg-[var(--wah-surface,#1B1613)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] animate-pulse"
              />
            ))}
          </div>
        ) : filteredFoods.length === 0 ? (
          <WAHEmptyState
            icon={Utensils}
            title="لم يتم العثور على أكلات مطابقة"
            description="جرب البحث بكلمة أخرى أو إلغاء فلتر المحافظة لاستعراض روائع طعم الصعيد."
            actionLabel="إعادة ضبط الفلاتر"
            onAction={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setGovernorateFilter('all');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredFoods.map((food) => {
              const title = food.title || food.name || '';
              return (
                <WAHFoodCard
                  key={food.id}
                  id={`food-card-${food.slug}`}
                  title={title}
                  category={food.category || 'تراث صعيدي'}
                  originGovernorate={food.governorateName}
                  shortDescription={food.description}
                  image={food.coverImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'}
                  prepTime={food.prepTime}
                  onClick={() => navigateToFood(food.slug)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

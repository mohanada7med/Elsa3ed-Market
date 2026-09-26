import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { UpperEgyptFood } from '../../types';
import {
  Utensils,
  Search,
  ArrowLeft,
  ArrowUpLeft,
  Sparkles,
  MapPin,
  Clock,
  Flame,
  Shuffle,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  Layers,
  Film,
  X,
  Compass,
} from 'lucide-react';
import FloatingDock from '../common/FloatingDock';

// كاش في الذاكرة لتفادي ضرب السيرفر عند الرجوع للصفحة
let cachedFoods: UpperEgyptFood[] | null = null;

// ضبط أبعاد الصور تلقائياً لتقليل استهلاك الباقة وتسريع الرندر
const getOptimizedImageUrl = (url?: string, width = 600) => {
  const fallback = '/images/food-placeholder.webp';
  if (!url) return fallback;

  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/w_${width},c_fill,q_auto,f_auto/`);
  }

  if (url.includes('unsplash.com')) {
    return `${url.split('?')[0]}?w=${width}&auto=format&fit=crop&q=75`;
  }

  return url;
};

export const FoodHeritagePage: React.FC = () => {
  const { navigateToFood, setActivePage } = useApp();

  const [foods, setFoods] = useState<UpperEgyptFood[]>(cachedFoods || []);
  const [isLoading, setIsLoading] = useState(!cachedFoods);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeLayout, setActiveLayout] = useState<'bento' | 'reel' | 'compact'>('bento');

  const reelScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cachedFoods) {
      setFoods(cachedFoods);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const fetchFoods = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getFoods();
        const validData = Array.isArray(data) ? data : [];
        cachedFoods = validData;
        if (isMounted) setFoods(validData);
      } catch (err) {
        console.warn('Could not load foods:', err);
        if (isMounted) setFoods([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFoods();
    return () => {
      isMounted = false;
    };
  }, []);

  const governorates = useMemo(
    () => Array.from(new Set(foods.map((f) => f.governorateName))).filter(Boolean),
    [foods]
  );

  const categories = useMemo(
    () =>
      Array.from(
        new Set(foods.map((f) => f.category || f.occasionOrTradition || 'أكلات وتراث الصعيد'))
      ).filter(Boolean),
    [foods]
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredFoods = useMemo(() => {
    if (!foods.length) return [];
    return foods.filter((food) => {
      const title = (food.title || food.name || '').toLowerCase();
      const description = (food.description || '').toLowerCase();
      const governorate = (food.governorateName || '').toLowerCase();
      const category = (food.category || food.occasionOrTradition || 'أكلات وتراث الصعيد').toLowerCase();
      const ingredients = Array.isArray(food.ingredients) ? food.ingredients : [];

      const matchesSearch =
        !normalizedQuery ||
        title.includes(normalizedQuery) ||
        description.includes(normalizedQuery) ||
        governorate.includes(normalizedQuery) ||
        ingredients.some((i) => i.toLowerCase().includes(normalizedQuery));

      const matchesGov = selectedGovernorate === 'all' || food.governorateName === selectedGovernorate;
      const matchesCat = selectedCategory === 'all' || category === selectedCategory.toLowerCase();

      return matchesSearch && matchesGov && matchesCat;
    });
  }, [foods, normalizedQuery, selectedGovernorate, selectedCategory]);

  const handleRandomPick = () => {
    if (!filteredFoods.length) return;
    const randomIndex = Math.floor(Math.random() * filteredFoods.length);
    const slug = filteredFoods[randomIndex]?.slug;
    if (slug) navigateToFood(slug);
  };

  const scrollReel = (direction: 'left' | 'right') => {
    if (!reelScrollRef.current) return;
    reelScrollRef.current.scrollBy({
      left: direction === 'left' ? -400 : 400,
      behavior: 'smooth',
    });
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedGovernorate('all');
    setSearchQuery('');
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (!target.src.endsWith('/images/food-placeholder.webp')) {
      target.src = '/images/food-placeholder.webp';
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-cream text-espresso transition-colors duration-500 selection:bg-primary selection:text-white dark:bg-espresso-900 dark:text-cream"
    >
      {/* Decorative Background Rings */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-[260px] top-[18%] h-[600px] w-[600px] rounded-full border border-primary/[0.07] dark:border-[#d6aa72]/[0.06]" />
        <div className="absolute -left-[300px] top-[55%] h-[700px] w-[700px] rounded-full border border-primary/[0.05] dark:border-[#d6aa72]/[0.05]" />
        <div className="absolute right-[15%] top-[42%] h-2 w-2 rounded-full bg-primary/30 dark:bg-[#d6aa72]/30" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-black/[0.06] bg-cream/70 backdrop-blur-md transition-colors dark:border-white/[0.06] dark:bg-espresso-900/70">
        <div className="mx-auto flex h-14 max-w-[1700px] items-center justify-between px-4 sm:px-8 lg:px-12 xl:px-16">
          <button
            onClick={() => setActivePage('home')}
            className="group flex min-h-[38px] cursor-pointer items-center gap-2 text-xs font-bold transition-colors hover:text-primary dark:hover:text-primary-hover"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 transition-colors group-hover:bg-espresso group-hover:text-white dark:border-white/10 dark:group-hover:bg-white dark:group-hover:text-black">
              <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
            </span>
            <span className="text-[11px] sm:text-xs">الرئيسية</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-primary dark:text-primary-hover">
              WAH • طعم الصعيد
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomPick}
              className="group flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-full border border-black/10 px-3 py-1 text-[10px] font-bold transition-colors hover:bg-espresso hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-black sm:px-3.5 sm:py-1.5 sm:text-xs"
              title="يختار لك أكلة صعيدية عشوائية"
            >
              <Shuffle size={12} className="text-primary dark:text-[#d6aa72]" />
              <span>أكلة على البركة!</span>
            </button>

            <button
              onClick={() => setActivePage('map')}
              className="group flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-full border border-black/10 px-3 py-1 text-[10px] font-bold transition-colors hover:bg-espresso hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-black sm:px-3.5 sm:py-1.5 sm:text-xs"
            >
              <Compass size={12} />
              <span className="hidden sm:inline">خريطة الصعيد</span>
              <ArrowUpLeft size={12} className="transition-transform group-hover:-translate-x-0.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-[1700px] px-4 pb-8 pt-8 sm:px-8 sm:pb-14 sm:pt-14 lg:px-12 lg:pb-16 lg:pt-20 xl:px-16">
        <div className="grid gap-14 lg:grid-cols-[1fr_420px] lg:items-end lg:gap-20">
          <div>
            <div className="mb-7 flex items-center gap-3 text-[9px] font-black tracking-[0.28em] text-primary dark:text-primary-hover">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 dark:bg-[#d6aa72]/10">
                <Sparkles size={13} />
              </span>
              UPPER EGYPT CUISINE / TRADITIONS
            </div>

            <h1 className="max-w-6xl text-5xl font-black leading-[0.92] tracking-tight sm:text-7xl lg:text-[8rem] xl:text-[9.5rem]">
              طعم
              <br />
              <span className="mr-3 text-primary dark:text-primary-hover sm:mr-6 lg:mr-16">
                الصعيد
              </span>
            </h1>

            <div className="mt-10 grid max-w-3xl gap-7 sm:grid-cols-[90px_1fr]">
              <div className="hidden sm:block">
                <div className="text-[9px] font-black tracking-[0.2em] text-black/35 dark:text-white/30">
                  01
                </div>
                <div className="mt-3 h-px w-12 bg-primary dark:bg-[#d6aa72]" />
              </div>
              <p className="max-w-2xl text-sm font-medium leading-8 text-black/55 sm:text-base sm:leading-9 dark:text-white/55">
                أكلات الصعيد مش مجرد وجبة، دي حكاية موروثة في قعر الطواجن ودفا الأفران البلدي؛ من خبيز العيش الشمسي والفايش، للويكا المفروكة والكشك، لحد عصارات القصب في قلب النيل.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem] border border-black/[0.08] bg-[#e8e0d2] p-7 dark:border-white/[0.08] dark:bg-[#121210] sm:p-8">
              <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full border border-primary/15 dark:border-[#d6aa72]/10" />

              <div className="relative">
                <div className="mb-12 flex items-center justify-between">
                  <div className="text-[8px] font-black tracking-[0.3em] text-black/35 dark:text-white/35">
                    THE HERITAGE PANTRY
                  </div>
                  <Flame size={18} className="text-primary dark:text-primary-hover" />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-5xl font-black tracking-[-0.07em]">
                      {foods.length}
                    </div>
                    <div className="mt-3 text-[10px] font-medium leading-5 text-black/45 dark:text-white/40">
                      أكلة تراثية
                      <br />
                      متوثقة
                    </div>
                  </div>

                  <div>
                    <div className="text-5xl font-black tracking-[-0.07em]">
                      {governorates.length}
                    </div>
                    <div className="mt-3 text-[10px] font-medium leading-5 text-black/45 dark:text-white/40">
                      محافظة
                      <br />
                      صعيدية
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex items-center gap-3 border-t border-black/10 pt-5 dark:border-white/10">
                  <div className="h-2 w-2 rounded-full bg-primary dark:bg-[#d6aa72]" />
                  <span className="text-[10px] font-bold">
                    من قعر الطاجن ودفا الفرن البلدي
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Header */}
      <section className="relative z-30 mx-auto max-w-[1700px] px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="relative overflow-hidden rounded-[2rem] border border-black/[0.08] bg-espresso p-5 text-white shadow-xl dark:border-white/[0.08] sm:p-7 lg:p-8">
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full border border-white/[0.08]" />
          <div className="pointer-events-none absolute -bottom-32 right-[30%] h-72 w-72 rounded-full border border-white/[0.05]" />

          <div className="relative grid gap-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <Search size={18} />
              </div>
              <div>
                <div className="text-[9px] font-black tracking-[0.2em] text-white/40">
                  SEARCH RECIPES
                </div>
                <div className="mt-1 text-sm font-black">دور على أكلتك المفضلة</div>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="عيش شمسي، ويكا، فايش، كشك، بصارة..."
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.07] px-5 pl-12 text-sm font-medium text-white outline-none transition-all placeholder:text-white/30 focus:border-[#d6aa72]/50 focus:bg-white/[0.1] sm:h-16 sm:px-6 sm:pl-14"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={15} />
                </button>
              ) : (
                <Search size={17} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" />
              )}
            </div>

            <div className="flex items-center gap-1.5 self-end rounded-2xl bg-white/10 p-1.5 sm:self-auto">
              <button
                onClick={() => setActiveLayout('bento')}
                className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${activeLayout === 'bento'
                  ? 'bg-[#d6aa72] text-black shadow-md'
                  : 'text-white/70 hover:text-white'
                  }`}
                title="عرض بينتو تفاعلي"
              >
                <Layers size={14} />
                <span className="hidden sm:inline">بينتو</span>
              </button>
              <button
                onClick={() => setActiveLayout('reel')}
                className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${activeLayout === 'reel'
                  ? 'bg-[#d6aa72] text-black shadow-md'
                  : 'text-white/70 hover:text-white'
                  }`}
                title="شريط سينمائي متتابع"
              >
                <Film size={14} />
                <span className="hidden sm:inline">شريط طبالي</span>
              </button>
              <button
                onClick={() => setActiveLayout('compact')}
                className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${activeLayout === 'compact'
                  ? 'bg-[#d6aa72] text-black shadow-md'
                  : 'text-white/70 hover:text-white'
                  }`}
                title="عرض مدمج وسريع"
              >
                <SlidersHorizontal size={14} />
                <span className="hidden sm:inline">مدمج</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Chips */}
      <section className="relative z-20 mx-auto max-w-[1700px] px-5 pt-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col gap-3 rounded-2xl border border-black/[0.06] bg-white/60 p-3.5 backdrop-blur-md dark:border-white/[0.06] dark:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="whitespace-nowrap text-[10px] font-black uppercase text-black/40 dark:text-white/40">
              المحافظة:
            </span>
            <button
              onClick={() => setSelectedGovernorate('all')}
              className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-bold transition-all ${selectedGovernorate === 'all'
                ? 'bg-espresso text-white shadow-sm dark:bg-cream dark:text-black'
                : 'bg-black/5 text-black/60 hover:bg-black/10 dark:bg-white/5 dark:text-white/60'
                }`}
            >
              كل المحافظات
            </button>
            {governorates.map((gov) => (
              <button
                key={gov}
                onClick={() => setSelectedGovernorate(gov)}
                className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-bold transition-all ${selectedGovernorate === gov
                  ? 'bg-espresso text-white shadow-sm dark:bg-cream dark:text-black'
                  : 'bg-black/5 text-black/60 hover:bg-black/10 dark:bg-white/5 dark:text-white/60'
                  }`}
              >
                {gov}
              </button>
            ))}
          </div>

          {(selectedCategory !== 'all' || selectedGovernorate !== 'all' || searchQuery) && (
            <button
              onClick={clearFilters}
              className="shrink-0 cursor-pointer text-xs font-bold text-primary underline underline-offset-4 hover:opacity-80 dark:text-primary-hover"
            >
              تفريغ الفلاتر
            </button>
          )}
        </div>
      </section>

      {/* Main Grid */}
      <main className="relative z-10 mx-auto max-w-[1700px] px-5 pb-24 pt-8 sm:px-8 sm:pb-28 sm:pt-10 lg:px-12 lg:pb-36 xl:px-16">
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-[2rem] bg-black/5 dark:bg-white/5"
              />
            ))}
          </div>
        )}

        {!isLoading && filteredFoods.length === 0 && (
          <div className="flex min-h-[380px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-black/15 p-10 text-center dark:border-white/15">
            <Utensils size={36} className="text-black/30 dark:text-white/30" />
            <h3 className="mt-4 text-xl font-black">ملقيناش أكلات مطابقة لبحثك</h3>
            <p className="mt-2 text-xs text-black/50 dark:text-white/50">
              جرّب ابحث بكلمة تانية أو اضغط "تفريغ الفلاتر" عشان تظهر كل الأصناف.
            </p>
          </div>
        )}

        {/* Layout 1: Bento */}
        {!isLoading && filteredFoods.length > 0 && activeLayout === 'bento' && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
            {filteredFoods.map((food, idx) => {
              const isLarge = idx % 5 === 0;
              const title = food.title || food.name || '';
              const image = getOptimizedImageUrl(food.coverImage, isLarge ? 850 : 500);
              const colSpan = isLarge ? 'lg:col-span-8' : 'lg:col-span-4';

              return (
                <div
                  key={food.id || food.slug || idx}
                  onClick={() => food.slug && navigateToFood(food.slug)}
                  className={`group relative h-[440px] cursor-pointer overflow-hidden rounded-[2.2rem] border border-black/[0.08] bg-black shadow-lg transition-all duration-700 hover:-translate-y-1.5 hover:shadow-2xl dark:border-white/[0.08] ${colSpan}`}
                >
                  <div className="relative h-full w-full overflow-hidden">
                    <img
                      src={image}
                      alt={title}
                      loading={idx < 4 ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchPriority={idx < 2 ? 'high' : 'auto'}
                      onError={handleImageError}
                      className="h-full w-full object-cover opacity-85 transition-transform duration-1000 ease-out group-hover:scale-110 group-hover:opacity-95"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    <div className="absolute right-5 top-5 flex items-center gap-2">
                      {food.governorateName && (
                        <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                          <MapPin size={11} className="text-[#d6aa72]" />
                          {food.governorateName}
                        </span>
                      )}
                    </div>

                    <div className="absolute left-5 top-5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all group-hover:rotate-45 group-hover:bg-[#d6aa72] group-hover:text-black">
                        <ArrowUpLeft size={16} />
                      </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-white/70">
                        {food.prepTime && (
                          <span className="flex items-center gap-1 text-[#d6aa72]">
                            <Clock size={12} />
                            {food.prepTime}
                          </span>
                        )}
                        <span>•</span>
                        <span>{food.category || 'تراث بلدي'}</span>
                      </div>

                      <h3 className="text-3xl font-black transition-colors group-hover:text-[#d6aa72]">
                        {title}
                      </h3>

                      <p className="mt-2 line-clamp-2 max-w-xl text-xs leading-relaxed text-white/70">
                        {food.description}
                      </p>

                      {Array.isArray(food.ingredients) && food.ingredients.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
                          {food.ingredients.slice(0, 4).map((ingredient, i) => (
                            <span
                              key={`${ingredient}-${i}`}
                              className="rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm"
                            >
                              {ingredient}
                            </span>
                          ))}
                          {food.ingredients.length > 4 && (
                            <span className="rounded-lg bg-white/20 px-2 py-1 text-[10px] font-bold text-[#d6aa72]">
                              +{food.ingredients.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Layout 2: Reel */}
        {!isLoading && filteredFoods.length > 0 && activeLayout === 'reel' && (
          <div className="relative">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold text-black/50 dark:text-white/50">
                اسحب الشريط أو استخدم الأسهم للتنقل السريع بين الطبالي
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollReel('right')}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black/10 transition-colors hover:bg-espresso hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-black"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => scrollReel('left')}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black/10 transition-colors hover:bg-espresso hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-black"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>

            <div
              ref={reelScrollRef}
              className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none"
            >
              {filteredFoods.map((food, idx) => {
                const title = food.title || food.name || '';
                const image = getOptimizedImageUrl(food.coverImage, 420);

                return (
                  <div
                    key={food.id || food.slug || idx}
                    onClick={() => food.slug && navigateToFood(food.slug)}
                    className="group relative h-[480px] w-[320px] shrink-0 cursor-pointer snap-start overflow-hidden rounded-[2.2rem] border border-black/[0.08] bg-black shadow-xl transition-all duration-500 hover:-translate-y-2 dark:border-white/[0.08]"
                  >
                    <div className="relative h-full w-full overflow-hidden">
                      <img
                        src={image}
                        alt={title}
                        loading="lazy"
                        decoding="async"
                        onError={handleImageError}
                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                      <div className="absolute right-5 top-5 rounded-full bg-black/60 px-3.5 py-1 text-xs font-bold text-[#d6aa72] backdrop-blur-md">
                        {food.governorateName || 'الصعيد الجواني'}
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                        <div className="select-none text-3xl font-black text-white/20">
                          #{String(idx + 1).padStart(2, '0')}
                        </div>
                        <h4 className="mt-1 text-2xl font-black transition-colors group-hover:text-[#d6aa72]">
                          {title}
                        </h4>
                        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/70">
                          {food.description}
                        </p>
                        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                          <span className="text-xs font-bold text-[#d6aa72]">
                            تصفح السر والوصفة
                          </span>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:-translate-x-1">
                            <ArrowUpLeft size={14} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Layout 3: Compact */}
        {!isLoading && filteredFoods.length > 0 && activeLayout === 'compact' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFoods.map((food, idx) => {
              const title = food.title || food.name || '';
              const image = getOptimizedImageUrl(food.coverImage, 180);

              return (
                <div
                  key={food.id || food.slug || idx}
                  onClick={() => food.slug && navigateToFood(food.slug)}
                  className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-black/[0.08] bg-white/70 p-3 transition-all hover:shadow-md dark:border-white/[0.08] dark:bg-espresso-900/80"
                >
                  <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl">
                    <img
                      src={image}
                      alt={title}
                      loading="lazy"
                      decoding="async"
                      onError={handleImageError}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary dark:text-primary-hover">
                      <span>{food.governorateName}</span>
                      {food.prepTime && <span>• {food.prepTime}</span>}
                    </div>
                    <h4 className="truncate text-base font-black transition-colors group-hover:text-primary dark:group-hover:text-primary-hover">
                      {title}
                    </h4>
                    <p className="truncate text-xs text-black/50 dark:text-white/45">
                      {food.description}
                    </p>
                  </div>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/5 text-black/60 transition-colors group-hover:bg-primary group-hover:text-white dark:bg-white/5 dark:text-white/60">
                    <ArrowUpLeft size={13} />
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Dock */}
      <FloatingDock count={foods.length} label="أكلة صعيدية" />
    </div>
  );
};

export default FoodHeritagePage;  
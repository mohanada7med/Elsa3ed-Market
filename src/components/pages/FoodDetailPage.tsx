import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { UpperEgyptFood } from '../../types';
import {
  Utensils,
  MapPin,
  ArrowLeft,
  Share2,
  ChevronLeft,
  Flame,
  Clock,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Compass,
} from 'lucide-react';

export const FoodDetailPage: React.FC = () => {
  const {
    selectedFoodSlug,
    navigateToGovernorate,
    setActivePage,
    addToast,
  } = useApp();

  const [food, setFood] = useState<UpperEgyptFood | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});

  const slug =
    selectedFoodSlug ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/food/')
      ? decodeURIComponent(window.location.pathname.split('/')[2] || '')
      : null) ||
    'saidi-fayesh';

  useEffect(() => {
    const fetchFood = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getFoodBySlug(slug);
        if (data) {
          setFood(data);
          setCheckedIngredients({});
        }
      } catch (err) {
        console.warn('Could not load food details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFood();
  }, [slug]);

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleShare = () => {
    const url = `${window.location.origin}/food/${encodeURIComponent(slug)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      addToast('تم نسخ الرابط', 'تم نسخ رابط وصفة الأكلة التراثية بنجاح', 'success');
    }
  };

  if (isLoading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-cream p-6 text-espresso transition-colors duration-500 dark:bg-espresso-900 dark:text-cream"
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent dark:border-[#d6aa72]" />
          <p className="text-sm font-black tracking-wide text-espresso dark:text-cream">
            بنجيب سر الاكله دى من بيوت الصعيد...
          </p>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-cream p-6 text-center text-espresso transition-colors duration-500 dark:bg-espresso-900 dark:text-cream"
      >
        <div className="w-full max-w-md space-y-5 rounded-[2.5rem] border border-black/10 bg-white/75 p-10 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-espresso-900/90">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-[#d6aa72]/10 dark:text-[#d6aa72]">
            <Utensils size={28} />
          </div>
          <h2 className="text-2xl font-black">الأكلة مش موجودة حالياً</h2>
          <p className="text-xs leading-relaxed text-espresso/70 dark:text-cream/70">
            ملقيناش بيانات للأكلة المطلوبة، ممكن تكون اتنقلت أو محتاجة توثيق جديد.
          </p>
          <button
            type="button"
            onClick={() => setActivePage('food')}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-espresso py-3.5 text-xs font-black text-white shadow-lg transition-all hover:bg-primary dark:bg-cream dark:text-black dark:hover:bg-white"
          >
            <span>الرجوع لكل طبالي الصعيد</span>
            <ArrowLeft size={16} />
          </button>
        </div>
      </div>
    );
  }

  const ingredientsList = food.ingredients || [];
  const checkedCount = Object.values(checkedIngredients).filter(Boolean).length;
  const progressPercent =
    ingredientsList.length > 0 ? Math.round((checkedCount / ingredientsList.length) * 100) : 0;

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-cream pb-24 text-espresso transition-colors duration-500 selection:bg-primary selection:text-white dark:bg-espresso-900 dark:text-cream"
    >
      {/* Decorative Background Rings */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-[260px] top-[15%] h-[600px] w-[600px] rounded-full border border-primary/[0.07] dark:border-[#d6aa72]/[0.06]" />
        <div className="absolute -left-[300px] top-[50%] h-[700px] w-[700px] rounded-full border border-primary/[0.05] dark:border-[#d6aa72]/[0.05]" />
      </div>

      {/* TOP NAV BAR */}
      <nav className="sticky top-0 z-50 border-b border-black/[0.06] bg-cream/70 backdrop-blur-md transition-colors dark:border-white/[0.06] dark:bg-espresso-900/70">
        <div className="mx-auto flex h-14 max-w-[1700px] items-center justify-between px-4 sm:px-8 lg:px-12 xl:px-16">
          <button
            type="button"
            onClick={() => setActivePage('food')}
            className="group flex cursor-pointer items-center gap-2 text-xs font-bold transition-colors hover:text-primary dark:hover:text-primary-hover"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 transition-colors group-hover:bg-espresso group-hover:text-white dark:border-white/10 dark:group-hover:bg-white dark:group-hover:text-black">
              <ChevronLeft size={13} className="rotate-180 transition-transform group-hover:-translate-x-0.5" />
            </span>
            <span className="text-[11px] sm:text-xs">سفرة وطبالي الصعيد</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateToGovernorate(food.governorateId || 'qena')}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-[10px] font-bold transition-colors hover:bg-espresso hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-black sm:text-xs"
            >
              <MapPin size={12} className="text-primary dark:text-[#d6aa72]" />
              <span>محافظة {food.governorateName}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-black/10 p-2 text-xs font-bold transition-colors hover:bg-espresso hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-black sm:px-3.5 sm:py-1.5"
              title="مشاركة الوصفة"
            >
              <Share2 size={13} />
              <span className="hidden sm:inline">مشاركة</span>
            </button>
          </div>
        </div>
      </nav>

      {/* HERO BANNER WITH NATURAL CLEAR IMAGE */}
      <section className="relative z-10 mx-auto max-w-[1700px] px-4 pt-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="relative min-h-[420px] w-full overflow-hidden rounded-[2.5rem] border border-black/[0.08] bg-stone-900 shadow-2xl dark:border-white/[0.08] sm:min-h-[480px] lg:min-h-[540px]">
          <img
            src={food.coverImage || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=1600'}
            alt={food.title || food.name || 'أكلة صعيدية'}
            className="h-full w-full object-cover"
          />
          {/* Subtle bottom gradient strictly for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {/* Content */}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d6aa72] px-3.5 py-1 text-[11px] font-black text-black shadow-md">
                <Sparkles size={12} />
                {food.category || food.occasionOrTradition || 'أكلات وتراث الصعيد'}
              </span>

              {food.prepTime && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                  <Clock size={12} className="text-[#d6aa72]" />
                  {food.prepTime}
                </span>
              )}
            </div>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-white drop-shadow-md sm:text-6xl lg:text-7xl">
              {food.title || food.name}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/90 drop-shadow sm:text-base">
              {food.description}
            </p>
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN CONTENT */}
      <main className="relative z-10 mx-auto max-w-[1700px] px-4 pt-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* RIGHT COLUMN: Stories & Method */}
          <div className="space-y-8 lg:col-span-8">
            {/* Story */}
            <article className="relative overflow-hidden rounded-[2rem] border border-black/[0.08] bg-white/70 p-7 shadow-sm backdrop-blur-xl transition-colors dark:border-white/[0.08] dark:bg-espresso-900/80 sm:p-10">
              <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-5 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-[#d6aa72]/10 dark:text-primary-hover">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-primary dark:text-primary-hover">
                      FOLKLORE & HISTORY
                    </span>
                    <h2 className="text-xl font-black sm:text-2xl">أصل الحكاية في بيوت الصعيد</h2>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-sm font-medium leading-8 text-black/70 sm:text-base dark:text-white/70 whitespace-pre-line">
                {food.originStory || food.story || food.description}
              </div>

              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 dark:border-[#d6aa72]/20 dark:bg-[#d6aa72]/5">
                <Flame size={20} className="shrink-0 text-primary dark:text-primary-hover" />
                <p className="text-xs font-bold text-espresso dark:text-cream">
                  توارثتها الأمهات والجدات جيل ورا جيل، وكانت رمز للكرم وعلامة من علامات لَمّة العيلة في المناسبات.
                </p>
              </div>
            </article>

            {/* Preparation / Secret */}
            {(food.preparationMethod || food.preparation) && (
              <article className="relative overflow-hidden rounded-[2rem] border border-black/[0.08] bg-white/70 p-7 shadow-sm backdrop-blur-xl transition-colors dark:border-white/[0.08] dark:bg-espresso-900/80 sm:p-10">
                <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-5 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white dark:bg-[#d6aa72] dark:text-black">
                      <Flame size={20} />
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.25em] text-primary dark:text-primary-hover">
                        CULINARY TRADITION
                      </span>
                      <h3 className="text-xl font-black sm:text-2xl">سر الصنعة والتحضير البلدي</h3>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-sm font-medium leading-8 text-black/70 sm:text-base dark:text-white/70 whitespace-pre-line">
                  {food.preparationMethod || food.preparation}
                </div>
              </article>
            )}
          </div>

          {/* LEFT SIDEBAR: Checklist & Location */}
          <aside className="space-y-6 lg:col-span-4">
            {/* Ingredients Checklist */}
            <div className="rounded-[2rem] border border-black/[0.08] bg-white/75 p-6 shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-espresso-900/80">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Utensils size={17} className="text-primary dark:text-primary-hover" />
                  <h3 className="text-base font-black">المقادير الأصلية</h3>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary dark:bg-[#d6aa72]/15 dark:text-primary-hover">
                  {ingredientsList.length} مكوّنات
                </span>
              </div>

              {/* Progress */}
              {ingredientsList.length > 0 && (
                <div className="mb-5 rounded-2xl border border-black/[0.06] bg-cream/70 p-3.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
                  <div className="flex items-center justify-between text-[11px] font-bold text-black/60 dark:text-white/60">
                    <span>جاهزية المكونات</span>
                    <span className="font-black text-primary dark:text-primary-hover">{progressPercent}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <div
                      className="h-full bg-primary transition-all duration-500 ease-out dark:bg-[#d6aa72]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Ingredient Items */}
              <div className="space-y-2">
                {ingredientsList.map((ing, idx) => {
                  const isChecked = !!checkedIngredients[idx];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleIngredient(idx)}
                      className={`group flex w-full cursor-pointer items-center justify-between rounded-xl border p-3 text-right transition-all ${isChecked
                        ? 'border-primary/40 bg-primary/10 text-primary dark:border-[#d6aa72]/40 dark:bg-[#d6aa72]/10 dark:text-primary-hover'
                        : 'border-black/[0.06] bg-cream/50 text-espresso hover:border-primary/30 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-cream'
                        }`}
                    >
                      <span className={`text-xs font-bold transition-all ${isChecked ? 'line-through opacity-60' : ''}`}>
                        {ing}
                      </span>
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all ${isChecked
                          ? 'border-primary bg-primary text-white dark:border-[#d6aa72] dark:bg-[#d6aa72] dark:text-black'
                          : 'border-black/20 bg-transparent text-transparent group-hover:border-primary dark:border-white/20'
                          }`}
                      >
                        <CheckCircle2 size={13} className={isChecked ? 'opacity-100' : 'opacity-0'} />
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 text-center text-[10px] text-black/40 dark:text-white/35">
                اضغط على المكون لتحديده أثناء تجهيز الطبخ
              </p>
            </div>

            {/* Governorate Connection Box */}
            <div className="relative overflow-hidden rounded-[2rem] border border-black/[0.08] bg-espresso p-6 text-white shadow-xl dark:border-white/[0.08]">
              <div className="pointer-events-none absolute -left-14 -top-14 h-36 w-36 rounded-full border border-white/10" />

              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#d6aa72]">
                  <Compass size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black">أصل ونشأة الوصفة</h4>
                  <span className="text-xs text-white/60">محافظة {food.governorateName}</span>
                </div>
              </div>

              <p className="relative mt-4 text-xs leading-6 text-white/70">
                كل شبر في {food.governorateName} ليه طريقته في عمايلها وتفاصيل بتخلي طعمها مختلف عن أي مكان تاني.
              </p>

              <button
                type="button"
                onClick={() => navigateToGovernorate(food.governorateId || 'qena')}
                className="group relative mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs font-black text-white transition-all hover:bg-primary-hover dark:bg-[#d6aa72] dark:text-black dark:hover:bg-white"
              >
                <span>استكشف تراث {food.governorateName}</span>
                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default FoodDetailPage;
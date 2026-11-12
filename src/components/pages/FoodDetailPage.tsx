/*  src/components/pages/FoodDetailPage.tsx  */
import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { UpperEgyptFood } from '../../types';
import {
  ArrowRight,
  Clock,
  MapPin,
  Share2,
  Sparkles,
  Utensils,
  Flame,
  BookOpen,
  CheckCircle2,
  Maximize2,
  ChefHat,
  ScrollText,
  Edit3,
  RotateCcw,
} from 'lucide-react';
import { motion } from 'motion/react';
import { EventImageLightboxModal } from '../common/EventImageLightboxModal';

/* ---------- Helper ---------- */
const fallbackCover = '/mascot/welcome.png';

/* ---------- Component ---------- */
export const FoodDetailPage: React.FC = () => {
  /* ---------- Context ---------- */
  const {
    selectedFoodSlug,
    navigateToGovernorate,
    setActivePage,
    addToast,
    currentUser,
    currentRole,
  } = useApp();

  const isAdmin = currentRole === 'admin' || currentUser?.role === 'admin';

  /* ---------- State ---------- */
  const [food, setFood] = useState<UpperEgyptFood | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  /* ---------- Slug ---------- */
  const slug =
    selectedFoodSlug ??
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/food/')
      ? decodeURIComponent(window.location.pathname.split('/')[2])
      : undefined) ??
    'saidi-fayesh';
  selectedFoodSlug ??
    (typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/food/') &&
      decodeURIComponent(window.location.pathname.split('/')[2])) ??
    'saidi-fayesh';

  /* ---------- Fetch food ---------- */
  useEffect(() => {
    let mounted = true;
    const fetchFood = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getFoodBySlug(slug);
        if (mounted) setFood(data || null);
      } catch (e) {
        console.warn('Could not load food details:', e);
        if (mounted) setFood(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchFood();
    return () => {
      mounted = false;
    };
  }, [slug]);

  /* ---------- Share ---------- */
  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/food/${encodeURIComponent(slug)}`;
    try {
      if (navigator.share && typeof navigator.share === 'function') {
        await navigator.share({
          title: food?.title ?? 'وصفة صعيدية',
          text: food?.description ?? '',
          url,
        });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        addToast('تم نسخ الرابط', 'تم نسخ رابط الوصفة بنجاح', 'success');
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      console.warn('Could not share food:', e);
    }
  };

  /* ---------- Ingredients ---------- */
  const toggleIngredient = (idx: number) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const resetIngredients = () => setCheckedIngredients({});

  const ingredientsList = food?.ingredients || [];
  const checkedCount = Object.values(checkedIngredients).filter(Boolean).length;
  const progressPercent =
    ingredientsList.length > 0 ? Math.round((checkedCount / ingredientsList.length) * 100) : 0;

  /* ---------- Preparation Steps Parser ---------- */
  const prepSteps = useMemo(() => {
    const raw = food?.preparationMethod || food?.preparation || '';
    if (!raw) return [];
    const lines = raw
      .split(/\n+/)
      .map(line => line.replace(/^[\d\-•*.]+\s*/, '').trim())
      .filter(Boolean);
    return lines.length > 1 ? lines : [raw];
  }, [food?.preparationMethod, food?.preparation]);

  /* ---------- Lightbox ---------- */
  const allGalleryImages = useMemo(() => {
    const list: string[] = [];
    const cover = food?.coverImage?.trim();
    if (cover) list.push(cover);
    food?.gallery?.forEach(img => {
      const t = img?.trim();
      if (t && !list.includes(t)) list.push(t);
    });
    return list;
  }, [food?.coverImage, food?.gallery]);

  const openLightbox = (index = 0) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen w-full items-center justify-center bg-espresso-900 text-cream"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#C99444]/20 text-[#C99444] backdrop-blur-md">
            <Utensils className="animate-bounce" size={32} />
          </div>
          <p className="text-sm font-black tracking-widest text-[#C99444]">
            جاري تحضير التجربة الصعيدية الكاملة …
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Not Found ---------- */
  if (!food) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen w-full items-center justify-center bg-espresso-900 p-6 text-cream"
      >
        <div className="max-w-md rounded-[2.5rem] border border-white/10 bg-espresso-800/90 p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C99444]/20 text-[#C99444]">
            <Utensils size={28} />
          </div>
          <h2 className="mt-4 text-2xl font-black text-white">الأكلة مش موجودة حالياً</h2>
          <p className="mt-2 text-xs leading-relaxed text-cream/70">
            لم نتمكن من العثور على بيانات هذه الوصفة. ربما تم نقلها أو تحتاج إلى توثيق.
          </p>
          <button
            type="button"
            onClick={() => setActivePage('food')}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#C99444] py-3.5 text-xs font-black text-espresso-900 transition hover:bg-white"
          >
            <ArrowRight size={16} />
            <span>الرجوع لقائمة الأكلات</span>
          </button>
        </div>
      </div>
    );
  }

  const foodTitle = food.title || food.name || 'أكلة صعيدية';

  /* ---------- Main UI ---------- */
  return (
    <main
      dir="rtl"
      className="relative min-h-screen w-full overflow-x-hidden bg-espresso-900 text-cream selection:bg-primary/30"
    >
      {/* Full-Screen Immersive Background Image with Heavy Gradient */}
      <div className="fixed inset-0 z-0 h-full w-full">
        <img
          src={food.coverImage ?? fallbackCover}
          alt={foodTitle}
          className="h-full w-full object-cover opacity-35 filter blur-sm scale-105"
          onError={e => (e.currentTarget.src = fallbackCover)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso-900 via-espresso-900/90 to-espresso-900/60" />
      </div>

      {/* Floating Header Navigation (Full Width) */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-espresso-900/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 sm:px-12">
          <button
            type="button"
            onClick={() => setActivePage('food')}
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-black text-cream transition hover:border-[#C99444] hover:text-[#C99444]"
          >
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            <span>العودة لكل الأكلات</span>
          </button>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                type="button"
                onClick={() => addToast('ميزة التعديل غير مفعلة الآن', '', 'info')}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-cream transition hover:border-[#C99444]"
              >
                <Edit3 size={14} />
                <span className="hidden sm:inline">تعديل</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full bg-[#C99444] px-5 py-2.5 text-xs font-black text-espresso-900 shadow-lg transition hover:bg-white"
            >
              <Share2 size={14} />
              <span>مشاركة الوصفة</span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-Width Hero Stage */}
      <section className="relative z-10 mx-auto max-w-[1600px] px-6 pt-10 sm:px-12 lg:pt-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">

          {/* Left / Main Hero Typography Column (7 Cols) */}
          <div className="space-y-6 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#C99444]/20 px-4 py-1.5 text-xs font-black text-[#C99444] border border-[#C99444]/30">
                {food.category || food.occasionOrTradition || 'أكلة صعيدية أصيلة'}
              </span>
              {food.governorateName && (
                <button
                  type="button"
                  onClick={() =>
                    food.governorateSlug && navigateToGovernorate?.(food.governorateSlug)
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-cream backdrop-blur-md transition hover:bg-[#C99444] hover:text-espresso-900"
                >
                  <MapPin size={14} className="text-[#C99444]" />
                  <span>{food.governorateName}</span>
                </button>
              )}
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              {foodTitle}
            </h1>

            {food.description && (
              <p className="max-w-2xl text-base leading-8 text-cream/80 sm:text-lg">
                {food.description}
              </p>
            )}

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 pt-4 max-w-xl">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-[#C99444]">
                  <Clock size={18} />
                  <span className="text-xs font-bold text-cream/60">وقت التحضير</span>
                </div>
                <p className="mt-2 text-sm font-black text-white">{food.prepTime ?? 'غير محدد'}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-[#C99444]">
                  <Flame size={18} />
                  <span className="text-xs font-bold text-cream/60">المكوّنات</span>
                </div>
                <p className="mt-2 text-sm font-black text-white">{ingredientsList.length} مكوّن</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-[#C99444]">
                  <BookOpen size={18} />
                  <span className="text-xs font-bold text-cream/60">المنشأ</span>
                </div>
                <p className="mt-2 truncate text-sm font-black text-white">
                  {food.governorateName ?? 'الصعيد'}
                </p>
              </div>
            </div>
          </div>

          {/* Right / Big Cinematic Cover Image Card (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="group relative overflow-hidden rounded-[3rem] border-2 border-white/15 bg-espresso-800 shadow-2xl">
              <div className="aspect-[4/4] w-full overflow-hidden">
                <img
                  src={food.coverImage ?? fallbackCover}
                  alt={foodTitle}
                  onClick={() => openLightbox(0)}
                  className="h-full w-full cursor-zoom-in object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={e => (e.currentTarget.src = fallbackCover)}
                />
              </div>

              <button
                type="button"
                onClick={() => openLightbox(0)}
                className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-espresso-900/80 px-4 py-2.5 text-xs font-black text-cream backdrop-blur-md transition hover:bg-[#C99444] hover:text-espresso-900"
              >
                <Maximize2 size={15} />
                <span>تكبير الصورة بالكامل</span>
              </button>
            </div>

            {/* Gallery Thumbnails Strip */}
            {allGalleryImages.length > 1 && (
              <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2">
                {allGalleryImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => openLightbox(i)}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white/10 transition hover:border-[#C99444]"
                  >
                    <img
                      src={img}
                      alt={`${foodTitle} ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content Grid Sections (Story, Ingredients, Prep) */}
      <section className="relative z-10 mx-auto max-w-[1600px] px-6 py-16 sm:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">

          {/* Left Column: Story & Ingredients (6 Cols) */}
          <div className="space-y-10 lg:col-span-6">

            {/* Story Card */}
            {(food.originStory || food.story) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[2.5rem] border border-[#C99444]/30 bg-espresso-800/80 p-8 shadow-2xl backdrop-blur-xl"
              >
                <div className="mb-4 flex items-center gap-3 text-[#C99444]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C99444]/20">
                    <ScrollText size={20} />
                  </div>
                  <h2 className="text-xl font-black text-white">حكاية الأكلة في التراث الصعيدي</h2>
                </div>
                <p className="text-base leading-8 text-cream/85">
                  {food.originStory || food.story}
                </p>
              </motion.div>
            )}

            {/* Ingredients Interactive Card */}
            {ingredientsList.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-[2.5rem] border border-white/10 bg-espresso-800/80 p-8 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C99444]/20 text-[#C99444]">
                      <Utensils size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white">المكوّنات المطلوبة</h2>
                      <p className="text-xs text-cream/50">اضغط لتحديد المكوّنات أثناء التجهيز</p>
                    </div>
                  </div>

                  {checkedCount > 0 && (
                    <button
                      type="button"
                      onClick={resetIngredients}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-cream transition hover:bg-[#C99444] hover:text-espresso-900"
                    >
                      <RotateCcw size={13} />
                      <span>إعادة ضبط</span>
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-cream/60">تم تجهيز {checkedCount} من {ingredientsList.length}</span>
                    <span className="font-black text-[#C99444]">{progressPercent}%</span>
                  </div>
                  <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#C99444] transition-all duration-500 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Ingredients Grid */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {ingredientsList.map((ing, idx) => {
                    const isChecked = !!checkedIngredients[idx];
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleIngredient(idx)}
                        className={`group flex items-center justify-between gap-3 rounded-2xl border p-4 text-right transition-all ${isChecked
                          ? 'border-[#C99444]/50 bg-[#C99444]/15 text-[#C99444]'
                          : 'border-white/10 bg-white/5 text-cream hover:border-[#C99444]/50'
                          }`}
                      >
                        <span className={`text-xs font-bold leading-relaxed ${isChecked ? 'line-through opacity-60' : ''}`}>
                          {ing}
                        </span>
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${isChecked
                            ? 'border-[#C99444] bg-[#C99444] text-espresso-900'
                            : 'border-white/30 group-hover:border-[#C99444]'
                            }`}
                        >
                          <CheckCircle2 size={13} className={isChecked ? 'opacity-100' : 'opacity-0'} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

          </div>

          {/* Right Column: Preparation Method (6 Cols) */}
          <div className="lg:col-span-6">
            {prepSteps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-[2.5rem] border border-white/10 bg-espresso-800/80 p-8 shadow-2xl backdrop-blur-xl h-full"
              >
                <div className="mb-6 flex items-center gap-3 text-[#C99444]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C99444]/20">
                    <ChefHat size={20} />
                  </div>
                  <h2 className="text-xl font-black text-white">طريقة التحضير خطوة بخطوة</h2>
                </div>

                {prepSteps.length > 1 ? (
                  <ol className="space-y-4">
                    {prepSteps.map((step, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/5 p-5 transition hover:border-white/15"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C99444] text-xs font-black text-espresso-900 shadow-md">
                          {idx + 1}
                        </span>
                        <p className="text-sm leading-8 text-cream/90">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="whitespace-pre-line text-base leading-9 text-cream/90">
                    {prepSteps[0]}
                  </p>
                )}
              </motion.div>
            )}
          </div>

        </div>
      </section>



      {/* Lightbox Modal */}
      <EventImageLightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={allGalleryImages}
        initialIndex={lightboxIndex}
        coverImage={food?.coverImage}
        title={foodTitle}
      />
    </main>
  );
};

export default FoodDetailPage;
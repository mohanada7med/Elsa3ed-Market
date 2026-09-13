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
} from 'lucide-react';

export const FoodDetailPage: React.FC = () => {
  const {
    selectedFoodSlug,
    navigateToGovernorate,
    setActivePage,
    addToast
  } = useApp();

  const [food, setFood] = useState<UpperEgyptFood | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        }
      } catch (err) {
        console.warn('Could not load food details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFood();
  }, [slug]);

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
        className="min-h-screen bg-cream dark:bg-espresso-900 flex items-center justify-center p-6 text-espresso dark:text-cream"
      >
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold">جاري تحميل أسرار المطبخ الصعيدي...</p>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-cream dark:bg-espresso-900 flex items-center justify-center p-6 text-center text-espresso dark:text-cream"
      >
        <div className="bg-white/75 dark:bg-espresso-900/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-10 max-w-md w-full shadow-lg space-y-4">
          <h2 className="text-2xl font-black font-serif">الأكلة مش موجودة</h2>
          <p className="text-sm text-espresso/70 dark:text-cream/70">ملقناش بيانات للأكلة دي حالياً</p>
          <button
            type="button"
            onClick={() => setActivePage('food')}
            className="w-full py-3.5 rounded-[1.25rem] bg-espresso text-white dark:bg-cream dark:text-black hover:bg-primary dark:hover:bg-primary-hover font-black text-xs transition-colors cursor-pointer shadow-md"
          >
            الرجوع لكل أكلات الصعيد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-cream dark:bg-espresso-900 text-espresso dark:text-cream pb-16"
    >
      {/* Hero Header */}
      <div className="relative h-[340px] sm:h-[460px] w-full bg-stone-950 overflow-hidden">
        <img
          src={food.coverImage || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=1600'}
          alt={food.title || food.name || 'أكلة تراثية'}
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0a] via-black/40 to-transparent" />

        {/* Top Controls */}
        <div className="absolute top-6 left-0 right-0 px-5 sm:px-8 max-w-[1600px] mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActivePage('food')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>طعم الصعيد والمطبخ الأصيل</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateToGovernorate(food.governorateId || 'qena')}
              className="px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>محافظة {food.governorateName}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 sm:px-3.5 sm:py-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="مشاركة الأكلة"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">مشاركة</span>
            </button>
          </div>
        </div>

        {/* Title Content */}
        <div className="absolute bottom-6 sm:bottom-10 right-0 left-0 px-5 sm:px-8 max-w-[1600px] mx-auto">
          <span className="px-3.5 py-1 rounded-full bg-primary text-white text-xs font-bold inline-block mb-3 shadow-md">
            {food.category || food.occasionOrTradition || 'أكلات وتراث الصعيد'}
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-serif tracking-tight mb-2 drop-shadow-md">
            {food.title || food.name}
          </h1>

          <p className="text-sm sm:text-base text-amber-100/90 max-w-2xl leading-relaxed drop-shadow-sm font-light">
            {food.originStory || food.story || food.description}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-8">
            {/* Story & Cultural Context */}
            <div className="bg-white/75 dark:bg-espresso-900/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-black/10 dark:border-white/10 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-black font-serif text-espresso dark:text-cream mb-4">
                قصة وتاريخ {food.title || food.name} في بيوت الصعيد
              </h2>
              <div className="text-sm sm:text-base text-espresso/80 dark:text-cream/80 leading-relaxed space-y-4 whitespace-pre-line font-serif">
                {food.originStory || food.story || food.description}
              </div>
            </div>

            {/* Preparation Details */}
            {(food.preparationMethod || food.preparation) && (
              <div className="bg-white/75 dark:bg-espresso-900/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-black/10 dark:border-white/10 shadow-lg">
                <h3 className="text-lg sm:text-xl font-black font-serif text-espresso dark:text-cream mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-primary" />
                  <span>سر الصنعة وطريقة الإعداد التراثية</span>
                </h3>
                <div className="text-sm sm:text-base text-espresso/80 dark:text-cream/80 leading-relaxed whitespace-pre-line">
                  {food.preparationMethod || food.preparation}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Ingredients */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/75 dark:bg-espresso-900/90 backdrop-blur-xl rounded-[2rem] p-6 border border-black/10 dark:border-white/10 shadow-lg">
              <h3 className="text-base font-bold mb-4 text-espresso dark:text-cream flex items-center gap-2 font-serif">
                <Utensils className="w-4 h-4 text-primary" />
                <span>المكونات الأصلية:</span>
              </h3>
              <div className="space-y-2.5">
                {food.ingredients?.map((ing, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-black/5 dark:bg-cream/5 border border-black/5 dark:border-white/5 text-xs font-semibold flex items-center gap-2.5 text-espresso dark:text-cream"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span>{ing}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Governorate Link */}
            <div className="bg-white/75 dark:bg-espresso-900/90 backdrop-blur-xl rounded-[2rem] p-6 border border-black/10 dark:border-white/10 shadow-lg">
              <h3 className="text-base font-bold mb-2 text-espresso dark:text-cream font-serif">
                أصل الأكلة
              </h3>
              <p className="text-xs text-espresso/60 dark:text-cream/60 mb-4">
                محافظة {food.governorateName} معروفة بالأكلة دي وليها سرها في تحضيرها ولمستها الخاصة.
              </p>
              <button
                type="button"
                onClick={() => navigateToGovernorate(food.governorateId || 'qena')}
                className="w-full py-3 px-4 rounded-[1.25rem] bg-espresso text-white dark:bg-cream dark:text-black hover:bg-primary dark:hover:bg-primary-hover font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <span>دليل محافظة {food.governorateName}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

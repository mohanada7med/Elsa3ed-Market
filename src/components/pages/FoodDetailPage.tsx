import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { UpperEgyptFood } from '../../types';
import {
  Utensils,
  MapPin,
  Sparkles,
  ArrowLeft,
  Share2,
  ChevronLeft,
  Flame,
  CheckCircle2,
  Clock
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

  const slug = selectedFoodSlug || 'saidi-fayesh';

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
    const url = `${window.location.origin}/food?slug=${encodeURIComponent(slug)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      addToast('تم نسخ الرابط', 'تم نسخ رابط وصفة الأكلة التراثية بنجاح', 'success');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#B45F42] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-[#7A6F64]">جاري تحميل أسرار المطبخ الصعيدي...</p>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">الأكلة غير موجودة</h2>
          <p className="text-sm text-[#7A6F64] mb-4">لم نتمكن من العثور على بيانات هذه الأكلة التراثية</p>
          <button
            onClick={() => setActivePage('food')}
            className="px-5 py-2.5 rounded-xl bg-[#B45F42] text-white font-bold text-sm"
          >
            العودة لكافة أكلات الصعيد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] text-[#29221D] dark:text-[#FAF6F2] font-sans pb-16">
      {/* Hero Header */}
      <div className="relative h-[320px] sm:h-[440px] w-full bg-[#1A1614] overflow-hidden">
        <img
          src={food.coverImage || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=1600'}
          alt={food.title || food.name || 'أكلة تراثية'}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151210] via-black/40 to-transparent" />

        {/* Top Controls */}
        <div className="absolute top-6 left-0 right-0 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActivePage('food')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>موسوعة طعم الصعيد</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateToGovernorate(food.governorateId || 'qena')}
              className="px-3.5 py-2 rounded-xl bg-[#B45F42]/90 hover:bg-[#B45F42] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>محافظة {food.governorateName}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              title="مشاركة الأكلة"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">مشاركة</span>
            </button>
          </div>
        </div>

        {/* Title Content */}
        <div className="absolute bottom-6 sm:bottom-10 right-0 left-0 px-4 sm:px-8 max-w-7xl mx-auto">
          <span className="px-3 py-1 rounded-full bg-emerald-600/90 text-white text-xs font-bold inline-block mb-3">
            {food.category || food.occasionOrTradition || 'أكلات وتراث الصعيد'}
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-serif tracking-tight mb-2 drop-shadow-md">
            {food.title || food.name}
          </h1>

          <p className="text-sm sm:text-base text-amber-100/90 max-w-2xl leading-relaxed drop-shadow-sm">
            {food.originStory || food.story || food.description}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-8">
            {/* Story & Cultural Context */}
            <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] dark:border-[#382E27]">
              <h2 className="text-xl sm:text-2xl font-black font-serif text-[#29221D] dark:text-[#FAF6F2] mb-4">
                قصة وتاريخ {food.title || food.name} في بيوت الصعيد
              </h2>
              <div className="text-sm sm:text-base text-[#665A4F] dark:text-[#A89C90] leading-relaxed space-y-4 whitespace-pre-line font-serif">
                {food.originStory || food.story || food.description}
              </div>
            </div>

            {/* Preparation Details */}
            {(food.preparationMethod || food.preparation) && (
              <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] dark:border-[#382E27]">
                <h3 className="text-lg sm:text-xl font-black font-serif text-[#29221D] dark:text-[#FAF6F2] mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#B45F42]" />
                  <span>سر الصنعة وطريقة الإعداد التراثية</span>
                </h3>
                <div className="text-sm sm:text-base text-[#665A4F] dark:text-[#A89C90] leading-relaxed whitespace-pre-line">
                  {food.preparationMethod || food.preparation}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Ingredients */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 border border-[#E8E1D9] dark:border-[#382E27]">
              <h3 className="text-base font-bold mb-4 text-[#29221D] dark:text-[#FAF6F2] flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#B45F42]" />
                <span>المكونات الأصلية:</span>
              </h3>
              <div className="space-y-2.5">
                {food.ingredients?.map((ing, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#FAF6F0] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] text-xs font-semibold flex items-center gap-2.5 text-[#29221D] dark:text-[#FAF6F2]"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>{ing}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Governorate Link */}
            <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 border border-[#E8E1D9] dark:border-[#382E27]">
              <h3 className="text-base font-bold mb-2 text-[#29221D] dark:text-[#FAF6F2]">
                أصل الأكلة
              </h3>
              <p className="text-xs text-[#7A6F64] mb-4">
                تشتهر محافظة {food.governorateName} بتحضير هذه الأكلة في مواسم محددة.
              </p>
              <button
                type="button"
                onClick={() => navigateToGovernorate(food.governorateId || 'qena')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#B45F42] hover:bg-[#9E4F36] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
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

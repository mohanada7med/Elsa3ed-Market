import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { HeritagePlace } from '../../types';
import {
  Landmark,
  MapPin,
  Calendar,
  Clock,
  Compass,
  ArrowLeft,
  Share2,
  ChevronLeft,
  Hammer,
  BookOpen,
  Info,
  ExternalLink
} from 'lucide-react';

export const PlaceDetailPage: React.FC = () => {
  const {
    selectedPlaceSlug,
    navigateToGovernorate,
    navigateToCraft,
    navigateToStory,
    setActivePage,
    addToast
  } = useApp();

  const [place, setPlace] = useState<HeritagePlace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const slug = selectedPlaceSlug || 'dendera-temple';

  useEffect(() => {
    const fetchPlace = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getPlaceBySlug(slug);
        if (data) {
          setPlace(data);
        }
      } catch (err) {
        console.warn('Could not load place details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlace();
  }, [slug]);

  const handleShare = () => {
    const url = `${window.location.origin}/places?slug=${encodeURIComponent(slug)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      addToast('تم نسخ الرابط', 'تم نسخ رابط المعلم التراثي بنجاح', 'success');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#B45F42] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-[#7A6F64]">جاري تحميل توثيق المعلم...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">المعلم غير موجود</h2>
          <p className="text-sm text-[#7A6F64] mb-4">لم نتمكن من العثور على بيانات هذا المعلم التراثي</p>
          <button
            onClick={() => setActivePage('places')}
            className="px-5 py-2.5 rounded-xl bg-[#B45F42] text-white font-bold text-sm"
          >
            العودة لكافة المعالم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] text-[#29221D] dark:text-[#FAF6F2] font-sans pb-16">
      {/* Top Header Banner */}
      <div className="relative h-[320px] sm:h-[440px] w-full bg-[#1A1614] overflow-hidden">
        <img
          src={place.coverImage || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1600'}
          alt={place.title}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151210] via-black/40 to-transparent" />

        {/* Top Controls */}
        <div className="absolute top-6 left-0 right-0 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActivePage('places')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>كافة المعالم</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateToGovernorate(place.governorateId || 'qena')}
              className="px-3.5 py-2 rounded-xl bg-[#B45F42]/90 hover:bg-[#B45F42] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>محافظة {place.governorateName}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              title="مشاركة المعلم"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">مشاركة</span>
            </button>
          </div>
        </div>

        {/* Title Content */}
        <div className="absolute bottom-6 sm:bottom-10 right-0 left-0 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="px-3 py-1 rounded-full bg-amber-600/90 text-white text-xs font-bold">
              {place.category}
            </span>
            {place.historicalEra && (
              <span className="px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold">
                {place.historicalEra}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-serif tracking-tight mb-2 drop-shadow-md">
            {place.title}
          </h1>

          <p className="text-sm sm:text-base text-amber-100/90 max-w-2xl leading-relaxed drop-shadow-sm">
            {place.shortDescription || place.description}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article & Architecture */}
          <div className="lg:col-span-8 space-y-8">
            {/* Story & History Section */}
            <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] dark:border-[#382E27]">
              <h2 className="text-xl sm:text-2xl font-black font-serif text-[#29221D] dark:text-[#FAF6F2] mb-4">
                تاريخ وقصة المعلم
              </h2>
              <div className="text-sm sm:text-base text-[#665A4F] dark:text-[#A89C90] leading-relaxed space-y-4 whitespace-pre-line font-serif">
                {place.fullHistory || place.history || place.shortDescription || place.description}
              </div>
            </div>

            {/* Architecture Highlights */}
            {place.architecturalHighlights && place.architecturalHighlights.length > 0 && (
              <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] dark:border-[#382E27]">
                <h3 className="text-lg sm:text-xl font-black font-serif text-[#29221D] dark:text-[#FAF6F2] mb-4">
                  روائع المعمار والنقوش
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {place.architecturalHighlights.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] text-xs sm:text-sm font-semibold flex items-center gap-2.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#B45F42]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Gallery */}
            {((place.gallery && place.gallery.length > 0) || (place.galleryImages && place.galleryImages.length > 0)) && (
              <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] dark:border-[#382E27]">
                <h3 className="text-lg sm:text-xl font-black font-serif text-[#29221D] dark:text-[#FAF6F2] mb-4">
                  معرض الصور التوثيقية
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {((place.gallery && place.gallery.length > 0) ? place.gallery : (place.galleryImages || [])).map((imgUrl, idx) => (
                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden bg-[#FAF6F0]">
                      <img
                        src={imgUrl}
                        alt={`${place.title} ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Visitor Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Practical Visitor Guide */}
            <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 border border-[#E8E1D9] dark:border-[#382E27]">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-[#29221D] dark:text-[#FAF6F2]">
                <Info className="w-4 h-4 text-[#B45F42]" />
                <span>دليل الزيارة والاستكشاف</span>
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#25201D]">
                  <MapPin className="w-4 h-4 text-[#B45F42] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-[#7A6F64]">الموقع الجغرافي:</span>
                    <span className="font-semibold text-[#29221D] dark:text-[#FAF6F2]">
                      {place.locationDescription || `محافظة ${place.governorateName}`}
                    </span>
                  </div>
                </div>

                {place.visitorTips && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40">
                    <span className="font-bold block text-amber-800 dark:text-amber-300 mb-1">
                      نصيحة للزوار:
                    </span>
                    <p className="text-xs text-[#665A4F] dark:text-[#A89C90] leading-relaxed">
                      {place.visitorTips}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Nearby Traditional Crafts in this Governorate */}
            <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 border border-[#E8E1D9] dark:border-[#382E27]">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-[#29221D] dark:text-[#FAF6F2]">
                <Hammer className="w-4 h-4 text-[#B45F42]" />
                <span>ورش وحرف بالمحافظة</span>
              </h3>
              <p className="text-xs text-[#7A6F64] mb-4">
                تزخر محافظة {place.governorateName} بورش تقليدية أصيلة يمكن زيارتها بالقرب من المعلم.
              </p>
              <button
                type="button"
                onClick={() => navigateToGovernorate(place.governorateId || 'qena')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#B45F42] hover:bg-[#9E4F36] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>استكشف حرف {place.governorateName}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

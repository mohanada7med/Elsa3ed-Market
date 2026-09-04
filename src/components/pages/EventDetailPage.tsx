import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { CulturalEvent } from '../../types';
import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Share2,
  ChevronLeft,
  Sparkles,
  Users
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const {
    selectedEventSlug,
    navigateToGovernorate,
    setActivePage,
    addToast
  } = useApp();

  const [event, setEvent] = useState<CulturalEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const slug = selectedEventSlug || 'kenawi-moulid';

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getEventBySlug(slug);
        if (data) {
          setEvent(data);
        }
      } catch (err) {
        console.warn('Could not load event details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  const handleShare = () => {
    const url = `${window.location.origin}/events?slug=${encodeURIComponent(slug)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      addToast('تم نسخ الرابط', 'تم نسخ رابط الفعالية بنجاح', 'success');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#B45F42] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-[#7A6F64]">جاري تحميل تفاصيل الفعالية...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">الفعالية غير موجودة</h2>
          <p className="text-sm text-[#7A6F64] mb-4">لم نتمكن من العثور على بيانات هذه الفعالية</p>
          <button
            onClick={() => setActivePage('events')}
            className="px-5 py-2.5 rounded-xl bg-[#B45F42] text-white font-bold text-sm"
          >
            العودة لكافة الفعاليات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#151210] text-[#29221D] dark:text-[#FAF6F2] font-sans pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Top Controls */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            type="button"
            onClick={() => setActivePage('events')}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#665A4F] dark:text-[#A89C90] hover:text-[#B45F42] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>كافة فعاليات ومواسم الصعيد</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateToGovernorate(event.governorateId || 'qena')}
              className="px-3.5 py-2 rounded-xl bg-[#B45F42]/90 hover:bg-[#B45F42] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>محافظة {event.governorateName}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-white dark:bg-[#1E1917] text-[#29221D] dark:text-[#FAF6F2] border border-[#E8E1D9] dark:border-[#382E27] hover:border-[#B45F42] transition-colors cursor-pointer"
              title="مشاركة الفعالية"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Event Header Card */}
        <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-10 border border-[#E8E1D9] dark:border-[#382E27] shadow-sm mb-8">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold">
              {event.category}
            </span>
            <span className="text-xs text-[#7A6F64] flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-[#B45F42]" />
              <span>الموعد: {event.timeOfYear || event.startDate || event.eventDate}</span>
            </span>
            <span className="text-xs text-[#7A6F64] flex items-center gap-1 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-[#B45F42]" />
              <span>{event.location || event.locationName || event.governorateName}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif text-[#29221D] dark:text-[#FAF6F2] mb-4 leading-tight">
            {event.title}
          </h1>

          <p className="text-base sm:text-lg text-[#665A4F] dark:text-[#A89C90] leading-relaxed mb-6 font-serif">
            {event.description}
          </p>
        </div>

        {/* Full Details & Traditions */}
        {event.traditions && (
          <div className="bg-white dark:bg-[#1E1917] rounded-3xl p-6 sm:p-10 border border-[#E8E1D9] dark:border-[#382E27] shadow-sm mb-8">
            <h2 className="text-xl font-bold font-serif text-[#29221D] dark:text-[#FAF6F2] mb-4">
              الطقوس والمراسم الشعبية
            </h2>
            <div className="prose dark:prose-invert max-w-none text-base leading-relaxed text-[#665A4F] dark:text-[#A89C90] whitespace-pre-line">
              {event.traditions}
            </div>
          </div>
        )}

        {/* Back button */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => setActivePage('events')}
            className="px-6 py-3 rounded-2xl bg-[#B45F42] hover:bg-[#9E4F36] text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
          >
            تصفح المزيد من فعاليات ومواسم الصعيد
          </button>
        </div>
      </div>
    </div>
  );
};

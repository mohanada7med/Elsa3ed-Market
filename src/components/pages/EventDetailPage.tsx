import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { CulturalEvent } from '../../types';
import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  ArrowUpLeft,
  Share2,
  ChevronLeft,
  Sparkles,
  Users,
  Scroll,
  Feather,
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const {
    selectedEventSlug,
    navigateToGovernorate,
    setActivePage,
    addToast,
  } = useApp();

  const [event, setEvent] = useState<CulturalEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const slug =
    selectedEventSlug ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/events/')
      ? decodeURIComponent(window.location.pathname.split('/')[2] || '')
      : null) ||
    'kenawi-moulid';

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
    const url = `${window.location.origin}/events/${encodeURIComponent(slug)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      addToast('تم نسخ الرابط', 'تم نسخ رابط الفعالية بنجاح', 'success');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#eee8dc] dark:bg-[#0b0b0a] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#9a6a35] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-black/60 dark:text-white/60">جاري تحميل تفاصيل الفعالية...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#eee8dc] dark:bg-[#0b0b0a] flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-black mb-2">الفعالية غير موجودة</h2>
          <p className="text-sm text-black/60 dark:text-white/60 mb-6">لم نتمكن من العثور على بيانات هذه الفعالية</p>
          <button
            onClick={() => setActivePage('events')}
            className="px-6 py-3 rounded-xl bg-[#211d18] text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer"
          >
            العودة لكافة الفعاليات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors duration-500
        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
      "
    >
      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <header className="relative z-50 border-b border-black/10 dark:border-white/10">
        <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button
            onClick={() => setActivePage('events')}
            className="
              group flex items-center gap-3
              text-sm font-bold
              transition-all
              hover:text-[#9a6a35]
              cursor-pointer
            "
          >
            <span
              className="
                flex h-10 w-10 items-center justify-center
                rounded-full
                border border-black/10
                bg-white/60
                transition-all
                group-hover:bg-[#211d18]
                group-hover:text-white
                dark:border-white/10
                dark:bg-white/5
                dark:group-hover:bg-white
                dark:group-hover:text-black
              "
            >
              <ArrowLeft
                size={17}
                className="transition-transform group-hover:-translate-x-1"
              />
            </span>
            <span className="hidden sm:block">كافة الفعاليات</span>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <div className="text-[9px] font-bold tracking-[0.35em] text-[#9a6a35]">
              WAH
            </div>
            <div className="mt-1 text-sm font-black">تفاصيل الفعالية</div>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="
              flex items-center gap-2
              rounded-full
              border border-black/10
              px-4 py-2.5
              text-xs font-bold
              transition-all
              hover:bg-[#211d18]
              hover:text-white
              dark:border-white/10
              dark:hover:bg-white
              dark:hover:text-black
              cursor-pointer
            "
          >
            <span className="hidden sm:block">مشاركة الفعالية</span>
            <Share2 size={15} />
          </button>
        </div>
      </header>

      {/* =====================================================
          EVENT DETAIL HERO SECTION
      ===================================================== */}
      <section className="relative overflow-hidden border-b border-black/10 dark:border-white/10">
        <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full border border-black/5 dark:border-white/5" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-[350px] w-[350px] rounded-full border border-black/5 dark:border-white/5" />

        <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#9a6a35]/10 px-3.5 py-1 text-xs font-bold text-[#9a6a35]">
                {event.category || 'موسم تراثي'}
              </span>

              {event.governorateName && (
                <button
                  type="button"
                  onClick={() => navigateToGovernorate(event.governorateId || 'qena')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-black/5 dark:bg-white/5 px-3.5 py-1 text-xs font-bold text-black/70 dark:text-white/70 hover:bg-[#9a6a35] hover:text-white transition-colors cursor-pointer"
                >
                  <MapPin size={13} className="text-[#9a6a35]" />
                  <span>محافظة {event.governorateName}</span>
                </button>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm font-semibold text-black/60 dark:text-white/60">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#9a6a35]" />
                <span>{event.timeOfYear || event.startDate || event.eventDate || 'موسم سنوي'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#9a6a35]" />
                <span>{event.location || event.locationName || event.governorateName}</span>
              </div>
            </div>

            <p className="mt-6 text-base sm:text-lg leading-8 text-black/75 dark:text-white/75 max-w-4xl">
              {event.description}
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          TRADITIONS & RITUALS SECTION
      ===================================================== */}
      {event.traditions && (
        <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:px-12">
          <div
            className="
              relative overflow-hidden
              rounded-[2rem]
              border border-black/10
              bg-white/75
              p-8 sm:p-12
              shadow-lg
              backdrop-blur-xl
              dark:border-white/10
              dark:bg-[#151513]/90
            "
          >
            <div className="mb-6 flex items-center gap-3">
              <Scroll size={20} className="text-[#9a6a35]" />
              <h2 className="text-2xl sm:text-3xl font-black">الطقوس والمراسم الشعبية</h2>
            </div>

            <div className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-8 text-black/70 dark:text-white/70 whitespace-pre-line font-medium">
              {event.traditions}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          FINAL CTA
      ===================================================== */}
      <section className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div
            className="
              relative overflow-hidden
              rounded-[2rem]
              bg-[#211d18]
              px-6 py-14
              text-white
              sm:px-12 sm:py-20
              lg:px-20
            "
          >
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full border border-white/10" />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_400px] lg:items-end">
              <div>
                <div className="mb-5 text-[10px] font-bold tracking-[0.3em] text-[#d5a56d]">
                  FESTIVALS & SEASONS
                </div>
                <h2
                  className="
                    max-w-4xl
                    text-4xl
                    font-black
                    leading-tight
                    tracking-[-0.04em]
                    sm:text-6xl
                  "
                >
                  مواسم بتتجدد...
                  <br />
                  وفرحة بتجمع القلوب.
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-sm leading-8 text-white/55">
                  الفعاليات والموالد في الصعيد مش مجرد احتفالات، دي طقوس مجتمعية بتعبر عن الروح والأصل والترابط.
                </p>
                <button
                  onClick={() => setActivePage('events')}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs font-bold text-black hover:bg-[#d5a56d] transition-colors cursor-pointer w-fit"
                >
                  <span>استعرض كافة الفعاليات</span>
                  <ArrowLeft size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetailPage;
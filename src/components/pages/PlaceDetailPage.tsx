import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { HeritagePlace } from '../../types';
import { VisitorMediaGallery } from '../common/VisitorMediaGallery';

import {
  Landmark,
  MapPin,
  Calendar,
  Compass,
  ArrowLeft,
  Share2,
  ChevronLeft,
  Hammer,
  BookOpen,
  Info,
  Video,
  Sparkles,
  Navigation,
  Clock,
  Ticket,
  Hourglass,
  Car,
  Bus,
  CheckCircle2,
  PartyPopper,
  CalendarDays,
  ExternalLink,
  ShieldCheck,
  Building2,
  Users,
  Layers,
  Sparkle,
  AlertOctagon,
  GraduationCap
} from 'lucide-react';

export const PlaceDetailPage: React.FC = () => {
  const {
    selectedPlaceSlug,
    navigateToGovernorate,
    setActivePage,
    addToast,
    currentUser,
    currentRole,
  } = useApp();

  const isAdmin =
    currentRole === 'admin' || currentUser?.role === 'admin';

  const slug =
    selectedPlaceSlug ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/places/')
      ? decodeURIComponent(window.location.pathname.split('/')[2] || '')
      : null) ||
    'dendera-temple';

  const cachedPlace = wahApi.getCachedPlaceBySlug(slug);
  const [place, setPlace] = useState<HeritagePlace | null>(() => cachedPlace || null);
  const [isLoading, setIsLoading] = useState(() => !cachedPlace);

  useEffect(() => {
    let isMounted = true;

    const fetchPlace = async () => {
      if (!cachedPlace) {
        setIsLoading(true);
      }

      try {
        const data = await wahApi.getPlaceBySlug(slug);

        if (isMounted && data) {
          setPlace(data);
        }
      } catch (err) {
        console.warn('Could not load place details:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPlace();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = async () => {
    const url = `${window.location.origin}/places/${encodeURIComponent(slug)}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: place?.title || 'معلم تراثي',
          text: place?.shortDescription || place?.description || '',
          url,
        });

        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);

        addToast(
          'تم نسخ الرابط',
          'تم نسخ رابط المعلم التراثي بنجاح',
          'success'
        );
      }
    } catch (error) {
      console.warn('Share cancelled or unavailable:', error);
    }
  };

  const scrollToGallery = () => {
    const element = document.getElementById('place-media-gallery');

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  if (isLoading) {
    return (
      <div
        dir="rtl"
        className="
          min-h-screen
          bg-[#eee8dc]
          text-[#211d18]
          dark:bg-[#0b0b0a]
          dark:text-[#f5f0e7]
          flex items-center justify-center
          px-5
        "
      >
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border border-[#9a6a35]/20" />
            <div className="absolute inset-1 rounded-full border-2 border-[#9a6a35] border-t-transparent animate-spin" />
            <Landmark className="absolute inset-0 m-auto w-5 h-5 text-[#9a6a35]" />
          </div>

          <p className="text-sm font-bold text-black/60 dark:text-white/60">
            جاري فتح أرشيف المعلم...
          </p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div
        dir="rtl"
        className="
          min-h-screen
          bg-[#eee8dc]
          text-[#211d18]
          dark:bg-[#0b0b0a]
          dark:text-[#f5f0e7]
          flex items-center justify-center
          px-5
        "
      >
        <div className="w-full max-w-md text-center">
          <div
            className="
              w-20 h-20 mx-auto mb-6
              rounded-full
              border border-[#9a6a35]/20
              flex items-center justify-center
            "
          >
            <Landmark className="w-8 h-8 text-[#9a6a35]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black mb-3">
            المعلم غير موجود
          </h2>

          <p className="text-sm leading-7 text-black/60 dark:text-white/60 mb-6">
            لم نتمكن من العثور على توثيق هذا المعلم.
          </p>

          <button
            type="button"
            onClick={() => setActivePage('places')}
            className="
              inline-flex items-center justify-center gap-2
              px-6 py-3
              rounded-full
              bg-[#211d18] text-white
              dark:bg-white dark:text-black
              font-bold text-xs
              transition-all
              cursor-pointer
            "
          >
            العودة للمعالم
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const history =
    place.fullHistory ||
    place.history ||
    place.shortDescription ||
    place.description;

  const gallery =
    place.gallery && place.gallery.length > 0
      ? place.gallery
      : place.galleryImages || [];

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        bg-[#eee8dc]
        text-[#211d18]
        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
        overflow-x-hidden
        selection:bg-[#9a6a35]/20
      "
    >
      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <header className="relative z-50 border-b border-black/10 dark:border-white/10">
        <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button
            onClick={() => setActivePage('places')}
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
            <span className="hidden sm:block">المعالم</span>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <div className="text-[9px] font-bold tracking-[0.35em] text-[#9a6a35]">
              WAH ARCHIVE
            </div>
            <div className="mt-1 text-sm font-black">تفاصيل المعلم</div>
          </div>

          <div className="flex items-center gap-2">

            {isAdmin && (
              <button
                type="button"
                onClick={scrollToGallery}
                className="
                  h-10 px-4
                  rounded-full
                  bg-[#9a6a35]
                  hover:bg-[#83572c]
                  text-white
                  text-xs
                  font-bold
                  flex items-center gap-2
                  transition-all
                  cursor-pointer
                "
              >
                <Video className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">إدارة الوسائط</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              aria-label="مشاركة المعلم"
              className="
                w-10 h-10
                rounded-full
                border border-black/10
                bg-white/60
                dark:border-white/10
                dark:bg-white/5
                text-black dark:text-white
                flex items-center justify-center
                transition-all
                cursor-pointer
              "
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO (بالمحافظة على شكل الصورة المطلوبة تماماً)
      ========================================================= */}
      <section
        className="
          relative
          min-h-[650px]
          sm:min-h-[720px]
          lg:min-h-[820px]
          overflow-hidden
          bg-[#17120F]
        "
      >
        {/* Background image */}
        <img
          src={
            place.coverImage ||
            'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=2000'
          }
          alt={place.title}
          className="
            absolute inset-0
            w-full h-full
            object-cover
            object-center
            scale-[1.02]
          "
        />

        {/* Dark overlays */}
        <div className="absolute inset-0 bg-black/30 dark:bg-black/45" />

        <div
          className="
            absolute inset-0
            bg-gradient-to-l
            from-[#0b0b0a]/95
            via-[#0b0b0a]/50
            to-[#0b0b0a]/15
          "
        />

        <div
          className="
            absolute inset-0
            bg-gradient-to-t
            from-[#0b0b0a]
            via-[#0b0b0a]/45
            to-transparent
          "
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-transparent sm:hidden" />

        {/* =====================================================
            HERO CONTENT
        ===================================================== */}
        <div
          className="
            relative z-10
            max-w-[1500px] mx-auto
            px-5 sm:px-7 lg:px-12
            min-h-[650px]
            sm:min-h-[720px]
            lg:min-h-[820px]
            flex items-end
          "
        >
          <div className="w-full pb-12 sm:pb-16 lg:pb-24">
            <div className="grid lg:grid-cols-12 gap-8 items-end">
              {/* Main */}
              <div className="lg:col-span-9 min-w-0">
                {/* Eyebrow */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-5 sm:mb-6">
                  <span className="text-[9px] sm:text-[10px] font-black tracking-[0.25em] sm:tracking-[0.3em] text-[#E2A083]">
                    HERITAGE PLACE
                  </span>

                  <span className="w-8 sm:w-12 h-px bg-[#E2A083]/50" />

                  <span className="max-w-[180px] sm:max-w-none truncate text-[9px] sm:text-[10px] text-white/45 font-mono">
                    {place.slug}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <span
                    className="
                      px-3.5 sm:px-4
                      py-1.5 sm:py-2
                      rounded-full
                      bg-[#9a6a35]
                      text-white
                      text-[10px] sm:text-xs
                      font-black
                      shadow-lg
                    "
                  >
                    {place.category}
                  </span>

                  {place.historicalEra && (
                    <span
                      className="
                        px-3.5 sm:px-4
                        py-1.5 sm:py-2
                        rounded-full
                        bg-black/25
                        backdrop-blur-xl
                        border border-white/15
                        text-white
                        text-[10px] sm:text-xs
                        font-bold
                      "
                    >
                      {place.historicalEra}
                    </span>
                  )}

                  {place.visitInfo?.visitStatus && place.visitInfo.visitStatus !== 'open' && (
                    <span
                      className={`
                        px-3.5 sm:px-4
                        py-1.5 sm:py-2
                        rounded-full
                        backdrop-blur-xl
                        text-[10px] sm:text-xs
                        font-black
                        shadow-lg
                        flex items-center gap-1.5
                        ${place.visitInfo.visitStatus === 'closed_to_public'
                          ? 'bg-red-600/90 text-white border border-red-400/40'
                          : place.visitInfo.visitStatus === 'closed_for_restoration'
                            ? 'bg-amber-600/90 text-white border border-amber-400/40'
                            : place.visitInfo.visitStatus === 'public_landmark'
                              ? 'bg-emerald-600/90 text-white border border-emerald-400/40'
                              : place.visitInfo.visitStatus === 'active_institution'
                                ? 'bg-indigo-600/90 text-white border border-indigo-400/40'
                                : 'bg-orange-600/90 text-white border border-orange-400/40'
                        }
                      `}
                    >
                      {place.visitInfo.visitStatus === 'closed_to_public' && ' مغلق أمام الجمهور العام'}
                      {place.visitInfo.visitStatus === 'closed_for_restoration' && ' مغلق للترميم والتحويل لمتحف'}
                      {place.visitInfo.visitStatus === 'public_landmark' && ' ميدان ومعلم عام مفتوح'}
                      {place.visitInfo.visitStatus === 'active_institution' && ' صرح تعليمي وديني نشط'}
                      {place.visitInfo.visitStatus === 'requires_safari_permit' && ' محمية صحراوية وتصريح سفاري'}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1
                  className="
                    font-serif font-black
                    text-white
                    text-[2.8rem]
                    leading-[0.98]
                    tracking-[-0.035em]
                    break-words
                    drop-shadow-2xl

                    sm:text-6xl
                    sm:leading-[0.95]

                    md:text-7xl

                    lg:text-[6.5rem]

                    xl:text-[8rem]
                  "
                >
                  {place.title}
                </h1>

                {/* Description */}
                <p
                  className="
                    mt-5 sm:mt-7
                    text-xs sm:text-sm lg:text-lg
                    text-white/72
                    leading-7 sm:leading-8
                    max-w-2xl
                  "
                >
                  {place.shortDescription || place.description}
                </p>

                {/* Location */}
                <div className="mt-6 sm:mt-7 flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-3">
                  <button
                    type="button"
                    onClick={() =>
                      navigateToGovernorate(
                        place.governorateId || 'qena'
                      )
                    }
                    className="
                      group
                      flex items-center gap-2
                      max-w-full
                      text-white
                      hover:text-[#E2A083]
                      transition-colors
                      text-right
                      cursor-pointer
                    "
                  >
                    <MapPin className="w-4 h-4 shrink-0 text-[#E2A083]" />

                    <span className="text-xs sm:text-sm font-bold break-words">
                      {place.locationDescription ||
                        `محافظة ${place.governorateName}`}
                    </span>
                  </button>

                  <span className="hidden xs:block w-1 h-1 rounded-full bg-white/30" />

                  <div className="flex items-center gap-2 text-white/55">
                    <Compass className="w-4 h-4 shrink-0" />

                    <span className="text-xs sm:text-sm font-semibold">
                      من أرشيف صعيد مصر
                    </span>
                  </div>
                </div>
              </div>

              {/* Vertical marker */}
              <div className="hidden lg:flex lg:col-span-3 justify-end">
                <div className="flex flex-col items-center gap-4 text-white/35">
                  <div className="h-28 w-px bg-gradient-to-b from-transparent via-white/35 to-transparent" />
                  <span className="text-[8px] tracking-[0.28em] [writing-mode:vertical-rl]">
                    DISCOVER · REMEMBER · PRESERVE
                  </span>
                  <div className="h-12 w-px bg-white/15" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          IDENTITY STRIP
      ========================================================= */}
      <section className="border-b border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.02]">
        <div className="max-w-[1500px] mx-auto px-5 sm:px-7 lg:px-12">
          <div className={`grid grid-cols-2 ${place.visitDuration ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
            <div className="py-6 sm:py-8 px-3 sm:px-6 border-l border-black/10 dark:border-white/10">
              <div className="flex items-start gap-3">
                <Landmark className="w-4 h-4 text-[#9a6a35] mt-0.5 shrink-0" />
                <div>
                  <span className="block text-[9px] tracking-widest font-black text-black/40 dark:text-white/40 mb-1">
                    CATEGORY
                  </span>
                  <span className="text-xs sm:text-sm font-black break-words">
                    {place.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="py-6 sm:py-8 px-3 sm:px-6 border-l border-black/10 dark:border-white/10">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#9a6a35] mt-0.5 shrink-0" />
                <div>
                  <span className="block text-[9px] tracking-widest font-black text-black/40 dark:text-white/40 mb-1">
                    GOVERNORATE
                  </span>
                  <span className="text-xs sm:text-sm font-black break-words">
                    {place.governorateName}
                  </span>
                </div>
              </div>
            </div>

            <div className="py-6 sm:py-8 px-3 sm:px-6 border-l border-black/10 dark:border-white/10">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#9a6a35] mt-0.5 shrink-0" />
                <div>
                  <span className="block text-[9px] tracking-widest font-black text-black/40 dark:text-white/40 mb-1">
                    HISTORICAL ERA
                  </span>
                  <span className="text-xs sm:text-sm font-black break-words">
                    {place.historicalEra || 'تراث مصري'}
                  </span>
                </div>
              </div>
            </div>

            {place.visitDuration && (
              <div className="py-6 sm:py-8 px-3 sm:px-6 border-l border-black/10 dark:border-white/10">
                <div className="flex items-start gap-3">
                  <Hourglass className="w-4 h-4 text-[#9a6a35] mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-[9px] tracking-widest font-black text-black/40 dark:text-white/40 mb-1 uppercase">
                      DURATION
                    </span>
                    <span className="text-xs sm:text-sm font-black break-words">
                      {place.visitDuration}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                navigateToGovernorate(
                  place.governorateId || 'qena'
                )
              }
              className="
                group py-6 sm:py-8 px-3 sm:px-6
                flex items-center justify-between gap-2
                text-right
                hover:bg-[#9a6a35] hover:text-white
                transition-colors
                cursor-pointer
              "
            >
              <div>
                <span className="block text-[9px] tracking-widest font-black text-[#9a6a35] group-hover:text-white/70 mb-1 transition-colors">
                  EXPLORE
                </span>
                <span className="text-xs sm:text-sm font-black break-words">
                  استكشف المحافظة
                </span>
              </div>
              <ArrowLeft className="w-4 h-4 shrink-0 text-[#9a6a35] group-hover:text-white group-hover:-translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <main className="max-w-[1500px] mx-auto px-5 sm:px-7 lg:px-12">
        {/* STORY */}
        <section className="py-14 sm:py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-20">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-8">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[10px] font-black tracking-[0.28em] text-[#9a6a35]">
                    01 / THE STORY
                  </span>
                  <span className="w-10 h-px bg-[#9a6a35]/40" />
                </div>

                <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                  حكاية <br />
                  <span className="text-[#9a6a35]">المكان</span>
                </h2>

                <p className="mt-5 text-sm leading-7 text-black/6oid dark:text-white/60 max-w-sm">
                  كل معلم في الصعيد مش مجرد مبنى، لكنه جزء من ذاكرة المكان وحكاية الناس اللي عاشوا حواليه.
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 min-w-0">
              <div className="relative">
                <div className="absolute right-0 top-0 bottom-0 w-px bg-black/10 dark:bg-white/10" />

                <div className="pr-6 sm:pr-9 lg:pr-14">
                  <div className="text-lg sm:text-xl lg:text-3xl font-serif font-bold leading-[2] whitespace-pre-line break-words">
                    {history}
                  </div>

                  {place.significance && place.significance.trim() !== '' && place.significance !== place.description && (
                    <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-[#9a6a35]/10 border border-[#9a6a35]/20">
                      <div className="flex items-center gap-2 mb-3 text-[#9a6a35] font-black text-xs sm:text-sm">
                        <Sparkles className="w-4 h-4" />
                        <span>القيمة والأهمية التاريخية</span>
                      </div>
                      <p className="text-base sm:text-xl font-serif font-bold text-black/85 dark:text-white/85 leading-relaxed break-words">
                        {place.significance}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ARCHITECTURE */}
        {place.architecturalHighlights &&
          place.architecturalHighlights.length > 0 && (
            <section className="py-14 sm:py-20 lg:py-24 border-t border-black/10 dark:border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black tracking-[0.28em] text-[#9a6a35]">
                      02 / DETAILS
                    </span>
                    <span className="w-10 h-px bg-[#9a6a35]/40" />
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black">
                    تفاصيل تستحق <span className="text-[#9a6a35]">التأمل</span>
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12">
                {place.architecturalHighlights.map((feature, index) => (
                  <div
                    key={index}
                    className="group py-6 sm:py-8 border-t border-black/10 dark:border-white/10 flex items-start gap-4 sm:gap-5"
                  >
                    <span className="font-serif text-2xl sm:text-3xl font-black text-[#9a6a35]/40 group-hover:text-[#9a6a35] transition-colors">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="text-sm sm:text-base font-bold leading-7 break-words flex-1">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* MEDIA GALLERY */}
        <section
          id="place-media-gallery"
          className="py-14 sm:py-20 lg:py-24 border-t border-black/10 dark:border-white/10 scroll-mt-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-black tracking-[0.28em] text-[#9a6a35]">
                  03 / VISUAL ARCHIVE
                </span>
                <span className="w-10 h-px bg-[#9a6a35]/40" />
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black">
                ذاكرة <span className="text-[#9a6a35]">بصرية</span>
              </h2>
            </div>
          </div>

          <div className="relative group p-4 sm:p-6 lg:p-8 rounded-[3rem] bg-gradient-to-b from-black/[0.04] via-black/[0.01] to-transparent dark:from-white/[0.04] dark:via-white/[0.01] dark:to-transparent border border-black/10 dark:border-white/10 backdrop-blur-2xl">

            {/* إضاءة خلفية سينمائية تفاعلية */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#9a6a35]/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-[#9a6a35]/20 transition-all duration-700" />

            {/* شريط علوي بتصميم فني فاخر */}
            <div className="relative z-10 flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#9a6a35]" />
                <span className="text-[11px] font-black tracking-[0.3em] text-[#9a6a35] uppercase">
                  Cinematic Archive
                </span>
              </div>
              <span className="text-xs font-serif italic text-black/40 dark:text-white/40">
                Visual Journey & Documentation
              </span>
            </div>

            {/* حاوية المعرض الرئيسية */}
            <div className="relative z-10 rounded-[2.2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <VisitorMediaGallery
                id="place-media-gallery"
                title={`معرض وتوثيق ${place.title}`}
                entityType="heritage-place"
                entityId={place.id || place.slug}
                entitySlug={place.slug}
                entityTitle={place.title}
                coverImage={place.coverImage}
                gallery={gallery}
                videoUrl={(place as any).videoUrl}
                videos={(place as any).videos || []}
                onGalleryChange={(updatedGallery) => {
                  setPlace((prev) =>
                    prev
                      ? {
                        ...prev,
                        gallery: updatedGallery,
                        galleryImages: updatedGallery,
                      }
                      : null
                  );
                }}
                onCoverChange={(newCover) => {
                  setPlace((prev) =>
                    prev
                      ? {
                        ...prev,
                        coverImage: newCover,
                      }
                      : null
                  );
                }}
                onVideoChange={(newVideo, updatedVideos) => {
                  setPlace((prev) =>
                    prev
                      ? ({
                        ...prev,
                        videoUrl: newVideo || undefined,
                        videos: updatedVideos,
                      } as any)
                      : null
                  );
                }}
              />
            </div>
          </div>        </section>

        {/* VISITOR GUIDE & SCHEDULE */}
        <section className="py-14 sm:py-20 lg:py-24 border-t border-black/10 dark:border-white/10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-black tracking-[0.28em] text-[#9a6a35]">
                    04 / VISITOR GUIDE
                  </span>
                  <span className="w-10 h-px bg-[#9a6a35]/40" />
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black">
                  دليل ومواعيد <span className="text-[#9a6a35]">الزيارة</span>
                </h2>
                <p className="mt-5 text-sm leading-7 text-black/60 dark:text-white/60 max-w-md">
                  كل ما تحتاجه لتخطيط زيارتك من مواعيد وساعات الفتح ورسوم الدخول وأفضل الأوقات.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 min-w-0">
              {/* Specialized Accessibility / Visit Status Banner */}
              {place.visitInfo?.visitStatus && place.visitInfo.visitStatus !== 'open' && (
                <div
                  className={`mb-6 p-6 rounded-2xl border flex items-start gap-4 ${place.visitInfo.visitStatus === 'closed_to_public'
                    ? 'bg-red-500/10 border-red-500/30 text-red-950 dark:text-red-100'
                    : place.visitInfo.visitStatus === 'closed_for_restoration'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
                      : place.visitInfo.visitStatus === 'public_landmark'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                        : place.visitInfo.visitStatus === 'active_institution'
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-950 dark:text-indigo-100'
                          : 'bg-[#9a6a35]/10 border-[#9a6a35]/30 text-amber-950 dark:text-amber-100'
                    }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${place.visitInfo.visitStatus === 'closed_to_public'
                      ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                      : place.visitInfo.visitStatus === 'closed_for_restoration'
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        : place.visitInfo.visitStatus === 'public_landmark'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : place.visitInfo.visitStatus === 'active_institution'
                            ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                            : 'bg-[#9a6a35]/20 text-[#9a6a35]'
                      }`}
                  >
                    {place.visitInfo.visitStatus === 'closed_to_public' && (
                      <AlertOctagon className="w-6 h-6" />
                    )}
                    {place.visitInfo.visitStatus === 'closed_for_restoration' && (
                      <Hammer className="w-6 h-6" />
                    )}
                    {place.visitInfo.visitStatus === 'public_landmark' && (
                      <Landmark className="w-6 h-6" />
                    )}
                    {place.visitInfo.visitStatus === 'active_institution' && (
                      <GraduationCap className="w-6 h-6" />
                    )}
                    {place.visitInfo.visitStatus === 'requires_safari_permit' && (
                      <Compass className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[11px] font-black tracking-widest uppercase opacity-75">
                        حالة الزيارة وطبيعة الموقع
                      </span>
                      {place.visitInfo.visitStatusLabel && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-black/10 dark:bg-white/10">
                          {place.visitInfo.visitStatusLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-sm sm:text-base font-bold leading-relaxed mb-2 break-words">
                      {place.visitInfo.visitStatusNote || (
                        place.visitInfo.visitStatus === 'closed_to_public'
                          ? 'الموقع مغلق حالياً أمام زيارات الجمهور العام بقرار رسمي.'
                          : place.visitInfo.visitStatus === 'closed_for_restoration'
                            ? 'الموقع مغلق حالياً من الداخل للترميم والتأهيل كمتحف.'
                            : place.visitInfo.visitStatus === 'public_landmark'
                              ? 'المعلم عبارة عن ميدان عام في الفضاء المفتوح بدون تذاكر أو بوابات مغلقة.'
                              : 'الموقع صرح نشط يتطلب إذناً وتنسيقاً مسبقاً.'
                      )}
                    </p>
                    <p className="text-xs opacity-75 leading-normal">
                      تلتزم منصة «وه» بالأمانة التوثيقية الدقيقة؛ نوثق الحقائق الواقعية استناداً إلى القرارات الرسمية دون اختلاق مواعيد أو تذاكر وهمية للأماكن غير المتاحة للزيارة السياحية.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opening Hours */}
                {place.visitInfo?.openingHours && (
                  <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-3 mb-2 text-[#9a6a35]">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] font-black tracking-wider uppercase">مواعيد وساعات الفتح</span>
                    </div>
                    <p className="text-sm font-bold text-black/85 dark:text-white/85 break-words">
                      {place.visitInfo.openingHours}
                    </p>
                  </div>
                )}

                {/* Visit Duration */}
                {place.visitDuration && (
                  <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-3 mb-2 text-[#9a6a35]">
                      <Hourglass className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] font-black tracking-wider uppercase">المدة المقترحة للتجربة</span>
                    </div>
                    <p className="text-sm font-bold text-black/85 dark:text-white/85 break-words">
                      {place.visitDuration}
                    </p>
                  </div>
                )}

                {/* Best Time to Visit */}
                {place.visitInfo?.bestTimeToVisit && (
                  <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-3 mb-2 text-[#9a6a35]">
                      <Compass className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] font-black tracking-wider uppercase">أفضل وقت وموسم للزيارة</span>
                    </div>
                    <p className="text-sm font-bold text-black/85 dark:text-white/85 break-words">
                      {place.visitInfo.bestTimeToVisit}
                    </p>
                  </div>
                )}

                {/* Entry Fee */}
                {place.visitInfo?.entryFee && (
                  <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-3 mb-2 text-[#9a6a35]">
                      <Ticket className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] font-black tracking-wider uppercase">رسوم وتذاكر الدخول</span>
                    </div>
                    <p className="text-sm font-bold text-black/85 dark:text-white/85 break-words">
                      {place.visitInfo.entryFee}
                    </p>
                  </div>
                )}

                {/* Reservation Status */}
                {place.visitInfo && place.visitInfo.reservationRequired !== undefined && (
                  <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-3 mb-2 text-[#9a6a35]">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] font-black tracking-wider uppercase">حالة الحجز المسبق</span>
                    </div>
                    <p className="text-sm font-bold text-black/85 dark:text-white/85 break-words">
                      {place.visitInfo.reservationRequired
                        ? 'يلزم الحجز المسبق أو التنسيق المسبق قبل الزيارة'
                        : 'متاح للزيارة المباشرة وقطع التذاكر من الموقع'}
                    </p>
                  </div>
                )}

                {/* General Location description */}
                {place.locationDescription && (
                  <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 sm:col-span-2">
                    <div className="flex items-center gap-3 mb-2 text-[#9a6a35]">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] font-black tracking-wider uppercase">الموقع والوصف الجغرافي</span>
                    </div>
                    <p className="text-sm font-bold text-black/85 dark:text-white/85 break-words">
                      {place.locationDescription}
                    </p>
                  </div>
                )}
              </div>

              {/* Visitor Tip */}
              {place.visitorTips && (
                <div className="mt-4 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black tracking-widest text-amber-600 dark:text-amber-400 mb-1">
                      نصيحة ذهبية للزائر
                    </span>
                    <p className="text-sm leading-relaxed text-black/80 dark:text-white/80 break-words">
                      {place.visitorTips}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ACCESS & TRANSPORTATION */}
        {(place.access?.description || place.access?.transportation || place.address?.city || place.coordinates) && (
          <section className="py-14 sm:py-20 lg:py-24 border-t border-black/10 dark:border-white/10">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black tracking-[0.28em] text-[#9a6a35]">
                      05 / ACCESS & DIRECTIONS
                    </span>
                    <span className="w-10 h-px bg-[#9a6a35]/40" />
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black">
                    العنوان <span className="text-[#9a6a35]">وكيفية الوصول</span>
                  </h2>
                  <p className="mt-5 text-sm leading-7 text-black/60 dark:text-white/60 max-w-md">
                    تفاصيل مسارات الطرق والمواصلات العامة والخاصة للوصول إلى المعلم بسهولة.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7 min-w-0 space-y-4">
                {/* Structured Address */}
                {(place.address?.village || place.address?.city || place.address?.governorate) && (
                  <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-3 mb-3 text-[#9a6a35]">
                      <Building2 className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] font-black tracking-wider uppercase">العنوان التفصيلي</span>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center text-sm font-bold">
                      {place.address.village && (
                        <span className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                          قرية / منطقة: {place.address.village}
                        </span>
                      )}
                      {place.address.city && (
                        <span className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                          مركز / مدينة: {place.address.city}
                        </span>
                      )}
                      {place.address.governorate && (
                        <span className="px-3 py-1.5 rounded-lg bg-[#9a6a35]/15 text-[#9a6a35] border border-[#9a6a35]/20">
                          محافظة: {place.address.governorate}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Route description */}
                {place.access?.description && (
                  <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-3 mb-2 text-[#9a6a35]">
                      <Navigation className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] font-black tracking-wider uppercase">وصف المسار والطريق</span>
                    </div>
                    <p className="text-sm sm:text-base leading-relaxed text-black/85 dark:text-white/85 break-words">
                      {place.access.description}
                    </p>
                  </div>
                )}

                {/* Transportation options */}
                {place.access?.transportation && (
                  <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-3 mb-2 text-[#9a6a35]">
                      <Bus className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] font-black tracking-wider uppercase">وسائل المواصلات المتاحة</span>
                    </div>
                    <p className="text-sm sm:text-base leading-relaxed text-black/85 dark:text-white/85 break-words">
                      {place.access.transportation}
                    </p>
                  </div>
                )}

                {/* Google Maps link if coordinates */}
                {place.coordinates?.lat && place.coordinates?.lng && (
                  <div className="p-6 rounded-2xl bg-[#9a6a35]/10 border border-[#9a6a35]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-[#9a6a35] font-black text-xs mb-1">
                        <MapPin className="w-4 h-4" />
                        <span>الإحداثيات الجغرافية الموثقة</span>
                      </div>
                      <span className="text-xs font-mono text-black/60 dark:text-white/60">
                        {place.coordinates.lat.toFixed(5)}, {place.coordinates.lng.toFixed(5)}
                      </span>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#9a6a35] text-white hover:bg-[#85592a] text-xs font-black transition-colors shrink-0"
                    >
                      <span>الملاحة على خرائط جوجل</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* VISITOR SERVICES & FACILITIES */}
        {place.visitorServices && place.visitorServices.length > 0 && (
          <section className="py-14 sm:py-20 lg:py-24 border-t border-black/10 dark:border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-black tracking-[0.28em] text-[#9a6a35]">
                    06 / VISITOR SERVICES
                  </span>
                  <span className="w-10 h-px bg-[#9a6a35]/40" />
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black">
                  خدمات ومرافق <span className="text-[#9a6a35]">الزوار</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {place.visitorServices.map((service, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-[#9a6a35]/15 flex items-center justify-center text-[#9a6a35]">
                        <Users className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-base text-black/90 dark:text-white/90">
                        {service.name}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* HERITAGE EVENTS & OCCASIONS */}
        {place.events && place.events.length > 0 && (
          <section className="py-14 sm:py-20 lg:py-24 border-t border-black/10 dark:border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-black tracking-[0.28em] text-[#9a6a35]">
                    07 / HERITAGE EVENTS
                  </span>
                  <span className="w-10 h-px bg-[#9a6a35]/40" />
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black">
                  فعاليات ومناسبات <span className="text-[#9a6a35]">المعلم</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {place.events.map((event, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-8 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <PartyPopper className="w-5 h-5 text-[#9a6a35]" />
                        <h3 className="font-bold text-lg text-black/90 dark:text-white/90">
                          {event.name}
                        </h3>
                      </div>
                      {event.frequency && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#9a6a35]/15 text-[#9a6a35]">
                          {event.frequency}
                        </span>
                      )}
                    </div>

                    <p className="text-sm sm:text-base leading-relaxed text-black/75 dark:text-white/75 mb-4">
                      {event.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-black/10 dark:border-white/10 flex flex-wrap gap-4 text-xs font-bold text-black/60 dark:text-white/60">
                    {event.date && (
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-[#9a6a35]" />
                        <span>{event.date}</span>
                      </div>
                    )}
                    {event.duration && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#9a6a35]" />
                        <span>{event.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RELATED CRAFTS */}
        {place.relatedCrafts && place.relatedCrafts.length > 0 && (
          <section className="py-14 sm:py-20 lg:py-24 border-t border-black/10 dark:border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black tracking-[0.28em] text-[#9a6a35]">
                08 / LIVING HERITAGE
              </span>
              <span className="w-10 h-px bg-[#9a6a35]/40" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black mb-6">
              حرف تراثية <span className="text-[#9a6a35]">مرتبطة بالمكان</span>
            </h2>
            <div className="flex flex-wrap gap-3">
              {place.relatedCrafts.map((craft, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 flex items-center gap-2.5 text-sm font-bold"
                >
                  <Hammer className="w-4 h-4 text-[#9a6a35]" />
                  <span>{craft}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* DOCUMENTATION & SOURCE VERIFICATION */}
        {(place.sourceName || place.verificationStatus) && (
          <section className="py-10 border-t border-black/10 dark:border-white/10">
            <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                      {place.verificationStatus === 'verified'
                        ? 'توثيق أثري وأكاديمي معتمد'
                        : 'بيانات موثقة في أرشيف واه التراثي'}
                    </span>
                    {place.sourceType && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60">
                        {place.sourceType}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-black/60 dark:text-white/60">
                    المصدر المعتمد: {place.sourceName || 'سجلات وزارة السياحة والآثار المصرية والتوثيق الميداني'}
                    {place.researchDate ? ` · تاريخ التوثيق: ${place.researchDate}` : ''}
                  </p>
                </div>
              </div>

              {place.sourceUrl && (
                <a
                  href={place.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9a6a35] hover:underline shrink-0"
                >
                  <span>زيارة المصدر المرجعي</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </section>
        )}
      </main>

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
                  KEEP EXPLORING
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
                  الحكاية لسه
                  <br />
                  <span className="text-[#d5a56d]">مخلصتش.</span>
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-sm leading-8 text-white/55">
                  اكتشف معالم أكتر، وحكايات أقدم، وحرف لسه عايشة في صعيد مصر.
                </p>
                <button
                  onClick={() => setActivePage('places')}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#211d18] text-white dark:bg-white dark:text-[#211d18] px-6 py-3.5 text-xs font-bold transition-all duration-300 hover:bg-[#9a6a35] dark:hover:bg-[#9a6a35] dark:hover:text-white cursor-pointer w-fit shadow-md"
                >
                  <span>استكشف باقي المعالم</span>
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

export default PlaceDetailPage;
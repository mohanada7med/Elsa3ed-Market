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

  const [place, setPlace] = useState<HeritagePlace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const slug = selectedPlaceSlug || 'dendera-temple';

  useEffect(() => {
    let isMounted = true;

    const fetchPlace = async () => {
      setIsLoading(true);

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
    const url = `${window.location.origin}/places?slug=${encodeURIComponent(
      slug
    )}`;

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
      // User cancelled native share or browser blocked it.
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
          bg-[#F4EFE8] dark:bg-[#0D0B0A]
          text-[#241E1A] dark:text-[#F8F3EE]
          flex items-center justify-center
          px-5
        "
      >
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border border-[#B24C2B]/20 dark:border-[#D77A59]/20" />

            <div className="absolute inset-1 rounded-full border-2 border-[#B24C2B] dark:border-[#D77A59] border-t-transparent animate-spin" />

            <Landmark className="absolute inset-0 m-auto w-5 h-5 text-[#B24C2B] dark:text-[#D77A59]" />
          </div>

          <p className="text-sm font-bold text-[#73675B] dark:text-[#B8AAA0]">
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
          bg-[#F4EFE8] dark:bg-[#0D0B0A]
          flex items-center justify-center
          px-5
        "
      >
        <div className="w-full max-w-md text-center">
          <div
            className="
              w-20 h-20 mx-auto mb-6
              rounded-full
              border border-[#B24C2B]/20
              dark:border-[#D77A59]/20
              flex items-center justify-center
            "
          >
            <Landmark className="w-8 h-8 text-[#B24C2B] dark:text-[#D77A59]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#241E1A] dark:text-white mb-3">
            المعلم غير موجود
          </h2>

          <p className="text-sm leading-7 text-[#73675B] dark:text-[#AFA29A] mb-6">
            لم نتمكن من العثور على توثيق هذا المعلم.
          </p>

          <button
            type="button"
            onClick={() => setActivePage('places')}
            className="
              inline-flex items-center justify-center gap-2
              px-6 py-3
              rounded-full
              bg-[#B24C2B] hover:bg-[#963E21]
              dark:bg-[#C96543] dark:hover:bg-[#D97755]
              text-white
              font-bold text-sm
              transition-all
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#B24C2B]/50
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
        bg-[#F4EFE8] dark:bg-[#0D0B0A]
        text-[#241E1A] dark:text-[#F8F3EE]
        overflow-x-hidden
        selection:bg-[#B24C2B]/20
        dark:selection:bg-[#D77A59]/20
      "
    >
      {/* =========================================================
          HERO
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
            from-[#110E0C]/95
            via-[#110E0C]/50
            to-[#110E0C]/15
          "
        />

        <div
          className="
            absolute inset-0
            bg-gradient-to-t
            from-[#110E0C]
            via-[#110E0C]/45
            to-transparent
          "
        />

        {/* Mobile readability overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-transparent sm:hidden" />

        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.045] dark:opacity-[0.055] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)',
            backgroundSize: '70px 70px',
          }}
        />

        {/* =====================================================
            TOP NAV
        ===================================================== */}

        <div className="absolute top-0 left-0 right-0 z-30">
          <div
            className="
              max-w-[1500px] mx-auto
              px-4 sm:px-7 lg:px-12
              pt-4 sm:pt-6 lg:pt-7
            "
          >
            <div className="flex items-center justify-between gap-3">
              {/* WAH */}
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div
                  className="
                    w-9 h-9 sm:w-10 sm:h-10
                    shrink-0
                    rounded-full
                    border border-white/20
                    bg-black/10
                    backdrop-blur-xl
                    flex items-center justify-center
                  "
                >
                  <Landmark className="w-4 h-4 text-white" />
                </div>

                <div className="hidden sm:block min-w-0">
                  <div className="text-[9px] tracking-[0.28em] font-bold text-white/45">
                    WAH ARCHIVE
                  </div>

                  <div className="text-xs font-black text-white">
                    أرشيف وه
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={scrollToGallery}
                    className="
                      h-9 sm:h-10
                      px-3 sm:px-4
                      rounded-full
                      bg-amber-600/90
                      hover:bg-amber-500
                      text-white
                      backdrop-blur-xl
                      border border-white/10
                      text-[10px] sm:text-xs
                      font-bold
                      flex items-center gap-1.5 sm:gap-2
                      transition-all
                      shadow-lg shadow-black/10
                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-amber-300
                    "
                  >
                    <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />

                    <span className="hidden md:inline">
                      إدارة الوسائط
                    </span>
                  </button>
                )}

                {/* Share */}
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="مشاركة المعلم"
                  title="مشاركة"
                  className="
                    w-9 h-9 sm:w-10 sm:h-10
                    shrink-0
                    rounded-full
                    bg-white/10
                    hover:bg-white/20
                    border border-white/15
                    backdrop-blur-xl
                    text-white
                    flex items-center justify-center
                    transition-all
                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-white/50
                  "
                >
                  <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {/* Back */}
                <button
                  type="button"
                  onClick={() => setActivePage('places')}
                  className="
                    h-9 sm:h-10
                    px-3 sm:px-4
                    rounded-full
                    bg-white/10
                    hover:bg-white/20
                    border border-white/15
                    backdrop-blur-xl
                    text-white
                    text-[10px] sm:text-xs
                    font-bold
                    flex items-center gap-1.5 sm:gap-2
                    transition-all
                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-white/50
                  "
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-180" />

                  <span className="hidden xs:inline sm:inline">
                    المعالم
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

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
                      bg-[#B24C2B]
                      dark:bg-[#C96543]
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

        {/* Bottom scroll hint */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 text-white/30">
          <span className="text-[8px] tracking-[0.2em]">
            SCROLL TO EXPLORE
          </span>

          <div className="w-px h-7 bg-white/25" />
        </div>
      </section>

      {/* =========================================================
          IDENTITY STRIP
      ========================================================= */}

      <section
        className="
          border-b
          border-[#DED5CA]
          dark:border-[#302722]
          bg-[#F4EFE8]
          dark:bg-[#15110F]
        "
      >
        <div className="max-w-[1500px] mx-auto px-5 sm:px-7 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {/* Category */}
            <div
              className="
                min-w-0
                py-6 sm:py-8 lg:py-10
                px-3 sm:px-6
                border-l border-[#DED5CA] dark:border-[#302722]
              "
            >
              <div className="flex items-start gap-2.5 sm:gap-3">
                <Landmark className="w-4 h-4 text-[#B24C2B] dark:text-[#D77A59] mt-0.5 shrink-0" />

                <div className="min-w-0">
                  <span className="block text-[8px] sm:text-[10px] tracking-widest font-black text-[#8B7D70] dark:text-[#8F8279] mb-1.5 sm:mb-2">
                    CATEGORY
                  </span>

                  <span className="block text-[11px] sm:text-sm font-black text-[#241E1A] dark:text-[#F8F3EE] break-words">
                    {place.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Governorate */}
            <div
              className="
                min-w-0
                py-6 sm:py-8 lg:py-10
                px-3 sm:px-6
                border-l border-[#DED5CA] dark:border-[#302722]
              "
            >
              <div className="flex items-start gap-2.5 sm:gap-3">
                <MapPin className="w-4 h-4 text-[#B24C2B] dark:text-[#D77A59] mt-0.5 shrink-0" />

                <div className="min-w-0">
                  <span className="block text-[8px] sm:text-[10px] tracking-widest font-black text-[#8B7D70] dark:text-[#8F8279] mb-1.5 sm:mb-2">
                    GOVERNORATE
                  </span>

                  <span className="block text-[11px] sm:text-sm font-black text-[#241E1A] dark:text-[#F8F3EE] break-words">
                    {place.governorateName}
                  </span>
                </div>
              </div>
            </div>

            {/* Era */}
            <div
              className="
                min-w-0
                py-6 sm:py-8 lg:py-10
                px-3 sm:px-6
                border-l border-[#DED5CA] dark:border-[#302722]
              "
            >
              <div className="flex items-start gap-2.5 sm:gap-3">
                <Calendar className="w-4 h-4 text-[#B24C2B] dark:text-[#D77A59] mt-0.5 shrink-0" />

                <div className="min-w-0">
                  <span className="block text-[8px] sm:text-[10px] tracking-widest font-black text-[#8B7D70] dark:text-[#8F8279] mb-1.5 sm:mb-2">
                    HISTORICAL ERA
                  </span>

                  <span className="block text-[11px] sm:text-sm font-black text-[#241E1A] dark:text-[#F8F3EE] break-words">
                    {place.historicalEra || 'تراث مصري'}
                  </span>
                </div>
              </div>
            </div>

            {/* Explore */}
            <button
              type="button"
              onClick={() =>
                navigateToGovernorate(
                  place.governorateId || 'qena'
                )
              }
              className="
                group
                min-w-0
                py-6 sm:py-8 lg:py-10
                px-3 sm:px-6
                flex items-center justify-between gap-2
                text-right
                hover:bg-[#B24C2B]
                dark:hover:bg-[#7F3927]
                transition-colors
              "
            >
              <div className="min-w-0">
                <span className="block text-[8px] sm:text-[10px] tracking-widest font-black text-[#B24C2B] dark:text-[#D77A59] group-hover:text-white/60 mb-1.5 sm:mb-2 transition-colors">
                  EXPLORE
                </span>

                <span className="block text-[11px] sm:text-sm font-black text-[#241E1A] dark:text-[#F8F3EE] group-hover:text-white transition-colors break-words">
                  استكشف المحافظة
                </span>
              </div>

              <ArrowLeft className="w-4 h-4 shrink-0 text-[#B24C2B] dark:text-[#D77A59] group-hover:text-white group-hover:-translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN
      ========================================================= */}

      <main className="max-w-[1500px] mx-auto px-5 sm:px-7 lg:px-12">
        {/* =======================================================
            STORY
        ======================================================= */}

        <section className="py-14 sm:py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-20">
            {/* Title */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-8">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[9px] sm:text-[10px] font-black tracking-[0.28em] text-[#B24C2B] dark:text-[#D77A59]">
                    01 / THE STORY
                  </span>

                  <span className="w-8 sm:w-10 h-px bg-[#B24C2B]/40 dark:bg-[#D77A59]/40" />
                </div>

                <h2
                  className="
                    font-serif
                    text-4xl
                    sm:text-5xl
                    lg:text-6xl
                    font-black
                    leading-[1.02]
                    text-[#241E1A]
                    dark:text-[#F8F3EE]
                  "
                >
                  حكاية
                  <br />
                  <span className="text-[#B24C2B] dark:text-[#D77A59]">
                    المكان
                  </span>
                </h2>

                <p className="mt-5 text-sm leading-7 text-[#73675B] dark:text-[#AFA29A] max-w-sm">
                  كل معلم في الصعيد مش مجرد مبنى، لكنه جزء من
                  ذاكرة المكان وحكاية الناس اللي عاشوا حواليه.
                </p>

                <div className="mt-8 hidden lg:flex items-center gap-3 text-[#B24C2B] dark:text-[#D77A59]">
                  <BookOpen className="w-4 h-4" />

                  <span className="text-[9px] font-black tracking-widest">
                    WAH DOCUMENTATION
                  </span>
                </div>
              </div>
            </div>

            {/* Story */}
            <div className="lg:col-span-8 min-w-0">
              <div className="relative">
                <div className="absolute right-0 top-0 bottom-0 w-px bg-[#D9CEC2] dark:bg-[#342B26]" />

                <div className="pr-6 sm:pr-9 lg:pr-14">
                  <div
                    className="
                      text-lg
                      sm:text-xl
                      lg:text-3xl
                      font-serif
                      font-bold
                      leading-[2]
                      text-[#3A3029]
                      dark:text-[#E5DBD4]
                      whitespace-pre-line
                      break-words
                    "
                  >
                    {history}
                  </div>
                </div>
              </div>

              <div
                className="
                  mt-9 sm:mt-10
                  pt-6 sm:pt-7
                  border-t border-[#DED5CA] dark:border-[#302722]
                  flex flex-col
                  xs:flex-row
                  items-start xs:items-center
                  justify-between
                  gap-3
                "
              >
                <div className="flex items-center gap-2 text-[#8B7D70] dark:text-[#968980]">
                  <Sparkles className="w-4 h-4 text-[#B24C2B] dark:text-[#D77A59]" />

                  <span className="text-[10px] sm:text-xs font-bold">
                    موثق ضمن أرشيف وه
                  </span>
                </div>

                <div className="text-[9px] sm:text-[10px] font-mono text-[#9A8E83] dark:text-[#756A62] max-w-full truncate">
                  WAH / {place.slug}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            ARCHITECTURE
        ======================================================= */}

        {place.architecturalHighlights &&
          place.architecturalHighlights.length > 0 && (
            <section
              className="
                py-14 sm:py-20 lg:py-24
                border-t border-[#DED5CA]
                dark:border-[#302722]
              "
            >
              <div
                className="
                  flex flex-col
                  sm:flex-row
                  sm:items-end
                  justify-between
                  gap-6
                  mb-9 sm:mb-12 lg:mb-14
                "
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[9px] sm:text-[10px] font-black tracking-[0.28em] text-[#B24C2B] dark:text-[#D77A59]">
                      02 / DETAILS
                    </span>

                    <span className="w-8 sm:w-10 h-px bg-[#B24C2B]/40 dark:bg-[#D77A59]/40" />
                  </div>

                  <h2
                    className="
                      font-serif
                      text-3xl
                      sm:text-4xl
                      lg:text-5xl
                      font-black
                      leading-tight
                    "
                  >
                    تفاصيل تستحق
                    <span className="text-[#B24C2B] dark:text-[#D77A59]">
                      {' '}
                      التأمل
                    </span>
                  </h2>
                </div>

                <p className="max-w-sm text-xs sm:text-sm leading-7 text-[#73675B] dark:text-[#AFA29A]">
                  عناصر معمارية ونقوش وتفاصيل صنعت هوية المكان
                  وخلت له شخصية خاصة.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12">
                {place.architecturalHighlights.map(
                  (feature, index) => (
                    <div
                      key={index}
                      className="
                        group
                        py-6 sm:py-8
                        border-t
                        border-[#DED5CA]
                        dark:border-[#302722]
                        flex items-start gap-4 sm:gap-5
                      "
                    >
                      <div className="shrink-0">
                        <span
                          className="
                            font-serif
                            text-2xl sm:text-3xl
                            font-black
                            text-[#B24C2B]/30
                            dark:text-[#D77A59]/30
                            group-hover:text-[#B24C2B]
                            dark:group-hover:text-[#D77A59]
                            transition-colors
                          "
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="pt-1 min-w-0">
                        <p
                          className="
                            text-sm sm:text-base
                            font-bold
                            leading-7
                            text-[#40362F]
                            dark:text-[#D9CEC5]
                            break-words
                          "
                        >
                          {feature}
                        </p>
                      </div>

                      <ArrowLeft
                        className="
                          w-4 h-4
                          mr-auto
                          mt-2
                          shrink-0
                          text-[#B24C2B]
                          dark:text-[#D77A59]
                          opacity-0
                          group-hover:opacity-100
                          group-hover:-translate-x-1
                          transition-all
                        "
                      />
                    </div>
                  )
                )}
              </div>
            </section>
          )}

        {/* =======================================================
            MEDIA
        ======================================================= */}

        <section
          id="place-media-gallery"
          className="
            py-14 sm:py-20 lg:py-24
            border-t
            border-[#DED5CA]
            dark:border-[#302722]
            scroll-mt-6
          "
        >
          <div
            className="
              flex flex-col
              sm:flex-row
              sm:items-end
              justify-between
              gap-5
              mb-8 sm:mb-10
            "
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[9px] sm:text-[10px] font-black tracking-[0.28em] text-[#B24C2B] dark:text-[#D77A59]">
                  03 / VISUAL ARCHIVE
                </span>

                <span className="w-8 sm:w-10 h-px bg-[#B24C2B]/40 dark:bg-[#D77A59]/40" />
              </div>

              <h2
                className="
                  font-serif
                  text-3xl
                  sm:text-4xl
                  lg:text-5xl
                  font-black
                "
              >
                ذاكرة
                <span className="text-[#B24C2B] dark:text-[#D77A59]">
                  {' '}
                  بصرية
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2 text-[#8B7D70] dark:text-[#91847B]">
              <Navigation className="w-4 h-4" />

              <span className="text-[10px] font-bold">
                صور وفيديوهات المعلم
              </span>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden">
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
        </section>

        {/* =======================================================
            VISITOR GUIDE
        ======================================================= */}

        <section
          className="
            py-14 sm:py-20 lg:py-24
            border-t
            border-[#DED5CA]
            dark:border-[#302722]
          "
        >
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Intro */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[9px] sm:text-[10px] font-black tracking-[0.28em] text-[#B24C2B] dark:text-[#D77A59]">
                    04 / VISITOR GUIDE
                  </span>

                  <span className="w-8 sm:w-10 h-px bg-[#B24C2B]/40 dark:bg-[#D77A59]/40" />
                </div>

                <h2
                  className="
                    font-serif
                    text-3xl
                    sm:text-4xl
                    lg:text-5xl
                    font-black
                    leading-tight
                  "
                >
                  قبل ما
                  <br />
                  <span className="text-[#B24C2B] dark:text-[#D77A59]">
                    تروح
                  </span>
                </h2>

                <p className="mt-5 text-sm leading-7 text-[#73675B] dark:text-[#AFA29A] max-w-md">
                  معلومات بسيطة تساعدك تستكشف المكان بشكل أفضل
                  وتعيش التجربة بعيدًا عن الزيارة التقليدية.
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-7 min-w-0">
              <div className="border-t border-[#DED5CA] dark:border-[#302722]">
                {/* Location */}
                <div className="py-6 border-b border-[#DED5CA] dark:border-[#302722] flex items-start gap-4 sm:gap-5">
                  <div
                    className="
                      w-10 h-10
                      rounded-full
                      bg-[#B24C2B]/10
                      dark:bg-[#D77A59]/15
                      flex items-center justify-center
                      shrink-0
                    "
                  >
                    <MapPin className="w-4 h-4 text-[#B24C2B] dark:text-[#D77A59]" />
                  </div>

                  <div className="min-w-0">
                    <span className="block text-[9px] sm:text-[10px] font-black tracking-widest text-[#8B7D70] dark:text-[#91847B] mb-2">
                      LOCATION
                    </span>

                    <p className="text-sm sm:text-base font-bold leading-7 break-words">
                      {place.locationDescription ||
                        `محافظة ${place.governorateName}`}
                    </p>
                  </div>
                </div>

                {/* Tips */}
                {place.visitorTips && (
                  <div className="py-6 border-b border-[#DED5CA] dark:border-[#302722] flex items-start gap-4 sm:gap-5">
                    <div
                      className="
                        w-10 h-10
                        rounded-full
                        bg-amber-500/10
                        dark:bg-amber-400/10
                        flex items-center justify-center
                        shrink-0
                      "
                    >
                      <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>

                    <div className="min-w-0">
                      <span className="block text-[9px] sm:text-[10px] font-black tracking-widest text-amber-600 dark:text-amber-400 mb-2">
                        VISITOR TIP
                      </span>

                      <p className="text-sm sm:text-base leading-7 text-[#5B5048] dark:text-[#C4B8AF] break-words">
                        {place.visitorTips}
                      </p>
                    </div>
                  </div>
                )}

                {/* Governorate */}
                <button
                  type="button"
                  onClick={() =>
                    navigateToGovernorate(
                      place.governorateId || 'qena'
                    )
                  }
                  className="
                    group
                    w-full
                    py-6
                    flex items-center
                    gap-4 sm:gap-5
                    text-right
                  "
                >
                  <div
                    className="
                      w-10 h-10
                      rounded-full
                      bg-[#264653]/10
                      dark:bg-[#6FA1AE]/10
                      flex items-center justify-center
                      shrink-0
                    "
                  >
                    <Compass className="w-4 h-4 text-[#264653] dark:text-[#6FA1AE]" />
                  </div>

                  <div className="min-w-0">
                    <span className="block text-[9px] sm:text-[10px] font-black tracking-widest text-[#8B7D70] dark:text-[#91847B] mb-2">
                      GOVERNORATE
                    </span>

                    <p className="text-sm sm:text-base font-black group-hover:text-[#B24C2B] dark:group-hover:text-[#D77A59] transition-colors break-words">
                      اكتشف باقي {place.governorateName}
                    </p>
                  </div>

                  <ArrowLeft className="w-4 h-4 mr-auto shrink-0 text-[#B24C2B] dark:text-[#D77A59] group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}

      <section className="mt-4 sm:mt-8">
        <div
          className="
            relative
            overflow-hidden
            bg-[#1C1714]
            dark:bg-[#15110F]
            border-t
            border-[#2C231E]
          "
        >
          {/* Decorative rings */}
          <div
            className="
              absolute
              -right-36
              -top-36
              w-[28rem]
              h-[28rem]
              rounded-full
              border
              border-white/[0.045]
              pointer-events-none
            "
          />

          <div
            className="
              absolute
              -right-20
              -top-20
              w-72
              h-72
              rounded-full
              border
              border-white/[0.045]
              pointer-events-none
            "
          />

          <div
            className="
              absolute
              left-0
              bottom-0
              w-96
              h-96
              bg-[#B24C2B]/10
              dark:bg-[#D77A59]/10
              blur-[100px]
              pointer-events-none
            "
          />

          <div className="relative max-w-[1500px] mx-auto px-5 sm:px-7 lg:px-12 py-14 sm:py-20 lg:py-24">
            <div className="grid lg:grid-cols-12 gap-9 lg:gap-10 items-center">
              <div className="lg:col-span-8">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[9px] sm:text-[10px] tracking-[0.28em] font-black text-[#D58A6D]">
                    KEEP EXPLORING
                  </span>

                  <span className="w-8 sm:w-10 h-px bg-[#D58A6D]/40" />
                </div>

                <h2
                  className="
                    font-serif
                    text-3xl
                    sm:text-5xl
                    lg:text-6xl
                    font-black
                    text-white
                    leading-tight
                  "
                >
                  الحكاية لسه
                  <br />
                  <span className="text-[#D58A6D]">
                    مخلصتش.
                  </span>
                </h2>

                <p className="mt-5 text-sm sm:text-base text-white/50 leading-7 max-w-xl">
                  اكتشف معالم أكتر، وحكايات أقدم، وحرف لسه
                  عايشة في صعيد مصر.
                </p>
              </div>

              <div className="lg:col-span-4 lg:flex lg:justify-end">
                <button
                  type="button"
                  onClick={() => setActivePage('places')}
                  className="
                    group
                    inline-flex
                    items-center
                    justify-center
                    gap-3 sm:gap-4
                    w-full
                    lg:w-auto
                    px-5 sm:px-7
                    py-3.5 sm:py-4
                    rounded-full
                    bg-white
                    hover:bg-[#F4EFE8]
                    text-[#1C1714]
                    font-black
                    text-xs sm:text-sm
                    transition-all
                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-white/60
                  "
                >
                  <span>استكشف باقي المعالم</span>

                  <span
                    className="
                      w-8 h-8
                      rounded-full
                      bg-[#B24C2B]
                      dark:bg-[#C96543]
                      text-white
                      flex items-center justify-center
                      shrink-0
                    "
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  </span>
                </button>
              </div>
            </div>

            {/* Signature */}
            <div
              className="
                mt-12 sm:mt-14
                pt-6
                border-t border-white/10
                flex
                flex-col
                xs:flex-row
                items-start xs:items-center
                justify-between
                gap-3
              "
            >
              <span className="text-[9px] tracking-[0.3em] font-black text-white/25">
                WAH · وه
              </span>

              <span className="text-[9px] text-white/25">
                توثيق · اكتشاف · حفظ
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
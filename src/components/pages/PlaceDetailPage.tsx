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
          <div className="grid grid-cols-2 lg:grid-cols-4">
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

        {/* VISITOR GUIDE */}
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
                  قبل ما <span className="text-[#9a6a35]">تروح</span>
                </h2>
                <p className="mt-5 text-sm leading-7 text-black/60 dark:text-white/60 max-w-md">
                  معلومات بسيطة تساعدك تستكشف المكان بشكل أفضل وتعيش التجربة بعيدًا عن الزيارة التقليدية.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 min-w-0">
              <div className="border-t border-black/10 dark:border-white/10">
                <div className="py-6 border-b border-black/10 dark:border-white/10 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#9a6a35]/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#9a6a35]" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black tracking-widest text-black/40 dark:text-white/40 mb-2">
                      LOCATION
                    </span>
                    <p className="text-sm sm:text-base font-bold leading-7 break-words">
                      {place.locationDescription || `محافظة ${place.governorateName}`}
                    </p>
                  </div>
                </div>

                {place.visitorTips && (
                  <div className="py-6 border-b border-black/10 dark:border-white/10 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black tracking-widest text-amber-600 dark:text-amber-400 mb-2">
                        VISITOR TIP
                      </span>
                      <p className="text-sm sm:text-base leading-7 text-black/70 dark:text-white/70 break-words">
                        {place.visitorTips}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
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
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs font-bold text-black hover:bg-[#d5a56d] transition-colors cursor-pointer w-fit"
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
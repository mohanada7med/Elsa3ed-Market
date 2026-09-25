
import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { CulturalEvent } from '../../types';

import {
  ArrowLeft,
  ArrowUpLeft,
  CalendarDays,
  Clock3,
  Compass,
  Feather,
  MapPin,
  ScrollText,
  Share2,
  Sparkles,
  Users,
  Utensils,
  Flame,
  CheckCircle2,
  Image as ImageIcon,
  Film,
  Video,
  Play,
  Edit,
  Maximize2
} from 'lucide-react';
import { EventImageLightboxModal } from '../common/EventImageLightboxModal';
import { EventEditorModal } from './AdminEventsManagerPage';

export const EventDetailPage: React.FC = () => {
  const {
    selectedEventSlug,
    navigateToGovernorate,
    setActivePage,
    addToast,
    currentUser,
    currentRole,
  } = useApp();
  const isAdmin = currentRole === 'admin' || currentUser?.role === 'admin';

  const [event, setEvent] = useState<CulturalEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const slug =
    selectedEventSlug ||
    (typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/events/')
      ? decodeURIComponent(
        window.location.pathname.split('/')[2] || ''
      )
      : null) ||
    'moulid-kenawi-qena';

  useEffect(() => {
    let mounted = true;

    const fetchEvent = async () => {
      setIsLoading(true);

      try {
        const data = await wahApi.getEventBySlug(slug);

        if (mounted) {
          setEvent(data || null);
        }
      } catch (error) {
        console.warn(
          'Could not load event details:',
          error
        );

        if (mounted) {
          setEvent(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchEvent();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const heroImage = useMemo(() => {
    return (
      event?.coverImage ||
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1800&q=90'
    );
  }, [event]);

  // Combined gallery containing the cover image as the first image + all gallery photos
  const allGalleryImages = useMemo(() => {
    const list: string[] = [];
    const cover = event?.coverImage?.trim();
    if (cover) {
      list.push(cover);
    }
    if (event?.gallery && Array.isArray(event.gallery)) {
      event.gallery.forEach((img) => {
        const trimmed = img?.trim();
        if (trimmed && !list.includes(trimmed)) {
          list.push(trimmed);
        }
      });
    }
    return list;
  }, [event?.coverImage, event?.gallery]);

  const openLightbox = (index: number = 0) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const season = useMemo(() => {
    if (!event) return 'موسم سنوي';

    return (
      event.timeOfYear ||
      event.startDate ||
      event.eventDate ||
      event.dateText ||
      event.season ||
      'موسم سنوي'
    );
  }, [event]);

  const location = useMemo(() => {
    if (!event) return '';

    return (
      event.location ||
      event.locationName ||
      event.governorateName ||
      'الصعيد'
    );
  }, [event]);

  const handleShare = async () => {
    if (typeof window === 'undefined') return;

    const url = `${window.location.origin}/events/${encodeURIComponent(
      slug
    )}`;

    try {
      if (
        navigator.share &&
        typeof navigator.share === 'function'
      ) {
        await navigator.share({
          title: event?.title || 'فعالية من WAH',
          text:
            event?.description ||
            'اكتشف هذه الفعالية من أجندة الصعيد.',
          url,
        });

        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);

        addToast(
          'تم نسخ الرابط',
          'تم نسخ رابط الفعالية بنجاح',
          'success'
        );
      }
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {
        return;
      }

      console.warn(
        'Could not share event:',
        error
      );
    }
  };

  /* =====================================================
      LOADING
  ===================================================== */

  if (isLoading) {
    return (
      <main
        dir="rtl"
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-cream
          text-espresso
          dark:bg-espresso-900
          dark:text-cream
        "
      >
        <div className="px-6 text-center">
          <div
            className="
              mx-auto
              mb-6
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-full
              border
              border-primary/20
              bg-primary/5

              dark:border-[#d6aa72]/20
              dark:bg-[#d6aa72]/5
            "
          >
            <CalendarDays
              size={26}
              className="
                animate-pulse
                text-primary

                dark:text-primary-hover
              "
            />
          </div>

          <p
            className="
              text-xs
              font-bold
              text-black/50

              dark:text-white/50
            "
          >
            بنجهزلك حكاية الفعالية...
          </p>
        </div>
      </main>
    );
  }

  /* =====================================================
      NOT FOUND
  ===================================================== */

  if (!event) {
    return (
      <main
        dir="rtl"
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-cream
          px-5
          text-espresso

          dark:bg-espresso-900
          dark:text-cream
        "
      >
        <div className="max-w-md text-center">
          <div
            className="
              mx-auto
              mb-6
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-full
              border
              border-black/10
              bg-white/60

              dark:border-white/10
              dark:bg-cream/[0.03]
            "
          >
            <Compass
              size={26}
              className="
                text-primary

                dark:text-primary-hover
              "
            />
          </div>

          <h1 className="text-2xl font-black">
            الفعالية مش موجودة
          </h1>

          <p
            className="
              mt-3
              text-sm
              leading-7
              text-black/45

              dark:text-white/45
            "
          >
            مش قادرين نلاقي البيانات المطلوبة
            للفعالية دي.
          </p>

          <button
            type="button"
            onClick={() => setActivePage('events')}
            className="
              mt-7
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-[#201c17]
              px-6
              py-3.5
              text-xs
              font-bold
              text-white
              transition
              hover:-translate-y-0.5

              dark:bg-cream
              dark:text-black

              cursor-pointer
            "
          >
            العودة للفعاليات
            <ArrowLeft size={14} />
          </button>
        </div>
      </main>
    );
  }

  const renderVideoPlayer = (url: string, index: number) => {
    if (!url) return null;
    const trimmed = url.trim();
    const ytMatch = trimmed.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch && ytMatch[1]) {
      return (
        <div
          key={index}
          className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-black/10 dark:border-white/10"
        >
          <iframe
            src={`https://www.youtube.com/embed/${ytMatch[1]}`}
            title={`تسجيل مرئي ${index + 1}`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return (
        <div
          key={index}
          className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-black/10 dark:border-white/10"
        >
          <iframe
            src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
            title={`تسجيل مرئي ${index + 1}`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    return (
      <div
        key={index}
        className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-black/10 dark:border-white/10"
      >
        <video
          src={trimmed}
          controls
          playsInline
          preload="metadata"
          className="w-full h-full object-contain"
        />
      </div>
    );
  };

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        overflow-x-hidden
        bg-cream
        text-espresso
        transition-colors
        duration-500

        dark:bg-espresso-900
        dark:text-cream
      "
    >
      {/* =====================================================
          BACKGROUND DETAILS
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="
            absolute
            -right-[300px]
            top-[20%]
            h-[700px]
            w-[700px]
            rounded-full
            border
            border-primary/[0.06]

            dark:border-[#d6aa72]/[0.07]
          "
        />

        <div
          className="
            absolute
            -left-[260px]
            top-[60%]
            h-[550px]
            w-[550px]
            rounded-full
            border
            border-primary/[0.05]

            dark:border-[#d6aa72]/[0.06]
          "
        />
      </div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header
        className="
          sticky
          top-0
          z-[100]
          border-b
          border-black/[0.07]
          bg-cream/85
          backdrop-blur-2xl

          dark:border-white/[0.08]
          dark:bg-espresso-900/85
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[72px]
            max-w-[1500px]
            items-center
            justify-between
            px-4

            sm:px-6

            lg:px-10
          "
        >
          <button
            type="button"
            onClick={() => setActivePage('events')}
            className="
              group
              flex
              items-center
              gap-2.5
              text-xs
              font-bold
              transition
              hover:text-primary

              dark:hover:text-primary-hover

              cursor-pointer
            "
          >
            <span
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-black/10
                bg-white/50
                transition-all

                group-hover:border-primary/30
                group-hover:bg-[#201c17]
                group-hover:text-white

                dark:border-white/10
                dark:bg-cream/[0.035]

                dark:group-hover:bg-white
                dark:group-hover:text-black
              "
            >
              <ArrowLeft
                size={15}
                className="
                  transition-transform
                  group-hover:translate-x-0.5
                "
              />
            </span>

            <span className="hidden sm:block">
              كل الفعاليات
            </span>
          </button>

          {/* CENTER BRAND */}

          <div
            className="
              absolute
              left-1/2
              -translate-x-1/2
              text-center
              pointer-events-none
              hidden xs:block
            "
          >
            <div
              className="
                text-[9px]
                font-black
                tracking-[0.5em]
                text-primary
                dark:text-primary-hover
              "
            >
              WAH
            </div>

            <div className="mt-1 text-xs font-black">
              حكاية فعالية
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="
                  group
                  flex
                  items-center
                  gap-1.5
                  rounded-full
                  bg-gradient-to-r from-amber-600 via-primary to-amber-700
                  hover:scale-[1.03] active:scale-95
                  text-white
                  px-3
                  py-2
                  text-[10px]
                  font-bold
                  transition-all
                  shadow-md shadow-primary/20
                  cursor-pointer
                  sm:px-3.5
                  sm:text-xs
                "
                title="تعديل هذا الاحتفال وميديا الصور والفيديوهات مباشرة"
              >
                <Edit size={13} />
                <span className="hidden md:inline">تعديل وميديا الاحتفال</span>
                <span className="md:hidden">تعديل</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="
                group
                flex
                items-center
                gap-2
                rounded-full
                border
                border-black/10
                px-3
                py-2
                text-[10px]
                font-bold
                transition-all
                hover:border-primary/30
                hover:bg-[#201c17]
                hover:text-white
                dark:border-white/10
                dark:hover:bg-white
                dark:hover:text-black
                sm:px-4
                sm:text-xs
                cursor-pointer
              "
            >
              <span className="hidden sm:block">
                مشاركة
              </span>

              <Share2
                size={14}
                className="
                  transition-transform
                  group-hover:scale-110
                "
              />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative z-10">
        <div
          className="
            mx-auto
            max-w-[1500px]
            px-3
            pt-3

            sm:px-5
            sm:pt-5

            lg:px-8
            lg:pt-8
          "
        >
          <div
            className="
              relative
              min-h-[620px]
              overflow-hidden
              rounded-[2rem]
              bg-[#181512]

              sm:min-h-[680px]

              lg:min-h-[720px]
              lg:rounded-[2.5rem]
            "
          >
            {/* IMAGE */}

            <img
              src={heroImage}
              alt={event.title}
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                opacity-75
              "
            />

            {/* DARK GRADIENT */}

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-black
                via-black/45
                to-black/10
              "
            />

            {/* SIDE GRADIENT */}

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-l
                from-black/45
                via-transparent
                to-transparent
              "
            />

            {/* DECORATIVE FRAME */}

            <div
              className="
                pointer-events-none
                absolute
                inset-4
                rounded-[1.5rem]
                border
                border-white/15

                sm:inset-6
                sm:rounded-[1.75rem]
              "
            />

            {/* TOP META */}

            <div
              className="
                absolute
                inset-x-0
                top-0
                z-10
                flex
                items-start
                justify-between
                p-7

                sm:p-10
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/15
                  bg-black/20
                  px-3
                  py-1.5
                  text-[9px]
                  font-bold
                  text-white
                  backdrop-blur-xl
                "
              >
                <Sparkles size={11} />
                WAH CULTURAL STORY
              </div>

              {/* Cover Fullscreen Trigger */}
              <button
                type="button"
                onClick={() => openLightbox(0)}
                className="
                  flex items-center gap-1.5
                  rounded-full border border-white/25
                  bg-black/35 hover:bg-black/70
                  px-3.5 py-1.5
                  text-[11px] font-bold text-white
                  backdrop-blur-xl transition-all
                  hover:scale-105 active:scale-95 cursor-pointer shadow-lg
                "
                title="عرض صورة الغلاف بحجم كامل"
              >
                <Maximize2 size={12} className="text-primary" />
                <span>فتح الغلاف بحجم كامل</span>
                {allGalleryImages.length > 1 && (
                  <span className="mr-1 text-[10px] text-white/70">
                    ({allGalleryImages.length} صور)
                  </span>
                )}
              </button>

              <div
                className="
                  hidden
                  text-[8px]
                  font-black
                  tracking-[0.25em]
                  text-white/40

                  sm:block
                "
              >
                UPPER EGYPT / ARCHIVE
              </div>
            </div>

            {/* HERO CONTENT */}

            <div
              className="
                absolute
                inset-x-0
                bottom-0
                z-10
                p-7

                sm:p-10

                lg:p-14
              "
            >
              <div className="max-w-5xl">
                {/* BADGES */}

                <div className="mb-5 flex flex-wrap gap-2">
                  <span
                    className="
                      rounded-full
                      bg-[#d6aa72]
                      px-3
                      py-1.5
                      text-[9px]
                      font-black
                      text-black
                    "
                  >
                    {event.category ||
                      'موسم تراثي'}
                  </span>

                  {event.governorateName && (
                    <button
                      type="button"
                      onClick={() =>
                        navigateToGovernorate(
                          event.governorateId ||
                          'qena'
                        )
                      }
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-white/15
                        bg-black/20
                        px-3
                        py-1.5
                        text-[9px]
                        font-bold
                        text-white
                        backdrop-blur-xl
                        transition
                        hover:bg-white
                        hover:text-black

                        cursor-pointer
                      "
                    >
                      <MapPin size={11} />
                      محافظة {event.governorateName}
                    </button>
                  )}
                </div>

                {/* TITLE */}

                <h1
                  className="
                    max-w-5xl
                    text-4xl
                    font-black
                    leading-[1.05]
                    tracking-[-0.06em]
                    text-white

                    sm:text-6xl

                    lg:text-8xl
                  "
                >
                  {event.title}
                </h1>

                {/* DESCRIPTION */}

                {event.description && (
                  <p
                    className="
                      mt-5
                      max-w-3xl
                      text-xs
                      leading-7
                      text-white/60

                      sm:text-sm
                      sm:leading-8
                    "
                  >
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK INFO CARDS
      ===================================================== */}

      <section className="relative z-20">
        <div
          className="
            mx-auto
            max-w-[1200px]
            px-4
            -mt-10

            sm:px-6
            lg:px-8
          "
        >
          <div
            className="
              grid
              overflow-hidden
              rounded-[1.5rem]
              border
              border-black/[0.08]
              bg-white/90
              shadow-[0_25px_80px_rgba(32,28,23,0.10)]
              backdrop-blur-2xl

              dark:border-white/[0.08]
              dark:bg-[#11110f]/95
              dark:shadow-black/30

              sm:grid-cols-3
            "
          >
            {/* SEASON */}

            <div
              className="
                flex
                items-center
                gap-4
                border-b
                border-black/[0.07]
                p-5

                dark:border-white/[0.07]

                sm:border-b-0
                sm:border-l
                sm:p-7
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-primary/10
                  text-primary

                  dark:bg-[#d6aa72]/10
                  dark:text-primary-hover
                "
              >
                <Clock3 size={18} />
              </div>

              <div className="min-w-0">
                <div
                  className="
                    text-[8px]
                    font-black
                    tracking-[0.15em]
                    text-black/35

                    dark:text-white/35
                  "
                >
                  SEASON
                </div>

                <div className="mt-1 truncate text-xs font-black">
                  {season}
                </div>
              </div>
            </div>

            {/* LOCATION */}

            <div
              className="
                flex
                items-center
                gap-4
                border-b
                border-black/[0.07]
                p-5

                dark:border-white/[0.07]

                sm:border-b-0
                sm:border-l
                sm:p-7
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-primary/10
                  text-primary

                  dark:bg-[#d6aa72]/10
                  dark:text-primary-hover
                "
              >
                <MapPin size={18} />
              </div>

              <div className="min-w-0">
                <div
                  className="
                    text-[8px]
                    font-black
                    tracking-[0.15em]
                    text-black/35

                    dark:text-white/35
                  "
                >
                  LOCATION
                </div>

                <div className="mt-1 truncate text-xs font-black">
                  {location}
                </div>
              </div>
            </div>

            {/* TYPE */}

            <div
              className="
                flex
                items-center
                gap-4
                p-5

                sm:p-7
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-primary/10
                  text-primary

                  dark:bg-[#d6aa72]/10
                  dark:text-primary-hover
                "
              >
                <Users size={18} />
              </div>

              <div>
                <div
                  className="
                    text-[8px]
                    font-black
                    tracking-[0.15em]
                    text-black/35

                    dark:text-white/35
                  "
                >
                  CULTURE
                </div>

                <div className="mt-1 text-xs font-black">
                  فعالية شعبية
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STORY / TRADITIONS
      ===================================================== */}

      <section className="relative z-10">
        <div
          className="
            mx-auto
            max-w-[1200px]
            px-5
            py-20

            sm:px-7
            sm:py-24

            lg:px-8
            lg:py-32
          "
        >
          <div
            className="
              grid
              gap-12

              lg:grid-cols-[280px_1fr]
              lg:gap-20
            "
          >
            {/* SIDE LABEL */}

            <aside>
              <div
                className="
                  sticky
                  top-28
                "
              >
                <div
                  className="
                    mb-4
                    flex
                    items-center
                    gap-2
                    text-[9px]
                    font-black
                    tracking-[0.25em]
                    text-primary

                    dark:text-primary-hover
                  "
                >
                  <Feather size={12} />
                  THE STORY
                </div>

                <div
                  className="
                    h-px
                    w-12
                    bg-primary

                    dark:bg-[#d6aa72]
                  "
                />

                <p
                  className="
                    mt-5
                    text-xs
                    leading-7
                    text-black/40

                    dark:text-white/40
                  "
                >
                  تفاصيل صغيرة بتحكي
                  تاريخ كبير عن المكان
                  والناس والعادات.
                </p>
              </div>
            </aside>

            {/* MAIN STORY */}

            <div>
              <div
                className="
                  mb-8
                  flex
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-[#201c17]
                    text-white

                    dark:bg-[#d6aa72]
                    dark:text-black
                  "
                >
                  <ScrollText size={17} />
                </span>

                <h2
                  className="
                    text-2xl
                    font-black
                    tracking-[-0.04em]

                    sm:text-3xl
                  "
                >
                  الطقوس والمراسم
                </h2>
              </div>

              {event.traditions ? (
                <div
                  className="
                    whitespace-pre-line
                    text-base
                    font-medium
                    leading-9
                    text-black/75
                    sm:text-lg
                    sm:leading-10
                    dark:text-white/75
                  "
                >
                  {event.traditions}
                </div>
              ) : (
                <div
                  className="
                    rounded-2xl
                    border
                    border-dashed
                    border-black/10
                    p-8
                    text-sm
                    leading-7
                    text-black/40
                    dark:border-white/10
                    dark:text-white/40
                  "
                >
                  تفاصيل الطقوس والمراسم الخاصة
                  بالفعالية هتكون متاحة قريبًا.
                </div>
              )}

              {/* RITUALS LIST */}
              {event.rituals && event.rituals.length > 0 && (
                <div className="mt-12 pt-10 border-t border-black/10 dark:border-white/10">
                  <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <CheckCircle2 size={18} />
                    </span>
                    <h3 className="text-xl font-black sm:text-2xl">أبرز طقوس وعادات الليلة</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {event.rituals.map((ritual, rIdx) => (
                      <div
                        key={rIdx}
                        className="flex items-start gap-3 rounded-2xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-black text-xs font-black">
                          ✓
                        </span>
                        <span className="text-sm font-bold leading-relaxed text-black/80 dark:text-white/85">
                          {ritual}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAMOUS FOODS & DRINKS */}
              {event.famousFoods && event.famousFoods.length > 0 && (
                <div className="mt-12 pt-10 border-t border-black/10 dark:border-white/10">
                  <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Utensils size={18} />
                    </span>
                    <div>
                      <h3 className="text-xl font-black sm:text-2xl">أكلات ومشروبات النفحة والليلة</h3>
                      <p className="text-xs text-black/50 dark:text-white/50 mt-1">الخير الممدود في ساحات وضيافة الصعايدة</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {event.famousFoods.map((food, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 dark:border-primary/20 dark:bg-primary/[0.08]"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-black font-bold">
                          🥣
                        </span>
                        <span className="text-sm font-black text-espresso dark:text-cream">
                          {food}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTIVITIES */}
              {event.activities && event.activities.length > 0 && (
                <div className="mt-12 pt-10 border-t border-black/10 dark:border-white/10">
                  <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Flame size={18} />
                    </span>
                    <h3 className="text-xl font-black sm:text-2xl">أبرز المشاهد والفعاليات الحية</h3>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {event.activities.map((act, aIdx) => (
                      <span
                        key={aIdx}
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 text-xs font-bold text-black/80 dark:border-white/10 dark:bg-white/5 dark:text-white/80"
                      >
                        <Sparkles size={12} className="text-primary" />
                        <span>{act}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* VIDEOS & RECORDINGS (مرئيات وتسجيلات الليلة الحية) */}
              {(event.videoUrl || (event.videos && event.videos.length > 0)) && (
                <div className="mt-12 pt-10 border-t border-black/10 dark:border-white/10">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500/20 text-rose-500">
                        <Film size={18} />
                      </span>
                      <div>
                        <h3 className="text-xl font-black sm:text-2xl">مرئيات وتسجيلات الليلة الحية</h3>
                        <p className="text-xs text-black/60 dark:text-white/60">
                          تسجيلات حية للمرماح، حلقات الذكر، الإنشاد الصوفي، والبهجة الشعبية
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from(
                      new Set(
                        [event.videoUrl, ...(event.videos || [])].filter(Boolean) as string[]
                      )
                    ).map((url, vIdx) => renderVideoPlayer(url, vIdx))}
                  </div>
                </div>
              )}

              {/* GALLERY (Including coverImage + all gallery photos) */}
              {allGalleryImages.length > 0 && (
                <div className="mt-12 pt-10 border-t border-black/10 dark:border-white/10">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                        <ImageIcon size={20} />
                      </span>
                      <div>
                        <h3 className="text-xl font-black sm:text-2xl font-serif">
                          معرض لقطات من قلب الليلة والموسم
                        </h3>
                        <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">
                          يشمل صورة الغلاف التراثية الرئيسية وصور وتوثيقات الميدان ({allGalleryImages.length} صور)
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openLightbox(0)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold transition-all cursor-pointer border border-primary/20 shadow-xs hover:shadow-md"
                    >
                      <Maximize2 size={13} />
                      <span>عرض المعرض بحجم كامل</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                    {allGalleryImages.map((imgUrl, gIdx) => {
                      const isCover = Boolean(event?.coverImage && imgUrl === event.coverImage);
                      return (
                        <div
                          key={gIdx}
                          onClick={() => openLightbox(gIdx)}
                          className="group relative h-48 sm:h-64 overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-black cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
                        >
                          <img
                            src={imgUrl}
                            alt={`${event?.title || 'صورة'} - ${gIdx + 1}`}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                            loading="lazy"
                          />

                          {/* Hover Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 sm:p-4">
                            <div className="flex justify-end">
                              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white shadow-md">
                                <Maximize2 size={15} />
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-white text-xs font-bold">
                              <span>فتح الصورة بحجم كامل</span>
                              <span className="text-[10px] text-white/70 font-mono">
                                {gIdx + 1} / {allGalleryImages.length}
                              </span>
                            </div>
                          </div>

                          {/* Cover Image Badge */}
                          {isCover && (
                            <div className="absolute top-3 right-3 z-10">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-black text-[10px] font-black shadow-lg backdrop-blur-md border border-white/20">
                                <Sparkles size={11} />
                                <span>صورة الغلاف</span>
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CULTURAL QUOTE / DIVIDER
      ===================================================== */}

      <section className="relative z-10 px-5 sm:px-7 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div
            className="
              relative
              overflow-hidden
              rounded-[2rem]
              border
              border-primary/15
              bg-primary/[0.045]
              px-7
              py-12
              text-center

              dark:border-[#d6aa72]/15
              dark:bg-[#d6aa72]/[0.045]

              sm:px-12
              sm:py-16
            "
          >
            <div
              className="
                absolute
                -left-20
                -top-20
                h-48
                w-48
                rounded-full
                border
                border-primary/10

                dark:border-[#d6aa72]/10
              "
            />

            <div
              className="
                absolute
                -bottom-24
                -right-20
                h-56
                w-56
                rounded-full
                border
                border-primary/10

                dark:border-[#d6aa72]/10
              "
            />

            <Sparkles
              size={20}
              className="
                relative
                mx-auto
                mb-5
                text-primary

                dark:text-primary-hover
              "
            />

            <p
              className="
                relative
                mx-auto
                max-w-2xl
                text-xl
                font-black
                leading-9
                tracking-[-0.03em]

                sm:text-3xl
                sm:leading-[1.7]
              "
            >
              كل موسم له ناسه،
              <br />
              وكل ناس ليهم حكاية.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          GOVERNORATE CONNECTION
      ===================================================== */}

      {event.governorateName && (
        <section className="relative z-10">
          <div
            className="
              mx-auto
              max-w-[1200px]
              px-5
              py-20

              sm:px-7
              sm:py-24

              lg:px-8
              lg:py-28
            "
          >
            <button
              type="button"
              onClick={() =>
                navigateToGovernorate(
                  event.governorateId || 'qena'
                )
              }
              className="
                group
                relative
                flex
                w-full
                flex-col
                overflow-hidden
                rounded-[2rem]
                bg-[#201c17]
                p-7
                text-right
                text-white
                transition-all
                duration-500
                hover:-translate-y-1

                sm:p-10

                lg:flex-row
                lg:items-center
                lg:justify-between
                lg:p-12

                cursor-pointer
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  -left-24
                  -top-24
                  h-64
                  w-64
                  rounded-full
                  border
                  border-white/[0.08]
                "
              />

              <div className="relative">
                <div
                  className="
                    mb-3
                    text-[9px]
                    font-black
                    tracking-[0.25em]
                    text-primary-hover
                  "
                >
                  EXPLORE THE REGION
                </div>

                <h3
                  className="
                    text-2xl
                    font-black
                    tracking-[-0.04em]

                    sm:text-4xl
                  "
                >
                  اكتشف حكايات محافظة{' '}
                  {event.governorateName}
                </h3>

                <p
                  className="
                    mt-3
                    text-xs
                    leading-6
                    text-white/45
                  "
                >
                  شوف أماكنها وفعالياتها وحكاياتها
                  الثقافية.
                </p>
              </div>

              <span
                className="
  relative
  mt-7
  flex
  h-12
  w-12
  shrink-0
  items-center
  justify-center
  rounded-full
  bg-espresso
  text-white
  dark:bg-cream
  dark:text-espresso
  transition-all
  duration-300
  group-hover:-translate-x-1
  group-hover:scale-105
  group-hover:bg-primary
  dark:group-hover:bg-primary
  dark:group-hover:text-white
  cursor-pointer
  shadow-md
  lg:mt-0
"
              >
                <ArrowUpLeft size={18} />
              </span>
            </button>
          </div>
        </section>
      )}

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section
        className="
          relative
          z-10
          border-t
          border-black/[0.07]

          dark:border-white/[0.08]
        "
      >
        <div
          className="
            mx-auto
            max-w-[1500px]
            px-4
            py-16

            sm:px-6
            sm:py-24

            lg:px-10
            lg:py-28
          "
        >
          <div
            className="
              relative
              overflow-hidden
              rounded-[2.25rem]
              bg-[#201c17]
              px-6
              py-14
              text-white

              sm:px-10
              sm:py-18

              lg:px-20
              lg:py-24
            "
          >
            <div
              className="
                absolute
                -left-32
                -top-32
                h-80
                w-80
                rounded-full
                border
                border-white/[0.07]
              "
            />

            <div
              className="
                absolute
                -bottom-40
                -right-20
                h-[420px]
                w-[420px]
                rounded-full
                border
                border-white/[0.07]
              "
            />

            <div
              className="
                relative
                z-10
                grid
                gap-10

                lg:grid-cols-[1fr_330px]
                lg:items-end
              "
            >
              <div>
                <div
                  className="
                    mb-5
                    flex
                    items-center
                    gap-2
                    text-[9px]
                    font-black
                    tracking-[0.3em]
                    text-primary-hover
                  "
                >
                  <Sparkles size={12} />
                  WAH / UPPER EGYPT
                </div>

                <h2
                  className="
                    max-w-4xl
                    text-4xl
                    font-black
                    leading-[1.05]
                    tracking-[-0.06em]

                    sm:text-6xl

                    lg:text-7xl
                  "
                >
                  لسه في حكايات
                  <br />
                  كتير مستنيانا.
                </h2>
              </div>

              <div>
                <p
                  className="
                    text-xs
                    leading-7
                    text-white/50

                    sm:text-sm
                    sm:leading-8
                  "
                >
                  اكتشف المزيد من الفعاليات
                  والمواسم اللي بتخلي الصعيد
                  مختلف ومميز.
                </p>

                <button
                  type="button"
                  onClick={() => setActivePage('events')}
                  className="mt-6 inline-flex items-center gap-3 rounded-full bg-espresso text-white dark:bg-cream dark:text-espresso px-5 py-3.5 text-[10px] font-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary dark:hover:bg-primary dark:hover:text-white cursor-pointer shadow-md"
                >
                  كل الفعاليات
                  <ArrowLeft size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-6 sm:h-10" />

      {/* FULL-SIZE IMAGE LIGHTBOX MODAL */}
      <EventImageLightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={allGalleryImages}
        initialIndex={lightboxIndex}
        coverImage={event?.coverImage}
        title={event?.title || 'معرض صور الليلة'}
      />

      {/* DIRECT EVENT EDIT MODAL FOR THIS CELEBRATION */}
      {isAdmin && isEditModalOpen && event && (
        <EventEditorModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          event={event}
          initialTab="media"
          onSaved={(updatedEvent) => {
            setEvent(updatedEvent);
            setIsEditModalOpen(false);
            addToast('تم الحفظ بنجاح', `تم تحديث وتوثيق بيانات وميديا «${updatedEvent.title}» بنجاح`, 'success');
          }}
        />
      )}
    </main>
  );
};

export default EventDetailPage;

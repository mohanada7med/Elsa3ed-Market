
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
    (typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/events/')
      ? decodeURIComponent(
        window.location.pathname.split('/')[2] || ''
      )
      : null) ||
    'kenawi-moulid';

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
          bg-[#eee8dc]
          text-[#211d18]
          dark:bg-[#0b0b0a]
          dark:text-[#f5f0e7]
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
              border-[#9a6a35]/20
              bg-[#9a6a35]/5

              dark:border-[#d6aa72]/20
              dark:bg-[#d6aa72]/5
            "
          >
            <CalendarDays
              size={26}
              className="
                animate-pulse
                text-[#9a6a35]

                dark:text-[#d6aa72]
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
          bg-[#eee8dc]
          px-5
          text-[#211d18]

          dark:bg-[#0b0b0a]
          dark:text-[#f5f0e7]
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
              dark:bg-white/[0.03]
            "
          >
            <Compass
              size={26}
              className="
                text-[#9a6a35]

                dark:text-[#d6aa72]
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

              dark:bg-white
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

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors
        duration-500

        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
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
            border-[#9a6a35]/[0.06]

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
            border-[#9a6a35]/[0.05]

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
          bg-[#eee8dc]/85
          backdrop-blur-2xl

          dark:border-white/[0.08]
          dark:bg-[#0b0b0a]/85
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
              hover:text-[#9a6a35]

              dark:hover:text-[#d6aa72]

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

                group-hover:border-[#9a6a35]/30
                group-hover:bg-[#201c17]
                group-hover:text-white

                dark:border-white/10
                dark:bg-white/[0.035]

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
            "
          >
            <div
              className="
                text-[9px]
                font-black
                tracking-[0.5em]
                text-[#9a6a35]

                dark:text-[#d6aa72]
              "
            >
              WAH
            </div>

            <div className="mt-1 text-xs font-black">
              حكاية فعالية
            </div>
          </div>

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

              hover:border-[#9a6a35]/30
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
                  bg-[#9a6a35]/10
                  text-[#9a6a35]

                  dark:bg-[#d6aa72]/10
                  dark:text-[#d6aa72]
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
                  bg-[#9a6a35]/10
                  text-[#9a6a35]

                  dark:bg-[#d6aa72]/10
                  dark:text-[#d6aa72]
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
                  bg-[#9a6a35]/10
                  text-[#9a6a35]

                  dark:bg-[#d6aa72]/10
                  dark:text-[#d6aa72]
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
                    text-[#9a6a35]

                    dark:text-[#d6aa72]
                  "
                >
                  <Feather size={12} />
                  THE STORY
                </div>

                <div
                  className="
                    h-px
                    w-12
                    bg-[#9a6a35]

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
                    text-black/65

                    sm:text-lg
                    sm:leading-10

                    dark:text-white/65
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
              border-[#9a6a35]/15
              bg-[#9a6a35]/[0.045]
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
                border-[#9a6a35]/10

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
                border-[#9a6a35]/10

                dark:border-[#d6aa72]/10
              "
            />

            <Sparkles
              size={20}
              className="
                relative
                mx-auto
                mb-5
                text-[#9a6a35]

                dark:text-[#d6aa72]
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
                    text-[#d6aa72]
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
  bg-[#211d18]
  text-white
  dark:bg-white
  dark:text-[#211d18]
  transition-all
  duration-300
  group-hover:-translate-x-1
  group-hover:scale-105
  group-hover:bg-[#9a6a35]
  dark:group-hover:bg-[#9a6a35]
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
                    text-[#d6aa72]
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
                  className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#211d18] text-white dark:bg-white dark:text-[#211d18] px-5 py-3.5 text-[10px] font-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#9a6a35] dark:hover:bg-[#9a6a35] dark:hover:text-white cursor-pointer shadow-md"
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
    </main>
  );
};

export default EventDetailPage;

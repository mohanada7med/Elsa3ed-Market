import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { CulturalEvent } from '../../types';
import {
  Calendar,
  Search,
  ArrowLeft,
  ArrowUpLeft,
  Sparkles,
  MapPin,
  Clock,
  ChevronDown,
  X,
  Flame,
  Music,
  Utensils,
  Eye,
  Feather,
  Compass,
} from 'lucide-react';

const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
  all: { label: 'كافة المواسم والليالي', icon: '✨' },
  moulid: { label: 'موالد وليالي ذكر', icon: '🕌' },
  harvest: { label: 'مواسم زراعية وحصاد', icon: '🌾' },
  festival: { label: 'احتفالات ومهرجانات كبرى', icon: '🎉' },
  cultural_night: { label: 'فروسية ومرماح وهجن', icon: '🐎' },
  market_fair: { label: 'أسواق ومواسم حرفية', icon: '🏺' },
};

export const EventsPage: React.FC = () => {
  const { navigateToEvent, setActivePage, navigateToGovernorate } = useApp();
  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [governorateFilter, setGovernorateFilter] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getEvents();
        if (isMounted) {
          setEvents(data || []);
        }
      } catch (err) {
        console.warn('Could not load events:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  const governorates = useMemo(() => {
    return Array.from(new Set(events.map((e) => e.governorateName))).filter(Boolean);
  }, [events]);

  const categories = useMemo(() => {
    return Array.from(new Set(events.map((e) => e.category))).filter(Boolean);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const loc = event.location || event.locationName || event.cityName || '';
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.governorateName.toLowerCase().includes(query) ||
        loc.toLowerCase().includes(query) ||
        (event.rituals && event.rituals.some((r) => r.toLowerCase().includes(query))) ||
        (event.famousFoods && event.famousFoods.some((f) => f.toLowerCase().includes(query)));

      let matchesCat = true;
      if (categoryFilter !== 'all') {
        matchesCat = event.category === categoryFilter;
      }

      const matchesGov = governorateFilter === 'all' || event.governorateName === governorateFilter;
      return matchesSearch && matchesCat && matchesGov;
    });
  }, [events, searchQuery, categoryFilter, governorateFilter]);

  const featuredEvent = useMemo(() => {
    return events.find((e) => e.isFeatured) || events[0] || null;
  }, [events]);

  const getCategoryLabel = (cat?: string) => {
    if (!cat) return 'موسم تراثي';
    return CATEGORY_MAP[cat]?.label || cat;
  };

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        overflow-x-hidden
        bg-cream
        text-espresso
        transition-colors duration-500
        dark:bg-espresso-900
        dark:text-cream
      "
    >
      {/* =====================================================
          NAVBAR (Consistent with Food & Places Pages)
      ===================================================== */}
      <header className="sticky top-0 z-50 border-b border-black/10 dark:border-white/10 backdrop-blur-xl bg-white/80 dark:bg-espresso-900/90">
        <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => setActivePage('home')}
            className="
              group flex items-center gap-3
              text-sm font-bold
              transition-all
              hover:text-primary
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
                group-hover:bg-espresso
                group-hover:text-white
                dark:border-white/10
                dark:bg-cream/5
                dark:group-hover:bg-white
                dark:group-hover:text-black
              "
            >
              <ArrowLeft
                size={17}
                className="transition-transform group-hover:-translate-x-1"
              />
            </span>
            <span className="hidden sm:block">الرئيسية</span>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <div className="text-[9px] font-bold tracking-[0.35em] text-primary">
              WAH
            </div>
            <div className="mt-1 text-sm font-black font-serif">مواسم وليالي الصعيد</div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setActivePage('admin-events')}
              className="
                flex items-center gap-1.5 sm:gap-2
                rounded-full
                bg-primary
                text-cream
                px-3.5 sm:px-4 py-2 sm:py-2.5
                text-xs font-bold
                transition-all
                hover:bg-primary-hover
                shadow-xs
                cursor-pointer
              "
              title="إدارة بيانات المواسم والأعياد والموالد الصعيدية، وإضافة الصور والفيديوهات والتعديل"
            >
              <Calendar size={14} />
              <span className="hidden md:inline">إدارة المواسم والموالد (صور وفيديوهات)</span>
              <span className="md:hidden">إدارة المواسم</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('map')}
              className="
                flex items-center gap-2
                rounded-full
                border border-black/10
                px-4 py-2.5
                text-xs font-bold
                transition-all
                hover:bg-espresso
                hover:text-white
                dark:border-white/10
                dark:hover:bg-white
                dark:hover:text-black
                cursor-pointer
              "
            >
              <Compass size={15} />
              <span className="hidden sm:block">خريطة الصعيد</span>
              <ArrowUpLeft size={14} className="hidden sm:block" />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO SECTION (Matching Prestige Heritage Quality)
      ===================================================== */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full border border-black/5 dark:border-white/5" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-[350px] w-[350px] rounded-full border border-black/5 dark:border-white/5" />

        <div className="mx-auto max-w-[1600px] px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20 lg:px-12 lg:pb-20 lg:pt-28">
          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_420px]">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <Sparkles size={16} className="text-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                  Upper Egypt Seasons & Layali / التراث الشعبي الحي
                </span>
              </div>

              <h1
                className="
                  max-w-5xl
                  text-[13vw]
                  font-black
                  font-serif
                  leading-[0.82]
                  tracking-[-0.06em]
                  sm:text-[10vw]
                  lg:text-[8rem]
                  xl:text-[9.5rem]
                "
              >
                مواسم
                <br />
                <span className="mr-[6vw] text-primary lg:mr-24">البهجة والليالي</span>
              </h1>

              <div className="mt-8 flex max-w-2xl items-start gap-5">
                <div className="mt-2 h-16 w-px bg-primary shrink-0" />
                <p className="text-sm leading-8 text-black/75 dark:text-white/75 sm:text-base">
                  دليل موثق بالعامية الصعيدية لأعرق موالد ومواسم وأفراح الصعيد؛ من ليلة القنائي وأبو الحجاج وسيدي أبو الحسن الشاذلي، لمواسم كسر القصب وعصير العسل الأسود، وحصاد البلح، والمرماح وألعاب الفروسية والتحطيب.
                </p>
              </div>
            </div>

            {/* Stats Card */}
            <div className="relative">
              <div
                className="
                  relative overflow-hidden
                  rounded-[2rem]
                  border border-black/10
                  bg-white/75
                  p-7
                  shadow-xl
                  backdrop-blur-2xl
                  dark:border-white/10
                  dark:bg-espresso-900/90
                  dark:shadow-black/30
                "
              >
                <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full border border-primary/20" />

                <div className="relative">
                  <div className="mb-8 flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-[0.25em] text-black/45 dark:text-white/45 uppercase">
                      Heritage Calendar
                    </span>
                    <Calendar size={20} className="text-primary" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="border-l border-black/10 dark:border-white/10 pl-4">
                      <div className="text-5xl font-black tracking-[-0.05em] font-mono text-espresso dark:text-cream">
                        {events.length}
                      </div>
                      <div className="mt-2 text-xs text-black/60 dark:text-white/60 font-bold">
                        ليلة وموسم موثق
                      </div>
                    </div>

                    <div>
                      <div className="text-5xl font-black tracking-[-0.05em] font-mono text-espresso dark:text-cream">
                        {governorates.length || 9}
                      </div>
                      <div className="mt-2 text-xs text-black/60 dark:text-white/60 font-bold">
                        محافظة صعيدية
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-3 border-t border-black/10 pt-5 dark:border-white/10">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary animate-ping" />
                    <span className="text-xs font-bold text-black/80 dark:text-white/80">
                      من بركة الموالد ودفا ليالي السمر والنفحة
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SPOTLIGHT BANNER (Featured Event)
      ===================================================== */}
      {featuredEvent && (
        <section className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 mb-10">
          <div
            onClick={() => navigateToEvent(featuredEvent.slug)}
            className="
              group relative overflow-hidden rounded-[2.5rem]
              border border-black/10 dark:border-white/10
              bg-espresso text-white
              shadow-2xl transition-all duration-500
              hover:border-primary/50 cursor-pointer
            "
          >
            <div className="absolute inset-0">
              <img
                src={featuredEvent.coverImage}
                alt={featuredEvent.title}
                className="h-full w-full object-cover opacity-35 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 p-7 sm:p-10 lg:p-14 flex flex-col justify-between min-h-[360px]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary px-3.5 py-1 text-xs font-black text-black">
                    ليلة مميزة في الصعيد
                  </span>
                  <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                    {getCategoryLabel(featuredEvent.category)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-primary-hover">
                  <Clock size={14} />
                  <span>{featuredEvent.timeOfYear || featuredEvent.eventDate}</span>
                </div>
              </div>

              <div className="mt-8 max-w-4xl">
                <div className="flex items-center gap-2 text-xs font-bold text-white/70 mb-2">
                  <MapPin size={14} className="text-primary" />
                  <span>{featuredEvent.locationName || featuredEvent.governorateName}</span>
                </div>

                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight leading-tight group-hover:text-primary-hover transition-colors">
                  {featuredEvent.title}
                </h2>

                <p className="mt-4 text-xs sm:text-sm md:text-base leading-7 text-white/80 line-clamp-2 max-w-3xl">
                  {featuredEvent.description}
                </p>

                <div className="mt-6 flex items-center gap-3 text-xs font-bold text-primary-hover">
                  <span>تعال نقرأ حكاية الليلة وطقوسها بالعامية</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 group-hover:bg-primary group-hover:text-black transition-all">
                    <ArrowUpLeft size={16} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          FLOATING FILTERS & CATEGORY BAR
      ===================================================== */}
      <section className="sticky top-[76px] z-40 mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div
          className="
            rounded-[1.75rem]
            border border-black/10
            bg-white/85
            p-3.5
            shadow-[0_20px_70px_rgba(0,0,0,0.08)]
            backdrop-blur-2xl
            dark:border-white/10
            dark:bg-espresso-900/90
            dark:shadow-black/30
          "
        >
          {/* Top Row: Search & Dropdowns */}
          <div className="flex flex-col gap-3 lg:flex-row">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={17}
                className="
                  absolute right-4 top-1/2
                  -translate-y-1/2
                  text-black/40
                  dark:text-white/40
                "
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن مولد، ليلة ذكر، موسم كسر قصب، أو مرماح..."
                className="
                  h-12 w-full
                  rounded-xl
                  border border-transparent
                  bg-black/[0.04]
                  pr-11 pl-10
                  text-sm
                  outline-none
                  transition-all
                  placeholder:text-black/40
                  focus:border-primary/50
                  focus:bg-transparent
                  dark:bg-cream/[0.05]
                  dark:placeholder:text-white/40
                  dark:focus:bg-white/[0.06]
                "
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="
                    absolute left-3 top-1/2
                    -translate-y-1/2
                    rounded-full p-1.5
                    hover:bg-black/10
                    dark:hover:bg-white/10
                    cursor-pointer
                  "
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Select */}
            <div className="relative lg:w-64">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="
                  h-12 w-full
                  appearance-none
                  rounded-xl
                  border border-transparent
                  bg-black/[0.04]
                  px-4
                  text-sm font-bold
                  outline-none
                  transition-all
                  focus:border-primary/50
                  dark:bg-cream/[0.05]
                  dark:focus:bg-white/[0.06]
                  cursor-pointer
                "
              >
                <option value="all" className="dark:bg-espresso-900">كافة أنواع المواسم والليالي</option>
                <option value="moulid" className="dark:bg-espresso-900">موالد وليالي ذكر</option>
                <option value="harvest" className="dark:bg-espresso-900">مواسم زراعية وحصاد</option>
                <option value="festival" className="dark:bg-espresso-900">احتفالات ومهرجانات كبرى</option>
                <option value="cultural_night" className="dark:bg-espresso-900">فروسية ومرماح وهجن</option>
                <option value="market_fair" className="dark:bg-espresso-900">أسواق ومواسم حرفية</option>
              </select>
              <ChevronDown
                size={15}
                className="
                  pointer-events-none
                  absolute left-4 top-1/2
                  -translate-y-1/2
                  text-black/50 dark:text-white/50
                "
              />
            </div>

            {/* Governorate Select */}
            <div className="relative lg:w-56">
              <select
                value={governorateFilter}
                onChange={(e) => setGovernorateFilter(e.target.value)}
                className="
                  h-12 w-full
                  appearance-none
                  rounded-xl
                  border border-transparent
                  bg-black/[0.04]
                  px-4
                  text-sm font-bold
                  outline-none
                  transition-all
                  focus:border-primary/50
                  dark:bg-cream/[0.05]
                  dark:focus:bg-white/[0.06]
                  cursor-pointer
                "
              >
                <option value="all" className="dark:bg-espresso-900">كل محافظات الصعيد</option>
                {governorates.map((gov) => (
                  <option key={gov} value={gov} className="dark:bg-espresso-900">
                    {gov}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="
                  pointer-events-none
                  absolute left-4 top-1/2
                  -translate-y-1/2
                  text-black/50 dark:text-white/50
                "
              />
            </div>

            {/* Counter badge & reset */}
            <div
              className="
                flex items-center justify-between
                rounded-xl
                bg-espresso
                px-5
                text-white
                dark:bg-cream
                dark:text-black
                min-h-[48px]
              "
            >
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-primary" />
                <span className="text-xs font-bold">
                  {filteredEvents.length} ليلة وموسم
                </span>
              </div>

              {(searchQuery.trim() !== '' || categoryFilter !== 'all' || governorateFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setGovernorateFilter('all');
                  }}
                  className="mr-4 text-[11px] font-black underline underline-offset-4 cursor-pointer text-primary"
                >
                  إعادة ضبط
                </button>
              )}
            </div>
          </div>

          {/* Bottom Quick Category Pills */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {Object.entries(CATEGORY_MAP).map(([key, item]) => {
              const isActive = categoryFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategoryFilter(key)}
                  className={`
                    flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer
                    ${isActive
                      ? 'bg-primary text-black shadow-md'
                      : 'bg-black/[0.04] text-black/70 hover:bg-black/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10'
                    }
                  `}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          EVENTS GRID SECTION (Rich Modern Heritage Cards)
      ===================================================== */}
      <section className="mx-auto max-w-[1600px] px-5 pb-24 pt-12 sm:px-8 lg:px-12">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="mb-2 text-[10px] font-bold tracking-[0.3em] text-primary uppercase">
              Upper Egypt Layali & Festivals
            </div>
            <h2 className="text-3xl font-black sm:text-4xl font-serif">
              أجندة أفراح وليالي الصعيد
            </h2>
          </div>

          <div className="hidden items-center gap-2 text-xs text-black/50 dark:text-white/50 sm:flex">
            <Flame size={15} className="text-primary" />
            <span>حكايات حقيقية بالعامية الصعيدية</span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[480px] animate-pulse rounded-[2rem] bg-black/5 dark:bg-cream/5"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredEvents.length === 0 && (
          <div
            className="
              flex min-h-[420px]
              flex-col items-center justify-center
              rounded-[2rem]
              border border-dashed
              border-black/15
              text-center
              dark:border-white/15
              bg-white/50 dark:bg-espresso-900/50
              backdrop-blur-xl p-8
            "
          >
            <div
              className="
                mb-6 flex h-16 w-16
                items-center justify-center
                rounded-full
                border border-black/10
                dark:border-white/10
              "
            >
              <Calendar size={24} className="text-primary" />
            </div>

            <h3 className="text-xl font-black">ملقيناش مواسم أو ليالي مطابقة لبحثك</h3>
            <p className="mt-3 text-sm text-black/60 dark:text-white/60 max-w-md">
              جرّب البحث بكلمة تانية زي "قنا" أو "بلح" أو "أبو الحجاج" أو غيّر الفلتر لتصفح باقي الاحتفالات.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setGovernorateFilter('all');
              }}
              className="
                mt-6
                rounded-full
                bg-espresso
                px-6 py-3
                text-xs font-bold text-white
                dark:bg-cream
                dark:text-black
                cursor-pointer
              "
            >
              عرض كافة مواسم الصعيد
            </button>
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event, index) => {
              const image =
                event.coverImage ||
                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800';
              const seasonText = event.season || event.timeOfYear || event.eventDate || 'موسمي';
              const categoryLabel = getCategoryLabel(event.category);

              return (
                <article
                  key={event.id || index}
                  onClick={() => navigateToEvent(event.slug)}
                  className="
                    group
                    relative
                    flex flex-col justify-between
                    overflow-hidden
                    rounded-[2rem]
                    border border-black/10
                    bg-white/80
                    p-6 sm:p-7
                    shadow-lg
                    backdrop-blur-xl
                    transition-all duration-500
                    hover:-translate-y-2
                    hover:border-primary
                    hover:shadow-[0_20px_50px_rgba(154,106,53,0.15)]
                    dark:border-white/10
                    dark:bg-espresso-900/90
                    cursor-pointer
                  "
                >
                  <div>
                    {/* Image Box */}
                    <div className="relative mb-5 h-60 w-full overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-black">
                      <img
                        src={image}
                        alt={event.title}
                        loading="lazy"
                        className="
                          h-full w-full
                          object-cover
                          transition-transform
                          duration-700
                          group-hover:scale-110
                        "
                      />

                      {/* Dark Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Serial Number */}
                      <div
                        className="
                          absolute right-4 top-4
                          text-5xl
                          font-black
                          leading-none
                          tracking-[-0.08em]
                          text-white/20
                          transition-all
                          duration-500
                          group-hover:text-white/40
                        "
                      >
                        {String(index + 1).padStart(2, '0')}
                      </div>

                      {/* Category Badge */}
                      <div className="absolute left-4 top-4">
                        <span
                          className="
                            inline-flex items-center gap-1
                            rounded-full
                            border border-white/20
                            bg-black/40
                            px-3 py-1
                            text-[10px]
                            font-black
                            text-white
                            backdrop-blur-md
                          "
                        >
                          {categoryLabel}
                        </span>
                      </div>

                      {/* Bottom Info inside Image */}
                      <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between text-xs font-bold text-white">
                        <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                          <MapPin size={12} className="text-primary" />
                          <span>{event.governorateName}</span>
                        </div>

                        <div className="flex items-center gap-1 bg-primary/90 text-black px-2.5 py-1 rounded-full font-black text-[11px]">
                          <Clock size={11} />
                          <span>{event.dateText || event.eventDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Season / Time text */}
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
                      <Sparkles size={13} />
                      <span className="truncate">{seasonText}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl font-black mb-3 transition-colors group-hover:text-primary font-serif leading-snug line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Colloquial Description */}
                    <p className="text-xs sm:text-sm leading-6 text-black/70 dark:text-white/70 line-clamp-3 mb-4">
                      {event.description}
                    </p>

                    {/* Famous Foods / Rituals Tags */}
                    {event.famousFoods && event.famousFoods.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-1.5">
                        {event.famousFoods.slice(0, 2).map((food, fIdx) => (
                          <span
                            key={fIdx}
                            className="inline-flex items-center gap-1 rounded-md bg-black/5 px-2 py-1 text-[10px] font-bold text-black/60 dark:bg-white/5 dark:text-white/60"
                          >
                            <Utensils size={10} className="text-primary" />
                            <span className="truncate max-w-[130px]">{food}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs font-bold">
                    <span className="text-black/60 dark:text-white/60 group-hover:text-primary transition-colors flex items-center gap-1">
                      <Eye size={14} />
                      <span>حكاية الليلة وطقوسها</span>
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 dark:bg-cream/5 text-black dark:text-white transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                      <ArrowUpLeft size={16} />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* =====================================================
          FINAL CTA (Matching Grand Brand Signature)
      ===================================================== */}
      <section className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div
            className="
              relative overflow-hidden
              rounded-[2.5rem]
              bg-espresso
              px-6 py-14
              text-white
              dark:bg-espresso
              dark:text-white
              sm:px-12 sm:py-20
              lg:px-20
              shadow-2xl
            "
          >
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/10 dark:border-black/10" />
            <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full border border-white/10 dark:border-black/10" />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_400px] lg:items-end">
              <div>
                <div className="mb-4 text-[10px] font-bold tracking-[0.3em] text-primary uppercase">
                  Upper Egypt Heritage Living
                </div>
                <h2
                  className="
                    max-w-4xl
                    text-3xl
                    font-black
                    font-serif
                    leading-tight
                    tracking-[-0.04em]
                    sm:text-5xl
                  "
                >
                  مواسم بتتجدد...
                  <br />
                  <span className="text-primary">وفرحة بتجمع الصعيد كله.</span>
                </h2>
              </div>

              <div>
                <p className="text-sm leading-8 text-white/70 mb-6">
                  الموالد والمواسم في الصعيد مش مجرد احتفالات عابرة، دي دورة حياة كاملة مرتبطة بالأرض والزرع والمحبة والكرم.
                </p>
                <button
                  type="button"
                  onClick={() => setActivePage('map')}
                  className="
                    inline-flex items-center gap-2 rounded-full
                    bg-primary px-6 py-3.5 text-xs font-bold text-black
                    transition-transform hover:scale-105 cursor-pointer shadow-lg
                  "
                >
                  <span>استكشف خريطة محافظات الصعيد</span>
                  <ArrowUpLeft size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventsPage;

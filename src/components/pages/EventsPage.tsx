import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export const EventsPage: React.FC = () => {
  const { navigateToEvent, setActivePage } = useApp();
  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [governorateFilter, setGovernorateFilter] = useState<string>('all');

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const data = await wahApi.getEvents();
        setEvents(data);
      } catch (err) {
        console.warn('Could not load events:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const governorates = Array.from(new Set(events.map((e) => e.governorateName))).filter(Boolean);
  const categories = Array.from(new Set(events.map((e) => e.category))).filter(Boolean);

  const filteredEvents = events.filter((event) => {
    const loc = event.location || event.locationName || '';
    const matchesSearch =
      !searchQuery.trim() ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.governorateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || event.category === categoryFilter;
    const matchesGov = governorateFilter === 'all' || event.governorateName === governorateFilter;
    return matchesSearch && matchesCat && matchesGov;
  });

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
      <header className="relative z-50 border-b border-black/10 dark:border-white/10 backdrop-blur-xl bg-white/70 dark:bg-[#151513]/90">
        <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => setActivePage('home')}
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
            <span className="hidden sm:block">الرئيسية</span>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <div className="text-[9px] font-bold tracking-[0.35em] text-[#9a6a35]">
              WAH
            </div>
            <div className="mt-1 text-sm font-black font-serif">فعاليات الصعيد</div>
          </div>

          <button
            type="button"
            onClick={() => setActivePage('governorates')}
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
            <span className="hidden sm:block">فعاليات المحافظات</span>
            <ArrowUpLeft size={15} />
          </button>
        </div>
      </header>

      {/* =====================================================
          HERO SECTION
      ================================================     */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full border border-black/5 dark:border-white/5" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-[350px] w-[350px] rounded-full border border-black/5 dark:border-white/5" />

        <div className="mx-auto max-w-[1600px] px-5 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-24 lg:px-12 lg:pb-20 lg:pt-32">
          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_420px]">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <Sparkles size={16} className="text-[#9a6a35]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#9a6a35]">
                  Upper Egypt Seasons / Festivals
                </span>
              </div>

              <h1
                className="
                  max-w-5xl
                  text-[14vw]
                  font-black
                  font-serif
                  leading-[0.78]
                  tracking-[-0.08em]
                  sm:text-[11vw]
                  lg:text-[9rem]
                  xl:text-[11rem]
                "
              >
                مواسم
                <br />
                <span className="mr-[8vw] text-[#9a6a35] lg:mr-28">البهجة</span>
              </h1>

              <div className="mt-10 flex max-w-2xl items-start gap-5">
                <div className="mt-2 h-16 w-px bg-[#9a6a35]" />
                <p className="text-sm leading-8 text-black/65 dark:text-white/65 sm:text-base">
                  أجواء الفرحة في الصعيد؛ من ليالي الموالد ولمة الحبايب، لمواسم كسر القصب وعصر العسل، وحلقات التحطيب وتعامد شمس أبو سمبل.
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
                  shadow-lg
                  backdrop-blur-2xl
                  dark:border-white/10
                  dark:bg-[#151513]/90
                  dark:shadow-black/30
                "
              >
                <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full border border-[#9a6a35]/20" />

                <div className="relative">
                  <div className="mb-10 flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-[0.25em] text-black/45 dark:text-white/45">
                      FESTIVALS CALENDAR
                    </span>
                    <Calendar size={18} className="text-[#9a6a35]" />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-5xl font-black tracking-[-0.05em] font-mono">
                        {events.length}
                      </div>
                      <div className="mt-2 text-xs text-black/55 dark:text-white/55 font-bold">
                        فعالية وموسم موثق
                      </div>
                    </div>

                    <div>
                      <div className="text-5xl font-black tracking-[-0.05em] font-mono">
                        {governorates.length}
                      </div>
                      <div className="mt-2 text-xs text-black/55 dark:text-white/55 font-bold">
                        محافظة صعيدية
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex items-center gap-3 border-t border-black/10 pt-5 dark:border-white/10">
                    <div className="h-2 w-2 rounded-full bg-[#9a6a35]" />
                    <span className="text-xs font-bold">
                      دليل مواسم وأفراح الصعيد
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FLOATING FILTERS BAR
      ===================================================== */}
      <section className="relative z-30 mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div
          className="
            rounded-[2rem]
            border border-black/10
            bg-white/75
            p-3
            shadow-[0_20px_70px_rgba(0,0,0,0.08)]
            backdrop-blur-2xl
            dark:border-white/10
            dark:bg-[#151513]/90
            dark:shadow-black/30
          "
        >
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
                placeholder="ابحث عن مولد، موسم حصاد، أو معرض..."
                className="
                  h-12 w-full
                  rounded-xl
                  border border-transparent
                  bg-black/[0.035]
                  pr-11 pl-10
                  text-sm
                  outline-none
                  transition-all
                  placeholder:text-black/35
                  focus:border-[#9a6a35]/40
                  focus:bg-transparent
                  dark:bg-white/[0.04]
                  dark:placeholder:text-white/30
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
            <div className="relative lg:w-60">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="
                  h-12 w-full
                  appearance-none
                  rounded-xl
                  border border-transparent
                  bg-black/[0.035]
                  px-4
                  text-sm font-bold
                  outline-none
                  transition-all
                  focus:border-[#9a6a35]/40
                  dark:bg-white/[0.04]
                  dark:focus:bg-white/[0.06]
                  cursor-pointer
                "
              >
                <option value="all" className="dark:bg-[#151513]">كافة الفعاليات</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="dark:bg-[#151513]">
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="
                  pointer-events-none
                  absolute left-4 top-1/2
                  -translate-y-1/2
                "
              />
            </div>

            {/* Governorate Select */}
            <div className="relative lg:w-60">
              <select
                value={governorateFilter}
                onChange={(e) => setGovernorateFilter(e.target.value)}
                className="
                  h-12 w-full
                  appearance-none
                  rounded-xl
                  border border-transparent
                  bg-black/[0.035]
                  px-4
                  text-sm font-bold
                  outline-none
                  transition-all
                  focus:border-[#9a6a35]/40
                  dark:bg-white/[0.04]
                  dark:focus:bg-white/[0.06]
                  cursor-pointer
                "
              >
                <option value="all" className="dark:bg-[#151513]">كل المحافظات</option>
                {governorates.map((gov) => (
                  <option key={gov} value={gov} className="dark:bg-[#151513]">
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
                "
              />
            </div>

            {/* Result Counter & Clear */}
            <div
              className="
                flex items-center justify-between
                rounded-xl
                bg-[#211d18]
                px-5
                text-white
                dark:bg-white
                dark:text-black
              "
            >
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span className="text-xs font-bold">
                  {filteredEvents.length} فعالية
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
                  className="mr-5 text-[10px] font-bold underline underline-offset-4 cursor-pointer"
                >
                  إعادة
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          EVENTS GRID SECTION (Modern Glassmorphism Cards)
      ================================================     */}
      <section className="mx-auto max-w-[1600px] px-5 pb-24 pt-14 sm:px-8 sm:pt-20 lg:px-12">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="mb-2 text-[10px] font-bold tracking-[0.3em] text-[#9a6a35]">
              UPPER EGYPT SEASONS
            </div>
            <h2 className="text-3xl font-black sm:text-4xl font-serif">مواسم الصعيد الاحتفالية</h2>
          </div>

          <div className="hidden items-center gap-2 text-xs text-black/50 dark:text-white/50 sm:flex">
            <Flame size={14} />
            <span>Cultural Calendar</span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[440px] animate-pulse rounded-[2rem] bg-black/5 dark:bg-white/5"
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
              bg-white/50 dark:bg-[#151513]/50
              backdrop-blur-xl
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
              <Calendar size={24} />
            </div>

            <h3 className="text-xl font-black">لم يتم العثور على فعاليات مطابقة</h3>
            <p className="mt-3 text-sm text-black/60 dark:text-white/60">
              جرب البحث بكلمات أخرى أو تغيير الفلاتر لاستعراض مواسم الصعيد.
            </p>

            {(searchQuery.trim() !== '' || categoryFilter !== 'all' || governorateFilter !== 'all') && (
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
                  bg-[#211d18]
                  px-6 py-3
                  text-xs font-bold text-white
                  dark:bg-white
                  dark:text-black
                  cursor-pointer
                "
              >
                عرض كل الفعاليات
              </button>
            )}
          </div>
        )}

        {/* Events Grid (Refined Design) */}
        {!isLoading && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event, index) => {
              const image =
                event.coverImage ||
                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800';
              const seasonText = event.season || event.dateText || 'موسمي';

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
                    bg-white/75
                    p-6 sm:p-7
                    shadow-lg
                    backdrop-blur-xl
                    transition-all duration-500
                    hover:-translate-y-1.5
                    hover:border-[#9a6a35]
                    hover:shadow-[0_20px_50px_rgba(154,106,53,0.12)]
                    dark:border-white/10
                    dark:bg-[#151513]/90
                    cursor-pointer
                  "
                >
                  <div>
                    {/* Top Image & Badges */}
                    <div className="relative mb-6 h-56 w-full overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
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

                      {/* Category Badge */}
                      <div className="absolute left-3 top-3">
                        {event.category && (
                          <span
                            className="
                              inline-flex
                              rounded-xl
                              border border-white/20
                              bg-black/40
                              px-3 py-1
                              text-[10px]
                              font-bold
                              text-white
                              backdrop-blur-md
                            "
                          >
                            {event.category}
                          </span>
                        )}
                      </div>

                      {/* Governorate Badge */}
                      <div className="absolute right-3 top-3">
                        {event.governorateName && (
                          <span
                            className="
                              inline-flex items-center gap-1
                              rounded-xl
                              border border-white/20
                              bg-black/40
                              px-3 py-1
                              text-[10px]
                              font-bold
                              text-white
                              backdrop-blur-md
                            "
                          >
                            <MapPin size={11} className="text-[#9a6a35]" />
                            {event.governorateName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata (Date / Season) */}
                    <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold text-[#9a6a35]">
                      <Clock size={14} />
                      <span>{seasonText}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-black mb-3 transition-colors group-hover:text-[#9a6a35] font-serif">
                      {event.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm leading-6 text-black/65 dark:text-white/65 line-clamp-3 mb-4">
                      {event.description}
                    </p>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs font-bold">
                    <span className="text-black/50 dark:text-white/50 group-hover:text-[#9a6a35] transition-colors">
                      استكشاف تفاصيل الموسم
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 text-black dark:text-white transition-all duration-300 group-hover:bg-[#9a6a35] group-hover:text-white">
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
          FINAL CTA
      ================================================     */}
      <section className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div
            className="
              relative overflow-hidden
              rounded-[2rem]
              bg-[#211d18]
              px-6 py-14
              text-white
              dark:bg-white
              dark:text-black
              sm:px-12 sm:py-20
              lg:px-20
              shadow-2xl
            "
          >
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/10 dark:border-black/10" />
            <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full border border-white/10 dark:border-black/10" />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_400px] lg:items-end">
              <div>
                <div className="mb-5 text-[10px] font-bold tracking-[0.3em] text-[#9a6a35]">
                  SEASONS & FESTIVALS
                </div>
                <h2
                  className="
                    max-w-4xl
                    text-4xl
                    font-black
                    font-serif
                    leading-tight
                    tracking-[-0.04em]
                    sm:text-6xl
                  "
                >
                  مواسم بتتجدد...
                  <br />
                  <span className="text-[#9a6a35]">وفرحة بتجمع القلوب.</span>
                </h2>
              </div>

              <p className="text-sm leading-8 text-white/70 dark:text-black/70">
                الفعاليات والموالد في الصعيد مش مجرد احتفالات، دي طقوس مجتمعية بتعبر عن الروح والأصل والترابط.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventsPage;
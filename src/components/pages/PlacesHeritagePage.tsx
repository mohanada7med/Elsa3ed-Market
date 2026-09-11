import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { HeritagePlace } from '../../types';
import {
  ArrowLeft,
  ArrowUpLeft,
  Compass,
  Landmark,
  MapPin,
  Search,
  Sparkles,
  X,
  ChevronDown,
} from 'lucide-react';
import { WAHEmptyState } from '../../design-system/WAHEmptyState';

const CATEGORY_MAP: Record<string, string[]> = {
  فرعوني: ['temple', 'tomb', 'pharaonic', 'فرعوني'],
  قبطي: ['monastery', 'coptic', 'قبطي'],
  إسلامي: ['mosque', 'islamic', 'إسلامي'],
  'تراث شعبي': [
    'heritage_village',
    'cultural_center',
    'museum',
    'folk',
    'تراث شعبي',
  ],
  طبيعي: ['nature', 'natural', 'طبيعي'],
};

const CATEGORY_LABELS: Record<string, string> = {
  temple: 'معبد فرعوني',
  tomb: 'مقابر أثرية',
  monastery: 'دير قبطي',
  mosque: 'مسجد أثري',
  museum: 'متحف',
  heritage_village: 'قرية تراثية',
  nature: 'طبيعة',
  cultural_center: 'مركز ثقافي',
  historical: 'معلم تاريخي',
  pharaonic: 'أثر فرعوني',
  coptic: 'تراث قبطي',
  islamic: 'تراث إسلامي',
  folk: 'تراث شعبي',
  natural: 'طبيعة',
};

type CategoryFilter =
  | 'all'
  | 'فرعوني'
  | 'قبطي'
  | 'إسلامي'
  | 'تراث شعبي'
  | 'طبيعي';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1600&q=85';

const getImage = (place: HeritagePlace) =>
  place.coverImage || FALLBACK_IMAGE;

export const PlacesHeritagePage: React.FC = () => {
  const { navigateToPlace, setActivePage } = useApp();

  const cachedPlaces = wahApi.getCachedPlaces();
  const [places, setPlaces] = useState<HeritagePlace[]>(() => (cachedPlaces && cachedPlaces.length > 0 ? cachedPlaces : []));
  const [isLoading, setIsLoading] = useState<boolean>(() => !cachedPlaces || cachedPlaces.length === 0);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>('all');
  const [governorateFilter, setGovernorateFilter] =
    useState('all');

  useEffect(() => {
    let active = true;

    const loadPlaces = async () => {
      if (!cachedPlaces || cachedPlaces.length === 0) {
        setIsLoading(true);
      }

      try {
        const data = await wahApi.getPlaces();

        if (active && Array.isArray(data) && data.length > 0) {
          setPlaces(data);
        }
      } catch (error) {
        console.warn('Could not load places:', error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadPlaces();

    return () => {
      active = false;
    };
  }, []);

  const governorates = useMemo(() => {
    return Array.from(
      new Set(
        places
          .map((place) => place.governorateName)
          .filter(Boolean)
      )
    );
  }, [places]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        places
          .map((place) => place.category)
          .filter(Boolean)
      )
    );
  }, [places]);

  const filteredPlaces = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return places.filter((place) => {
      const title = place.title || '';
      const description =
        place.shortDescription || place.description || '';
      const governorate = place.governorateName || '';

      const matchesSearch =
        !query ||
        title.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        governorate.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === 'all' ||
        place.category === categoryFilter ||
        CATEGORY_MAP[categoryFilter]?.includes(place.category);

      const matchesGovernorate =
        governorateFilter === 'all' ||
        governorate === governorateFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesGovernorate
      );
    });
  }, [
    places,
    searchQuery,
    categoryFilter,
    governorateFilter,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setGovernorateFilter('all');
  };

  const hasFilters =
    searchQuery.trim() !== '' ||
    categoryFilter !== 'all' ||
    governorateFilter !== 'all';

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
            <div className="mt-1 text-sm font-black">أماكن التراث</div>
          </div>

          <button
            onClick={() => setActivePage('map')}
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
            <span className="hidden sm:block">الخريطة</span>
            <Compass size={15} />
          </button>
        </div>
      </header>

      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full border border-black/5 dark:border-white/5" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-[350px] w-[350px] rounded-full border border-black/5 dark:border-white/5" />

        <div className="mx-auto max-w-[1600px] px-5 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-24 lg:px-12 lg:pb-20 lg:pt-32">
          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_420px]">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <Sparkles size={16} className="text-[#9a6a35]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#9a6a35]">
                  Digital Heritage Archive / Places
                </span>
              </div>

              <h1
                className="
                  max-w-5xl
                  text-[14vw]
                  font-black
                  leading-[0.78]
                  tracking-[-0.08em]
                  sm:text-[11vw]
                  lg:text-[9rem]
                  xl:text-[11rem]
                "
              >
                أماكن
                <br />
                <span className="mr-[8vw] text-[#9a6a35] lg:mr-28">بتحكي</span>
              </h1>

              <div className="mt-10 flex max-w-2xl items-start gap-5">
                <div className="mt-2 h-16 w-px bg-[#9a6a35]" />
                <p className="text-sm leading-8 text-black/55 dark:text-white/55 sm:text-base">
                  أماكن الصعيد ليها هيبة وحكاية؛ من المعابد والآثار العتيقة، للأديرة والمساجد، والقرى اللي عايشة على شط النيل.
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
                  bg-white/50
                  p-7
                  backdrop-blur-xl
                  dark:border-white/10
                  dark:bg-white/[0.035]
                "
              >
                <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full border border-[#9a6a35]/20" />

                <div className="relative">
                  <div className="mb-10 flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-[0.25em] text-black/40 dark:text-white/40">
                      ARCHIVE STATS
                    </span>
                    <Landmark size={18} className="text-[#9a6a35]" />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-5xl font-black tracking-[-0.05em]">
                        {places.length}
                      </div>
                      <div className="mt-2 text-xs text-black/45 dark:text-white/45">
                        مكان متوثق
                      </div>
                    </div>

                    <div>
                      <div className="text-5xl font-black tracking-[-0.05em]">
                        {governorates.length}
                      </div>
                      <div className="mt-2 text-xs text-black/45 dark:text-white/45">
                        محافظة
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex items-center gap-3 border-t border-black/10 pt-5 dark:border-white/10">
                    <div className="h-2 w-2 rounded-full bg-[#9a6a35]" />
                    <span className="text-xs font-bold">
                      توثيق بصري لمعالم الصعيد
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
            rounded-[1.5rem]
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="دوّر على مكان أثري، قرية، أو معبد..."
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
                onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
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
                <option value="all">كل الأماكن</option>
                <option value="فرعوني">فرعوني</option>
                <option value="قبطي">قبطي</option>
                <option value="إسلامي">إسلامي</option>
                <option value="تراث شعبي">تراث شعبي</option>
                <option value="طبيعي">طبيعي</option>
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
                <option value="all">كل المحافظات</option>
                {governorates.map((gov) => (
                  <option key={gov} value={gov}>
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
                <Landmark size={14} />
                <span className="text-xs font-bold">
                  {filteredPlaces.length} مكان
                </span>
              </div>

              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="mr-5 text-[10px] font-bold underline underline-offset-4 cursor-pointer"
                >
                  فضّي الفلاتر
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TIMELINE SECTION (حافظنا على نفس الشكل المطلوب تماماً)
      ===================================================== */}
      <section className="px-4 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          {/* Section heading */}
          <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#9a6a35]">
                THE ARCHIVE
              </p>

              <h2 className="text-3xl font-black sm:text-5xl">
                رحلتك بتبدأ من هنا
              </h2>
            </div>

            <div className="text-left text-xs font-bold text-black/40 dark:text-white/40">
              {filteredPlaces.length} مكان طالع معاك
            </div>
          </div>

          {isLoading ? (
            <div className="relative">
              <div className="absolute bottom-0 right-1/2 top-0 hidden w-px bg-black/10 dark:bg-white/10 md:block" />

              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className={`
                    mb-20
                    grid
                    gap-8
                    md:grid-cols-2
                    ${index % 2 === 0
                      ? ''
                      : 'md:[&>div:first-child]:order-2'
                    }
                  `}
                >
                  <div className="aspect-[1.35] animate-pulse rounded-[30px] bg-black/5 dark:bg-white/5" />

                  <div className="space-y-4 py-6">
                    <div className="h-3 w-20 animate-pulse rounded-full bg-black/5 dark:bg-white/5" />
                    <div className="h-8 w-3/4 animate-pulse rounded-lg bg-black/5 dark:bg-white/5" />
                    <div className="h-4 w-full animate-pulse rounded-full bg-black/5 dark:bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="rounded-[32px] border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-[#151513]">
              <WAHEmptyState
                icon={
                  <Landmark className="h-9 w-9 text-[#9a6a35]" />
                }
                title="ملقيناش المكان ده"
                description="جرب كلمة بحث تانية أو غير الفلاتر."
                actionLabel="فضّي الفلاتر"
                onAction={resetFilters}
              />
            </div>
          ) : (
            <div className="relative">
              {/* Central line */}
              <div
                className="
                  absolute
                  bottom-0
                  right-[19px]
                  top-0
                  w-px
                  bg-gradient-to-b
                  from-transparent
                  via-[#9a6a35]/30
                  to-transparent
                  md:right-1/2
                "
              />

              {filteredPlaces.map((place, index) => {
                const isEven = index % 2 === 0;
                const image = getImage(place);
                const categoryLabel = CATEGORY_LABELS[place.category] || place.category || 'معلم أثري';

                return (
                  <article
                    key={place.id || place.slug}
                    className={`
                      relative
                      mb-24
                      last:mb-0
                      md:grid
                      md:grid-cols-2
                      md:gap-20
                    `}
                  >
                    {/* Timeline point */}
                    <div
                      className="
                        absolute
                        right-[7px]
                        top-8
                        z-10
                        flex
                        h-6
                        w-6
                        items-center
                        justify-center
                        rounded-full
                        border-4
                        border-[#eee8dc]
                        bg-[#9a6a35]
                        dark:border-[#0b0b0a]
                        md:right-1/2
                        md:-mr-3
                      "
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>

                    {/* Image */}
                    <div
                      className={`
                        pr-12
                        md:pr-0
                        ${isEven
                          ? 'md:pl-10'
                          : 'md:order-2 md:pr-10'
                        }
                      `}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigateToPlace(place.slug)
                        }
                        className="
                          group
                          block
                          w-full
                          overflow-hidden
                          rounded-[30px]
                          text-right
                          cursor-pointer
                        "
                      >
                        <div className="relative aspect-[1.25] overflow-hidden rounded-[30px] bg-black/5 dark:bg-white/5">
                          <img
                            src={image}
                            alt={place.title}
                            loading={
                              index > 2
                                ? 'lazy'
                                : 'eager'
                            }
                            className="
                              h-full
                              w-full
                              object-cover
                              transition-transform
                              duration-700
                              group-hover:scale-105
                            "
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />

                          <div className="absolute right-5 top-5 flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[9px] font-black text-white backdrop-blur-md">
                              {categoryLabel}
                            </span>
                            {place.visitInfo?.visitStatus && place.visitInfo.visitStatus !== 'open' && (
                              <span
                                className={`rounded-full px-2.5 py-1 text-[9px] font-black shadow-md ${place.visitInfo.visitStatus === 'closed_to_public'
                                    ? 'bg-red-600 text-white'
                                    : place.visitInfo.visitStatus === 'closed_for_restoration'
                                      ? 'bg-amber-600 text-white'
                                      : place.visitInfo.visitStatus === 'public_landmark'
                                        ? 'bg-emerald-600 text-white'
                                        : place.visitInfo.visitStatus === 'active_institution'
                                          ? 'bg-indigo-600 text-white'
                                          : 'bg-orange-600 text-white'
                                  }`}
                              >
                                {place.visitInfo.visitStatus === 'closed_to_public' && 'مقفول للجمهور'}
                                {place.visitInfo.visitStatus === 'closed_for_restoration' && 'مقفول للترميم'}
                                {place.visitInfo.visitStatus === 'public_landmark' && 'ميدان ومعلم عام'}
                                {place.visitInfo.visitStatus === 'active_institution' && 'صرح تعليمي وديني'}
                                {place.visitInfo.visitStatus === 'requires_safari_permit' && 'محمية وسفاري'}
                              </span>
                            )}
                          </div>

                          <div className="absolute bottom-5 right-5 left-5 flex items-end justify-between gap-4">
                            <span className="text-5xl font-black leading-none text-white/25">
                              {String(index + 1).padStart(
                                2,
                                '0'
                              )}
                            </span>

                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black transition group-hover:bg-[#9a6a35] group-hover:text-white">
                              <ArrowLeft className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Content */}
                    <div
                      className={`
                        mt-7
                        pr-12
                        md:mt-0
                        md:flex
                        md:flex-col
                        md:justify-center
                        md:pr-0
                        ${isEven
                          ? 'md:order-2 md:pl-10'
                          : 'md:order-1 md:pr-10'
                        }
                      `}
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-[10px] font-black tracking-[0.25em] text-[#9a6a35]">
                          {String(index + 1).padStart(
                            2,
                            '0'
                          )}
                        </span>

                        <span className="h-px w-8 bg-[#9a6a35]/40" />

                        {place.governorateName && (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-black/60 dark:text-white/60">
                            <MapPin className="h-3 w-3 text-[#9a6a35]" />
                            {place.governorateName}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigateToPlace(place.slug)
                        }
                        className="group text-right cursor-pointer"
                      >
                        <h3 className="text-3xl font-black leading-tight tracking-tight transition group-hover:text-[#9a6a35] sm:text-4xl">
                          {place.title}
                        </h3>

                        {place.historicalEra && (
                          <p className="mt-3 text-xs font-bold text-[#9a6a35]">
                            {place.historicalEra}
                          </p>
                        )}

                        <p className="mt-5 line-clamp-4 max-w-lg text-sm leading-8 text-black/65 dark:text-white/65">
                          {place.shortDescription ||
                            place.description ||
                            'شوف تفاصيل المكان ده وحكايته.'}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigateToPlace(place.slug)
                        }
                        className="
                          mt-7
                          flex
                          w-fit
                          items-center
                          gap-3
                          text-xs
                          font-black
                          transition
                          hover:text-[#9a6a35]
                          cursor-pointer
                        "
                      >
                        اعرف الحكاية

                        <span
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-black/10
                            transition
                            hover:border-[#9a6a35]
                            dark:border-white/10
                          "
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          DISCOVER MAP BANNER
      ===================================================== */}
      {!isLoading && filteredPlaces.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-5 pb-24 sm:px-8 lg:px-12">
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
                  CONTINUE EXPLORING
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
                  شُفت الحكايات...
                  <br />
                  دلوقتي شوف مكانها.
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-sm leading-8 text-white/55">
                  افتح لفة في الصعيد وشوف الأماكن على الخريطة واكتشف اللي حواليها.
                </p>
                <button
                  onClick={() => setActivePage('map')}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs font-bold text-black hover:bg-[#d5a56d] transition-colors cursor-pointer w-fit"
                >
                  <span>افتح الأطلس</span>
                  <ArrowUpLeft size={15} />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="border-t border-black/10 dark:border-white/10 py-12 text-center">
        <div className="mx-auto flex w-full max-w-md items-center gap-3 px-5 mb-4">
          <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-black/50 dark:text-white/50">
            وه — حكاية الصعيد في إيدك
          </span>
          <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-black/40 dark:text-white/40">
          WAH / 2026
        </p>
      </footer>
    </div>
  );
};
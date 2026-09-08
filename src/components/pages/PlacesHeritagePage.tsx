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

const CATEGORIES: {
  key: CategoryFilter;
  label: string;
  number: string;
}[] = [
    { key: 'all', label: 'كل الأماكن', number: '00' },
    { key: 'فرعوني', label: 'فرعوني', number: '01' },
    { key: 'قبطي', label: 'قبطي', number: '02' },
    { key: 'إسلامي', label: 'إسلامي', number: '03' },
    { key: 'تراث شعبي', label: 'تراث شعبي', number: '04' },
    { key: 'طبيعي', label: 'طبيعي', number: '05' },
  ];

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1600&q=85';

const getImage = (place: HeritagePlace) =>
  place.coverImage || FALLBACK_IMAGE;

export const PlacesHeritagePage: React.FC = () => {
  const { navigateToPlace, setActivePage } = useApp();

  const [places, setPlaces] = useState<HeritagePlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>('all');
  const [governorateFilter, setGovernorateFilter] =
    useState('all');

  useEffect(() => {
    let active = true;

    const loadPlaces = async () => {
      setIsLoading(true);

      try {
        const data = await wahApi.getPlaces();

        if (active) {
          setPlaces(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.warn('Could not load places:', error);

        if (active) {
          setPlaces([]);
        }
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
    searchQuery.trim() ||
    categoryFilter !== 'all' ||
    governorateFilter !== 'all';

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        overflow-hidden
        bg-[#F6F1EA]
        text-[#211A16]
        dark:bg-[#100C0A]
        dark:text-[#F5EFE8]
      "
    >
      {/* =========================================================
          HEADER / INTRO
      ========================================================== */}
      <section className="relative border-b border-black/[0.08] dark:border-white/[0.08]">
        {/* Decorative background */}
        <div
          className="
            pointer-events-none
            absolute
            right-[-120px]
            top-[-180px]
            h-[500px]
            w-[500px]
            rounded-full
            bg-[#B24C2B]/10
            blur-[120px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            bottom-[-150px]
            left-[-120px]
            h-[400px]
            w-[400px]
            rounded-full
            bg-[#264653]/10
            blur-[120px]
          "
        />

        <div className="relative mx-auto max-w-[1500px] px-5 pb-14 pt-7 sm:px-8 sm:pb-20 sm:pt-9 lg:px-12 lg:pb-24">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActivePage('home')}
              className="
                group
                flex
                items-center
                gap-3
                text-xs
                font-black
                text-[#75675E]
                transition
                hover:text-[#B24C2B]
                dark:text-[#A89B91]
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
                  border
                  border-black/10
                  bg-white
                  transition
                  group-hover:border-[#B24C2B]/30
                  group-hover:bg-[#B24C2B]
                  group-hover:text-white
                  dark:border-white/10
                  dark:bg-[#191411]
                "
              >
                <ArrowLeft className="h-4 w-4" />
              </span>

              الرئيسية
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden text-[10px] font-black uppercase tracking-[0.25em] text-[#A09288] sm:block">
                WAH / PLACES
              </span>

              <button
                type="button"
                onClick={() => setActivePage('map')}
                className="
                  flex
                  h-10
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-black/10
                  bg-white
                  px-4
                  text-xs
                  font-black
                  transition
                  hover:border-[#B24C2B]/30
                  hover:text-[#B24C2B]
                  dark:border-white/10
                  dark:bg-[#191411]
                "
              >
                <Compass className="h-4 w-4" />
                الخريطة
              </button>
            </div>
          </div>

          {/* Massive title */}
          <div className="mt-20 grid gap-10 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#B24C2B]" />

                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#998B81]">
                  DIGITAL HERITAGE ARCHIVE
                </span>
              </div>

              <h1
                className="
                  max-w-5xl
                  text-[62px]
                  font-black
                  leading-[0.82]
                  tracking-[-0.07em]
                  sm:text-[90px]
                  md:text-[115px]
                  lg:text-[150px]
                "
              >
                أماكن
                <br />

                <span className="text-[#B24C2B]">
                  بتحكي
                </span>
              </h1>

              <div className="mt-8 flex items-start gap-5">
                <div className="mt-2 h-16 w-px bg-[#B24C2B]" />

                <p className="max-w-xl text-sm font-medium leading-8 text-[#766960] dark:text-[#A99C92] sm:text-base">
                  أرشيف بصري لأماكن الصعيد.
                  <br />
                  آثار، عمارة، قرى، طبيعة وحكايات لسه
                  عايشة.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 border-t border-black/10 dark:border-white/10">
              <div className="border-l border-black/10 py-6 pl-5 dark:border-white/10">
                <span className="text-4xl font-black">
                  {places.length}
                </span>

                <p className="mt-2 text-[10px] font-black text-[#8C7E74]">
                  مكان موثق
                </p>
              </div>

              <div className="py-6 pr-5">
                <span className="text-4xl font-black">
                  {governorates.length}
                </span>

                <p className="mt-2 text-[10px] font-black text-[#8C7E74]">
                  محافظة
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FILTER BAR
      ========================================================== */}
      <section className="sticky top-0 z-30 border-b border-black/10 bg-[#F6F1EA]/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#100C0A]/95">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-8 lg:px-12">
          <div className="flex min-h-[74px] items-center gap-3 overflow-x-auto">
            {/* Categories */}
            {CATEGORIES.map((category) => {
              const active =
                categoryFilter === category.key;

              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() =>
                    setCategoryFilter(category.key)
                  }
                  className={`
                    group
                    flex
                    shrink-0
                    items-center
                    gap-2
                    rounded-full
                    px-4
                    py-2.5
                    text-xs
                    font-black
                    transition
                    ${active
                      ? 'bg-[#211A16] text-white dark:bg-white dark:text-[#211A16]'
                      : 'text-[#786B62] hover:bg-white hover:text-[#211A16] dark:text-[#A99C92] dark:hover:bg-[#1A1512] dark:hover:text-white'
                    }
                  `}
                >
                  <span
                    className={`
                      text-[9px]
                      ${active
                        ? 'opacity-60'
                        : 'text-[#B24C2B]'
                      }
                    `}
                  >
                    {category.number}
                  </span>

                  {category.label}
                </button>
              );
            })}

            <div className="mx-1 h-7 w-px shrink-0 bg-black/10 dark:bg-white/10" />

            {/* Search */}
            <div className="relative ml-auto shrink-0">
              <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F8178]" />

              <input
                type="search"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                placeholder="ابحث..."
                className="
                  h-10
                  w-[160px]
                  rounded-full
                  border
                  border-black/10
                  bg-white
                  pr-10
                  pl-9
                  text-xs
                  font-bold
                  outline-none
                  transition
                  focus:w-[220px]
                  focus:border-[#B24C2B]/40
                  dark:border-white/10
                  dark:bg-[#191411]
                  dark:text-white
                  sm:w-[190px]
                "
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          GOVERNORATES
      ========================================================== */}
      {governorates.length > 0 && (
        <section className="border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="mx-auto max-w-[1500px] px-5 py-5 sm:px-8 lg:px-12">
            <div className="flex items-center gap-3 overflow-x-auto">
              <span className="flex shrink-0 items-center gap-2 text-[10px] font-black text-[#998B81]">
                <MapPin className="h-3.5 w-3.5" />
                المحافظة
              </span>

              <button
                type="button"
                onClick={() =>
                  setGovernorateFilter('all')
                }
                className={`
                  shrink-0
                  rounded-full
                  px-3.5
                  py-1.5
                  text-[10px]
                  font-black
                  transition
                  ${governorateFilter === 'all'
                    ? 'bg-[#B24C2B] text-white'
                    : 'text-[#776960] hover:bg-white dark:text-[#A99C92] dark:hover:bg-[#191411]'
                  }
                `}
              >
                الكل
              </button>

              {governorates.map((governorate) => (
                <button
                  key={governorate}
                  type="button"
                  onClick={() =>
                    setGovernorateFilter(governorate)
                  }
                  className={`
                    shrink-0
                    rounded-full
                    px-3.5
                    py-1.5
                    text-[10px]
                    font-black
                    transition
                    ${governorateFilter === governorate
                      ? 'bg-[#B24C2B] text-white'
                      : 'text-[#776960] hover:bg-white dark:text-[#A99C92] dark:hover:bg-[#191411]'
                    }
                  `}
                >
                  {governorate}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          TIMELINE
      ========================================================== */}
      <section className="px-4 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          {/* Section heading */}
          <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#B24C2B]">
                THE ARCHIVE
              </p>

              <h2 className="text-3xl font-black sm:text-5xl">
                رحلتك تبدأ من هنا
              </h2>
            </div>

            <div className="text-left text-xs font-bold text-[#8C7E74]">
              {filteredPlaces.length} نتيجة
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
                  <div className="aspect-[1.35] animate-pulse rounded-[30px] bg-[#E7DDD4] dark:bg-[#211A17]" />

                  <div className="space-y-4 py-6">
                    <div className="h-3 w-20 animate-pulse rounded-full bg-[#E7DDD4] dark:bg-[#211A17]" />

                    <div className="h-8 w-3/4 animate-pulse rounded-lg bg-[#E7DDD4] dark:bg-[#211A17]" />

                    <div className="h-4 w-full animate-pulse rounded-full bg-[#E7DDD4] dark:bg-[#211A17]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="rounded-[32px] border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-[#191411]">
              <WAHEmptyState
                icon={
                  <Landmark className="h-9 w-9" />
                }
                title="ملقيناش المكان ده"
                description="جرب كلمة بحث تانية أو غير الفلاتر."
                actionLabel="إعادة ضبط"
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
                  via-[#B24C2B]/30
                  to-transparent
                  md:right-1/2
                "
              />

              {filteredPlaces.map((place, index) => {
                const isEven = index % 2 === 0;

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
                        border-[#F6F1EA]
                        bg-[#B24C2B]
                        dark:border-[#100C0A]
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
                        "
                      >
                        <div className="relative aspect-[1.25] overflow-hidden rounded-[30px] bg-[#D9CEC4] dark:bg-[#241D19]">
                          <img
                            src={getImage(place)}
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

                          <div className="absolute right-5 top-5">
                            <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[9px] font-black text-white backdrop-blur-md">
                              {CATEGORY_LABELS[
                                place.category
                              ] || place.category}
                            </span>
                          </div>

                          <div className="absolute bottom-5 right-5 left-5 flex items-end justify-between gap-4">
                            <span className="text-5xl font-black leading-none text-white/25">
                              {String(index + 1).padStart(
                                2,
                                '0'
                              )}
                            </span>

                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#201A17] transition group-hover:bg-[#B24C2B] group-hover:text-white">
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
                        <span className="text-[10px] font-black tracking-[0.25em] text-[#B24C2B]">
                          {String(index + 1).padStart(
                            2,
                            '0'
                          )}
                        </span>

                        <span className="h-px w-8 bg-[#B24C2B]/40" />

                        {place.governorateName && (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#8D8077]">
                            <MapPin className="h-3 w-3" />
                            {place.governorateName}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigateToPlace(place.slug)
                        }
                        className="group text-right"
                      >
                        <h3 className="text-3xl font-black leading-tight tracking-tight transition group-hover:text-[#B24C2B] sm:text-4xl">
                          {place.title}
                        </h3>

                        {place.historicalEra && (
                          <p className="mt-3 text-xs font-bold text-[#B24C2B]">
                            {place.historicalEra}
                          </p>
                        )}

                        <p className="mt-5 line-clamp-4 max-w-lg text-sm leading-8 text-[#766960] dark:text-[#A99C92]">
                          {place.shortDescription ||
                            place.description ||
                            'اكتشف تفاصيل هذا المكان وحكايته.'}
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
                          text-[#201A17]
                          transition
                          hover:text-[#B24C2B]
                          dark:text-white
                        "
                      >
                        اقرأ الحكاية

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
                            hover:border-[#B24C2B]
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

      {/* =========================================================
          DISCOVER MAP
      ========================================================== */}
      {!isLoading && filteredPlaces.length > 0 && (
        <section className="px-4 pb-16 sm:px-8 sm:pb-24 lg:px-12">
          <div className="mx-auto max-w-[1500px]">
            <div className="relative overflow-hidden rounded-[38px] bg-[#211A16] px-6 py-16 text-center text-white sm:px-10 sm:py-20">
              {/* Decorative rings */}
              <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-[350px] w-[350px] rounded-full border border-white/5" />

              <div className="pointer-events-none absolute right-[-60px] top-[-60px] h-[270px] w-[270px] rounded-full border border-white/5" />

              <div className="pointer-events-none absolute bottom-[-150px] left-[-100px] h-[350px] w-[350px] rounded-full border border-[#B24C2B]/20" />

              <div className="relative mx-auto max-w-2xl">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <Compass className="h-5 w-5 text-[#D87956]" />
                </span>

                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/35">
                  CONTINUE EXPLORING
                </p>

                <h2 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
                  شُفت الحكايات.
                  <br />
                  <span className="text-white/30">
                    دلوقتي شوف مكانها.
                  </span>
                </h2>

                <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-white/50">
                  افتح أطلس الصعيد وشوف الأماكن على الخريطة
                  واكتشف اللي حواليها.
                </p>

                <button
                  type="button"
                  onClick={() => setActivePage('map')}
                  className="
                    mt-8
                    inline-flex
                    h-12
                    items-center
                    gap-3
                    rounded-full
                    bg-white
                    px-7
                    text-xs
                    font-black
                    text-[#211A16]
                    transition
                    hover:bg-[#B24C2B]
                    hover:text-white
                  "
                >
                  افتح الأطلس
                  <ArrowUpLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          SMALL FOOTER LABEL
      ========================================================== */}
      <div className="border-t border-black/[0.07] dark:border-white/[0.07]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-7 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[#B24C2B]" />

            <span className="text-[10px] font-black text-[#8C7E74]">
              وه — ذاكرة الصعيد الرقمية
            </span>
          </div>

          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#A09288]">
            WAH / 2026
          </span>
        </div>
      </div>
    </main>
  );
};
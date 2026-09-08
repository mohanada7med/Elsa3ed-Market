import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { WahGovernorate } from '../../types';

import {
  ArrowLeft,
  Compass,
  Landmark,
  MapPin,
  Search,
  Sparkles,
  X,
  Eye,
  ChevronDown,
} from 'lucide-react';

import { NubianGeometricPattern } from '../common/NubianGeometricPattern';

export const GovernoratesPage: React.FC = () => {
  const { navigateToGovernorate, setActivePage, wahStats } = useApp();

  const cachedGovs = wahApi.getCachedGovernorates();
  const [governorates, setGovernorates] = useState<WahGovernorate[]>(() => (cachedGovs && cachedGovs.length > 0 ? cachedGovs : []));
  const [isLoading, setIsLoading] = useState<boolean>(() => !cachedGovs || cachedGovs.length === 0);

  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<
    'all' | 'شمال الصعيد' | 'وسط الصعيد' | 'جنوب الصعيد'
  >('all');

  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchGovernorates = async () => {
      try {
        if (!cachedGovs || cachedGovs.length === 0) {
          setIsLoading(true);
        }

        const data = await wahApi.getGovernorates();

        if (active && Array.isArray(data) && data.length > 0) {
          setGovernorates(data);
        }
      } catch (error) {
        console.warn('Could not load governorates:', error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchGovernorates();
    return () => {
      active = false;
    };
  }, []);

  const getRegion = (
    name: string
  ): 'شمال الصعيد' | 'وسط الصعيد' | 'جنوب الصعيد' => {
    if (['الفيوم', 'بني سويف'].includes(name)) {
      return 'شمال الصعيد';
    }

    if (['المنيا', 'أسيوط'].includes(name)) {
      return 'وسط الصعيد';
    }

    return 'جنوب الصعيد';
  };

  const getImage = (gov: WahGovernorate) => {
    return (
      gov.coverImage ||
      'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1800&q=85'
    );
  };

  const filteredGovernorates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return governorates.filter((gov) => {
      const matchesSearch =
        !query ||
        gov.name.toLowerCase().includes(query) ||
        gov.shortIntro.toLowerCase().includes(query) ||
        gov.famousFor.some((item) =>
          item.toLowerCase().includes(query)
        );

      const region = getRegion(gov.name);

      const matchesRegion =
        regionFilter === 'all' || region === regionFilter;

      return matchesSearch && matchesRegion;
    });
  }, [governorates, searchQuery, regionFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setRegionFilter('all');
  };

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#F4EFE8]
        text-[#28211D]
        dark:bg-[#0B0908]
        dark:text-[#FFF8F2]
      "
    >
      {/* =====================================================
          HERO / EXHIBITION COVER
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-[#DED4CA] dark:border-[#302721]">
        <div className="absolute inset-0">
          <NubianGeometricPattern
            variant="tapestry"
            color="#B24C2B"
            opacity={0.055}
            scale={1.15}
          />
        </div>

        <div className="relative mx-auto max-w-[1500px] px-5 pb-14 pt-7 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
          {/* Top line */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#786B61] dark:text-[#9C8E84]">
              <button
                onClick={() => setActivePage('home')}
                className="font-bold transition hover:text-[#B24C2B] dark:hover:text-[#D97857]"
              >
                الرئيسية
              </button>

              <span>/</span>

              <span className="font-black text-[#B24C2B] dark:text-[#D97857]">
                محافظات الصعيد
              </span>
            </div>

            <button
              onClick={() => setActivePage('map')}
              className="
                group
                flex
                items-center
                gap-2
                rounded-full
                border
                border-[#D8CDC3]
                bg-white/70
                px-4
                py-2.5
                text-xs
                font-black
                text-[#B24C2B]
                backdrop-blur-md
                transition
                hover:border-[#B24C2B]
                hover:bg-[#B24C2B]
                hover:text-white
                dark:border-[#3A2F29]
                dark:bg-[#181310]/70
                dark:text-[#D97857]
                dark:hover:bg-[#D97857]
                dark:hover:text-white
              "
            >
              <Compass className="h-4 w-4" />
              <span className="hidden sm:block">
                الخريطة التفاعلية
              </span>
            </button>
          </div>

          {/* Hero */}
          <div className="mx-auto mt-20 max-w-5xl text-center lg:mt-28">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DCCFC4] bg-white/70 px-4 py-2 text-[10px] font-black tracking-wide text-[#8A796E] backdrop-blur dark:border-[#3B3029] dark:bg-[#191411]/70 dark:text-[#B6A79D]">
              <Landmark className="h-3.5 w-3.5 text-[#B24C2B] dark:text-[#D97857]" />
              WAH CULTURAL ARCHIVE
            </div>

            <h1 className="mt-7 text-6xl font-black leading-[0.9] tracking-[-0.08em] sm:text-8xl lg:text-[130px]">
              <span className="block">الصعيد</span>

              <span className="mt-2 block text-[#B24C2B] dark:text-[#D97857]">
                مش محافظة.
              </span>

              <span className="mt-2 block text-[#B7AAA0]/50 dark:text-[#554942]">
                دي حكايات.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-sm leading-8 text-[#756960] dark:text-[#A99B91] sm:text-base">
              معرض بصري لمحافظات صعيد مصر؛ أماكنها، ناسها،
              صنايعها، أكلها، وحكاياتها اللي لسه عايشة.
            </p>
          </div>

          {/* Bottom information */}
          <div className="mt-16 grid border-y border-[#DDD2C8] dark:border-[#302721] sm:grid-cols-3">
            <Stat
              number={governorates.length || wahStats?.governoratesCount || 8}
              label="محافظات موثقة"
            />

            <Stat
              number={wahStats?.storiesCount ?? '—'}
              label="حكايات ومرويات موثقة"
            />

            <Stat
              number={wahStats?.placesCount ?? '—'}
              label="معالم ومواقع تراثية"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          FILTER DESK
      ====================================================== */}

      <section className="sticky top-0 z-30 border-b border-[#DDD2C8] bg-[#F4EFE8]/90 backdrop-blur-2xl dark:border-[#302721] dark:bg-[#0B0908]/90">
        <div className="mx-auto max-w-[1500px] px-5 py-3 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-[380px]">
              <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C7E75]" />

              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="دور على محافظة..."
                className="
                  h-11
                  w-full
                  rounded-full
                  border
                  border-[#D9CEC4]
                  bg-white/80
                  pr-11
                  pl-10
                  text-xs
                  font-bold
                  text-[#28211D]
                  outline-none
                  transition
                  placeholder:text-[#9C8E84]
                  focus:border-[#B24C2B]
                  dark:border-[#392E28]
                  dark:bg-[#181310]
                  dark:text-white
                  dark:focus:border-[#D97857]
                "
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#85776E] transition hover:bg-[#EEE7DF] dark:hover:bg-[#29201C]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                {
                  value: 'all' as const,
                  label: 'الكل',
                },
                {
                  value: 'شمال الصعيد' as const,
                  label: 'شمال الصعيد',
                },
                {
                  value: 'وسط الصعيد' as const,
                  label: 'وسط الصعيد',
                },
                {
                  value: 'جنوب الصعيد' as const,
                  label: 'جنوب الصعيد',
                },
              ].map((item) => {
                const active = regionFilter === item.value;

                return (
                  <button
                    key={item.value}
                    onClick={() => setRegionFilter(item.value)}
                    className={`
                      whitespace-nowrap
                      rounded-full
                      px-4
                      py-2.5
                      text-[10px]
                      font-black
                      transition-all
                      ${active
                        ? 'bg-[#28211D] text-white dark:bg-[#FFF8F2] dark:text-[#191310]'
                        : 'bg-white/70 text-[#756960] hover:bg-white hover:text-[#B24C2B] dark:bg-[#181310] dark:text-[#A99B91] dark:hover:bg-[#211A17] dark:hover:text-[#D97857]'
                      }
                    `}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Count */}
            <div className="hidden shrink-0 items-center gap-2 text-[10px] font-black text-[#8A7D74] dark:text-[#887A71] lg:flex">
              <span className="text-[#B24C2B] dark:text-[#D97857]">
                {filteredGovernorates.length}
              </span>
              نتيجة
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          EXHIBITION WALL
      ====================================================== */}

      <main className="mx-auto max-w-[1500px] px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
        {isLoading ? (
          <LoadingWall />
        ) : filteredGovernorates.length === 0 ? (
          <EmptyState onReset={clearFilters} />
        ) : (
          <>
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-[9px] font-black tracking-[0.3em] text-[#B24C2B] dark:text-[#D97857]">
                  EXHIBITION / 01
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] sm:text-5xl">
                  جدار المحافظات
                </h2>
              </div>

              <div className="hidden items-center gap-2 text-[9px] font-bold text-[#92847A] sm:flex">
                <span>مرر</span>
                <ChevronDown className="h-3 w-3" />
              </div>
            </div>

            {/* Asymmetric Masonry-style layout */}
            <div className="grid auto-rows-[180px] grid-cols-1 gap-4 sm:grid-cols-2 sm:auto-rows-[170px] lg:grid-cols-12 lg:auto-rows-[90px]">
              {filteredGovernorates.map((gov, index) => {
                const region = getRegion(gov.name);

                const layout = getPosterLayout(index);

                const isHovered = hoveredSlug === gov.slug;

                return (
                  <button
                    key={gov.id}
                    onClick={() =>
                      navigateToGovernorate(gov.slug)
                    }
                    onMouseEnter={() =>
                      setHoveredSlug(gov.slug)
                    }
                    onMouseLeave={() => setHoveredSlug(null)}
                    className={`
                      group
                      relative
                      overflow-hidden
                      rounded-[28px]
                      bg-[#201813]
                      text-right
                      shadow-sm
                      transition-all
                      duration-500
                      hover:z-10
                      hover:shadow-2xl
                      hover:shadow-black/20
                      ${layout}
                    `}
                  >
                    {/* Image */}
                    <img
                      src={getImage(gov)}
                      alt={`محافظة ${gov.name}`}
                      className={`
                        absolute
                        inset-0
                        h-full
                        w-full
                        object-cover
                        transition
                        duration-700
                        ${isHovered
                          ? 'scale-110 saturate-110'
                          : 'scale-100'
                        }
                      `}
                    />

                    {/* Overlay */}
                    <div
                      className={`
                        absolute
                        inset-0
                        transition-all
                        duration-500
                        ${isHovered
                          ? 'bg-gradient-to-t from-black/95 via-black/40 to-black/10'
                          : 'bg-gradient-to-t from-black/90 via-black/30 to-black/5'
                        }
                      `}
                    />

                    {/* Decorative border */}
                    <div
                      className={`
                        absolute
                        inset-3
                        rounded-[22px]
                        border
                        transition
                        duration-500
                        ${isHovered
                          ? 'border-white/40'
                          : 'border-white/10'
                        }
                      `}
                    />

                    {/* Number */}
                    <div className="absolute right-6 top-6">
                      <span
                        className={`
                          text-5xl
                          font-black
                          leading-none
                          tracking-[-0.08em]
                          transition
                          duration-500
                          ${isHovered
                            ? 'text-white/70'
                            : 'text-white/25'
                          }
                        `}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Region */}
                    <div className="absolute left-6 top-6">
                      <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[9px] font-bold text-white/80 backdrop-blur-md">
                        {region}
                      </span>
                    </div>

                    {/* Poster content */}
                    <div className="absolute bottom-0 right-0 left-0 p-6 sm:p-7">
                      <div
                        className={`
                          mb-2
                          flex
                          items-center
                          gap-2
                          text-[9px]
                          font-bold
                          text-white/55
                          transition
                          duration-500
                          ${isHovered
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-2 opacity-0'
                          }
                        `}
                      >
                        <MapPin className="h-3 w-3" />

                        {gov.capitalCity
                          ? `العاصمة: ${gov.capitalCity}`
                          : 'صعيد مصر'}
                      </div>

                      <h3
                        className="
                          text-3xl
                          font-black
                          tracking-[-0.04em]
                          text-white
                          sm:text-4xl
                        "
                      >
                        {gov.name}
                      </h3>

                      <p
                        className={`
                          mt-2
                          line-clamp-2
                          max-w-lg
                          text-[11px]
                          leading-6
                          text-white/60
                          transition-all
                          duration-500
                          ${isHovered
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-3 opacity-0'
                          }
                        `}
                      >
                        {gov.shortIntro}
                      </p>

                      <div
                        className={`
                          mt-4
                          flex
                          items-center
                          gap-2
                          text-[10px]
                          font-black
                          text-[#F2B19C]
                          transition-all
                          duration-500
                          ${isHovered
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-3 opacity-0'
                          }
                        `}
                      >
                        افتح المعرض
                        <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-1" />
                      </div>
                    </div>

                    {/* Active glow */}
                    <div
                      className={`
                        absolute
                        bottom-0
                        right-0
                        h-1
                        bg-[#D97857]
                        transition-all
                        duration-500
                        ${isHovered
                          ? 'left-0'
                          : 'left-full'
                        }
                      `}
                    />
                  </button>
                );
              })}
            </div>

            {/* =================================================
                FEATURE STRIP
            ================================================== */}

            <section className="mt-20 overflow-hidden rounded-[36px] border border-[#DED4CA] bg-white dark:border-[#332923] dark:bg-[#17120F]">
              <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
                <div className="relative min-h-[360px] overflow-hidden bg-[#211914]">
                  <img
                    src={
                      filteredGovernorates[0]?.coverImage ||
                      'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1600'
                    }
                    alt="WAH"
                    className="absolute inset-0 h-full w-full object-cover opacity-70"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />

                  <div className="absolute bottom-7 right-7 left-7">
                    <p className="text-[9px] font-black tracking-[0.3em] text-[#D97857]">
                      EDITOR'S PICK
                    </p>

                    <h3 className="mt-3 text-4xl font-black text-white">
                      {filteredGovernorates[0]?.name}
                    </h3>
                  </div>
                </div>

                <div className="relative flex flex-col justify-between p-7 sm:p-10">
                  <div>
                    <Sparkles className="h-7 w-7 text-[#B24C2B] dark:text-[#D97857]" />

                    <h3 className="mt-5 text-2xl font-black leading-tight sm:text-3xl">
                      كل محافظة باب.
                      <br />
                      وإنت لسه بتفتحه.
                    </h3>

                    <p className="mt-4 text-sm leading-8 text-[#766A61] dark:text-[#A99B91]">
                      ادخل جوه المحافظة واكتشف معالمها، صنايعها،
                      حكاياتها، أهلها، أكلها وسوقها.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      navigateToGovernorate(
                        filteredGovernorates[0].slug
                      )
                    }
                    className="
                      group
                      mt-8
                      flex
                      w-fit
                      items-center
                      gap-3
                      rounded-full
                      bg-[#28211D]
                      px-6
                      py-3.5
                      text-xs
                      font-black
                      text-white
                      transition
                      hover:-translate-y-1
                      hover:bg-[#B24C2B]
                      dark:bg-[#FFF8F2]
                      dark:text-[#211914]
                      dark:hover:bg-[#D97857]
                      dark:hover:text-white
                    "
                  >
                    اكتشف المحافظة
                    <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* =====================================================
          FOOTER CTA
      ====================================================== */}

      <section className="border-t border-[#DDD2C8] bg-[#EAE2D9] dark:border-[#302721] dark:bg-[#110E0C]">
        <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="relative overflow-hidden rounded-[38px] bg-[#28211D] px-6 py-14 text-white sm:px-10 lg:px-16">
            <div className="absolute inset-0 opacity-10">
              <NubianGeometricPattern
                variant="tapestry"
                color="#D97857"
                opacity={0.5}
                scale={1.1}
              />
            </div>

            <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-[9px] font-black tracking-[0.3em] text-[#D97857]">
                  WAH / EXPLORE MORE
                </p>

                <h2 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-[-0.05em] sm:text-6xl">
                  المحافظة مجرد
                  <br />
                  <span className="text-[#D97857]">
                    بداية الحكاية.
                  </span>
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-8 text-white/50">
                  افتح أي محافظة وشوف إيه اللي مخبي جوه تفاصيلها.
                </p>
              </div>

              <button
                onClick={() => setActivePage('map')}
                className="
                  group
                  flex
                  w-fit
                  items-center
                  gap-3
                  rounded-full
                  bg-white
                  px-7
                  py-4
                  text-xs
                  font-black
                  text-[#28211D]
                  transition
                  hover:-translate-y-1
                  hover:bg-[#D97857]
                  hover:text-white
                "
              >
                <Compass className="h-4 w-4" />
                استكشف الخريطة
                <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* =========================================================
   STAT
========================================================= */

const Stat: React.FC<{
  number: string | number;
  label: string;
}> = ({ number, label }) => {
  return (
    <div className="border-l border-[#DDD2C8] px-5 py-7 first:border-l-0 dark:border-[#302721] sm:px-8">
      <div className="text-3xl font-black tracking-[-0.05em] sm:text-4xl">
        {number}
      </div>

      <div className="mt-1 text-[9px] font-bold text-[#8B7D73] dark:text-[#8E8077]">
        {label}
      </div>
    </div>
  );
};

/* =========================================================
   POSTER LAYOUT
========================================================= */

const getPosterLayout = (index: number): string => {
  const layouts = [
    'sm:col-span-2 lg:col-span-7 lg:row-span-5',
    'sm:col-span-1 lg:col-span-5 lg:row-span-4',
    'sm:col-span-1 lg:col-span-5 lg:row-span-5',
    'sm:col-span-1 lg:col-span-4 lg:row-span-4',
    'sm:col-span-1 lg:col-span-4 lg:row-span-5',
    'sm:col-span-2 lg:col-span-4 lg:row-span-5',
    'sm:col-span-1 lg:col-span-6 lg:row-span-5',
    'sm:col-span-1 lg:col-span-6 lg:row-span-4',
  ];

  return layouts[index % layouts.length];
};

/* =========================================================
   LOADING
========================================================= */

const LoadingWall: React.FC = () => {
  return (
    <div className="grid auto-rows-[180px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[90px]">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className={`
            animate-pulse
            rounded-[28px]
            bg-[#DED5CC]
            dark:bg-[#191411]
            ${getPosterLayout(index)}
          `}
        />
      ))}
    </div>
  );
};

/* =========================================================
   EMPTY
========================================================= */

const EmptyState: React.FC<{
  onReset: () => void;
}> = ({ onReset }) => {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[36px] border border-dashed border-[#D4C8BE] bg-white/60 px-6 text-center dark:border-[#3A2F29] dark:bg-[#17120F]">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EEE6DE] dark:bg-[#241D19]">
        <Search className="h-7 w-7 text-[#B24C2B] dark:text-[#D97857]" />
      </div>

      <h3 className="mt-6 text-xl font-black">
        مفيش محافظة بالشكل ده
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-7 text-[#766A61] dark:text-[#A99B91]">
        جرب تغير كلمة البحث أو ارجع واعرض كل محافظات الصعيد.
      </p>

      <button
        onClick={onReset}
        className="
          mt-6
          rounded-full
          bg-[#28211D]
          px-6
          py-3
          text-xs
          font-black
          text-white
          transition
          hover:bg-[#B24C2B]
          dark:bg-[#FFF8F2]
          dark:text-[#211914]
          dark:hover:bg-[#D97857]
          dark:hover:text-white
        "
      >
        عرض الكل
      </button>
    </div>
  );
};

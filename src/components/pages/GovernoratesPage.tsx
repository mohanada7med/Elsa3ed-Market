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
      className="min-h-screen overflow-x-hidden bg-[#eee8dc] text-[#211d18] dark:bg-[#0b0b0a] dark:text-[#f5f0e7]"
    >
      {/* =====================================================
          HERO / EXHIBITION COVER
      ====================================================== */}
      <section className="relative overflow-hidden border-b border-black/10 dark:border-white/10">
        <div className="absolute inset-0">
          <NubianGeometricPattern
            variant="tapestry"
            color="#9a6a35"
            opacity={0.06}
            scale={1.15}
          />
        </div>

        <div className="relative mx-auto max-w-[1600px] px-5 pb-14 pt-7 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
          {/* Top line */}
          <div className="flex items-center justify-between gap-4">
            <nav className="flex items-center gap-2 text-xs text-[#211d18]/60 dark:text-[#f5f0e7]/60 font-medium">
              <button
                type="button"
                onClick={() => setActivePage('home')}
                className="hover:text-[#9a6a35] dark:hover:text-[#d5a56d] transition-colors cursor-pointer"
              >
                الرئيسية
              </button>
              <span>/</span>
              <span className="font-bold text-[#9a6a35] dark:text-[#d5a56d]">
                محافظات الصعيد
              </span>
            </nav>

            <button
              type="button"
              onClick={() => setActivePage('map')}
              className="group flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-[#151513]/70 px-4 py-2 text-xs font-black text-[#9a6a35] dark:text-[#d5a56d] backdrop-blur-md transition hover:bg-[#9a6a35] hover:text-white dark:hover:bg-[#9a6a35] dark:hover:text-white cursor-pointer"
            >
              <Compass className="h-4 w-4" />
              <span className="hidden sm:block">
                الخريطة التفاعلية
              </span>
            </button>
          </div>

          {/* Hero */}
          <div className="mx-auto mt-16 max-w-5xl text-center lg:mt-24">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#9a6a35]/20 bg-[#9a6a35]/10 px-4 py-1.5 text-xs font-black text-[#9a6a35] dark:text-[#d5a56d] backdrop-blur">
              <Landmark className="h-3.5 w-3.5" />
              <span>دليل محافظات صعيد مصر</span>
            </div>

            <h1 className="mt-7 text-6xl font-black font-serif leading-[0.95] tracking-[-0.05em] sm:text-8xl lg:text-[110px]">
              <span className="block">الصعيد</span>
              <span className="mt-2 block text-[#9a6a35] dark:text-[#d5a56d]">
                مش محافظة.
              </span>
              <span className="mt-2 block text-[#211d18]/40 dark:text-[#f5f0e7]/30">
                دي حكايات.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-sm leading-8 text-[#211d18]/70 dark:text-[#f5f0e7]/70 sm:text-base font-light">
              دليل لمحافظات الصعيد؛ هتكتشف فيه أماكنها، ناسها،
              صنايعها، أكلها، وحكاياتها اللي بتتنقل من جيل لجيل.
            </p>
          </div>

          {/* Bottom information */}
          <div className="mt-16 grid border-y border-black/10 dark:border-white/10 sm:grid-cols-3">
            <Stat
              number={governorates.length || wahStats?.governoratesCount || 8}
              label="محافظات متوثقة"
            />
            <Stat
              number={wahStats?.storiesCount ?? '—'}
              label="حكايات وسير متوثقة"
            />
            <Stat
              number={wahStats?.placesCount ?? '—'}
              label="معالم وأماكن أثرية"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          FILTER DESK
      ====================================================== */}
      <section className="sticky top-0 z-30 border-b border-black/10 dark:border-white/10 bg-[#eee8dc]/90 dark:bg-[#0b0b0a]/90 backdrop-blur-2xl">
        <div className="mx-auto max-w-[1600px] px-5 py-3.5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-[380px]">
              <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#211d18]/50 dark:text-[#f5f0e7]/50" />

              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="دوّر على محافظة أو مكان..."
                className="h-11 w-full rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 pr-11 pl-10 text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] outline-none transition placeholder:text-[#211d18]/40 dark:placeholder:text-[#f5f0e7]/40 focus:border-[#9a6a35]"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#211d18]/50 dark:text-[#f5f0e7]/50 hover:text-[#9a6a35] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                { value: 'all' as const, label: 'الكل' },
                { value: 'شمال الصعيد' as const, label: 'شمال الصعيد' },
                { value: 'وسط الصعيد' as const, label: 'وسط الصعيد' },
                { value: 'جنوب الصعيد' as const, label: 'جنوب الصعيد' },
              ].map((item) => {
                const active = regionFilter === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRegionFilter(item.value)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black transition-all cursor-pointer ${active
                        ? 'bg-[#211d18] text-white dark:bg-white dark:text-black shadow-sm'
                        : 'bg-black/5 dark:bg-white/5 text-[#211d18]/70 dark:text-[#f5f0e7]/70 hover:bg-[#9a6a35] hover:text-white'
                      }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Count */}
            <div className="hidden shrink-0 items-center gap-1.5 text-xs font-black text-[#211d18]/60 dark:text-[#f5f0e7]/60 lg:flex">
              <span className="text-[#9a6a35] dark:text-[#d5a56d]">
                {filteredGovernorates.length}
              </span>
              <span>محافظات طالعة معاك</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          EXHIBITION WALL
      ====================================================== */}
      <main className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        {isLoading ? (
          <LoadingWall />
        ) : filteredGovernorates.length === 0 ? (
          <EmptyState onReset={clearFilters} />
        ) : (
          <>
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black tracking-[0.2em] text-[#9a6a35] dark:text-[#d5a56d]">
                  EXHIBITION / 01
                </p>
                <h2 className="mt-2 text-3xl font-black font-serif sm:text-5xl">
                  محافظات الصعيد
                </h2>
              </div>

              <div className="hidden items-center gap-2 text-xs font-bold text-[#211d18]/50 dark:text-[#f5f0e7]/50 sm:flex">
                <span>انزل وتفرج</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Asymmetric Masonry-style layout */}
            <div className="grid auto-rows-[240px] grid-cols-1 gap-5 sm:grid-cols-2 sm:auto-rows-[180px] lg:grid-cols-12 lg:auto-rows-[95px]">
              {filteredGovernorates.map((gov, index) => {
                const region = getRegion(gov.name);
                const layout = getPosterLayout(index);
                const isHovered = hoveredSlug === gov.slug;

                return (
                  <button
                    key={gov.id}
                    type="button"
                    onClick={() => navigateToGovernorate(gov.slug)}
                    onMouseEnter={() => setHoveredSlug(gov.slug)}
                    onMouseLeave={() => setHoveredSlug(null)}
                    className={`group relative overflow-hidden rounded-[2rem] bg-[#151513] text-right shadow-md border border-black/10 dark:border-white/10 transition-all duration-500 hover:z-10 hover:shadow-2xl cursor-pointer ${layout}`}
                  >
                    {/* Image */}
                    <img
                      src={getImage(gov)}
                      alt={`محافظة ${gov.name}`}
                      className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${isHovered ? 'scale-108 saturate-110' : 'scale-100'
                        }`}
                    />

                    {/* Overlay */}
                    <div
                      className={`absolute inset-0 transition-all duration-500 ${isHovered
                          ? 'bg-gradient-to-t from-black/95 via-black/45 to-black/20'
                          : 'bg-gradient-to-t from-black/90 via-black/35 to-black/10'
                        }`}
                    />

                    {/* Decorative border */}
                    <div
                      className={`absolute inset-3 rounded-[1.5rem] border transition duration-500 ${isHovered ? 'border-white/40' : 'border-white/10'
                        }`}
                    />

                    {/* Number */}
                    <div className="absolute right-6 top-6">
                      <span
                        className={`text-5xl font-black font-mono leading-none tracking-tight transition duration-500 ${isHovered ? 'text-white/80' : 'text-white/30'
                          }`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Region */}
                    <div className="absolute left-6 top-6">
                      <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                        {region}
                      </span>
                    </div>

                    {/* Poster content */}
                    <div className="absolute bottom-0 right-0 left-0 p-6 sm:p-7">
                      <div
                        className={`mb-2 flex items-center gap-2 text-xs font-bold text-white/70 transition duration-500 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                          }`}
                      >
                        <MapPin className="h-3.5 w-3.5 text-[#d5a56d]" />
                        <span>{gov.capitalCity ? `العاصمة: ${gov.capitalCity}` : 'صعيد مصر'}</span>
                      </div>

                      <h3 className="text-3xl font-black font-serif text-white sm:text-4xl">
                        {gov.name}
                      </h3>

                      <p
                        className={`mt-2 line-clamp-2 max-w-lg text-xs leading-relaxed text-white/80 transition-all duration-500 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                          }`}
                      >
                        {gov.shortIntro}
                      </p>

                      <div
                        className={`mt-4 flex items-center gap-2 text-xs font-black text-[#d5a56d] transition-all duration-500 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                          }`}
                      >
                        <span>افتح وتفرج على المحافظة</span>
                        <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1.5" />
                      </div>
                    </div>

                    {/* Active bottom glow strip */}
                    <div
                      className={`absolute bottom-0 right-0 h-1.5 bg-[#9a6a35] transition-all duration-500 ${isHovered ? 'left-0' : 'left-full'
                        }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* =================================================
                FEATURE STRIP
            ================================================== */}
            {filteredGovernorates.length > 0 && (
              <section className="mt-16 overflow-hidden rounded-[2rem] border border-black/10 dark:border-white/10 bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl shadow-xl">
                <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="relative min-h-[360px] overflow-hidden bg-stone-900">
                    <img
                      src={
                        filteredGovernorates[0]?.coverImage ||
                        'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1600'
                      }
                      alt={filteredGovernorates[0]?.name}
                      className="absolute inset-0 h-full w-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />

                    <div className="absolute bottom-7 right-7 left-7">
                      <p className="text-[10px] font-black tracking-[0.2em] text-[#d5a56d]">
                        EDITOR'S PICK
                      </p>
                      <h3 className="mt-2 text-4xl font-black font-serif text-white">
                        {filteredGovernorates[0]?.name}
                      </h3>
                    </div>
                  </div>

                  <div className="relative flex flex-col justify-between p-7 sm:p-10">
                    <div>
                      <Sparkles className="h-8 w-8 text-[#9a6a35] dark:text-[#d5a56d]" />
                      <h3 className="mt-5 text-2xl font-black font-serif leading-tight sm:text-3xl text-[#211d18] dark:text-[#f5f0e7]">
                        كل محافظة باب..
                        <br />
                        وإنت لسه بتفتحه.
                      </h3>

                      <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#211d18]/70 dark:text-[#f5f0e7]/70">
                        ادخل جوه المحافظة وشوف معالمها، صنايعها،
                        حكاياتها، ناسها، أكلها وسوقها.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigateToGovernorate(filteredGovernorates[0].slug)}
                      className="group mt-8 flex w-fit items-center gap-3 rounded-[1.25rem] bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] px-7 py-3.5 text-xs font-black transition cursor-pointer shadow-lg hover:scale-[1.02]"
                    >
                      <span>ادخل المحافظة</span>
                      <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
                    </button>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* =====================================================
          FOOTER CTA
      ====================================================== */}
      <section className="border-t border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 py-14 pb-24 sm:pb-14">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#211d18] px-6 py-14 text-[#f5f0e7] sm:px-10 lg:px-16 shadow-xl border border-black/10 dark:border-white/10">
            <div className="absolute inset-0 opacity-10">
              <NubianGeometricPattern
                variant="tapestry"
                color="#9a6a35"
                opacity={0.5}
                scale={1.1}
              />
            </div>

            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-[10px] font-black tracking-[0.2em] text-[#d5a56d]">
                  WAH / EXPLORE MORE
                </p>

                <h2 className="mt-4 max-w-3xl text-3xl sm:text-5xl font-black font-serif leading-tight">
                  المحافظة مجرد
                  <br />
                  <span className="text-[#d5a56d]">
                    بداية الحكاية.
                  </span>
                </h2>

                <p className="mt-4 max-w-xl text-xs sm:text-sm leading-relaxed text-[#f5f0e7]/70">
                  افتح أي محافظة وشوف إيه اللي مستخبي جوه تفاصيلها وصنايعها الأصيلة.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActivePage('map')}
                className="group flex w-fit items-center gap-3 rounded-[1.25rem] bg-[#211d18] text-white dark:bg-white dark:text-[#211d18] hover:bg-[#9a6a35] dark:hover:bg-[#9a6a35] dark:hover:text-white px-7 py-4 text-xs font-black transition-all duration-300 cursor-pointer shadow-lg hover:scale-[1.02]"              >
                <Compass className="h-4 w-4" />
                <span>افتح الخريطة</span>
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
    <div className="border-l border-black/10 dark:border-white/10 px-5 py-6 first:border-l-0 sm:px-8 text-center sm:text-right">
      <div className="text-3xl font-black font-mono tracking-tight sm:text-4xl text-[#211d18] dark:text-[#f5f0e7]">
        {number}
      </div>
      <div className="mt-1 text-[11px] font-bold text-[#211d18]/60 dark:text-[#f5f0e7]/60">
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
    <div className="grid auto-rows-[240px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[95px]">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse rounded-[2rem] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 ${getPosterLayout(index)}`}
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
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-black/15 dark:border-white/15 bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl px-6 text-center shadow-lg">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#9a6a35]/10">
        <Search className="h-8 w-8 text-[#9a6a35]" />
      </div>

      <h3 className="mt-6 text-2xl font-black font-serif text-[#211d18] dark:text-[#f5f0e7]">
        مفيش محافظة بالشكل ده
      </h3>

      <p className="mt-2 max-w-sm text-xs sm:text-sm leading-relaxed text-[#211d18]/70 dark:text-[#f5f0e7]/70">
        جرّب تغيّر كلمة البحث أو ارجع وشوف كل محافظات الصعيد.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 rounded-[1.25rem] bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] px-7 py-3.5 text-xs font-black transition cursor-pointer shadow-lg"
      >
        شوف كل المحافظات
      </button>
    </div>
  );
};

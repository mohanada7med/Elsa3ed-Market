import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { wahApi } from '../../services/api';
import { WahStory } from '../../types';
import {
  ArrowLeft,
  ArrowUpLeft,
  BookOpen,
  ChevronDown,
  MapPin,
  Search,
  Sparkles,
  X,
  Feather,
} from 'lucide-react';
import { WAHEmptyState } from '../../design-system/WAHEmptyState';

export const StoriesPage: React.FC = () => {
  const { navigateToStory, setActivePage } = useApp();

  const [stories, setStories] = useState<WahStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [governorateFilter, setGovernorateFilter] = useState<string>('all');

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);

      try {
        const data = await wahApi.getStories();
        setStories(data);
      } catch (err) {
        console.warn('Could not load stories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []);

  const governorates = useMemo(
    () =>
      Array.from(
        new Set(
          stories
            .map((story) => story.governorateName)
            .filter(Boolean)
        )
      ),
    [stories]
  );

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          stories
            .map((story) => story.category)
            .filter(Boolean)
        )
      ),
    [stories]
  );

  const filteredStories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return stories.filter((story) => {
      const matchesSearch =
        !query ||
        story.title?.toLowerCase().includes(query) ||
        story.excerpt?.toLowerCase().includes(query) ||
        story.content?.toLowerCase().includes(query) ||
        story.governorateName?.toLowerCase().includes(query);

      const matchesCat =
        categoryFilter === 'all' ||
        story.category === categoryFilter;

      const matchesGov =
        governorateFilter === 'all' ||
        story.governorateName === governorateFilter;

      return matchesSearch && matchesCat && matchesGov;
    });
  }, [
    stories,
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
            <div className="mt-1 text-sm font-black">وه بيحكي</div>
          </div>

          <button
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
            <span className="hidden sm:block">حكايات المحافظات</span>
            <ArrowUpLeft size={15} />
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
                  Oral Heritage / Upper Egypt
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
                وه
                <br />
                <span className="mr-[8vw] text-[#9a6a35] lg:mr-28">بيحكي</span>
              </h1>

              <div className="mt-10 flex max-w-2xl items-start gap-5">
                <div className="mt-2 h-16 w-px bg-[#9a6a35]" />
                <p className="text-sm leading-8 text-black/55 dark:text-white/55 sm:text-base">
                  حكايات الصعيد اللي ملهاش نهاية؛ من أساطير النيل والجبل، لمربعات السيرة الهلالية وسير الناس وحكايات البيوت في ليالي الشتا وسهرات السمر.
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
                      STORIES COLLECTION
                    </span>
                    <BookOpen size={18} className="text-[#9a6a35]" />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-5xl font-black tracking-[-0.05em]">
                        {stories.length}
                      </div>
                      <div className="mt-2 text-xs text-black/45 dark:text-white/45">
                        حكاية موثقة
                      </div>
                    </div>

                    <div>
                      <div className="text-5xl font-black tracking-[-0.05em]">
                        {governorates.length}
                      </div>
                      <div className="mt-2 text-xs text-black/45 dark:text-white/45">
                        محافظة صعيدية
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex items-center gap-3 border-t border-black/10 pt-5 dark:border-white/10">
                    <div className="h-2 w-2 rounded-full bg-[#9a6a35]" />
                    <span className="text-xs font-bold">
                      كل حكاية ليها أصل وتاريخ
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
                placeholder="ابحث في حكايات الصعيد وأساطيره..."
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
                <option value="all">كافة الحكايات</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
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
                <BookOpen size={14} />
                <span className="text-xs font-bold">
                  {filteredStories.length} حكاية
                </span>
              </div>

              {hasFilters && (
                <button
                  onClick={resetFilters}
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
          STORIES GRID SECTION (MASONRY)
      ===================================================== */}
      <section className="mx-auto max-w-[1600px] px-5 pb-24 pt-14 sm:px-8 sm:pt-20 lg:px-12">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="mb-2 text-[10px] font-bold tracking-[0.3em] text-[#9a6a35]">
              ORAL MEMORY ARCHIVE
            </div>
            <h2 className="text-3xl font-black sm:text-4xl">مرويات وحكايات الصعيد</h2>
          </div>

          <div className="hidden items-center gap-2 text-xs text-black/40 dark:text-white/40 sm:flex">
            <Feather size={14} />
            <span>Upper Egypt Oral Traditions</span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[420px] animate-pulse rounded-[1.5rem] bg-black/5 dark:bg-white/5"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredStories.length === 0 && (
          <div
            className="
              flex min-h-[420px]
              flex-col items-center justify-center
              rounded-[2rem]
              border border-dashed
              border-black/15
              text-center
              dark:border-white/15
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
              <BookOpen size={24} />
            </div>

            <h3 className="text-xl font-black">لم يتم العثور على حكايات مطابقة</h3>
            <p className="mt-3 text-sm text-black/45 dark:text-white/45">
              جرب البحث بكلمات أخرى أو تغيير تصنيف الحكاية لاستكشاف مرويات الصعيد.
            </p>

            {hasFilters && (
              <button
                onClick={resetFilters}
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
                إعادة ضبط الفلاتر
              </button>
            )}
          </div>
        )}

        {/* Stories Grid */}
        {!isLoading && filteredStories.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStories.map((story, index) => {
              const image =
                story.coverImage ||
                'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=1000';
              const excerptText = story.excerpt || story.content || '';

              return (
                <article
                  key={story.id || index}
                  onClick={() => navigateToStory(story.slug)}
                  className="
                    group
                    relative
                    flex flex-col justify-between
                    overflow-hidden
                    rounded-[1.5rem]
                    bg-black
                    cursor-pointer
                  "
                >
                  <div className="relative h-[360px] sm:h-[400px] w-full overflow-hidden">
                    <img
                      src={image}
                      alt={story.title}
                      loading="lazy"
                      className="
                        h-full w-full
                        object-cover
                        opacity-90
                        transition-all
                        duration-700
                        ease-out
                        group-hover:scale-110
                        group-hover:opacity-100
                      "
                    />

                    {/* Dark Gradient Overlay */}
                    <div
                      className="
                        absolute inset-0
                        bg-gradient-to-t
                        from-black
                        via-black/25
                        to-transparent
                      "
                    />

                    {/* Serial Number */}
                    <div
                      className="
                        absolute right-5 top-5
                        text-7xl
                        font-black
                        leading-none
                        tracking-[-0.08em]
                        text-white/15
                        transition-all
                        duration-500
                        group-hover:text-white/30
                      "
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute left-5 top-5">
                      {story.category && (
                        <span
                          className="
                            inline-flex
                            rounded-full
                            border border-white/20
                            bg-black/20
                            px-3 py-1.5
                            text-[10px]
                            font-bold
                            text-white
                            backdrop-blur-md
                          "
                        >
                          {story.category}
                        </span>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                      <div className="mb-3 flex items-center justify-between gap-2 text-[10px] font-bold text-white/65">
                        {story.governorateName && (
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span>{story.governorateName}</span>
                          </div>
                        )}
                        {story.narrator && (
                          <div className="flex items-center gap-1">
                            <Feather size={12} />
                            <span>الراوي: {story.narrator}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-end justify-between gap-4">
                        <div className="min-w-0">
                          <h3
                            className="
                              text-2xl
                              font-black
                              leading-tight
                              text-white
                              transition-transform
                              duration-500
                              group-hover:-translate-y-1
                              sm:text-3xl
                            "
                          >
                            {story.title}
                          </h3>

                          {excerptText && (
                            <p
                              className="
                                mt-2
                                line-clamp-2
                                max-w-xl
                                text-xs
                                leading-6
                                text-white/65
                              "
                            >
                              {excerptText}
                            </p>
                          )}
                        </div>

                        <span
                          className="
                            flex h-11 w-11
                            shrink-0
                            items-center justify-center
                            rounded-full
                            bg-white
                            text-black
                            transition-all
                            duration-500
                            group-hover:-translate-x-1
                            group-hover:-translate-y-1
                          "
                        >
                          <ArrowUpLeft size={18} />
                        </span>
                      </div>
                    </div>

                    {/* Hover Border Frame */}
                    <div
                      className="
                        pointer-events-none
                        absolute inset-3
                        rounded-[1.1rem]
                        border border-white/0
                        transition-all
                        duration-500
                        group-hover:border-white/30
                      "
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

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
                  ORAL MEMORY
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
                  الحكايات مش مجرد كلام...
                  <br />
                  دي ذاكرة ناس وأماكن.
                </h2>
              </div>

              <p className="text-sm leading-8 text-white/55">
                وه بيحكي يحفظ صوت الراوي والتفاصيل التي صنعت وجدان الصعيد عبر الأجيال.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StoriesPage;
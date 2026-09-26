import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Governorate } from '../../types';
import {
  Store,
  MapPin,
  Star,
  CheckCircle2,
  ChevronRight,
  Search,
  Sparkles,
  ArrowUpLeft,
  Package,
} from 'lucide-react';

const GOVERNORATES: (Governorate | 'all')[] = [
  'all',
  'أسوان',
  'الأقصر',
  'قنا',
  'سوهاج',
  'أسيوط',
  'المنيا',
  'الوادي الجديد',
];

export const SellersDirectoryPage: React.FC = () => {
  const { sellers, navigateToSeller, setActivePage } = useApp();

  const [selectedGov, setSelectedGov] =
    useState<Governorate | 'all'>('all');

  const [search, setSearch] = useState('');

  const filteredSellers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sellers.filter((seller) => {
      const matchGov =
        selectedGov === 'all' ||
        seller.governorate === selectedGov;

      const matchSearch =
        query === '' ||
        seller.name.toLowerCase().includes(query) ||
        seller.brandName.toLowerCase().includes(query) ||
        seller.specialty.toLowerCase().includes(query) ||
        seller.governorate.toLowerCase().includes(query);

      return matchGov && matchSearch;
    });
  }, [sellers, selectedGov, search]);

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        w-full
        overflow-x-hidden
        bg-background
        text-foreground
        transition-colors duration-500
      "
    >
      {/* =========================================================
          PAGE CONTAINER
      ========================================================= */}
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-6 sm:py-8 lg:py-10">

        {/* =========================================================
            BREADCRUMB
        ========================================================= */}
        <nav className="flex items-center gap-2 mb-7 text-[11px] sm:text-xs font-medium text-foreground-disabled">
          <button
            type="button"
            onClick={() => setActivePage('home')}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            الرئيسية
          </button>

          <ChevronRight className="w-3.5 h-3.5 rotate-180 opacity-50" />

          <span className="font-bold text-foreground/80">
            ناس الصنعة في الصعيد
          </span>
        </nav>

        {/* =========================================================
            TOP INTRO
        ========================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 lg:gap-10 items-end mb-8">

          {/* Title */}
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 mb-4 text-primary">
              <span className="w-8 h-px bg-primary" />
              <span className="text-[11px] sm:text-xs font-black tracking-wide">
                من قلب الصعيد
              </span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>

            <h1
              className="
                text-4xl
                sm:text-5xl
                lg:text-6xl
                xl:text-7xl
                font-black
                font-serif
                leading-[0.98]
                tracking-tight
              "
            >
              شيوخ الكار
              <span className="text-primary">.</span>
            </h1>

            <p className="
              mt-5
              max-w-2xl
              text-sm
              sm:text-base
              leading-8
              text-foreground-muted
            ">
              ناس الصنعة اللي حافظوا على شغل إيديهم،
              وخلّوا حكايات الصعيد تعيش في كل قطعة بيعملوها.
            </p>
          </div>

          {/* Stats */}
          <div className="flex lg:justify-end items-center gap-3">
            <div
              className="
                min-w-[150px]
                px-5
                py-4
                rounded-2xl
                bg-surface-subtle
                border
                border-border-subtle
                shadow-sm
              "
            >
              <div className="flex items-center gap-2 text-primary mb-1">
                <Store className="w-4 h-4" />
                <span className="text-[11px] font-bold">
                  شيوخ الصنعة
                </span>
              </div>
              <div className="text-2xl font-black text-foreground">
                {filteredSellers.length}
              </div>
            </div>

            <div
              className="
                hidden
                sm:block
                min-w-[150px]
                px-5
                py-4
                rounded-2xl
                bg-foreground
                text-background
                shadow-sm
              "
            >
              <div className="flex items-center gap-2 opacity-75 mb-1">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-bold">
                  محافظات
                </span>
              </div>
              <div className="text-2xl font-black">
                {GOVERNORATES.length - 1}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SEARCH + FILTER AREA
        ========================================================= */}
        <section
          className="
            sticky
            top-3
            z-20
            mb-10
            p-2
            sm:p-2.5
            rounded-2xl
            bg-surface-subtle/85
            border
            border-border-subtle
            shadow-lg
            shadow-black/5
            backdrop-blur-xl
          "
        >
          <div className="flex flex-col lg:flex-row gap-2">

            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  w-4
                  h-4
                  text-foreground-disabled
                "
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="دَوّر على حرفي، ورشة، أو صنعة..."
                className="
                  w-full
                  h-12
                  pr-11
                  pl-4
                  rounded-xl
                  bg-background
                  border
                  border-border-subtle
                  text-sm
                  text-foreground
                  outline-none
                  placeholder:text-foreground-disabled
                  focus:border-primary/50
                  focus:ring-2
                  focus:ring-primary/10
                  transition-all
                "
              />
            </div>

            {/* Governorates */}
            <div
              className="
                flex
                items-center
                gap-1.5
                overflow-x-auto
                scrollbar-none
                pb-0.5
                lg:max-w-[720px]
              "
            >
              {GOVERNORATES.map((gov) => {
                const active = selectedGov === gov;

                return (
                  <button
                    key={gov}
                    type="button"
                    onClick={() => setSelectedGov(gov)}
                    className={`
                      h-12
                      shrink-0
                      px-4
                      rounded-xl
                      text-[11px]
                      sm:text-xs
                      font-bold
                      transition-all
                      cursor-pointer
                      ${active
                        ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                        : 'bg-transparent text-foreground-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'
                      }
                    `}
                  >
                    {gov === 'all' ? 'الكل' : gov}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            RESULTS HEADER
        ========================================================= */}
        <div className="flex items-center justify-between mb-5 px-1">
          <div>
            <h2 className="text-lg sm:text-xl font-black font-serif text-foreground">
              الحرفيين والورش
            </h2>
            <p className="text-[11px] sm:text-xs text-foreground-disabled mt-0.5">
              شغل أصيل من إيد ناسه
            </p>
          </div>

          <div className="text-[11px] font-bold text-foreground-disabled">
            {filteredSellers.length} نتيجة
          </div>
        </div>

        {/* =========================================================
            EMPTY STATE
        ========================================================= */}
        {filteredSellers.length === 0 ? (
          <div
            className="
              min-h-[360px]
              flex
              flex-col
              items-center
              justify-center
              text-center
              px-6
              rounded-3xl
              bg-surface-subtle
              border
              border-border-subtle
            "
          >
            <div
              className="
                w-16
                h-16
                rounded-2xl
                bg-primary/10
                text-primary
                flex
                items-center
                justify-center
                mb-5
              "
            >
              <Store className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black font-serif text-foreground">
              مفيش صنعة مطابقة للبحث
            </h3>

            <p className="max-w-md mt-2 text-xs sm:text-sm leading-7 text-foreground-muted">
              جرّب تغيّر كلمة البحث أو اختار محافظة تانية.
            </p>

            <button
              type="button"
              onClick={() => {
                setSelectedGov('all');
                setSearch('');
              }}
              className="
                mt-6
                px-6
                h-11
                rounded-xl
                bg-foreground
                text-background
                text-xs
                font-black
                hover:bg-primary
                hover:text-white
                transition-all
                cursor-pointer
              "
            >
              إظهار كل الحرفيين
            </button>
          </div>
        ) : (
          /* =======================================================
              SELLERS GRID (MODERN REDESIGNED CARDS)
          ======================================================= */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {filteredSellers.map((seller) => (
              <article
                key={seller.id}
                id={`directory-seller-${seller.id}`}
                onClick={() => navigateToSeller(seller.id)}
                className="
                  group
                  relative
                  overflow-hidden
                  min-h-[290px]
                  grid
                  grid-cols-[40%_60%]
                  rounded-3xl
                  bg-surface-subtle
                  border
                  border-border-subtle
                  cursor-pointer
                  transition-all
                  duration-500
                  hover:-translate-y-1.5
                  hover:border-primary/40
                  hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]
                  dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)]
                "
              >
                {/* =================================================
                    IMAGE SIDE (COVER + AVATAR + BADGE)
                ================================================= */}
                <div className="relative min-h-full overflow-hidden bg-black/10">
                  <img
                    src={seller.coverImage}
                    alt={seller.brandName}
                    className="
                      absolute
                      inset-0
                      w-full
                      h-full
                      object-cover
                      transition-transform
                      duration-700
                      group-hover:scale-108
                    "
                  />

                  {/* Gradient Overlay */}
                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/85
                      via-black/35
                      to-black/30
                      transition-opacity
                      duration-500
                      group-hover:opacity-90
                    "
                  />

                  {/* Governorate Badge */}
                  <div className="absolute top-3.5 right-3.5 z-10">
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        px-2.5
                        py-1
                        rounded-full
                        bg-black/50
                        backdrop-blur-md
                        text-white
                        text-[10px]
                        font-bold
                        border
                        border-white/15
                      "
                    >
                      <MapPin className="w-3 h-3 text-primary" />
                      <span>{seller.governorate}</span>
                    </span>
                  </div>

                  {/* Avatar + Verified Status */}
                  <div className="absolute bottom-4 right-4 z-10">
                    <div className="relative">
                      <img
                        src={seller.avatar}
                        alt={seller.name}
                        className="
                          w-15
                          h-15
                          sm:w-16
                          sm:h-16
                          rounded-2xl
                          object-cover
                          border-2
                          border-white/90
                          shadow-xl
                          bg-surface-subtle
                          group-hover:scale-105
                          transition-transform
                          duration-300
                        "
                      />

                      {seller.verified && (
                        <div
                          className="
                            absolute
                            -bottom-1
                            -left-1
                            w-5
                            h-5
                            rounded-full
                            bg-emerald-600
                            text-white
                            flex
                            items-center
                            justify-center
                            border-2
                            border-white
                            shadow-md
                          "
                          title="حرفي موثق ومعتمد"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* =================================================
                    CONTENT SIDE
                ================================================= */}
                <div className="relative p-5 sm:p-6 flex flex-col justify-between min-w-0">
                  {/* Top Details */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {/* Rating Capsule */}
                      <div
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          px-2.5
                          py-1
                          rounded-lg
                          bg-background
                          border
                          border-border-subtle
                          text-[10px]
                          font-black
                        "
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="text-foreground">{seller.rating}</span>
                        <span className="text-foreground-disabled font-normal">
                          ({seller.salesCount})
                        </span>
                      </div>

                      {/* Directional Action Icon */}
                      <div
                        className="
                          w-8
                          h-8
                          rounded-xl
                          bg-background
                          border
                          border-border-subtle
                          flex
                          items-center
                          justify-center
                          text-foreground-disabled
                          group-hover:text-primary
                          group-hover:border-primary/30
                          group-hover:-translate-x-1
                          group-hover:-translate-y-1
                          transition-all
                          duration-300
                        "
                      >
                        <ArrowUpLeft className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Brand Name */}
                    <h3
                      className="
                        text-lg
                        sm:text-xl
                        font-black
                        font-serif
                        leading-tight
                        text-foreground
                        group-hover:text-primary
                        transition-colors
                      "
                    >
                      {seller.brandName}
                    </h3>

                    {/* Owner Subtitle */}
                    <p className="
                      mt-1
                      text-[11px]
                      font-medium
                      text-foreground-disabled
                    ">
                      بإشراف الصانع: <span className="text-foreground/75 font-bold">{seller.name}</span>
                    </p>

                    {/* Bio */}
                    <p
                      className="
                        mt-3
                        text-xs
                        leading-6
                        text-foreground-muted
                        line-clamp-3
                      "
                    >
                      {seller.bio}
                    </p>
                  </div>

                  {/* Bottom Footer Info */}
                  <div className="mt-5 pt-3.5 border-t border-border-subtle">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          max-w-[62%]
                          truncate
                          px-2.5
                          py-1
                          rounded-lg
                          bg-primary/10
                          text-primary
                          border
                          border-primary/20
                          text-[10px]
                          font-black
                        "
                      >
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {seller.specialty}
                        </span>
                      </span>

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          text-[10px]
                          font-semibold
                          text-foreground-disabled
                          whitespace-nowrap
                        "
                      >
                        <Package className="w-3.5 h-3.5 text-primary" />
                        <span>{seller.productsCount} قطعة</span>
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
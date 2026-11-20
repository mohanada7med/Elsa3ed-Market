import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Governorate } from '../../types';
import {
  Store,
  MapPin,
  Star,
  CheckCircle2,
  Search,
  Sparkles,
  ArrowUpLeft,
  Package,
  Flame,
} from 'lucide-react';
import { UncleWahHeroBanner } from '../common/UncleWahHeroBanner';
import { PaidPromotionSection } from '../public/PaidPromotionSection';
import { ArchiveStatsCard } from '../common/ArchiveStatsCard';
import { PageNavigationBar } from '../layout/PageNavigationBar';
import { BrandPatternBackground } from '../layout/BrandPatternBackground';

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
  const { sellers, products, navigateToSeller, setActivePage } = useApp();

  const getSellerProductsCount = (seller: any) => {
    const fromProducts = products.filter(
      (p) =>
        p.sellerId === seller.id ||
        (seller.userId && p.sellerId === seller.userId) ||
        (seller.brandName && p.sellerName === seller.brandName)
    ).length;
    return fromProducts > 0 ? fromProducts : (seller.productsCount || 0);
  };

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
        bg-cream
        text-espresso
        dark:bg-espresso-900
        dark:text-cream
        transition-colors duration-500
      "
    >
      <BrandPatternBackground />

      <PageNavigationBar
        backLabel="الرئيسية"
        onBack={() => setActivePage('home')}
        title="شيوخ الصنعة والورش"
      />

      {/* =========================================================
          PAGE CONTAINER
      ========================================================= */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-6 sm:py-8 lg:py-10">
        {/* UNCLE WAH HERO BANNER - MASTER OF SELLERS & WORKSHOPS */}

        {/* =========================================================
            TOP INTRO
        ========================================================= */}
      <section className="relative z-10 mx-auto w-full px-0 pb-8 pt-8 sm:pb-14 sm:pt-14 lg:pb-16 lg:pt-20">
        <div className="grid gap-14 lg:grid-cols-[1fr_420px] lg:items-end lg:gap-20">
          <div>

            <h1 className="max-w-6xl text-5xl font-black leading-[0.92] tracking-tight sm:text-7xl lg:text-[8rem] xl:text-[9.5rem]">
              فنانين
              <br />
              <span className="mr-3 text-primary dark:text-primary-hover dark:text-primary dark:text-primary-hover sm:mr-6 lg:mr-16">
                الصعيد
              </span>
            </h1>

            <div className="mt-5 flex max-w-2xl items-start gap-4">
              <div className="hidden sm:block">
              </div>
              <p className="mr-10 max-w-2xl text-sm font-medium leading-8 text-black/55 sm:text-base sm:leading-9 dark:text-white/55">
                ناس الصنعة اللي حافظوا على شغل إيديهم،
                وخلّوا حكايات الصعيد تعيش في كل قطعة بيعملوها.
              </p>
            </div>
          </div>

          <ArchiveStatsCard
            eyebrow="THE HERITAGE PANTRY"
            icon={Flame}
            stats={[
              {
                value: sellers.length,
                label: <>فني<br />متوثق</>,
              },
              {
                value: GOVERNORATES.length,
                label: <>محافظة<br />صعيدية</>,
              },
            ]}
            footer="من قعر الطاجن ودفا الفرن البلدي"
          />
        </div>
      </section>

        <div className="mb-8">
          <UncleWahHeroBanner
            doorTitle="دليل ورش وشيوخ صنعة الصعيد"
            doorBadge="ورش الصعايدة"
            mascotSrc="/mascot/make.png"
            mascotRole="عم وه بين شيوخ الصنعة"
            quote="عم وه خبط على بيبان ورش الصعيد دكان دكان، وقعد مع شيوخ الصنعة الحقيقيين وتأكد من أمانتهم وجودة شغلهم عشان تتعاملوا معاهم وإنتوا متطمنين 100%!"
            statsText={`${sellers.length} ورشة ودكان متوثق`}
          />
        </div>

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
            bg-white/80
            dark:bg-espresso-900/85
            border
            border-black/10
            dark:border-white/10
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
                  text-black/50
                  dark:text-white/50
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
                  bg-cream/90
                  dark:bg-espresso-800
                  border
                  border-black/10
                  dark:border-white/10
                  text-sm
                  text-espresso
                  dark:text-cream
                  outline-none
                  placeholder:text-black/40
                  dark:placeholder:text-white/40
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
                        : 'bg-transparent text-black/60 hover:bg-black/5 hover:text-espresso dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-cream'
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
<div className="mb-8">
          <PaidPromotionSection directory />
        </div>
        {/* =========================================================
            RESULTS HEADER
        ========================================================= */}
        <div className="flex items-center justify-between mb-5 px-1">
          <div>
            <h2 className="text-lg sm:text-xl font-main font-black text-espresso dark:text-cream">
              الحرفيين والورش
            </h2>
            <p className="text-[11px] sm:text-xs text-black/50 dark:text-white/50 mt-0.5">
              شغل أصيل من إيد ناسه
            </p>
          </div>

          <div className="text-[11px] font-bold text-black/50 dark:text-white/50">
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
              bg-white/70
              dark:bg-espresso-800/70
              border
              border-black/10
              dark:border-white/10
            "
          >
            <div
              className="
                w-16
                h-16
                rounded-2xl
                bg-primary/10
                text-primary dark:text-primary-hover
                flex
                items-center
                justify-center
                mb-5
              "
            >
              <Store className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-cairo font-bold text-espresso dark:text-cream">
              مفيش صنعة مطابقة للبحث
            </h3>

            <p className="max-w-md mt-2 text-xs sm:text-sm leading-7 text-black/55 dark:text-white/55">
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
                  bg-white/75
                  dark:bg-espresso-800/75
                  border
                  border-black/10
                  dark:border-white/10
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
                      <MapPin className="w-3 h-3 text-primary dark:text-primary-hover" />
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
                          bg-white/75
                          dark:bg-espresso-800/75
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
                          bg-cream/80
                          border
                          border-black/10
                          dark:bg-espresso-900/60
                          dark:border-white/10
                          text-[10px]
                          font-black
                        "
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="text-espresso dark:text-cream">{seller.rating}</span>
                        <span className="text-black/50 dark:text-white/50 font-normal">
                          ({seller.salesCount})
                        </span>
                      </div>

                      {/* Directional Action Icon */}
                      <div
                        className="
                          w-8
                          h-8
                          rounded-xl
                          bg-cream/80
                          border
                          border-black/10
                          dark:bg-espresso-900/60
                          dark:border-white/10
                          flex
                          items-center
                          justify-center
                          text-black/50
                          dark:text-white/50
                          group-hover:text-primary dark:text-primary-hover
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
                        font-bold
                        font-cairo
                        leading-tight
                        text-espresso
                        dark:text-cream
                        group-hover:text-primary dark:text-primary-hover
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
                      text-black/50
                      dark:text-white/50
                    ">
                      بإشراف الصانع: <span className="text-espresso/75 dark:text-cream/75 font-bold">{seller.name}</span>
                    </p>

                    {/* Bio */}
                    <p
                      className="
                        mt-3
                        text-xs
                        leading-6
                        text-black/55
                        dark:text-white/55
                        line-clamp-3
                      "
                    >
                      {seller.bio}
                    </p>
                  </div>

                  {/* Bottom Footer Info */}
                  <div className="mt-5 pt-3.5 border-t border-black/10 dark:border-white/10">
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
                          text-primary dark:text-primary-hover
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
                          text-black/50
                          dark:text-white/50
                          whitespace-nowrap
                        "
                      >
                        <Package className="w-3.5 h-3.5 text-primary dark:text-primary-hover" />
                        <span>{getSellerProductsCount(seller)} قطعة</span>
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
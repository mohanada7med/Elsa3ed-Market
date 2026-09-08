import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProductFilters } from '../products/ProductFilters';
import { ProductGrid } from '../products/ProductGrid';

import {
  ArrowLeft,
  ArrowUpLeft,
  Search,
  Sparkles,
  MapPin,
  ShoppingBag,
  X,
  MoveUpLeft,
  Gem,
  ScrollText,
  CircleDot,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const {
    setActivePage,
    searchQuery,
    setSearchQuery,
    products,
    categories,
  } = useApp();

  const approvedCount = products.filter(
    (p) => p.approvalStatus === 'approved'
  ).length;

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#f3eee5]
        text-[#211d18]
        transition-colors
        duration-500

        dark:bg-[#090908]
        dark:text-[#f4eee5]
      "
    >
      {/* =====================================================
          DECORATIVE BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="
            absolute
            -right-[260px]
            top-[18%]
            h-[600px]
            w-[600px]
            rounded-full
            border
            border-[#9a6a35]/[0.07]

            dark:border-[#d6aa72]/[0.06]
          "
        />

        <div
          className="
            absolute
            -left-[300px]
            top-[55%]
            h-[700px]
            w-[700px]
            rounded-full
            border
            border-[#9a6a35]/[0.05]

            dark:border-[#d6aa72]/[0.05]
          "
        />

        <div
          className="
            absolute
            right-[15%]
            top-[42%]
            h-2
            w-2
            rounded-full
            bg-[#9a6a35]/30

            dark:bg-[#d6aa72]/30
          "
        />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          relative
          z-50
          border-b
          border-black/[0.07]
          bg-[#f3eee5]/80
          backdrop-blur-2xl

          dark:border-white/[0.08]
          dark:bg-[#090908]/80
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[72px]
            max-w-[1700px]
            items-center
            justify-between
            px-5

            sm:px-8
            lg:px-12
            xl:px-16
          "
        >
          {/* Home */}

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
              transition-all
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
                transition-all

                group-hover:bg-[#211d18]
                group-hover:text-white

                dark:border-white/10

                dark:group-hover:bg-white
                dark:group-hover:text-black
              "
            >
              <ArrowLeft
                size={15}
                className="transition-transform group-hover:-translate-x-0.5"
              />
            </span>

            <span className="hidden sm:block">
              الرئيسية
            </span>
          </button>

          {/* Brand */}

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
                text-[8px]
                font-black
                tracking-[0.45em]
                text-[#9a6a35]

                dark:text-[#d6aa72]
              "
            >
              WAH
            </div>

            <div className="mt-1 text-xs font-black">
              السوق التراثي
            </div>
          </div>

          {/* Categories */}

          <button
            type="button"
            onClick={() => setActivePage('categories')}
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
              font-black
              transition-all

              hover:bg-[#211d18]
              hover:text-white

              dark:border-white/10

              dark:hover:bg-white
              dark:hover:text-black

              sm:px-4
              sm:py-2.5
              sm:text-xs

              cursor-pointer
            "
          >
            <span className="hidden sm:block">
              اكتشف التصنيفات
            </span>

            <ArrowUpLeft
              size={14}
              className="transition-transform group-hover:-translate-x-0.5"
            />
          </button>
        </div>
      </header>

      {/* =====================================================
          INTRO / HERO
      ===================================================== */}

      <section className="relative z-10">
        <div
          className="
            mx-auto
            max-w-[1700px]
            px-5
            pb-12
            pt-16

            sm:px-8
            sm:pb-16
            sm:pt-24

            lg:px-12
            lg:pb-20
            lg:pt-28

            xl:px-16
          "
        >
          <div
            className="
              grid
              gap-14

              lg:grid-cols-[1fr_420px]
              lg:items-end
              lg:gap-20
            "
          >
            {/* Main title */}

            <div>
              <div
                className="
                  mb-7
                  flex
                  items-center
                  gap-3
                  text-[9px]
                  font-black
                  tracking-[0.28em]
                  text-[#9a6a35]

                  dark:text-[#d6aa72]
                "
              >
                <span
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    bg-[#9a6a35]/10

                    dark:bg-[#d6aa72]/10
                  "
                >
                  <Sparkles size={13} />
                </span>

                WAH / HANDMADE ARCHIVE
              </div>

              <h1
                className="
                  max-w-6xl
                  text-[18vw]
                  font-black
                  leading-[0.78]
                  tracking-[-0.1em]

                  sm:text-[13vw]

                  lg:text-[9rem]

                  xl:text-[11rem]
                "
              >
                من إيد
                <br />

                <span
                  className="
                    mr-[8vw]
                    text-[#9a6a35]

                    dark:text-[#d6aa72]

                    lg:mr-28
                  "
                >
                  الصعيد
                </span>
              </h1>

              <div
                className="
                  mt-10
                  grid
                  max-w-3xl
                  gap-7

                  sm:grid-cols-[90px_1fr]
                "
              >
                <div className="hidden sm:block">
                  <div
                    className="
                      text-[9px]
                      font-black
                      tracking-[0.2em]
                      text-black/35

                      dark:text-white/30
                    "
                  >
                    01
                  </div>

                  <div
                    className="
                      mt-3
                      h-px
                      w-12
                      bg-[#9a6a35]

                      dark:bg-[#d6aa72]
                    "
                  />
                </div>

                <p
                  className="
                    max-w-2xl
                    text-sm
                    font-medium
                    leading-8
                    text-black/55

                    dark:text-white/55

                    sm:text-base
                    sm:leading-9
                  "
                >
                  قطع أصلية بتحمل روح المكان،
                  وصنعة اتنقلت من جيل لجيل.
                  اكتشف الفخار والكليم والتلي
                  والخوص وكل ما هو مصنوع بإيد
                  حقيقية من قلب الصعيد.
                </p>
              </div>
            </div>

            {/* Side information */}

            <div className="relative">
              <div
                className="
                  relative
                  overflow-hidden
                  rounded-[2rem]
                  border
                  border-black/[0.08]
                  bg-[#e8e0d2]
                  p-7

                  dark:border-white/[0.08]
                  dark:bg-[#121210]

                  sm:p-8
                "
              >
                {/* corner decoration */}

                <div
                  className="
                    absolute
                    -left-20
                    -top-20
                    h-48
                    w-48
                    rounded-full
                    border
                    border-[#9a6a35]/15

                    dark:border-[#d6aa72]/10
                  "
                />

                <div className="relative">
                  <div className="mb-12 flex items-center justify-between">
                    <div
                      className="
                        text-[8px]
                        font-black
                        tracking-[0.3em]
                        text-black/35

                        dark:text-white/35
                      "
                    >
                      THE COLLECTION
                    </div>

                    <Gem
                      size={18}
                      className="
                        text-[#9a6a35]

                        dark:text-[#d6aa72]
                      "
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div
                        className="
                          text-5xl
                          font-black
                          tracking-[-0.07em]
                        "
                      >
                        {approvedCount}
                      </div>

                      <div
                        className="
                          mt-3
                          text-[10px]
                          font-medium
                          leading-5
                          text-black/45

                          dark:text-white/40
                        "
                      >
                        قطعة متاحة
                        <br />
                        ومعتمدة
                      </div>
                    </div>

                    <div>
                      <div
                        className="
                          text-5xl
                          font-black
                          tracking-[-0.07em]
                        "
                      >
                        {categories.length}
                      </div>

                      <div
                        className="
                          mt-3
                          text-[10px]
                          font-medium
                          leading-5
                          text-black/45

                          dark:text-white/40
                        "
                      >
                        تصنيف
                        <br />
                        تراثي
                      </div>
                    </div>
                  </div>

                  <div
                    className="
                      mt-10
                      flex
                      items-center
                      gap-3
                      border-t
                      border-black/10
                      pt-5

                      dark:border-white/10
                    "
                  >
                    <CircleDot
                      size={13}
                      className="
                        text-[#9a6a35]

                        dark:text-[#d6aa72]
                      "
                    />

                    <span className="text-[10px] font-bold">
                      أصالة • حرفة • حكاية
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SEARCH EXPERIENCE
      ===================================================== */}

      <section
        className="
          relative
          z-30
          mx-auto
          max-w-[1700px]
          px-5

          sm:px-8

          lg:px-12

          xl:px-16
        "
      >
        <div
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            border
            border-black/[0.08]
            bg-[#211d18]
            p-5
            text-white

            dark:border-white/[0.08]

            sm:p-7

            lg:p-8
          "
        >
          {/* decorative circles */}

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

          <div
            className="
              pointer-events-none
              absolute
              -bottom-32
              right-[30%]
              h-72
              w-72
              rounded-full
              border
              border-white/[0.05]
            "
          />

          <div
            className="
              relative
              grid
              gap-5

              lg:grid-cols-[auto_1fr_auto]
              lg:items-center
            "
          >
            {/* Search label */}

            <div className="flex items-center gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/10
                "
              >
                <Search size={18} />
              </div>

              <div>
                <div className="text-[9px] font-black tracking-[0.2em] text-white/40">
                  SEARCH THE ARCHIVE
                </div>

                <div className="mt-1 text-sm font-black">
                  دور على حكايتك
                </div>
              </div>
            </div>

            {/* Search */}

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                placeholder="فخار قنا، كليم أخميم، تلي أسيوط..."
                className="
                  h-14
                  w-full
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.07]
                  px-5
                  pl-12
                  text-sm
                  font-medium
                  text-white
                  outline-none
                  transition-all

                  placeholder:text-white/30

                  focus:border-[#d6aa72]/50
                  focus:bg-white/[0.1]

                  sm:h-16
                  sm:px-6
                  sm:pl-14
                "
              />

              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="
                    absolute
                    left-3
                    top-1/2
                    flex
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    p-2
                    text-white/50
                    transition
                    hover:bg-white/10
                    hover:text-white

                    cursor-pointer
                  "
                >
                  <X size={15} />
                </button>
              ) : (
                <Search
                  size={17}
                  className="
                    absolute
                    left-5
                    top-1/2
                    -translate-y-1/2
                    text-white/30
                  "
                />
              )}
            </div>

            {/* Count */}

            <div
              className="
                flex
                h-14
                items-center
                justify-center
                gap-3
                rounded-2xl
                bg-[#d6aa72]
                px-6
                text-black

                sm:h-16
              "
            >
              <ShoppingBag size={15} />

              <span className="text-xs font-black">
                {approvedCount} منتج
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section
        className="
          relative
          z-20
          mx-auto
          max-w-[1700px]
          px-5
          pt-10

          sm:px-8
          sm:pt-12

          lg:px-12

          xl:px-16
        "
      >
        <div
          className="
            mb-6
            flex
            items-center
            justify-between
          "
        >
          <div className="flex items-center gap-3">
            <ScrollText
              size={16}
              className="
                text-[#9a6a35]

                dark:text-[#d6aa72]
              "
            />

            <span className="text-xs font-black">
              تصفح المجموعة
            </span>
          </div>

          <div
            className="
              hidden
              items-center
              gap-2
              text-[9px]
              font-bold
              text-black/35

              dark:text-white/30

              sm:flex
            "
          >
            <MapPin
              size={12}
              className="
                text-[#9a6a35]

                dark:text-[#d6aa72]
              "
            />

            <span>
              من قلب الصعيد
            </span>
          </div>
        </div>

        <ProductFilters />
      </section>

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      <section
        className="
          relative
          z-10
          mx-auto
          max-w-[1700px]
          px-5
          pb-24
          pt-8

          sm:px-8
          sm:pb-28
          sm:pt-10

          lg:px-12
          lg:pb-36

          xl:px-16
        "
      >
        {/* section heading */}

        <div
          className="
            mb-10
            flex
            flex-col
            gap-5

            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <div
              className="
                mb-3
                text-[9px]
                font-black
                tracking-[0.25em]
                text-[#9a6a35]

                dark:text-[#d6aa72]
              "
            >
              HANDPICKED COLLECTION
            </div>

            <h2
              className="
                text-3xl
                font-black
                tracking-[-0.05em]

                sm:text-4xl
              "
            >
              القطع اللي بتحكي
            </h2>
          </div>

          <div
            className="
              max-w-sm
              text-xs
              font-medium
              leading-6
              text-black/40

              dark:text-white/35
            "
          >
            كل قطعة هنا ليها قصة،
            وصانع،
            ومكان يستاهل يتعرف.
          </div>
        </div>

        <ProductGrid />
      </section>

      {/* =====================================================
          BRAND STATEMENT
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
            max-w-[1700px]
            px-5
            py-20

            sm:px-8
            sm:py-28

            lg:px-12
            lg:py-36

            xl:px-16
          "
        >
          <div
            className="
              grid
              gap-12

              lg:grid-cols-[1fr_360px]
              lg:items-end
            "
          >
            <div>
              <div
                className="
                  mb-6
                  flex
                  items-center
                  gap-3
                  text-[9px]
                  font-black
                  tracking-[0.3em]
                  text-[#9a6a35]

                  dark:text-[#d6aa72]
                "
              >
                <Sparkles size={13} />

                PRESERVE THE CRAFT
              </div>

              <h2
                className="
                  max-w-5xl
                  text-5xl
                  font-black
                  leading-[0.95]
                  tracking-[-0.07em]

                  sm:text-6xl

                  lg:text-8xl
                "
              >
                مش مجرد
                <br />

                <span
                  className="
                    text-[#9a6a35]

                    dark:text-[#d6aa72]
                  "
                >
                  منتج.
                </span>
              </h2>
            </div>

            <div>
              <div
                className="
                  mb-6
                  h-px
                  w-16
                  bg-[#9a6a35]

                  dark:bg-[#d6aa72]
                "
              />

              <p
                className="
                  text-sm
                  font-medium
                  leading-8
                  text-black/50

                  dark:text-white/45
                "
              >
                لما تشتري قطعة من سوق وه،
                إنت مش بس بتشتري منتج.
                إنت بتشارك في استمرار حرفة،
                وبتدعم إيد،
                وبتحافظ على جزء من ذاكرة الصعيد.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section
        className="
          relative
          z-10
          mx-auto
          max-w-[1700px]
          px-5
          pb-10

          sm:px-8

          lg:px-12

          xl:px-16
        "
      >
        <div
          className="
            relative
            overflow-hidden
            rounded-[2.5rem]
            bg-[#211d18]
            px-6
            py-16
            text-white

            sm:px-10
            sm:py-20

            lg:px-20
            lg:py-24
          "
        >
          {/* Decorative rings */}

          <div
            className="
              pointer-events-none
              absolute
              -left-24
              -top-24
              h-80
              w-80
              rounded-full
              border
              border-white/[0.07]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-48
              right-[15%]
              h-[500px]
              w-[500px]
              rounded-full
              border
              border-white/[0.05]
            "
          />

          <div className="relative z-10">
            <div
              className="
                mb-8
                flex
                items-center
                gap-3
                text-[9px]
                font-black
                tracking-[0.3em]
                text-[#d6aa72]
              "
            >
              <MapPin size={13} />

              UPPER EGYPT / AUTHENTIC HANDCRAFT
            </div>

            <div
              className="
                grid
                gap-10

                lg:grid-cols-[1fr_auto]
                lg:items-end
              "
            >
              <div>
                <h2
                  className="
                    max-w-5xl
                    text-4xl
                    font-black
                    leading-[1]
                    tracking-[-0.06em]

                    sm:text-6xl

                    lg:text-7xl
                  "
                >
                  خليك قريب
                  <br />
                  من أصل الحكاية.
                </h2>

                <p
                  className="
                    mt-7
                    max-w-2xl
                    text-xs
                    leading-7
                    text-white/45

                    sm:text-sm
                    sm:leading-8
                  "
                >
                  من قرى الصعيد لحد بيتك،
                  كل قطعة بتوصل ومعاها
                  حكاية المكان اللي اتصنعت فيه.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActivePage('categories')}
                className="
                  group
                  flex
                  h-14
                  items-center
                  justify-center
                  gap-3
                  rounded-full
                  bg-white
                  px-7
                  text-xs
                  font-black
                  text-black
                  transition-all
                  hover:-translate-y-1
                  hover:bg-[#d6aa72]

                  cursor-pointer
                "
              >
                استكشف التصنيفات

                <MoveUpLeft
                  size={15}
                  className="
                    transition-transform
                    group-hover:-translate-x-1
                  "
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="h-6 sm:h-10" />
    </main>
  );
};

export default ProductsPage;
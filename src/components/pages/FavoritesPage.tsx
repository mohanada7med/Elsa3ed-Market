import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../products/ProductCard';
import { Heart, ArrowUpLeft } from 'lucide-react';
import { Product } from '../../types';

export const FavoritesPage: React.FC = () => {
  const {
    favorites,
    products,
    adminProducts,
    sellerProducts,
    setActivePage,
  } = useApp();

  const allAvailableProducts = useMemo(() => {
    const map = new Map<string, Product>();

    [
      ...(products || []),
      ...(adminProducts || []),
      ...(sellerProducts || []),
    ].forEach((product) => {
      if (product?.id && !map.has(product.id)) {
        map.set(product.id, product);
      }
    });

    return map;
  }, [products, adminProducts, sellerProducts]);

  const favoriteProducts = useMemo(() => {
    return favorites
      .map((id) => allAvailableProducts.get(id))
      .filter((p): p is Product => Boolean(p));
  }, [favorites, allAvailableProducts]);

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        overflow-hidden
        bg-cream
        text-espresso
        dark:bg-espresso-900
        dark:text-cream
      "
    >

      {/* =========================================================
          HERO
      ========================================================= */}
      <section
        className="
          relative
          overflow-hidden
          px-5
          pt-32
          pb-16
          sm:px-10
          sm:pt-36
          lg:px-20
          lg:pt-40
          lg:pb-20
        "
      >

        <div className="relative mx-auto max-w-[1500px]">

          {/* Small label */}
          <div className="mb-8 flex items-center gap-3">

            <span
              className="
                h-px
                w-10
                bg-espresso/30
                dark:bg-cream/30
              "
            />

            <span
              className="
                text-xs
                font-bold
                tracking-[0.2em]
                opacity-60
              "
            >
              مفضلاتك
            </span>

          </div>

          {/* Main hero grid */}
          <div
            className="
              grid
              items-center
              gap-10
              lg:grid-cols-[1fr_380px]
              xl:grid-cols-[1fr_460px]
              xl:gap-20
            "
          >

            {/* =====================================================
                TEXT SIDE
            ===================================================== */}
            <div className="max-w-4xl">

              <h1
                className="
                  text-5xl
                  leading-[0.95]
                  tracking-tight
                  text-espresso
                  sm:text-7xl
                  lg:text-7xl
                  xl:text-[7rem]
                  dark:text-cream
                "
              >
                الحاجات اللي
                <br />

                <span className="text-primary">
                  وقعت عينك عليها.
                </span>
              </h1>

              <p
                className="
                  mt-7
                  max-w-xl
                  text-sm
                  leading-7
                  text-black/60
                  sm:text-base
                  sm:leading-8
                  dark:text-white/60
                "
              >
                كل قطعة عجبتك وخليتها جنبك.
                لما تحب ترجع لها، هتلاقيها هنا.
              </p>

              {/* Count + action */}
              <div
                className="
                  mt-10
                  flex
                  flex-wrap
                  items-end
                  gap-8
                  sm:mt-12
                "
              >

                {/* Count */}
                <div className="flex items-end gap-4">

                  <div className="text-right">

                    <div
                      className="
                        text-6xl
                        font-black
                        leading-none
                        text-primary
                        sm:text-7xl
                      "
                    >
                      {favoriteProducts.length}
                    </div>

                    <div
                      className="
                        mt-2
                        text-xs
                        font-bold
                        text-black/45
                        dark:text-white/45
                      "
                    >
                      قطعة محفوظة
                    </div>

                  </div>

                  <Heart
                    className="
                      mb-2
                      h-7
                      w-7
                      text-primary
                      opacity-70
                    "
                    strokeWidth={1.5}
                  />

                </div>

                {/* Browse button */}
                {favoriteProducts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActivePage('products')}
                    className="
                      group
                      flex
                      items-center
                      gap-4
                      border-b
                      border-primary/30
                      pb-3
                      text-sm
                      font-bold
                      text-primary
                      transition-all
                      hover:border-primary
                      dark:border-primary/40
                      dark:hover:border-primary
                    "
                  >
                    <span>
                      اكتشف باقي السوق
                    </span>

                    <ArrowUpLeft
                      className="
                        h-4
                        w-4
                        transition-transform
                        duration-300
                        group-hover:-translate-x-1
                        group-hover:-translate-y-1
                      "
                    />
                  </button>
                )}

              </div>

            </div>

            {/* =====================================================
                CHARACTER SIDE
            ===================================================== */}
            <div
              className="
                relative
                flex
                min-h-[330px]
                items-center
                justify-center
                sm:min-h-[400px]
                lg:min-h-[450px]
              "
            >

              {/* Big soft circle */}
              <div
                className="
                  absolute
                  h-[260px]
                  w-[260px]
                  rounded-full
                  bg-primary/10
                  sm:h-[330px]
                  sm:w-[330px]
                  lg:h-[390px]
                  lg:w-[390px]
                "
              />

              {/* Secondary circle */}
              <div
                className="
                  absolute
                  h-[300px]
                  w-[300px]
                  rounded-full
                  border
                  border-primary/10
                  sm:h-[380px]
                  sm:w-[380px]
                  lg:h-[440px]
                  lg:w-[440px]
                "
              />

              {/* Character */}
              <img
                src="mascot/fav.png"
                alt="شخصية وَه"
                className="
                  relative
                  z-10
                  w-[250px]
                  select-none
                  object-contain
                  drop-shadow-[0_25px_35px_rgba(36,26,20,0.16)]
                  transition-transform
                  duration-500
                  scale-200
                  hover:-translate-y-3
                  hover:scale-230
                  sm:w-[310px]
                  lg:w-[370px]
                "
              />

              {/* Floating heart */}
              <div
                className="
                  absolute
                  right-[12%]
                  top-[15%]
                  z-20
                  flex
                  h-12
                  w-12
                  rotate-6
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  shadow-[0_10px_30px_rgba(36,26,20,0.12)]
                  dark:bg-espresso
                  sm:h-14
                  sm:w-14
                "
              >
                <Heart
                  className="
                    h-5
                    w-5
                    fill-primary
                    text-primary
                  "
                />
              </div>

              {/* Small decorative dot */}
              <div
                className="
                  absolute
                  bottom-[15%]
                  left-[12%]
                  z-20
                  h-3
                  w-3
                  rounded-full
                  bg-primary/60
                "
              />

            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          PRODUCTS
      ========================================================= */}
      {favoriteProducts.length > 0 ? (

        <section
          className="
            px-5
            pb-32
            sm:px-10
            lg:px-20
          "
        >

          <div className="mx-auto max-w-[1500px]">

            {/* Section divider */}
            <div
              className="
                mb-12
                flex
                items-center
                gap-5
              "
            >

              <div
                className="
                  h-px
                  flex-1
                  bg-black/10
                  dark:bg-white/10
                "
              />

              <span
                className="
                  text-xs
                  font-bold
                  opacity-40
                "
              >
                القطع المحفوظة
              </span>

              <div
                className="
                  h-px
                  flex-1
                  bg-black/10
                  dark:bg-white/10
                "
              />

            </div>

            {/* Products */}
            <div
              className="
                grid
                grid-cols-1
                gap-x-8
                gap-y-16
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {favoriteProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={`
                    ${index % 5 === 2
                      ? 'lg:translate-y-16'
                      : ''
                    }
                  `}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Bottom message */}
            <div
              className="
                mt-28
                border-t
                border-black/10
                pt-8
                dark:border-white/10
              "
            >
              <p
                className="
                  text-center
                  text-xs
                  font-bold
                  opacity-40
                "
              >
                دي الحاجات اللي اخترتها لحد دلوقتي ❤️
              </p>
            </div>

          </div>

        </section>

      ) : (

        /* =========================================================
           EMPTY STATE
        ========================================================= */
        <section
          className="
            px-5
            pb-32
            sm:px-10
            lg:px-20
          "
        >

          <div
            className="
              mx-auto
              flex
              min-h-[420px]
              max-w-[900px]
              flex-col
              items-center
              justify-center
              border-y
              border-black/10
              text-center
              dark:border-white/10
            "
          >

            {/* Heart */}
            <div
              className="
                mb-8
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-full
                bg-primary/[0.06]
                dark:bg-white/[0.04]
              "
            >
              <Heart
                className="
                  h-9
                  w-9
                  text-primary
                  opacity-40
                "
                strokeWidth={1}
              />
            </div>

            {/* Empty Character */}
            <img
              src="mascot/favbrock.png"
              alt="شخصية وَه"
              className="
                relative
                z-10
                w-[250px]
                select-none
                object-contain
                transition-transform
                duration-500
                scale-100
                sm:w-[310px]
                lg:w-[370px]
              "
            />

            <p
              className="
                mt-6
                max-w-md
                text-sm
                leading-7
                opacity-50
              "
            >
              لف في سوق وَه، ولما تلاقي قطعة تحبها،
              دوس على القلب وخليها عندك لوقت ما تحب.
            </p>

            <button
              type="button"
              onClick={() => setActivePage('products')}
              className="
                mt-9
                rounded-full
                bg-espresso
                px-8
                py-4
                text-sm
                font-bold
                text-white
                transition-all
                hover:-translate-y-1
                hover:shadow-xl
                dark:bg-cream
                dark:text-espresso
              "
            >
              ادخل سوق وَه
            </button>

          </div>

        </section>

      )}

    </main>
  );
};
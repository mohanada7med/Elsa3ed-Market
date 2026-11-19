import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../products/ProductCard';
import { Heart, ArrowUpLeft, Sparkles, Layers, ShoppingBag, Bookmark } from 'lucide-react';
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
      className="min-h-screen w-full overflow-x-hidden bg-cream text-espresso transition-colors duration-500 dark:bg-espresso-900 dark:text-cream selection:bg-primary/30"
    >
      {/* =========================================================
          HERO - خلفية تفاعلية بأسلوب الطبقات العائمة
      ========================================================= */}
      <section className="relative px-4 pt-28 pb-16 sm:px-8 sm:pt-36 sm:pb-20 lg:px-20 lg:pt-40">
        
        {/* Soft Decorative Ambient Circles */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 -z-10 h-[500px] w-[90%] max-w-[1200px] rounded-[60px] bg-gradient-to-r from-primary/10 via-gold/5 to-primary/10 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-[1500px]">
          
          <div className="grid items-center gap-12 lg:grid-cols-12">
            
            {/* TEXT SIDE */}
            <div className="lg:col-span-7 space-y-6 text-right">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white/75 dark:bg-espresso-900/90 px-4 py-2 text-xs font-bold shadow-sm backdrop-blur-md border border-black/10 dark:border-white/10">
                <Sparkles className="h-4 w-4 text-primary dark:text-primary-hover animate-bounce" />
                <span className="tracking-wide">حاجاتك المميزة</span>
              </div>

              <h1 className="text-espresso dark:text-cream text-[clamp(2.5rem,6vw,4.8rem)] font-black leading-[1.08] tracking-tight">
                الحاجات <br />
                <span className="relative inline-block text-primary dark:text-primary-hover dark:text-primary dark:text-primary-hover">
                  اللي انت حبيتها
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary dark:text-primary-hover/30" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0 10 Q 50 20 100 10" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                </span>
              </h1>

              <p className="max-w-xl text-espresso/75 dark:text-cream/75 text-base sm:text-lg leading-8 font-normal">
                كل قطعة خطفت عينك ووقعت في غرامها، ركناهاالك هنا على جنب عشان تلاقيها أول ما تحب ترجعلها.
              </p>

              {/* Interactive Bar */}
              <div className="flex flex-wrap items-center gap-5 pt-4">
                
                {/* Count Pill */}
                <div className="flex items-center gap-3 rounded-2xl bg-white/75 dark:bg-espresso-900/90 px-6 py-3.5 shadow-xl shadow-black/5 border border-black/10 dark:border-white/10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-primary-hover">
                    <Bookmark className="h-5 w-5 fill-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-primary dark:text-primary-hover dark:text-primary dark:text-primary-hover">
                      {favoriteProducts.length} قطعة
                    </div>
                    <div className="text-[11px] font-bold text-espresso/50 dark:text-cream/50">
                      مستنياك هنا
                    </div>
                  </div>
                </div>

                {favoriteProducts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActivePage('products')}
                    className="group inline-flex items-center gap-3 rounded-2xl bg-primary px-7 py-4 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 hover:bg-primary/90 active:scale-95"
                  >
                    <span>شوف باقي السوق</span>
                    <ArrowUpLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1" />
                  </button>
                )}

              </div>

            </div>

            {/* FLOATING MASCOT CARD */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[380px] rounded-[36px] bg-white/75 dark:bg-espresso-900/90 p-8 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl shadow-black/10">
                
                {/* Floating Tag */}
                <div className="absolute -top-4 -left-4 z-20 flex items-center gap-2 rounded-full bg-primary text-white px-4 py-2 text-xs font-bold shadow-lg animate-pulse">
                  <Heart className="h-3.5 w-3.5 fill-white" />
                  <span>في المفضلات</span>
                </div>

                <div className="relative flex items-center justify-center min-h-[260px]">
                  <img
                    src="mascot/fav.png"
                    alt="شخصية وَه"
                    className="w-56 sm:w-64 object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] transition-transform duration-500 hover:rotate-3 hover:scale-105"
                  />
                </div>

                <div className="mt-4 text-center border-t border-black/5 dark:border-white/10 pt-4">
                  <span className="text-xs font-bold text-espresso/60 dark:text-cream/60">
                   كل اللى عجبك فى مكان واحد
                  </span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          SHOWCASE GRID
      ========================================================= */}
      {favoriteProducts.length > 0 ? (
        <section className="px-4 pb-28 sm:px-8 lg:px-20">
          <div className="mx-auto max-w-[1500px]">

            {/* Grid Header */}
            <div className="mb-10 flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary dark:text-primary-hover" />
                <span className="text-xs font-bold uppercase tracking-wider text-espresso/60 dark:text-cream/60">
                  الحاجات المحفوظة ({favoriteProducts.length})
                </span>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 gap-8 min-[420px]:grid-cols-2 lg:grid-cols-3">
              {favoriteProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-3xl bg-white/75 dark:bg-espresso-900/90 p-3 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:bg-white dark:hover:bg-espresso-800"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-24 text-center">
              <p className="text-xs font-bold text-espresso/40 dark:text-cream/40">
                دي كل القطع اللي اخترتها لحد دلوقتي، وكلها بضمان سوق وَه 
              </p>
            </div>

          </div>
        </section>
      ) : (
        /* =========================================================
            EMPTY STATE
        ========================================================= */
        <section className="px-4 pb-32 sm:px-8 lg:px-20">
          <div className="mx-auto flex max-w-[700px] flex-col items-center justify-center rounded-[40px] bg-white/75 dark:bg-espresso-900/90 p-10 sm:p-16 text-center backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-xl">
            
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary dark:text-primary-hover shadow-inner">
              <Heart className="h-10 w-10 opacity-70" strokeWidth={1.5} />
            </div>

            <img
              src="mascot/favbrock.png"
              alt="قائمة فارغة"
              className="w-48 sm:w-60 object-contain mb-6 transition-transform duration-500 hover:scale-105"
            />

            <h3 className="text-espresso dark:text-cream text-2xl font-black mb-3">
              لسه مفيش حاجات هنا خالص!
            </h3>

            <p className="text-sm text-espresso/60 dark:text-cream/60 max-w-md leading-7 mb-8">
              الفلف في سوق وَه براحتك، ولما تلاقي قطعة تعجبك دوس على القلب عشان تبات معانا هنا.
            </p>

            <button
              type="button"
              onClick={() => setActivePage('products')}
              className="inline-flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 text-xs font-bold text-white shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-primary/90"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>ادخل اتفرج على السوق</span>
            </button>

          </div>
        </section>
      )}
    </main>
  );
};
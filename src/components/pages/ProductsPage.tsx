import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProductFilters } from '../products/ProductFilters';
import { ProductGrid } from '../products/ProductGrid';
import { ShoppingBag, ChevronRight, Search, Sparkles, MapPin, ArrowLeft, ArrowUpLeft, X, Filter } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { setActivePage, searchQuery, setSearchQuery, products, activePage, categories, selectedCategoryFilter } = useApp();
  const approvedCount = products.filter((p) => p.approvalStatus === 'approved').length;

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
            <div className="mt-1 text-sm font-black">سوق وه التراثي</div>
          </div>

          <button
            onClick={() => setActivePage('categories')}
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
            <span className="hidden sm:block">الأقسام والتصنيفات</span>
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
                  Upper Egypt Marketplace / Crafts & Goods
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
                روائع
                <br />
                <span className="mr-[8vw] text-[#9a6a35] lg:mr-28">الصعيد</span>
              </h1>

              <div className="mt-10 flex max-w-2xl items-start gap-5">
                <div className="mt-2 h-16 w-px bg-[#9a6a35]" />
                <p className="text-sm leading-8 text-black/55 dark:text-white/55 sm:text-base">
                  تصفح مئات القطع الحصرية المصنوعة يدوياً بأنامل الأسطوات: فخار قنا، كليم وسجاد أخميم، تلي أسيوط، خوص النوبة، وعسل سدر الجبل.
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
                      AUTHENTIC STORE
                    </span>
                    <ShoppingBag size={18} className="text-[#9a6a35]" />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-5xl font-black tracking-[-0.05em]">
                        {approvedCount}
                      </div>
                      <div className="mt-2 text-xs text-black/45 dark:text-white/45">
                        قطعة معتمدة ومتاحة
                      </div>
                    </div>

                    <div>
                      <div className="text-5xl font-black tracking-[-0.05em]">
                        {categories.length}
                      </div>
                      <div className="mt-2 text-xs text-black/45 dark:text-white/45">
                        أقسام وتصنيفات رئيسية
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex items-center gap-3 border-t border-black/10 pt-5 dark:border-white/10">
                    <div className="h-2 w-2 rounded-full bg-[#9a6a35]" />
                    <span className="text-xs font-bold">
                      شحن سريع لجميع محافظات مصر
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FLOATING SEARCH & FILTER BAR
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
          <div className="flex flex-col gap-3 lg:flex-row items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
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
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، المحافظة، أو الخامة (مثال: فخار قنا، كليم سوهاج)..."
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

            {/* Total Badge */}
            <div
              className="
                flex items-center justify-between w-full lg:w-auto
                rounded-xl
                bg-[#211d18]
                px-6 h-12
                text-white
                dark:bg-white
                dark:text-black
                shrink-0
              "
            >
              <div className="flex items-center gap-2">
                <ShoppingBag size={14} />
                <span className="text-xs font-bold">
                  {approvedCount} منتج متاح
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCT FILTERS COMPONENT
      ===================================================== */}
      <section className="mx-auto max-w-[1600px] px-5 pt-8 sm:px-8 lg:px-12">
        <ProductFilters />
      </section>

      {/* =====================================================
          PRODUCT RESULTS GRID SECTION
      ===================================================== */}
      <section className="mx-auto max-w-[1600px] px-5 pb-24 pt-10 sm:px-8 lg:px-12">
        <div className="mb-8 flex items-center justify-between text-xs text-black/50 dark:text-white/50 px-1 font-semibold">
          <span>
            سوق وه للحرف التراثية والمنتجات اليدوية الأصلية
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5">
            <MapPin size={13} className="text-[#9a6a35]" />
            <span>صنع ببركة وخبرة أجداد الصعيد</span>
          </span>
        </div>

        <ProductGrid />
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
                  SUPPORT LOCAL ARTISANS
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
                  اقتني قطعة تاريخية...
                  <br />
                  وادعم إيد الصانع الأصلي.
                </h2>
              </div>

              <p className="text-sm leading-8 text-white/55">
                كل عملية شراء من سوق وه تساهم بشكل مباشر في الحفاظ على استمرار الحرف التراثية ودعم أسر الصانعين في قرى الصعيد.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
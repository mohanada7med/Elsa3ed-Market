import React from 'react';
import { ArrowLeft, ShoppingBasket } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductGrid } from '../products/ProductGrid';

export const HomeMarketSection: React.FC = () => {
  const { setActivePage } = useApp();

  return (
    <section
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 650px' }}
      className="relative mx-auto max-w-[1600px] select-none overflow-hidden px-4 py-5 text-foreground sm:px-8 sm:py-8 lg:px-12"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.04] mix-blend-screen"
        style={{
          backgroundImage: "url('/pattern/pat2.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '520px auto',
          backgroundPosition: 'center',
          maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mb-6 sm:mb-16">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[9px] font-black tracking-[0.2em] text-primary dark:text-primary-hover sm:mb-6 sm:gap-3 sm:text-[10px] sm:tracking-[0.28em]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 sm:h-8 sm:w-8">
                <ShoppingBasket size={13} className="text-accent sm:h-[14px] sm:w-[14px]" />
              </span>
              BEST SELLERS / الأكتر طلبًا وإقبالًا
            </div>

            <h1 className="flex max-w-6xl flex-col items-start gap-1 text-3xl font-black leading-[0.95] tracking-tight xs:text-4xl sm:gap-2 sm:text-6xl md:text-7xl lg:text-7xl xl:text-[7.5rem]">
              <span>سوق</span>
              <span className="inline-flex items-center gap-3 sm:gap-5">
                <span className="text-primary dark:text-primary-hover">وه</span>
                <span className="relative inline-flex h-16 w-16 rotate-[-7deg] items-center justify-center transition-all duration-500 hover:rotate-0 hover:scale-110 sm:h-32 sm:w-32 lg:h-35 lg:w-32">
                  <span className="absolute left-1/2 top-1 h-8 w-10 -translate-x-1/2 rounded-t-full border-[4px] border-b-0 border-[#704323] dark:border-[#D6A56B] sm:h-16 sm:w-20 sm:border-[7px]" />
                  <span className="absolute bottom-2.5 left-1.5 right-1.5 h-10 overflow-hidden rounded-b-xl border-[4px] border-[#704323] bg-gradient-to-br from-[#D6A56B] via-[#B77A45] to-[#80502E] shadow-[inset_0_3px_5px_#ffffff55,0_7px_0_#59351F,0_12px_15px_#00000030] sm:bottom-4 sm:left-2 sm:right-2 sm:h-14 sm:rounded-b-2xl sm:border-[5px]">
                    <span className="absolute inset-0 grid grid-cols-4">
                      {[1, 2, 3, 4].map((item) => (
                        <span key={item} className="border-r-[3px] border-[#704323]/60" />
                      ))}
                    </span>
                    <span className="absolute inset-0 grid grid-rows-3">
                      {[1, 2, 3].map((item) => (
                        <span key={item} className="border-b-[3px] border-[#704323]/60" />
                      ))}
                    </span>
                    <span className="absolute left-2 top-1 h-2 w-8 rounded-full bg-white/30 blur-[2px]" />
                  </span>
                  <span className="absolute bottom-1 left-5 h-3 w-3 rounded-full bg-[#3B2113] shadow-[inset_0_1px_2px_#ffffff55] sm:h-4 sm:w-4" />
                  <span className="absolute bottom-1 right-5 h-3 w-3 rounded-full bg-[#3B2113] shadow-[inset_0_1px_2px_#ffffff55] sm:h-4 sm:w-4" />
                  <span className="absolute -right-1 -top-1 animate-pulse text-xl text-[#D6A56B] sm:text-3xl">✦</span>
                </span>
              </span>
            </h1>

            <div className="mt-4 grid max-w-3xl items-start gap-2 sm:mt-8 sm:gap-6 sm:grid-cols-[80px_1fr]">
              <div className="hidden sm:block">
                <div className="text-[10px] font-black tracking-[0.2em] text-foreground-disabled">منتجات وه</div>
                <div className="mt-3 h-px w-10 bg-accent" />
              </div>
              <p className="max-w-2xl text-xs font-medium leading-6 text-foreground-secondary sm:text-base sm:leading-8">
                حاجات ناس كتير جربوها وحبوها، وبتحكي عن تراث الصعيد وأصالته
              </p>
            </div>
          </div>

          <div className="lg:pb-3">
            <button
              type="button"
              onClick={() => setActivePage('products')}
              className="inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-btn-dark px-6 py-3.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-primary active:scale-95"
            >
              <span>شوف كل المنتجات</span>
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <ProductGrid limit={8} mobileLimit={4} compactCards />
      </div>
    </section>
  );
};

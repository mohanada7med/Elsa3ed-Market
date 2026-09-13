import React from 'react';
import { Compass, Home, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotFoundPage: React.FC = () => {
  const { setActivePage } = useApp();

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-5 sm:px-8 py-16" dir="rtl">
      <div className="max-w-lg w-full bg-white/75 dark:bg-espresso-900/90 backdrop-blur-xl rounded-[2rem] p-8 sm:p-12 text-center border border-black/10 dark:border-white/10 shadow-xl">
        <div className="w-20 h-20 bg-primary/15 text-primary dark:text-primary-hover rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/25">
          <Compass className="w-10 h-10" aria-hidden="true" />
        </div>

        <span className="inline-block px-3.5 py-1 bg-primary/15 text-primary dark:text-primary-hover rounded-full text-xs font-bold tracking-wider uppercase mb-3 border border-primary/25">
          كود الخطأ: 404
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-espresso dark:text-cream mb-3 font-serif">
          الصفحة دي مش موجودة
        </h1>

        <p className="text-espresso/70 dark:text-cream/70 text-sm sm:text-base leading-relaxed mb-8">
          شكلك تهت في دروب وسكك وه، أو الصفحة دي اتنقلت أو عنوانها اتغير.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            id="not-found-home-btn"
            type="button"
            onClick={() => setActivePage('home')}
            className="flex items-center justify-center gap-2 bg-espresso text-white dark:bg-cream dark:text-black hover:bg-primary dark:hover:bg-primary-hover px-6 py-3.5 rounded-[1.25rem] font-black transition-all shadow-lg cursor-pointer text-sm"
          >
            <Home className="w-5 h-5" aria-hidden="true" />
            <span>ارجع للرئيسية</span>
          </button>

          <button
            id="not-found-products-btn"
            type="button"
            onClick={() => setActivePage('products')}
            className="flex items-center justify-center gap-2 bg-black/5 dark:bg-cream/5 hover:bg-black/10 dark:hover:bg-white/10 text-espresso dark:text-cream px-6 py-3.5 rounded-[1.25rem] font-bold transition-colors border border-black/10 dark:border-white/10 cursor-pointer text-sm"
          >
            <ShoppingBag className="w-5 h-5" aria-hidden="true" />
            <span>تصفح منتجات سوق وه</span>
          </button>
        </div>
      </div>
    </div>
  );
};

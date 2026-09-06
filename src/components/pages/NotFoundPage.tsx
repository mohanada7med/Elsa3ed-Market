import React from 'react';
import { Compass, Home, ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotFoundPage: React.FC = () => {
  const { setActivePage } = useApp();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16" dir="rtl">
      <div className="max-w-lg w-full bg-[var(--wah-surface,#FFFFFF)] dark:bg-[var(--wah-surface,#1B1613)] rounded-3xl p-8 sm:p-12 text-center border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] shadow-xl">
        <div className="w-20 h-20 bg-[var(--wah-primary-light,#F7ECE6)] dark:bg-[var(--wah-primary-light,rgba(224,99,60,0.15))] text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[var(--wah-primary,#B24C2B)]/20 shadow-inner">
          <Compass className="w-10 h-10" aria-hidden="true" />
        </div>

        <span className="inline-block px-3 py-1 bg-[var(--wah-primary-light,#F7ECE6)] dark:bg-[var(--wah-primary-light,rgba(224,99,60,0.15))] text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] rounded-full text-xs font-bold tracking-wider uppercase mb-3 border border-[var(--wah-primary,#B24C2B)]/20">
          رمز الخطأ: 404
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] mb-3 font-serif">
          الصفحة المطلوبة غير موجودة
        </h1>

        <p className="text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] text-base leading-relaxed mb-8">
          يبدو أنك سلكت مساراً غير موجود في أزقة وه. قد تكون الصفحة قد نُقلت أو تم تعديل رابطها.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            id="not-found-home-btn"
            type="button"
            onClick={() => setActivePage('home')}
            className="flex items-center justify-center gap-2 bg-[var(--wah-primary,#B24C2B)] hover:bg-[var(--wah-primary-hover,#963E21)] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <Home className="w-5 h-5" aria-hidden="true" />
            <span>العودة للرئيسية</span>
          </button>

          <button
            id="not-found-products-btn"
            type="button"
            onClick={() => setActivePage('products')}
            className="flex items-center justify-center gap-2 bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)] hover:bg-[var(--wah-border,#E5DDD3)] dark:hover:bg-[var(--wah-border,#352B24)] text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] px-6 py-3 rounded-xl font-bold transition-colors border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" aria-hidden="true" />
            <span>تصفح المنتجات التراثية</span>
          </button>
        </div>
      </div>
    </div>
  );
};

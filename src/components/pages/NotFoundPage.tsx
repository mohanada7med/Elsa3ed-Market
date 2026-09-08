import React from 'react';
import { Compass, Home, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotFoundPage: React.FC = () => {
  const { setActivePage } = useApp();

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-5 sm:px-8 py-16" dir="rtl">
      <div className="max-w-lg w-full bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] p-8 sm:p-12 text-center border border-black/10 dark:border-white/10 shadow-xl">
        <div className="w-20 h-20 bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#9a6a35]/25">
          <Compass className="w-10 h-10" aria-hidden="true" />
        </div>

        <span className="inline-block px-3.5 py-1 bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d] rounded-full text-xs font-bold tracking-wider uppercase mb-3 border border-[#9a6a35]/25">
          رمز الخطأ: 404
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-[#211d18] dark:text-[#f5f0e7] mb-3 font-serif">
          الصفحة المطلوبة غير موجودة
        </h1>

        <p className="text-[#211d18]/70 dark:text-[#f5f0e7]/70 text-sm sm:text-base leading-relaxed mb-8">
          يبدو أنك سلكت مساراً غير موجود في أزقة وه. قد تكون الصفحة قد نُقلت أو تم تعديل رابطها.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            id="not-found-home-btn"
            type="button"
            onClick={() => setActivePage('home')}
            className="flex items-center justify-center gap-2 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] px-6 py-3.5 rounded-[1.25rem] font-black transition-all shadow-lg cursor-pointer text-sm"
          >
            <Home className="w-5 h-5" aria-hidden="true" />
            <span>العودة للرئيسية</span>
          </button>

          <button
            id="not-found-products-btn"
            type="button"
            onClick={() => setActivePage('products')}
            className="flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] px-6 py-3.5 rounded-[1.25rem] font-bold transition-colors border border-black/10 dark:border-white/10 cursor-pointer text-sm"
          >
            <ShoppingBag className="w-5 h-5" aria-hidden="true" />
            <span>تصفح المنتجات التراثية</span>
          </button>
        </div>
      </div>
    </div>
  );
};

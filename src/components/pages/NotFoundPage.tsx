import React from 'react';
import { Compass, Home, ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotFoundPage: React.FC = () => {
  const { setActivePage } = useApp();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16" dir="rtl">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#ecdccf] shadow-lg">
        <div className="w-20 h-20 bg-amber-50 text-[#9a3412] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <span className="inline-block px-3 py-1 bg-amber-100 text-[#9a3412] rounded-full text-xs font-bold tracking-wider uppercase mb-3">
          رمز الخطأ: 404
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold text-[#29221d] mb-3 font-serif">
          الصفحة المطلوبة غير موجودة
        </h1>

        <p className="text-[#6e5d4f] text-base leading-relaxed mb-8">
          يبدو أنك سلكت مساراً غير موجود في أزقة سوق الصعيد. قد تكون الصفحة قد نُقلت أو تم تعديل رابطها.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            id="not-found-home-btn"
            onClick={() => setActivePage('home')}
            className="flex items-center justify-center gap-2 bg-[#9a3412] hover:bg-[#7c2d12] text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
          >
            <Home className="w-5 h-5" />
            <span>العودة لبوابة السوق</span>
          </button>

          <button
            id="not-found-products-btn"
            onClick={() => setActivePage('products')}
            className="flex items-center justify-center gap-2 bg-[#f5ebe1] hover:bg-[#eddcd0] text-[#7c2d12] px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>تصفح المنتجات التراثية</span>
          </button>
        </div>
      </div>
    </div>
  );
};

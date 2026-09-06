import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProductFilters } from '../products/ProductFilters';
import { ProductGrid } from '../products/ProductGrid';
import { ShoppingBag, ChevronRight, Search, Sparkles, MapPin } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { setActivePage, searchQuery, setSearchQuery, products } = useApp();
  const approvedCount = products.filter((p) => p.approvalStatus === 'approved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#7A6F64] dark:text-[#A89C90] font-medium">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#B45F42] dark:hover:text-[#FF855D] transition-colors cursor-pointer"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-[#CBBDB0]" />
        <span className="text-[#2D2A26] dark:text-[#FAF6F2] font-bold">سوق وه للحرف التراثية</span>
      </nav>

      {/* Modern Upper Egyptian Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#B45F42] dark:bg-[#1E1815] text-white p-6 sm:p-10 border border-[#E8E1D9] dark:border-[#382E27] shadow-sm">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 bg-heritage-pattern opacity-10 dark:opacity-20 pointer-events-none" />

        <div className="relative z-10 max-w-2xl text-right space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 dark:bg-white/10 text-amber-200 text-xs font-bold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>تسوق مباشر ومضمون من ورش شيوخ الصنعة بالصعيد</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-heritage leading-tight tracking-tight">
            روائع الحرف اليدوية وخيرات الصعيد الطبيعية
          </h1>

          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed max-w-xl">
            تصفح مئات القطع الحصرية المصنوعة يدوياً بأنامل الأسطوات: فخار قنا، كليم وسجاد أخميم، تلي أسيوط، خوص النوبة، وعسل سدر الجبل.
          </p>

          {/* Search bar inside header */}
          <div className="pt-2">
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، المحافظة، أو الخامة (مثال: فخار قنا، كليم سوهاج)..."
                className="w-full pl-4 pr-11 py-3 bg-white dark:bg-[#1B1613] text-[#2D2A26] dark:text-[#FAF6F2] rounded-xl text-xs sm:text-sm outline-none shadow-md placeholder:text-[#8C7E72] dark:placeholder:text-[#7A6F64] border border-transparent focus:border-amber-300 dark:focus:border-[#FF855D]"
              />
              <Search className="w-4 h-4 text-[#B45F42] dark:text-amber-400 absolute right-3.5 top-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Component */}
      <ProductFilters />

      {/* Product Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#7A6F64] dark:text-[#A89C90] px-1 font-semibold">
          <span>
            إجمالي المعروضات المعتمدة: <strong className="text-[#B45F42] dark:text-[#FF855D]">{approvedCount}</strong> قطعة
          </span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>شحن سريع لجميع محافظات جمهورية مصر العربية</span>
          </span>
        </div>

        <ProductGrid />
      </div>
    </div>
  );
};

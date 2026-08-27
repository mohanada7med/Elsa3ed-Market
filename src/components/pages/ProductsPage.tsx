import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProductFilters } from '../products/ProductFilters';
import { ProductGrid } from '../products/ProductGrid';
import { ShoppingBag, ChevronRight, Search } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { setActivePage, searchQuery, setSearchQuery, products } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#8c6b53]">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#943310] transition-colors"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="text-gray-900 font-bold">سوق المنتجات والحرف التراثية</span>
      </nav>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#943310] to-[#b4431a] rounded-3xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl text-right space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-200 text-xs font-bold">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>السوق المباشر من الصعيد</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-heritage leading-tight">
            استكشف أندر القطع اليدوية والخيرات الطبيعية
          </h1>

          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
            تصفح مئات المنتجات الأصلية المصنوعة يدوياً من الفخار، الكليم، الخوص، التلي، والعسل، مع إمكانية التصفية حسب المحافظة أو الحرفة.
          </p>

          {/* Search bar inside page header */}
          <div className="pt-2">
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، المحافظة، أو الحرفة (مثال: فخار قنا، كليم سوهاج)..."
                className="w-full pl-4 pr-10 py-3 bg-white text-gray-900 rounded-xl text-xs sm:text-sm outline-none shadow-md placeholder-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Component */}
      <ProductFilters />

      {/* Product Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#8c6b53] px-1">
          <span className="font-bold">
            إجمالي المنتجات المتاحة في الكتالوج: {products.filter((p) => p.approvalStatus === 'approved').length} قطعة
          </span>
        </div>

        <ProductGrid />
      </div>
    </div>
  );
};

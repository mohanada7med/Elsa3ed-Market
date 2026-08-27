import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { Product } from '../../types';
import { Sparkles, PackageOpen, RefreshCw } from 'lucide-react';

interface ProductGridProps {
  customProducts?: Product[];
  limit?: number;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ customProducts, limit }) => {
  const {
    products,
    searchQuery,
    selectedGovernorateFilter,
    selectedCategoryFilter,
    selectedHandmadeOnly,
    selectedSort,
    setSelectedGovernorateFilter,
    setSelectedCategoryFilter,
    setSelectedHandmadeOnly,
    setSearchQuery
  } = useApp();

  const sourceProducts = customProducts || products;

  const filteredProducts = useMemo(() => {
    let result = sourceProducts.filter((p) => p.approvalStatus === 'approved');

    // Search query filter (normalize Arabic text)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sellerName.toLowerCase().includes(q) ||
          p.sellerGovernorate.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Governorate Filter
    if (selectedGovernorateFilter !== 'all' && !customProducts) {
      result = result.filter((p) => p.sellerGovernorate === selectedGovernorateFilter);
    }

    // Category Filter
    if (selectedCategoryFilter !== 'all' && !customProducts) {
      result = result.filter((p) => p.categoryId === selectedCategoryFilter);
    }

    // Handmade only
    if (selectedHandmadeOnly && !customProducts) {
      result = result.filter((p) => p.isHandmade);
    }

    // Sorting
    if (selectedSort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (selectedSort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (selectedSort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // featured default
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    if (limit) {
      return result.slice(0, limit);
    }

    return result;
  }, [
    sourceProducts,
    searchQuery,
    selectedGovernorateFilter,
    selectedCategoryFilter,
    selectedHandmadeOnly,
    selectedSort,
    limit,
    customProducts
  ]);

  if (filteredProducts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#ebdccd] p-12 text-center my-6">
        <div className="w-16 h-16 rounded-full bg-[#f3ebd9] text-[#943310] flex items-center justify-center mx-auto mb-4">
          <PackageOpen className="w-8 h-8 opacity-70" />
        </div>
        <h3 className="font-bold text-gray-900 text-lg">لم يتم العثور على منتجات مطابقة</h3>
        <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
          جرب تغيير كلمات البحث، أو إلغاء بعض الفلاتر لاستكشاف المزيد من روائع الحرف التراثية الصعيدية.
        </p>
        <button
          type="button"
          onClick={() => {
            setSelectedGovernorateFilter('all');
            setSelectedCategoryFilter('all');
            setSelectedHandmadeOnly(false);
            setSearchQuery('');
          }}
          className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#943310] hover:bg-[#7c280a] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>إعادة ضبط البحث والتصفية</span>
        </button>
      </div>
    );
  }

  return (
    <div
      id="products-grid-container"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
    >
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

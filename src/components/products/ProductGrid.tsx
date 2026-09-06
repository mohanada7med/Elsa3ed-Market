import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { Product } from '../../types';
import { WAHEmptyState } from '../../design-system/WAHEmptyState';
import { PackageOpen } from 'lucide-react';

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
      <WAHEmptyState
        icon={PackageOpen}
        title="لم يتم العثور على قطع مطابقة"
        description="جرب تغيير كلمات البحث، أو إلغاء بعض الفلاتر لاستكشاف المزيد من روائع الحرف التراثية الصعيدية الأصيلة."
        actionLabel="إعادة ضبط البحث والتصفية"
        onAction={() => {
          setSelectedGovernorateFilter('all');
          setSelectedCategoryFilter('all');
          setSelectedHandmadeOnly(false);
          setSearchQuery('');
        }}
      />
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

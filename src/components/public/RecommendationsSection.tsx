import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from '../products/ProductCard';
import { Sparkles, ArrowLeft, Home, Utensils, Gift } from 'lucide-react';

export const RecommendationsSection: React.FC = () => {
  const { products, setActivePage, setSelectedCategoryFilter } = useApp();
  const [activeMood, setActiveMood] = useState<'decor' | 'food' | 'gifts'>('decor');

  const decorProducts = products
    .filter((p) => (p.categoryId === 'pottery' || p.categoryId === 'kilim-carpets' || p.categoryId === 'palm-wicker') && p.approvalStatus === 'approved')
    .slice(0, 4);

  const foodProducts = products
    .filter((p) => (p.categoryId === 'honey-herbs' || p.categoryId === 'dates-crops') && p.approvalStatus === 'approved')
    .slice(0, 4);

  const giftProducts = products
    .filter((p) => (p.categoryId === 'tally-embroidery' || p.categoryId === 'copper-wood' || p.categoryId === 'incense-fragrance') && p.approvalStatus === 'approved')
    .slice(0, 4);

  const displayedProducts =
    activeMood === 'decor' ? decorProducts : activeMood === 'food' ? foodProducts : giftProducts;

  return (
    <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#943310]/10 text-[#943310] text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>ترشيحات وتشكيلات منسقة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-heritage">
            تشكيلات مختارة بعناية لأجلك
          </h2>
          <p className="text-xs sm:text-sm text-[#8c6b53] mt-1">
            مجموعات منتقاة لتزيين المنزل، أو لمائدتك الصحية، أو هدايا تراثية تخلد الذكريات
          </p>
        </div>

        {/* Mood Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-[#f4ebe1] p-1.5 rounded-2xl border border-[#ebdccd]">
          <button
            type="button"
            onClick={() => setActiveMood('decor')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeMood === 'decor'
                ? 'bg-[#943310] text-white shadow-xs'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>ديكور ومنزل</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMood('food')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeMood === 'food'
                ? 'bg-[#943310] text-white shadow-xs'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>مائدة وخيرات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMood('gifts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeMood === 'gifts'
                ? 'bg-[#943310] text-white shadow-xs'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>هدايا فاخرة</span>
          </button>
        </div>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {displayedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

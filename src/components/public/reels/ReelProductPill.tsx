import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext.tsx';
import { CraftReel } from '../../../types.ts';
import { ShoppingBag, Check, ArrowUpLeft, Sparkles } from 'lucide-react';

interface ReelProductPillProps {
  reel: CraftReel;
  onSelectProduct?: (productId: string) => void;
  onCloseParent?: () => void;
}

export const ReelProductPill: React.FC<ReelProductPillProps> = ({
  reel,
  onSelectProduct,
  onCloseParent
}) => {
  const { addToCart, products, navigateToProduct, addToast } = useApp();
  const [isAdded, setIsAdded] = useState(false);

  if (!reel.productId || !reel.productTitle) return null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fullProduct = products.find((p) => p.id === reel.productId) || {
      id: reel.productId,
      title: reel.productTitle,
      price: reel.productPrice,
      originalPrice: reel.productOriginalPrice,
      images: [reel.productImage],
      rating: reel.productRating || 5,
      reviewCount: 12,
      inStock: reel.inStock ?? true,
      stockCount: 10,
      categoryId: 'crafts',
      categoryName: reel.craftType,
      sellerId: reel.sellerId,
      sellerName: reel.workshopName,
      sellerGovernorate: reel.governorate,
      description: reel.description,
      specifications: {
        material: reel.craftType,
        originGovernorate: reel.governorate,
        craftsmanship: 'صناعة يدوية أصيلة'
      },
      tags: reel.hashtags || [],
      isHandmade: true,
      isHeritage: true,
      createdAt: reel.createdAt,
      approvalStatus: 'approved'
    };

    addToCart(fullProduct, 1);
    setIsAdded(true);
    addToast('أُضيف إلى السلة', `تمت إضافة "${reel.productTitle}" لسلة مشترياتك`, 'success');
    setTimeout(() => setIsAdded(false), 2400);
  };

  const handleOpenProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCloseParent) onCloseParent();
    if (onSelectProduct) {
      onSelectProduct(reel.productId);
    } else {
      navigateToProduct(reel.productId);
    }
  };

  return (
    <div
      onClick={handleOpenProduct}
      id={`reel-product-pill-${reel.id}`}
      className="inline-flex items-center gap-2 p-1.5 pr-2 pl-2 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 rounded-full shadow-lg transition-all duration-200 cursor-pointer group max-w-full"
      role="button"
      tabIndex={0}
      aria-label={`عرض منتج ${reel.productTitle}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleOpenProduct(e as any);
        }
      }}
    >
      {/* Product Mini Thumbnail */}
      <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/30 bg-neutral-900">
        <img
          src={reel.productImage}
          alt={reel.productTitle}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Product Title & Price */}
      <div className="min-w-0 max-w-[150px] sm:max-w-[200px] text-right">
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold text-white truncate block">
            {reel.productTitle}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-extrabold text-amber-400">
            {reel.productPrice} ج.م
          </span>
          {reel.productOriginalPrice && reel.productOriginalPrice > reel.productPrice && (
            <span className="text-[9px] text-gray-400 line-through">
              {reel.productOriginalPrice}
            </span>
          )}
        </div>
      </div>

      {/* Compact Quick Action Button */}
      <button
        type="button"
        id={`reel-quick-buy-${reel.id}`}
        onClick={handleQuickAdd}
        className={`px-2.5 py-1 text-[11px] font-bold rounded-full flex items-center gap-1 transition-all duration-200 shrink-0 cursor-pointer ${
          isAdded
            ? 'bg-emerald-600 text-white'
            : 'bg-[#B45F42] hover:bg-[#9E4F36] text-white active:scale-95'
        }`}
        title="إضافة سريعة إلى السلة"
        aria-label="إضافة سريعة إلى السلة"
      >
        {isAdded ? (
          <>
            <Check className="w-3 h-3 text-white" />
            <span className="hidden xs:inline">أُضيف</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-3 h-3 text-white" />
            <span>شراء</span>
          </>
        )}
      </button>

      {/* Subtle Arrow Icon */}
      <span className="text-white/60 group-hover:text-white group-hover:translate-x-0.5 transition-all text-xs pl-0.5">
        <ArrowUpLeft className="w-3.5 h-3.5" />
      </span>
    </div>
  );
};

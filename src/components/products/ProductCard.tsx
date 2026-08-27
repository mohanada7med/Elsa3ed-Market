import React from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { Heart, ShoppingBag, Star, Sparkles, MapPin, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    navigateToProduct,
    addToCart,
    toggleFavorite,
    isFavorite,
    navigateToSeller
  } = useApp();

  if (!product || !product.id) {
    return null;
  }

  const favorite = isFavorite(product.id);
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      id={`product-card-${product.id}`}
      className="geometric-card flex flex-col overflow-hidden group relative bg-white"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F3EFE9]">
        <img
          src={primaryImage}
          alt={product.title}
          onClick={() => navigateToProduct(product.id)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          loading="lazy"
        />

        {/* Heritage & Handmade Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.discountPercent && product.discountPercent > 0 && (
            <span className="bg-[#B45F42] text-white text-[11px] font-black px-2 py-0.5 rounded shadow-xs self-start">
              خصم {product.discountPercent}%
            </span>
          )}
          {product.isHandmade && (
            <span className="bg-amber-100/95 text-[#B45F42] text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs border border-amber-300/40 shadow-xs flex items-center gap-1 self-start">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>يدوي أصيل</span>
            </span>
          )}
        </div>

        {/* Favorite & Quick View Buttons */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <button
            type="button"
            id={`fav-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
            className={`p-2 rounded-md backdrop-blur-md transition-all shadow-xs ${
              favorite
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 hover:bg-white text-gray-700 hover:text-rose-500 border border-[#E8E1D9]'
            }`}
            title={favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            aria-label={favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          >
            <Heart className="w-4 h-4" fill={favorite ? 'currentColor' : 'none'} />
          </button>

          <button
            type="button"
            id={`quick-view-btn-${product.id}`}
            onClick={() => navigateToProduct(product.id)}
            className="p-2 rounded-md bg-white/90 hover:bg-white text-[#2D2A26] hover:text-[#B45F42] border border-[#E8E1D9] backdrop-blur-md transition-all shadow-xs opacity-0 group-hover:opacity-100 hidden sm:block"
            title="معاينة التفاصيل"
            aria-label="معاينة التفاصيل"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Governorate pill at bottom of image */}
        <div className="absolute bottom-2 right-2 z-10">
          <span className="bg-[#231F1C]/85 text-amber-100 text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-md border border-white/10 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>صعيد مصر ({product.sellerGovernorate})</span>
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Seller / Workshop Link */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <button
              type="button"
              id={`seller-link-${product.sellerId}`}
              onClick={() => navigateToSeller(product.sellerId)}
              className="text-[11px] font-medium text-[#7A6F64] hover:text-[#B45F42] transition-colors truncate text-right"
            >
              {product.sellerName}
            </button>

            {/* Rating Stars */}
            <div className="flex items-center gap-1 text-xs shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-bold text-[#2D2A26] text-[11px]">{product.rating}</span>
              <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => navigateToProduct(product.id)}
            className="font-bold text-[#2D2A26] text-sm leading-snug hover:text-[#B45F42] transition-colors cursor-pointer line-clamp-2 mb-2"
          >
            {product.title}
          </h3>
        </div>

        {/* Pricing & Add To Cart Button */}
        <div className="pt-3 border-t border-[#E8E1D9] flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-[#B45F42]">
                {product.price} ج.م
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  {product.originalPrice} ج.م
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold block">
              {product.inStock ? `متوفر (${product.stockCount} قطعة)` : 'غير متوفر حالياً'}
            </span>
          </div>

          <button
            type="button"
            id={`add-cart-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            disabled={!product.inStock}
            className="p-2.5 rounded-lg bg-[#B45F42] hover:bg-[#9E4F36] disabled:bg-gray-300 text-white shadow-xs transition-all flex items-center justify-center shrink-0"
            title="إضافة إلى سلة المشتريات"
            aria-label="إضافة إلى سلة المشتريات"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

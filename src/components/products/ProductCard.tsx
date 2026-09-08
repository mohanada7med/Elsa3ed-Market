import React from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { Heart, ShoppingBag, Star, Sparkles, MapPin, Eye, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { WAHBadge } from '../../design-system/WAHBadge';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    navigateToProduct,
    addToCart,
    toggleFavorite,
    isFavorite,
    navigateToSeller,
    currentRole,
    isAuthenticated
  } = useApp();

  if (!product || !product.id) {
    return null;
  }

  const favorite = isFavorite(product.id);
  const primaryImage =
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80';

  return (
    <motion.div
      id={`product-card-${product.id}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="flex flex-col overflow-hidden group relative transition-all duration-300 rounded-[1.5rem] bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 hover:border-[#9a6a35]/40 dark:hover:border-[#9a6a35]/50 shadow-lg hover:shadow-xl"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-black/5 dark:bg-white/5">
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
            <span className="bg-[#9a6a35] text-white text-[11px] font-black px-2.5 py-0.5 rounded-md shadow-xs self-start">
              خصم {product.discountPercent}%
            </span>
          )}
          {product.isHandmade && (
            <WAHBadge variant="ochre" size="sm" icon={<Sparkles className="w-3 h-3 text-amber-600" />}>
              يدوي أصيل
            </WAHBadge>
          )}
        </div>

        {/* Favorite & Quick View Buttons */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {(currentRole === 'buyer' || !isAuthenticated) && (
            <motion.button
              type="button"
              id={`fav-btn-${product.id}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(product.id);
              }}
              className={`p-2.5 rounded-xl backdrop-blur-md transition-all shadow-xs min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer ${
                favorite
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/90 dark:bg-[#151513]/90 hover:bg-white dark:hover:bg-[#20201d] text-[#211d18] dark:text-[#f5f0e7] hover:text-rose-500 border border-black/10 dark:border-white/10'
              }`}
              title={favorite ? `إزالة ${product.title} من المفضلة` : `إضافة ${product.title} للمفضلة`}
              aria-label={favorite ? `إزالة ${product.title} من المفضلة` : `إضافة ${product.title} للمفضلة`}
            >
              <Heart className="w-4 h-4" fill={favorite ? 'currentColor' : 'none'} />
            </motion.button>
          )}

          <motion.button
            type="button"
            id={`quick-view-btn-${product.id}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateToProduct(product.id)}
            className="p-2.5 rounded-xl bg-white/90 dark:bg-[#151513]/90 hover:bg-white dark:hover:bg-[#20201d] text-[#211d18] dark:text-[#f5f0e7] hover:text-[#9a6a35] dark:hover:text-[#d5a56d] border border-black/10 dark:border-white/10 backdrop-blur-md transition-all shadow-xs opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer"
            title={`معاينة تفاصيل ${product.title}`}
            aria-label={`معاينة تفاصيل ${product.title}`}
          >
            <Eye className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Governorate pill at bottom of image */}
        {product.sellerGovernorate && (
          <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none">
            <span className="bg-[#211d18]/85 text-[#f5f0e7] text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-1 shadow-xs">
              <MapPin className="w-3 h-3 text-[#9a6a35]" />
              <span>صعيد مصر ({product.sellerGovernorate})</span>
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between bg-white/75 dark:bg-[#151513]/90">
        <div>
          {/* Seller / Workshop Link */}
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <button
              type="button"
              id={`seller-link-${product.sellerId}`}
              onClick={() => navigateToSeller(product.sellerId)}
              aria-label={`زيارة ورشة الحرفي ${product.sellerName}`}
              className="text-xs font-bold text-black/60 dark:text-white/60 hover:text-[#9a6a35] dark:hover:text-[#d5a56d] transition-colors truncate text-right cursor-pointer"
            >
              {product.sellerName}
            </button>

            {/* Rating Stars */}
            <div
              className="flex items-center gap-1 text-xs shrink-0"
              aria-label={`التقييم ${product.rating} من 5 نجوم بناء على ${product.reviewCount} تقييم`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-bold text-[#211d18] dark:text-[#f5f0e7] text-xs">
                {product.rating}
              </span>
              <span className="text-[10px] text-black/40 dark:text-white/40">
                ({product.reviewCount})
              </span>
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => navigateToProduct(product.id)}
            role="button"
            tabIndex={0}
            aria-label={`عرض تفاصيل المنتج: ${product.title}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateToProduct(product.id);
              }
            }}
            className="font-bold text-[#211d18] dark:text-[#f5f0e7] text-sm leading-snug hover:text-[#9a6a35] dark:hover:text-[#d5a56d] transition-colors cursor-pointer line-clamp-2 mb-2"
          >
            {product.title}
          </h3>
        </div>

        {/* Pricing & Add To Cart Button */}
        <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-[#9a6a35] dark:text-[#d5a56d]">
                {product.price} ج.م
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-black/40 dark:text-white/40 line-through">
                  {product.originalPrice} ج.م
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
              {product.inStock ? `متوفر (${product.stockCount} قطعة)` : 'غير متوفر حالياً'}
            </span>
          </div>

          {/* Action button according to role */}
          {currentRole === 'buyer' || !isAuthenticated ? (
            <motion.button
              type="button"
              id={`add-cart-btn-${product.id}`}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, 1);
              }}
              disabled={!product.inStock}
              className="p-2.5 rounded-xl bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] disabled:opacity-40 shadow-xs transition-colors flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px] cursor-pointer"
              title={`إضافة ${product.title} إلى سلة المشتريات`}
              aria-label={`إضافة ${product.title} إلى سلة المشتريات`}
            >
              <ShoppingBag className="w-4 h-4" />
            </motion.button>
          ) : currentRole === 'seller' ? (
            <motion.button
              type="button"
              id={`seller-view-btn-${product.id}`}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                navigateToProduct(product.id);
              }}
              className="p-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white shadow-xs transition-colors flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px] cursor-pointer"
              title="عرض تفاصيل القطعة"
              aria-label="عرض تفاصيل القطعة"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              id={`admin-view-btn-${product.id}`}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                navigateToProduct(product.id);
              }}
              className="p-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white shadow-xs transition-colors flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px] cursor-pointer"
              title="إدارة القطعة التراثية"
              aria-label="إدارة القطعة التراثية"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

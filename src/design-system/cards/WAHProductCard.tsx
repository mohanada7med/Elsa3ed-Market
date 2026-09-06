import React from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { Heart, ShoppingBag, Star, Sparkles, MapPin, Eye, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { WAHBadge } from '../WAHBadge';

interface WAHProductCardProps {
  product: Product;
  editorialShape?: boolean;
}

export const WAHProductCard: React.FC<WAHProductCardProps> = ({
  product,
  editorialShape = false
}) => {
  const {
    navigateToProduct,
    addToCart,
    toggleFavorite,
    isFavorite,
    navigateToSeller,
    currentRole,
    isAuthenticated
  } = useApp();

  if (!product || !product.id) return null;

  const favorite = isFavorite(product.id);
  const primaryImage =
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80';

  const shapeClass = editorialShape
    ? 'rounded-tl-3xl rounded-br-3xl rounded-tr-xl rounded-bl-xl'
    : 'rounded-2xl';

  return (
    <motion.div
      id={`wah-product-${product.id}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`group relative flex flex-col bg-white dark:bg-[var(--wah-surface,#1B1613)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] hover:border-[var(--wah-primary,#B24C2B)] dark:hover:border-[var(--wah-primary,#E0633C)] shadow-[0_2px_8px_-2px_rgba(36,30,26,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(36,30,26,0.12)] dark:hover:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.6)] transition-all duration-300 overflow-hidden ${shapeClass}`}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)]">
        <img
          src={primaryImage}
          alt={product.title}
          onClick={() => navigateToProduct(product.id)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out cursor-pointer"
          loading="lazy"
        />

        {/* Heritage Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.discountPercent && product.discountPercent > 0 && (
            <span className="bg-[var(--wah-primary,#B24C2B)] text-white text-[11px] font-black px-2.5 py-0.5 rounded-md shadow-xs self-start">
              خصم {product.discountPercent}%
            </span>
          )}
          {product.isHandmade && (
            <WAHBadge variant="ochre" size="sm" icon={<Sparkles className="w-3 h-3 text-amber-600" />}>
              يدوي أصيل
            </WAHBadge>
          )}
        </div>

        {/* Favorite & Quick View Actions */}
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
                  : 'bg-white/90 dark:bg-[var(--wah-surface,#1B1613)]/90 hover:bg-white dark:hover:bg-[var(--wah-surface-subtle,#26201B)] text-stone-700 dark:text-stone-300 hover:text-rose-500 border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)]'
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
            className="p-2.5 rounded-xl bg-white/90 dark:bg-[var(--wah-surface,#1B1613)]/90 hover:bg-white dark:hover:bg-[var(--wah-surface-subtle,#26201B)] text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] hover:text-[var(--wah-primary,#B24C2B)] dark:hover:text-[var(--wah-primary,#E0633C)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] backdrop-blur-md transition-all shadow-xs opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer"
            title={`معاينة ${product.title}`}
            aria-label={`معاينة ${product.title}`}
          >
            <Eye className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Origin Governorate Pill */}
        {product.sellerGovernorate && (
          <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none">
            <span className="bg-[var(--wah-text,#241E1A)]/85 text-[var(--wah-accent-light,#FDF3E7)] text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-1 shadow-xs">
              <MapPin className="w-3 h-3 text-[var(--wah-accent,#D97724)]" />
              <span>صعيد مصر ({product.sellerGovernorate})</span>
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between bg-white dark:bg-[var(--wah-surface,#1B1613)]">
        <div>
          {/* Seller / Workshop Link & Rating */}
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <button
              type="button"
              id={`seller-link-${product.sellerId}`}
              onClick={() => navigateToSeller(product.sellerId)}
              aria-label={`زيارة ورشة ${product.sellerName}`}
              className="text-xs font-bold text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] hover:text-[var(--wah-primary,#B24C2B)] dark:hover:text-[var(--wah-primary,#E0633C)] transition-colors truncate text-right cursor-pointer"
            >
              {product.sellerName}
            </button>

            <div
              className="flex items-center gap-1 text-xs shrink-0"
              aria-label={`التقييم ${product.rating} من 5 نجوم`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-bold text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] text-xs">
                {product.rating}
              </span>
              <span className="text-[10px] text-[var(--wah-text-subtle,#9C8E80)]">
                ({product.reviewCount})
              </span>
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => navigateToProduct(product.id)}
            role="button"
            tabIndex={0}
            aria-label={`عرض تفاصيل: ${product.title}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateToProduct(product.id);
              }
            }}
            className="font-bold text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] text-sm leading-snug hover:text-[var(--wah-primary,#B24C2B)] dark:hover:text-[var(--wah-primary,#E0633C)] transition-colors cursor-pointer line-clamp-2 mb-2"
          >
            {product.title}
          </h3>
        </div>

        {/* Pricing & Cart Action */}
        <div className="pt-3 border-t border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)]">
                {product.price} ج.م
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-[var(--wah-text-subtle,#9C8E80)] line-through">
                  {product.originalPrice} ج.م
                </span>
              )}
            </div>
            <span className="text-[10px] text-[var(--wah-success,#286644)] dark:text-[#489E6E] font-semibold block">
              {product.inStock ? `متوفر (${product.stockCount} قطعة)` : 'غير متوفر حالياً'}
            </span>
          </div>

          {/* Role Action Button */}
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
              className="p-2.5 rounded-xl bg-[var(--wah-primary,#B24C2B)] hover:bg-[var(--wah-primary-hover,#963E21)] disabled:bg-stone-300 dark:disabled:bg-stone-700 text-white shadow-xs transition-colors flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px] cursor-pointer"
              title={`إضافة ${product.title} إلى السلة`}
              aria-label={`إضافة ${product.title} إلى السلة`}
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
              title="إدارة القطعة"
              aria-label="إدارة القطعة"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

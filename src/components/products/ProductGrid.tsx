import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';

import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  MapPin,
  Package,
  ShoppingBag,
  Star,
  Store,
  X,
} from 'lucide-react';

type ProductLike = Record<string, any>;

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=85';

const read = (product: ProductLike, keys: string[], fallback: any = '') => {
  for (const key of keys) {
    const value = product?.[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return fallback;
};

const text = (product: ProductLike, keys: string[], fallback = ''): string => {
  const value = read(product, keys, fallback);
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  return fallback;
};

const numberValue = (product: ProductLike, keys: string[]): number | null => {
  const value = read(product, keys, null);
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const getImages = (product: ProductLike): string[] => {
  const sources = [product.images, product.imageUrls, product.gallery, product.media];

  for (const source of sources) {
    if (Array.isArray(source)) {
      const images = source
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') {
            return item.url || item.secure_url || item.src || item.imageUrl || '';
          }
          return '';
        })
        .filter(Boolean);

      if (images.length > 0) return images;
    }
  }

  const single = text(product, ['imageUrl', 'image', 'coverImage', 'thumbnail', 'photo']);
  return single ? [single] : [FALLBACK_IMAGE];
};

const getCategory = (product: ProductLike) =>
  text(product, ['categoryName', 'category', 'categoryTitle']);

const getSeller = (product: ProductLike) => {
  const direct = text(product, ['sellerName', 'storeName', 'brandName']);
  if (direct) return direct;

  if (product.seller && typeof product.seller === 'object') {
    return product.seller.name || product.seller.storeName || product.seller.brandName || '';
  }
  return '';
};

const getLocation = (product: ProductLike) =>
  text(product, ['governorateName', 'governorate', 'location', 'city']);

const formatPrice = (value: number | null) => {
  if (value === null) return '—';
  return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(value);
};

const getDiscount = (price: number | null, oldPrice: number | null) => {
  if (price === null || oldPrice === null || oldPrice <= price || oldPrice <= 0) {
    return null;
  }
  return Math.round(((oldPrice - price) / oldPrice) * 100);
};

/* =========================================================
   PRODUCT CARD
   تصميم: شغل معلّق على حبل بمشابك، بطاقة ورقية تتأرجح، وسعر على شكل ختم
   (وضع compactCards بيفضل بلاطة صغيرة عشان الأماكن اللي بتستخدمه)
========================================================= */

const SWING = ['-rotate-[1.5deg]', 'rotate-[1deg]', '-rotate-[0.6deg]', 'rotate-[1.8deg]'];

const ProductCard: React.FC<{
  product: ProductLike;
  index: number;
  onOpen: (product: ProductLike) => void;
  onNavigate: (product: ProductLike) => void;
  compact?: boolean;
  centerOnMobile?: boolean;
  hideOnMobile?: boolean;
}> = ({
  product,
  index,
  onOpen,
  onNavigate,
  compact = false,
  centerOnMobile = false,
  hideOnMobile = false,
}) => {
  const { addToCart, setIsCartDrawerOpen, addToFavorites, removeFromFavorites, isFavorite } = useApp();
  const [imageIndex, setImageIndex] = useState(0);

  const productId = text(product, ['id', '_id', 'productId']);
  const isFav = productId ? isFavorite(productId) : false;

  const images = getImages(product);
  const title = text(product, ['title', 'name', 'productName'], 'منتج تراثي');
  const description = text(product, ['description', 'shortDescription', 'details']);
  const material = text(product, ['material', 'materials', 'mainMaterial']);
  const price = numberValue(product, ['price', 'sellingPrice', 'salePrice']);
  const oldPrice = numberValue(product, ['originalPrice', 'oldPrice', 'compareAtPrice']);
  const discount = getDiscount(price, oldPrice);
  const category = getCategory(product);
  const seller = getSeller(product);
  const location = getLocation(product);
  const rating = numberValue(product, ['rating', 'averageRating']);
  const reviews = numberValue(product, ['reviewsCount', 'reviewCount', 'numberOfReviews']);
  const stock = numberValue(product, ['stockCount', 'stock', 'quantity', 'availableQuantity']);
  const featured = Boolean(product.featured || product.isFeatured);
  const outOfStock = stock !== null && stock <= 0;
  const lowStock = stock !== null && stock > 0 && stock <= 3;

  const handleFavorite = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!productId) return;
    if (isFav) removeFromFavorites(productId);
    else addToFavorites(productId);
  };

  const handleAddToCart = (event: React.MouseEvent) => {
    event.stopPropagation();
    addToCart(product as any, 1);
    setIsCartDrawerOpen(true);
  };

  const image = (
    <img
      src={images[Math.min(imageIndex, images.length - 1)]}
      alt={title}
      loading="lazy"
      className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
        outOfStock ? 'opacity-60 grayscale' : ''
      }`}
      onError={(event) => {
        event.currentTarget.src = FALLBACK_IMAGE;
      }}
    />
  );

  /* ---------- compact tile ---------- */

  if (compact) {
    return (
      <article
        onClick={() => onNavigate(product)}
        className={`group cursor-pointer
          ${centerOnMobile ? 'col-span-2 w-1/2 justify-self-center sm:col-span-1 sm:w-full' : ''}
          ${hideOnMobile ? 'hidden sm:block' : ''}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#F5EFE5] dark:bg-[#27211C]">
          {image}
          {discount !== null && (
            <span className="absolute right-2 top-2 rounded-lg bg-[#a74a32] px-2 py-1 text-[10px] font-black text-white">
              -{discount}%
            </span>
          )}
          <button
            type="button"
            aria-label={isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            aria-pressed={isFav}
            onClick={handleFavorite}
            className="absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-espresso shadow-md dark:bg-black/65 dark:text-white"
          >
            <Heart size={15} className={isFav ? 'fill-rose-500 text-rose-500' : ''} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>
        <h3 className="mt-2 line-clamp-2 text-xs font-black leading-snug sm:text-sm">{title}</h3>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="text-base font-black text-primary dark:text-primary-hover">
            {formatPrice(price)} <span className="text-[10px] font-bold">جنيه</span>
          </span>
          <button
            type="button"
            disabled={outOfStock}
            aria-label="حط في السلة"
            onClick={handleAddToCart}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6B3A1F] text-[#FFF9EE] transition-colors hover:bg-[#3B1E0E] disabled:opacity-40 dark:hover:bg-[#C99444]"
          >
            <ShoppingBag size={15} />
          </button>
        </div>
      </article>
    );
  }

  /* ---------- hanging card (clothesline) ---------- */

  const swing = SWING[index % SWING.length];
  const priceLabel = formatPrice(price);
  const sealSmall = priceLabel.length > 5;

  return (
    <div className="relative pt-7">
      {/* rope */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-3 top-2 h-1 rounded-full"
        style={{ backgroundImage: 'repeating-linear-gradient(135deg, #b08a55 0 3px, #8a6638 3px 6px)' }}
      />
      {/* clothespin */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 z-10 h-9 w-3.5 -translate-x-1/2 rounded-sm bg-[#C99444] shadow-md ring-1 ring-black/10"
      >
        <span className="absolute inset-x-0 top-3 h-px bg-black/25" />
      </span>

      <article
        onClick={() => onNavigate(product)}
        className={`group relative origin-top cursor-pointer rounded-lg bg-[#FBF4E8] p-2.5 pb-4 shadow-[0_12px_30px_rgba(59,30,14,0.18)] transition-transform duration-500 ease-out hover:-translate-y-1 hover:rotate-0 motion-reduce:rotate-0 motion-reduce:transition-none dark:bg-[#2A160B] ${swing}`}
      >
        {/* image + seal */}
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-[#F5EFE5] dark:bg-[#27211C]">
            {image}

            <div className="absolute left-2.5 top-2.5 flex flex-col gap-2">
              <button
                type="button"
                aria-label={isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                aria-pressed={isFav}
                onClick={handleFavorite}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-espresso shadow-md transition-transform hover:scale-110 dark:bg-black/65 dark:text-white"
              >
                <Heart size={16} className={isFav ? 'fill-rose-500 text-rose-500' : ''} fill={isFav ? 'currentColor' : 'none'} />
              </button>
              <button
                type="button"
                aria-label="عرض سريع"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen(product);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-espresso opacity-100 shadow-md transition-all hover:scale-110 hover:bg-[#C99444] sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100 dark:bg-black/65 dark:text-white"
              >
                <Eye size={16} />
              </button>
            </div>

            <div className="absolute right-0 top-3 flex flex-col items-end gap-1.5">
              {discount !== null && (
                <span className="rounded-l-md bg-[#a74a32] py-1 pl-3 pr-2.5 text-[11px] font-black text-white shadow-md">
                  خصم {discount}%
                </span>
              )}
              {featured && (
                <span className="rounded-l-md bg-[#C99444] py-1 pl-3 pr-2.5 text-[11px] font-black text-espresso shadow-md">
                  مميز
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="absolute inset-x-0 bottom-2.5 flex justify-center gap-1">
                {images.slice(0, 5).map((_, dot) => (
                  <button
                    key={dot}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setImageIndex(dot);
                    }}
                    aria-label={`الصورة ${dot + 1}`}
                    className={`h-1.5 rounded-full transition-all ${dot === imageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`}
                  />
                ))}
              </div>
            )}

            {outOfStock && (
              <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-black/70 py-2 text-center text-xs font-black text-white">
                خلصان دلوقتي
              </span>
            )}
          </div>

          {/* price seal */}
          <div
            className="absolute -bottom-7 left-3 z-10 flex h-[4.5rem] w-[4.5rem] rotate-12 flex-col items-center justify-center rounded-full bg-[#6B3A1F] text-[#FFF9EE] shadow-lg transition-transform duration-500 group-hover:rotate-0"
            aria-label={`السعر ${priceLabel} جنيه`}
          >
            <span className="absolute inset-1 rounded-full border border-dashed border-[#FFF9EE]/50" />
            <span className={`relative font-black leading-none ${sealSmall ? 'text-xs' : 'text-base'}`}>{priceLabel}</span>
            <span className="relative mt-0.5 text-[9px] font-bold opacity-80">جنيه</span>
          </div>
        </div>

        {/* caption */}
        <div className="mt-4 pl-[4.75rem]">
          {category && (
            <span className="block truncate text-[11px] font-bold text-primary dark:text-primary-hover">{category}</span>
          )}

          <h3 className="mt-1 line-clamp-2 min-h-[2.75rem] text-base font-black leading-snug text-espresso dark:text-cream sm:text-lg">
            {title}
          </h3>

          {seller && (
            <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[11px] font-bold text-[#8C6F53] dark:text-[#D6C6B1]">
              <Store size={12} className="shrink-0" />
              <span className="truncate">{seller}</span>
              <BadgeCheck size={12} className="shrink-0 text-primary dark:text-primary-hover" />
            </p>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-[#8C6F53] dark:text-[#D6C6B1]">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} className="shrink-0" />
              {location}
            </span>
          )}
          {rating !== null && (
            <span className="flex items-center gap-1 text-espresso dark:text-cream">
              <Star size={12} fill="currentColor" className="text-[#C99444]" />
              {rating.toFixed(1)}
              {reviews !== null && <span className="font-medium text-[#8C6F53] dark:text-[#D6C6B1]">({reviews})</span>}
            </span>
          )}
          {oldPrice !== null && price !== null && oldPrice > price && (
            <span className="line-through opacity-70">{formatPrice(oldPrice)} جنيه</span>
          )}
          {lowStock && <span className="font-black text-[#a74a32]">باقي {formatPrice(stock)} قطع بس</span>}
        </div>

        <button
          type="button"
          disabled={outOfStock}
          onClick={handleAddToCart}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#6B3A1F] text-sm font-black text-[#FFF9EE] transition-colors hover:bg-[#3B1E0E] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-[#C99444] dark:hover:text-espresso"
        >
          <ShoppingBag size={17} />
          {outOfStock ? 'خلصان دلوقتي' : 'حط في السلة'}
        </button>
      </article>
    </div>
  );
};

/* =========================================================
   QUICK VIEW
========================================================= */

const QuickView: React.FC<{
  product: ProductLike;
  onClose: () => void;
  onNavigate: (product: ProductLike) => void;
}> = ({ product, onClose, onNavigate }) => {
  const { addToCart, setIsCartDrawerOpen } = useApp();
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const images = getImages(product);
  const title = text(product, ['title', 'name', 'productName'], 'منتج تراثي');
  const description = text(product, ['description', 'shortDescription', 'details'], '');
  const price = numberValue(product, ['price', 'sellingPrice', 'salePrice']);
  const oldPrice = numberValue(product, ['originalPrice', 'oldPrice', 'compareAtPrice']);
  const material = text(product, ['material', 'materials', 'mainMaterial']);
  const seller = getSeller(product);
  const location = getLocation(product);
  const category = getCategory(product);
  const stock = numberValue(product, ['stockCount', 'stock', 'quantity']);
  const outOfStock = stock !== null && stock <= 0;

  const rows: { label: string; value: React.ReactNode }[] = [
    seller && { label: 'البائع', value: seller },
    location && { label: 'المكان', value: location },
    material && { label: 'الخامة', value: material },
    stock !== null && {
      label: 'المخزون',
      value: stock > 0 ? `${formatPrice(stock)} قطعة` : 'خلصان دلوقتي',
    },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-[#f8f3ea] text-espresso shadow-2xl dark:bg-[#11110f] dark:text-white"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
        >
          <X size={18} />
        </button>

        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[360px_1fr] lg:gap-12">
          {/* arch image */}
          <div className="relative mx-auto w-full max-w-[360px]">
            <div className="aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-[#ddd3c3] dark:bg-[#181715]">
              <img
                src={images[imageIndex]}
                alt={title}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="الصورة السابقة"
                  onClick={() => setImageIndex((current) => (current - 1 + images.length) % images.length)}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  aria-label="الصورة التالية"
                  onClick={() => setImageIndex((current) => (current + 1) % images.length)}
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur"
                >
                  <ChevronLeft size={16} />
                </button>
              </>
            )}
          </div>

          {/* details */}
          <div className="flex flex-col">
            {category && (
              <span className="text-xs font-black text-primary dark:text-primary-hover">{category}</span>
            )}

            <h2 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{title}</h2>

            {description && (
              <p className="mt-5 text-sm leading-8 text-black/60 dark:text-white/55">{description}</p>
            )}

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-4xl font-black text-primary dark:text-primary-hover">
                {formatPrice(price)}
                <span className="mr-1 text-sm">جنيه</span>
              </span>
              {oldPrice !== null && price !== null && oldPrice > price && (
                <span className="text-sm text-black/40 line-through dark:text-white/35">
                  {formatPrice(oldPrice)} جنيه
                </span>
              )}
            </div>

            {rows.length > 0 && (
              <dl className="mt-6 divide-y divide-black/[0.08] border-y border-black/[0.08] text-sm dark:divide-white/[0.08] dark:border-white/[0.08]">
                {rows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-[#8C6F53] dark:text-[#D6C6B1]">{row.label}</dt>
                    <dd className="font-black">{row.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row">
              <button
                type="button"
                disabled={outOfStock}
                onClick={(event) => {
                  event.stopPropagation();
                  addToCart(product as any, 1);
                  setIsCartDrawerOpen(true);
                }}
                className="flex h-14 flex-1 items-center justify-center gap-3 rounded-full bg-[#6B3A1F] text-sm font-black text-[#FFF9EE] transition hover:bg-[#3B1E0E] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-[#C99444]"
              >
                <ShoppingBag size={16} />
                حط في السلة
              </button>

              <button
                type="button"
                onClick={() => onNavigate(product)}
                className="flex h-14 flex-1 items-center justify-center gap-3 rounded-full border border-black/15 text-sm font-black transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
              >
                <Eye size={16} />
                شوف التفاصيل
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN
========================================================= */

interface ProductGridProps {
  customProducts?: ProductLike[];
  limit?: number;
  compactCards?: boolean;
  mobileLimit?: number;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  customProducts,
  limit,
  compactCards = false,
  mobileLimit,
}) => {
  const {
    products,
    searchQuery,
    selectedGovernorateFilter,
    selectedCategoryFilter,
    selectedHandmadeOnly,
    selectedPriceMin,
    selectedPriceMax,
    selectedSort,
    setSelectedProductId,
    setActivePage,
  } = useApp();

  const [selectedProduct, setSelectedProduct] = useState<ProductLike | null>(null);

  const navigateToProduct = (product: ProductLike) => {
    const id = text(product, ['id', '_id', 'productId']);

    if (!id) {
      console.error('Product ID is missing:', product);
      return;
    }

    setSelectedProductId(id);
    setActivePage('product-detail');
  };

  const sourceProducts = customProducts || products;

  const visibleProducts = useMemo(() => {
    const query = String(searchQuery || '').trim().toLowerCase();

    const filtered = sourceProducts.filter((product) => {
      const item = product as ProductLike;

      const status = text(item, ['approvalStatus']);
      if (status && status.toLowerCase() !== 'approved') return false;

      if (query) {
        const searchable = [
          text(item, ['title', 'name', 'productName']),
          text(item, ['titleEn', 'nameEn', 'englishTitle']),
          text(item, ['description', 'shortDescription', 'details']),
          text(item, ['material', 'materials', 'mainMaterial']),
          getCategory(item),
          getSeller(item),
          getLocation(item),
        ]
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(query)) return false;
      }

      if (selectedCategoryFilter && selectedCategoryFilter !== 'all') {
        const selected = String(selectedCategoryFilter).toLowerCase();
        const categoryId = text(item, ['categoryId']).toLowerCase();
        const categoryName = getCategory(item).toLowerCase();

        if (categoryId !== selected && categoryName !== selected) return false;
      }

      if (selectedGovernorateFilter !== 'all') {
        const governorate = text(item, [
          'sellerGovernorate',
          'governorate',
          'governorateName',
          'originGovernorate',
        ]);
        if (governorate !== selectedGovernorateFilter) return false;
      }

      if (selectedHandmadeOnly && item.isHandmade !== true) return false;

      const price = numberValue(item, ['price']);
      if (selectedPriceMin !== null && (price === null || price < selectedPriceMin)) return false;
      if (selectedPriceMax !== null && (price === null || price > selectedPriceMax)) return false;

      return true;
    });

    if (selectedSort === 'price-asc') {
      filtered.sort(
        (a, b) =>
          (numberValue(a as ProductLike, ['price']) ?? 0) - (numberValue(b as ProductLike, ['price']) ?? 0)
      );
    } else if (selectedSort === 'price-desc') {
      filtered.sort(
        (a, b) =>
          (numberValue(b as ProductLike, ['price']) ?? 0) - (numberValue(a as ProductLike, ['price']) ?? 0)
      );
    } else if (selectedSort === 'rating') {
      filtered.sort(
        (a, b) =>
          (numberValue(b as ProductLike, ['rating']) ?? 0) - (numberValue(a as ProductLike, ['rating']) ?? 0)
      );
    } else if (selectedSort === 'newest') {
      filtered.sort(
        (a, b) =>
          Date.parse(text(b as ProductLike, ['createdAt'])) - Date.parse(text(a as ProductLike, ['createdAt']))
      );
    }

    return limit ? filtered.slice(0, limit) : filtered;
  }, [
    sourceProducts,
    searchQuery,
    selectedGovernorateFilter,
    selectedCategoryFilter,
    selectedHandmadeOnly,
    selectedPriceMin,
    selectedPriceMax,
    selectedSort,
    limit,
  ]);

  /* ---------- empty: no products at all ---------- */

  if (!sourceProducts || sourceProducts.length === 0) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-black/10 px-6 text-center dark:border-white/10">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-[#C99444]/10 dark:text-primary-hover">
          <Package size={25} />
        </div>
        <h3 className="mt-6 text-xl font-black">مفيش منتجات لسه</h3>
        <p className="mt-3 max-w-md text-sm leading-7 text-[#8C6F53] dark:text-[#D6C6B1]">
          أول ما المنتجات تكون متاحة، هتظهر هنا.
        </p>
      </div>
    );
  }

  /* ---------- empty: no search results ---------- */

  if (visibleProducts.length === 0) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-black/10 px-6 text-center dark:border-white/10">
        <img
          src="/mascot/empty-search.png"
          alt="مفيش نتيجة"
          className="mb-2 h-44 w-auto object-contain drop-shadow-md sm:h-52"
        />
        <h3 className="mt-3 text-xl font-black">ملقيناش منتجات بالبحث ده يا بوي</h3>
        <p className="mt-2 max-w-md text-sm leading-7 text-black/50 dark:text-white/45">
          جرّب كلمة بحث تانية أو وسّع نطاق التصنيف وهتلاقي خير كتير من إيد شيوخ الصنعة.
        </p>
      </div>
    );
  }

  /* ---------- grid ---------- */

  return (
    <>
      <p className="mb-6 text-sm font-bold text-[#8C6F53] dark:text-[#D6C6B1]">
        <span className="text-lg font-black text-espresso dark:text-cream">{visibleProducts.length}</span> قطعة متاحة
      </p>

      <div
        className={
          compactCards
            ? 'grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4'
            : 'grid grid-cols-1 gap-x-5 gap-y-10 min-[380px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
        }
      >
        {visibleProducts.map((product, index) => (
          <ProductCard
            key={text(product as ProductLike, ['id', '_id', 'productId']) || `product-${index}`}
            product={product as ProductLike}
            index={index}
            onOpen={setSelectedProduct}
            onNavigate={navigateToProduct}
            compact={compactCards}
            centerOnMobile={
              compactCards && visibleProducts.length % 2 === 1 && index === visibleProducts.length - 1
            }
            hideOnMobile={compactCards && mobileLimit !== undefined && index >= mobileLimit}
          />
        ))}
      </div>

      {selectedProduct && (
        <QuickView
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onNavigate={navigateToProduct}
        />
      )}
    </>
  );
};

export default ProductGrid;
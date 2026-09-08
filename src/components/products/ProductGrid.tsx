import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';

import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  MapPin,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Tag,
  Truck,
  X,
} from 'lucide-react';

type ProductLike = Record<string, any>;

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=85';

const read = (
  product: ProductLike,
  keys: string[],
  fallback: any = ''
) => {
  for (const key of keys) {
    const value = product?.[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      return value;
    }
  }

  return fallback;
};

const text = (
  product: ProductLike,
  keys: string[],
  fallback = ''
): string => {
  const value = read(product, keys, fallback);

  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return String(value);
  }

  return fallback;
};

const numberValue = (
  product: ProductLike,
  keys: string[]
): number | null => {
  const value = read(product, keys, null);

  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
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

const getImages = (
  product: ProductLike
): string[] => {
  const sources = [
    product.images,
    product.imageUrls,
    product.gallery,
    product.media,
  ];

  for (const source of sources) {
    if (Array.isArray(source)) {
      const images = source
        .map((item) => {
          if (typeof item === 'string') {
            return item;
          }

          if (
            item &&
            typeof item === 'object'
          ) {
            return (
              item.url ||
              item.secure_url ||
              item.src ||
              item.imageUrl ||
              ''
            );
          }

          return '';
        })
        .filter(Boolean);

      if (images.length > 0) {
        return images;
      }
    }
  }

  const single = text(product, [
    'imageUrl',
    'image',
    'coverImage',
    'thumbnail',
    'photo',
  ]);

  return single
    ? [single]
    : [FALLBACK_IMAGE];
};

const getCategory = (
  product: ProductLike
) =>
  text(product, [
    'categoryName',
    'category',
    'categoryTitle',
  ]);

const getSeller = (
  product: ProductLike
) => {
  const direct = text(product, [
    'sellerName',
    'storeName',
    'brandName',
  ]);

  if (direct) {
    return direct;
  }

  if (
    product.seller &&
    typeof product.seller === 'object'
  ) {
    return (
      product.seller.name ||
      product.seller.storeName ||
      product.seller.brandName ||
      ''
    );
  }

  return '';
};

const getLocation = (
  product: ProductLike
) =>
  text(product, [
    'governorateName',
    'governorate',
    'location',
    'city',
  ]);

const formatPrice = (
  value: number | null
) => {
  if (value === null) {
    return '—';
  }

  return new Intl.NumberFormat('ar-EG', {
    maximumFractionDigits: 2,
  }).format(value);
};

const getDiscount = (
  price: number | null,
  oldPrice: number | null
) => {
  if (
    price === null ||
    oldPrice === null ||
    oldPrice <= price ||
    oldPrice <= 0
  ) {
    return null;
  }

  return Math.round(
    ((oldPrice - price) / oldPrice) * 100
  );
};

/* =========================================================
   PRODUCT CARD
========================================================= */

const ProductCard: React.FC<{
  product: ProductLike;
  index: number;
  onOpen: (product: ProductLike) => void;
  onNavigate: (product: ProductLike) => void;
}> = ({
  product,
  index,
  onOpen,
  onNavigate,
}) => {
    const { addToCart, setIsCartDrawerOpen, addToFavorites, removeFromFavorites, isFavorite } = useApp();
    const [imageIndex, setImageIndex] =
      useState(0);

    const productId = text(product, ['id', '_id', 'productId']);
    const isFav = productId ? isFavorite(productId) : false;

    const images = getImages(product);

    const title = text(
      product,
      [
        'title',
        'name',
        'productName',
      ],
      'منتج تراثي'
    );

    const price = numberValue(
      product,
      [
        'price',
        'sellingPrice',
        'salePrice',
      ]
    );

    const oldPrice = numberValue(
      product,
      [
        'originalPrice',
        'oldPrice',
        'compareAtPrice',
      ]
    );

    const discount = getDiscount(
      price,
      oldPrice
    );

    const category =
      getCategory(product);

    const seller =
      getSeller(product);

    const location =
      getLocation(product);

    const rating = numberValue(
      product,
      [
        'rating',
        'averageRating',
      ]
    );

    const reviews = numberValue(
      product,
      [
        'reviewsCount',
        'reviewCount',
        'numberOfReviews',
      ]
    );

    const stock = numberValue(
      product,
      [
        'stockCount',
        'stock',
        'quantity',
        'availableQuantity',
      ]
    );

    const featured = Boolean(
      product.featured ||
      product.isFeatured
    );

    const outOfStock =
      stock !== null && stock <= 0;

    return (
      <article
        onClick={() =>
          onNavigate(product)
        }
        className="
        group
        relative
        cursor-pointer
        overflow-hidden
        rounded-[1.75rem]
        border
        border-black/[0.07]
        bg-[#f9f5ed]
        transition-all
        duration-500

        hover:-translate-y-2
        hover:shadow-[0_30px_80px_rgba(38,29,19,0.14)]

        dark:border-white/[0.08]
        dark:bg-[#11110f]
        dark:hover:shadow-black/40
      "
      >
        {/* =================================================
          IMAGE
      ================================================= */}

        <div
          className="
          relative
          aspect-[0.9]
          overflow-hidden
          bg-[#ded5c6]

          dark:bg-[#191816]
        "
        >
          <img
            src={
              images[
              Math.min(
                imageIndex,
                images.length - 1
              )
              ]
            }
            alt={title}
            loading="lazy"
            className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-700
            ease-out

            group-hover:scale-105
          "
            onError={(event) => {
              event.currentTarget.src =
                FALLBACK_IMAGE;
            }}
          />

          {/* Gradient */}

          <div
            className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-black/60
            via-black/0
            to-black/15
          "
          />

          {/* Badges */}

          <div
            className="
            absolute
            right-4
            top-4
            flex
            flex-wrap
            gap-2
          "
          >
            {featured && (
              <span
                className="
                flex
                items-center
                gap-1.5
                rounded-full
                bg-[#d6aa72]
                px-3
                py-1.5
                text-[9px]
                font-black
                text-[#211d18]
                shadow-lg
              "
              >
                <Sparkles size={10} />
                مميز
              </span>
            )}

            {discount !== null && (
              <span
                className="
                rounded-full
                bg-[#a74a32]
                px-3
                py-1.5
                text-[9px]
                font-black
                text-white
                shadow-lg
              "
              >
                خصم {discount}%
              </span>
            )}
          </div>

          {/* Favorite */}

          <button
            type="button"
            aria-label="إضافة للمفضلة"
            onClick={(event) => {
              event.stopPropagation();
              if (productId) {
                if (isFav) {
                  removeFromFavorites(productId);
                } else {
                  addToFavorites(productId);
                }
              }
            }}
            className="
            absolute
            left-4
            top-4
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-white/90
            text-[#211d18]
            shadow-lg
            backdrop-blur-md
            transition-all

            hover:scale-110

            dark:bg-black/70
            dark:text-white

            cursor-pointer
          "
          >
            <Heart
              size={16}
              className={isFav ? 'text-rose-500 fill-rose-500' : ''}
              fill={
                isFav
                  ? 'currentColor'
                  : 'none'
              }
            />
          </button>

          {/* Product Number */}

          <div
            className="
            absolute
            bottom-4
            right-5
            text-[9px]
            font-black
            tracking-[0.2em]
            text-white/65
          "
          >
            #{String(index + 1).padStart(2, '0')}
          </div>

          {/* Quick View */}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();

              onOpen(product);
            }}
            className="
            absolute
            bottom-4
            left-4
            flex
            items-center
            gap-2
            rounded-full
            bg-white/90
            px-4
            py-2.5
            text-[9px]
            font-black
            text-[#211d18]
            opacity-0
            shadow-lg
            backdrop-blur-md
            transition-all
            duration-300

            group-hover:opacity-100

            hover:bg-[#d6aa72]

            dark:bg-black/75
            dark:text-white

            cursor-pointer
          "
          >
            <Eye size={13} />
            عرض سريع
          </button>

          {/* Image Navigation */}

          {images.length > 1 && (
            <div
              className="
              absolute
              bottom-16
              left-1/2
              flex
              -translate-x-1/2
              gap-1.5
            "
            >
              {images
                .slice(0, 5)
                .map((_, image) => (
                  <button
                    key={image}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();

                      setImageIndex(image);
                    }}
                    className={`
                    h-1.5
                    rounded-full
                    transition-all
                    cursor-pointer

                    ${image === imageIndex
                        ? 'w-6 bg-white'
                        : 'w-1.5 bg-white/45'
                      }
                  `}
                    aria-label={`الصورة ${image + 1}`}
                  />
                ))}
            </div>
          )}
        </div>

        {/* =================================================
          CONTENT
      ================================================= */}

        <div className="p-5 sm:p-6">
          {/* Category + Rating */}

          <div
            className="
            flex
            min-h-5
            items-center
            justify-between
            gap-3
          "
          >
            {category ? (
              <div
                className="
                flex
                min-w-0
                items-center
                gap-1.5
                text-[9px]
                font-black
                text-[#9a6a35]

                dark:text-[#d6aa72]
              "
              >
                <Tag
                  size={11}
                  className="shrink-0"
                />

                <span className="truncate">
                  {category}
                </span>
              </div>
            ) : (
              <span />
            )}

            {rating !== null && (
              <div
                className="
                flex
                shrink-0
                items-center
                gap-1
              "
              >
                <Star
                  size={12}
                  fill="currentColor"
                  className="
                  text-[#9a6a35]

                  dark:text-[#d6aa72]
                "
                />

                <span className="text-[10px] font-black">
                  {rating.toFixed(1)}
                </span>

                {reviews !== null && (
                  <span
                    className="
                    text-[9px]
                    text-black/30

                    dark:text-white/25
                  "
                  >
                    ({reviews})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Title */}

          <h3
            className="
            mt-3
            line-clamp-2
            min-h-[3.4rem]
            text-xl
            font-black
            leading-[1.1]
            tracking-[-0.045em]

            sm:text-2xl
          "
          >
            {title}
          </h3>

          {/* Seller + Location */}

          {(seller || location) && (
            <div
              className="
              mt-4
              flex
              flex-col
              gap-2
            "
            >
              {seller && (
                <div
                  className="
                  flex
                  min-w-0
                  items-center
                  gap-2
                  text-[10px]
                  font-bold
                  text-black/40

                  dark:text-white/35
                "
                >
                  <Store
                    size={12}
                    className="
                    shrink-0
                    text-[#9a6a35]

                    dark:text-[#d6aa72]
                  "
                  />

                  <span className="truncate">
                    {seller}
                  </span>

                  <BadgeCheck
                    size={12}
                    className="
                    shrink-0
                    text-[#9a6a35]

                    dark:text-[#d6aa72]
                  "
                  />
                </div>
              )}

              {location && (
                <div
                  className="
                  flex
                  min-w-0
                  items-center
                  gap-2
                  text-[10px]
                  font-medium
                  text-black/35

                  dark:text-white/30
                "
                >
                  <MapPin
                    size={11}
                    className="shrink-0"
                  />

                  <span className="truncate">
                    {location}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Divider */}

          <div
            className="
            my-5
            h-px
            bg-black/[0.07]

            dark:bg-white/[0.07]
          "
          />

          {/* Price + Cart */}

          <div
            className="
            flex
            items-end
            justify-between
            gap-3
          "
          >
            <div>
              <div
                className="
                text-[8px]
                font-black
                tracking-[0.15em]
                text-black/30

                dark:text-white/25
              "
              >
                السعر
              </div>

              <div
                className="
                mt-1
                flex
                items-baseline
                gap-1
              "
              >
                <span
                  className="
                  text-2xl
                  font-black
                  tracking-[-0.05em]
                  text-[#9a6a35]

                  dark:text-[#d6aa72]
                "
                >
                  {formatPrice(price)}
                </span>

                <span
                  className="
                  text-[9px]
                  font-bold
                  text-black/35

                  dark:text-white/30
                "
                >
                  جنيه
                </span>
              </div>

              {oldPrice !== null &&
                price !== null &&
                oldPrice > price && (
                  <div
                    className="
                    mt-0.5
                    text-[10px]
                    font-bold
                    text-black/25
                    line-through

                    dark:text-white/20
                  "
                  >
                    {formatPrice(oldPrice)} جنيه
                  </div>
                )}
            </div>

            {/* Cart */}

            <button
              type="button"
              disabled={outOfStock}
              aria-label="إضافة للسلة"
              onClick={(event) => {
                event.stopPropagation();
                addToCart(product as any, 1);
                setIsCartDrawerOpen(true);
              }}
              className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-[#211d18]
              text-white
              transition-all

              hover:scale-105
              hover:bg-[#9a6a35]

              disabled:cursor-not-allowed
              disabled:opacity-40

              dark:bg-white
              dark:text-black

              dark:hover:bg-[#d6aa72]

              cursor-pointer
            "
            >
              <ShoppingBag size={17} />
            </button>
          </div>

          {/* Stock / Shipping */}

          <div
            className="
            mt-5
            flex
            items-center
            justify-between
            gap-3
            text-[9px]
            font-bold
          "
          >
            {stock !== null ? (
              <span
                className={
                  outOfStock
                    ? 'text-red-500'
                    : 'text-black/30 dark:text-white/25'
                }
              >
                {outOfStock
                  ? 'نفد المخزون'
                  : `${formatPrice(stock)} قطعة متاحة`}
              </span>
            ) : (
              <span
                className="
                text-black/20

                dark:text-white/20
              "
              >
                متاح للطلب
              </span>
            )}

            <span
              className="
              flex
              items-center
              gap-1
              whitespace-nowrap
              text-black/25

              dark:text-white/20
            "
            >
              <Truck size={11} />
              شحن متاح
            </span>
          </div>
        </div>
      </article>
    );
  };

/* =========================================================
   QUICK VIEW
========================================================= */

const QuickView: React.FC<{
  product: ProductLike;
  onClose: () => void;
  onNavigate: (product: ProductLike) => void;
}> = ({
  product,
  onClose,
  onNavigate,
}) => {
    const { addToCart, setIsCartDrawerOpen } = useApp();
    const [imageIndex, setImageIndex] =
      useState(0);

    const images = getImages(product);

    const title = text(
      product,
      [
        'title',
        'name',
        'productName',
      ],
      'منتج تراثي'
    );

    const description = text(
      product,
      [
        'description',
        'shortDescription',
        'details',
      ],
      ''
    );

    const price = numberValue(
      product,
      [
        'price',
        'sellingPrice',
        'salePrice',
      ]
    );

    const oldPrice = numberValue(
      product,
      [
        'originalPrice',
        'oldPrice',
        'compareAtPrice',
      ]
    );

    const material = text(
      product,
      [
        'material',
        'materials',
        'mainMaterial',
      ]
    );

    const seller =
      getSeller(product);

    const location =
      getLocation(product);

    const category =
      getCategory(product);

    const stock = numberValue(
      product,
      [
        'stockCount',
        'stock',
        'quantity',
      ]
    );

    const outOfStock =
      stock !== null && stock <= 0;

    return (
      <div
        className="
        fixed
        inset-0
        z-[1000]
        flex
        items-center
        justify-center
        bg-black/70
        p-4
        backdrop-blur-md

        sm:p-6
      "
        onClick={onClose}
      >
        <div
          className="
          relative
          max-h-[94vh]
          w-full
          max-w-5xl
          overflow-y-auto
          rounded-[2rem]
          bg-[#f8f3ea]
          text-[#211d18]
          shadow-2xl

          dark:bg-[#11110f]
          dark:text-white
        "
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          {/* Close */}

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="
            absolute
            left-4
            top-4
            z-20
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            bg-black/70
            text-white
            backdrop-blur-md
            transition

            hover:bg-white
            hover:text-black

            cursor-pointer
          "
          >
            <X size={18} />
          </button>

          <div
            className="
            grid

            lg:grid-cols-2
          "
          >
            {/* Images */}

            <div
              className="
              relative
              min-h-[420px]
              bg-[#ddd3c3]

              dark:bg-[#181715]
            "
            >
              <img
                src={images[imageIndex]}
                alt={title}
                className="
                h-full
                min-h-[420px]
                w-full
                object-cover
              "
                onError={(event) => {
                  event.currentTarget.src =
                    FALLBACK_IMAGE;
                }}
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setImageIndex(
                        (current) =>
                          (current - 1 + images.length) %
                          images.length
                      )
                    }
                    className="
                    absolute
                    right-4
                    top-1/2
                    flex
                    h-10
                    w-10
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    bg-black/50
                    text-white
                    backdrop-blur
                    cursor-pointer
                  "
                  >
                    <ChevronRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setImageIndex(
                        (current) =>
                          (current + 1) %
                          images.length
                      )
                    }
                    className="
                    absolute
                    left-4
                    top-1/2
                    flex
                    h-10
                    w-10
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    bg-black/50
                    text-white
                    backdrop-blur
                    cursor-pointer
                  "
                  >
                    <ChevronLeft size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Details */}

            <div className="p-7 sm:p-10">
              {category && (
                <div
                  className="
                  flex
                  items-center
                  gap-2
                  text-[9px]
                  font-black
                  tracking-[0.18em]
                  text-[#9a6a35]

                  dark:text-[#d6aa72]
                "
                >
                  <Tag size={12} />

                  {category}
                </div>
              )}

              <h2
                className="
                mt-5
                text-3xl
                font-black
                leading-tight
                tracking-[-0.05em]

                sm:text-5xl
              "
              >
                {title}
              </h2>

              {description && (
                <p
                  className="
                  mt-6
                  text-sm
                  leading-8
                  text-black/50

                  dark:text-white/45
                "
                >
                  {description}
                </p>
              )}

              {/* Price */}

              <div className="mt-8">
                <div
                  className="
                  text-3xl
                  font-black
                  text-[#9a6a35]

                  dark:text-[#d6aa72]
                "
                >
                  {formatPrice(price)}

                  <span className="mr-1 text-xs">
                    جنيه
                  </span>
                </div>

                {oldPrice !== null &&
                  price !== null &&
                  oldPrice > price && (
                    <div
                      className="
                      mt-1
                      text-xs
                      text-black/30
                      line-through

                      dark:text-white/25
                    "
                    >
                      {formatPrice(oldPrice)}
                      {' '}
                      جنيه
                    </div>
                  )}
              </div>

              {/* Information */}

              <div
                className="
                mt-8
                space-y-3
                border-y
                border-black/[0.08]
                py-6

                dark:border-white/[0.08]
              "
              >
                {seller && (
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className="
                      text-[10px]
                      text-black/35

                      dark:text-white/30
                    "
                    >
                      البائع
                    </span>

                    <span className="flex items-center gap-2 text-xs font-black">
                      <Store size={13} />

                      {seller}
                    </span>
                  </div>
                )}

                {location && (
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className="
                      text-[10px]
                      text-black/35

                      dark:text-white/30
                    "
                    >
                      المكان
                    </span>

                    <span className="flex items-center gap-2 text-xs font-black">
                      <MapPin size={13} />

                      {location}
                    </span>
                  </div>
                )}

                {material && (
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className="
                      text-[10px]
                      text-black/35

                      dark:text-white/30
                    "
                    >
                      الخامة
                    </span>

                    <span className="text-xs font-black">
                      {material}
                    </span>
                  </div>
                )}

                {stock !== null && (
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className="
                      text-[10px]
                      text-black/35

                      dark:text-white/30
                    "
                    >
                      المخزون
                    </span>

                    <span className="flex items-center gap-2 text-xs font-black">
                      <Package size={13} />

                      {stock > 0
                        ? `${formatPrice(stock)} قطعة`
                        : 'نفد المخزون'}
                    </span>
                  </div>
                )}
              </div>

              {/* Open Product Page */}

              <button
                type="button"
                onClick={() =>
                  onNavigate(product)
                }
                className="
                mt-8
                flex
                h-14
                w-full
                items-center
                justify-center
                gap-3
                rounded-2xl
                bg-[#211d18]
                text-xs
                font-black
                text-white
                transition

                hover:bg-[#9a6a35]

                dark:bg-white
                dark:text-black

                dark:hover:bg-[#d6aa72]

                cursor-pointer
              "
              >
                <Eye size={16} />

                مشاهدة صفحة المنتج
              </button>

              {/* Add Cart */}

              <button
                type="button"
                disabled={outOfStock}
                onClick={(event) => {
                  event.stopPropagation();
                  addToCart(product as any, 1);
                  setIsCartDrawerOpen(true);
                }}
                className="
                mt-3
                flex
                h-14
                w-full
                items-center
                justify-center
                gap-3
                rounded-2xl
                border
                border-black/10
                text-xs
                font-black
                transition

                hover:bg-black/5

                disabled:cursor-not-allowed
                disabled:opacity-40

                dark:border-white/10
                dark:hover:bg-white/5

                cursor-pointer
              "
              >
                <ShoppingBag size={16} />

                إضافة للسلة
              </button>
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
}

export const ProductGrid: React.FC<ProductGridProps> = ({ customProducts, limit }) => {
  const {
    products,
    searchQuery,
    selectedCategoryFilter,
    setSelectedProductId,
    setActivePage,
  } = useApp();

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState<ProductLike | null>(
    null
  );

  /* =======================================================
     NAVIGATE TO PRODUCT
  ======================================================= */

  const navigateToProduct = (
    product: ProductLike
  ) => {
    const id = text(product, [
      'id',
      '_id',
      'productId',
    ]);

    if (!id) {
      console.error(
        'Product ID is missing:',
        product
      );

      return;
    }

    setSelectedProductId(id);
    setActivePage('product-detail');
  };

  /* =======================================================
     FILTER PRODUCTS
  ======================================================= */

  const sourceProducts = customProducts || products;

  const visibleProducts =
    useMemo(() => {
      const query =
        String(searchQuery || '')
          .trim()
          .toLowerCase();

      const filtered = sourceProducts.filter(
        (product) => {
          const item =
            product as ProductLike;

          const status = text(item, [
            'approvalStatus',
          ]);

          if (
            status &&
            status.toLowerCase() !==
            'approved'
          ) {
            return false;
          }

          /* Search */

          if (query) {
            const searchable = [
              text(item, [
                'title',
                'name',
                'productName',
              ]),

              text(item, [
                'titleEn',
                'nameEn',
                'englishTitle',
              ]),

              text(item, [
                'description',
                'shortDescription',
                'details',
              ]),

              text(item, [
                'material',
                'materials',
                'mainMaterial',
              ]),

              getCategory(item),

              getSeller(item),

              getLocation(item),
            ]
              .join(' ')
              .toLowerCase();

            if (
              !searchable.includes(query)
            ) {
              return false;
            }
          }

          /* Category */

          if (
            selectedCategoryFilter &&
            selectedCategoryFilter !==
            'all'
          ) {
            const selected =
              String(
                selectedCategoryFilter
              ).toLowerCase();

            const categoryId =
              text(item, [
                'categoryId',
              ]).toLowerCase();

            const categoryName =
              getCategory(
                item
              ).toLowerCase();

            if (
              categoryId !== selected &&
              categoryName !== selected
            ) {
              return false;
            }
          }

          return true;
        }
      );

      return limit ? filtered.slice(0, limit) : filtered;
    }, [
      sourceProducts,
      searchQuery,
      selectedCategoryFilter,
      limit,
    ]);

  /* =======================================================
     EMPTY PRODUCTS
  ======================================================= */

  if (
    !sourceProducts ||
    sourceProducts.length === 0
  ) {
    return (
      <div
        className="
          flex
          min-h-[420px]
          flex-col
          items-center
          justify-center
          rounded-[2rem]
          border
          border-dashed
          border-black/10
          bg-black/[0.015]
          px-6
          text-center

          dark:border-white/10
          dark:bg-white/[0.015]
        "
      >
        <div
          className="
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-[#9a6a35]/10
            text-[#9a6a35]

            dark:bg-[#d6aa72]/10
            dark:text-[#d6aa72]
          "
        >
          <Package size={25} />
        </div>

        <h3
          className="
            mt-6
            text-xl
            font-black
          "
        >
          مفيش منتجات لسه
        </h3>

        <p
          className="
            mt-3
            max-w-md
            text-sm
            leading-7
            text-black/40

            dark:text-white/35
          "
        >
          أول ما المنتجات تكون متاحة،
          هتظهر هنا.
        </p>
      </div>
    );
  }

  /* =======================================================
     NO SEARCH RESULTS
  ======================================================= */

  if (visibleProducts.length === 0) {
    return (
      <div
        className="
          flex
          min-h-[420px]
          flex-col
          items-center
          justify-center
          rounded-[2rem]
          border
          border-dashed
          border-black/10
          bg-black/[0.015]
          px-6
          text-center

          dark:border-white/10
          dark:bg-white/[0.015]
        "
      >
        <div
          className="
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-[#9a6a35]/10
            text-[#9a6a35]

            dark:bg-[#d6aa72]/10
            dark:text-[#d6aa72]
          "
        >
          <Search size={24} />
        </div>

        <h3
          className="
            mt-6
            text-xl
            font-black
          "
        >
          مفيش نتيجة
        </h3>

        <p
          className="
            mt-3
            text-sm
            leading-7
            text-black/40

            dark:text-white/35
          "
        >
          جرّب كلمة بحث أو تصنيف مختلف.
        </p>
      </div>
    );
  }

  /* =======================================================
     GRID
  ======================================================= */

  return (
    <>
      {/* Grid Header */}

      <div
        className="
          mb-7
          flex
          flex-col
          gap-4

          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-[#211d18]
              text-white

              dark:bg-white
              dark:text-black
            "
          >
            <ShoppingBag size={15} />
          </div>

          <div>
            <div className="text-sm font-black">
              منتجات السوق
            </div>

            <div
              className="
                mt-1
                text-[9px]
                font-medium
                text-black/35

                dark:text-white/30
              "
            >
              {visibleProducts.length} قطعة
              متاحة
            </div>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            gap-2
            text-[9px]
            font-bold
            text-black/30

            dark:text-white/25
          "
        >
          <Sparkles
            size={12}
            className="
              text-[#9a6a35]

              dark:text-[#d6aa72]
            "
          />

          اختيارات من قلب الصعيد
        </div>
      </div>

      {/* Products */}

      <div
        className="
          grid
          grid-cols-1
          gap-5

          sm:grid-cols-2

          xl:grid-cols-3

          2xl:grid-cols-4
        "
      >
        {visibleProducts.map(
          (product, index) => (
            <ProductCard
              key={
                text(
                  product as ProductLike,
                  [
                    'id',
                    '_id',
                    'productId',
                  ]
                ) ||
                `product-${index}`
              }
              product={
                product as ProductLike
              }
              index={index}
              onOpen={setSelectedProduct}
              onNavigate={
                navigateToProduct
              }
            />
          )
        )}
      </div>

      {/* Quick View */}

      {selectedProduct && (
        <QuickView
          product={selectedProduct}
          onClose={() =>
            setSelectedProduct(null)
          }
          onNavigate={
            navigateToProduct
          }
        />
      )}
    </>
  );
};

export default ProductGrid;
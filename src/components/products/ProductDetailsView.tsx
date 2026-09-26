import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { updatePageSEO, generateProductSchema } from '../../utils/seo';

import {
  Heart,
  ShoppingBag,
  MessageSquare,
  Star,
  Sparkles,
  MapPin,
  Truck,
  ShieldCheck,
  Store,
  ChevronRight,
  Send,
  CheckCircle2,
  Share2,
  MessageCircle,
  Building2,
  Edit,
  Settings,
  Boxes,
  ArrowUpLeft,
  Minus,
  Plus,
  Copy,
  Package,
  Gem,
  Ruler,
  Weight,
  Clock3,
  Leaf,
  BadgeCheck,
  Layers3,
  Info,
} from 'lucide-react';

import { getWhatsAppUrl } from '../common/WhatsAppButton';

export const ProductDetailsView: React.FC = () => {
  const {
    products,
    selectedProductId,
    setActivePage,
    addToCart,
    toggleFavorite,
    isFavorite,
    navigateToSeller,
    reviews,
    addReview,
    addToast,
    currentRole,
    isAuthenticated,
    openChatWithArtisan,
    isLoading,
  } = useApp();

  const effectiveProductId =
    selectedProductId ||
    (typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/products/')
      ? decodeURIComponent(window.location.pathname.split('/')[2] || '')
      : null);

  const product =
    products.find((p) => p.id === effectiveProductId) ||
    (!effectiveProductId ? products[0] : undefined);
  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1);
    setActiveTab('desc');
    setNewRating(5);
    setNewComment('');
  }, [selectedProductId]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    'desc' | 'specs' | 'reviews' | 'shipping'
  >('desc');

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1);
    setActiveTab('desc');
    setNewRating(5);
    setNewComment('');
  }, [selectedProductId]);
  const productImages =
    product?.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
      ? product.images
      : [
        'https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/لوجو_وه_copy.png',
      ];

  const productTags = Array.isArray(product?.tags) ? product.tags : [];

  const productSpecs = product?.specifications || {
    material: 'خامات طبيعية تراثية',
    originGovernorate: product?.sellerGovernorate || 'قنا',
    craftsmanship: 'صناعة يدوية أصيلة',
  };

  const favorite = product ? isFavorite(product.id) : false;

  const productReviews = useMemo(
    () => (reviews || []).filter((r) => r.productId === product?.id),
    [reviews, product?.id]
  );

  useEffect(() => {
    if (!product) return;

    updatePageSEO({
      title: product.title || 'منتج تراثي',
      description: (product.description || '').slice(0, 160),
      image: productImages[0],
      type: 'product',
      schema: generateProductSchema({
        id: product.id,
        title: product.title || '',
        description: product.description || '',
        images: productImages,
        price: product.price || 0,
        rating: product.rating || 5,
        reviewCount: productReviews.length || product.reviewCount || 1,
        sellerName: product.sellerName || 'حرفي من الصعيد',
        sellerGovernorate: product.sellerGovernorate || 'صعيد مصر',
        inStock: product.inStock !== false,
        categoryName: product.categoryName || 'حرف ومشغولات يدوية'
      }),
    });
  }, [product, productReviews.length]);

  const relatedProducts = useMemo(
    () =>
      (products || [])
        .filter(
          (p) =>
            p.categoryId === product?.categoryId &&
            p.id !== product?.id &&
            p.approvalStatus === 'approved'
        )
        .slice(0, 4),
    [products, product]
  );

  const stockCount = product?.stockCount || 0;

  const totalPrice = product ? product.price * quantity : 0;

  const discountAmount =
    product &&
      product.originalPrice &&
      product.originalPrice > product.price
      ? product.originalPrice - product.price
      : 0;

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();

    if (!product || !newComment.trim()) return;

    addReview(product.id, newRating, newComment);

    setNewComment('');
  };

  const handleShare = async () => {
    if (!product) return;

    const shareUrl = `${window.location.origin}/products/${encodeURIComponent(
      product.id
    )}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `شاهد ${product.title} من سوق وه`,
          url: shareUrl,
        });
      } catch {
        // User cancelled share dialog.
      }
    } else {
      await navigator.clipboard?.writeText(shareUrl);

      addToast(
        'تم نسخ الرابط',
        'تم نسخ رابط المنتج المباشر',
        'info'
      );
    }
  };

  const handleCopyProductId = async () => {
    if (!product) return;

    await navigator.clipboard?.writeText(product.id);

    addToast(
      'تم النسخ',
      'تم نسخ كود المنتج',
      'info'
    );
  };

  if (isLoading && !product) {
    return (
      <div
        dir="rtl"
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-cream
          dark:bg-espresso-900
          px-5
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              mb-5
              h-12
              w-12
              animate-spin
              rounded-full
              border-4
              border-primary/20
              border-t-[#9a6a35]
              dark:border-[#d5a56d]/20
              dark:border-t-[#d5a56d]
            "
          />

          <p className="text-sm font-bold text-black/60 dark:text-white/60">
            جاري تحميل تفاصيل القطعة...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        dir="rtl"
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-cream
          dark:bg-espresso-900
          px-5
        "
      >
        <div
          className="
            max-w-md
            w-full
            rounded-[2rem]
            border
            border-black/10
            bg-white/70
            p-10
            text-center
            shadow-xl
            backdrop-blur-xl
            dark:border-white/10
            dark:bg-espresso-900/80
          "
        >
          <div
            className="
              mx-auto
              mb-5
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-primary/10
              text-primary
              dark:bg-[#d5a56d]/10
              dark:text-primary-hover
            "
          >
            <Package size={28} />
          </div>

          <h3 className="text-xl font-black">
            القطعة دي مش متوفرة دلوقتي
          </h3>

          <p className="mt-3 text-sm leading-7 text-black/50 dark:text-white/50">
            ممكن تكون القطعة خلصت أو اتحذفت، أو لسه البيانات بتتحمّل.
          </p>

          <button
            type="button"
            onClick={() => setActivePage('products')}
            className="
              mt-7
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-espresso
              px-6
              py-3
              text-sm
              font-bold
              text-white
              transition
              hover:-translate-y-0.5
              hover:bg-primary
              dark:bg-cream
              dark:text-black
              dark:hover:bg-primary-hover
              cursor-pointer
            "
          >
            <ArrowUpLeft size={16} />
            ارجع للسوق
          </button>
        </div>
      </div>
    );
  }

  return (
    <main
      id="product-details-view"
      dir="rtl"
      className="
        min-h-screen
        overflow-x-hidden
        bg-cream
        text-espresso
        transition-colors
        duration-500
        dark:bg-espresso-900
        dark:text-cream
        pb-28
        sm:pb-16
      "
    >
      {/* Background Decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="
            absolute
            -right-48
            top-40
            h-[500px]
            w-[500px]
            rounded-full
            border
            border-primary/10
            dark:border-[#d5a56d]/10
          "
        />

        <div
          className="
            absolute
            -left-52
            bottom-20
            h-[600px]
            w-[600px]
            rounded-full
            border
            border-primary/5
            dark:border-[#d5a56d]/5
          "
        />
      </div>

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-[1800px]
          px-4
          py-5
          sm:px-6
          sm:py-8
          lg:px-10
          xl:px-14
        "
      >
        {/* Top Navigation */}
        <div
          className="
            mb-7
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <nav
            className="
              flex
              min-w-0
              items-center
              gap-2
              overflow-hidden
              text-[11px]
              font-bold
              text-black/40
              dark:text-white/40
            "
          >
            <button
              type="button"
              onClick={() => setActivePage('home')}
              className="
                shrink-0
                transition
                hover:text-primary
                dark:hover:text-[#d5a56d]
                cursor-pointer
              "
            >
              الرئيسية
            </button>

            <ChevronRight
              size={13}
              className="shrink-0 rotate-180"
            />

            <button
              type="button"
              onClick={() => setActivePage('products')}
              className="
                shrink-0
                transition
                hover:text-primary
                dark:hover:text-[#d5a56d]
                cursor-pointer
              "
            >
              السوق
            </button>

            <ChevronRight
              size={13}
              className="shrink-0 rotate-180"
            />

            <span
              className="
                shrink-0
                text-primary
                dark:text-primary-hover
              "
            >
              {product.categoryName}
            </span>

            <ChevronRight
              size={13}
              className="shrink-0 rotate-180"
            />

            <span className="truncate text-black/70 dark:text-white/70">
              {product.title}
            </span>
          </nav>

          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <span
              className="
                text-[8px]
                font-black
                tracking-[0.3em]
                text-black/30
                dark:text-white/25
              "
            >
              WAH / CRAFT ARCHIVE
            </span>
          </div>
        </div>

        {/* ========================================= */}
        {/* HERO PRODUCT SECTION */}
        {/* ========================================= */}

        <section
          className="
            grid
            gap-6
            lg:grid-cols-[1.25fr_0.75fr]
            lg:gap-8
          "
        >
          {/* ================= GALLERY ================= */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[2rem]
              border
              border-black/10
              bg-[#ddd4c5]
              dark:border-white/10
              dark:bg-espresso-900
              lg:min-h-[760px]
            "
          >
            {/* Number */}
            <div
              className="
                absolute
                right-5
                top-5
                z-20
                flex
                items-center
                gap-2
                rounded-full
                border
                border-black/10
                bg-white/70
                px-3
                py-2
                text-[9px]
                font-black
                backdrop-blur-xl
                dark:border-white/10
                dark:bg-black/40
              "
            >
              <span>
                {String(selectedImageIndex + 1).padStart(2, '0')}
              </span>

              <span className="text-black/30 dark:text-white/30">
                /
              </span>

              <span className="text-black/40 dark:text-white/40">
                {String(productImages.length).padStart(2, '0')}
              </span>
            </div>

            {/* Main Image */}

            <div
              className="
                relative
                h-[430px]
                sm:h-[560px]
                lg:h-full
                lg:min-h-[760px]
              "
            >
              <img
                src={
                  productImages[selectedImageIndex] ||
                  productImages[0]
                }
                alt={product.title}
                className="
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-700
                  hover:scale-[1.025]
                "
              />

              {/* Image Gradient */}
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-x-0
                  bottom-0
                  h-48
                  bg-gradient-to-t
                  from-black/60
                  to-transparent
                "
              />

              {/* Image Bottom Info */}
              <div
                className="
                  absolute
                  bottom-5
                  right-5
                  left-5
                  z-10
                  flex
                  items-end
                  justify-between
                  gap-4
                  text-white
                "
              >
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="
                        rounded-full
                        bg-[#d5a56d]
                        px-3
                        py-1
                        text-[9px]
                        font-black
                        text-black
                      "
                    >
                      {product.isHandmade
                        ? 'HANDMADE'
                        : 'AUTHENTIC CRAFT'}
                    </span>

                    {product.discountPercent ? (
                      <span
                        className="
                          rounded-full
                          bg-white/15
                          px-3
                          py-1
                          text-[9px]
                          font-black
                          backdrop-blur-md
                        "
                      >
                        -{product.discountPercent}%
                      </span>
                    ) : null}
                  </div>

                  <div className="text-xs font-bold text-white/70">
                    صُنعت في
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-sm font-black">
                    <MapPin size={14} />
                    محافظة {product.sellerGovernorate}
                  </div>
                </div>

                <div
                  className="
                    hidden
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-white/20
                    bg-black/20
                    px-3
                    py-2
                    text-[9px]
                    font-bold
                    backdrop-blur-md
                    sm:flex
                  "
                >
                  <Gem size={12} />
                  قطعة تراثية
                </div>
              </div>

              {/* Favorite / Share */}
              <div
                className="
                  absolute
                  left-5
                  top-5
                  z-20
                  flex
                  gap-2
                "
              >
                <button
                  type="button"
                  onClick={handleShare}
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/20
                    bg-black/25
                    text-white
                    backdrop-blur-xl
                    transition
                    hover:bg-white
                    hover:text-black
                    cursor-pointer
                  "
                  title="مشاركة"
                >
                  <Share2 size={17} />
                </button>

                {(currentRole === 'buyer' ||
                  !isAuthenticated) && (
                    <button
                      type="button"
                      onClick={() =>
                        toggleFavorite(product.id)
                      }
                      className={`
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-full
                      border
                      backdrop-blur-xl
                      transition
                      cursor-pointer
                      ${favorite
                          ? 'border-rose-400 bg-rose-500 text-white'
                          : 'border-white/20 bg-black/25 text-white hover:bg-white hover:text-rose-500'
                        }
                    `}
                      title="المفضلة"
                    >
                      <Heart
                        size={17}
                        fill={
                          favorite ? 'currentColor' : 'none'
                        }
                      />
                    </button>
                  )}
              </div>
            </div>

            {/* Thumbnails */}

            {productImages.length > 1 && (
              <div
                className="
                  absolute
                  bottom-5
                  left-5
                  right-5
                  z-20
                  flex
                  gap-2
                  overflow-x-auto
                  pb-1
                "
              >
                {productImages.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() =>
                      setSelectedImageIndex(idx)
                    }
                    className={`
                      h-14
                      w-14
                      shrink-0
                      overflow-hidden
                      rounded-xl
                      border-2
                      transition
                      cursor-pointer
                      sm:h-16
                      sm:w-16
                      ${selectedImageIndex === idx
                        ? 'border-[#d5a56d] scale-105'
                        : 'border-white/30 opacity-60 hover:opacity-100'
                      }
                    `}
                  >
                    <img
                      src={img}
                      alt={`صورة ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ================= PRODUCT INFO ================= */}

          <div
            className="
              flex
              flex-col
              rounded-[2rem]
              border
              border-black/10
              bg-white/65
              p-5
              shadow-sm
              backdrop-blur-xl
              dark:border-white/10
              dark:bg-[#121210]/80
              sm:p-7
              lg:p-9
            "
          >
            {/* Collection Label */}

            <div className="flex items-center justify-between gap-3">
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[9px]
                  font-black
                  tracking-[0.2em]
                  text-primary
                  dark:text-primary-hover
                "
              >
                <Sparkles size={13} />
                WAH CRAFT COLLECTION
              </div>

              {product.approvalStatus === 'approved' && (
                <div
                  className="
                    flex
                    items-center
                    gap-1.5
                    rounded-full
                    bg-emerald-500/10
                    px-2.5
                    py-1.5
                    text-[9px]
                    font-bold
                    text-emerald-700
                    dark:text-emerald-300
                  "
                >
                  <BadgeCheck size={13} />
                  معتمد
                </div>
              )}
            </div>

            {/* Product Title */}

            <div className="mt-8">
              <h1
                className="
                  max-w-xl
                  text-4xl
                  font-black
                  leading-[1.05]
                  tracking-[-0.055em]
                  sm:text-5xl
                  lg:text-6xl
                "
              >
                {product.title}
              </h1>

              {product.titleEn && (
                <p
                  className="
                    mt-3
                    text-[10px]
                    font-bold
                    tracking-[0.12em]
                    text-black/35
                    dark:text-white/30
                  "
                >
                  {product.titleEn}
                </p>
              )}
            </div>

            {/* Seller */}

            <button
              type="button"
              onClick={() =>
                navigateToSeller(product.sellerId)
              }
              className="
                mt-8
                flex
                w-full
                items-center
                justify-between
                border-y
                border-black/10
                py-4
                text-right
                transition
                hover:bg-black/[0.025]
                dark:border-white/10
                dark:hover:bg-white/[0.025]
                cursor-pointer
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-2xl
                    bg-primary/10
                    text-primary
                    dark:bg-[#d5a56d]/10
                    dark:text-primary-hover
                  "
                >
                  <Store size={19} />
                </div>

                <div>
                  <div className="text-[9px] text-black/40 dark:text-white/40">
                    صُنعت بأنامل
                  </div>

                  <div className="mt-1 text-sm font-black">
                    {product.sellerName}
                  </div>
                </div>
              </div>

              <ArrowUpLeft
                size={17}
                className="text-black/30 dark:text-white/30"
              />
            </button>

            {/* Location */}

            <div className="mt-5 flex items-center justify-between gap-3">
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-bold
                  text-black/60
                  dark:text-white/60
                "
              >
                <MapPin
                  size={15}
                  className="text-primary dark:text-primary-hover"
                />

                محافظة {product.sellerGovernorate}
              </div>

              <button
                type="button"
                onClick={handleCopyProductId}
                className="
                  flex
                  items-center
                  gap-1.5
                  text-[9px]
                  font-bold
                  text-black/35
                  transition
                  hover:text-primary
                  dark:text-white/30
                  dark:hover:text-[#d5a56d]
                  cursor-pointer
                "
                title="نسخ كود المنتج"
              >
                <span>
                  #{product.id.slice(0, 8)}
                </span>

                <Copy size={11} />
              </button>
            </div>

            {/* Rating */}

            <div
              className="
                mt-6
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={
                      star <= Math.floor(product.rating)
                        ? ' text-primary-hover'
                        : 'text-black/15 dark:text-white/15'
                    }
                  />
                ))}
              </div>

              <span className="text-sm font-black">
                {product.rating}
              </span>

              <span className="text-[10px] text-black/40 dark:text-white/40">
                {product.reviewCount} تقييم
              </span>
            </div>

            {/* Description */}

            <p
              className="
                mt-7
                text-sm
                leading-8
                text-black/55
                dark:text-white/50
              "
            >
              {product.description}
            </p>

            {/* Data Strip */}

            <div
              className="
                mt-7
                grid
                grid-cols-2
                gap-px
                overflow-hidden
                rounded-2xl
                border
                border-black/10
                bg-black/10
                dark:border-white/10
                dark:bg-cream/10
              "
            >
              <div
                className="
                  bg-white/70
                  p-4
                  dark:bg-[#171714]/90
                "
              >
                <div className="flex items-center gap-2 text-[9px] text-black/40 dark:text-white/35">
                  <Leaf size={13} />
                  الخامة
                </div>

                <div className="mt-2 text-xs font-black">
                  {productSpecs.material || 'خامات طبيعية'}
                </div>
              </div>

              <div
                className="
                  bg-white/70
                  p-4
                  dark:bg-[#171714]/90
                "
              >
                <div className="flex items-center gap-2 text-[9px] text-black/40 dark:text-white/35">
                  <Layers3 size={13} />
                  الصنعة
                </div>

                <div className="mt-2 text-xs font-black">
                  {productSpecs.craftsmanship ||
                    'صناعة يدوية'}
                </div>
              </div>

              <div
                className="
                  bg-white/70
                  p-4
                  dark:bg-[#171714]/90
                "
              >
                <div className="flex items-center gap-2 text-[9px] text-black/40 dark:text-white/35">
                  <MapPin size={13} />
                  المنشأ
                </div>

                <div className="mt-2 text-xs font-black">
                  {productSpecs.originGovernorate ||
                    product.sellerGovernorate}
                </div>
              </div>

              <div
                className="
                  bg-white/70
                  p-4
                  dark:bg-[#171714]/90
                "
              >
                <div className="flex items-center gap-2 text-[9px] text-black/40 dark:text-white/35">
                  <Package size={13} />
                  المخزون
                </div>

                <div className="mt-2 text-xs font-black">
                  {product.inStock
                    ? `${stockCount} قطعة`
                    : 'خلصان دلوقتي'}
                </div>
              </div>
            </div>

            {/* Price */}

            <div className="mt-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-[10px] font-bold text-black/40 dark:text-white/35">
                    السعر
                  </div>

                  <div className="mt-1 flex items-baseline gap-2">
                    <span
                      className="
                        text-4xl
                        font-black
                        tracking-[-0.06em]
                        text-primary
                        dark:text-primary-hover
                      "
                    >
                      {product.price}
                    </span>

                    <span className="text-xs font-bold">
                      جنيه مصري
                    </span>
                  </div>
                </div>

                {product.originalPrice &&
                  product.originalPrice > product.price ? (
                  <div className="text-left">
                    <div className="text-[10px] text-black/35 dark:text-white/30">
                      السعر قبل الخصم
                    </div>

                    <div className="mt-1 text-sm font-bold text-black/35 line-through dark:text-white/30">
                      {product.originalPrice} ج.م
                    </div>

                    <div className="mt-1 text-[9px] font-black text-emerald-600 dark:text-emerald-400">
                      وفّرت {discountAmount} ج.م
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Stock */}

            <div
              className={`
                mt-5
                flex
                items-center
                justify-between
                rounded-2xl
                border
                px-4
                py-3
                ${product.inStock
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : 'border-rose-500/20 bg-rose-500/5'
                }
              `}
            >
              <div
                className={`
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-bold
                  ${product.inStock
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-rose-700 dark:text-rose-300'
                  }
                `}
              >
                <CheckCircle2 size={15} />

                {product.inStock
                  ? 'القطعة متاحة للطلب'
                  : 'القطعة غير متوفرة'}
              </div>

              {product.inStock && (
                <span className="text-[9px] font-bold text-black/35 dark:text-white/30">
                  {stockCount} متاح حالياً
                </span>
              )}
            </div>

            {/* Actions */}

            <div className="mt-6">
              {currentRole === 'buyer' ||
                !isAuthenticated ? (
                <>
                  <div className="flex gap-3">
                    {/* Quantity */}

                    <div
                      className="
                        flex
                        h-14
                        shrink-0
                        items-center
                        rounded-2xl
                        border
                        border-black/10
                        bg-black/[0.025]
                        p-1
                        dark:border-white/10
                        dark:bg-cream/[0.025]
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(
                            Math.max(1, quantity - 1)
                          )
                        }
                        className="
                          flex
                          h-12
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          transition
                          hover:bg-black/5
                          dark:hover:bg-white/10
                          cursor-pointer
                        "
                      >
                        <Minus size={15} />
                      </button>

                      <span className="w-8 text-center text-sm font-black">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        disabled={
                          quantity >= stockCount
                        }
                        onClick={() =>
                          setQuantity(
                            Math.min(
                              stockCount || 99,
                              quantity + 1
                            )
                          )
                        }
                        className="
                          flex
                          h-12
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          transition
                          hover:bg-black/5
                          disabled:opacity-30
                          dark:hover:bg-white/10
                          cursor-pointer
                        "
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    {/* Cart */}

                    <button
                      type="button"
                      disabled={!product.inStock}
                      onClick={() =>
                        addToCart(product, quantity)
                      }
                      className="
                        flex
                        min-h-14
                        flex-1
                        items-center
                        justify-center
                        gap-2
                        rounded-2xl
                        bg-espresso
                        px-4
                        text-xs
                        font-black
                        text-white
                        shadow-lg
                        transition
                        hover:-translate-y-0.5
                        hover:bg-primary
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                        dark:bg-cream
                        dark:text-black
                        dark:hover:bg-primary-hover
                        cursor-pointer
                      "
                    >
                      <ShoppingBag size={18} />

                      <span>
                        حط في السلة
                      </span>

                      <span className="hidden sm:inline">
                        • {totalPrice} ج.م
                      </span>
                    </button>
                  </div>

                  {/* Chat */}

                  <button
                    type="button"
                    onClick={() =>
                      openChatWithArtisan({
                        sellerId:
                          product.sellerId ||
                          product.id,
                        productId: product.id,
                        initialMessage: `سلام عليكم يا معلم، كنت عايز أسأل عن "${product.title}" المعروضة على سوق وه.`,
                      })
                    }
                    className="
                      mt-3
                      flex
                      min-h-12
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      border
                      border-primary/20
                      bg-primary/5
                      px-4
                      text-xs
                      font-bold
                      text-[#7b542b]
                      transition
                      hover:bg-primary/10
                      dark:border-[#d5a56d]/20
                      dark:bg-[#d5a56d]/5
                      dark:text-primary-hover
                      dark:hover:bg-primary-hover/10
                      cursor-pointer
                    "
                  >
                    <MessageSquare size={16} />
                    تواصل مع الحرفي
                  </button>
                </>
              ) : currentRole === 'seller' ? (
                <div
                  className="
                    rounded-2xl
                    border
                    border-amber-500/20
                    bg-amber-500/5
                    p-4
                  "
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-primary-hover">
                    <Store size={16} />
                    أنت مسجل كبائع وحرفي
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActivePage('seller-products')
                      }
                      className="
                        flex
                        min-h-11
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-amber-700
                        px-4
                        text-xs
                        font-bold
                        text-white
                        hover:bg-amber-800
                        cursor-pointer
                      "
                    >
                      <Edit size={15} />
                      تعديل المنتج
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActivePage('seller-inventory')
                      }
                      className="
                        flex
                        min-h-11
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-amber-500/30
                        bg-white
                        px-4
                        text-xs
                        font-bold
                        text-amber-800
                        hover:bg-amber-50
                        dark:bg-[#1a1512]
                        dark:text-primary-hover
                        cursor-pointer
                      "
                    >
                      <Boxes size={15} />
                      المخزون
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="
                    rounded-2xl
                    border
                    border-purple-500/20
                    bg-purple-500/5
                    p-4
                  "
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-800 dark:text-purple-200">
                    <Settings size={16} />
                    إدارة المنتج
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActivePage('admin-products')
                      }
                      className="
                        flex
                        min-h-11
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-purple-700
                        px-4
                        text-xs
                        font-bold
                        text-white
                        hover:bg-purple-800
                        cursor-pointer
                      "
                    >
                      <Settings size={15} />
                      إدارة المنتج
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActivePage('admin-dashboard')
                      }
                      className="
                        flex
                        min-h-11
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-purple-500/30
                        bg-white
                        px-4
                        text-xs
                        font-bold
                        text-purple-800
                        hover:bg-purple-50
                        dark:bg-[#17121a]
                        dark:text-purple-200
                        cursor-pointer
                      "
                    >
                      <ShieldCheck size={15} />
                      المراجعة
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Trust */}

            <div
              className="
                mt-auto
                pt-7
              "
            >
              <div
                className="
                  grid
                  grid-cols-2
                  gap-2
                "
              >
                <div
                  className="
                    rounded-2xl
                    border
                    border-black/10
                    bg-black/[0.025]
                    p-3
                    dark:border-white/10
                    dark:bg-cream/[0.025]
                  "
                >
                  <Truck
                    size={16}
                    className="text-primary dark:text-primary-hover"
                  />

                  <div className="mt-2 text-[9px] font-bold text-black/50 dark:text-white/40">
                    توصيل لباب البيت
                  </div>
                </div>

                <div
                  className="
                    rounded-2xl
                    border
                    border-black/10
                    bg-black/[0.025]
                    p-3
                    dark:border-white/10
                    dark:bg-cream/[0.025]
                  "
                >
                  <ShieldCheck
                    size={16}
                    className="text-primary dark:text-primary-hover"
                  />

                  <div className="mt-2 text-[9px] font-bold text-black/50 dark:text-white/40">
                    أصالة الحرفة
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================= */}
        {/* WHOLESALE */}
        {/* ========================================= */}

        <section
          className="
            mt-6
            overflow-hidden
            rounded-[2rem]
            border
            border-primary/20
            bg-espresso
            text-white
            dark:border-[#d5a56d]/20
          "
        >
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[9px]
                  font-black
                  tracking-[0.25em]
                  text-[#d5a56d]
                "
              >
                <Building2 size={14} />
                WAH BUSINESS
              </div>

              <h2 className="mt-4 text-xl font-black sm:text-2xl">
                محتاج كمية كبيرة؟
              </h2>

              <p className="mt-2 max-w-2xl text-xs leading-7 text-white/50 sm:text-sm">
                متوفر للبيع بالجملة وتوريدات الفنادق
                والشركات مع إمكانية التخصيص وطلب عينات
                قبل التوريد.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <a
                href={getWhatsAppUrl(
                  `السلام عليكم، نود طلب عرض أسعار جملة لمنتج: "${product.title}" (كود: ${product.id})`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex
                  min-h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#d5a56d]
                  px-6
                  text-xs
                  font-black
                  text-black
                  transition
                  hover:bg-white
                "
              >
                <MessageCircle size={16} />
                طلب عرض جملة
              </a>

              <button
                type="button"
                onClick={() => setActivePage('wholesale')}
                className="
                  flex
                  min-h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  px-6
                  text-xs
                  font-bold
                  transition
                  hover:bg-white/10
                  cursor-pointer
                "
              >
                تفاصيل التوريد
                <ArrowUpLeft size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* ========================================= */}
        {/* INFORMATION TABS */}
        {/* ========================================= */}

        <section className="mt-6">
          <div
            className="
              overflow-hidden
              rounded-[2rem]
              border
              border-black/10
              bg-white/65
              shadow-sm
              backdrop-blur-xl
              dark:border-white/10
              dark:bg-[#121210]/80
            "
          >
            {/* Tabs */}

            <div
              className="
                flex
                overflow-x-auto
                border-b
                border-black/10
                dark:border-white/10
              "
            >
              {[
                ['desc', 'الحكاية والوصف'],
                ['specs', 'المواصفات'],
                ['reviews', `التقييمات (${productReviews.length})`],
                ['shipping', 'الشحن والتغليف'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      key as
                      | 'desc'
                      | 'specs'
                      | 'reviews'
                      | 'shipping'
                    )
                  }
                  className={`
                    shrink-0
                    px-5
                    py-5
                    text-xs
                    font-black
                    transition
                    cursor-pointer
                    sm:px-7
                    ${activeTab === key
                      ? 'border-b-2 border-primary text-primary dark:border-[#d5a56d] dark:text-primary-hover'
                      : 'text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white'
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-5 sm:p-8 lg:p-10">
              {/* Description */}

              {activeTab === 'desc' && (
                <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                  <div>
                    <div
                      className="
                        mb-5
                        flex
                        items-center
                        gap-2
                        text-[9px]
                        font-black
                        tracking-[0.2em]
                        text-primary
                        dark:text-primary-hover
                      "
                    >
                      <Sparkles size={14} />
                      THE STORY BEHIND THE CRAFT
                    </div>

                    <h3 className="text-2xl font-black sm:text-3xl">
                      مش مجرد قطعة.
                    </h3>

                    <p
                      className="
                        mt-5
                        max-w-3xl
                        text-sm
                        leading-9
                        text-black/60
                        dark:text-white/50
                      "
                    >
                      {product.description}
                    </p>

                    <p
                      className="
                        mt-5
                        max-w-3xl
                        text-sm
                        leading-9
                        text-black/55
                        dark:text-white/45
                      "
                    >
                      هذه القطعة جزء من حرفة متوارثة في
                      صعيد مصر، تجمع بين الخامة الطبيعية
                      والمهارة اليدوية والهوية المحلية.
                      كل تفصيلة فيها بتعبر عن المكان اللي
                      خرجت منه.
                    </p>

                    {productTags.length > 0 && (
                      <div className="mt-7 flex flex-wrap gap-2">
                        {productTags.map((tag, index) => (
                          <span
                            key={`${tag}-${index}`}
                            className="
                              rounded-full
                              border
                              border-black/10
                              bg-black/[0.025]
                              px-3
                              py-2
                              text-[10px]
                              font-bold
                              text-black/50
                              dark:border-white/10
                              dark:bg-cream/[0.025]
                              dark:text-white/45
                            "
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    className="
                      rounded-3xl
                      bg-espresso
                      p-6
                      text-white
                      dark:bg-[#0d0d0c]
                    "
                  >
                    <div className="flex items-center gap-2 text-[#d5a56d]">
                      <Gem size={17} />
                      <span className="text-xs font-black">
                        هوية القطعة
                      </span>
                    </div>

                    <div className="mt-7 space-y-5">
                      <div>
                        <div className="text-[9px] text-white/35">
                          الحرفة
                        </div>
                        <div className="mt-1 text-sm font-bold">
                          {productSpecs.craftsmanship ||
                            'صناعة يدوية أصيلة'}
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] text-white/35">
                          الخامة
                        </div>
                        <div className="mt-1 text-sm font-bold">
                          {productSpecs.material ||
                            'خامات طبيعية'}
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] text-white/35">
                          المنشأ
                        </div>
                        <div className="mt-1 text-sm font-bold">
                          صعيد مصر —{' '}
                          {productSpecs.originGovernorate ||
                            product.sellerGovernorate}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Specs */}

              {activeTab === 'specs' && (
                <div>
                  <div className="mb-7">
                    <div
                      className="
                        text-[9px]
                        font-black
                        tracking-[0.2em]
                        text-primary
                        dark:text-primary-hover
                      "
                    >
                      PRODUCT SPECIFICATION
                    </div>

                    <h3 className="mt-2 text-2xl font-black">
                      كل التفاصيل
                    </h3>
                  </div>

                  <div
                    className="
                      grid
                      overflow-hidden
                      rounded-3xl
                      border
                      border-black/10
                      dark:border-white/10
                      sm:grid-cols-2
                    "
                  >
                    {[
                      [
                        <Leaf size={17} />,
                        'الخامات',
                        productSpecs.material ||
                        'خامات طبيعية',
                      ],
                      [
                        <MapPin size={17} />,
                        'مكان المنشأ',
                        `صعيد مصر - ${productSpecs.originGovernorate ||
                        product.sellerGovernorate
                        }`,
                      ],
                      [
                        <Sparkles size={17} />,
                        'طريقة الصنع',
                        productSpecs.craftsmanship ||
                        'صناعة يدوية أصيلة',
                      ],
                      [
                        <Ruler size={17} />,
                        'الأبعاد',
                        productSpecs.dimensions ||
                        'غير محددة',
                      ],
                      [
                        <Weight size={17} />,
                        'الوزن',
                        productSpecs.weight ||
                        'غير محدد',
                      ],
                      [
                        <Clock3 size={17} />,
                        'وقت التصنيع',
                        productSpecs.estimatedMakingTime ||
                        'حسب نوع القطعة',
                      ],
                      [
                        <Info size={17} />,
                        'العناية',
                        productSpecs.careInstructions ||
                        'العناية حسب الخامة',
                      ],
                      [
                        <Package size={17} />,
                        'المخزون',
                        product.inStock
                          ? `${stockCount} قطعة`
                          : 'خلصان دلوقتي',
                      ],
                    ].map(
                      ([icon, label, value], index) => (
                        <div
                          key={index}
                          className="
                            flex
                            gap-4
                            border-b
                            border-black/10
                            p-5
                            last:border-b-0
                            dark:border-white/10
                            sm:nth-[odd]:border-l
                          "
                        >
                          <div
                            className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              bg-primary/10
                              text-primary
                              dark:bg-[#d5a56d]/10
                              dark:text-primary-hover
                            "
                          >
                            {icon}
                          </div>

                          <div>
                            <div className="text-[9px] font-bold text-black/35 dark:text-white/30">
                              {label}
                            </div>

                            <div className="mt-1 text-xs font-black">
                              {value}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Reviews */}

              {activeTab === 'reviews' && (
                <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                  {/* Review Summary */}

                  <div
                    className="
                      h-fit
                      rounded-3xl
                      bg-espresso
                      p-7
                      text-white
                      dark:bg-[#0d0d0c]
                    "
                  >
                    <div className="text-[9px] font-black tracking-[0.2em] text-[#d5a56d]">
                      CUSTOMER REVIEWS
                    </div>

                    <div className="mt-7 flex items-end gap-3">
                      <span className="text-6xl font-black tracking-[-0.08em]">
                        {product.rating}
                      </span>

                      <div className="pb-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(
                            (star) => (
                              <Star
                                key={star}
                                size={14}
                                className={
                                  star <=
                                    Math.floor(
                                      product.rating
                                    )
                                    ? ' text-primary-hover'
                                    : 'text-white/15'
                                }
                              />
                            )
                          )}
                        </div>

                        <div className="mt-1 text-[9px] text-white/40">
                          {product.reviewCount} تقييم
                        </div>
                      </div>
                    </div>

                    <div className="mt-7 border-t border-white/10 pt-5">
                      <p className="text-xs leading-7 text-white/45">
                        رأي المشترين بيساعد الناس تعرف
                        جودة القطعة قبل ما تطلبها.
                      </p>
                    </div>
                  </div>

                  {/* Reviews */}

                  <div className="space-y-4">
                    {productReviews.length === 0 ? (
                      <div
                        className="
                          rounded-3xl
                          border
                          border-dashed
                          border-black/10
                          p-8
                          text-center
                          dark:border-white/10
                        "
                      >
                        <Star
                          size={25}
                          className="
                            mx-auto
                            text-primary
                            dark:text-primary-hover
                          "
                        />

                        <p className="mt-3 text-xs font-bold text-black/50 dark:text-white/40">
                          كن أول من يكتب تقييمًا لهذه القطعة.
                        </p>
                      </div>
                    ) : (
                      productReviews.map((review) => (
                        <div
                          key={review.id}
                          className="
                            rounded-2xl
                            border
                            border-black/10
                            bg-black/[0.02]
                            p-5
                            dark:border-white/10
                            dark:bg-cream/[0.02]
                          "
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="
                                  flex
                                  h-10
                                  w-10
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-primary
                                  text-sm
                                  font-black
                                  text-white
                                "
                              >
                                {review.userName.charAt(
                                  0
                                )}
                              </div>

                              <div>
                                <div className="text-xs font-black">
                                  {review.userName}
                                </div>

                                <div className="mt-1 text-[9px] text-black/40 dark:text-white/30">
                                  {review.userGovernorate
                                    ? `محافظة ${review.userGovernorate}`
                                    : 'مشتري موثق'}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-1">
                              {Array.from({
                                length: review.rating,
                              }).map((_, index) => (
                                <Star
                                  key={index}
                                  size={12}
                                  className=" text-primary-hover"
                                />
                              ))}
                            </div>
                          </div>

                          <p className="mt-4 text-xs leading-7">
                            {review.comment}
                          </p>

                          <div className="mt-3 text-[9px] text-black/30 dark:text-white/25">
                            {review.date}
                          </div>
                        </div>
                      ))
                    )}

                    {/* Add Review */}

                    <form
                      onSubmit={handleAddReview}
                      className="
                        rounded-3xl
                        border
                        border-black/10
                        bg-white/60
                        p-6
                        dark:border-white/10
                        dark:bg-cream/[0.02]
                      "
                    >
                      <h4 className="text-sm font-black">
                        شارك تجربتك
                      </h4>

                      <div className="mt-4 flex gap-1">
                        {[1, 2, 3, 4, 5].map(
                          (star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setNewRating(star)
                              }
                              className="cursor-pointer p-1"
                            >
                              <Star
                                size={20}
                                className={
                                  star <= newRating
                                    ? ' text-primary-hover'
                                    : 'text-black/15 dark:text-white/15'
                                }
                              />
                            </button>
                          )
                        )}
                      </div>

                      <textarea
                        required
                        value={newComment}
                        onChange={(e) =>
                          setNewComment(e.target.value)
                        }
                        rows={4}
                        placeholder="اكتب رأيك في القطعة وجودة الصنع..."
                        className="
                          mt-4
                          w-full
                          resize-none
                          rounded-2xl
                          border
                          border-black/10
                          bg-black/[0.025]
                          p-4
                          text-xs
                          outline-none
                          transition
                          focus:border-primary
                          dark:border-white/10
                          dark:bg-cream/[0.025]
                        "
                      />

                      <button
                        type="submit"
                        className="
                          mt-3
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          bg-espresso
                          px-5
                          py-3
                          text-xs
                          font-bold
                          text-white
                          transition
                          hover:bg-primary
                          dark:bg-cream
                          dark:text-black
                          dark:hover:bg-primary-hover
                          cursor-pointer
                        "
                      >
                        <Send size={14} />
                        إرسال التقييم
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Shipping */}

              {activeTab === 'shipping' && (
                <div>
                  <div className="mb-7">
                    <div
                      className="
                        text-[9px]
                        font-black
                        tracking-[0.2em]
                        text-primary
                        dark:text-primary-hover
                      "
                    >
                      DELIVERY & PACKAGING
                    </div>

                    <h3 className="mt-2 text-2xl font-black">
                      القطعة هتوصلك بأمان
                    </h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div
                      className="
                        rounded-3xl
                        border
                        border-black/10
                        bg-black/[0.02]
                        p-6
                        dark:border-white/10
                        dark:bg-cream/[0.02]
                      "
                    >
                      <Package
                        size={22}
                        className="text-primary dark:text-primary-hover"
                      />

                      <h4 className="mt-4 text-sm font-black">
                        التغليف الآمن
                      </h4>

                      <p className="mt-3 text-xs leading-7 text-black/50 dark:text-white/40">
                        يتم تجهيز القطع بعناية واستخدام
                        التغليف المناسب لطبيعة المنتج
                        لتقليل احتمالات التلف أثناء النقل.
                      </p>
                    </div>

                    <div
                      className="
                        rounded-3xl
                        border
                        border-black/10
                        bg-black/[0.02]
                        p-6
                        dark:border-white/10
                        dark:bg-cream/[0.02]
                      "
                    >
                      <Truck
                        size={22}
                        className="text-primary dark:text-primary-hover"
                      />

                      <h4 className="mt-4 text-sm font-black">
                        التوصيل
                      </h4>

                      <ul className="mt-3 space-y-2 text-xs leading-7 text-black/50 dark:text-white/40">
                        <li>
                          • القاهرة والجيزة والإسكندرية:
                          48–72 ساعة.
                        </li>

                        <li>
                          • باقي المحافظات: 3–4 أيام عمل
                          تقريباً.
                        </li>

                        <li>
                          • المناطق البعيدة: حسب شركة
                          التوصيل.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================= */}
        {/* RELATED PRODUCTS */}
        {/* ========================================= */}

        {relatedProducts.length > 0 && (
          <section className="mt-16 pb-24">
            <div
              className="
                mb-7
                flex
                items-end
                justify-between
                gap-5
              "
            >
              <div>
                <div
                  className="
                    text-[9px]
                    font-black
                    tracking-[0.2em]
                    text-primary
                    dark:text-primary-hover
                  "
                >
                  YOU MAY ALSO LIKE
                </div>

                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  قطع من نفس الحكاية
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setActivePage('products')}
                className="
                  hidden
                  items-center
                  gap-2
                  text-xs
                  font-bold
                  text-primary
                  hover:underline
                  dark:text-primary-hover
                  sm:flex
                  cursor-pointer
                "
              >
                عرض كل المنتجات
                <ArrowUpLeft size={15} />
              </button>
            </div>

            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              {relatedProducts.map((related) => (
                <ProductCard
                  key={related.id}
                  product={related}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActivePage('products')}
              className="
                mt-5
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-black/10
                bg-white/50
                py-4
                text-xs
                font-bold
                dark:border-white/10
                dark:bg-cream/[0.025]
                sm:hidden
                cursor-pointer
              "
            >
              عرض كل المنتجات
              <ArrowUpLeft size={15} />
            </button>
          </section>
        )}
      </div>

      {/* ========================================= */}
      {/* MOBILE STICKY CART */}
      {/* ========================================= */}

      {(currentRole === 'buyer' ||
        !isAuthenticated) &&
        product.inStock && (
          <div
            className="
              fixed
              bottom-0
              left-0
              right-0
              z-50
              border-t
              border-black/10
              bg-cream/95
              p-3
              pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]
              shadow-[0_-10px_40px_rgba(0,0,0,0.12)]
              backdrop-blur-2xl
              dark:border-white/10
              dark:bg-espresso-900/95
              sm:hidden
            "
          >
            <div className="flex items-center gap-3">
              <div className="min-w-0">
                <div className="text-[9px] text-black/40 dark:text-white/35">
                  الإجمالي
                </div>

                <div className="text-base font-black text-primary dark:text-primary-hover">
                  {totalPrice} ج.م
                </div>
              </div>

              <div
                className="
                  flex
                  shrink-0
                  items-center
                  rounded-xl
                  border
                  border-black/10
                  bg-black/[0.03]
                  dark:border-white/10
                  dark:bg-cream/[0.03]
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      Math.max(1, quantity - 1)
                    )
                  }
                  className="
                    flex
                    h-10
                    w-9
                    items-center
                    justify-center
                    cursor-pointer
                  "
                >
                  <Minus size={14} />
                </button>

                <span className="w-7 text-center text-xs font-black">
                  {quantity}
                </span>

                <button
                  type="button"
                  disabled={quantity >= stockCount}
                  onClick={() =>
                    setQuantity(
                      Math.min(
                        stockCount || 99,
                        quantity + 1
                      )
                    )
                  }
                  className="
                    flex
                    h-10
                    w-9
                    items-center
                    justify-center
                    disabled:opacity-30
                    cursor-pointer
                  "
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  addToCart(product, quantity)
                }
                className="
                  flex
                  min-h-11
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-espresso
                  px-3
                  text-xs
                  font-black
                  text-white
                  dark:bg-cream
                  dark:text-black
                  cursor-pointer
                "
              >
                <ShoppingBag size={16} />
                حط في السلة
              </button>
            </div>
          </div>
        )}
    </main>
  );
};

export default ProductDetailsView;
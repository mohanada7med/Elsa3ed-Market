
import React, { useEffect, useState } from 'react';
import {
  ArrowUpLeft,
  BadgeCheck,
  Clock3,
  MapPin,
  Sparkles,
  Star,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import type { HomePromotionPosition, PaidPromotion } from '../../types';
import { p } from 'motion/react-client';

let promotionRequest: Promise<PaidPromotion | null> | null = null;

interface PaidPromotionSectionProps {
  position?: HomePromotionPosition;
  directory?: boolean;
}

export const PaidPromotionSection: React.FC<PaidPromotionSectionProps> = ({
  position,
  directory = false,
}) => {
  const { products, sellers, navigateToProduct, navigateToSeller } = useApp();

  const [promotion, setPromotion] = useState<PaidPromotion | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    if (!promotionRequest) {
      promotionRequest = api.getPaidPromotion().finally(() => {
        promotionRequest = null;
      });
    }

    promotionRequest
      .then((result) => {
        if (active) setPromotion(result);
      })
      .catch((error) => {
        console.error('[PaidPromotionSection] Failed to load promotion:', error);
        if (active) setLoadError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loadError && (directory || position === 'after-reels')) {
    return (
      <div role="status" className="mx-auto max-w-6xl px-5 py-3 text-center text-xs text-foreground-muted">
        تعذر تحميل مساحة الترشيح حاليًا.
      </div>
    );
  }

  if (!promotion || (!directory && position !== (promotion.homepagePosition || 'after-reels'))) {
    return null;
  }

  const isProduct = promotion.contentType === 'product';

  const product = isProduct
    ? promotion.content as Extract<PaidPromotion['content'], { title: string }>
    : null;

  const seller = !isProduct
    ? promotion.content as Extract<PaidPromotion['content'], { brandName: string }>
    : null;

  const title = product?.title || seller?.brandName || seller?.name || 'قطعة من تراث الصعيد';

  const productSeller = product
    ? sellers.find(
      (item) =>
        item.id === product.sellerId ||
        item.userId === product.sellerId ||
        item.brandName === product.sellerName
    )
    : null;
  const maker = seller || productSeller;
  const workshopProduct = seller
    ? products.find((item) =>
      item.approvalStatus === 'approved' &&
      (
        item.sellerId === seller.id ||
        item.sellerId === seller.userId ||
        item.sellerName === seller.brandName
      ) &&
      item.images?.[0]
    )
    : undefined;
  const workshopProductImage = workshopProduct?.images?.[0];
  const floatingProductImage = isProduct
    ? product?.images?.[1] || product?.images?.[0]
    : workshopProduct?.images?.[1] || workshopProductImage;
  const sellerName =
    maker?.name || product?.sellerName || seller?.brandName || 'صانع من الصعيد';

  const specialty = maker?.specialty || 'صناعة يدوية';

  const governorate =
    maker?.governorate || product?.sellerGovernorate || 'صعيد مصر';

  // Use a workshop product image instead of its cover image.
  const coverImage = product?.images?.[0] || workshopProductImage;

  // صورة البائع الشخصية
  const avatar = maker?.avatar || product?.artisanPortrait;

  const expiresAt = new Date(promotion.endsAt).toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
  });

  const handleClick = () => {
    if (isProduct && product) {
      navigateToProduct(product.id);
    } else if (seller) {
      navigateToSeller(seller.id);
    }
  };

  if (isProduct && product) {
    return (
      <section
        dir="rtl"
        aria-label="ترشيح منتج من وه"
        className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-10"
      >
        <button
          type="button"
          onClick={handleClick}
          className="group relative grid w-full overflow-hidden rounded-[2rem] border border-primary/25 bg-gradient-to-br from-[#FFF9EE] via-[#F8F0E2] to-[#EAD5B8] text-right text-espresso shadow-[0_20px_65px_rgba(64,39,24,0.14)] transition-all duration-500 hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_28px_75px_rgba(64,39,24,0.22)] dark:from-[#1B1009] dark:via-[#26160D] dark:to-[#3B1E0E] dark:text-cream dark:shadow-[0_20px_65px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_28px_75px_rgba(0,0,0,0.55)] lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="relative order-1 min-h-[150px] overflow-hidden bg-[#EAD5B8] dark:bg-[#3B1E0E] sm:min-h-[420px] lg:min-h-[500px]">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#FFF9EE] to-[#EAD5B8] dark:from-[#26160D] dark:to-[#3B1E0E]">
                <Sparkles className="h-16 w-16 text-primary dark:text-primary-hover" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1B1009]/75 via-transparent to-[#1B1009]/10" />
            <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/30 bg-[#1B1009]/45 px-3 py-1.5 text-[10px] font-black text-white shadow-lg backdrop-blur-md sm:right-5 sm:top-5 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs">
              <Sparkles size={13} className="text-primary-hover sm:h-[15px] sm:w-[15px]" />
              قطعة مختارة من وه
            </div>
            <div className="absolute bottom-4 right-4 left-4 flex items-end justify-between gap-3 text-white sm:bottom-7 sm:right-7 sm:left-7 sm:gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black tracking-[0.18em] text-white/70">WAH CRAFT</p>
                <h3 className="mt-1 truncate text-lg font-black sm:text-2xl">{product.title}</h3>
              </div>
              <span className="shrink-0 rounded-xl bg-primary px-3 py-1.5 text-xs font-black text-white shadow-lg sm:px-4 sm:py-2 sm:text-sm">
                {product.price.toLocaleString('ar-EG')} ج.م
              </span>
            </div>
          </div>

          <div className="relative order-2 flex flex-col justify-center p-3 sm:p-9 lg:p-12">
            <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full border border-primary/15 dark:border-primary-hover/10" />
            <div className="relative">
              <div className="mb-2.5 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[9px] font-black text-primary dark:text-primary-hover sm:mb-6 sm:gap-2 sm:px-3.5 sm:py-2 sm:text-[11px]">
                <BadgeCheck size={13} className="sm:h-[15px] sm:w-[15px]" />
                مساحة ترشيح وه
                <span className="h-1 w-1 rounded-full bg-primary dark:bg-primary-hover" />
                حكاية قطعة
              </div>

              <p className="text-xs font-bold text-primary dark:text-primary-hover sm:text-sm">
                صناعة يدوية من قلب الصعيد
              </p>
              <h2 className="sr-only mt-1.5 text-xl font-black leading-[1.35] text-espresso dark:text-cream sm:not-sr-only sm:mt-2 sm:text-4xl">
                {product.title}
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-primary-hover sm:mt-4 sm:w-16" />
              <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-5 text-espresso/70 dark:text-cream/70 sm:mt-5 sm:line-clamp-3 sm:text-sm sm:leading-7">
                {product.description || `قطعة صنعتها أيادي ${sellerName} بحرفة صعيدية أصيلة.`}
              </p>

              <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-primary/15 bg-white/45 p-2 dark:bg-black/15 sm:mt-7 sm:gap-3 sm:rounded-2xl sm:p-3">
                <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border-2 border-primary/20 bg-primary/10 dark:border-primary-hover/25 sm:h-14 sm:w-14 sm:rounded-xl">
                  {avatar ? (
                    <img src={avatar} alt={sellerName} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xl font-black text-primary dark:text-primary-hover">
                      {sellerName.charAt(0)}
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1 text-right">
                  <span className="block text-[10px] font-bold text-espresso/55 dark:text-cream/55">من إيد الصانع</span>
                  <span className="mt-0.5 block truncate text-xs font-black text-espresso dark:text-cream sm:text-sm">{sellerName}</span>
                  <span className="mt-0.5 block truncate text-[9px] font-bold text-espresso/60 dark:text-cream/60 sm:text-[10px]">{specialty}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[9px] font-bold text-primary dark:text-primary-hover sm:text-[10px]">
                  <MapPin size={11} className="sm:h-[13px] sm:w-[13px]" />
                  {governorate}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-4">
                <span className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-[10px] font-black text-white shadow-lg shadow-primary/20 transition-all group-hover:bg-primary-hover dark:group-hover:text-espresso-900 sm:gap-3 sm:px-5 sm:py-3.5 sm:text-xs">
                  اكتشف القطعة
                  <ArrowUpLeft size={17} className="transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1" />
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-espresso/55 dark:text-cream/55">
                  <Clock3 size={13} />
                  الترشيح حتى {expiresAt}
                </span>
              </div>
            </div>
          </div>
        </button>
      </section>
    );
  }

  return (
    <section
      dir="rtl"
      aria-label="ترشيح وه المدفوع"
      className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-10"
    >
      <button
        type="button"
        onClick={handleClick}
        className="group relative block w-full overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-[#FFF9EE] via-[#F8F0E2] to-[#EAD5B8] text-right text-espresso shadow-[0_15px_50px_rgba(64,39,24,0.12)] transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_25px_65px_rgba(64,39,24,0.2)] dark:from-[#1B1009] dark:via-[#26160D] dark:to-[#3B1E0E] dark:text-cream dark:shadow-[0_18px_55px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_26px_70px_rgba(0,0,0,0.5)]"
      >
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-28 h-80 w-80 rounded-full border border-primary/15 dark:border-primary-hover/10" />
          <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full border border-primary/15 dark:border-primary-hover/10" />
          <div className="absolute bottom-0 right-[35%] h-40 w-40 rounded-full bg-primary/[0.07] blur-3xl dark:bg-primary-hover/[0.08]" />
          
        </div>

        <div className="relative grid min-h-0 sm:min-h-[390px] lg:grid-cols-[1fr_0.9fr]">

          {/* LEFT CONTENT */}
          <div className="relative order-2 flex flex-col justify-center p-3 sm:p-10 lg:order-1 lg:p-14">

            {/* Label */}
            <div className="mb-2.5 flex items-center gap-2 sm:mb-8 sm:gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/25 dark:bg-primary-hover dark:text-espresso-900 dark:shadow-primary-hover/20 sm:h-10 sm:w-10">
                <Sparkles size={14} className="sm:h-[18px] sm:w-[18px]" />
              </div>

              <div>
                <p className="text-[10px] font-black tracking-[0.18em] text-primary dark:text-primary-hover">
                  WAH SELECTED
                </p>
                <p className="mt-0.5 text-[10px] font-bold text-espresso/65 dark:text-cream/65 sm:text-xs">
                  اختيار وه لهذا الأسبوع
                </p>
              </div>

              <div className="mr-auto rotate-[-12deg] rounded-lg border-2 border-primary/60 px-2.5 py-0.5 text-[9px] font-black text-primary dark:border-primary-hover/70 dark:text-primary-hover sm:px-3 sm:py-1 sm:text-[10px]">
                ترشيح خاص
              </div>
            </div>

            {/* Main heading */}
            <div className="relative">
              <p className="mb-1.5 text-[11px] font-bold text-primary dark:text-primary-hover sm:mb-3 sm:text-sm">
                {isProduct ? 'حكاية قطعة' : 'وراء كل صنعة حكاية'}
              </p>

              <h2 className="max-w-xl text-xl font-black leading-[1.3] text-espresso dark:text-cream sm:text-4xl sm:leading-[1.4] lg:text-5xl">
                {title}
              </h2>

              <div className="mt-2 h-1 w-12 rounded-full bg-primary-hover dark:bg-primary-hover sm:mt-5 sm:w-16" />
            </div>

            {/* Seller info */}
            <div className="mt-3 flex items-center gap-2 sm:mt-8 sm:gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary-hover/10 dark:text-primary-hover sm:h-12 sm:w-12">
                <Star size={15} className="sm:h-5 sm:w-5" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-xs font-black text-espresso dark:text-cream sm:text-base">
                    {sellerName}
                  </h3>
                  <BadgeCheck size={16} className="text-primary dark:text-primary-hover" />
                </div>

                <p className="mt-0.5 text-[10px] font-bold text-espresso/65 dark:text-cream/65 sm:mt-1 sm:text-xs">
                  {isProduct ? `من إيدين ${sellerName}` : specialty}
                </p>
              </div>
            </div>

            {/* Governorate */}
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-espresso/65 dark:text-cream/65 sm:mt-5 sm:gap-2 sm:text-xs">
              <MapPin size={13} className="text-primary dark:text-primary-hover sm:h-[15px] sm:w-[15px]" />
              {governorate}
            </div>

            {/* CTA */}
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-8 sm:gap-4">
              <span className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-[10px] font-black text-white shadow-lg shadow-primary/20 transition-all duration-300 group-hover:bg-primary-hover dark:group-hover:text-espresso-900 sm:gap-4 sm:px-6 sm:py-4 sm:text-xs">
                {isProduct ? 'اكتشف القطعة' : 'اكتشف الحرفي'}
                <ArrowUpLeft
                  size={17}
                  className="transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1"
                />
              </span>

              <span className="flex items-center gap-1.5 text-[10px] font-bold text-espresso/55 dark:text-cream/55">
                <Clock3 size={13} />
                حتى {expiresAt}
              </span>
            </div>
          </div>

          {/* RIGHT VISUAL */}
          <div className="relative order-1 min-h-[150px] overflow-hidden bg-[#EAD5B8] dark:bg-[#3B1E0E] sm:min-h-[430px] lg:order-2 lg:min-h-[490px]">

            {/* Cover image */}
            {coverImage ? (
              <img
                src={coverImage}
                alt={isProduct ? title : `منتج من ورشة ${sellerName}`}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#EAD5B8] to-primary/30 dark:from-[#3B1E0E] dark:to-primary-hover/20" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#2B1D16]/50 via-transparent to-[#2B1D16]/10" />

            {/* Profile frame */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">

                {/* Outer circle */}
                <div className="absolute -inset-3 rounded-full border border-white/60 sm:-inset-5" />
                <div className="absolute -inset-6 rounded-full border border-white/30 sm:-inset-10" />

                {/* Avatar */}
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-[#FFF9EE] bg-[#EAD5B8] shadow-2xl dark:border-[#26160D] dark:bg-[#3B1E0E] sm:h-60 sm:w-60 sm:border-[7px]">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={sellerName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-black text-primary dark:text-primary-hover sm:text-5xl">
                      {sellerName.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Verified badge */}
                <div className="absolute bottom-1 left-1 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-[#FFF9EE] bg-primary text-white shadow-lg dark:border-[#26160D] dark:bg-primary-hover dark:text-espresso-900 sm:bottom-3 sm:h-11 sm:w-11 sm:border-4">
                  <BadgeCheck size={14} className="sm:h-5 sm:w-5" />
                </div>

                {/* Product floating image */}
                {floatingProductImage && (
                  <div className="absolute -bottom-4 -right-7 h-12 w-12 rotate-6 overflow-hidden rounded-lg border-[3px] border-[#FFF9EE] bg-white shadow-2xl transition-transform duration-500 group-hover:rotate-0 dark:border-[#26160D] dark:bg-espresso-900 sm:-bottom-7 sm:-right-12 sm:h-32 sm:w-32 sm:rounded-2xl sm:border-[5px]">
                    <img
                      src={floatingProductImage}
                      alt={isProduct ? title : `منتج من ورشة ${sellerName}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {/* Stamp */}
                <div className="absolute -right-7 -top-4 flex h-12 w-12 rotate-12 flex-col items-center justify-center rounded-full border-2 border-primary-hover bg-[#FFF9EE] text-center text-primary shadow-xl dark:border-primary-hover dark:bg-[#26160D] dark:text-primary-hover sm:-right-12 sm:-top-7 sm:h-20 sm:w-20">
                  <Sparkles size={11} className="sm:h-[15px] sm:w-[15px]" />
                  <span className="mt-0.5 text-[6px] font-black sm:mt-1 sm:text-[10px]">
                   صعيدى اصلى
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom name */}
            <div className="absolute bottom-3 right-3 left-3 text-white sm:bottom-6 sm:right-6 sm:left-6">
              <p className="mt-1 text-sm font-black sm:text-xl">
                {sellerName}
              </p>
            </div>
          </div>
        </div>
      </button>
    </section>
  );
};

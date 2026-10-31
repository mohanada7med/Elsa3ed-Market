
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
          <div className="relative order-1 min-h-[300px] overflow-hidden bg-[#EAD5B8] dark:bg-[#3B1E0E] sm:min-h-[420px] lg:min-h-[500px]">
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
            <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-white/30 bg-[#1B1009]/45 px-4 py-2 text-xs font-black text-white shadow-lg backdrop-blur-md">
              <Sparkles size={15} className="text-primary-hover" />
              قطعة مختارة من وه
            </div>
            <div className="absolute bottom-5 right-5 left-5 flex items-end justify-between gap-4 text-white sm:bottom-7 sm:right-7 sm:left-7">
              <div className="min-w-0">
                <p className="text-[10px] font-black tracking-[0.18em] text-white/70">WAH CRAFT</p>
                <h3 className="mt-1 truncate text-xl font-black sm:text-2xl">{product.title}</h3>
              </div>
              <span className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white shadow-lg">
                {product.price.toLocaleString('ar-EG')} ج.م
              </span>
            </div>
          </div>

          <div className="relative order-2 flex flex-col justify-center p-6 sm:p-9 lg:p-12">
            <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full border border-primary/15 dark:border-primary-hover/10" />
            <div className="relative">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-2 text-[11px] font-black text-primary dark:text-primary-hover">
                <BadgeCheck size={15} />
                مساحة ترشيح وه
                <span className="h-1 w-1 rounded-full bg-primary dark:bg-primary-hover" />
                حكاية قطعة
              </div>

              <p className="text-sm font-bold text-primary dark:text-primary-hover">
                صناعة يدوية من قلب الصعيد
              </p>
              <h2 className="mt-2 text-3xl font-black leading-[1.35] text-espresso dark:text-cream sm:text-4xl">
                {product.title}
              </h2>
              <div className="mt-4 h-1 w-16 rounded-full bg-primary-hover" />
              <p className="mt-5 line-clamp-3 text-sm font-semibold leading-7 text-espresso/70 dark:text-cream/70">
                {product.description || `قطعة صنعتها أيادي ${sellerName} بحرفة صعيدية أصيلة.`}
              </p>

              <div className="mt-7 flex items-center gap-3 rounded-2xl border border-primary/15 bg-white/45 p-3 dark:bg-black/15">
                <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-primary/20 bg-primary/10 dark:border-primary-hover/25">
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
                  <span className="mt-0.5 block truncate text-sm font-black text-espresso dark:text-cream">{sellerName}</span>
                  <span className="mt-0.5 block truncate text-[10px] font-bold text-espresso/60 dark:text-cream/60">{specialty}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold text-primary dark:text-primary-hover">
                  <MapPin size={13} />
                  {governorate}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-3 rounded-xl bg-primary px-5 py-3.5 text-xs font-black text-white shadow-lg shadow-primary/20 transition-all group-hover:bg-primary-hover dark:group-hover:text-espresso-900">
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
          <span className="absolute bottom-4 left-8 font-serif text-[130px] font-black leading-none text-primary/[0.06] dark:text-primary-hover/[0.05]">
            W
          </span>
        </div>

        <div className="relative grid min-h-[390px] lg:grid-cols-[1fr_0.9fr]">

          {/* LEFT CONTENT */}
          <div className="relative order-2 flex flex-col justify-center p-6 sm:p-10 lg:order-1 lg:p-14">

            {/* Label */}
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/25 dark:bg-primary-hover dark:text-espresso-900 dark:shadow-primary-hover/20">
                <Sparkles size={18} />
              </div>

              <div>
                <p className="text-[10px] font-black tracking-[0.18em] text-primary dark:text-primary-hover">
                  WAH SELECTED
                </p>
                <p className="mt-0.5 text-xs font-bold text-espresso/65 dark:text-cream/65">
                  اختيار وه لهذا الأسبوع
                </p>
              </div>

              <div className="mr-auto rotate-[-12deg] rounded-lg border-2 border-primary/60 px-3 py-1 text-[10px] font-black text-primary dark:border-primary-hover/70 dark:text-primary-hover">
                ترشيح خاص
              </div>
            </div>

            {/* Main heading */}
            <div className="relative">
              <p className="mb-3 text-sm font-bold text-primary dark:text-primary-hover">
                {isProduct ? 'حكاية قطعة' : 'وراء كل صنعة حكاية'}
              </p>

              <h2 className="max-w-xl text-3xl font-black leading-[1.4] text-espresso dark:text-cream sm:text-4xl lg:text-5xl">
                {title}
              </h2>

              <div className="mt-5 h-1 w-16 rounded-full bg-primary-hover dark:bg-primary-hover" />
            </div>

            {/* Seller info */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary-hover/10 dark:text-primary-hover">
                <Star size={20} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-base font-black text-espresso dark:text-cream">
                    {sellerName}
                  </h3>
                  <BadgeCheck size={16} className="text-primary dark:text-primary-hover" />
                </div>

                <p className="mt-1 text-xs font-bold text-espresso/65 dark:text-cream/65">
                  {isProduct ? `من إيدين ${sellerName}` : specialty}
                </p>
              </div>
            </div>

            {/* Governorate */}
            <div className="mt-5 flex items-center gap-2 text-xs font-bold text-espresso/65 dark:text-cream/65">
              <MapPin size={15} className="text-primary dark:text-primary-hover" />
              {governorate}
            </div>

            {/* CTA */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-4 rounded-xl bg-primary px-6 py-4 text-xs font-black text-white shadow-lg shadow-primary/20 transition-all duration-300 group-hover:bg-primary-hover dark:group-hover:text-espresso-900">
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
          <div className="relative order-1 min-h-[340px] overflow-hidden bg-[#EAD5B8] dark:bg-[#3B1E0E] sm:min-h-[430px] lg:order-2 lg:min-h-[490px]">

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
                <div className="absolute -inset-5 rounded-full border border-white/60" />
                <div className="absolute -inset-10 rounded-full border border-white/30" />

                {/* Avatar */}
                <div className="relative h-44 w-44 overflow-hidden rounded-full border-[7px] border-[#FFF9EE] bg-[#EAD5B8] shadow-2xl dark:border-[#26160D] dark:bg-[#3B1E0E] sm:h-60 sm:w-60">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={sellerName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl font-black text-primary dark:text-primary-hover">
                      {sellerName.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Verified badge */}
                <div className="absolute bottom-3 left-1 flex h-11 w-11 items-center justify-center rounded-full border-4 border-[#FFF9EE] bg-primary text-white shadow-lg dark:border-[#26160D] dark:bg-primary-hover dark:text-espresso-900">
                  <BadgeCheck size={20} />
                </div>

                {/* Product floating image */}
                {floatingProductImage && (
                  <div className="absolute -bottom-7 -right-12 h-24 w-24 rotate-6 overflow-hidden rounded-2xl border-[5px] border-[#FFF9EE] bg-white shadow-2xl transition-transform duration-500 group-hover:rotate-0 dark:border-[#26160D] dark:bg-espresso-900 sm:h-32 sm:w-32">
                    <img
                      src={floatingProductImage}
                      alt={isProduct ? title : `منتج من ورشة ${sellerName}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {/* Stamp */}
                <div className="absolute -right-12 -top-7 flex h-20 w-20 rotate-12 flex-col items-center justify-center rounded-full border-2 border-primary-hover bg-[#FFF9EE] text-center text-primary shadow-xl dark:border-primary-hover dark:bg-[#26160D] dark:text-primary-hover">
                  <Sparkles size={15} />
                  <span className="mt-1 text-[10px] font-black">
                   صعيدى اصلى
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom name */}
            <div className="absolute bottom-6 right-6 left-6 text-white">
              <p className="text-[10px] font-black tracking-widest text-white/70">
                MEET THE MAKER
              </p>
              <p className="mt-1 text-xl font-black">
                {sellerName}
              </p>
            </div>

            {/* Decorative number */}
            <div className="absolute left-5 top-5 font-serif text-sm font-black tracking-widest text-white/80">
              NO. 01
            </div>
          </div>
        </div>
      </button>
    </section>
  );
};

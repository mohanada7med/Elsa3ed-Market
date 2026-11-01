import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, BadgeCheck, MapPin, Sparkles, Store } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { api } from '../../services/api';
import { getOptimizedImageUrl } from '../../utils/cloudinaryMedia';

const getProductStory = (product: Product): string => {
  const story = product.description?.trim();
  if (story) return story;

  const maker = product.sellerName;
  const craft =
    product.specifications?.craftsmanship ||
    product.categoryName;
  const material = product.specifications?.material;
  const details = [craft, material].filter(Boolean).join(' بخامة ');

  return details
    ? `من إيد ${maker} في ${product.sellerGovernorate}، حكاية صنعة ${details}.`
    : `قطعة من شغل ${maker} في محافظة ${product.sellerGovernorate}.`;
};

export const ProductOfWeekSection: React.FC = () => {
  const { products, sellers, navigateToProduct, navigateToSeller } = useApp();
  const reduceMotion = useReducedMotion();
  const [apiProduct, setApiProduct] = useState<Product | null>(null);

  useEffect(() => {
    let active = true;

    try {
      localStorage.removeItem('wah_product_of_week');
    } catch (error) {
      console.warn('Failed to clear cached product of the week:', error);
    }

    api.getProductOfWeek()
      .then((selectedProduct) => {
        if (!active) return;
        setApiProduct(selectedProduct);
      })
      .catch((error) => {
        console.error('Failed to load product of the week:', error);
      });
    return () => {
      active = false;
    };
  }, []);

  const product = useMemo(
    () => products.find((item) => item.isProductOfWeek) || apiProduct,
    [products, apiProduct]
  );

  const seller = useMemo(() => {
    if (!product) return null;
    return sellers.find(
      (item) =>
        item.id === product.sellerId ||
        item.userId === product.sellerId ||
        item.brandName === product.sellerName
    ) || null;
  }, [product, sellers]);

  if (!product) {
    return (
      <section
        id="product-of-the-week"
        dir="rtl"
        aria-label="منتج الأسبوع"
        aria-busy="true"
        className="relative mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-8 sm:py-14 lg:px-12"
      >
        <div className="mb-4 flex items-center gap-2.5 sm:mb-7 sm:gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary sm:h-11 sm:w-11 sm:rounded-2xl">
            <Sparkles size={18} />
          </span>
          <div>
            <p className="text-[10px] font-black text-primary dark:text-primary-hover">اختيار إدارة وه</p>
            <h2 className="text-lg font-black text-foreground sm:text-2xl">حكاية الأسبوع</h2>
          </div>
        </div>
        <div className="grid min-h-[210px] animate-pulse overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-[#FFF9EE] to-[#EAD5B8] dark:from-[#26160D] dark:to-[#3B1E0E] lg:grid-cols-2 sm:rounded-[2rem]">
          <div className="min-h-[210px] bg-primary/10 dark:bg-white/5 sm:min-h-[420px]" />
          <div className="flex flex-col justify-center gap-4 p-4 sm:p-10">
            <div className="h-5 w-36 rounded-full bg-primary/15 dark:bg-white/10" />
            <div className="h-9 w-3/4 rounded-xl bg-primary/15 dark:bg-white/10" />
            <div className="h-4 w-full rounded-lg bg-primary/10 dark:bg-white/5" />
            <div className="h-4 w-5/6 rounded-lg bg-primary/10 dark:bg-white/5" />
          </div>
        </div>
      </section>
    );
  }

  const makerName = product.sellerName;
  const craftName =
    product.specifications?.craftsmanship ||
    product.categoryName;
  const makerGovernorate = product.sellerGovernorate;
  const story = getProductStory(product);
  const image =
    product.images?.[0] ||
    seller?.coverImage ||
    seller?.avatar;

  return (
    <section
      id="product-of-the-week"
      dir="rtl"
      aria-labelledby="product-of-the-week-title"
      className="relative mx-auto w-full max-w-[1600px] overflow-hidden px-4 py-4 sm:px-8 sm:py-14 lg:px-12"
    >
    <div className="mb-3 flex items-center gap-2 sm:mb-7 sm:gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-sm dark:text-primary-hover sm:h-11 sm:w-11 sm:rounded-2xl">
        <Sparkles size={18} />
        </span>
        <div>
          <p className="text-[10px] font-black tracking-[0.18em] text-primary dark:text-primary-hover">
            اختيار إدارة وه
          </p>
        <h2 className="mt-0.5 text-base font-black text-foreground sm:text-2xl">
            حكاية الأسبوع
          </h2>
        </div>
      </div>

      <div
      className="relative isolate overflow-hidden rounded-2xl border border-primary/35 bg-gradient-to-br from-[#FFF9EE] via-[#F8EBD7] to-[#EAD5B8] shadow-[0_28px_90px_-42px_rgba(59,30,14,0.65)] ring-1 ring-white/70 dark:from-[#26160D] dark:via-[#1B1009] dark:to-[#3B1E0E] dark:ring-white/10 sm:rounded-[2.5rem]"
      >
        {!reduceMotion && (
          <motion.div
            aria-hidden="true"
            whileInView={{ opacity: [0.2, 0.75, 0.2] }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity }}
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] border border-primary/70 shadow-[inset_0_0_28px_rgba(201,148,68,0.18)]"
          />
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
          style={{
            backgroundImage: "url('/pattern/pat2.png')",
            backgroundSize: '360px auto',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-24 -z-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
        />

        <div className="grid items-stretch lg:grid-cols-[1fr_0.95fr]">
          <div className="relative flex min-h-[145px] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_#fffaf0_0%,_#ead8bd_72%,_#d8bd98_100%)] dark:bg-[radial-gradient(ellipse_at_center,_#513820_0%,_#2e2117_72%,_#1b1009_100%)] sm:min-h-[420px] lg:min-h-[520px]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-3 z-[2] rounded-xl border border-white/50 sm:inset-6 sm:rounded-[2rem]" />
            {image ? (
              <motion.img
                whileInView={reduceMotion ? undefined : { scale: [1, 1.035, 1] }}
                viewport={{ once: false, amount: 0.25 }}
                transition={reduceMotion ? undefined : { duration: 7, ease: 'easeInOut', repeat: Infinity }}
                src={getOptimizedImageUrl(image, { width: 1000, height: 800, crop: 'fill' })}
                alt={product.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[145px] w-full items-center justify-center sm:min-h-[260px]">
                <Sparkles className="h-16 w-16 text-primary-hover/70" />
              </div>
            )}
            <div className="absolute right-4 top-4 z-[3] flex items-center gap-1.5 rounded-full border border-primary/20 bg-white/80 px-2.5 py-1.5 text-[10px] font-black text-primary shadow-md backdrop-blur-md dark:bg-[#1B1009]/75 dark:text-primary-hover sm:right-7 sm:top-7 sm:gap-2 sm:px-3 sm:py-2 sm:text-xs">
              <Sparkles size={13} className="text-primary-hover sm:h-[15px] sm:w-[15px]" />
              منتج الأسبوع
            </div>
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1B1009]/75 to-transparent px-4 pb-3 pt-8 sm:hidden">
              <p className="truncate text-base font-black text-white">{product.title}</p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-3 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[8px] font-black text-white sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[10px]">
                <Sparkles size={12} />
                اختيار مميز من صُنّاع الصعيد
              </span>
              {product.approvalStatus === 'approved' && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/20 bg-emerald-600/10 px-2 py-1 text-[8px] font-bold text-emerald-800 dark:text-emerald-300 sm:px-2.5 sm:py-1.5 sm:text-[10px]">
                  <BadgeCheck size={11} className="sm:h-[13px] sm:w-[13px]" />
                  قطعة معتمدة
                </span>
              )}
            </div>

            <h3
              id="product-of-the-week-title"
              className="sr-only mt-2 text-lg font-black leading-snug text-foreground sm:not-sr-only sm:mt-4 sm:text-3xl"
            >
              {product.title}
            </h3>

            <p className="mt-2 text-[9px] font-black tracking-[0.16em] text-primary dark:text-primary-hover sm:mt-5 sm:text-[10px]">
              عن المنتج
            </p>
            <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-5 text-foreground-secondary sm:mt-2 sm:line-clamp-5 sm:text-base sm:leading-8">
              {story}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
              {craftName && (
                <span className="rounded-full border border-primary/15 bg-background/55 px-2.5 py-1 text-[9px] font-bold text-foreground sm:px-3 sm:py-1.5 sm:text-[10px]">
                  {craftName}
                </span>
              )}
              {product.specifications?.material && (
                <span className="rounded-full border border-primary/15 bg-background/55 px-2.5 py-1 text-[9px] font-bold text-foreground sm:px-3 sm:py-1.5 sm:text-[10px]">
                  {product.specifications.material}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigateToSeller(seller?.id || product.sellerId)}
              className="mt-2.5 flex w-full items-center gap-2 rounded-xl border border-primary/15 bg-background/55 p-2 text-right transition hover:border-primary/35 hover:bg-background/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:mt-6 sm:gap-3 sm:rounded-2xl sm:p-3"
              aria-label={`زيارة ورشة ${makerName}`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary dark:text-primary-hover sm:h-11 sm:w-11 sm:rounded-xl">
                {seller?.avatar ? (
                  <img
                    src={seller.avatar}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Store size={19} />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[9px] font-semibold text-foreground-secondary">
                  من إيد الصانع
                </span>
                <span className="mt-0.5 block truncate text-xs font-black text-foreground sm:text-sm">
                  {makerName}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-[9px] font-bold text-primary dark:text-primary-hover sm:text-[10px]">
                <MapPin size={11} className="sm:h-[13px] sm:w-[13px]" />
                {makerGovernorate}
              </span>
            </button>

            <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-primary/10 pt-2.5 sm:mt-5 sm:pt-5">
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-foreground-secondary sm:text-[10px]">
                  {product.inStock ? 'متاح من ورشة الصانع' : 'غير متاح حاليًا'}
                </p>
                <p className="mt-0.5 text-base font-black text-primary dark:text-primary-hover sm:mt-1 sm:text-xl">
                  {product.price.toLocaleString('ar-EG')} ج.م
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateToProduct(product.id)}
                className="flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-[10px] font-black text-white shadow-lg transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:min-h-12 sm:gap-2 sm:px-6 sm:text-xs"
              >
                اكتشف القطعة
                <ArrowLeft size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductOfWeekSection;

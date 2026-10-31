import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, BadgeCheck, MapPin, Sparkles, Store, Volume2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { api } from '../../services/api';
import { getOptimizedImageUrl } from '../../utils/cloudinaryMedia';

const WEEKLY_PRODUCT_CACHE_KEY = 'wah_product_of_week';

const getProductStory = (product: Product): string => {
  const story = product.transcript?.trim() || product.description?.trim();
  if (story) return story;

  const maker = product.artisanName || product.sellerName;
  const craft =
    product.artisanCraft ||
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
      const cachedProduct = localStorage.getItem(WEEKLY_PRODUCT_CACHE_KEY);
      if (cachedProduct) {
        const parsedProduct = JSON.parse(cachedProduct) as Product;
        if (parsedProduct?.id && parsedProduct.isProductOfWeek) {
          setApiProduct(parsedProduct);
        }
      }
    } catch (error) {
      console.warn('Failed to read cached product of the week:', error);
    }

    api.getProductOfWeek()
      .then((selectedProduct) => {
        if (!active) return;
        setApiProduct(selectedProduct);
        try {
          if (selectedProduct) {
            localStorage.setItem(WEEKLY_PRODUCT_CACHE_KEY, JSON.stringify(selectedProduct));
          } else {
            localStorage.removeItem(WEEKLY_PRODUCT_CACHE_KEY);
          }
        } catch (error) {
          console.warn('Failed to cache product of the week:', error);
        }
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
        className="relative mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-8 sm:py-14 lg:px-12"
      >
        <div className="mb-5 flex items-center gap-3 sm:mb-7">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
            <Sparkles size={20} />
          </span>
          <div>
            <p className="text-[10px] font-black text-primary dark:text-primary-hover">اختيار إدارة وه</p>
            <h2 className="text-xl font-black text-foreground sm:text-2xl">حكاية الأسبوع</h2>
          </div>
        </div>
        <div className="grid min-h-[300px] animate-pulse overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-[#FFF9EE] to-[#EAD5B8] dark:from-[#26160D] dark:to-[#3B1E0E] lg:grid-cols-2">
          <div className="min-h-[300px] bg-primary/10 dark:bg-white/5 sm:min-h-[420px]" />
          <div className="flex flex-col justify-center gap-4 p-6 sm:p-10">
            <div className="h-5 w-36 rounded-full bg-primary/15 dark:bg-white/10" />
            <div className="h-9 w-3/4 rounded-xl bg-primary/15 dark:bg-white/10" />
            <div className="h-4 w-full rounded-lg bg-primary/10 dark:bg-white/5" />
            <div className="h-4 w-5/6 rounded-lg bg-primary/10 dark:bg-white/5" />
          </div>
        </div>
      </section>
    );
  }

  const makerName = product.artisanName || product.sellerName;
  const craftName =
    product.artisanCraft ||
    product.specifications?.craftsmanship ||
    product.categoryName;
  const makerGovernorate =
    product.artisanGovernorate || product.sellerGovernorate;
  const story = getProductStory(product);
  const image =
    product.images?.[0] ||
    product.artisanPortrait ||
    seller?.coverImage ||
    seller?.avatar;

  return (
    <section
      id="product-of-the-week"
      dir="rtl"
      aria-labelledby="product-of-the-week-title"
      className="relative mx-auto w-full max-w-[1600px] overflow-hidden px-4 py-10 sm:px-8 sm:py-14 lg:px-12"
    >
      <div className="mb-5 flex items-center gap-3 sm:mb-7">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-sm dark:text-primary-hover">
          <Sparkles size={20} />
        </span>
        <div>
          <p className="text-[10px] font-black tracking-[0.18em] text-primary dark:text-primary-hover">
            اختيار إدارة وه
          </p>
          <h2 className="mt-0.5 text-xl font-black text-foreground sm:text-2xl">
            حكاية الأسبوع
          </h2>
        </div>
      </div>

      <div
        className="relative isolate overflow-hidden rounded-[2rem] border border-primary/35 bg-gradient-to-br from-[#FFF9EE] via-[#F8EBD7] to-[#EAD5B8] shadow-[0_28px_90px_-42px_rgba(59,30,14,0.65)] ring-1 ring-white/70 dark:from-[#26160D] dark:via-[#1B1009] dark:to-[#3B1E0E] dark:ring-white/10 sm:rounded-[2.5rem]"
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
          <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_#fffaf0_0%,_#ead8bd_72%,_#d8bd98_100%)] dark:bg-[radial-gradient(ellipse_at_center,_#513820_0%,_#2e2117_72%,_#1b1009_100%)] sm:min-h-[420px] lg:min-h-[520px]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-4 z-[2] rounded-[1.5rem] border border-white/50 sm:inset-6 sm:rounded-[2rem]" />
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
              <div className="flex h-full min-h-[260px] w-full items-center justify-center">
                <Sparkles className="h-16 w-16 text-primary-hover/70" />
              </div>
            )}
            <div className="absolute right-7 top-7 z-[3] flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-3 py-2 text-xs font-black text-primary shadow-md backdrop-blur-md dark:bg-[#1B1009]/75 dark:text-primary-hover">
              <Sparkles size={15} className="text-primary-hover" />
              منتج الأسبوع
            </div>
          </div>

          <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[10px] font-black text-white">
                <Sparkles size={12} />
                اختيار مميز من صُنّاع الصعيد
              </span>
              {product.approvalStatus === 'approved' && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/20 bg-emerald-600/10 px-2.5 py-1.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                  <BadgeCheck size={13} />
                  قطعة معتمدة
                </span>
              )}
            </div>

            <h3
              id="product-of-the-week-title"
              className="mt-4 text-2xl font-black leading-snug text-foreground sm:text-3xl"
            >
              {product.title}
            </h3>

            <p className="mt-5 text-[10px] font-black tracking-[0.16em] text-primary dark:text-primary-hover">
              حكاية الصنعة
            </p>
            <p className="mt-2 line-clamp-5 text-sm font-semibold leading-7 text-foreground-secondary sm:text-base sm:leading-8">
              {story}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {craftName && (
                <span className="rounded-full border border-primary/15 bg-background/55 px-3 py-1.5 text-[10px] font-bold text-foreground">
                  {craftName}
                </span>
              )}
              {product.specifications?.material && (
                <span className="rounded-full border border-primary/15 bg-background/55 px-3 py-1.5 text-[10px] font-bold text-foreground">
                  {product.specifications.material}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigateToSeller(seller?.id || product.sellerId)}
              className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-primary/15 bg-background/55 p-3 text-right transition hover:border-primary/35 hover:bg-background/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={`زيارة ورشة ${makerName}`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary dark:text-primary-hover">
                {(product.artisanPortrait || seller?.avatar) ? (
                  <img
                    src={product.artisanPortrait || seller?.avatar}
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
                <span className="mt-0.5 block truncate text-sm font-black text-foreground">
                  {makerName}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold text-primary dark:text-primary-hover">
                <MapPin size={13} />
                {makerGovernorate}
              </span>
            </button>

            {product.audioUrl && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/10 bg-background/45 px-3 py-2">
                <Volume2 size={16} className="shrink-0 text-primary dark:text-primary-hover" />
                <span className="shrink-0 text-[10px] font-bold text-foreground-secondary">
                  صوت الصانع
                </span>
                <audio
                  controls
                  preload="none"
                  src={product.audioUrl}
                  aria-label={`استمع لحكاية ${makerName} عن ${product.title}`}
                  className="h-9 min-w-0 flex-1"
                />
              </div>
            )}

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-primary/10 pt-5">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-foreground-secondary">
                  {product.inStock ? 'متاح من ورشة الصانع' : 'غير متاح حاليًا'}
                </p>
                <p className="mt-1 text-xl font-black text-primary dark:text-primary-hover">
                  {product.price.toLocaleString('ar-EG')} ج.م
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateToProduct(product.id)}
                className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 text-xs font-black text-white shadow-lg transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-6"
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

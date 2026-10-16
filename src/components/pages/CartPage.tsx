
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Tag,
  Store,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShoppingBasket,
  PackageCheck,
  RotateCcw,
  Leaf,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UncleWahInteractiveGuide } from '../common/UncleWahInteractiveGuide';

export const CartPage: React.FC = () => {
  const {
    cart,
    products,
    adminProducts,
    cartCount,
    cartSubtotal,
    shippingFee,
    appliedDiscount,
    applyDiscountCode,
    removeDiscountCode,
    cartDiscountAmount,
    cartTotal,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    setActivePage,
    navigateToProduct,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthModalTab,
    setPostLoginRedirect,
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const formatPrice = (price: number) =>
    `${Number(price || 0).toLocaleString('ar-EG')} ج.م`;

  const goToPage = (page: string) => {
    setActivePage(page as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!couponInput.trim() || isApplyingCoupon) return;

    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      const res = await applyDiscountCode(couponInput.trim());

      if (res.success) {
        setCouponInput('');
      } else {
        setCouponError(
          res.message || 'الكود ده مش شغال أو انتهت صلاحيته'
        );
      }
    } catch (err: any) {
      setCouponError(
        err?.message || 'حصلت مشكلة، جرّب تاني كمان شوية'
      );
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setPostLoginRedirect('checkout');
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      return;
    }

    goToPage('checkout');
  };

  const panel =
    'rounded-[1.75rem] border border-[#6B3A1F]/10 bg-white/85 shadow-[0_12px_40px_rgba(59,30,14,0.055)] backdrop-blur-xl dark:border-[#C99444]/20 dark:bg-[#20140F]/90 dark:shadow-black/20';

  const muted = 'text-[#806B5C] dark:text-[#B9A38F]';

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#FAF5EB] pb-24 pt-28 text-[#3B1E0E] transition-colors duration-500 dark:bg-[#140E0A] dark:text-[#FFF3E0] sm:pt-36"
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[440px] overflow-hidden"
      >
        <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-[#C99444]/10 blur-3xl dark:bg-[#C99444]/[0.07]" />
        <div className="absolute -left-20 top-24 h-64 w-64 rounded-full bg-[#E66A2E]/[0.07] blur-3xl dark:bg-[#E66A2E]/[0.05]" />

        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-[#E9D5B5]/35 to-transparent dark:from-[#6B3A1F]/15" />

        <svg
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-24 w-full text-[#C99444]/15 dark:text-[#C99444]/[0.07]"
          fill="currentColor"
        >
          <path d="M0 110 Q180 20 360 100 T720 90 T1080 110 T1440 60 V180 H0Z" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-7 lg:px-12">

        {/* Breadcrumb */}
        <nav className={`mb-7 flex items-center gap-2 text-xs ${muted}`}>
          <button
            onClick={() => goToPage('home')}
            className="transition hover:text-[#C99444]"
          >
            الرئيسية
          </button>
          <ArrowLeft className="h-3 w-3 opacity-50" />
          <button
            onClick={() => goToPage('products')}
            className="transition hover:text-[#C99444]"
          >
            سوق وه
          </button>
          <ArrowLeft className="h-3 w-3 opacity-50" />
          <span className="font-bold text-[#6B3A1F] dark:text-[#D9A65C]">
            سلة الشراء
          </span>
        </nav>

        {/* Page heading */}
        <section className="mb-8 flex flex-col justify-between gap-5 border-b border-[#6B3A1F]/10 pb-7 dark:border-[#C99444]/15 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#C99444]/30 bg-[#C99444]/10 px-3 py-1.5 text-[11px] font-bold text-[#8C5A24] dark:text-[#E8BD7C]">
              <Leaf className="h-3.5 w-3.5" />
              خير الصعيد لحد باب بيتك
            </div>

            <h1 className="font-main text-3xl leading-tight sm:text-4xl lg:text-5xl">
              لَمّ حاجتك
              <span className="text-[#B67B32] dark:text-[#DDA654]">
                {' '}من سوق وه
              </span>
            </h1>

            <p className={`mt-3 max-w-xl text-sm leading-7 ${muted}`}>
              كل قطعة ليها حكاية، وكل طلب بيسند صانع وحرفة من قلب الصعيد.
            </p>
          </div>

          {cart.length > 0 && (
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <div className="flex items-center gap-3 rounded-2xl border border-[#6B3A1F]/10 bg-white/70 px-4 py-3 dark:border-[#C99444]/15 dark:bg-white/[0.03]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6B3A1F]/10 text-[#8A542A] dark:bg-[#C99444]/10 dark:text-[#DDA654]">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-black leading-tight">
                    {cartCount}
                  </p>
                  <p className={`mt-1 text-[11px] ${muted}`}>
                    قطعة في سلتك
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={clearCart}
                className="rounded-xl px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
              >
                <Trash2 className="mb-1 inline h-3.5 w-3.5" /> فضّي السلة
              </button>
            </div>
          )}
        </section>

        {/* Empty cart */}
        {cart.length === 0 ? (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${panel} mx-auto my-12 max-w-2xl overflow-hidden text-center`}
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-[#F2E3C9] via-[#FBF4E7] to-[#E9D5B5] px-6 pb-8 pt-10 dark:from-[#352116] dark:via-[#24170F] dark:to-[#1B120C] sm:px-12">
              <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full border border-[#B67B32]/20" />
              <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full border border-[#B67B32]/20" />

              <img
                src="/mascot/empty-cart.png"
                alt="عم وه والسلة الفاضية"
                className="relative mx-auto mb-5 h-48 w-auto object-contain drop-shadow-xl sm:h-60"
              />

              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#6B3A1F]/10 px-3 py-1.5 text-xs font-bold text-[#8C5A24] dark:bg-[#C99444]/10 dark:text-[#DDA654]">
                <ShoppingBasket className="h-4 w-4" />
                لسه الخير كتير في السوق
              </span>

              <h2 className="font-main text-2xl sm:text-3xl">
                سلتك لسه فاضية يا بوي!
              </h2>

              <p className={`mx-auto mt-3 max-w-md text-sm leading-7 ${muted}`}>
                تعالى لف في سوق وه، واكتشف الكليم والفخار والعسل
                ومنتجات معمولة بإيد صناع الصعيد.
              </p>

              <button
                type="button"
                onClick={() => goToPage('products')}
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6B3A1F] px-7 py-3.5 text-sm font-bold text-[#FFF9EE] shadow-lg shadow-[#6B3A1F]/15 transition hover:-translate-y-0.5 hover:bg-[#3B1E0E] dark:bg-[#C99444] dark:text-[#24150C] dark:hover:bg-[#E0AC60]"
              >
                <Sparkles className="h-4 w-4" />
                خش السوق واختار اللي يعجبك
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 divide-x divide-x-reverse divide-[#6B3A1F]/10 px-3 py-5 dark:divide-[#C99444]/15 sm:px-8">
              <div className="px-2">
                <ShieldCheck className="mx-auto mb-2 h-5 w-5 text-[#B67B32]" />
                <p className="text-[11px] font-bold">صنعة أصيلة</p>
              </div>
              <div className="px-2">
                <PackageCheck className="mx-auto mb-2 h-5 w-5 text-[#B67B32]" />
                <p className="text-[11px] font-bold">تغليف آمن</p>
              </div>
              <div className="px-2">
                <Truck className="mx-auto mb-2 h-5 w-5 text-[#B67B32]" />
                <p className="text-[11px] font-bold">لحد باب بيتك</p>
              </div>
            </div>
          </motion.section>
        ) : (
          <>
            {/* Uncle Wah guide */}
            <div className="mb-7">
              <UncleWahInteractiveGuide
                context="crafts"
                title="طلبك من خير الصعيد"
                customQuote="كل قطعة ليها صاحب وحكاية يا بوي، وإنت كده بتساعد صنّاع الصعيد يوصلوا شغل إيديهم لبيوت أكتر."
              />
            </div>

            <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12 lg:gap-8">

              {/* Product list */}
              <section className="space-y-4 lg:col-span-8">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black sm:text-xl">
                      حاجات اخترتها
                    </h2>
                    <p className={`mt-1 text-xs ${muted}`}>
                      راجع الكميات والأسعار قبل ما تكمل
                    </p>
                  </div>

                  <span className={`text-xs font-bold ${muted}`}>
                    {cartCount} قطع
                  </span>
                </div>

                <AnimatePresence initial={false}>
                  {cart.map((item, idx) => {
                    const fallbackProd = (item as any).productId
                      ? products.find(
                        (p) => p.id === (item as any).productId
                      ) ||
                      adminProducts.find(
                        (p) => p.id === (item as any).productId
                      )
                      : null;

                    const prod = item.product || fallbackProd;
                    const prodId =
                      prod?.id ||
                      (item as any).productId ||
                      `cart-item-${idx}`;

                    const title = prod?.title || 'منتج تراثي أصيل';
                    const img =
                      prod?.images?.[0] ||
                      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=500&q=80';

                    const sellerName = prod?.sellerName || 'ورشة الصعيد';
                    const sellerGov = prod?.sellerGovernorate || 'قنا';
                    const price = Number(prod?.price || 0);
                    const stockCount = prod?.stockCount ?? 99;
                    const qty = item.quantity || 1;
                    const subtotal = price * qty;

                    return (
                      <motion.article
                        key={prodId}
                        layout
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, scale: 0.98 }}
                        className={`${panel} group relative overflow-hidden p-4 transition duration-300 hover:border-[#C99444]/45 sm:p-5`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                          {/* Product image */}
                          <button
                            type="button"
                            onClick={() => navigateToProduct(prodId)}
                            aria-label={`عرض ${title}`}
                            className="relative mx-auto block h-44 w-full shrink-0 overflow-hidden rounded-2xl bg-[#F0E5D4] sm:mx-0 sm:h-32 sm:w-32 dark:bg-[#342318]"
                          >
                            <img
                              src={img}
                              alt={title}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                            <span className="absolute bottom-2 right-2 rounded-lg bg-[#FFF9EE]/95 px-2 py-1 text-[10px] font-bold text-[#6B3A1F] shadow-sm dark:bg-[#1B120C]/90 dark:text-[#E8BD7C]">
                              من قلب الصعيد
                            </span>
                          </button>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <button
                                type="button"
                                onClick={() => navigateToProduct(prodId)}
                                className="text-right text-base font-black leading-7 transition hover:text-[#B67B32] sm:text-lg"
                              >
                                {title}
                              </button>

                              <button
                                type="button"
                                onClick={() => removeFromCart(prodId)}
                                title="حذف المنتج"
                                aria-label={`حذف ${title} من السلة`}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#9B8575] transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs ${muted}`}>
                              <span className="inline-flex items-center gap-1.5">
                                <Store className="h-3.5 w-3.5 text-[#B67B32]" />
                                {sellerName}
                              </span>

                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#C99444]/10 px-2 py-1 text-[#8C5A24] dark:text-[#DDA654]">
                                <MapPin className="h-3 w-3" />
                                {sellerGov}
                              </span>
                            </div>

                            <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                              <div>
                                <p className={`mb-1 text-[11px] ${muted}`}>
                                  {qty > 1
                                    ? `${formatPrice(price)} للقطعة`
                                    : 'سعر القطعة'}
                                </p>
                                <p className="text-xl font-black text-[#8C5428] dark:text-[#DDA654]">
                                  {formatPrice(subtotal)}
                                </p>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className={`text-[11px] ${muted}`}>
                                  الكمية
                                </span>

                                <div className="flex items-center rounded-xl border border-[#6B3A1F]/15 bg-[#FAF5EB] p-1 dark:border-[#C99444]/20 dark:bg-[#160F0A]">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateCartQuantity(prodId, qty - 1)
                                    }
                                    aria-label={`تقليل كمية ${title}`}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[#C99444]/20"
                                  >
                                    <Minus className="h-3.5 w-3.5" />
                                  </button>

                                  <span className="min-w-9 text-center text-sm font-black">
                                    {qty}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateCartQuantity(prodId, qty + 1)
                                    }
                                    disabled={qty >= stockCount}
                                    aria-label={`زيادة كمية ${title}`}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[#C99444]/20 disabled:cursor-not-allowed disabled:opacity-30"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {stockCount < 5 && stockCount > 0 && (
                              <p className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                                <AlertCircle className="h-3.5 w-3.5" />
                                متبقي {stockCount} قطع بس
                              </p>
                            )}

                            {stockCount <= 0 && (
                              <p className="mt-3 text-xs font-bold text-red-600 dark:text-red-400">
                                المنتج غير متوفر حاليًا
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>

                {/* Continue shopping */}
                <button
                  type="button"
                  onClick={() => goToPage('products')}
                  className="group flex w-full items-center justify-between rounded-2xl border border-dashed border-[#B67B32]/35 bg-[#C99444]/[0.05] px-5 py-4 text-sm font-bold transition hover:border-[#B67B32] hover:bg-[#C99444]/10"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C99444]/15 text-[#8C5A24] dark:text-[#DDA654]">
                      <ShoppingBag className="h-4 w-4" />
                    </span>
                    لسه في خير كتير.. كمّل لف في السوق
                  </span>
                  <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
                </button>
              </section>

              {/* Order summary */}
              <aside className="lg:col-span-4">
                <div className={`${panel} overflow-hidden lg:sticky lg:top-28`}>
                  <div className="relative overflow-hidden bg-[#3B1E0E] px-5 py-6 text-[#FFF9EE] dark:bg-[#2A1A10] sm:px-6">
                    <div className="absolute -left-6 -top-8 h-28 w-28 rounded-full border border-[#C99444]/20" />
                    <div className="absolute -left-2 top-0 h-20 w-20 rounded-full border border-[#C99444]/10" />

                    <div className="relative flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-[#D8BFA2]">
                          فاضل خطوة واحدة
                        </p>
                        <h2 className="mt-2 text-xl font-black">
                          حساب طلبك
                        </h2>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#C99444]/30 bg-[#C99444]/15 text-[#E5B66E]">
                        <ShoppingBasket className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 p-5 sm:p-6">

                    {/* Coupon */}
                    {appliedDiscount ? (
                      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <Tag className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                                الكوبون اتفعّل بنجاح
                              </p>
                              <p className={`mt-1 text-[11px] ${muted}`}>
                                {appliedDiscount.code} · خصم {appliedDiscount.discountPercent}%
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={removeDiscountCode}
                            className="text-xs font-bold text-red-600 hover:underline dark:text-red-400"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="space-y-2.5">
                        <label
                          htmlFor="cart-coupon-input"
                          className="flex items-center gap-2 text-xs font-black"
                        >
                          <Tag className="h-4 w-4 text-[#B67B32]" />
                          معاك كود خصم؟
                        </label>

                        <div className="flex gap-2">
                          <input
                            id="cart-coupon-input"
                            type="text"
                            value={couponInput}
                            onChange={(e) => {
                              setCouponInput(e.target.value);
                              if (couponError) setCouponError('');
                            }}
                            placeholder="اكتب الكود هنا"
                            className="min-w-0 flex-1 rounded-xl border border-[#6B3A1F]/15 bg-[#FAF5EB] px-3 py-3 text-xs outline-none transition placeholder:text-[#9B8575] focus:border-[#B67B32] dark:border-[#C99444]/20 dark:bg-[#160F0A] dark:placeholder:text-[#7C6858]"
                          />

                          <button
                            type="submit"
                            disabled={isApplyingCoupon || !couponInput.trim()}
                            className="rounded-xl bg-[#6B3A1F] px-4 text-xs font-bold text-white transition hover:bg-[#3B1E0E] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#C99444] dark:text-[#24150C] dark:hover:bg-[#E0AC60]"
                          >
                            {isApplyingCoupon ? 'بنفحص...' : 'تطبيق'}
                          </button>
                        </div>

                        {couponError && (
                          <p className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            {couponError}
                          </p>
                        )}
                      </form>
                    )}

                    <div className="h-px bg-[#6B3A1F]/10 dark:bg-[#C99444]/15" />

                    {/* Price breakdown */}
                    <div className="space-y-4 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className={muted}>قيمة المنتجات ({cartCount})</span>
                        <span className="font-bold">
                          {formatPrice(cartSubtotal)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className={`flex items-center gap-2 ${muted}`}>
                          <Truck className="h-4 w-4 text-[#B67B32]" />
                          الشحن
                        </span>

                        {shippingFee === 0 ? (
                          <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            شحن مجاني
                          </span>
                        ) : (
                          <span className="font-bold">
                            {formatPrice(shippingFee)}
                          </span>
                        )}
                      </div>

                      {cartDiscountAmount > 0 && (
                        <div className="flex items-center justify-between gap-3 text-emerald-700 dark:text-emerald-400">
                          <span className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            الخصم
                          </span>
                          <span className="font-black">
                            -{formatPrice(cartDiscountAmount)}
                          </span>
                        </div>
                      )}
                    </div>

                    {cartSubtotal < 1000 && (
                      <div className="rounded-2xl border border-[#C99444]/25 bg-[#C99444]/10 p-3.5">
                        <div className="mb-2 flex items-center gap-2 text-xs font-black text-[#8C5A24] dark:text-[#E2B66F]">
                          <Sparkles className="h-4 w-4" />
                          قرّبت على الشحن المجاني!
                        </div>

                        <p className={`text-[11px] leading-6 ${muted}`}>
                          زوّد منتجات بقيمة{' '}
                          <strong className="text-[#8C5A24] dark:text-[#E2B66F]">
                            {formatPrice(1000 - cartSubtotal)}
                          </strong>{' '}
                          عشان توصل للحد المطلوب للشحن المجاني.
                        </p>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#6B3A1F]/10 dark:bg-white/10">
                          <div
                            className="h-full rounded-full bg-[#C99444] transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(0, (cartSubtotal / 1000) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="rounded-2xl bg-[#F4E8D5]/65 p-4 dark:bg-white/[0.035]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold">
                          الإجمالي النهائي
                        </span>
                        <span className="text-2xl font-black tracking-tight text-[#8C5428] dark:text-[#DDA654]">
                          {formatPrice(cartTotal)}
                        </span>
                      </div>
                      <p className={`mt-2 text-[10px] ${muted}`}>
                        شامل الخصومات ومصاريف الشحن المحسوبة
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCheckout}
                      className="group flex w-full items-center justify-between rounded-2xl bg-[#6B3A1F] px-5 py-4 text-sm font-black text-[#FFF9EE] shadow-lg shadow-[#6B3A1F]/15 transition hover:-translate-y-0.5 hover:bg-[#3B1E0E] dark:bg-[#C99444] dark:text-[#24150C] dark:shadow-black/20 dark:hover:bg-[#E0AC60]"
                    >
                      <span>كمّل طلبك يا بوي</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 transition group-hover:-translate-x-1 dark:bg-black/10">
                        <ArrowLeft className="h-4 w-4" />
                      </span>
                    </button>

                    <div className="space-y-3 border-t border-[#6B3A1F]/10 pt-4 dark:border-[#C99444]/15">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span className={`text-[11px] ${muted}`}>
                          منتجات من صناع وحرفيين الصعيد
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <PackageCheck className="h-4 w-4 shrink-0 text-[#B67B32]" />
                        <span className={`text-[11px] ${muted}`}>
                          اهتمام بالتغليف وحماية القطع
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                        <span className={`text-[11px] ${muted}`}>
                          متابعة لطلبك لحد الاستلام
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}

        {/* Heritage footer detail */}
        <div className="mt-12 flex items-center justify-center gap-3 opacity-50">
          <div className="h-px w-12 bg-[#B67B32]" />
          <span className="text-[10px] font-bold tracking-widest text-[#8C5A24] dark:text-[#DDA654]">
            وَه · حكاية من قلب الصعيد
          </span>
          <div className="h-px w-12 bg-[#B67B32]" />
        </div>
      </div>
    </main>
  );
};

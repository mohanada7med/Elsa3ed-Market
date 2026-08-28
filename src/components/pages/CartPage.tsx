import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Sparkles,
  Tag,
  Store,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CartPage: React.FC = () => {
  const {
    cart,
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
    navigateToSeller,
    currentRole,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthModalTab
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await applyDiscountCode(couponInput.trim());
      if (res.success) {
        setCouponInput('');
      } else {
        setCouponError(res.message || 'كود الخصم غير صالح أو منتهي الصلاحية');
      }
    } catch (err: any) {
      setCouponError(err.message || 'حدث خطأ أثناء تطبيق كود الخصم');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      return;
    }
    setActivePage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-[80vh] bg-[#faf6f0] dark:bg-[#120f0d] py-6 sm:py-10" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-[#7A6F64] dark:text-[#A89C90] mb-6 font-medium">
          <button
            type="button"
            onClick={() => setActivePage('home')}
            className="hover:text-[#B45F42] transition-colors cursor-pointer"
          >
            الرئيسية
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => setActivePage('products')}
            className="hover:text-[#B45F42] transition-colors cursor-pointer"
          >
            معرض المنتجات
          </button>
          <span>/</span>
          <span className="text-[#2D2A26] dark:text-[#FAF6F2] font-bold">سلة المشتريات</span>
        </nav>

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E1D9] dark:border-[#382E27] mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#B45F42]/10 dark:bg-[#B45F42]/20 text-[#B45F42] dark:text-[#FF855D] flex items-center justify-center shadow-inner shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#2D2A26] dark:text-[#FAF6F2] font-heritage">
                سلة المشتريات التراثية
              </h1>
              <p className="text-xs sm:text-sm text-[#7A6F64] dark:text-[#A89C90] mt-0.5">
                قطع أصيلة تم اختيارها بعناية من كبار شيوخ الصنعة بالصعيد
              </p>
            </div>
          </div>

          {cart.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 text-xs font-bold border border-amber-300 dark:border-amber-700">
                {cartCount} {cartCount === 1 ? 'قطعة' : 'قطع مختارة'}
              </span>
              <button
                type="button"
                id="cart-clear-all-btn"
                onClick={clearCart}
                className="text-xs font-bold text-rose-700 dark:text-rose-400 hover:text-rose-800 hover:underline px-2.5 py-1 transition-colors cursor-pointer"
              >
                إفراغ السلة
              </button>
            </div>
          )}
        </div>

        {/* Cart Contents */}
        {cart.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto text-center py-16 px-6 bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] shadow-xl my-8 space-y-5"
          >
            <div className="w-24 h-24 rounded-full bg-[#FAF5EE] dark:bg-[#2A2320] text-[#B45F42] dark:text-[#FF855D] flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-12 h-12 opacity-80" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#2D2A26] dark:text-[#FAF6F2] font-heritage">
                سلة المشتريات فارغة
              </h2>
              <p className="text-sm text-[#7A6F64] dark:text-[#A89C90] max-w-sm mx-auto leading-relaxed">
                ابدأ التسوق الآن واكتشف روائع الفخار والكليم والعسل والخيرات الأصيلة من قلب محافظات الصعيد.
              </p>
            </div>

            <div className="pt-3">
              <button
                type="button"
                id="empty-cart-browse-btn"
                onClick={() => {
                  setActivePage('products');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#B45F42] hover:bg-[#9E4F36] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                <span>تصفح منتجات سوق الصعيد</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Items + Summary Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Products List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <AnimatePresence>
                {cart.map((item, idx) => {
                  const prod = item.product;
                  const prodId = prod?.id || `cart-item-${idx}`;
                  const title = prod?.title || 'منتج تراثي أصيل';
                  const img = prod?.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80';
                  const sellerName = prod?.sellerName || 'ورشة الصعيد';
                  const sellerGov = prod?.sellerGovernorate || 'قنا';
                  const price = prod?.price || 0;
                  const stockCount = prod?.stockCount ?? 99;
                  const qty = item.quantity || 1;
                  const subtotal = price * qty;

                  return (
                    <motion.div
                      key={prodId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      id={`cart-page-item-${prodId}`}
                      className="p-4 sm:p-5 bg-white dark:bg-[#1E1917] rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 relative"
                    >
                      {/* Product Image */}
                      <img
                        src={img}
                        alt={title}
                        onClick={() => navigateToProduct(prodId)}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-[#E8E1D9] dark:border-[#382E27] cursor-pointer hover:opacity-90 shrink-0"
                      />

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            onClick={() => navigateToProduct(prodId)}
                            className="text-base font-bold text-[#2D2A26] dark:text-[#FAF6F2] hover:text-[#B45F42] cursor-pointer line-clamp-2 leading-snug"
                          >
                            {title}
                          </h3>

                          {/* Delete Item Button */}
                          <button
                            type="button"
                            id={`cart-delete-item-${prodId}`}
                            onClick={() => removeFromCart(prodId)}
                            title={`حذف ${title} من السلة`}
                            aria-label={`حذف ${title} من السلة`}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>

                        {/* Workshop & Governorate Badges */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#7A6F64] dark:text-[#A89C90]">
                          <span className="flex items-center gap-1">
                            <Store className="w-3.5 h-3.5 text-[#B45F42]" />
                            <span>{sellerName}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-md font-semibold text-[11px] border border-amber-200 dark:border-amber-800">
                            <MapPin className="w-3 h-3 text-[#B45F42]" />
                            <span>محافظة {sellerGov}</span>
                          </span>
                        </div>

                        {/* Price, Stepper & Subtotal Row */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-black text-[#B45F42] dark:text-[#FF855D]">
                              {subtotal} ج.م
                            </span>
                            {qty > 1 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                ({price} ج.م للقطعة)
                              </span>
                            )}
                          </div>

                          {/* Quantity Stepper */}
                          <div className="flex items-center border border-[#E8E1D9] dark:border-[#382E27] rounded-xl bg-[#FAF6F0] dark:bg-[#25201D] overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              id={`cart-page-qty-minus-${prodId}`}
                              onClick={() => updateCartQuantity(prodId, qty - 1)}
                              className="p-2 hover:bg-[#E8E1D9] dark:hover:bg-[#382E27] text-gray-700 dark:text-gray-300 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                              aria-label={`تقليل كمية ${title}`}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3.5 text-xs sm:text-sm font-black text-[#2D2A26] dark:text-[#FAF6F2]">
                              {qty}
                            </span>
                            <button
                              type="button"
                              id={`cart-page-qty-plus-${prodId}`}
                              onClick={() => updateCartQuantity(prodId, qty + 1)}
                              disabled={qty >= stockCount}
                              className="p-2 hover:bg-[#E8E1D9] dark:hover:bg-[#382E27] disabled:opacity-40 text-gray-700 dark:text-gray-300 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                              aria-label={`زيادة كمية ${title}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {stockCount < 5 && stockCount > 0 && (
                          <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                            متبقي في الورشة {stockCount} قطع فقط
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Continue Shopping Link Button */}
              <div className="pt-2">
                <button
                  type="button"
                  id="cart-continue-shopping-btn"
                  onClick={() => {
                    setActivePage('products');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#B45F42] hover:text-[#9E4F36] hover:underline cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>متابعة التسوق واستكشاف المزيد من القطع التراثية</span>
                </button>
              </div>
            </div>

            {/* Order Summary Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] p-5 sm:p-6 shadow-md space-y-5 sticky top-24">
                <h2 className="text-lg font-black text-[#2D2A26] dark:text-[#FAF6F2] pb-3 border-b border-[#F3EFE9] dark:border-[#2D2723]">
                  ملخص الطلب والفاتورة
                </h2>

                {/* Coupon Input Form */}
                {appliedDiscount ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                      <Tag className="w-4 h-4 shrink-0" />
                      <span>الكوبون نشط: {appliedDiscount.code} (خصم {appliedDiscount.discountPercent}%)</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeDiscountCode}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <label htmlFor="cart-coupon-input" className="text-xs font-bold text-[#7A6F64] dark:text-[#A89C90] block">
                      هل لديك كود خصم أو قسيمة شراء؟
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="cart-coupon-input"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          if (couponError) setCouponError('');
                        }}
                        placeholder="أدخل كود الخصم (مثال: SAEED100)"
                        className="flex-1 px-3.5 py-2.5 bg-[#FAF6F0] dark:bg-[#25201D] border border-[#E8E1D9] dark:border-[#382E27] rounded-xl text-xs sm:text-sm text-[#2D2A26] dark:text-[#FAF6F2] placeholder:text-gray-400 focus:border-[#B45F42] outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isApplyingCoupon || !couponInput.trim()}
                        className="px-4 py-2.5 bg-[#2D2A26] hover:bg-[#403C36] dark:bg-[#352D29] dark:hover:bg-[#453A35] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                      >
                        {isApplyingCoupon ? 'جاري الفحص...' : 'تطبيق'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{couponError}</span>
                      </p>
                    )}
                  </form>
                )}

                {/* Subtotals & Fees Breakdown */}
                <div className="space-y-3 pt-2 text-xs sm:text-sm">
                  <div className="flex justify-between text-[#7A6F64] dark:text-[#A89C90]">
                    <span>قيمة المنتجات ({cartCount} قطع)</span>
                    <span className="font-bold text-[#2D2A26] dark:text-[#FAF6F2]">{cartSubtotal} ج.م</span>
                  </div>

                  <div className="flex justify-between text-[#7A6F64] dark:text-[#A89C90]">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#B45F42]" />
                      <span>رسوم الشحن السريع لباب المنزل</span>
                    </span>
                    <span className="font-bold">
                      {shippingFee === 0 ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">شحن مجاني 🎁</span>
                      ) : (
                        <span className="text-[#2D2A26] dark:text-[#FAF6F2]">{shippingFee} ج.م</span>
                      )}
                    </span>
                  </div>

                  {cartDiscountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                      <span>قيمة الخصم المطبق</span>
                      <span>-{cartDiscountAmount} ج.م</span>
                    </div>
                  )}

                  {cartSubtotal < 1000 && (
                    <p className="text-[11px] text-[#B45F42] bg-[#FAF5EE] dark:bg-[#2A2320] p-2.5 rounded-xl">
                      💡 أضف منتجات بقيمة <strong>{1000 - cartSubtotal} ج.م</strong> إضافية للحصول على <strong>شحن مجاني كامل</strong> لجميع المحافظات!
                    </p>
                  )}

                  <div className="border-t border-[#E8E1D9] dark:border-[#382E27] pt-3 flex justify-between items-baseline">
                    <span className="text-base font-black text-[#2D2A26] dark:text-[#FAF6F2]">
                      الإجمالي النهائي:
                    </span>
                    <span className="text-2xl font-black text-[#B45F42] dark:text-[#FF855D]">
                      {cartTotal} ج.م
                    </span>
                  </div>
                </div>

                {/* Primary Checkout Button */}
                <button
                  type="button"
                  id="cart-checkout-btn"
                  onClick={handleCheckout}
                  className="w-full py-4 px-6 bg-[#B45F42] hover:bg-[#9E4F36] text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-[#B45F42]/25 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-center"
                >
                  <span>متابعة إتمام الطلب والدفع</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                {/* Trust and Safety Badges */}
                <div className="pt-2 space-y-2 border-t border-[#F3EFE9] dark:border-[#2D2723] text-[11px] text-[#7A6F64] dark:text-[#A89C90]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>ضمان الجودة وأصالة الصنعة من شيوخ الحرف</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>تغليف محكم ومخصص لحماية الفخار والقطع الحساسة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>دعم فوري ومتابعة للشحنة حتى الاستلام</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

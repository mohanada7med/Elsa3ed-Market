import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag, ShieldCheck, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CartDrawer: React.FC = () => {
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    shippingFee,
    appliedDiscount,
    applyDiscountCode,
    removeDiscountCode,
    cartDiscountAmount,
    cartTotal,
    setActivePage,
    navigateToProduct,
    currentRole,
    isAuthenticated
  } = useApp();

  const [couponInput, setCouponInput] = useState('');

  if (!isCartDrawerOpen || (isAuthenticated && (currentRole === 'seller' || currentRole === 'admin'))) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyDiscountCode(couponInput);
      setCouponInput('');
    }
  };

  const proceedToCheckout = () => {
    setIsCartDrawerOpen(false);
    setActivePage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        id="cart-backdrop"
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10 w-full sm:w-auto">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          id="cart-drawer-panel"
          className="w-full sm:w-[420px] max-w-full bg-[#FAF7F2] dark:bg-[#1A1614] border-r border-[#E5DDD3] dark:border-[#352B24] shadow-2xl flex flex-col h-full"
        >
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 bg-white dark:bg-[#1F1B18] border-b border-[#E5DDD3] dark:border-[#352B24] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#B24C2B]/10 text-[#B24C2B] dark:text-[#FF855D] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-[#FAF6F2] text-base">سلة المشتريات التراثية</h3>
                <p className="text-xs text-gray-500 dark:text-[#A89C90]">{cart.length} منتجات مختارة</p>
              </div>
            </div>

            <button
              type="button"
              id="cart-drawer-close"
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-stone-200 hover:bg-gray-100 dark:hover:bg-[#2A2320] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              aria-label="إغلاق سلة المشتريات والعودة للتسوق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 rounded-full bg-[#F3EFE9] dark:bg-[#26201B] text-[#B24C2B] dark:text-[#FF855D] flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-10 h-10 opacity-60" />
                </div>
                <h4 className="font-bold text-gray-800 dark:text-[#FAF6F2] text-lg">سلة المشتريات فارغة</h4>
                <p className="text-xs text-gray-500 dark:text-[#A89C90] mt-2 max-w-xs mx-auto leading-relaxed">
                  لم تقم بإضافة أي من روائع الفخار أو الكليم أو عسل الصعيد بعد. استكشف الحرفيين وأضف قطعك المفضلة!
                </p>
                <button
                  type="button"
                  id="empty-cart-explore-btn"
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    setActivePage('products');
                  }}
                  aria-label="استكشف جميع منتجات سوق الصعيد الآن"
                  className="mt-6 px-6 py-2.5 bg-[#B24C2B] hover:bg-[#9E4F36] text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  استكشف سوق الصعيد الآن
                </button>
              </div>
            ) : (
              cart.map((item, idx) => {
                const prodId = item.product?.id || `cart-item-${idx}`;
                const title = item.product?.title || 'منتج تراثي أصيل';
                const img = item.product?.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=100&q=80';
                const sellerName = item.product?.sellerName || 'ورشة الصعيد';
                const sellerGov = item.product?.sellerGovernorate || 'قنا';
                const price = item.product?.price || 0;
                const qty = item.quantity || 1;

                return (
                  <div
                    key={prodId}
                    id={`cart-item-${prodId}`}
                    className="p-3.5 bg-white dark:bg-[#1F1B18] rounded-2xl border border-[#E5DDD3] dark:border-[#352B24] shadow-xs flex gap-3 relative group"
                  >
                    <img
                      src={img}
                      alt={title}
                      role="button"
                      tabIndex={0}
                      aria-label={`عرض تفاصيل ${title}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setIsCartDrawerOpen(false);
                          navigateToProduct(prodId);
                        }
                      }}
                      onClick={() => {
                        setIsCartDrawerOpen(false);
                        navigateToProduct(prodId);
                      }}
                      className="w-20 h-20 rounded-xl object-cover border border-[#E5DDD3] dark:border-[#352B24] cursor-pointer shrink-0 hover:opacity-90"
                    />

                    <div className="flex-1 min-w-0">
                      <h4
                        role="button"
                        tabIndex={0}
                        aria-label={`عرض تفاصيل المنتج: ${title}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setIsCartDrawerOpen(false);
                            navigateToProduct(prodId);
                          }
                        }}
                        onClick={() => {
                          setIsCartDrawerOpen(false);
                          navigateToProduct(prodId);
                        }}
                        className="text-xs font-bold text-gray-900 dark:text-[#FAF6F2] line-clamp-2 cursor-pointer hover:text-[#B24C2B] leading-snug"
                      >
                        {title}
                      </h4>

                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#73675B] dark:text-[#A89C90]">
                        <span>{sellerName}</span>
                        <span>•</span>
                        <span className="bg-amber-100/70 dark:bg-amber-950/50 text-[#B24C2B] dark:text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                          {sellerGov}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-black text-[#B24C2B] dark:text-[#FF855D]">
                            {price * qty} ج.م
                          </span>
                          {qty > 1 && (
                            <span className="text-[10px] text-gray-400">
                              ({price} ج.م للقطعة)
                            </span>
                          )}
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-[#E5DDD3] dark:border-[#352B24] rounded-xl bg-[#FAF7F2] dark:bg-[#110E0C] overflow-hidden">
                          <button
                            type="button"
                            id={`qty-minus-${prodId}`}
                            onClick={() => updateCartQuantity(prodId, qty - 1)}
                            className="p-1.5 hover:bg-amber-200/50 dark:hover:bg-[#2A2320] text-gray-600 dark:text-stone-300 transition-colors min-w-[34px] min-h-[34px] flex items-center justify-center cursor-pointer"
                            aria-label={`تقليل كمية ${title}، الكمية الحالية ${qty}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-gray-800 dark:text-[#FAF6F2]" aria-label={`الكمية ${qty}`}>
                            {qty}
                          </span>
                          <button
                            type="button"
                            id={`qty-plus-${prodId}`}
                            onClick={() => updateCartQuantity(prodId, qty + 1)}
                            className="p-1.5 hover:bg-amber-200/50 dark:hover:bg-[#2A2320] text-gray-600 dark:text-stone-300 transition-colors min-w-[34px] min-h-[34px] flex items-center justify-center cursor-pointer"
                            aria-label={`زيادة كمية ${title}، الكمية الحالية ${qty}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      id={`remove-cart-item-${prodId}`}
                      onClick={() => removeFromCart(prodId)}
                      className="text-gray-400 hover:text-rose-600 p-1.5 transition-colors self-start min-w-[38px] min-h-[38px] flex items-center justify-center rounded-lg cursor-pointer"
                      title={`حذف ${title} من السلة`}
                      aria-label={`حذف ${title} من سلة المشتريات`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer & Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 bg-white dark:bg-[#1F1B18] border-t border-[#E5DDD3] dark:border-[#352B24] space-y-3.5">
              {/* Promo code form */}
              {appliedDiscount ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <Tag className="w-4 h-4" />
                    <span>تم تطبيق الكوبون ({appliedDiscount.code}) - خصم {appliedDiscount.discountPercent}%</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeDiscountCode}
                    aria-label={`إلغاء كود الخصم ${appliedDiscount.code}`}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="كود الخصم (جرب SAEED100)"
                    aria-label="أدخل كود قسيمة الخصم الترويجية"
                    className="flex-1 px-3 py-2 text-xs bg-[#FAF7F2] dark:bg-[#110E0C] border border-[#E5DDD3] dark:border-[#352B24] text-gray-900 dark:text-[#FAF6F2] rounded-xl outline-none focus:border-[#B24C2B]"
                  />
                  <button
                    type="submit"
                    aria-label="تطبيق كود الخصم"
                    className="px-4 py-2 bg-[#FAF7F2] dark:bg-[#26201B] hover:bg-[#F3EFE9] dark:hover:bg-[#2D2723] text-[#B24C2B] dark:text-[#FF855D] border border-[#E5DDD3] dark:border-[#352B24] text-xs font-bold rounded-xl transition-colors shrink-0 min-h-[38px] cursor-pointer"
                  >
                    تطبيق
                  </button>
                </form>
              )}

              {/* Price breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600 dark:text-[#B8ACA0] pt-1">
                <div className="flex justify-between">
                  <span>المجموع الفرعي للمنتجات:</span>
                  <span className="font-bold text-gray-900 dark:text-[#FAF6F2]">{cartSubtotal} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span>الشحن إلى باب المنزل:</span>
                  {shippingFee === 0 ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">مجاني (للطلبات +1000 ج)</span>
                  ) : (
                    <span className="font-bold text-gray-900 dark:text-[#FAF6F2]">{shippingFee} ج.م</span>
                  )}
                </div>
                {cartDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                    <span>قيمة الخصم:</span>
                    <span className="font-bold">- {cartDiscountAmount} ج.م</span>
                  </div>
                )}
                <div className="border-t border-gray-100 dark:border-[#352B24] pt-2 flex justify-between text-sm font-black text-gray-900 dark:text-[#FAF6F2]">
                  <span>الإجمالي النهائي:</span>
                  <span className="text-base text-[#B24C2B] dark:text-[#FF855D]">{cartTotal} ج.م</span>
                </div>
              </div>

              {/* Checkout & Full Cart CTAs */}
              <div className="space-y-2">
                <button
                  type="button"
                  id="cart-checkout-btn"
                  onClick={proceedToCheckout}
                  aria-label={`متابعة إتمام الطلب، المبلغ الإجمالي ${cartTotal} جنيه مصري`}
                  className="w-full py-3.5 bg-[#B24C2B] hover:bg-[#9E4F36] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#B24C2B]/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] min-h-[48px] cursor-pointer"
                >
                  <span>متابعة إتمام الطلب</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  id="cart-view-full-page-btn"
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    setActivePage('cart');
                  }}
                  className="w-full py-2.5 bg-gray-100 dark:bg-[#26201B] hover:bg-gray-200 dark:hover:bg-[#2D2723] text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>عرض سلة المشتريات بالكامل</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 text-[11px] text-gray-500 dark:text-[#A89C90]">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>دفع آمن</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-500" />
                  <span>فودافون كاش / انستاباي / استلام</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

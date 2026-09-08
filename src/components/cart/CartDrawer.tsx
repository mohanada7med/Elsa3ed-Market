import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag, ShieldCheck, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../../types';

export const CartDrawer: React.FC = () => {
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cart,
    products,
    adminProducts,
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

  const isOpen = isCartDrawerOpen && !(isAuthenticated && (currentRole === 'seller' || currentRole === 'admin'));

  // Lock background scroll when Cart Drawer is open
  useEffect(() => {
    if (!isOpen) {
      const authModalBackdrop = document.getElementById('auth-modal-backdrop');
      if (!authModalBackdrop) {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.style.paddingRight = '';
      }
      return;
    }

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCartDrawerOpen(false);
    };
    window.addEventListener('keydown', handleEscape);

    return () => {
      const authModalBackdrop = document.getElementById('auth-modal-backdrop');
      if (!authModalBackdrop) {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.style.paddingRight = '';
      }
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, setIsCartDrawerOpen]);

  // Product resolution map for any items that might need hydration
  const productLookup = useMemo(() => {
    const map = new Map<string, Product>();
    (products || []).forEach((p) => { if (p?.id) map.set(p.id, p); });
    (adminProducts || []).forEach((p) => { if (p?.id && !map.has(p.id)) map.set(p.id, p); });
    return map;
  }, [products, adminProducts]);

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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="cart-drawer-root"
          className="fixed inset-0 z-[150] overflow-hidden"
          dir="rtl"
          id="cart-drawer-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop (rendered above header z-[100]) */}
          <motion.div
            id="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsCartDrawerOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity cursor-pointer"
            aria-label="إغلاق سلة المشتريات"
          />

          <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10 w-full sm:w-auto z-[160] pointer-events-none">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              id="cart-drawer-panel"
              className="w-full sm:w-[460px] max-w-full bg-[#eee8dc] dark:bg-[#0b0b0a] border-r border-black/10 dark:border-white/10 shadow-2xl flex flex-col h-full text-[#211d18] dark:text-[#f5f0e7] pointer-events-auto"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 bg-white/70 dark:bg-[#151513]/70 backdrop-blur-md border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d] flex items-center justify-center shrink-0 shadow-inner">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#211d18] dark:text-[#f5f0e7] text-base font-serif">سلة المشتريات التراثية</h3>
                    <p className="text-xs text-black/50 dark:text-white/50">{cart.length} منتجات مختارة</p>
                  </div>
                </div>

                <button
                  type="button"
                  id="cart-drawer-close"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="p-2 rounded-xl text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                  aria-label="إغلاق سلة المشتريات والعودة للتسوق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 overscroll-contain">
                {cart.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <div className="w-20 h-20 rounded-full bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d] flex items-center justify-center mx-auto mb-4 border border-[#9a6a35]/30 shadow-inner">
                      <ShoppingBag className="w-10 h-10 opacity-75" />
                    </div>
                    <h4 className="font-bold text-[#211d18] dark:text-[#f5f0e7] text-lg font-serif">سلة المشتريات فارغة</h4>
                    <p className="text-xs text-black/60 dark:text-white/60 mt-2 max-w-xs mx-auto leading-relaxed">
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
                      className="mt-6 px-6 py-2.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                    >
                      استكشف سوق الصعيد الآن
                    </button>
                  </div>
                ) : (
                  cart.map((item, idx) => {
                    const fallbackProd = (item as any).productId ? productLookup.get((item as any).productId) : null;
                    const prod = item.product || fallbackProd;
                    const prodId = prod?.id || (item as any).productId || `cart-item-${idx}`;
                    const title = prod?.title || 'منتج تراثي أصيل';
                    const img = prod?.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=200&q=80';
                    const sellerName = prod?.sellerName || 'ورشة الصعيد';
                    const sellerGov = prod?.sellerGovernorate || 'قنا';
                    const price = prod?.price || 0;
                    const qty = item.quantity || 1;

                    return (
                      <div
                        key={prodId}
                        id={`cart-item-${prodId}`}
                        className="p-3.5 bg-white/75 dark:bg-[#151513]/90 rounded-2xl border border-black/10 dark:border-white/10 shadow-xs flex gap-3 relative group transition-all"
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
                          className="w-20 h-20 rounded-xl object-cover border border-black/10 dark:border-white/10 cursor-pointer shrink-0 hover:opacity-90"
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
                            className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] line-clamp-2 cursor-pointer hover:text-[#9a6a35] dark:hover:text-[#d5a56d] leading-snug"
                          >
                            {title}
                          </h4>

                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-black/60 dark:text-white/60">
                            <span>{sellerName}</span>
                            <span>•</span>
                            <span className="bg-[#9a6a35]/10 text-[#9a6a35] dark:text-[#d5a56d] px-1.5 py-0.5 rounded text-[10px] font-semibold">
                              {sellerGov}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-2.5">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-black text-[#9a6a35] dark:text-[#d5a56d]">
                                {price * qty} ج.م
                              </span>
                              {qty > 1 && (
                                <span className="text-[10px] text-black/40 dark:text-white/40">
                                  ({price} ج.م للقطعة)
                                </span>
                              )}
                            </div>

                            {/* Quantity Stepper */}
                            <div className="flex items-center border border-black/10 dark:border-white/10 rounded-xl bg-black/5 dark:bg-white/5 overflow-hidden">
                              <button
                                type="button"
                                id={`qty-minus-${prodId}`}
                                onClick={() => updateCartQuantity(prodId, qty - 1)}
                                className="p-1.5 hover:bg-[#9a6a35]/20 text-black/70 dark:text-white/70 transition-colors min-w-[34px] min-h-[34px] flex items-center justify-center cursor-pointer"
                                aria-label={`تقليل كمية ${title}، الكمية الحالية ${qty}`}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2 text-xs font-bold text-[#211d18] dark:text-[#f5f0e7]" aria-label={`الكمية ${qty}`}>
                                {qty}
                              </span>
                              <button
                                type="button"
                                id={`qty-plus-${prodId}`}
                                onClick={() => updateCartQuantity(prodId, qty + 1)}
                                className="p-1.5 hover:bg-[#9a6a35]/20 text-black/70 dark:text-white/70 transition-colors min-w-[34px] min-h-[34px] flex items-center justify-center cursor-pointer"
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
                          className="text-black/40 dark:text-white/40 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 transition-colors self-start min-w-[38px] min-h-[38px] flex items-center justify-center rounded-lg cursor-pointer"
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
                <div className="p-4 sm:p-5 bg-white/90 dark:bg-[#151513]/95 border-t border-black/10 dark:border-white/10 space-y-3.5">
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
                        className="flex-1 px-3 py-2 text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-[1rem] outline-none focus:border-[#9a6a35]"
                      />
                      <button
                        type="submit"
                        aria-label="تطبيق كود الخصم"
                        className="px-4 py-2 bg-[#9a6a35]/10 hover:bg-[#9a6a35]/20 text-[#9a6a35] dark:text-[#d5a56d] border border-[#9a6a35]/30 text-xs font-bold rounded-[1rem] transition-colors shrink-0 min-h-[38px] cursor-pointer"
                      >
                        تطبيق
                      </button>
                    </form>
                  )}

                  {/* Price breakdown */}
                  <div className="space-y-1.5 text-xs text-[#211d18]/70 dark:text-[#f5f0e7]/70 pt-1">
                    <div className="flex justify-between">
                      <span>المجموع الفرعي للمنتجات:</span>
                      <span className="font-bold text-[#211d18] dark:text-[#f5f0e7]">{cartSubtotal} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الشحن إلى باب المنزل:</span>
                      {shippingFee === 0 ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">مجاني (للطلبات +1000 ج)</span>
                      ) : (
                        <span className="font-bold text-[#211d18] dark:text-[#f5f0e7]">{shippingFee} ج.م</span>
                      )}
                    </div>
                    {cartDiscountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                        <span>قيمة الخصم:</span>
                        <span className="font-bold">- {cartDiscountAmount} ج.م</span>
                      </div>
                    )}
                    <div className="border-t border-black/10 dark:border-white/10 pt-2 flex justify-between text-sm font-black text-[#211d18] dark:text-[#f5f0e7]">
                      <span>الإجمالي النهائي:</span>
                      <span className="text-base text-[#9a6a35] dark:text-[#d5a56d] font-black">{cartTotal} ج.م</span>
                    </div>
                  </div>

                  {/* Checkout & Full Cart CTAs */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      id="cart-checkout-btn"
                      onClick={proceedToCheckout}
                      aria-label={`متابعة إتمام الطلب، المبلغ الإجمالي ${cartTotal} جنيه مصري`}
                      className="w-full py-3.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] font-black text-sm rounded-[1.25rem] shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01] min-h-[48px] cursor-pointer"
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
                      className="w-full py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] font-bold text-xs rounded-[1.25rem] transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>عرض سلة المشتريات بالكامل</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-3 text-[11px] text-[#211d18]/60 dark:text-[#f5f0e7]/60">
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

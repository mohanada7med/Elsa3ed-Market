import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Governorate, Order } from '../../types';
import { api, initiatePaymobPayment } from '../../services/api';
import {
  ShieldCheck,
  Truck,
  ShoppingBag,
  Check,
  MapPin,
  PackageCheck,
  CreditCard,
  Smartphone,
  Banknote,
  Lock,
  Loader2,
  ExternalLink
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    shippingFee,
    appliedDiscount,
    cartDiscountAmount,
    cartTotal,
    currentUser,
    createOrder,
    cancelOrder,
    setActivePage,
    addToast
  } = useApp();

  // Form State
  const [fullName, setFullName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [governorate, setGovernorate] = useState<Governorate>(
    (currentUser.governorate as Governorate) || 'القاهرة'
  );
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [sellerTipAmount, setSellerTipAmount] = useState('0');
  const [sellerTipSellerId, setSellerTipSellerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'paymob_card' | 'paymob_wallet' | 'cod'>('paymob_card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirectingPaymob, setIsRedirectingPaymob] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [paymobPayUrl, setPaymobPayUrl] = useState<string | null>(null);
  const [paymentOptions, setPaymentOptions] = useState({
    card: false,
    wallet: false,
    cashOnDelivery: true
  });
  const [isPaymentConfigLoaded, setIsPaymentConfigLoaded] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    api.getPublicPaymentConfig().then((config) => {
      if (!isCurrent) return;

      const options = {
        card: config.isOnlinePaymentActive && config.isPaymobCardActive,
        wallet: config.isOnlinePaymentActive && config.isPaymobWalletActive,
        cashOnDelivery: config.isCashOnDeliveryActive
      };
      setPaymentOptions(options);
      setPaymentMethod((current) => {
        if (current === 'cod' && options.cashOnDelivery) return current;
        if (current === 'paymob_card' && options.card) return current;
        if (current === 'paymob_wallet' && options.wallet) return current;
        if (options.card) return 'paymob_card';
        if (options.wallet) return 'paymob_wallet';
        if (options.cashOnDelivery) return 'cod';
        return current;
      });
      setIsPaymentConfigLoaded(true);
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  const cartSellers = Array.from(
    new Map(
      cart.map(({ product }) => [
        product.sellerId,
        { id: product.sellerId, name: product.sellerName }
      ])
    ).values()
  );
  const tipAmount = Number(sellerTipAmount) || 0;
  const effectiveTipSellerId = sellerTipSellerId || cartSellers[0]?.id || '';
  const checkoutTotal = cartTotal + tipAmount;

  const requestPaymobSession = async (orderId: string, methodType: 'card' | 'wallet' | 'all') => {
    if (typeof api?.initiatePaymobPayment === 'function') {
      return api.initiatePaymobPayment(currentUser, orderId, methodType);
    }
    if (typeof initiatePaymobPayment === 'function') {
      return initiatePaymobPayment(currentUser, orderId, methodType);
    }
    const res = await fetch('/api/payments/paymob/initiate', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, methodType })
    });
    const json = await res.json();
    if (!json.success || !json.data) throw new Error(json.error || 'تعذر بدء عملية الدفع عبر Paymob');
    return json.data;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !city.trim() || !address.trim()) {
      addToast('بيانات ناقصة', 'لو سمحت كمل كل بيانات عنوان التوصيل المطلوبة', 'error');
      return;
    }
    if (
      !Number.isInteger(tipAmount) ||
      tipAmount < 0 ||
      tipAmount > 1000 ||
      (tipAmount > 0 && !cartSellers.some((seller) => seller.id === effectiveTipSellerId))
    ) {
      addToast('مبلغ الدعم غير صحيح', 'اختار مبلغاً صحيحاً من 1 إلى 1000 جنيه وحرفياً من طلبك', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newOrder = await createOrder({
        buyerName: fullName.trim(),
        buyerPhone: phone.trim(),
        governorate,
        city: city.trim(),
        addressText: address.trim(),
        notes: notes.trim(),
        paymentMethod: paymentMethod,
        sellerTipAmount: tipAmount,
        sellerTipSellerId: tipAmount > 0 ? effectiveTipSellerId : undefined
      });

      if (paymentMethod === 'paymob_card' || paymentMethod === 'paymob_wallet') {
        setIsRedirectingPaymob(true);
        try {
          const methodType = paymentMethod === 'paymob_wallet' ? 'wallet' : 'card';
          let payRes: any = null;
          try {
            payRes = await requestPaymobSession(newOrder.id, methodType);
          } catch (firstErr: any) {
            if (methodType === 'wallet' && paymentOptions.card) {
              console.warn('[Paymob] Wallet integration unavailable, attempting card fallback:', firstErr?.message);
              payRes = await requestPaymobSession(newOrder.id, 'card');
            } else {
              throw firstErr;
            }
          }

          if (payRes?.paymentUrl) {
            setPaymobPayUrl(payRes.paymentUrl);
            addToast('جاري التحويل لـ Paymob', 'يتم تحويلك الآن لبوابة الدفع الآمنة لإتمام السداد وتأكيد الطلب...', 'info');
            setTimeout(() => {
              window.location.href = payRes.paymentUrl;
            }, 600);
            return;
          }
        } catch (payErr: any) {
          console.warn('[Paymob] Initiate checkout error:', payErr?.message || payErr);
          try {
            await cancelOrder(newOrder.id, 'فشل الاتصال ببوابة الدفع Paymob');
          } catch (cancelErr) {
            console.warn('[Checkout] Failed to cancel unconfirmed order:', cancelErr);
          }
          addToast('لم يتم تأكيد الطلب', 'تعذر بدء جلسة الدفع الإلكتروني عبر Paymob. لم يتم تأكيد طلبك. يرجى المحاولة مجدداً أو اختيار طريقة دفع أخرى.', 'error');
          setIsRedirectingPaymob(false);
          setIsSubmitting(false);
          return;
        } finally {
          setIsRedirectingPaymob(false);
        }
      }

      setCompletedOrder(newOrder);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      addToast('ماعرفناش نأكد الطلب', err?.message || 'راجع بيانات السلة وجرب تاني', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // حالة السلة الفارغة
  if (cart.length === 0 && !completedOrder && !isSubmitting) {
    return (
      <div dir="rtl" className="min-h-[75vh] flex items-center justify-center max-w-4xl mx-auto px-4 py-16">
        <div className="relative w-full max-w-md p-10 text-center bg-white/90 dark:bg-espresso-900/90 backdrop-blur-2xl rounded-3xl border border-black/5 dark:border-white/10 shadow-2xl space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto ring-8 ring-primary/5">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-main text-espresso dark:text-cream">سلتك بانتظار إبداعاتك</h2>
            <p className="text-sm text-espresso/60 dark:text-cream/60 leading-relaxed">
              سلة التسوق فارغة حالياً، استكشف المنتجات التراثية المميزة أولاً.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('products')}
            className="w-full py-4 bg-[#6B3A1F] text-[#FFF9EE] hover:bg-[#3B1E0E] dark:hover:bg-[#C99444] font-bold text-sm rounded-2xl shadow-lg transition duration-200 cursor-pointer"
          >
            تصفح منتجات سوق وه
          </button>
        </div>
      </div>
    );
  }

  // شاشة نجاح وتأكيد الطلب
  if (completedOrder) {
    return (
      <div dir="rtl" className="min-h-screen bg-cream/30 dark:bg-espresso-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white dark:bg-espresso-900 rounded-[2.5rem] border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden relative">
            <div className="h-3 w-full bg-gradient-to-r from-emerald-500 via-primary to-amber-500" />

            <div className="p-8 sm:p-12 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-main text-espresso dark:text-cream">
                  {completedOrder.paymentStatus !== 'paid' &&
                  (completedOrder.paymentMethod === 'paymob_card' ||
                    completedOrder.paymentMethod === 'paymob_wallet' ||
                    completedOrder.paymentMethod === 'paymob')
                    ? 'الطلب بانتظار إتمام السداد لتأكيده'
                    : 'تم استلام وتأكيد طلبك بنجاح!'}
                </h1>
                <p className="text-sm text-espresso/60 dark:text-cream/60">
                  {completedOrder.paymentStatus !== 'paid' &&
                  (completedOrder.paymentMethod === 'paymob_card' ||
                    completedOrder.paymentMethod === 'paymob_wallet' ||
                    completedOrder.paymentMethod === 'paymob')
                    ? 'لم يتم تأكيد طلبك للورش بعد. يرجى إتمام الدفع الإلكتروني عبر Paymob لتأكيد الطلب وبدء تجهيزه بالورش.'
                    : 'شكراً لدعمك المباشر لحرفيي صعيد مصر، جاري الآن إبلاغ الورش لبدء تجهيز طلبك'}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-2xl border border-black/5 font-mono text-sm">
                <span className="text-espresso/60 dark:text-cream/60">رقم الطلب:</span>
                <span className="font-bold text-primary">#{completedOrder.orderNumber || completedOrder.id}</span>
              </div>
            </div>

            <div className="px-8 pb-8 space-y-6">
              {/* Order Summary & Address */}
              <div className="p-5 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-black/5 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-espresso/70 dark:text-cream/70">
                  <span>المبلغ الإجمالي:</span>
                  <span className="font-mono text-base font-black text-primary">{completedOrder.total} ج.م</span>
                </div>
                
                <div className="flex justify-between items-center text-espresso/70 dark:text-cream/70">
                  <span>طريقة السداد:</span>
                  <span className="font-bold flex items-center gap-1.5 text-primary">
                    {completedOrder.paymentMethod === 'paymob_wallet' ? (
                      <>
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>محفظة ذكية (Paymob)</span>
                      </>
                    ) : completedOrder.paymentMethod === 'paymob_card' || completedOrder.paymentMethod === 'paymob' ? (
                      <>
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>بطاقة بنكية (Paymob)</span>
                      </>
                    ) : (
                      <>
                        <Banknote className="w-3.5 h-3.5" />
                        <span>الدفع نقداً عند الاستلام</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center text-espresso/70 dark:text-cream/70">
                  <span>حالة الدفع:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                    completedOrder.paymentStatus === 'paid'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : completedOrder.paymentMethod === 'cod' || completedOrder.paymentMethod === 'cash_on_delivery'
                        ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                        : 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                  }`}>
                    {completedOrder.paymentStatus === 'paid'
                      ? 'تم السداد وتأكيد الطلب ✓'
                      : completedOrder.paymentMethod === 'cod' || completedOrder.paymentMethod === 'cash_on_delivery'
                        ? 'الدفع عند المعاينة والاستلام'
                        : 'غير مؤكد - في انتظار إتمام السداد'}
                  </span>
                </div>

                {!!completedOrder.sellerTipAmount && (
                  <div className="flex justify-between text-espresso/60 dark:text-cream/60 text-[11px]">
                    <span>دعم اختياري لـ{completedOrder.sellerTipSellerName || 'الحرفي'}:</span>
                    <span>{completedOrder.sellerTipAmount} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between text-espresso/60 dark:text-cream/60 text-[11px]">
                  <span>عنوان الشحن:</span>
                  <span>{completedOrder.shippingAddress?.governorate || ''} - {completedOrder.shippingAddress?.city || ''}</span>
                </div>
                <div className="flex justify-between text-espresso/60 dark:text-cream/60 text-[11px]">
                  <span>المستلم:</span>
                  <span>{completedOrder.buyerName} ({completedOrder.buyerPhone})</span>
                </div>
              </div>

              {/* Paymob Pending Payment Action */}
              {(completedOrder.paymentMethod === 'paymob_card' || completedOrder.paymentMethod === 'paymob_wallet' || completedOrder.paymentMethod === 'paymob') &&
                completedOrder.paymentStatus !== 'paid' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>سدد الآن بأمان عبر بوابة Paymob لتأكيد حجز القطعة فورياً بالورشة</span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (paymobPayUrl) {
                        window.location.href = paymobPayUrl;
                        return;
                      }
                      try {
                        setIsRedirectingPaymob(true);
                        const methodType = completedOrder.paymentMethod === 'paymob_wallet' ? 'wallet' : 'card';
                        let res: any = null;
                        try {
                          res = await requestPaymobSession(completedOrder.id, methodType);
                        } catch (primaryErr: any) {
                          if (methodType === 'wallet') {
                            console.warn('[Checkout] Wallet unavailable, trying card fallback:', primaryErr?.message);
                            res = await requestPaymobSession(completedOrder.id, 'card');
                          } else {
                            throw primaryErr;
                          }
                        }
                        if (res?.paymentUrl) {
                          setPaymobPayUrl(res.paymentUrl);
                          window.location.href = res.paymentUrl;
                        }
                      } catch (err: any) {
                        addToast('خطأ في الاتصال بـ Paymob', err?.message || 'تعذر بدء بوابة الدفع، جرب مرة أخرى', 'error');
                      } finally {
                        setIsRedirectingPaymob(false);
                      }
                    }}
                    disabled={isRedirectingPaymob}
                    className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    {isRedirectingPaymob ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري فتح بوابة Paymob...</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        <span>استكمال السداد الإلكتروني الآن عبر Paymob</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActivePage('orders')}
                  className="w-full py-3.5 bg-[#6B3A1F] text-[#FFF9EE] font-bold text-xs rounded-xl shadow-lg hover:bg-primary transition cursor-pointer"
                >
                  متابعة شحنتي
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('products')}
                  className="w-full py-3.5 border border-black/10 dark:border-white/10 font-bold text-xs rounded-xl hover:bg-black/5 transition cursor-pointer"
                >
                  العودة للمتجر
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#FFF9EE] dark:bg-espresso-950 py-8 px-4 sm:px-6 lg:px-12">
      <div className="max-w-[1360px] mx-auto space-y-8">

        {/* --- CHECKOUT HEADER & STEPPER --- */}
        <div
          className="
            relative overflow-hidden
            bg-[#faf7f2] dark:bg-[#17120e]
            rounded-[2rem]
            border border-[#e8ddd1] dark:border-white/[0.08]
            shadow-[0_12px_40px_rgba(36,30,26,0.06)]
            dark:shadow-[0_12px_40px_rgba(0,0,0,0.22)]
            p-5 sm:p-6
          "
        >
          <div className="relative max-w-xl mx-auto flex items-center justify-between">
            {/* Step 1 — Cart */}
            <button
              type="button"
              onClick={() => setActivePage('cart')}
              className="flex items-center gap-3 cursor-pointer group outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-black text-emerald-600 dark:text-emerald-400">مكتملة</span>
                <span className="block text-xs font-bold text-espresso dark:text-cream">سلة المشتريات</span>
              </div>
            </button>

            {/* Connecting Line */}
            <div className="flex-1 mx-4 h-0.5 bg-primary/30 rounded-full" />

            {/* Step 2 — Shipping & Order */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary/25 ring-4 ring-primary/15 animate-pulse">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-black text-primary">الخطوة الحالية</span>
                <span className="block text-xs font-bold text-espresso dark:text-cream">العنوان وتأكيد الطلب</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT & SIDEBAR --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Shipping Form Area */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handlePlaceOrder}>
              <div className="bg-white dark:bg-espresso-900 rounded-[2rem] p-6 sm:p-8 border border-black/5 dark:border-white/10 shadow-sm space-y-6 animate-fadeIn">
                <div className="border-b border-black/5 dark:border-white/10 pb-4">
                  <h2 className="text-xl font-bold font-cairo text-espresso dark:text-cream">بيانات المستلم وعنوان التوصيل</h2>
                  <p className="text-xs text-espresso/50 dark:text-cream/50 mt-0.5">يرجى كتابة البيانات بدقة لضمان سرعة وصول الطرد من ورش الصعيد</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-espresso/80 dark:text-cream/80">الاسم ثلاثي *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="مثال: يوسف أحمد عبد المنعم"
                      className="w-full px-4 py-3 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-espresso/80 dark:text-cream/80">رقم الهاتف للتواصل *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010XXXXXXXX"
                      className="w-full px-4 py-3 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-left"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-espresso/80 dark:text-cream/80">المحافظة *</label>
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value as Governorate)}
                      className="
                        w-full px-4 py-3
                        bg-white dark:bg-[#1c1713]
                        text-[#3B1E0E] dark:text-[#FFF9EE]
                        border border-[#d8d0c8] dark:border-white/10
                        rounded-2xl text-sm
                        focus:outline-none focus:ring-2 focus:ring-primary/20
                        cursor-pointer
                      "
                    >
                      <option value="القاهرة">القاهرة</option>
                      <option value="الجيزة">الجيزة</option>
                      <option value="الإسكندرية">الإسكندرية</option>
                      <option value="الدقهلية">الدقهلية</option>
                      <option value="البحر الأحمر">البحر الأحمر</option>
                      <option value="البحيرة">البحيرة</option>
                      <option value="الفيوم">الفيوم</option>
                      <option value="الغربية">الغربية</option>
                      <option value="الإسماعيلية">الإسماعيلية</option>
                      <option value="المنوفية">المنوفية</option>
                      <option value="المنيا">المنيا</option>
                      <option value="القليوبية">القليوبية</option>
                      <option value="الوادي الجديد">الوادي الجديد</option>
                      <option value="السويس">السويس</option>
                      <option value="أسوان">أسوان</option>
                      <option value="أسيوط">أسيوط</option>
                      <option value="بني سويف">بني سويف</option>
                      <option value="بورسعيد">بورسعيد</option>
                      <option value="دمياط">دمياط</option>
                      <option value="الشرقية">الشرقية</option>
                      <option value="جنوب سيناء">جنوب سيناء</option>
                      <option value="كفر الشيخ">كفر الشيخ</option>
                      <option value="مطروح">مطروح</option>
                      <option value="الأقصر">الأقصر</option>
                      <option value="قنا">قنا</option>
                      <option value="شمال سيناء">شمال سيناء</option>
                      <option value="سوهاج">سوهاج</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-espresso/80 dark:text-cream/80">المدينة / المركز / الحي *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="مثال: نجع حمادي، الدقي، أخميم..."
                      className="w-full px-4 py-3 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-espresso/80 dark:text-cream/80">العنوان بالتفصيل (اسم الشارع ورقم العمارة والشقة) *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="شارع الجمهورية، برج الأمل، الدور الخامس"
                    className="w-full px-4 py-3 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-espresso/80 dark:text-cream/80">تعليمات للمندوب أو الورشة (اختياري)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="يرجى الاتصال قبل التسليم بنصف ساعة..."
                    className="w-full px-4 py-3 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <section className="space-y-4 rounded-2xl border border-primary/15 bg-primary/[0.04] p-4">
                  <div>
                    <h3 className="text-sm font-black text-espresso dark:text-cream">ادعم حرفي من طلبك (اختياري)</h3>
                    <p className="mt-1 text-[11px] leading-5 text-espresso/60 dark:text-cream/60">
                      المبلغ يضاف لإجمالي الدفع عند الاستلام ويُسجل لصالح الحرفي الذي تختاره.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[0, 10, 20, 50, 100].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setSellerTipAmount(String(amount))}
                        aria-pressed={tipAmount === amount}
                        className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                          tipAmount === amount
                            ? 'border-primary bg-primary text-white'
                            : 'border-black/10 bg-white/70 text-espresso dark:border-white/10 dark:bg-white/5 dark:text-cream'
                        }`}
                      >
                        {amount === 0 ? 'بدون دعم' : `${amount} ج.م`}
                      </button>
                    ))}
                    <label className="flex items-center gap-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5">
                      <span className="font-bold">مبلغ آخر</span>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        step="1"
                        value={sellerTipAmount !== '0' && ![10, 20, 50, 100].includes(tipAmount) ? sellerTipAmount : ''}
                        onChange={(event) => setSellerTipAmount(event.target.value || '0')}
                        placeholder="ج.م"
                        aria-label="مبلغ دعم مخصص"
                        className="w-20 bg-transparent text-center font-mono outline-none"
                      />
                    </label>
                  </div>
                  {cartSellers.length > 1 && tipAmount > 0 && (
                    <label className="block space-y-1.5 text-xs font-bold text-espresso/80 dark:text-cream/80">
                      اختار الحرفي المستفيد
                      <select
                        value={effectiveTipSellerId}
                        onChange={(event) => setSellerTipSellerId(event.target.value)}
                        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-[#1c1713] dark:text-cream"
                      >
                        {cartSellers.map((seller) => (
                          <option key={seller.id} value={seller.id}>{seller.name}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  {tipAmount > 0 && (
                    <p className="text-[11px] font-bold text-primary">
                      دعمك: {tipAmount} ج.م {cartSellers.length === 1 ? `لـ${cartSellers[0].name}` : ''}
                    </p>
                  )}
                </section>

                {/* --- PAYMENT METHOD SELECTION (PAYMOB & COD) --- */}
                <section className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold font-cairo text-espresso dark:text-cream flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" />
                        <span>طريقة السداد الآمنة</span>
                      </h3>
                      <p className="text-xs text-espresso/60 dark:text-cream/60 mt-0.5">
                        اختر طريقة الدفع المناسبة لك عبر بوابة Paymob المعتمدة
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-full text-[11px] font-bold border border-emerald-500/20">
                      تشفير بنكي 256-bit
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Option 1: Card via Paymob */}
                    {paymentOptions.card && (
                    <div
                      onClick={() => setPaymentMethod('paymob_card')}
                      className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'paymob_card'
                          ? 'border-primary bg-primary/[0.06] shadow-md ring-2 ring-primary/20'
                          : 'border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.02] hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          paymentMethod === 'paymob_card'
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-black/5 dark:bg-white/5 text-espresso dark:text-cream'
                        }`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'paymob_card' ? 'border-primary bg-primary text-white' : 'border-stone-300 dark:border-stone-600'
                        }`}>
                          {paymentMethod === 'paymob_card' && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-espresso dark:text-cream">بطاقة بنكية (Paymob)</h4>
                      <p className="text-[11px] text-espresso/60 dark:text-cream/60 mt-1 leading-relaxed">
                        فيزا، ماستركارد، وبطاقة ميزة الوطنية
                      </p>
                      <div className="mt-3 flex items-center gap-1.5 text-[9px] font-black text-espresso/40 dark:text-cream/40">
                        <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">Visa</span>
                        <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">Mastercard</span>
                        <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">ميزة</span>
                      </div>
                    </div>
                    )}

                    {/* Option 2: Mobile Wallet via Paymob */}
                    {paymentOptions.wallet && (
                    <div
                      onClick={() => setPaymentMethod('paymob_wallet')}
                      className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'paymob_wallet'
                          ? 'border-primary bg-primary/[0.06] shadow-md ring-2 ring-primary/20'
                          : 'border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.02] hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          paymentMethod === 'paymob_wallet'
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-black/5 dark:bg-white/5 text-espresso dark:text-cream'
                        }`}>
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'paymob_wallet' ? 'border-primary bg-primary text-white' : 'border-stone-300 dark:border-stone-600'
                        }`}>
                          {paymentMethod === 'paymob_wallet' && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-espresso dark:text-cream">المحافظ الذكية (Paymob)</h4>
                      <p className="text-[11px] text-espresso/60 dark:text-cream/60 mt-1 leading-relaxed">
                        فودافون كاش، أورنج، اتصالات، وي باي
                      </p>
                      <div className="mt-3 flex items-center gap-1.5 text-[9px] font-black text-espresso/40 dark:text-cream/40">
                        <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">Vodafone</span>
                        <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">Orange</span>
                        <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">Etisalat</span>
                      </div>
                    </div>
                    )}

                    {/* Option 3: Cash On Delivery */}
                    {paymentOptions.cashOnDelivery && (
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-primary bg-primary/[0.06] shadow-md ring-2 ring-primary/20'
                          : 'border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.02] hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          paymentMethod === 'cod'
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-black/5 dark:bg-white/5 text-espresso dark:text-cream'
                        }`}>
                          <Banknote className="w-5 h-5" />
                        </div>
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'cod' ? 'border-primary bg-primary text-white' : 'border-stone-300 dark:border-stone-600'
                        }`}>
                          {paymentMethod === 'cod' && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-espresso dark:text-cream">الدفع عند الاستلام</h4>
                      <p className="text-[11px] text-espresso/60 dark:text-cream/60 mt-1 leading-relaxed">
                        معاينة وفحص القطعة اليدوية قبل السداد للمندوب
                      </p>
                      <div className="mt-3 flex items-center gap-1.5 text-[9px] font-black text-espresso/40 dark:text-cream/40">
                        <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">معاينة القطعة</span>
                        <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">نقداً</span>
                      </div>
                    </div>
                    )}

                    {!paymentOptions.card &&
                      !paymentOptions.wallet &&
                      !paymentOptions.cashOnDelivery && (
                      <p className="sm:col-span-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center text-sm font-bold text-amber-900 dark:text-amber-200">
                        لا توجد طرق دفع متاحة حالياً. يرجى المحاولة لاحقاً.
                      </p>
                    )}
                  </div>

                  {/* Security Note */}
                  <div className="p-3 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/5 dark:border-white/5 flex items-center gap-2.5 text-[11px] text-espresso/70 dark:text-cream/70">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {paymentMethod === 'cod'
                        ? 'حق المعاينة مكفول: يمكنك فحص القطع المصنوعة يدوياً والتأكد من سلامتها قبل الدفع.'
                        : 'يتم تشفير وتأمين كافة بيانات المعاملات عبر بوابة Paymob المرخصة رسمياً من البنك المركزي المصري.'}
                    </span>
                  </div>
                </section>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={
                      !isPaymentConfigLoaded ||
                      (!paymentOptions.card &&
                        !paymentOptions.wallet &&
                        !paymentOptions.cashOnDelivery) ||
                      isSubmitting ||
                      isRedirectingPaymob
                    }
                    className="w-full sm:w-auto px-10 py-4 bg-[#6B3A1F] text-[#FFF9EE] hover:bg-[#3B1E0E] dark:hover:bg-[#C99444] font-bold text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50 cursor-pointer"
                  >
                    {isRedirectingPaymob ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>جاري تحويلك لبوابة الدفع Paymob...</span>
                      </>
                    ) : isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>جاري تسجيل وتأكيد طلبك...</span>
                      </>
                    ) : paymentMethod === 'paymob_card' ? (
                      <>
                        <CreditCard className="w-5 h-5 text-primary" />
                        <span>متابعة السداد بالبطاقة البنكية ({checkoutTotal} ج.م)</span>
                      </>
                    ) : paymentMethod === 'paymob_wallet' ? (
                      <>
                        <Smartphone className="w-5 h-5 text-primary" />
                        <span>متابعة السداد بالمحفظة الذكية ({checkoutTotal} ج.م)</span>
                      </>
                    ) : (
                      <>
                        <PackageCheck className="w-5 h-5 text-primary" />
                        <span>تأكيد الطلب والدفع عند الاستلام ({checkoutTotal} ج.م)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4 sticky top-6 space-y-4">
            <div
              className="
                relative overflow-hidden
                rounded-[2rem]
                bg-[#faf7f2] dark:bg-[#17120e]
                border border-[#e8ddd1] dark:border-white/[0.08]
                shadow-[0_20px_60px_rgba(36,30,26,0.08)]
                dark:shadow-[0_20px_60px_rgba(0,0,0,0.25)]
              "
            >
              <div className="relative p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/10">
                      <ShoppingBag className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-[#3B1E0E] dark:text-[#FFF9EE]">
                        ملخص طلبيتك
                      </h3>
                      <p className="text-[11px] text-[#8f8379] dark:text-white/40 mt-0.5">
                        راجع طلبك قبل التأكيد
                      </p>
                    </div>
                  </div>

                  <div className="px-3 py-1.5 rounded-full bg-white dark:bg-white/[0.05] border border-black/5 dark:border-white/10 text-[10px] font-bold text-[#6f6258] dark:text-white/50">
                    {cart.length} {cart.length === 1 ? 'منتج' : 'منتجات'}
                  </div>
                </div>

                {/* Items */}
                <div className="rounded-2xl bg-white/70 dark:bg-white/[0.025] border border-black/[0.05] dark:border-white/[0.06] overflow-hidden">
                  <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar space-y-1">
                    {cart.map((item, idx) => {
                      const title = item.product?.title || 'قطعة أصيلة';
                      const img = item.product?.images?.[0];
                      const price = item.product?.price || 0;
                      const qty = item.quantity || 1;

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-black/[0.025] dark:hover:bg-white/[0.035] transition"
                        >
                          <div className="relative shrink-0">
                            {img ? (
                              <img
                                src={img}
                                alt={title}
                                className="w-12 h-12 rounded-xl object-cover border border-black/5 dark:border-white/10 shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4 text-black/20 dark:text-white/20" />
                              </div>
                            )}
                            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center">
                              {qty}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#3B1E0E] dark:text-[#FFF9EE] truncate">
                              {title}
                            </p>
                            <p className="text-[10px] text-[#978b81] dark:text-white/40 mt-1">
                              {price} ج.م × {qty}
                            </p>
                          </div>

                          <div className="text-left shrink-0">
                            <span className="text-xs font-black font-mono text-[#3B1E0E] dark:text-[#FFF9EE]">
                              {price * qty}
                            </span>
                            <span className="block text-[9px] text-[#9c9188] dark:text-white/30">ج.م</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#81766d] dark:text-white/50">المجموع الفرعي</span>
                    <span className="font-mono font-bold text-[#342b26] dark:text-[#eee2d7]">{cartSubtotal} ج.م</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-[#998d83] dark:text-white/40" />
                      <span className="text-[#81766d] dark:text-white/50">الشحن</span>
                    </div>
                    <span className={`font-mono font-bold ${shippingFee === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#342b26] dark:text-[#eee2d7]'}`}>
                      {shippingFee === 0 ? 'مجاناً' : `${shippingFee} ج.م`}
                    </span>
                  </div>

                  {cartDiscountAmount > 0 && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/10">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">الخصم</span>
                      <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">- {cartDiscountAmount} ج.م</span>
                    </div>
                  )}
                  {tipAmount > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#81766d] dark:text-white/50">دعم اختياري للحرفي</span>
                      <span className="font-mono font-bold text-primary">+ {tipAmount} ج.م</span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="relative my-5">
                  <div className="border-t border-dashed border-black/10 dark:border-white/10" />
                </div>

                {/* Total */}
                <div className="rounded-2xl bg-[#3B1E0E] p-4 text-white relative overflow-hidden">
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-white/45 mb-1">الإجمالي النهائي</p>
                      <p className="text-sm font-bold text-white/80">شامل التوصيل والخصم</p>
                    </div>
                    <div className="text-left">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-white">{checkoutTotal}</span>
                      <span className="text-[10px] font-bold text-white/50 mr-1">ج.م</span>
                    </div>
                  </div>
                </div>

                {/* Trust */}
                <div className="mt-4 flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/10">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-emerald-700 dark:text-emerald-400">طلبك مضمون 100%</p>
                    <p className="text-[9px] text-emerald-700/60 dark:text-emerald-400/50 mt-0.5">ضمان جودة الحرفة والمعاينة عند الاستلام</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
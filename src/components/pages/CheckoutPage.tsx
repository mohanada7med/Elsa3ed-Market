import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Governorate, Order } from '../../types';
import { api } from '../../services/api';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  ShoppingBag,
  Copy,
  Check,
  Wallet,
  Info,
  Clock
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
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('instapay');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic payment accounts config from backend
  const [paymentConfig, setPaymentConfig] = useState<{
    instaPayAccount: string;
    vodafoneCashNumber: string;
    instaPayInstructions?: string;
    vodafoneCashInstructions?: string;
  }>({
    instaPayAccount: 'elsa3ed@instapay',
    vodafoneCashNumber: '01158969931',
    instaPayInstructions: 'حوّل عن طريق تطبيق إنستاباي لعنوان الدفع المكتوب فوق، وبعدها دوس "أكد الطلب".',
    vodafoneCashInstructions: 'حوّل المبلغ على رقم فودافون كاش المكتوب فوق، وبعدها دوس "أكد الطلب".'
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Success state
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    let isMounted = true;
    api.getPublicPaymentConfig().then((cfg) => {
      if (isMounted && cfg) {
        setPaymentConfig(cfg);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast('اتنسخ تمام', `تم نسخ ${text} بنجاح`, 'success');
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  if (cart.length === 0 && !completedOrder) {
    return (
      <div
        dir="rtl"
        className="min-h-[75vh] flex items-center justify-center max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-16"
      >
        <div className="max-w-md w-full p-8 sm:p-10 text-center space-y-6 bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 shadow-xl">
          <div className="w-20 h-20 rounded-2xl bg-[#9a6a35]/10 text-[#9a6a35] dark:text-[#d5a56d] flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#211d18] dark:text-[#f5f0e7]">
              السلة فاضية لسه
            </h2>
            <p className="text-xs sm:text-sm text-[#211d18]/70 dark:text-[#f5f0e7]/70 leading-relaxed">
              حط منتجات في السلة الأول عشان تقدر تكمّل الطلب بتاعك.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('products')}
            className="w-full py-4 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs sm:text-sm font-black rounded-[1.25rem] shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.01]"
          >
            اتفرج على سوق وه دلوقتي
          </button>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !city.trim() || !address.trim()) {
      addToast('بيانات ناقصة', 'لو سمحت كمل كل بيانات عنوان التوصيل', 'error');
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
        paymentMethod,
        paymentReference: paymentReference.trim() || undefined
      });

      setCompletedOrder(newOrder);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      addToast('ماعرفناش نأكد الطلب', err?.message || 'راجع بيانات السلة وجرب تاني كده', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order was successfully placed, render Order Success Confirmation View
  if (completedOrder) {
    const isManualTransfer =
      completedOrder.paymentMethod === 'instapay' ||
      completedOrder.paymentMethod === 'vodafone_cash';

    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#eee8dc] text-[#211d18] dark:bg-[#0b0b0a] dark:text-[#f5f0e7] max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-12 space-y-8"
      >
        <div className="max-w-3xl mx-auto bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 shadow-xl p-6 sm:p-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <Check className="w-3.5 h-3.5" />
              <span>تم استلام طلبك بنجاح!</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#211d18] dark:text-[#f5f0e7]">
              شكراً لتسوقك ودعمك لحرفيي صعيد مصر
            </h1>
            <p className="text-xs sm:text-sm text-[#211d18]/70 dark:text-[#f5f0e7]/70">
              رقم الطلب الخاص بك:{' '}
              <span className="font-mono font-bold text-[#9a6a35] dark:text-[#d5a56d] text-base">
                #{completedOrder.orderNumber || completedOrder.id}
              </span>
            </p>
          </div>

          {/* Payment Status Callout */}
          {isManualTransfer && (
            <div className="p-4 rounded-[1.5rem] bg-amber-500/10 border border-amber-500/20 text-right space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <Clock className="w-4 h-4 text-amber-600 dark:text-[#d6aa72]" />
                <span>حالة الدفع: قيد مراجعة وتأكيد التحويل من الإدارة</span>
              </div>
              <p className="text-xs text-[#211d18]/80 dark:text-[#f5f0e7]/80 leading-relaxed">
                تم تسجيل طلبك وحفظ بيانات التحويل. يقوم فريق الإدارة بمطابقة الدفعة عبر{' '}
                {completedOrder.paymentMethod === 'instapay' ? 'InstaPay' : 'فودافون كاش'}{' '}
                ثم تحديث حالة الطلب لبدء تجهيز وشحن المنتجات فوراً من ورش الصعيد.
              </p>
            </div>
          )}

          {/* Specific Payment Guidance Box */}
          {completedOrder.paymentMethod === 'instapay' && (
            <div className="bg-sky-500/10 border border-sky-500/20 p-5 rounded-[1.5rem] text-right text-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>بيانات حساب إنستاباي للمنصة:</span>
                </h4>
                <button
                  type="button"
                  onClick={() => handleCopy(paymentConfig.instaPayAccount, 'instapay-success')}
                  className="px-3 py-1.5 bg-black/5 dark:bg-white/10 hover:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedKey === 'instapay-success' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'instapay-success' ? 'تم النسخ' : 'نسخ المعرف'}</span>
                </button>
              </div>
              <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5 flex items-center justify-between">
                <span className="text-[#211d18]/70 dark:text-[#f5f0e7]/70">معرف الدفع (IPA):</span>
                <strong className="font-mono text-sm text-sky-800 dark:text-sky-300 select-all" dir="ltr">
                  {paymentConfig.instaPayAccount}
                </strong>
              </div>
              <p className="text-[11px] text-[#211d18]/80 dark:text-[#f5f0e7]/80">
                المبلغ المطلوب تحويله: <strong className="font-black text-[#9a6a35] dark:text-[#d5a56d]">{completedOrder.total} ج.م</strong>.
              </p>
            </div>
          )}

          {completedOrder.paymentMethod === 'vodafone_cash' && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-[1.5rem] text-right text-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2 text-sm">
                  <Wallet className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>بيانات محفظة فودافون كاش للمنصة:</span>
                </h4>
                <button
                  type="button"
                  onClick={() => handleCopy(paymentConfig.vodafoneCashNumber, 'vodafone-success')}
                  className="px-3 py-1.5 bg-black/5 dark:bg-white/10 hover:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedKey === 'vodafone-success' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'vodafone-success' ? 'تم النسخ' : 'نسخ الرقم'}</span>
                </button>
              </div>
              <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5 flex items-center justify-between">
                <span className="text-[#211d18]/70 dark:text-[#f5f0e7]/70">رقم المحفظة المعتمد:</span>
                <strong className="font-mono text-sm text-rose-800 dark:text-rose-300 select-all" dir="ltr">
                  {paymentConfig.vodafoneCashNumber}
                </strong>
              </div>
              <p className="text-[11px] text-[#211d18]/80 dark:text-[#f5f0e7]/80">
                المبلغ المطلوب تحويله: <strong className="font-black text-[#9a6a35] dark:text-[#d5a56d]">{completedOrder.total} ج.م</strong>.
              </p>
            </div>
          )}

          {completedOrder.paymentMethod === 'cod' && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[1.5rem] text-right text-xs space-y-2">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>طريقة الدفع: نقداً عند الاستلام</span>
              </h4>
              <p className="text-xs text-[#211d18]/80 dark:text-[#f5f0e7]/80">
                المبلغ المستحق عند التسليم: <strong className="font-black text-[#9a6a35] dark:text-[#d5a56d]">{completedOrder.total} ج.م</strong>. سيقوم مندوب الشحن بالتواصل معك قبل التوصيل مع إمكانية فحص سلامة التغليف قبل السداد.
              </p>
            </div>
          )}

          {/* Order Summary Details */}
          <div className="bg-black/5 dark:bg-white/5 p-5 sm:p-6 rounded-[1.5rem] border border-black/10 dark:border-white/10 text-right space-y-3">
            <h4 className="font-bold text-xs text-[#211d18] dark:text-[#f5f0e7] border-b border-black/10 dark:border-white/10 pb-2">
              ملخص الشحنة والمنتجات:
            </h4>
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {(completedOrder.items || []).map((item, idx) => {
                const prodId = item.product?.id || (item as any).productId || `completed-item-${idx}`;
                const title = item.product?.title || (item as any).productTitle || 'منتج تراثي أصيل';
                const img =
                  item.product?.images?.[0] ||
                  (item as any).productImage ||
                  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=100&q=80';
                const sellerName = item.product?.sellerName || (item as any).sellerName || 'ورشة الصعيد';
                const price = item.product?.price || (item as any).unitPrice || 0;
                const qty = item.quantity || 1;

                return (
                  <div key={prodId} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img src={img} alt={title} className="w-11 h-11 rounded-xl object-cover border border-black/10 dark:border-white/10" />
                      <div>
                        <span className="font-bold text-[#211d18] dark:text-[#f5f0e7] block">{title}</span>
                        <span className="text-[10px] text-[#211d18]/60 dark:text-[#f5f0e7]/60">الكمية: {qty} • الورشة: {sellerName}</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#9a6a35] dark:text-[#d5a56d]">{price * qty} ج.م</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-black/10 dark:border-white/10 flex justify-between text-sm font-black text-[#211d18] dark:text-[#f5f0e7]">
              <span>إجمالي الفاتورة المطلوب:</span>
              <span className="text-[#9a6a35] dark:text-[#d5a56d] text-base font-black">{completedOrder.total} ج.م</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              id="order-track-btn"
              onClick={() => setActivePage('orders')}
              className="px-6 py-3.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-black rounded-[1.25rem] shadow-lg transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>تتبع مسار الشحنة الآن</span>
            </button>

            <button
              type="button"
              id="continue-shopping-btn"
              onClick={() => setActivePage('products')}
              className="px-6 py-3.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] border border-black/10 dark:border-white/10 text-xs font-bold rounded-[1.25rem] transition-colors cursor-pointer"
            >
              ارجع للسوق
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#eee8dc] text-[#211d18] dark:bg-[#0b0b0a] dark:text-[#f5f0e7] max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8 pb-20 sm:pb-12 space-y-6 sm:space-y-8"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#211d18]/60 dark:text-[#f5f0e7]/60 font-medium">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#9a6a35] dark:hover:text-[#d5a56d] transition-colors cursor-pointer"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 opacity-50" />
        <button
          type="button"
          onClick={() => setActivePage('cart')}
          className="hover:text-[#9a6a35] dark:hover:text-[#d5a56d] transition-colors cursor-pointer"
        >
          سلة الشراء
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180 opacity-50" />
        <span className="text-[#211d18] dark:text-[#f5f0e7] font-bold">إتمام الطلب والدفع</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            {/* Step 1: Shipping Address */}
            <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-lg space-y-5">
              <div className="flex items-center gap-3 border-b border-black/10 dark:border-white/10 pb-4">
                <div className="w-9 h-9 rounded-xl bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d] flex items-center justify-center font-black text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-black font-serif text-[#211d18] dark:text-[#f5f0e7] text-lg">عنوان الشحن والتوصيل في مصر</h3>
                  <p className="text-[11px] text-[#211d18]/60 dark:text-[#f5f0e7]/60">يرجى كتابة العنوان بدقة لضمان سرعة التوصيل</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1.5">الاسم بالكامل *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: أحمد عبد الله الهاشمي"
                    className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-[1rem] text-sm outline-none focus:border-[#9a6a35] focus:ring-2 focus:ring-[#9a6a35]/20 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1.5">رقم الهاتف للتواصل *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-[1rem] text-sm outline-none focus:border-[#9a6a35] focus:ring-2 focus:ring-[#9a6a35]/20 min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1.5">المحافظة *</label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value as Governorate)}
                    className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-[1rem] text-sm outline-none focus:border-[#9a6a35] focus:ring-2 focus:ring-[#9a6a35]/20 min-h-[44px] cursor-pointer"
                  >
                    <option value="القاهرة">القاهرة</option>
                    <option value="الجيزة">الجيزة</option>
                    <option value="الإسكندرية">الإسكندرية</option>
                    <option value="قنا">قنا</option>
                    <option value="سوهاج">سوهاج</option>
                    <option value="أسوان">أسوان</option>
                    <option value="الأقصر">الأقصر</option>
                    <option value="أسيوط">أسيوط</option>
                    <option value="المنيا">المنيا</option>
                    <option value="بني سويف">بني سويف</option>
                    <option value="الوادي الجديد">الوادي الجديد</option>
                    <option value="الفيوم">الفيوم</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1.5">المدينة / الحي / القرية *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="مثال: المعادي / نجع حمادي / أخميم"
                    className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-[1rem] text-sm outline-none focus:border-[#9a6a35] focus:ring-2 focus:ring-[#9a6a35]/20 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1.5">العنوان التفصيلي (الشارع، رقم المبنى، الشقة) *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="شارع النصر، عمارة 15، الدور الثالث، شقة 7"
                  className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-[1rem] text-sm outline-none focus:border-[#9a6a35] focus:ring-2 focus:ring-[#9a6a35]/20 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1.5">ملاحظات إضافية للتوصيل والتغليف (اختياري)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: يرجى الاتصال قبل الوصول بنصف ساعة، القطعة هدية تغليف خاص..."
                  rows={2}
                  className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-[1rem] text-sm outline-none focus:border-[#9a6a35] focus:ring-2 focus:ring-[#9a6a35]/20"
                />
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-lg space-y-5">
              <div className="flex items-center gap-3 border-b border-black/10 dark:border-white/10 pb-4">
                <div className="w-9 h-9 rounded-xl bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d] flex items-center justify-center font-black text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-black font-serif text-[#211d18] dark:text-[#f5f0e7] text-lg">طريقة الدفع المعتمدة</h3>
                  <p className="text-[11px] text-[#211d18]/60 dark:text-[#f5f0e7]/60">اختر وسيلة الدفع المناسبة لتحويل قيمة الطلب</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* 1. InstaPay */}
                <label
                  className={`p-4 rounded-[1.5rem] border flex flex-col gap-3 cursor-pointer transition-all duration-300 ${paymentMethod === 'instapay'
                      ? 'border-[#9a6a35] bg-[#9a6a35]/10 ring-2 ring-[#9a6a35]/40'
                      : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'instapay'}
                        onChange={() => setPaymentMethod('instapay')}
                        className="w-4 h-4 text-[#9a6a35] focus:ring-[#9a6a35]"
                      />
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-[#211d18] dark:text-[#f5f0e7] block">
                          تطبيق إنستاباي (InstaPay Egypt)
                        </span>
                        <span className="text-[11px] text-[#211d18]/60 dark:text-[#f5f0e7]/60">
                          تحويل لحظي مباشر عبر المعرف الرسمي (IPA) للمنصة
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/20 text-[10px] font-bold rounded-full">
                      لحظي وبدون رسوم
                    </span>
                  </div>

                  {/* Expanded details when InstaPay selected */}
                  {paymentMethod === 'instapay' && (
                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 text-xs space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between bg-sky-500/10 p-3 rounded-lg border border-sky-500/20">
                        <div>
                          <span className="text-[10px] text-sky-800 dark:text-sky-300 block font-medium">معرف إنستاباي الرسمي للمنصة:</span>
                          <span className="font-mono font-bold text-sm text-sky-950 dark:text-sky-200 select-all" dir="ltr">
                            {paymentConfig.instaPayAccount}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCopy(paymentConfig.instaPayAccount, 'instapay-account');
                          }}
                          className="px-3 py-1.5 bg-white dark:bg-[#151513] hover:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
                        >
                          {copiedKey === 'instapay-account' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'instapay-account' ? 'تم النسخ' : 'نسخ المعرف'}</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-[#211d18]/70 dark:text-[#f5f0e7]/70 space-y-1">
                        <p>1. افتح تطبيق إنستاباي وقم بتحويل مبلغ <strong className="text-[#9a6a35] dark:text-[#d5a56d] font-bold">{cartTotal} ج.م</strong> إلى المعرف الموضح أعلاه.</p>
                        <p>2. أدخل معرف حسابك أو الرقم المرجعي للتحويل بالأسفل لتسريع عملية التأكيد.</p>
                      </div>

                      <div className="pt-1">
                        <label className="block text-[11px] font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">
                          معرف حسابك في إنستاباي أو الرقم المرجعي (اختياري):
                        </label>
                        <input
                          type="text"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          placeholder="مثال: name@instapay أو الرقم المرجعي للعملية"
                          className="w-full px-3.5 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-lg text-xs outline-none focus:border-[#9a6a35]"
                        />
                      </div>
                    </div>
                  )}
                </label>

                {/* 2. Vodafone Cash */}
                <label
                  className={`p-4 rounded-[1.5rem] border flex flex-col gap-3 cursor-pointer transition-all duration-300 ${paymentMethod === 'vodafone_cash'
                      ? 'border-[#9a6a35] bg-[#9a6a35]/10 ring-2 ring-[#9a6a35]/40'
                      : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'vodafone_cash'}
                        onChange={() => setPaymentMethod('vodafone_cash')}
                        className="w-4 h-4 text-[#9a6a35] focus:ring-[#9a6a35]"
                      />
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-[#211d18] dark:text-[#f5f0e7] block">
                          محفظة فودافون كاش (Vodafone Cash)
                        </span>
                        <span className="text-[11px] text-[#211d18]/60 dark:text-[#f5f0e7]/60">
                          تحويل مباشر إلى رقم المحفظة الرسمي المعتمد للمنصة
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20 text-[10px] font-bold rounded-full">
                      المحافظ الإلكترونية
                    </span>
                  </div>

                  {/* Expanded details when Vodafone Cash selected */}
                  {paymentMethod === 'vodafone_cash' && (
                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 text-xs space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                        <div>
                          <span className="text-[10px] text-rose-800 dark:text-rose-300 block font-medium">رقم محفظة فودافون كاش للمنصة:</span>
                          <span className="font-mono font-bold text-sm text-rose-950 dark:text-rose-200 select-all" dir="ltr">
                            {paymentConfig.vodafoneCashNumber}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCopy(paymentConfig.vodafoneCashNumber, 'vodafone-number');
                          }}
                          className="px-3 py-1.5 bg-white dark:bg-[#151513] hover:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
                        >
                          {copiedKey === 'vodafone-number' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'vodafone-number' ? 'تم النسخ' : 'نسخ الرقم'}</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-[#211d18]/70 dark:text-[#f5f0e7]/70 space-y-1">
                        <p>1. قم بتحويل مبلغ <strong className="text-[#9a6a35] dark:text-[#d5a56d] font-bold">{cartTotal} ج.م</strong> إلى رقم فودافون كاش الموضح أعلاه.</p>
                        <p>2. أدخل رقم المحفظة المحول منها بالأسفل لمطابقة العملية وتأكيد الطلب فوراً.</p>
                      </div>

                      <div className="pt-1">
                        <label className="block text-[11px] font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1">
                          رقم الهاتف المحول منه أو رقم المعاملة (اختياري):
                        </label>
                        <input
                          type="text"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          placeholder="مثال: 010XXXXXXXX أو كود العملية"
                          className="w-full px-3.5 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#211d18] dark:text-[#f5f0e7] rounded-lg text-xs outline-none focus:border-[#9a6a35]"
                        />
                      </div>
                    </div>
                  )}
                </label>

                {/* 3. Cash on Delivery */}
                <label
                  className={`p-4 rounded-[1.5rem] border flex flex-col gap-2 cursor-pointer transition-all duration-300 ${paymentMethod === 'cod'
                      ? 'border-[#9a6a35] bg-[#9a6a35]/10 ring-2 ring-[#9a6a35]/40'
                      : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="w-4 h-4 text-[#9a6a35] focus:ring-[#9a6a35]"
                      />
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-[#211d18] dark:text-[#f5f0e7] block">
                          الدفع نقداً عند الاستلام (COD)
                        </span>
                        <span className="text-[11px] text-[#211d18]/60 dark:text-[#f5f0e7]/60">
                          سداد المبلغ لمندوب الشحن عند استلام وفحص الطرد
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-bold rounded-full">
                      سداد عند الباب
                    </span>
                  </div>

                  {paymentMethod === 'cod' && (
                    <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 text-xs text-[#211d18]/70 dark:text-[#f5f0e7]/70 space-y-1 animate-fadeIn">
                      <p className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                        <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>سيتم تسليم الشحنة لمندوب التوصيل وتحصيل المبلغ الإجمالي ({cartTotal} ج.م) نقداً عند باب بيتك.</span>
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Payment Assurance Note */}
              <div className="p-3.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10 text-[11px] text-[#211d18]/70 dark:text-[#f5f0e7]/70 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>كل المدفوعات والتحويلات بنراجعها بدقة عشان نضمن حقك وحق أهالينا الحرفيين في الصعيد.</span>
              </div>
            </div>

            <button
              type="submit"
              id="place-order-submit-btn"
              disabled={isSubmitting}
              className={`w-full py-4 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] font-black text-sm rounded-[1.25rem] shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer min-h-[50px] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {isSubmitting ? (
                <span>بنأكد طلبك دلوقتي...</span>
              ) : (
                <>
                  <span>أكد الطلب دلوقتي ({cartTotal} ج.م)</span>
                  <ArrowLeft className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] border border-black/10 dark:border-white/10 p-6 sm:p-7 shadow-lg space-y-5">
            <h3 className="font-black font-serif text-[#211d18] dark:text-[#f5f0e7] text-base border-b border-black/10 dark:border-white/10 pb-3">
              محتويات السلة ({cart.length} منتجات)
            </h3>

            <div className="divide-y divide-black/5 dark:divide-white/5 max-h-80 overflow-y-auto space-y-2">
              {cart.map((item, idx) => {
                const prodId = item.product?.id || `cart-item-${idx}`;
                const title = item.product?.title || 'منتج تراثي أصيل';
                const img =
                  item.product?.images?.[0] ||
                  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=100&q=80';
                const sellerGov = item.product?.sellerGovernorate || 'قنا';
                const price = item.product?.price || 0;
                const qty = item.quantity || 1;

                return (
                  <div key={prodId} className="pt-2.5 flex items-center gap-3">
                    <img
                      src={img}
                      alt={title}
                      className="w-14 h-14 rounded-xl object-cover border border-black/10 dark:border-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] truncate">{title}</h4>
                      <span className="text-[10px] text-[#211d18]/60 dark:text-[#f5f0e7]/60 block">
                        الكمية: {qty} • {sellerGov}
                      </span>
                      <span className="text-xs font-black text-[#9a6a35] dark:text-[#d5a56d] block">{price * qty} ج.م</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-2 text-xs text-[#211d18]/70 dark:text-[#f5f0e7]/70">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold text-[#211d18] dark:text-[#f5f0e7]">{cartSubtotal} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>تكلفة الشحن والتغليف:</span>
                <span className="font-bold text-[#211d18] dark:text-[#f5f0e7]">
                  {shippingFee === 0 ? 'شحن ببلاش (عرض خاص)' : `${shippingFee} ج.م`}
                </span>
              </div>
              {cartDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                  <span>الخصم المطبق ({appliedDiscount?.code}):</span>
                  <span className="font-bold">- {cartDiscountAmount} ج.م</span>
                </div>
              )}
              <div className="pt-3 border-t border-black/10 dark:border-white/10 flex justify-between text-base font-black text-[#211d18] dark:text-[#f5f0e7]">
                <span>الإجمالي المطلوب:</span>
                <span className="text-xl text-[#9a6a35] dark:text-[#d5a56d] font-black">{cartTotal} ج.م</span>
              </div>
            </div>

            <div className="p-3.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10 text-[11px] text-[#211d18]/70 dark:text-[#f5f0e7]/70 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>ضمان أصالة الصنعة وتبديل ببلاش لو حصل أي كسر وقت الشحن.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Governorate, Order } from '../../types';
import { api } from '../../services/api';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Phone,
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
    instaPayInstructions: 'قم بالتحويل عبر تطبيق إنستاباي إلى المعرف الموضح أعلاه واضغط على "تأكيد الطلب".',
    vodafoneCashInstructions: 'قم بتحويل المبلغ إلى رقم فودافون كاش الموضح أعلاه واضغط على "تأكيد الطلب".'
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
    addToast('تم النسخ بنجاح', `تم نسخ ${text} إلى الحافظة`, 'success');
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  if (cart.length === 0 && !completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#F3EFE9] dark:bg-[#26201B] text-[#B24C2B] dark:text-[#FF855D] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8 opacity-70" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-[#FAF6F2]">سلة المشتريات فارغة</h2>
        <p className="text-xs text-gray-500 dark:text-[#A89C90] max-w-sm mx-auto">
          يرجى إضافة قطع ومنتجات تراثية إلى السلة أولاً لتتمكن من إتمام عملية الشراء.
        </p>
        <button
          type="button"
          onClick={() => setActivePage('products')}
          className="px-6 py-2.5 bg-[#B24C2B] hover:bg-[#9E4F36] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors"
        >
          تصفح سوق وه الآن
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !city.trim() || !address.trim()) {
      addToast('بيانات غير مكتملة', 'يرجى ملء جميع حقول عنوان التوصيل', 'error');
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
      addToast('تعذر تأكيد الطلب', err?.message || 'يرجى مراجعة بيانات السلة والمحاولة مرة أخرى', 'error');
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-fadeIn">
        <div className="bg-white dark:bg-[#1E1917] rounded-3xl border border-[#ebdccd] dark:border-[#352B24] shadow-xl p-6 sm:p-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <Check className="w-3.5 h-3.5" />
              <span>تم استلام طلبك بنجاح!</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-[#FAF6F2] font-heritage mt-2">
              شكراً لتسوقك ودعمك لحرفيي صعيد مصر
            </h1>
            <p className="text-xs text-gray-500 dark:text-[#A89C90] mt-1">
              رقم الطلب الخاص بك:{' '}
              <span className="font-mono font-bold text-[#943310] dark:text-[#FF855D] text-sm">
                #{completedOrder.orderNumber || completedOrder.id}
              </span>
            </p>
          </div>

          {/* Payment Status Callout */}
          {isManualTransfer && (
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-right space-y-2">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>حالة الدفع: قيد مراجعة وتأكيد التحويل من الإدارة</span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
                تم تسجيل طلبك وحفظ بيانات التحويل. يقوم فريق الإدارة بمطابقة الدفعة عبر{' '}
                {completedOrder.paymentMethod === 'instapay' ? 'InstaPay' : 'فودافون كاش'}{' '}
                ثم تحديث حالة الطلب لبدء تجهيز وشحن المنتجات فوراً من ورش الصعيد.
              </p>
            </div>
          )}

          {/* Specific Payment Guidance Box */}
          {completedOrder.paymentMethod === 'instapay' && (
            <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 p-5 rounded-2xl text-right text-xs text-blue-950 dark:text-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>بيانات حساب إنستاباي للمنصة:</span>
                </h4>
                <button
                  type="button"
                  onClick={() => handleCopy(paymentConfig.instaPayAccount, 'instapay-success')}
                  className="px-2.5 py-1 bg-white dark:bg-[#201B18] hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedKey === 'instapay-success' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'instapay-success' ? 'تم النسخ' : 'نسخ المعرف'}</span>
                </button>
              </div>
              <div className="bg-white/80 dark:bg-[#110E0C] p-3 rounded-xl border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
                <span className="text-gray-600 dark:text-stone-400">معرف الدفع (IPA):</span>
                <strong className="font-mono text-sm text-blue-900 dark:text-blue-300 select-all" dir="ltr">
                  {paymentConfig.instaPayAccount}
                </strong>
              </div>
              <p className="text-[11px] text-blue-800 dark:text-blue-300">
                المبلغ المطلوب تحويله: <strong className="font-bold text-blue-950 dark:text-blue-200">{completedOrder.total} ج.م</strong>.
              </p>
            </div>
          )}

          {completedOrder.paymentMethod === 'vodafone_cash' && (
            <div className="bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 p-5 rounded-2xl text-right text-xs text-red-950 dark:text-red-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-red-900 dark:text-red-300 flex items-center gap-2 text-sm">
                  <Wallet className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>بيانات محفظة فودافون كاش للمنصة:</span>
                </h4>
                <button
                  type="button"
                  onClick={() => handleCopy(paymentConfig.vodafoneCashNumber, 'vodafone-success')}
                  className="px-2.5 py-1 bg-white dark:bg-[#201B18] hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedKey === 'vodafone-success' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'vodafone-success' ? 'تم النسخ' : 'نسخ الرقم'}</span>
                </button>
              </div>
              <div className="bg-white/80 dark:bg-[#110E0C] p-3 rounded-xl border border-red-100 dark:border-red-900/40 flex items-center justify-between">
                <span className="text-gray-600 dark:text-stone-400">رقم المحفظة المعتمد:</span>
                <strong className="font-mono text-sm text-red-900 dark:text-red-300 select-all" dir="ltr">
                  {paymentConfig.vodafoneCashNumber}
                </strong>
              </div>
              <p className="text-[11px] text-red-800 dark:text-red-300">
                المبلغ المطلوب تحويله: <strong className="font-bold text-red-950 dark:text-red-200">{completedOrder.total} ج.م</strong>.
              </p>
            </div>
          )}

          {completedOrder.paymentMethod === 'cod' && (
            <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-5 rounded-2xl text-right text-xs text-amber-950 dark:text-amber-200 space-y-2">
              <h4 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>طريقة الدفع: نقداً عند الاستلام</span>
              </h4>
              <p className="text-xs text-amber-900 dark:text-amber-200">
                المبلغ المستحق عند التسليم: <strong>{completedOrder.total} ج.م</strong>. سيقوم مندوب الشحن بالتواصل معك قبل التوصيل مع إمكانية فحص سلامة التغليف قبل السداد.
              </p>
            </div>
          )}

          {/* Order Summary Details */}
          <div className="bg-[#FAF7F2] dark:bg-[#161210] p-5 rounded-2xl border border-[#ebdccd] dark:border-[#352B24] text-right space-y-3">
            <h4 className="font-bold text-xs text-gray-900 dark:text-[#FAF6F2] border-b border-[#ebdccd] dark:border-[#352B24] pb-2">
              ملخص الشحنة والمنتجات:
            </h4>
            <div className="divide-y divide-[#f0e4d7] dark:divide-[#2C2420]">
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
                  <div key={prodId} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={img} alt={title} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <span className="font-bold text-gray-800 dark:text-[#FAF6F2] block">{title}</span>
                        <span className="text-[10px] text-gray-400 dark:text-stone-400">الكمية: {qty} • الورشة: {sellerName}</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#943310] dark:text-[#FF855D]">{price * qty} ج.م</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#ebdccd] dark:border-[#352B24] flex justify-between text-sm font-black text-gray-900 dark:text-[#FAF6F2]">
              <span>إجمالي الفاتورة المطلوب:</span>
              <span className="text-[#943310] dark:text-[#FF855D] text-base">{completedOrder.total} ج.م</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              id="order-track-btn"
              onClick={() => setActivePage('orders')}
              className="px-6 py-3 bg-[#B24C2B] hover:bg-[#9E4F36] text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>تتبع مسار الشحنة الآن</span>
            </button>

            <button
              type="button"
              id="continue-shopping-btn"
              onClick={() => setActivePage('products')}
              className="px-6 py-3 bg-white dark:bg-[#1E1917] hover:bg-[#FAF7F2] dark:hover:bg-[#26201B] text-gray-800 dark:text-[#FAF6F2] border border-[#E5DDD3] dark:border-[#352B24] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              العودة للتسوق
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#73675B] dark:text-[#A89C90]">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#B24C2B] dark:hover:text-[#FF855D] transition-colors cursor-pointer"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="text-gray-900 dark:text-[#FAF6F2] font-bold">إتمام الشراء والدفع</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            {/* Step 1: Shipping Address */}
            <div className="bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E5DDD3] dark:border-[#352B24] p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#F0EAE1] dark:border-[#2C2420] pb-3">
                <div className="w-8 h-8 rounded-xl bg-[#B24C2B]/10 text-[#B24C2B] dark:text-[#FF855D] flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="font-bold text-gray-900 dark:text-[#FAF6F2] text-base">عنوان الشحن والتوصيل في مصر</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-[#FAF6F2] mb-1">الاسم بالكامل *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: أحمد عبد الله الهاشمي"
                    className="w-full px-3.5 py-3 bg-[#FAF7F2] dark:bg-[#110E0C] border border-[#E5DDD3] dark:border-[#352B24] text-gray-900 dark:text-[#FAF6F2] rounded-xl text-sm outline-none focus:border-[#B24C2B] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-[#FAF6F2] mb-1">رقم الهاتف للتواصل *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full px-3.5 py-3 bg-[#FAF7F2] dark:bg-[#110E0C] border border-[#E5DDD3] dark:border-[#352B24] text-gray-900 dark:text-[#FAF6F2] rounded-xl text-sm outline-none focus:border-[#B24C2B] min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-[#FAF6F2] mb-1">المحافظة *</label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value as Governorate)}
                    className="w-full px-3.5 py-3 bg-[#FAF7F2] dark:bg-[#110E0C] border border-[#E5DDD3] dark:border-[#352B24] text-gray-900 dark:text-[#FAF6F2] rounded-xl text-sm outline-none focus:border-[#B24C2B] min-h-[44px] cursor-pointer"
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
                  <label className="block text-xs font-bold text-gray-700 dark:text-[#FAF6F2] mb-1">المدينة / الحي / القرية *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="مثال: المعادي / نجع حمادي / أخميم"
                    className="w-full px-3.5 py-3 bg-[#FAF7F2] dark:bg-[#110E0C] border border-[#E5DDD3] dark:border-[#352B24] text-gray-900 dark:text-[#FAF6F2] rounded-xl text-sm outline-none focus:border-[#B24C2B] min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-[#FAF6F2] mb-1">العنوان التفصيلي (الشارع، رقم المبنى، الشقة) *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="شارع النصر، عمارة 15، الدور الثالث، شقة 7"
                  className="w-full px-3.5 py-3 bg-[#FAF7F2] dark:bg-[#110E0C] border border-[#E5DDD3] dark:border-[#352B24] text-gray-900 dark:text-[#FAF6F2] rounded-xl text-sm outline-none focus:border-[#B24C2B] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-[#FAF6F2] mb-1">ملاحظات إضافية للتوصيل والتغليف (اختياري)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: يرجى الاتصال قبل الوصول بنصف ساعة، القطعة هدية تغليف خاص..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#110E0C] border border-[#E5DDD3] dark:border-[#352B24] text-gray-900 dark:text-[#FAF6F2] rounded-xl text-xs outline-none focus:border-[#B24C2B]"
                />
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E5DDD3] dark:border-[#352B24] p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 border-b border-[#F0EAE1] dark:border-[#2C2420] pb-3">
                <div className="w-8 h-8 rounded-xl bg-[#B24C2B]/10 text-[#B24C2B] dark:text-[#FF855D] flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-[#FAF6F2] text-base">طريقة الدفع المعتمدة</h3>
                  <p className="text-[11px] text-gray-500 dark:text-[#A89C90]">اختر وسيلة الدفع المناسبة لتحويل قيمة الطلب</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* 1. InstaPay */}
                <label
                  className={`p-4 rounded-2xl border flex flex-col gap-3 cursor-pointer transition-all ${paymentMethod === 'instapay'
                      ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-600'
                      : 'border-[#E5DDD3] dark:border-[#352B24] bg-white dark:bg-[#1E1917] hover:bg-[#FAF7F2] dark:hover:bg-[#26201B]'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'instapay'}
                        onChange={() => setPaymentMethod('instapay')}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-[#FAF6F2] block">
                          تطبيق إنستاباي (InstaPay Egypt)
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-[#A89C90]">
                          تحويل لحظي مباشر عبر المعرف الرسمي (IPA) للمنصة
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold rounded-full">
                      لحظي وبدون رسوم
                    </span>
                  </div>

                  {/* Expanded details when InstaPay selected */}
                  {paymentMethod === 'instapay' && (
                    <div className="p-3.5 bg-white dark:bg-[#110E0C] rounded-xl border border-blue-200 dark:border-blue-900/50 text-xs space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between bg-blue-50/70 dark:bg-blue-950/40 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/40">
                        <div>
                          <span className="text-[10px] text-blue-800 dark:text-blue-300 block font-medium">معرف إنستاباي الرسمي للمنصة:</span>
                          <span className="font-mono font-bold text-sm text-blue-950 dark:text-blue-100 select-all" dir="ltr">
                            {paymentConfig.instaPayAccount}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCopy(paymentConfig.instaPayAccount, 'instapay-account');
                          }}
                          className="px-2.5 py-1.5 bg-white dark:bg-[#201B18] hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer min-h-[36px]"
                        >
                          {copiedKey === 'instapay-account' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'instapay-account' ? 'تم النسخ' : 'نسخ المعرف'}</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-gray-600 dark:text-[#A89C90] space-y-1">
                        <p>1. افتح تطبيق إنستاباي وقم بتحويل مبلغ <strong className="text-[#B24C2B] dark:text-[#FF855D] font-bold">{cartTotal} ج.م</strong> إلى المعرف الموضح أعلاه.</p>
                        <p>2. أدخل معرف حسابك أو الرقم المرجعي للتحويل بالأسفل لتسريع عملية التأكيد.</p>
                      </div>

                      <div className="pt-1">
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-[#FAF6F2] mb-1">
                          معرف حسابك في إنستاباي أو الرقم المرجعي (اختياري):
                        </label>
                        <input
                          type="text"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          placeholder="مثال: name@instapay أو الرقم المرجعي للعملية"
                          className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#1C1816] border border-[#E5DDD3] dark:border-[#352B24] text-gray-900 dark:text-[#FAF6F2] rounded-lg text-xs outline-none focus:border-[#B24C2B]"
                        />
                      </div>
                    </div>
                  )}
                </label>

                {/* 2. Vodafone Cash */}
                <label
                  className={`p-4 rounded-2xl border flex flex-col gap-3 cursor-pointer transition-all ${paymentMethod === 'vodafone_cash'
                      ? 'border-red-600 bg-red-50/40 dark:bg-red-950/30 ring-1 ring-red-600'
                      : 'border-[#E5DDD3] dark:border-[#352B24] bg-white dark:bg-[#1E1917] hover:bg-[#FAF7F2] dark:hover:bg-[#26201B]'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'vodafone_cash'}
                        onChange={() => setPaymentMethod('vodafone_cash')}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-[#FAF6F2] block">
                          محفظة فودافون كاش (Vodafone Cash)
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-[#A89C90]">
                          تحويل مباشر إلى رقم المحفظة الرسمي المعتمد للمنصة
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-[10px] font-bold rounded-full">
                      المحافظ الإلكترونية
                    </span>
                  </div>

                  {/* Expanded details when Vodafone Cash selected */}
                  {paymentMethod === 'vodafone_cash' && (
                    <div className="p-3.5 bg-white dark:bg-[#110E0C] rounded-xl border border-red-200 dark:border-red-900/50 text-xs space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between bg-red-50/70 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-100 dark:border-red-900/40">
                        <div>
                          <span className="text-[10px] text-red-800 dark:text-red-300 block font-medium">رقم محفظة فودافون كاش للمنصة:</span>
                          <span className="font-mono font-bold text-sm text-red-950 dark:text-red-100 select-all" dir="ltr">
                            {paymentConfig.vodafoneCashNumber}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCopy(paymentConfig.vodafoneCashNumber, 'vodafone-number');
                          }}
                          className="px-2.5 py-1.5 bg-white dark:bg-[#201B18] hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer min-h-[36px]"
                        >
                          {copiedKey === 'vodafone-number' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'vodafone-number' ? 'تم النسخ' : 'نسخ الرقم'}</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-gray-600 dark:text-[#A89C90] space-y-1">
                        <p>1. قم بتحويل مبلغ <strong className="text-[#B24C2B] dark:text-[#FF855D] font-bold">{cartTotal} ج.م</strong> إلى رقم فودافون كاش الموضح أعلاه.</p>
                        <p>2. أدخل رقم المحفظة المحول منها بالأسفل لمطابقة العملية وتأكيد الطلب فوراً.</p>
                      </div>

                      <div className="pt-1">
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-[#FAF6F2] mb-1">
                          رقم الهاتف المحول منه أو رقم المعاملة (اختياري):
                        </label>
                        <input
                          type="text"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          placeholder="مثال: 010XXXXXXXX أو كود العملية"
                          className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#1C1816] border border-[#E5DDD3] dark:border-[#352B24] text-gray-900 dark:text-[#FAF6F2] rounded-lg text-xs outline-none focus:border-[#B24C2B]"
                        />
                      </div>
                    </div>
                  )}
                </label>

                {/* 3. Cash on Delivery */}
                <label
                  className={`p-4 rounded-2xl border flex flex-col gap-2 cursor-pointer transition-all ${paymentMethod === 'cod'
                      ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 ring-1 ring-emerald-600'
                      : 'border-[#E5DDD3] dark:border-[#352B24] bg-white dark:bg-[#1E1917] hover:bg-[#FAF7F2] dark:hover:bg-[#26201B]'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-[#FAF6F2] block">
                          الدفع نقداً عند الاستلام (COD)
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-[#A89C90]">
                          سداد المبلغ لمندوب الشحن عند استلام وفحص الطرد
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                      سداد عند الباب
                    </span>
                  </div>

                  {paymentMethod === 'cod' && (
                    <div className="p-3 bg-white dark:bg-[#110E0C] rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-xs text-gray-600 dark:text-[#A89C90] space-y-1 animate-fadeIn">
                      <p className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
                        <Info className="w-3.5 h-3.5 text-emerald-600" />
                        <span>سيتم تسليم الشحنة لمندوب التوصيل وتحصيل المبلغ الإجمالي ({cartTotal} ج.م) نقداً عند باب بيتك.</span>
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Payment Assurance Note */}
              <div className="p-3 bg-[#FAF7F2] dark:bg-[#110E0C] rounded-xl border border-[#E5DDD3] dark:border-[#352B24] text-[11px] text-[#73675B] dark:text-[#A89C90] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>جميع المدفوعات والتحويلات يتم مراجعتها وتوثيقها بدقة لضمان حقوقك وحقوق الحرفيين في صعيد مصر.</span>
              </div>
            </div>

            <button
              type="submit"
              id="place-order-submit-btn"
              disabled={isSubmitting}
              className={`w-full py-4 bg-[#B24C2B] hover:bg-[#9E4F36] text-white font-black text-sm rounded-2xl shadow-xl shadow-[#B24C2B]/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer min-h-[48px] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {isSubmitting ? (
                <span>جاري معالجة وتأكيد الطلب...</span>
              ) : (
                <>
                  <span>تأكيد الطلب الآن ({cartTotal} ج.م)</span>
                  <ArrowLeft className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#1E1917] rounded-3xl border border-[#E5DDD3] dark:border-[#352B24] p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-[#FAF6F2] text-base border-b border-[#F0EAE1] dark:border-[#2C2420] pb-3">
              محتويات السلة ({cart.length} منتجات)
            </h3>

            <div className="divide-y divide-[#F0EAE1] dark:divide-[#2C2420] max-h-80 overflow-y-auto space-y-2">
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
                  <div key={prodId} className="pt-2 flex items-center gap-3">
                    <img
                      src={img}
                      alt={title}
                      className="w-14 h-14 rounded-xl object-cover border border-[#E5DDD3] dark:border-[#352B24] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-[#FAF6F2] truncate">{title}</h4>
                      <span className="text-[10px] text-[#73675B] dark:text-[#A89C90] block">
                        الكمية: {qty} • {sellerGov}
                      </span>
                      <span className="text-xs font-black text-[#B24C2B] dark:text-[#FF855D] block">{price * qty} ج.م</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-[#F0EAE1] dark:border-[#2C2420] space-y-2 text-xs text-gray-600 dark:text-[#B8ACA0]">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold text-gray-900 dark:text-[#FAF6F2]">{cartSubtotal} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>تكلفة الشحن والتغليف:</span>
                <span className="font-bold text-gray-900 dark:text-[#FAF6F2]">
                  {shippingFee === 0 ? 'مجاني (عرض خاص)' : `${shippingFee} ج.م`}
                </span>
              </div>
              {cartDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                  <span>الخصم المطبق ({appliedDiscount?.code}):</span>
                  <span className="font-bold">- {cartDiscountAmount} ج.م</span>
                </div>
              )}
              <div className="pt-3 border-t border-[#E5DDD3] dark:border-[#352B24] flex justify-between text-base font-black text-gray-900 dark:text-[#FAF6F2]">
                <span>الإجمالي المطلوب:</span>
                <span className="text-xl text-[#B24C2B] dark:text-[#FF855D]">{cartTotal} ج.م</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF7F2] dark:bg-[#110E0C] rounded-xl border border-[#E5DDD3] dark:border-[#352B24] text-[11px] text-[#73675B] dark:text-[#A89C90] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>ضمان أصالة الحرفة واستبدال مجاني في حال حدوث أي كسر أثناء الشحن.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

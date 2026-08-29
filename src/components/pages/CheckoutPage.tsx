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
        <div className="w-16 h-16 rounded-full bg-[#f3ebd9] text-[#943310] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8 opacity-70" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">سلة المشتريات فارغة</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          يرجى إضافة قطع ومنتجات تراثية إلى السلة أولاً لتتمكن من إتمام عملية الشراء.
        </p>
        <button
          type="button"
          onClick={() => setActivePage('products')}
          className="px-6 py-2.5 bg-[#943310] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer hover:bg-[#7c280a] transition-colors"
        >
          تصفح سوق الصعيد الآن
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
        <div className="bg-white rounded-3xl border border-[#ebdccd] shadow-xl p-6 sm:p-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              <span>تم استلام طلبك بنجاح!</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-heritage mt-2">
              شكراً لتسوقك ودعمك لحرفيي صعيد مصر
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              رقم الطلب الخاص بك:{' '}
              <span className="font-mono font-bold text-[#943310] text-sm">
                #{completedOrder.orderNumber || completedOrder.id}
              </span>
            </p>
          </div>

          {/* Payment Status Callout */}
          {isManualTransfer && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-right space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>حالة الدفع: قيد مراجعة وتأكيد التحويل من الإدارة</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                تم تسجيل طلبك وحفظ بيانات التحويل. يقوم فريق الإدارة بمطابقة الدفعة عبر{' '}
                {completedOrder.paymentMethod === 'instapay' ? 'InstaPay' : 'فودافون كاش'}{' '}
                ثم تحديث حالة الطلب لبدء تجهيز وشحن المنتجات فوراً من ورش الصعيد.
              </p>
            </div>
          )}

          {/* Specific Payment Guidance Box */}
          {completedOrder.paymentMethod === 'instapay' && (
            <div className="bg-blue-50/80 border border-blue-200 p-5 rounded-2xl text-right text-xs text-blue-950 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-blue-900 flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>بيانات حساب إنستاباي للمنصة:</span>
                </h4>
                <button
                  type="button"
                  onClick={() => handleCopy(paymentConfig.instaPayAccount, 'instapay-success')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedKey === 'instapay-success' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'instapay-success' ? 'تم النسخ' : 'نسخ المعرف'}</span>
                </button>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-blue-100 flex items-center justify-between">
                <span className="text-gray-600">معرف الدفع (IPA):</span>
                <strong className="font-mono text-sm text-blue-900 select-all" dir="ltr">
                  {paymentConfig.instaPayAccount}
                </strong>
              </div>
              <p className="text-[11px] text-blue-800">
                المبلغ المطلوب تحويله: <strong className="font-bold text-blue-950">{completedOrder.total} ج.م</strong>.
              </p>
            </div>
          )}

          {completedOrder.paymentMethod === 'vodafone_cash' && (
            <div className="bg-red-50/80 border border-red-200 p-5 rounded-2xl text-right text-xs text-red-950 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-red-900 flex items-center gap-2 text-sm">
                  <Wallet className="w-4 h-4 text-red-600" />
                  <span>بيانات محفظة فودافون كاش للمنصة:</span>
                </h4>
                <button
                  type="button"
                  onClick={() => handleCopy(paymentConfig.vodafoneCashNumber, 'vodafone-success')}
                  className="px-2.5 py-1 bg-white hover:bg-red-100 text-red-700 border border-red-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedKey === 'vodafone-success' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'vodafone-success' ? 'تم النسخ' : 'نسخ الرقم'}</span>
                </button>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-red-100 flex items-center justify-between">
                <span className="text-gray-600">رقم المحفظة المعتمد:</span>
                <strong className="font-mono text-sm text-red-900 select-all" dir="ltr">
                  {paymentConfig.vodafoneCashNumber}
                </strong>
              </div>
              <p className="text-[11px] text-red-800">
                المبلغ المطلوب تحويله: <strong className="font-bold text-red-950">{completedOrder.total} ج.م</strong>.
              </p>
            </div>
          )}

          {completedOrder.paymentMethod === 'cod' && (
            <div className="bg-amber-50/80 border border-amber-200 p-5 rounded-2xl text-right text-xs text-amber-950 space-y-2">
              <h4 className="font-bold text-amber-900 flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-amber-700" />
                <span>طريقة الدفع: نقداً عند الاستلام</span>
              </h4>
              <p className="text-xs text-amber-900">
                المبلغ المستحق عند التسليم: <strong>{completedOrder.total} ج.م</strong>. سيقوم مندوب الشحن بالتواصل معك قبل التوصيل مع إمكانية فحص سلامة التغليف قبل السداد.
              </p>
            </div>
          )}

          {/* Order Summary Details */}
          <div className="bg-[#faf6f0] p-5 rounded-2xl border border-[#ebdccd] text-right space-y-3">
            <h4 className="font-bold text-xs text-gray-900 border-b border-[#ebdccd] pb-2">
              ملخص الشحنة والمنتجات:
            </h4>
            <div className="divide-y divide-[#f0e4d7]">
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
                        <span className="font-bold text-gray-800 block">{title}</span>
                        <span className="text-[10px] text-gray-400">الكمية: {qty} • الورشة: {sellerName}</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#943310]">{price * qty} ج.م</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#ebdccd] flex justify-between text-sm font-black text-gray-900">
              <span>إجمالي الفاتورة المطلوب:</span>
              <span className="text-[#943310] text-base">{completedOrder.total} ج.م</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              id="order-track-btn"
              onClick={() => setActivePage('orders')}
              className="px-6 py-3 bg-[#943310] hover:bg-[#7c280a] text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>تتبع مسار الشحنة الآن</span>
            </button>

            <button
              type="button"
              id="continue-shopping-btn"
              onClick={() => setActivePage('products')}
              className="px-6 py-3 bg-white hover:bg-[#faf6f0] text-gray-800 border border-[#ebdccd] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
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
      <nav className="flex items-center gap-2 text-xs text-[#8c6b53]">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#943310] transition-colors cursor-pointer"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="text-gray-900 font-bold">إتمام الشراء والدفع</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            {/* Step 1: Shipping Address */}
            <div className="bg-white rounded-3xl border border-[#ebdccd] p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#f0e4d7] pb-3">
                <div className="w-8 h-8 rounded-xl bg-[#943310]/10 text-[#943310] flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="font-bold text-gray-900 text-base">عنوان الشحن والتوصيل في مصر</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الاسم بالكامل *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: أحمد عبد الله الهاشمي"
                    className="w-full px-3.5 py-3 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">رقم الهاتف للتواصل *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full px-3.5 py-3 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310] min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">المحافظة *</label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value as Governorate)}
                    className="w-full px-3.5 py-3 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310] min-h-[44px] cursor-pointer"
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">المدينة / الحي / القرية *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="مثال: المعادي / نجع حمادي / أخميم"
                    className="w-full px-3.5 py-3 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310] min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">العنوان التفصيلي (الشارع، رقم المبنى، الشقة) *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="شارع النصر، عمارة 15، الدور الثالث، شقة 7"
                  className="w-full px-3.5 py-2.5 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-xs outline-none focus:border-[#943310]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات إضافية للتوصيل والتغليف (اختياري)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: يرجى الاتصال قبل الوصول بنصف ساعة، القطعة هدية تغليف خاص..."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-xs outline-none focus:border-[#943310]"
                />
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white rounded-3xl border border-[#ebdccd] p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 border-b border-[#f0e4d7] pb-3">
                <div className="w-8 h-8 rounded-xl bg-[#943310]/10 text-[#943310] flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">طريقة الدفع المعتمدة</h3>
                  <p className="text-[11px] text-gray-500">اختر وسيلة الدفع المناسبة لتحويل قيمة الطلب</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* 1. InstaPay */}
                <label
                  className={`p-4 rounded-2xl border flex flex-col gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'instapay'
                      ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                      : 'border-[#ebdccd] bg-white hover:bg-[#faf6f0]'
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
                        <span className="font-bold text-xs sm:text-sm text-gray-900 block">
                          تطبيق إنستاباي (InstaPay Egypt)
                        </span>
                        <span className="text-[11px] text-gray-500">
                          تحويل لحظي مباشر عبر المعرف الرسمي (IPA) للمنصة
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                      لحظي وبدون رسوم
                    </span>
                  </div>

                  {/* Expanded details when InstaPay selected */}
                  {paymentMethod === 'instapay' && (
                    <div className="p-3.5 bg-white rounded-xl border border-blue-200 text-xs space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between bg-blue-50/70 p-2.5 rounded-lg border border-blue-100">
                        <div>
                          <span className="text-[10px] text-blue-800 block font-medium">معرف إنستاباي الرسمي للمنصة:</span>
                          <span className="font-mono font-bold text-sm text-blue-950 select-all" dir="ltr">
                            {paymentConfig.instaPayAccount}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCopy(paymentConfig.instaPayAccount, 'instapay-account');
                          }}
                          className="px-2.5 py-1.5 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedKey === 'instapay-account' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'instapay-account' ? 'تم النسخ' : 'نسخ المعرف'}</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-gray-600 space-y-1">
                        <p>1. افتح تطبيق إنستاباي وقم بتحويل مبلغ <strong className="text-[#943310] font-bold">{cartTotal} ج.م</strong> إلى المعرف الموضح أعلاه.</p>
                        <p>2. أدخل معرف حسابك أو الرقم المرجعي للتحويل بالأسفل لتسريع عملية التأكيد.</p>
                      </div>

                      <div className="pt-1">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          معرف حسابك في إنستاباي أو الرقم المرجعي (اختياري):
                        </label>
                        <input
                          type="text"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          placeholder="مثال: name@instapay أو الرقم المرجعي للعملية"
                          className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfcebe] rounded-lg text-xs outline-none focus:border-[#943310]"
                        />
                      </div>
                    </div>
                  )}
                </label>

                {/* 2. Vodafone Cash */}
                <label
                  className={`p-4 rounded-2xl border flex flex-col gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'vodafone_cash'
                      ? 'border-red-600 bg-red-50/40 ring-1 ring-red-600'
                      : 'border-[#ebdccd] bg-white hover:bg-[#faf6f0]'
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
                        <span className="font-bold text-xs sm:text-sm text-gray-900 block">
                          محفظة فودافون كاش (Vodafone Cash)
                        </span>
                        <span className="text-[11px] text-gray-500">
                          تحويل مباشر إلى رقم المحفظة الرسمي المعتمد للمنصة
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-full">
                      المحافظ الإلكترونية
                    </span>
                  </div>

                  {/* Expanded details when Vodafone Cash selected */}
                  {paymentMethod === 'vodafone_cash' && (
                    <div className="p-3.5 bg-white rounded-xl border border-red-200 text-xs space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between bg-red-50/70 p-2.5 rounded-lg border border-red-100">
                        <div>
                          <span className="text-[10px] text-red-800 block font-medium">رقم محفظة فودافون كاش للمنصة:</span>
                          <span className="font-mono font-bold text-sm text-red-950 select-all" dir="ltr">
                            {paymentConfig.vodafoneCashNumber}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCopy(paymentConfig.vodafoneCashNumber, 'vodafone-number');
                          }}
                          className="px-2.5 py-1.5 bg-white hover:bg-red-100 text-red-700 border border-red-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedKey === 'vodafone-number' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'vodafone-number' ? 'تم النسخ' : 'نسخ الرقم'}</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-gray-600 space-y-1">
                        <p>1. قم بتحويل مبلغ <strong className="text-[#943310] font-bold">{cartTotal} ج.م</strong> إلى رقم فودافون كاش الموضح أعلاه.</p>
                        <p>2. أدخل رقم المحفظة المحول منها بالأسفل لمطابقة العملية وتأكيد الطلب فوراً.</p>
                      </div>

                      <div className="pt-1">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          رقم الهاتف المحول منه أو رقم المعاملة (اختياري):
                        </label>
                        <input
                          type="text"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          placeholder="مثال: 010XXXXXXXX أو كود العملية"
                          className="w-full px-3 py-2 bg-[#faf6f0] border border-[#dfcebe] rounded-lg text-xs outline-none focus:border-[#943310]"
                        />
                      </div>
                    </div>
                  )}
                </label>

                {/* 3. Cash on Delivery */}
                <label
                  className={`p-4 rounded-2xl border flex flex-col gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                      : 'border-[#ebdccd] bg-white hover:bg-[#faf6f0]'
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
                        <span className="font-bold text-xs sm:text-sm text-gray-900 block">
                          الدفع نقداً عند الاستلام (COD)
                        </span>
                        <span className="text-[11px] text-gray-500">
                          سداد المبلغ لمندوب الشحن عند استلام وفحص الطرد
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      سداد عند الباب
                    </span>
                  </div>

                  {paymentMethod === 'cod' && (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-gray-600 space-y-1 animate-fadeIn">
                      <p className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px]">
                        <Info className="w-3.5 h-3.5 text-emerald-600" />
                        <span>سيتم تسليم الشحنة لمندوب التوصيل وتحصيل المبلغ الإجمالي ({cartTotal} ج.م) نقداً عند باب بيتك.</span>
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Payment Assurance Note */}
              <div className="p-3 bg-[#faf6f0] rounded-xl border border-[#ebdccd] text-[11px] text-[#8c6b53] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>جميع المدفوعات والتحويلات يتم مراجعتها وتوثيقها بدقة لضمان حقوقك وحقوق الحرفيين في صعيد مصر.</span>
              </div>
            </div>

            <button
              type="submit"
              id="place-order-submit-btn"
              disabled={isSubmitting}
              className={`w-full py-4 bg-[#943310] hover:bg-[#7c280a] text-white font-black text-sm rounded-2xl shadow-xl shadow-amber-950/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
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
          <div className="bg-white rounded-3xl border border-[#ebdccd] p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 text-base border-b border-[#f0e4d7] pb-3">
              محتويات السلة ({cart.length} منتجات)
            </h3>

            <div className="divide-y divide-[#f0e4d7] max-h-80 overflow-y-auto space-y-2">
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
                      className="w-14 h-14 rounded-xl object-cover border border-amber-900/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{title}</h4>
                      <span className="text-[10px] text-[#8c6b53] block">
                        الكمية: {qty} • {sellerGov}
                      </span>
                      <span className="text-xs font-black text-[#943310] block">{price * qty} ج.م</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-[#f0e4d7] space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold text-gray-900">{cartSubtotal} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>تكلفة الشحن والتغليف:</span>
                <span className="font-bold text-gray-900">
                  {shippingFee === 0 ? 'مجاني (عرض خاص)' : `${shippingFee} ج.م`}
                </span>
              </div>
              {cartDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>الخصم المطبق ({appliedDiscount?.code}):</span>
                  <span className="font-bold">- {cartDiscountAmount} ج.م</span>
                </div>
              )}
              <div className="pt-3 border-t border-[#ebdccd] flex justify-between text-base font-black text-gray-900">
                <span>الإجمالي المطلوب:</span>
                <span className="text-xl text-[#943310]">{cartTotal} ج.م</span>
              </div>
            </div>

            <div className="p-3 bg-[#faf6f0] rounded-xl border border-[#ebdccd] text-[11px] text-[#8c6b53] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>ضمان أصالة الحرفة واستبدال مجاني في حال حدوث أي كسر أثناء الشحن.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

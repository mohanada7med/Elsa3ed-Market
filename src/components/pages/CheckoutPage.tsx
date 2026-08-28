import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Governorate, Order } from '../../types';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  ShoppingBag,
  Tag,
  AlertCircle,
  FileText
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vodafone_cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success state
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

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
          className="px-6 py-2.5 bg-[#943310] text-white text-xs font-bold rounded-xl shadow-md"
        >
          تصفح سوق الصعيد الآن
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !city || !address) {
      addToast('بيانات غير مكتملة', 'يرجى ملء جميع حقول عنوان التوصيل', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newOrder = await createOrder({
        buyerName: fullName,
        buyerPhone: phone,
        governorate,
        city,
        addressText: address,
        notes,
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
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="bg-white rounded-3xl border border-[#ebdccd] shadow-xl p-6 sm:p-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              تم تأكيد الطلب بنجاح!
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-heritage mt-2">
              شكراً لتسوقك ودعمك لحرفيي صعيد مصر
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              رقم الطلب الخاص بك:{' '}
              <span className="font-mono font-bold text-[#943310] text-sm">{completedOrder.id}</span>
            </p>
          </div>

          {/* Payment Guidance Box */}
          {completedOrder.paymentMethod === 'vodafone_cash' && (
            <div className="bg-red-50/80 border border-red-200 p-4 rounded-2xl text-right text-xs text-red-950 space-y-1.5">
              <h4 className="font-bold text-red-900 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-red-600" />
                <span>تعليمات التحويل عبر فودافون كاش:</span>
              </h4>
              <p>يرجى تحويل مبلغ <strong>{completedOrder.total} ج.م</strong> إلى الرقم المعتمد: <strong dir="ltr">0100 000 8822</strong></p>
              <p className="text-[11px] text-red-800">أرسل لقطة شاشة بالتحويل ورقم الطلب ({completedOrder.id}) على واتساب خدمة العملاء لتأكيد الشحن فوراً.</p>
            </div>
          )}

          {completedOrder.paymentMethod === 'instapay' && (
            <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-2xl text-right text-xs text-blue-950 space-y-1.5">
              <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>تعليمات الدفع عبر InstaPay:</span>
              </h4>
              <p>حول مبلغ <strong>{completedOrder.total} ج.م</strong> إلى المعرف (IPA): <strong className="font-mono">elsa3ed@instapay</strong></p>
              <p className="text-[11px] text-blue-800">سيتم ربط التحويل تلقائياً برقم طلبك وشحن الطرد خلال 48 ساعة.</p>
            </div>
          )}

          {completedOrder.paymentMethod === 'cod' && (
            <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl text-right text-xs text-amber-950 space-y-1.5">
              <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-700" />
                <span>الدفع نقداً عند الاستلام:</span>
              </h4>
              <p>سيقوم مندوب الشحن بالتواصل معك قبل التوصيل. المبلغ المطلوب عند الاستلام: <strong>{completedOrder.total} ج.م</strong> مع إمكانية فحص سلامة التغليف قبل الدفع.</p>
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
                const img = item.product?.images?.[0] || (item as any).productImage || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=100&q=80';
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
              <span>إجمالي الفاتورة المدفوع:</span>
              <span className="text-[#943310]">{completedOrder.total} ج.م</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              id="order-track-btn"
              onClick={() => setActivePage('orders')}
              className="px-6 py-3 bg-[#943310] hover:bg-[#7c280a] text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>تتبع مسار الشحنة الآن</span>
            </button>

            <button
              type="button"
              id="continue-shopping-btn"
              onClick={() => setActivePage('products')}
              className="px-6 py-3 bg-white hover:bg-[#faf6f0] text-gray-800 border border-[#ebdccd] text-xs font-bold rounded-xl shadow-xs transition-colors"
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
          className="hover:text-[#943310] transition-colors"
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">الاسم بالكامل</label>
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">رقم الهاتف للتواصل</label>
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">المحافظة</label>
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
                    <option value="الشرقية">الشرقية</option>
                    <option value="الدقهلية">الدقهلية</option>
                    <option value="البحيرة">البحيرة</option>
                    <option value="الغربية">الغربية</option>
                    <option value="المنوفية">المنوفية</option>
                    <option value="القليوبية">القليوبية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">المدينة / الحي / القرية</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="مثال: المعادي الجديدة / نجع حمادي"
                    className="w-full px-3.5 py-3 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310] min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">العنوان التفصيلي (الشارع، رقم المبنى، الشقة)</label>
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
            <div className="bg-white rounded-3xl border border-[#ebdccd] p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#f0e4d7] pb-3">
                <div className="w-8 h-8 rounded-xl bg-[#943310]/10 text-[#943310] flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="font-bold text-gray-900 text-base">طريقة الدفع المعتمدة</h3>
              </div>

              <div className="space-y-3">
                {/* Vodafone Cash */}
                <label
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'vodafone_cash'
                      ? 'border-red-600 bg-red-50/50 ring-1 ring-red-600'
                      : 'border-[#ebdccd] bg-white hover:bg-[#faf6f0]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'vodafone_cash'}
                      onChange={() => setPaymentMethod('vodafone_cash')}
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">
                        محفظة فودافون كاش (Vodafone Cash)
                      </span>
                      <span className="text-[11px] text-gray-500">
                        تحويل فوري لرقم الحساب المعتمد بعد إتمام الطلب
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">
                    شائع ومفضل
                  </span>
                </label>

                {/* InstaPay */}
                <label
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'instapay'
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                      : 'border-[#ebdccd] bg-white hover:bg-[#faf6f0]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'instapay'}
                      onChange={() => setPaymentMethod('instapay')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">
                        تطبيق إنستاباي (InstaPay Egypt)
                      </span>
                      <span className="text-[11px] text-gray-500">
                        تحويل بنكي لحظي عبر المعرف الرسمي (IPA)
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
                    تحويل لحظي
                  </span>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                      : 'border-[#ebdccd] bg-white hover:bg-[#faf6f0]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">
                        الدفع نقداً عند الاستلام (COD)
                      </span>
                      <span className="text-[11px] text-gray-500">
                        ادفع عند باب بيتك بعد معاينة سلامة الطرد والتغليف
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">
                    ثقة وأمان
                  </span>
                </label>

                {/* Card / Meeza */}
                <label
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'credit_card'
                      ? 'border-[#943310] bg-amber-50/50 ring-1 ring-[#943310]'
                      : 'border-[#ebdccd] bg-white hover:bg-[#faf6f0]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'credit_card'}
                      onChange={() => setPaymentMethod('credit_card')}
                      className="w-4 h-4 text-[#943310] focus:ring-[#943310]"
                    />
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">
                        بطاقة بنكية / بطاقة ميزة الوطنية (Meeza)
                      </span>
                      <span className="text-[11px] text-gray-500">
                        خصم آمن ومشفر 100% عبر بوابات البنك المركزي المصري
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded">
                    ميزة / Visa
                  </span>
                </label>

                {(paymentMethod === 'vodafone_cash' || paymentMethod === 'instapay') && (
                  <div className="pt-2 animate-fadeIn">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {paymentMethod === 'vodafone_cash'
                        ? 'رقم هاتف المحفظة المحول منها أو رقم العملية (اختياري لتسريع التأكيد):'
                        : 'معرف الحساب المحول منه أو الرقم المرجعي للتحويل (اختياري):'}
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder={paymentMethod === 'vodafone_cash' ? 'مثال: 010XXXXXXXX أو كود العملية' : 'مثال: username@instapay أو الرقم المرجعي'}
                      className="w-full px-3.5 py-2.5 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-xs outline-none focus:border-[#943310]"
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              id="place-order-submit-btn"
              disabled={isSubmitting}
              className={`w-full py-4 bg-[#943310] hover:bg-[#7c280a] text-white font-black text-sm rounded-2xl shadow-xl shadow-amber-950/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <span>جاري معالجة وتأكيد الطلب بالورش...</span>
              ) : (
                <>
                  <span>تأكيد الطلب وشحن المنتجات ({cartTotal} ج.م)</span>
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
                const img = item.product?.images?.[0] || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=100&q=80';
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
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {title}
                      </h4>
                      <span className="text-[10px] text-[#8c6b53] block">
                        الكمية: {qty} • {sellerGov}
                      </span>
                      <span className="text-xs font-black text-[#943310] block">
                        {price * qty} ج.م
                      </span>
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

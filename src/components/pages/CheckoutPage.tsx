import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Governorate, Order } from '../../types';
import { api } from '../../services/api';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Copy,
  Check,
  Wallet,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  PackageCheck,
  Banknote,
  SendHorizontal
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

  // Multi-step form state (1: العنوان والشحن, 2: وسيلة الدفع)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

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

  // Dynamic payment accounts config
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

  const handleNextStep = () => {
    if (!fullName.trim() || !phone.trim() || !city.trim() || !address.trim()) {
      addToast('بيانات ناقصة', 'لو سمحت املأ جميع بيانات التوصيل الأساسية للمتابعة', 'error');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      addToast('ماعرفناش نأكد الطلب', err?.message || 'راجع بيانات السلة وجرب تاني', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // حالة السلة الفارغة
  if (cart.length === 0 && !completedOrder) {
    return (
      <div dir="rtl" className="min-h-[75vh] flex items-center justify-center max-w-4xl mx-auto px-4 py-16">
        <div className="relative w-full max-w-md p-10 text-center bg-white/90 dark:bg-espresso-900/90 backdrop-blur-2xl rounded-3xl border border-black/5 dark:border-white/10 shadow-2xl space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto ring-8 ring-primary/5">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black font-serif text-espresso dark:text-cream">سلتك بانتظار إبداعاتك</h2>
            <p className="text-sm text-espresso/60 dark:text-cream/60 leading-relaxed">
              سلة التسوق فارغة حالياً، استكشف المنتجات التراثية المميزة أولاً.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('products')}
            className="w-full py-4 bg-espresso text-white dark:bg-cream dark:text-black hover:bg-primary dark:hover:bg-primary-hover font-bold text-sm rounded-2xl shadow-lg transition duration-200 cursor-pointer"
          >
            تصفح منتجات سوق وه
          </button>
        </div>
      </div>
    );
  }

  // شاشة نجاح وتأكيد الطلب
  if (completedOrder) {
    const isManualTransfer =
      completedOrder.paymentMethod === 'instapay' || completedOrder.paymentMethod === 'vodafone_cash';

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
                <h1 className="text-2xl sm:text-3xl font-black font-serif text-espresso dark:text-cream">
                  تم استلام طلبك بنجاح!
                </h1>
                <p className="text-sm text-espresso/60 dark:text-cream/60">
                  شكراً لدعمك المباشر لحرفيي صعيد مصر
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-2xl border border-black/5 font-mono text-sm">
                <span className="text-espresso/60 dark:text-cream/60">رقم الفاتورة:</span>
                <span className="font-bold text-primary">#{completedOrder.orderNumber || completedOrder.id}</span>
              </div>
            </div>

            <div className="px-8 pb-8 space-y-6">
              {isManualTransfer && (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>حالة الدفع: بانتظار مطابقة التحويل</span>
                  </div>
                  <div className="p-4 bg-white dark:bg-espresso-800 rounded-xl border border-black/5 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-espresso/60 dark:text-cream/60 block">
                        {completedOrder.paymentMethod === 'instapay' ? 'عنوان إنستاباي:' : 'رقم فودافون كاش:'}
                      </span>
                      <strong className="font-mono text-base select-all text-espresso dark:text-cream" dir="ltr">
                        {completedOrder.paymentMethod === 'instapay' ? paymentConfig.instaPayAccount : paymentConfig.vodafoneCashNumber}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          completedOrder.paymentMethod === 'instapay' ? paymentConfig.instaPayAccount : paymentConfig.vodafoneCashNumber,
                          'order-copy'
                        )
                      }
                      className="px-3.5 py-1.5 bg-espresso text-white dark:bg-cream dark:text-black rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      {copiedKey === 'order-copy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'order-copy' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Price Details */}
              <div className="p-5 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-black/5 space-y-2 text-xs">
                <div className="flex justify-between text-espresso/70 dark:text-cream/70">
                  <span>المبلغ الإجمالي:</span>
                  <span className="font-mono text-base font-black text-primary">{completedOrder.total} ج.م</span>
                </div>
                <div className="flex justify-between text-espresso/50 dark:text-cream/50 text-[11px]">
                  <span>طريقة الدفع:</span>
                  <span>{completedOrder.paymentMethod === 'instapay' ? 'إنستاباي' : completedOrder.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : 'الدفع عند الاستلام'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActivePage('orders')}
                  className="w-full py-3.5 bg-espresso text-white dark:bg-cream dark:text-black font-bold text-xs rounded-xl shadow-lg hover:bg-primary transition"
                >
                  متابعة شحنتي
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('products')}
                  className="w-full py-3.5 border border-black/10 dark:border-white/10 font-bold text-xs rounded-xl hover:bg-black/5 transition"
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
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] dark:bg-espresso-950 py-8 px-4 sm:px-6 lg:px-12">
      <div className="max-w-[1360px] mx-auto space-y-8">

        {/* --- CHECKOUT STEPPER --- */}
        <div
          className="
    relative overflow-hidden
    bg-[#faf7f2] dark:bg-[#17120e]
    rounded-[2rem]
    border border-[#e8ddd1] dark:border-white/[0.08]
    shadow-[0_12px_40px_rgba(36,30,26,0.06)]
    dark:shadow-[0_12px_40px_rgba(0,0,0,0.22)]
    p-4 sm:p-6
  "
        >
          <div className="relative max-w-3xl mx-auto">

            {/* ================= CONNECTING LINES ================= */}
            <div
              className="
        absolute
        top-[22px]
        left-[16%]
        right-[16%]
        flex items-center
        h-[3px]
        z-0
      "
            >
              {/* Line 1 — Cart → Shipping */}
              <div className="flex-1 h-full relative overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                <div
                  className={`
            absolute inset-y-0 right-0
            rounded-full
            bg-emerald-500
            transition-all duration-700 ease-out
            ${currentStep >= 1 ? 'w-full' : 'w-0'}
          `}
                />
              </div>

              {/* Gap */}
              <div className="w-3 sm:w-5 shrink-0" />

              {/* Line 2 — Shipping → Payment */}
              <div className="flex-1 h-full relative overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                <div
                  className={`
            absolute inset-y-0 right-0
            rounded-full
            bg-sky-500
            transition-all duration-700 ease-out
            ${currentStep >= 2 ? 'w-full' : 'w-0'}
          `}
                />
              </div>
            </div>


            {/* ================= STEPS ================= */}
            <div className="relative z-10 flex items-start justify-between">


              {/* =====================================================
          STEP 1 — CART
      ===================================================== */}
              <button
                type="button"
                onClick={() => setActivePage('cart')}
                className="
          group
          flex flex-col items-center
          gap-2
          w-[30%]
          cursor-pointer
          outline-none
        "
              >
                <div className="relative">

                  <div
                    className="
              absolute inset-0
              rounded-full
              bg-emerald-500/20
              blur-lg
              scale-125
              opacity-70
              transition-all duration-300
              group-hover:opacity-100
            "
                  />

                  <div
                    className="
              relative
              w-11 h-11 sm:w-12 sm:h-12
              rounded-full
              bg-emerald-500
              text-white
              flex items-center justify-center
              border-4
              border-[#faf7f2]
              dark:border-[#17120e]
              shadow-lg shadow-emerald-500/20
              transition-transform duration-300
              group-hover:scale-105
            "
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                </div>

                <div className="text-center">
                  <span className="block text-[10px] sm:text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                    مكتملة
                  </span>

                  <span className="block text-[11px] sm:text-xs font-bold text-[#51463f] dark:text-[#d9cabe] mt-0.5">
                    السلة
                  </span>
                </div>
              </button>


              {/* =====================================================
          STEP 2 — SHIPPING
      ===================================================== */}
              {/* =====================================================
    STEP 2 — SHIPPING
===================================================== */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="
    group
    flex flex-col items-center
    gap-2
    w-[30%]
    cursor-pointer
    outline-none
  "
              >
                <div className="relative">

                  {/* Glow only when active */}
                  {currentStep === 1 && (
                    <div
                      className="
          absolute inset-0
          rounded-full
          bg-primary/25
          blur-lg
          scale-125
          animate-pulse
        "
                    />
                  )}

                  <div
                    className={`
        relative
        w-11 h-11 sm:w-12 sm:h-12
        rounded-full
        flex items-center justify-center
        border-4
        border-[#faf7f2]
        dark:border-[#17120e]
        transition-all duration-300

        ${currentStep >= 1
                        ? `
              bg-primary
              text-white
              shadow-lg shadow-primary/25
              ${currentStep === 1 ? 'ring-2 ring-primary/20' : ''}
            `
                        : `
              bg-[#ebe3db]
              dark:bg-white/[0.08]
              text-[#9b9087]
              dark:text-white/30
            `
                      }

        group-hover:scale-105
      `}
                  >
                    {currentStep > 1 ? (
                      <Check className="w-5 h-5 stroke-[3]" />
                    ) : (
                      <MapPin className="w-5 h-5" />
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <span
                    className={`
        block
        text-[10px] sm:text-[11px]
        font-black
        ${currentStep >= 1
                        ? 'text-primary'
                        : 'text-[#9b9087] dark:text-white/35'
                      }
      `}
                  >
                    {currentStep > 1 ? 'مكتملة' : 'الخطوة 01'}
                  </span>

                  <span
                    className={`
        block
        text-[11px] sm:text-xs
        font-bold
        mt-0.5
        ${currentStep >= 1
                        ? 'text-primary'
                        : 'text-[#81766d] dark:text-white/45'
                      }
      `}
                  >
                    العنوان والتوصيل
                  </span>
                </div>
              </button>

              {/* =====================================================
          STEP 3 — PAYMENT
      ===================================================== */}
              <button
                type="button"
                onClick={() => {
                  if (fullName && phone && city && address) {
                    setCurrentStep(2);
                  }
                }}
                className="
          group
          flex flex-col items-center
          gap-2
          w-[30%]
          cursor-pointer
          outline-none
        "
              >
                <div className="relative">

                  {currentStep === 2 && (
                    <div
                      className="
                absolute inset-0
                rounded-full
                bg-sky-500/25
                blur-lg
                scale-125
                animate-pulse
              "
                    />
                  )}

                  <div
                    className={`
              relative
              w-11 h-11 sm:w-12 sm:h-12
              rounded-full
              flex items-center justify-center
              border-4
              border-[#faf7f2]
              dark:border-[#17120e]
              transition-all duration-300

              ${currentStep === 2
                        ? `
                    bg-sky-500
                    text-white
                    shadow-lg shadow-sky-500/30
                    ring-2 ring-sky-500/20
                  `
                        : `
                    bg-[#ebe3db]
                    dark:bg-white/[0.08]
                    text-[#9b9087]
                    dark:text-white/30
                  `
                      }

              group-hover:scale-105
            `}
                  >
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>

                <div className="text-center">
                  <span
                    className={`
              block
              text-[10px] sm:text-[11px]
              font-black
              ${currentStep === 2
                        ? 'text-sky-500 dark:text-sky-400'
                        : 'text-[#9b9087] dark:text-white/35'
                      }
            `}
                  >
                    الخطوة 02
                  </span>

                  <span
                    className={`
              block
              text-[11px] sm:text-xs
              font-bold
              mt-0.5
              ${currentStep === 2
                        ? 'text-sky-500 dark:text-sky-400'
                        : 'text-[#81766d] dark:text-white/45'
                      }
            `}
                  >
                    الدفع والتأكيد
                  </span>
                </div>
              </button>

            </div>


            {/* ================= CURRENT STEP ================= */}
            <div
              className={`
        mt-5
        mx-auto
        w-fit
        max-w-full
        flex items-center gap-2
        px-3.5 py-2
        rounded-full
        border
        transition-all duration-500

        ${currentStep === 1
                  ? `
              bg-primary/[0.07]
              border-primary/10
              text-primary
            `
                  : `
              bg-sky-500/[0.07]
              border-sky-500/10
              text-sky-500
            `
                }
      `}
            >
              <span className="relative flex w-2 h-2 shrink-0">
                <span
                  className={`
            absolute
            inline-flex
            h-full w-full
            rounded-full
            opacity-40
            animate-ping
            ${currentStep === 1 ? 'bg-primary' : 'bg-sky-500'}
          `}
                />

                <span
                  className={`
            relative
            inline-flex
            w-2 h-2
            rounded-full
            ${currentStep === 1 ? 'bg-primary' : 'bg-sky-500'}
          `}
                />
              </span>

              <span className="text-[10px] sm:text-[11px] font-bold truncate">
                {currentStep === 1
                  ? 'كمل بيانات التوصيل عشان نوصّل طلبك'
                  : 'اختار طريقة الدفع وأكد طلبك'}
              </span>
            </div>

          </div>
        </div>
        {/* --- MAIN CONTENT & SIDEBAR --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handlePlaceOrder}>

              {/* STEP 1: SHIPPING ADDRESS */}
              {currentStep === 1 && (
                <div className="bg-white dark:bg-espresso-900 rounded-[2rem] p-6 sm:p-8 border border-black/5 dark:border-white/10 shadow-sm space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
                    <div>
                      <h2 className="text-xl font-bold font-serif text-espresso dark:text-cream">بيانات المستلم وعنوان التوصيل</h2>
                      <p className="text-xs text-espresso/50 dark:text-cream/50 mt-0.5">يرجى ملء البيانات بدقة لضمان سرعة وصول الطرد</p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                      خطوة 1 من 2
                    </span>
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
  text-[#241e1a] dark:text-[#f7efe5]
  border border-[#d8d0c8] dark:border-white/10
  rounded-2xl text-sm
  placeholder:text-[#9a9189] dark:placeholder:text-white/35
  shadow-sm dark:shadow-none
  transition-all duration-200
  hover:border-primary/30 dark:hover:border-primary/40
  focus:outline-none
  focus:ring-2 focus:ring-primary/20
  focus:border-primary/40
  cursor-pointer
"                      >
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

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-8 py-4 bg-espresso text-white dark:bg-cream dark:text-black hover:bg-primary dark:hover:bg-primary-hover font-bold text-sm rounded-2xl shadow-xl flex items-center gap-2 transition duration-200 cursor-pointer"
                    >
                      <span>الانتقال للدفع</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PAYMENT METHOD & REVIEW */}
              {currentStep === 2 && (
                <div className="bg-white dark:bg-espresso-900 rounded-[2rem] p-6 sm:p-8 border border-black/5 dark:border-white/10 shadow-sm space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
                    <div>
                      <h2 className="text-xl font-bold font-serif text-espresso dark:text-cream">اختر وسيلة الدفع المناسبة</h2>
                      <p className="text-xs text-espresso/50 dark:text-cream/50 mt-0.5">الدفع آمن ومحمي بالكامل عبر القنوات المعتمدة</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <ChevronRight className="w-3.5 h-3.5" /> تعديل العنوان
                    </button>
                  </div>

                  <div className="space-y-4">

                    {/* Card 1: InstaPay */}
                    <div
                      onClick={() => setPaymentMethod('instapay')}
                      className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'instapay'
                        ? 'border-primary bg-primary/[0.03] shadow-md shadow-primary/5'
                        : 'border-black/5 dark:border-white/5 hover:border-black/20'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-black text-espresso dark:text-cream">تطبيق إنستاباي (InstaPay)</h3>
                              <span className="text-[10px] bg-sky-500/10 text-sky-600 px-2.5 py-0.5 rounded-full font-bold">بدون رسوم</span>
                            </div>
                            <p className="text-xs text-espresso/60 dark:text-cream/60 mt-1">
                              تحويل فوري ومباشر لحساب المنصة عبر المعرف المعتمد
                            </p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'instapay' ? 'border-primary bg-primary text-white' : 'border-black/20'
                          }`}>
                          {paymentMethod === 'instapay' && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>

                      {paymentMethod === 'instapay' && (
                        <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10 space-y-3">
                          <div className="p-3.5 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-espresso/50 dark:text-cream/50 block">معرف إنستاباي الرسمي:</span>
                              <span className="font-mono font-bold text-sm text-primary select-all" dir="ltr">{paymentConfig.instaPayAccount}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(paymentConfig.instaPayAccount, 'step-ipa');
                              }}
                              className="px-3 py-1.5 bg-white dark:bg-espresso-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-black/10"
                            >
                              {copiedKey === 'step-ipa' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedKey === 'step-ipa' ? 'تم النسخ' : 'نسخ المعرف'}</span>
                            </button>
                          </div>

                          <input
                            type="text"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            placeholder="أدخل عنوان إنستاباي الخاص بك أو رقم العملية المرجعي"
                            className="w-full px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* Card 2: Vodafone Cash */}
                    <div
                      onClick={() => setPaymentMethod('vodafone_cash')}
                      className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'vodafone_cash'
                        ? 'border-primary bg-primary/[0.03] shadow-md shadow-primary/5'
                        : 'border-black/5 dark:border-white/5 hover:border-black/20'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                            <Wallet className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-black text-espresso dark:text-cream">محافظ الهاتف (فودافون كاش)</h3>
                              <span className="text-[10px] bg-rose-500/10 text-rose-600 px-2.5 py-0.5 rounded-full font-bold">كاش سريع</span>
                            </div>
                            <p className="text-xs text-espresso/60 dark:text-cream/60 mt-1">
                              تحويل فوري إلى رقم المحفظة المعتمد لضمان الحجز
                            </p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'vodafone_cash' ? 'border-primary bg-primary text-white' : 'border-black/20'
                          }`}>
                          {paymentMethod === 'vodafone_cash' && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>

                      {paymentMethod === 'vodafone_cash' && (
                        <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10 space-y-3">
                          <div className="p-3.5 bg-black/[0.03] dark:bg-white/[0.05] rounded-xl flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-espresso/50 dark:text-cream/50 block">رقم المحفظة المعتمد:</span>
                              <span className="font-mono font-bold text-sm text-primary select-all" dir="ltr">{paymentConfig.vodafoneCashNumber}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(paymentConfig.vodafoneCashNumber, 'step-vf');
                              }}
                              className="px-3 py-1.5 bg-white dark:bg-espresso-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-black/10"
                            >
                              {copiedKey === 'step-vf' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedKey === 'step-vf' ? 'تم النسخ' : 'نسخ الرقم'}</span>
                            </button>
                          </div>

                          <input
                            type="text"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            placeholder="أدخل رقم الهاتف الذي قمت بالتحويل منه"
                            className="w-full px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary outline-none font-mono"
                          />
                        </div>
                      )}
                    </div>

                    {/* Card 3: COD */}
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === 'cod'
                        ? 'border-primary bg-primary/[0.03] shadow-md shadow-primary/5'
                        : 'border-black/5 dark:border-white/5 hover:border-black/20'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                            <Banknote className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-black text-espresso dark:text-cream">الدفع نقداً عند الاستلام</h3>
                            </div>
                            <p className="text-xs text-espresso/60 dark:text-cream/60 mt-1">
                              سداد كامل القيمة لمندوب التوصيل بعد فحص سلامة التغليف
                            </p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-primary bg-primary text-white' : 'border-black/20'
                          }`}>
                          {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="pt-4 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-2xl text-xs font-bold hover:bg-black/5 transition"
                    >
                      رجوع للعنوان
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-4 bg-espresso text-white dark:bg-cream dark:text-black hover:bg-primary dark:hover:bg-primary-hover font-bold text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span>جاري توثيق طلبك...</span>
                      ) : (
                        <>
                          <SendHorizontal className="w-4 h-4" />
                          <span>تأكيد نهائي للطلب ({cartTotal} ج.م)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

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
              {/* Decorative glow */}
              <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

              <div className="relative p-5 sm:p-6">

                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="
              w-11 h-11 rounded-2xl
              bg-primary/10 dark:bg-primary/15
              flex items-center justify-center
              border border-primary/10
            "
                    >
                      <ShoppingBag className="w-5 h-5 text-primary" />
                    </div>

                    <div>
                      <h3 className="font-black text-base text-[#241e1a] dark:text-[#f7eee5]">
                        ملخص طلبيتك
                      </h3>

                      <p className="text-[11px] text-[#8f8379] dark:text-white/40 mt-0.5">
                        راجع طلبك قبل التأكيد
                      </p>
                    </div>
                  </div>

                  <div
                    className="
            px-3 py-1.5
            rounded-full
            bg-white dark:bg-white/[0.05]
            border border-black/5 dark:border-white/10
            text-[10px] font-bold
            text-[#6f6258] dark:text-white/50
          "
                  >
                    {cart.length} {cart.length === 1 ? 'منتج' : 'منتجات'}
                  </div>
                </div>

                {/* Items */}
                <div
                  className="
          rounded-2xl
          bg-white/70 dark:bg-white/[0.025]
          border border-black/[0.05] dark:border-white/[0.06]
          overflow-hidden
        "
                >
                  <div className="px-4 py-3 border-b border-black/[0.05] dark:border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#8f8379] dark:text-white/40">
                        المنتجات
                      </span>

                      <span className="text-[10px] text-[#a29890] dark:text-white/30">
                        {cart.length} قطع
                      </span>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar">
                    <div className="space-y-1">
                      {cart.map((item, idx) => {
                        const title = item.product?.title || 'قطعة أصيلة';
                        const img = item.product?.images?.[0];
                        const price = item.product?.price || 0;
                        const qty = item.quantity || 1;

                        return (
                          <div
                            key={idx}
                            className="
                    group
                    flex items-center gap-3
                    p-2.5
                    rounded-xl
                    transition-all duration-200
                    hover:bg-black/[0.025]
                    dark:hover:bg-white/[0.035]
                  "
                          >
                            {/* Image */}
                            <div className="relative shrink-0">
                              {img ? (
                                <img
                                  src={img}
                                  alt={title}
                                  className="
                          w-12 h-12
                          rounded-xl
                          object-cover
                          border border-black/5 dark:border-white/10
                          shadow-sm
                        "
                                />
                              ) : (
                                <div
                                  className="
                          w-12 h-12 rounded-xl
                          bg-black/[0.03] dark:bg-white/[0.05]
                          flex items-center justify-center
                        "
                                >
                                  <ShoppingBag className="w-4 h-4 text-black/20 dark:text-white/20" />
                                </div>
                              )}

                              {/* Quantity badge */}
                              <span
                                className="
                        absolute -top-1.5 -right-1.5
                        min-w-5 h-5 px-1
                        rounded-full
                        bg-primary
                        text-white
                        text-[9px]
                        font-black
                        flex items-center justify-center
                        border-2 border-[#faf7f2] dark:border-[#17120e]
                      "
                              >
                                {qty}
                              </span>
                            </div>

                            {/* Product info */}
                            <div className="min-w-0 flex-1">
                              <p
                                className="
                        text-xs
                        font-bold
                        text-[#241e1a] dark:text-[#f7eee5]
                        truncate
                      "
                              >
                                {title}
                              </p>

                              <p className="text-[10px] text-[#978b81] dark:text-white/40 mt-1">
                                {price} ج.م × {qty}
                              </p>
                            </div>

                            {/* Item total */}
                            <div className="text-left shrink-0">
                              <span className="text-xs font-black font-mono text-[#241e1a] dark:text-[#f7eee5]">
                                {price * qty}
                              </span>

                              <span className="block text-[9px] text-[#9c9188] dark:text-white/30">
                                ج.م
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="mt-4 space-y-2.5">

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#81766d] dark:text-white/50">
                      المجموع الفرعي
                    </span>

                    <span className="font-mono font-bold text-[#342b26] dark:text-[#eee2d7]">
                      {cartSubtotal} ج.م
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-[#998d83] dark:text-white/40" />

                      <span className="text-[#81766d] dark:text-white/50">
                        الشحن
                      </span>
                    </div>

                    <span
                      className={`
              font-mono font-bold
              ${shippingFee === 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-[#342b26] dark:text-[#eee2d7]'
                        }
            `}
                    >
                      {shippingFee === 0
                        ? 'مجاناً'
                        : `${shippingFee} ج.م`}
                    </span>
                  </div>

                  {cartDiscountAmount > 0 && (
                    <div
                      className="
              flex items-center justify-between
              px-3 py-2
              rounded-xl
              bg-emerald-500/[0.07]
              border border-emerald-500/10
            "
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        </span>

                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          الخصم
                        </span>
                      </div>

                      <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                        - {cartDiscountAmount} ج.م
                      </span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="relative my-5">
                  <div className="border-t border-dashed border-black/10 dark:border-white/10" />

                  {/* Ticket circles */}
                  <span className="absolute -right-7 -top-2.5 w-5 h-5 rounded-full bg-white dark:bg-[#17120e]" />
                  <span className="absolute -left-7 -top-2.5 w-5 h-5 rounded-full bg-white dark:bg-[#17120e]" />
                </div>

                {/* Total */}
                <div
                  className="
          rounded-2xl
          bg-[#241e1a] dark:bg-[#241e1a]
          p-4
          text-white
          relative overflow-hidden
        "
                >
                  <div className="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-primary/20 blur-2xl" />

                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-white/45 mb-1">
                        الإجمالي النهائي
                      </p>

                      <p className="text-sm font-bold text-white/80">
                        شامل الشحن والخصومات
                      </p>
                    </div>

                    <div className="text-left">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                          {cartTotal}
                        </span>

                        <span className="text-[10px] font-bold text-white/50">
                          ج.م
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust */}
                <div
                  className="
          mt-4
          flex items-center gap-3
          px-3.5 py-3
          rounded-2xl
          bg-emerald-500/[0.06]
          border border-emerald-500/10
        "
                >
                  <div
                    className="
            w-8 h-8 rounded-xl
            bg-emerald-500/10
            flex items-center justify-center
            shrink-0
          "
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div>
                    <p className="text-[11px] font-black text-emerald-700 dark:text-emerald-400">
                      طلبك في أمان
                    </p>

                    <p className="text-[9px] leading-relaxed text-emerald-700/60 dark:text-emerald-400/50 mt-0.5">
                      ضمان استبدال ومعاينة مجانية وقت الاستلام
                    </p>
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
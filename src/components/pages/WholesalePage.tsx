import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  TrendingDown,
  ShieldCheck,
  Truck,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  MessageCircle,
  FileText,
  Package,
  Layers,
  ArrowLeft,
  ChevronRight,
  Send,
  Building,
  Award
} from 'lucide-react';
import { WHATSAPP_NUMBER, getWhatsAppUrl } from '../common/WhatsAppButton';
import { Governorate } from '../../types';

export const WholesalePage: React.FC = () => {
  const { products, setActivePage, setSelectedProductId, addToast } = useApp();

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessType, setBusinessType] = useState('hotel');
  const [governorate, setGovernorate] = useState<Governorate>('القاهرة');
  const [categoryInterest, setCategoryInterest] = useState<string[]>(['فخار وخزف', 'كليم ومنسوجات']);
  const [estimatedQuantity, setEstimatedQuantity] = useState('20-50 قطعة');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const businessTypes = [
    { id: 'hotel', label: 'فندق / منتجع سياحي' },
    { id: 'bazaar', label: 'بازار سياحي / متجر تراثي' },
    { id: 'decor', label: 'شركة تصميم وديكور داخلي' },
    { id: 'restaurant', label: 'مطعم / كافيه تراثي' },
    { id: 'corporate', label: 'هدايا شركات ومؤسسات' },
    { id: 'export', label: 'تصدير وتجارة خارجية' },
    { id: 'trader', label: 'تاجر جملة وتجزئة' },
  ];

  const categoriesOptions = [
    'فخار وخزف قنا وأسوان',
    'كليم وسجاد أخميم اليدوي',
    'مشغولات خشب السرسوع والعرجون',
    'مشغولات الخوص والعرجون النوبي',
    'تطريز التلي التراثي بأسيوط',
    'عسل سدر جبلي وتمور واحات',
    'إكسسوارات وفضة نوبية أصيلة'
  ];

  const toggleCategory = (cat: string) => {
    if (categoryInterest.includes(cat)) {
      setCategoryInterest(categoryInterest.filter((c) => c !== cat));
    } else {
      setCategoryInterest([...categoryInterest, cat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !phone.trim() || !contactName.trim()) {
      addToast('يرجى ملء البيانات المطلوبة: اسم المؤسسة، الاسم ورقم الهاتف', 'error');
      return;
    }

    setIsSubmitting(true);

    const message = `*طلب عرض أسعار بيع بالجملة وتوريدات - سوق الصعيد* 🏺\n\n` +
      `🏢 *اسم المؤسسة/الشركة:* ${companyName}\n` +
      `👤 *المسؤول:* ${contactName}\n` +
      `📞 *رقم الهاتف:* ${phone}\n` +
      `🏛️ *نوع النشاط:* ${businessTypes.find(b => b.id === businessType)?.label || businessType}\n` +
      `📍 *المحافظة:* ${governorate}\n` +
      `📦 *الحرف المطلوبة:* ${categoryInterest.join(' ، ')}\n` +
      `🔢 *الكمية التقديرية:* ${estimatedQuantity}\n` +
      (notes ? `📝 *تفاصيل وملاحظات إضافية:* ${notes}\n` : '');

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      addToast('تم تجهيز طلب عرض السعر بالجملة بنجاح!', 'success');

      // Open WhatsApp directly with full structured request
      const url = getWhatsAppUrl(message);
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 600);
  };

  // Curated products for wholesale highlights
  const wholesaleFeatured = products.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold text-[#7A6F64] dark:text-[#9C8F82]">
        <button
          type="button"
          onClick={() => setActivePage('home')}
          className="hover:text-[#B45F42] dark:hover:text-[#FF855D] transition-colors"
        >
          الرئيسية
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#2D2A26] dark:text-[#FAF6F2]">البيع بالجملة وتوريدات الشركات (B2B)</span>
      </div>

      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#2D221C] via-[#38281F] to-[#1C1410] text-white p-6 sm:p-12 border border-[#523C2F] shadow-2xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B45F42]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
              <Building2 className="w-4 h-4" />
              <span>قطاع الأعمال، الفنادق، والبازارات السياحية</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heritage leading-tight tracking-tight text-white">
              توريدات الحرف الصعيدية الأصيلة <br />
              <span className="text-amber-300">بأسعار الورش المباشرة</span>
            </h1>

            <p className="text-sm sm:text-base text-[#DDD2C7] leading-relaxed max-w-2xl">
              نوفر للفنادق والمنتجعات السياحية، معارض الديكور الداخلي، البازارات، والشركات حلول توريد متكاملة للكميات الكبيرة من أشهر ورش الصعيد مع إمكانية النقش والتخصيص وشحن الشاحنات الآمن.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#quotation-form"
                className="px-6 py-3.5 rounded-2xl bg-[#B45F42] hover:bg-[#9E4F36] text-white font-bold text-sm shadow-lg shadow-[#B45F42]/30 transition-all hover:scale-105 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>طلب عرض أسعار فوري</span>
              </a>

              <a
                href={getWhatsAppUrl('السلام عليكم، نود الاستفسار عن تفاصيل وأسعار طلبيات الجملة والتوريدات لـ (اسم المنشأة)...')}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>محادثة واتساب: {WHATSAPP_NUMBER}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
            <div className="bg-white/5 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center mx-auto">
                <TrendingDown className="w-5 h-5" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white">خصم حتى 40%</p>
              <p className="text-xs text-[#BCB0A3]">على طلبيات الكميات الكبيرة وتوريدات المشاريع</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white">تخصيص وهوية</p>
              <p className="text-xs text-[#BCB0A3]">حفر شعار فندقك أو مؤسستك على القطع</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-400/20 text-blue-300 flex items-center justify-center mx-auto">
                <Truck className="w-5 h-5" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white">شحن وتصدير</p>
              <p className="text-xs text-[#BCB0A3]">توصيل شاحنات مجهز لكافة الموانئ والمحافظات</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-400/20 text-purple-300 flex items-center justify-center mx-auto">
                <Award className="w-5 h-5" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white">أصالة 100%</p>
              <p className="text-xs text-[#BCB0A3]">شهادات منشأ وفواتير ضريبية معتمدة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wholesale Pricing Tiers */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black font-heritage text-[#2D2A26] dark:text-[#FAF6F2]">
            شرائح وتخفيضات البيع بالجملة
          </h2>
          <p className="text-sm text-[#7A6F64] dark:text-[#DDD2C7]">
            نظام تسعير شفاف وتنافسي يتدرج بناءً على حجم الطلبية لخدمة كافة فئات التجار والمنشآت.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1 */}
          <div className="bg-white dark:bg-[#1B1613] p-6 rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] shadow-xs space-y-4 relative">
            <div className="inline-block px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-bold">
              الشريحة الأولى: كميات صغيرة
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">من 5 إلى 15 قطعة</h3>
            <p className="text-3xl font-black text-[#B45F42] dark:text-[#FF855D]">خصم 15%</p>
            <p className="text-xs text-gray-600 dark:text-[#BCB0A3] leading-relaxed">
              مثالية للمتاجر الناشئة، البازارات الصغيرة، وهدايا الفعاليات الخاصة.
            </p>
            <ul className="space-y-2 text-xs text-gray-700 dark:text-[#DDD2C7] pt-2 border-t border-gray-100 dark:border-[#382E27]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>إمكانية تشكيل المنتجات من نفس الفئة</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>تغليف آمن ومحكم للنقل</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>توصيل سريع خلال 3-5 أيام عمل</span>
              </li>
            </ul>
          </div>

          {/* Tier 2 (Highlighted) */}
          <div className="bg-[#FAF6F0] dark:bg-[#221C18] p-6 rounded-3xl border-2 border-[#B45F42] dark:border-[#FF855D] shadow-lg relative transform md:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#B45F42] text-white text-[11px] font-bold py-1 px-4 rounded-full shadow-xs">
              الأكثر طلباً للفنادق والمطاعم
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-[#B45F42] dark:text-[#FF855D] text-xs font-bold mt-2">
              الشريحة الثانية: كميات متوسطة
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">من 16 إلى 50 قطعة</h3>
            <p className="text-3xl font-black text-[#B45F42] dark:text-[#FF855D]">خصم 25%</p>
            <p className="text-xs text-gray-600 dark:text-[#BCB0A3] leading-relaxed">
              تناسب تأثيث وتجهيز الفنادق التراثية، المطاعم، والمجموعات الديكورية.
            </p>
            <ul className="space-y-2 text-xs text-gray-700 dark:text-[#DDD2C7] pt-2 border-t border-gray-200 dark:border-[#382E27]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>إمكانية طلب عينة مدفوعة قبل الاعتماد</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>حفر شعار أو كود الفندق مجاناً</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>أولوية في جدول تصنيع الورش الحرفية</span>
              </li>
            </ul>
          </div>

          {/* Tier 3 */}
          <div className="bg-white dark:bg-[#1B1613] p-6 rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] shadow-xs space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-bold">
              الشريحة الكبرى: توريدات وتصدير
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">أكثر من 50 قطعة</h3>
            <p className="text-3xl font-black text-[#B45F42] dark:text-[#FF855D]">تسعير ورش مخصص</p>
            <p className="text-xs text-gray-600 dark:text-[#BCB0A3] leading-relaxed">
              لكبار المستوردين، الشركات الهندسية، وسلاسل القرى السياحية العالمية.
            </p>
            <ul className="space-y-2 text-xs text-gray-700 dark:text-[#DDD2C7] pt-2 border-t border-gray-100 dark:border-[#382E27]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>تخفيضات استثنائية تصل إلى 40%</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>مدير حساب مخصص لمتابعة مراحل الإنتاج</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>تجهيز أوراق التصدير والجمارك الكاملة</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Quotation Form Section */}
      <div id="quotation-form" className="bg-white dark:bg-[#1B1613] rounded-3xl border border-[#E8E1D9] dark:border-[#382E27] p-6 sm:p-10 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>تسعير سريع وتواصل مباشر</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-heritage text-[#2D2A26] dark:text-[#FAF6F2] leading-tight">
              اطلب عرض سعر لطلبية الجملة الآن
            </h2>

            <p className="text-sm text-[#7A6F64] dark:text-[#DDD2C7] leading-relaxed">
              املأ البيانات أدناه، وسيقوم مسؤول مبيعات الجملة في سوق الصعيد بإعداد جدول الكميات والأسعار والتواصل معك هاتفياً وعبر الواتساب خلال أقل من 3 ساعات.
            </p>

            {/* Direct Contact Card */}
            <div className="p-4 bg-[#FAF6F0] dark:bg-[#221C18] rounded-2xl border border-[#E8E1D9] dark:border-[#382E27] space-y-3">
              <p className="text-xs font-bold text-[#B45F42] dark:text-[#FF855D]">أو تواصل معنا مباشرة:</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">واتساب مبيعات الجملة:</span>
                  <a
                    href={`https://wa.me/201158969931`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    01158969931
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-8 rounded-3xl text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-200">
                  تم استلام طلبك بنجاح!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
                  شكراً لتواصلك مع سوق الصعيد. سيقوم فريق مبيعات الجملة بالتواصل مع <span className="font-bold">{companyName}</span> عبر رقم {phone} لتقديم عرض الأسعار وتفاصيل الإنتاج.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition-colors"
                >
                  إرسال طلب إضافي
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-[#DDD2C7] mb-1">
                      اسم المنشأة / الشركة / البازار <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="مثال: فندق قصر النيل، بازار الأقصر..."
                      className="w-full text-xs bg-gray-50 dark:bg-[#251E1A] text-gray-900 dark:text-white px-3.5 py-3 rounded-xl border border-gray-200 dark:border-[#3A3028] focus:border-[#B45F42] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-[#DDD2C7] mb-1">
                      اسم المسؤول للتواصل <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="الاسم الثلاثي"
                      className="w-full text-xs bg-gray-50 dark:bg-[#251E1A] text-gray-900 dark:text-white px-3.5 py-3 rounded-xl border border-gray-200 dark:border-[#3A3028] focus:border-[#B45F42] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-[#DDD2C7] mb-1">
                      رقم الهاتف / واتساب <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full text-xs bg-gray-50 dark:bg-[#251E1A] text-gray-900 dark:text-white px-3.5 py-3 rounded-xl border border-gray-200 dark:border-[#3A3028] focus:border-[#B45F42] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-[#DDD2C7] mb-1">
                      نوع النشاط
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full text-xs bg-gray-50 dark:bg-[#251E1A] text-gray-900 dark:text-white px-3.5 py-3 rounded-xl border border-gray-200 dark:border-[#3A3028] focus:border-[#B45F42] focus:outline-none"
                    >
                      {businessTypes.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-[#DDD2C7] mb-1">
                      المحافظة
                    </label>
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value as Governorate)}
                      className="w-full text-xs bg-gray-50 dark:bg-[#251E1A] text-gray-900 dark:text-white px-3.5 py-3 rounded-xl border border-gray-200 dark:border-[#3A3028] focus:border-[#B45F42] focus:outline-none"
                    >
                      <option value="القاهرة">القاهرة</option>
                      <option value="الجيزة">الجيزة</option>
                      <option value="الإسكندرية">الإسكندرية</option>
                      <option value="الأقصر">الأقصر</option>
                      <option value="أسوان">أسوان</option>
                      <option value="قنا">قنا</option>
                      <option value="سوهاج">سوهاج</option>
                      <option value="أسيوط">أسيوط</option>
                      <option value="المنيا">المنيا</option>
                      <option value="بني سويف">بني سويف</option>
                      <option value="الوادي الجديد">الوادي الجديد</option>
                      <option value="الفيوم">الفيوم</option>
                      <option value="أخرى">محافظة أخرى / خارج مصر</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-[#DDD2C7] mb-1">
                      الكمية التقديرية المطلوبة
                    </label>
                    <select
                      value={estimatedQuantity}
                      onChange={(e) => setEstimatedQuantity(e.target.value)}
                      className="w-full text-xs bg-gray-50 dark:bg-[#251E1A] text-gray-900 dark:text-white px-3.5 py-3 rounded-xl border border-gray-200 dark:border-[#3A3028] focus:border-[#B45F42] focus:outline-none"
                    >
                      <option value="5-15 قطعة (شريحة أولى)">5 - 15 قطعة (خصم 15%)</option>
                      <option value="16-50 قطعة (شريحة ثانية)">16 - 50 قطعة (خصم 25%)</option>
                      <option value="51-100 قطعة">51 - 100 قطعة (تسعير خاص)</option>
                      <option value="أكثر من 100 قطعة (تصدير وتأثيث)">أكثر من 100 قطعة (توريد مشاريع)</option>
                    </select>
                  </div>
                </div>

                {/* Categories selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-[#DDD2C7] mb-2">
                    الحرف والمنتجات المراد طلبها:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categoriesOptions.map((cat) => {
                      const isSelected = categoryInterest.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#B45F42] text-white border-[#B45F42] font-bold shadow-xs'
                              : 'bg-gray-50 dark:bg-[#251E1A] text-gray-700 dark:text-[#DDD2C7] border-gray-200 dark:border-[#382E27] hover:border-gray-300'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-[#DDD2C7] mb-1">
                    ملاحظات أو مواصفات خاصة (مقاسات، حفر شعار، موعد التسليم):
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="اكتب أي متطلبات خاصة بالقطع أو تفضيلات الألوان..."
                    className="w-full text-xs bg-gray-50 dark:bg-[#251E1A] text-gray-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#3A3028] focus:border-[#B45F42] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#B45F42] hover:bg-[#9E4F36] disabled:bg-gray-400 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'جاري التجهيز...' : 'إرسال طلب عرض السعر ومتابعته عبر واتساب'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

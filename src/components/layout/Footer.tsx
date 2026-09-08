import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  Truck,
  MapPin,
  Phone,
  Mail,
  Film,
  ArrowUp,
  Building2,
  Send,
  CreditCard,
  Wallet,
  CheckCircle2,
  ArrowLeft,
  Compass,
  Store,
  ChevronLeft,
  Flame,
  ArrowUpLeft,
  Award
} from 'lucide-react';
import { WAHPattern } from '../../design-system/WAHPattern';

export const Footer: React.FC = () => {
  const { setActivePage, setShowIntroVideo, wahStats, sellers } = useApp();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
      }, 4000);
      setNewsletterEmail('');
    }
  };

  const liveMetrics = [
    {
      num: wahStats?.governoratesCount ? String(wahStats.governoratesCount).padStart(2, '0') : '08',
      label: 'محافظات موثقة ميدانياً'
    },
    {
      num: wahStats?.craftsCount ? String(wahStats.craftsCount).padStart(2, '0') : '08',
      label: 'حرفة وصنعة متوارثة'
    },
    {
      num: (sellers.length || wahStats?.sellersCount) ? String(sellers.length || wahStats?.sellersCount) : '—',
      label: 'ورشة ونول تراثي مسجل'
    },
    {
      num: '100%',
      label: 'عائد مباشر لصناع التراث'
    },
  ];

  const heritagePerks = [
    {
      icon: Sparkles,
      number: '01',
      title: 'صناعة يدوية أصيلة',
      tagline: 'من أنامل الصانع لمقتنياتك',
      desc: 'مشغولات مصنوعة يدوياً 100% بأيدي شيوخ الصنعة في قراهم، من خامات بيئة الصعيد البكر.',
    },
    {
      icon: ShieldCheck,
      number: '02',
      title: 'توثيق معتمد للأصل',
      tagline: 'حماية الموروث من الاندثار',
      desc: 'نوثق تاريخ القطعة ومصدر ورشتها، ونضمن وصول مقتنى تراثي أصيل يحفظ قيمته لأجيال.',
    },
    {
      icon: Truck,
      number: '03',
      title: 'تغليف مخصص للخزف',
      tagline: 'شحن آمن إلى باب دارك',
      desc: 'معايير تغليف دقيقة ومبطنة مخصصة لحماية الآنية الفخارية والقطع الحساسة من أي ضرر.',
    },
    {
      icon: HeartHandshake,
      number: '04',
      title: 'تمكين مجتمعي مباشر',
      tagline: 'استدامة الأسر والأنوال',
      desc: 'قيمة كل عملية اقتناء تذهب مباشرة إلى أصحاب الورش والأنوال لدعم استمرار الحرفة ورعايتها.',
    },
  ];

  const nileRoute = [
    { name: 'أسوان', craft: 'التمور والعرجون' },
    { name: 'الأقصر', craft: 'الألباستر والنحاس' },
    { name: 'قنا', craft: 'فخار وصلصال النيل' },
    { name: 'سوهاج', craft: 'أنوال نسيج أخميم' },
    { name: 'أسيوط', craft: 'تلي الحرير والفضة' },
    { name: 'المنيا', craft: 'أعسال الزهور البرية' },
    { name: 'الوادي الجديد', craft: 'خوص واحات النخيل' },
  ];

  // استخدام as const يحل خطأ TypeScript في setActivePage نهائياً
  const marketLinks = [
    ['products', 'جميع القطع اليدوية'],
    ['categories', 'التصنيفات التراثية'],
    ['cultural-crafts', 'أطلس حرف الصعيد'],
    ['sellers', 'شيوخ الصنعة والورش'],
  ] as const;

  const serviceLinks = [
    ['orders', 'تتبع الشحنة والطلبات'],
    ['favorites', 'قائمة المفضلة'],
    ['cart', 'سلة المقتنيات'],
    ['buyer-account', 'إدارة الحساب والعناوين'],
    ['about', 'ميثاق ورسالة المنصة'],
  ] as const;

  return (
    <footer
      dir="rtl"
      className="
        relative overflow-hidden
        bg-[#110D0B]
        text-[#FAF6F0]
        border-t-2 border-[#C45832]
        transition-colors duration-500
        select-none pb-24 md:pb-0
      "
    >
      {/* =========================================================
          BACKGROUND AMBIENCE & SUBTLE HERITAGE GLOWS
      ========================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 right-1/4 w-80 sm:w-[550px] h-80 sm:h-[550px] rounded-full bg-[#C45832]/12 blur-[130px] sm:blur-[160px]" />
        <div className="absolute bottom-10 left-10 w-80 sm:w-[480px] h-80 sm:h-[480px] rounded-full bg-[#264653]/15 blur-[130px] sm:blur-[160px]" />

        <div className="absolute inset-0 opacity-[0.04]">
          <WAHPattern
            type="geometry"
            className="w-full h-full text-[#FAF6F0]"
          />
        </div>
      </div>

      {/* =========================================================
          1. LIVE METRICS STRIP (شريط مؤشرات التوثيق الميداني)
      ========================================================== */}
      <div className="relative z-10 border-b border-white/[0.08] bg-white/[0.015] backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center text-center">
            {liveMetrics.map((metric, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-[#E8734A] tracking-tight">
                  {metric.num}
                </span>
                <span className="text-[11px] sm:text-xs font-medium text-[#DCD1C7] mt-1">
                  {metric.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================
          2. TOP BRAND STATEMENT (البيان التحريري الرئيسي)
      ========================================================== */}
      <div className="relative z-10 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-end">

            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C45832]/20 border border-[#C45832]/40 text-[#FFA07A] text-xs font-bold">
                <Flame className="w-3.5 h-3.5 text-[#FFA07A] animate-pulse" />
                <span>منصة «وه» — الحكاية وراء كل تفصيلة</span>
              </div>

              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black font-heritage leading-[1.15] tracking-tight text-white">
                من هُنا...
                <br />
                <span className="bg-gradient-to-l from-[#FFA07A] via-[#E8734A] to-[#E5C3A6] bg-clip-text text-transparent">
                  تكتمل رواية الصعيد بين يديك.
                </span>
              </h2>

              <p className="max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-[#E2D7CE] font-normal">
                «وه» ليست مجرد منصة تجارية، بل صرح توثيقي يربط روح الصانع بتقدير المقتني.
                ننقل أصالة أنوال أخميم، وطمي فخار قنا، وتطريز تلي أسيوط الفضي إلى بيوت تُثمّن رفعة الموروث.
              </p>
            </div>

            {/* زر الفيلم التوثيقي المتجاوب */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-3.5">
              <button
                type="button"
                onClick={() => setShowIntroVideo(true)}
                className="
                  group relative flex items-center justify-between gap-4 px-6 py-4.5
                  rounded-2xl border border-white/15 bg-white/[0.04]
                  hover:bg-[#C45832] hover:border-[#C45832]
                  transition-all duration-300 cursor-pointer shadow-xl w-full sm:w-auto lg:w-full min-h-[56px]
                "
                aria-label="مشاهدة الفيلم التعريفي عن وه"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#C45832]/25 group-hover:bg-white/20 flex items-center justify-center transition-colors shrink-0">
                    <Film className="w-5 h-5 text-[#FFA07A] group-hover:text-white" />
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-[#C4B7AC] group-hover:text-white/80">
                      وثائقي المنصة
                    </span>
                    <span className="text-sm font-bold text-white">
                      شاهد فيلم «وه» التوثيقي
                    </span>
                  </div>
                </div>
                <ArrowLeft className="w-4 h-4 text-[#DCD1C7] group-hover:text-white group-hover:-translate-x-1 transition-all shrink-0" />
              </button>

              <div className="flex items-center gap-2 justify-start sm:justify-end text-xs text-[#DCD1C7] px-1 font-medium">
                <Compass className="w-4 h-4 text-[#FFA07A]" />
                <span>توثيق ميداني لأكثر من 35 حرفة وصنعة</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* =========================================================
          3. HERITAGE BENEFITS GRID (أختام الضمان والأصالة)
      ========================================================== */}
      <div className="relative z-10 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {heritagePerks.map((perk) => {
              const Icon = perk.icon;
              return (
                <div
                  key={perk.number}
                  className="
                    group relative p-5 sm:p-6 rounded-3xl
                    bg-[#181310]/95 backdrop-blur-md
                    border border-white/10 hover:border-[#C45832]/80
                    transition-all duration-300 shadow-md flex flex-col justify-between
                  "
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold text-[#A89A8E]">
                        {perk.number}
                      </span>
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#C45832]/15 border border-[#C45832]/30 flex items-center justify-center group-hover:bg-[#C45832] transition-all">
                        <Icon className="w-5 h-5 text-[#FFA07A] group-hover:text-white transition-colors" />
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                      {perk.title}
                    </h3>
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#FFA07A] block mb-2">
                      {perk.tagline}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#D2C5B9] font-normal line-clamp-3 sm:line-clamp-none">
                    {perk.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================
          4. MAIN FOOTER NAVIGATION & NEWSLETTER
      ========================================================== */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">

          {/* هوية المنصة وبطاقة التوثيق */}
          <div className="lg:col-span-4 space-y-5">
            <img
              src="https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png"
              alt="شعار منصة وه"
              width={160}
              className="contrast-115 brightness-110"
            />

            <p className="text-xs sm:text-sm leading-relaxed text-[#E2D7CE] max-w-sm font-normal">
              المنصة الرقمية الجامعة لاكتشاف روح صعيد مصر وموروثه الحي؛ نصل بين شيوخ الصنعة في أقصى الجنوب والذائقة الرفيعة عبر تجربة اقتناء موثقة وحكايات حية.
            </p>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#C45832]/20 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-[#FFA07A]" />
              </div>
              <div className="text-right">
                <span className="block text-xs font-bold text-white">
                  من صميم الورشة إلى بيتك مباشرة
                </span>
                <span className="block text-[11px] text-[#C4B7AC] mt-0.5">
                  قطع معتمدة ومفحوصة لضمان الأصالة التاريخية
                </span>
              </div>
            </div>
          </div>

          {/* القوائم */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-6 sm:gap-8">
            {/* سوق وه */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-wider text-[#FFA07A] uppercase pb-2 border-b border-white/15 font-heritage">
                سوق وه
              </h3>
              <ul className="space-y-3">
                {marketLinks.map(([page, label]) => (
                  <li key={page}>
                    <button
                      type="button"
                      onClick={() => setActivePage(page)}
                      className="group flex items-center gap-1.5 text-xs sm:text-sm text-[#E2D7CE] hover:text-[#FFA07A] transition-colors cursor-pointer text-right"
                    >
                      <ChevronLeft className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#FFA07A] transition-all hidden sm:inline-block" />
                      <span>{label}</span>
                    </button>
                  </li>
                ))}
                <li className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActivePage('wholesale')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFA07A] hover:underline cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span>توريدات المؤسسات (B2B)</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* خدمات المقتني */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-wider text-[#FFA07A] uppercase pb-2 border-b border-white/15 font-heritage">
                خدمات المقتني
              </h3>
              <ul className="space-y-3">
                {serviceLinks.map(([page, label]) => (
                  <li key={page}>
                    <button
                      type="button"
                      onClick={() => setActivePage(page)}
                      className="group flex items-center gap-1.5 text-xs sm:text-sm text-[#E2D7CE] hover:text-[#FFA07A] transition-colors cursor-pointer text-right"
                    >
                      <ChevronLeft className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#FFA07A] transition-all hidden sm:inline-block" />
                      <span>{label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* صندوق رسائل الجنوب وبوابة الحرفيين */}
          <div className="lg:col-span-4 space-y-4">
            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#211813] to-[#140F0D] p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C45832]/25 flex items-center justify-center text-[#FFA07A] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    رسائل ومرويات الجنوب
                  </h3>
                  <p className="text-xs text-[#C4B7AC]">
                    إصدارات نادرة وأخبار الورش تصلك أولاً
                  </p>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-[#E2D7CE] font-normal">
                انضم لنشرتنا لتصلك خفايا الصنعة وكواليس الأنوال والأفران قبل طرح القطع للعامة.
              </p>

              <form onSubmit={handleSubscribe} className="relative">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="أدخل بريدك الإلكتروني..."
                  dir="rtl"
                  className="
                    w-full h-12 pr-4 pl-12 rounded-xl
                    bg-black/40 border border-white/20
                    text-white text-xs placeholder:text-[#9A8C82]
                    focus:outline-none focus:border-[#C45832]
                    transition-colors
                  "
                />
                <button
                  type="submit"
                  aria-label="الاشتراك في النشرة"
                  className="
                    absolute left-1.5 top-1.5 w-9 h-9
                    rounded-lg bg-[#C45832] hover:bg-[#E8734A]
                    flex items-center justify-center
                    transition-all cursor-pointer shadow-md
                  "
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>

              {subscribed && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>تم اشتراكك في بريد الجنوب التراثي بنجاح!</span>
                </div>
              )}

              {/* بطاقة الحرفيين */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    هل تمتلك ورشة أو نولاً بصعيد مصر؟
                  </span>
                  <span className="text-[11px] text-[#C4B7AC] block mt-0.5">انضم مجاناً إلى شبكة الحرفيين المعتمدين</span>
                </div>
                <a
                  href="https://wa.me/201158969931"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C45832]/20 hover:bg-[#C45832] text-[#FFA07A] hover:text-white text-xs font-bold transition-all"
                >
                  <span>تسجيل ورشة</span>
                  <ArrowUpLeft className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* أزرار الاتصال */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href="tel:+201158969931"
                dir="ltr"
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/15 hover:border-[#C45832] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#FFA07A] shrink-0" />
                <span className="text-xs font-bold text-white font-mono">01158969931</span>
              </a>

              <a
                href="mailto:ahmdmohanad28@gmail.com"
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/15 hover:border-[#C45832] transition-colors truncate"
              >
                <Mail className="w-4 h-4 text-[#FFA07A] shrink-0" />
                <span className="text-xs font-bold text-white truncate">مراسلة الفريق</span>
              </a>
            </div>
          </div>

        </div>

        {/* =========================================================
            5. SOUTHERN NILE TRAIL (شريط المحافظات)
        ========================================================== */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3.5">
            <MapPin className="w-4 h-4 text-[#FFA07A] shrink-0" />
            <span className="text-xs font-bold text-white">
              محطات النيل ومواطن الحرف الأصيلة:
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            {nileRoute.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setActivePage('map')}
                className="
                  group px-4 py-2 rounded-xl shrink-0
                  border border-white/15 bg-white/[0.04]
                  hover:bg-[#C45832] hover:border-[#C45832]
                  transition-all duration-200 cursor-pointer flex items-center gap-2
                "
              >
                <span className="w-2 h-2 rounded-full bg-[#FFA07A] group-hover:bg-white transition-colors" />
                <span className="text-xs font-bold text-white">
                  {item.name}
                </span>
                <span className="text-[11px] text-[#D2C5B9] group-hover:text-white/90 font-light">
                  ({item.craft})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================
            6. BOTTOM TRUST & COPYRIGHT BAR (الدفع والحقوق)
        ========================================================== */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <p className="text-xs text-[#DCD1C7] text-center md:text-right font-medium">
              جميع الحقوق محفوظة © {new Date().getFullYear()} وه | WAH — المنصة الرقمية لصعيد مصر.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-[#DCD1C7] ml-1 font-medium hidden sm:inline">الدفع المعتمد:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/[0.04] text-[11px] font-bold text-white">
                <Wallet className="w-3.5 h-3.5 text-[#FFA07A]" />
                إنستاباي والمحافظ الإلكترونية
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/[0.04] text-[11px] font-bold text-white">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                بطاقات ميزة والبطاقات البنكية
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/[0.04] text-[11px] font-bold text-white">
                <Store className="w-3.5 h-3.5 text-[#FFA07A]" />
                الدفع عند الاستلام
              </span>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="العودة لأعلى الصفحة"
              className="
                group flex items-center gap-2 text-xs text-[#E2D7CE] hover:text-white
                transition-colors cursor-pointer self-center md:self-auto pt-2 md:pt-0 font-bold
              "
            >
              <span>للأعلى</span>
              <div className="w-8 h-8 rounded-xl border border-white/15 bg-white/[0.04] flex items-center justify-center group-hover:bg-[#C45832] group-hover:border-[#C45832] transition-all">
                <ArrowUp className="w-4 h-4 text-white" />
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* الشريط السفلي الموشى بالباترن */}
      <div className="relative h-1.5 bg-[#C45832]">
        <div className="absolute inset-0 opacity-40">
          <WAHPattern
            type="geometry"
            className="w-full h-full text-white"
          />
        </div>
      </div>
    </footer>
  );
};
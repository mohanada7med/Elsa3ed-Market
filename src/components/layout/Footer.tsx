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
        bg-[#eee8dc]
        text-[#211d18]
        transition-colors duration-500
        dark:bg-[#0b0b0a]
        dark:text-[#f5f0e7]
        border-t border-black/10
        dark:border-white/10
        select-none pb-24 md:pb-0
      "
    >
      {/* =========================================================
          BACKGROUND AMBIENCE & SUBTLE HERITAGE GLOWS
      ========================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 right-1/4 w-80 sm:w-[550px] h-80 sm:h-[550px] rounded-full bg-[#9a6a35]/10 blur-[130px] sm:blur-[160px]" />
        <div className="absolute bottom-10 left-10 w-80 sm:w-[480px] h-80 sm:h-[480px] rounded-full bg-[#264653]/10 blur-[130px] sm:blur-[160px]" />

        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]">
          <WAHPattern
            type="geometry"
            className="w-full h-full text-black dark:text-white"
          />
        </div>
      </div>

      {/* =========================================================
          1. LIVE METRICS STRIP (شريط مؤشرات التوثيق الميداني)
      ========================================================= */}
      <div className="relative z-10 border-b border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-xs">
        <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center text-center">
            {liveMetrics.map((metric, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-[#9a6a35] tracking-tight">
                  {metric.num}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-black/60 dark:text-white/60 mt-1">
                  {metric.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================
          2. TOP BRAND STATEMENT (البيان التحريري الرئيسي)
      ========================================================= */}
      <div className="relative z-10 border-b border-black/10 dark:border-white/10">
        <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-end">

            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#9a6a35]/10 border border-[#9a6a35]/20 text-[#9a6a35] text-xs font-bold backdrop-blur-md shadow-sm">
                <Flame className="w-3.5 h-3.5 text-[#9a6a35] animate-pulse" />
                <span>منصة «وه» — الحكاية وراء كل تفصيلة</span>
              </div>

              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black font-serif leading-[1.15] tracking-tight">
                من هُنا...
                <br />
                <span className="text-[#9a6a35]">
                  تكتمل رواية الصعيد بين يديك.
                </span>
              </h2>

              <p className="max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-black/65 dark:text-white/65 font-normal">
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
                  rounded-2xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.05]
                  hover:bg-[#211d18] hover:text-white dark:hover:bg-white dark:hover:text-black
                  transition-all duration-300 cursor-pointer shadow-xl w-full sm:w-auto lg:w-full min-h-[56px] backdrop-blur-xl
                "
                aria-label="مشاهدة الفيلم التعريفي عن وه"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#9a6a35]/15 group-hover:bg-white/20 dark:group-hover:bg-black/20 flex items-center justify-center transition-colors shrink-0">
                    <Film className="w-5 h-5 text-[#9a6a35] group-hover:text-white dark:group-hover:text-black" />
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-black/50 dark:text-white/50 group-hover:text-white/80 dark:group-hover:text-black/80">
                      وثائقي المنصة
                    </span>
                    <span className="text-sm font-bold">
                      شاهد فيلم «وه» التوثيقي
                    </span>
                  </div>
                </div>
                <ArrowLeft className="w-4 h-4 text-black/50 dark:text-white/50 group-hover:text-white dark:group-hover:text-black group-hover:-translate-x-1 transition-all shrink-0" />
              </button>

              <div className="flex items-center gap-2 justify-start sm:justify-end text-xs text-black/55 dark:text-white/55 px-1 font-medium">
                <Compass className="w-4 h-4 text-[#9a6a35]" />
                <span>توثيق ميداني لأكثر من 35 حرفة وصنعة</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* =========================================================
          3. HERITAGE BENEFITS GRID (أختام الضمان والأصالة)
      ========================================================= */}
      <div className="relative z-10 border-b border-black/10 dark:border-white/10">
        <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {heritagePerks.map((perk) => {
              const Icon = perk.icon;
              return (
                <div
                  key={perk.number}
                  className="
                    group relative p-5 sm:p-6 rounded-[2rem]
                    bg-white/75 dark:bg-[#151513]/90 backdrop-blur-2xl
                    border border-black/10 dark:border-white/10 hover:border-[#9a6a35]
                    transition-all duration-300 shadow-xl flex flex-col justify-between
                  "
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold text-black/40 dark:text-white/40">
                        {perk.number}
                      </span>
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#9a6a35]/10 border border-[#9a6a35]/30 flex items-center justify-center group-hover:bg-[#9a6a35] group-hover:text-white transition-all">
                        <Icon className="w-5 h-5 text-[#9a6a35] group-hover:text-white transition-colors" />
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold mb-1">
                      {perk.title}
                    </h3>
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#9a6a35] block mb-2">
                      {perk.tagline}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-black/60 dark:text-white/60 font-normal line-clamp-3 sm:line-clamp-none">
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
      ========================================================= */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">

          {/* هوية المنصة وبطاقة التوثيق */}
          <div className="lg:col-span-4 space-y-5">
            <img
              src="https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png"
              alt="شعار منصة وه"
              width={160}
              className="contrast-115 brightness-110"
            />

            <p className="text-xs sm:text-sm leading-relaxed text-black/65 dark:text-white/65 max-w-sm font-normal">
              المنصة الرقمية الجامعة لاكتشاف روح صعيد مصر وموروثه الحي؛ نصل بين شيوخ الصنعة في أقصى الجنوب والذائقة الرفيعة عبر تجربة اقتناء موثقة وحكايات حية.
            </p>

            <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 flex items-center gap-3.5 backdrop-blur-xl">
              <div className="w-10 h-10 rounded-xl bg-[#9a6a35]/15 flex items-center justify-center text-[#9a6a35] shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="block text-xs font-bold">
                  من صميم الورشة إلى بيتك مباشرة
                </span>
                <span className="block text-[11px] text-black/50 dark:text-white/50 mt-0.5">
                  قطع معتمدة ومفحوصة لضمان الأصالة التاريخية
                </span>
              </div>
            </div>
          </div>

          {/* القوائم */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-6 sm:gap-8">
            {/* سوق وه */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-wider text-[#9a6a35] uppercase pb-2 border-b border-black/10 dark:border-white/10 font-serif">
                سوق وه
              </h3>
              <ul className="space-y-3">
                {marketLinks.map(([page, label]) => (
                  <li key={page}>
                    <button
                      type="button"
                      onClick={() => setActivePage(page)}
                      className="group flex items-center gap-1.5 text-xs sm:text-sm text-black/65 dark:text-white/65 hover:text-[#9a6a35] transition-colors cursor-pointer text-right"
                    >
                      <ChevronLeft className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#9a6a35] transition-all hidden sm:inline-block" />
                      <span>{label}</span>
                    </button>
                  </li>
                ))}
                <li className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActivePage('wholesale')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9a6a35] hover:underline cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span>توريدات المؤسسات (B2B)</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* خدمات المقتني */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-wider text-[#9a6a35] uppercase pb-2 border-b border-black/10 dark:border-white/10 font-serif">
                خدمات المقتني
              </h3>
              <ul className="space-y-3">
                {serviceLinks.map(([page, label]) => (
                  <li key={page}>
                    <button
                      type="button"
                      onClick={() => setActivePage(page)}
                      className="group flex items-center gap-1.5 text-xs sm:text-sm text-black/65 dark:text-white/65 hover:text-[#9a6a35] transition-colors cursor-pointer text-right"
                    >
                      <ChevronLeft className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#9a6a35] transition-all hidden sm:inline-block" />
                      <span>{label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* صندوق رسائل الجنوب وبوابة الحرفيين */}
          <div className="lg:col-span-4 space-y-4">
            <div className="relative overflow-hidden rounded-[2rem] border border-black/10 dark:border-white/10 bg-white/75 dark:bg-[#151513]/90 p-5 sm:p-6 shadow-xl space-y-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#9a6a35]/15 flex items-center justify-center text-[#9a6a35] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold">
                    رسائل ومرويات الجنوب
                  </h3>
                  <p className="text-xs text-black/50 dark:text-white/50">
                    إصدارات نادرة وأخبار الورش تصلك أولاً
                  </p>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-black/65 dark:text-white/65 font-normal">
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
                    bg-black/[0.035] dark:bg-white/[0.04] border border-black/10 dark:border-white/10
                    text-xs placeholder:text-black/35 dark:placeholder:text-white/30
                    focus:outline-none focus:border-[#9a6a35]
                    transition-colors
                  "
                />
                <button
                  type="submit"
                  aria-label="الاشتراك في النشرة"
                  className="
                    absolute left-1.5 top-1.5 w-9 h-9
                    rounded-lg bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d]
                    flex items-center justify-center
                    transition-all cursor-pointer shadow-md
                  "
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {subscribed && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>تم اشتراكك في بريد الجنوب التراثي بنجاح!</span>
                </div>
              )}

              {/* بطاقة الحرفيين */}
              <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold block">
                    هل تمتلك ورشة أو نولاً بصعيد مصر؟
                  </span>
                  <span className="text-[11px] text-black/50 dark:text-white/50 block mt-0.5">انضم مجاناً إلى شبكة الحرفيين المعتمدين</span>
                </div>
                <a
                  href="https://wa.me/201158969931"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#9a6a35]/10 hover:bg-[#9a6a35] text-[#9a6a35] hover:text-white text-xs font-bold transition-all"
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
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/75 dark:bg-[#151513]/90 border border-black/10 dark:border-white/10 hover:border-[#9a6a35] transition-colors backdrop-blur-xl"
              >
                <Phone className="w-4 h-4 text-[#9a6a35] shrink-0" />
                <span className="text-xs font-bold font-mono">01158969931</span>
              </a>

              <a
                href="mailto:ahmdmohanad28@gmail.com"
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/75 dark:bg-[#151513]/90 border border-black/10 dark:border-white/10 hover:border-[#9a6a35] transition-colors truncate backdrop-blur-xl"
              >
                <Mail className="w-4 h-4 text-[#9a6a35] shrink-0" />
                <span className="text-xs font-bold truncate">مراسلة الفريق</span>
              </a>
            </div>
          </div>

        </div>

        {/* =========================================================
            5. SOUTHERN NILE TRAIL (شريط المحافظات)
        ========================================================= */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2 mb-3.5">
            <MapPin className="w-4 h-4 text-[#9a6a35] shrink-0" />
            <span className="text-xs font-bold">
              محطات النيل ومواطن الحرف الأصيلة:
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-3 -mx-5 px-5 sm:mx-0 sm:px-0 no-scrollbar">
            {nileRoute.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setActivePage('map')}
                className="
                  group px-4 py-2 rounded-xl shrink-0
                  border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.035]
                  hover:bg-[#211d18] hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-transparent
                  transition-all duration-200 cursor-pointer flex items-center gap-2 backdrop-blur-xl
                "
              >
                <span className="w-2 h-2 rounded-full bg-[#9a6a35]" />
                <span className="text-xs font-bold">
                  {item.name}
                </span>
                <span className="text-[11px] text-black/50 dark:text-white/50 group-hover:text-white/80 dark:group-hover:text-black/80 font-light">
                  ({item.craft})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================
            6. BOTTOM TRUST & COPYRIGHT BAR (الدفع والحقوق)
        ========================================================= */}
        <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <p className="text-xs text-black/50 dark:text-white/50 text-center md:text-right font-medium">
              جميع الحقوق محفوظة © {new Date().getFullYear()} وه | WAH — المنصة الرقمية لصعيد مصر.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-black/50 dark:text-white/50 ml-1 font-medium hidden sm:inline">الدفع المعتمد:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.035] text-[11px] font-bold backdrop-blur-xl">
                <Wallet className="w-3.5 h-3.5 text-[#9a6a35]" />
                إنستاباي والمحافظ الإلكترونية
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.035] text-[11px] font-bold backdrop-blur-xl">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                بطاقات ميزة والبطاقات البنكية
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.035] text-[11px] font-bold backdrop-blur-xl">
                <Store className="w-3.5 h-3.5 text-[#9a6a35]" />
                الدفع عند الاستلام
              </span>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="العودة لأعلى الصفحة"
              className="
                group flex items-center gap-2 text-xs text-black/65 dark:text-white/65 hover:text-black dark:hover:text-white
                transition-colors cursor-pointer self-center md:self-auto pt-2 md:pt-0 font-bold
              "
            >
              <span>للأعلى</span>
              <div className="w-8 h-8 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.035] flex items-center justify-center group-hover:bg-[#211d18] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all backdrop-blur-xl">
                <ArrowUp className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* الشريط السفلي الموشى بالباترن */}
      <div className="relative h-1.5 bg-[#9a6a35]">
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
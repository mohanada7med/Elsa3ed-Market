import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  Phone,
  Mail,
  Film,
  ArrowUp,
  Send,
  CreditCard,
  Wallet,
  CheckCircle2,
  ArrowLeft,
  Store,
  Compass,
  Award,
  Map,
  Landmark,
  Hammer,
  BookOpen,
  Users,
  Utensils,
  Calendar,
  ShoppingBag,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { WAHPattern } from '../../design-system/WAHPattern';

export const Footer: React.FC = () => {
  const {
    setActivePage,
    setShowIntroVideo,
    isAuthenticated,
    currentRole,
    currentUser,
    setIsAuthModalOpen,
    setAuthModalTab,
    addToast
  } = useApp();

  const isSeller =
    isAuthenticated &&
    (currentRole === 'seller' ||
      currentUser?.role === 'seller' ||
      currentUser?.sellerStatus === 'approved');

  const handleWorkshopRegister = () => {
    if (isSeller) {
      return;
    }

    if (!isAuthenticated || currentRole === 'guest' || !currentUser?.id) {
      setAuthModalTab('register');
      setIsAuthModalOpen(true);
      addToast(
        'تسجيل ورشة',
        'اعمل حساب جديد الأول عشان تنضم لورش وه وتقدم طلب اعتماد ورشتك.',
        'info'
      );
      return;
    }

    // Authenticated as buyer: proceed with the artisan/workshop application flow
    try {
      sessionStorage.setItem('open_seller_apply', 'true');
    } catch {
      // ignore
    }
    setActivePage('buyer-account');
    addToast(
      'انضمام ورشة',
      'فتحنا لك صفحة الحساب عشان تبدأ تقدم طلب توثيق ورشتك التراثية.',
      'info'
    );
  };

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

  // جميع بوابات وصفحات التطبيق مرتبة ومنظمة باحترافية
  const appPortals = [
    { label: 'أطلس الصعيد التفاعلي', page: 'map' },
    { label: 'محافظات الصعيد', page: 'governorates' },
    { label: 'المعالم والتراث المعماري', page: 'places' },
    { label: 'حرف وصنايع الصعيد', page: 'cultural-crafts' },
    { label: 'وه بيحكي (المرويات)', page: 'stories' },
    { label: 'ناس الصعيد وحُرّاس الحكاية', page: 'people' },
    { label: 'طعم الصعيد (المطبخ الأصيل)', page: 'food' },
    { label: 'فعاليات ومواسم الصعيد', page: 'events' },
    { label: 'سوق وه الحرفي (المتجر)', page: 'products' },
    { label: 'شيوخ الصنعة والورش', page: 'sellers' },
    { label: 'التصنيفات التراثية', page: 'categories' },
    { label: 'توريدات المؤسسات (B2B)', page: 'wholesale' },
  ];

  const clientServices = [
    { label: 'تابع شحنتك وطلباتك', page: 'orders' },
    { label: 'سلة الشراء', page: 'cart' },
    { label: 'الحاجات المحفوظة', page: 'favorites' },
    { label: 'حسابك وعناوينك', page: 'buyer-account' },
    { label: 'عن وه وحكايتنا', page: 'about' },
  ];

  return (
    <footer
      dir="rtl"
      className="
        relative overflow-hidden
        bg-[#090807]
        text-[#f4efe6]
        transition-colors duration-500
        border-t border-[#C5A880]/30
        select-none pb-24 md:pb-0
      "
    >
      {/* خلفية جمالية متحفية فاخرة */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 right-1/4 w-[600px] h-[600px] rounded-full bg-[#C5A880]/10 blur-[150px]" />
        <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full bg-amber-700/10 blur-[140px]" />

        <div className="absolute inset-0 opacity-[0.025]">
          <WAHPattern
            type="geometry"
            className="w-full h-full text-white"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 py-16">

        {/* شريط علوي ملكي: دعوة انضمام الحرفيين والورش + الفيلم التوثيقي (يُخفى بالكامل إذا كان المستخدم بائعاً معتمداً) */}
        {!isSeller && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pb-12 mb-14 border-b border-white/10">

            <div className="lg:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black font-heritage tracking-tight">
                  عندك ورشة أو نول في الصعيد؟
                </h3>
                <p className="text-xl sm:text-xl text-white/70 mt-1 max-w-xl">
                  انضم لمنصة «وه» واعرض شغلك وصنعتك التراثية مباشرة للناس اللي بتقدر الفن الأصيل في كل مكان.
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-wrap items-center justify-start lg:justify-end gap-3.5">
              <button
                type="button"
                id="footer-workshop-register-btn"
                onClick={handleWorkshopRegister}
                className="px-7 py-4 rounded-2xl bg-[#C5A880] text-black hover:bg-amber-300 text-xs sm:text-sm font-extrabold transition-all shadow-2xl flex items-center gap-2.5 cursor-pointer border border-amber-200/50"
              >
                <span>سجّل ورشتك معانا</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowIntroVideo(true)}
                className="px-7 py-4 rounded-2xl bg-white/[0.04] border border-white/15 hover:bg-white/[0.08] text-xs sm:text-sm font-bold transition-all flex items-center gap-2.5 cursor-pointer backdrop-blur-xl"
              >
                <Film className="w-4 h-4 text-amber-300" />
                <span>اتفرج على فيلم وه</span>
              </button>
            </div>

          </div>
        )}        {/* الهيكل الرئيسي للفوتر (يحتوي على كافة أقسام وصفحات المنصة) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* 1. هوية المنصة والنبذة التأسيسية */}
          <div className="lg:col-span-3 space-y-5">
            <img
              src="https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png"
              alt="شعار منصة وه"
              width={150}
              className="brightness-125"
            />
            <p className="text-xs sm:text-sm leading-relaxed text-white/70 font-normal">
              منصة رقمية معمولة عشان تعرفك على روح صعيد مصر وتراثه الحي؛ بنوصلك بشيوخ الصنعة وأهل البلد في الجنوب، مع حكايات حية وتجربة تسوق موثقة.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-white/60">
              <span className="flex items-center gap-1.5"><Compass className="w-4 h-4 text-[#C5A880]" /> من الفيوم لأسوان</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#C5A880]" /> توثيق معتمد 100%</span>
            </div>
          </div>

          {/* 2. خريطة بوابات المنصة (كل صفحات التطبيق الأساسية) */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-xs font-extrabold tracking-wider text-[#C5A880] uppercase font-heritage pb-2 border-b border-white/10 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>أبواب ودليل منصة وه</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
              {appPortals.map((portal) => (
                <button
                  key={portal.page}
                  type="button"
                  onClick={() => setActivePage(portal.page as any)}
                  className="group flex items-center gap-2 text-xs text-white/75 hover:text-amber-300 transition-colors cursor-pointer text-right py-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-[#C5A880] shrink-0 transition-transform group-hover:-translate-x-1" />
                  <span className="truncate">{portal.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. خدمات المقتني وبريد الجنوب التراثي */}
          <div className="lg:col-span-4 space-y-6">

            {/* خدمات المقتني */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold tracking-wider text-[#C5A880] uppercase font-heritage pb-2 border-b border-white/10">
                خدماتك وحسابك
              </h4>
              <div className="flex flex-wrap gap-2">
                {clientServices.map((service) => (
                  <button
                    key={service.page}
                    type="button"
                    onClick={() => setActivePage(service.page as any)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white/80 hover:bg-[#C5A880] hover:text-black font-bold transition-all cursor-pointer"
                  >
                    {service.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowIntroVideo(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-amber-400/20 text-xs text-amber-300/90 hover:bg-[#C5A880] hover:text-black font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>فيلم وه التوثيقي</span>
                </button>
              </div>
            </div>

            {/* نشرة بريد الجنوب */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold tracking-wider text-[#C5A880] uppercase font-heritage">
                جوابات وحكاوي الجنوب
              </h4>
              <p className="text-xs text-white/70">
                اشترك في نشرتنا عشان توصلك حكايات الصنعة وأسرار الأنوال والأفران أول بأول.
              </p>

              <form onSubmit={handleSubscribe} className="relative">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="اكتب إيميلك هنا..."
                  className="
                    w-full h-12 pr-4 pl-12 rounded-xl
                    bg-white/[0.05] border border-white/15
                    text-xs text-white placeholder:text-white/40
                    focus:outline-none focus:border-[#C5A880] transition-colors
                  "
                />
                <button
                  type="submit"
                  aria-label="الاشتراك في النشرة"
                  className="
                    absolute left-1.5 top-1.5 w-9 h-9
                    rounded-lg bg-[#C5A880] text-black hover:bg-amber-300
                    flex items-center justify-center transition-all cursor-pointer shadow-md font-bold
                  "
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {subscribed && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>اشتركت معانا خلاص ونورتنا!</span>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* الشريط السفلي الحقوق والدفع */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-right">
          <p className="text-xs text-white/60 font-medium tracking-wide">
            كل الحقوق محفوظة © {new Date().getFullYear()} — <span className="text-[#C5A880] font-bold">مهند أحمد</span> &nbsp;|&nbsp; منصة <span className="font-heritage font-bold">«وه — WAH»</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-white/50 ml-1 font-medium hidden sm:inline">طرق الدفع المتاحة:</span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-[11px] font-bold backdrop-blur-md">
              <Wallet className="w-3.5 h-3.5 text-[#C5A880]" />
              إنستاباي والمحافظ الإلكترونية
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-[11px] font-bold backdrop-blur-md">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              البطاقات البنكية وميزة
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-[11px] font-bold backdrop-blur-md">
              <Store className="w-3.5 h-3.5 text-[#C5A880]" />
              الدفع عند الاستلام
            </span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="العودة لأعلى الصفحة"
            className="group flex items-center gap-2 text-xs text-white/70 hover:text-white transition-colors cursor-pointer font-bold"
          >
            <span>اطلع فوق</span>
            <div className="w-9 h-9 rounded-xl border border-white/15 bg-white/[0.04] flex items-center justify-center group-hover:bg-[#C5A880] group-hover:text-black group-hover:border-[#C5A880] transition-all">
              <ArrowUp className="w-4 h-4" />
            </div>
          </button>
        </div>

      </div>

      {/* الشريط السفلي الموشى بالباترن */}
      <div className="relative h-2 bg-gradient-to-r from-amber-800 via-[#C5A880] to-amber-700">
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
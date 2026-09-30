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
  ChevronLeft,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    setActivePage,
    setShowIntroVideo,
    isAuthenticated,
    currentRole,
    currentUser,
    setIsAuthModalOpen,
    setAuthModalTab,
    setPostLoginRedirect,
    addToast
  } = useApp();

  const isAdmin =
    isAuthenticated &&
    (currentRole === 'admin' || currentUser?.role === 'admin');

  const isSeller =
    !isAdmin &&
    isAuthenticated &&
    (currentRole === 'seller' ||
      currentUser?.role === 'seller' ||
      currentUser?.sellerStatus === 'approved');

  const handleWorkshopRegister = () => {
    if (isSeller || isAdmin) {
      return;
    }

    if (!isAuthenticated || currentRole === 'guest' || !currentUser?.id) {
      setPostLoginRedirect('buyer-account');
      setAuthModalTab('register');
      setIsAuthModalOpen(true);
      addToast(
        'تسجيل ورشة',
        'اعمل حساب جديد الأول عشان تنضم لورش وه وتقدم طلب اعتماد ورشتك.',
        'info'
      );
      return;
    }

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

  const appPortals = [
    { label: 'لفة في الصعيد', page: 'map' },
    { label: 'المعالم والتراث المعماري', page: 'places' },
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
    { label: 'مضايفة وه (المساعدة والتواصل)', page: 'help' },
    { label: 'سلة الشراء', page: 'cart' },
    { label: 'الحاجات المحفوظة', page: 'favorites' },
    { label: 'حسابك وعناوينك', page: 'buyer-account' },
    { label: 'عن وه وحكايتنا', page: 'about' },
    { label: 'سياسة الخصوصية', page: 'privacy' },
    { label: 'الشروط والأحكام', page: 'terms' },
  ];

  return (
    <footer
      dir="rtl"
      className="
        relative overflow-hidden
        bg-[#3B1E0E]
        text-[#FFF9EE]
        transition-colors duration-500
        border-t border-[#C99444]/30
        select-none pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0
      "
    >

      {/* Authentic WAH Architectural Frieze Ribbon */}
      <div
        className="w-full h-3.5 sm:h-4 overflow-hidden opacity-75 border-b border-[#C99444]/30"
        style={{
          backgroundImage: "url('/pattern/pat1.svg')",
          backgroundSize: '16px 100%',
          backgroundRepeat: 'repeat-x'
        }}
        aria-hidden="true"
      />

      {/* خلفية جمالية متحفية فاخرة */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 right-1/4 w-[600px] h-[600px] rounded-full bg-[#C99444]/10 blur-[150px]" />
        <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full bg-[#E66A2E]/10 blur-[140px]" />

        {/* Authentic WAH Heritage Icons Ambient Wallpaper (أكبر شوية في الخلفية كختم ونقشة نهاية الموقع) */}
        <div
          className="absolute inset-0 opacity-[0.022] mix-blend-screen"
          style={{
            backgroundImage: "url('/pattern/pat2.png')",
            backgroundRepeat: 'repeat',
            backgroundSize: '640px auto',
            backgroundPosition: 'center'
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-16 py-16">

        {/* شريط علوي ملكي: دعوة انضمام الحرفيين والورش + الفيلم التوثيقي */}
        {!isSeller && !isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pb-12 mb-14 border-b border-white/10">

            <div className="lg:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-cairo tracking-tight">
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
                className="px-7 py-4 rounded-2xl bg-primary text-white hover:bg-[#C99444] text-xs sm:text-sm font-extrabold transition-all duration-200 shadow-2xl flex items-center gap-2.5 cursor-pointer border border-[#C99444]/30 active:scale-95"
              >
                <span>سجّل ورشتك معانا</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowIntroVideo(true)}
                className="px-7 py-4 rounded-2xl bg-white/[0.04] border border-primary/30 hover:border-primary hover:bg-primary/15 text-xs sm:text-sm font-bold text-white hover:text-primary-hover transition-all duration-200 flex items-center gap-2.5 cursor-pointer backdrop-blur-xl active:scale-95 shadow-lg hover:shadow-[0_0_20px_rgba(154,106,53,0.2)]"
              >
                <Film className="w-4 h-4 text-white" />
                <span>اتفرج على فيلم وه</span>
              </button>
            </div>

          </div>
        )}

        {/* الهيكل الرئيسي للفوتر */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* 1. هوية المنصة والنبذة التأسيسية مع ختم نقشة وه وشخصية عم وه */}
          <div className="lg:col-span-3 space-y-5">
            {/* ختم نقشة وه التراثي ونهاية الموقع مع اللوجو وشخصية عم وه */}
            <div className="group relative inline-flex items-center justify-center p-3.5 sm:p-4 rounded-3xl overflow-hidden border border-[#C99444]/40 bg-gradient-to-b from-[#3B1E0E]/80 via-[#26160D]/90 to-[#1B1009]/95 backdrop-blur-xl shadow-[0_10px_30px_-5px_rgba(201,148,68,0.25)] transition-all duration-500 hover:border-[#C99444] hover:shadow-[0_15px_40px_-5px_rgba(201,148,68,0.4)]">

              {/* 1. هالة إشعاع ذهبية متحركة في الخلفية */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,148,68,0.3)_0%,transparent_70%)] animate-pulse" />

              {/* 2. نقشة تراثية مدمجة بالخلفية كعلامة مائية */}
              <div className="absolute inset-0 bg-pattern-icons opacity-10 mix-blend-overlay pointer-events-none" />

              {/* 3. شريط لمعة ضوئية يمر عند التمرير (Shine Effect) */}
              <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 transition-all duration-1000 group-hover:translate-x-[250%]" />

              {/* 4. زوايا زخرفية دقيقة مستوحاة من الهوية */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-[#C99444]/70 rounded-tr-sm pointer-events-none" />
              <span className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-[#C99444]/70 rounded-bl-sm pointer-events-none" />

              {/* 5. الشعار نفسه بتأثير ثلاثي الأبعاد وتكبير ناعم */}
              <img
                src="https://res.cloudinary.com/kuana1nl/image/upload/v1790728559/looooooooogo.png"
                alt="شعار منصة وه"
                width={130}
                className="relative z-10 brightness-110 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-105"
              />
            </div>            <p className="text-xs sm:text-sm leading-relaxed text-white/70 font-normal">
              منصة رقمية معمولة عشان تعرفك على روح صعيد مصر وتراثه الحي؛ بنوصلك بشيوخ الصنعة وأهل البلد في الجنوب، مع حكايات حية وتجربة تسوق موثقة.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-white/60">
              <span className="flex items-center gap-1.5"><Compass className="w-4 h-4 text-primary-hover" /> من الفيوم لأسوان</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary-hover" /> توثيق معتمد 100%</span>
            </div>
          </div>

          {/* 2. خريطة بوابات المنصة */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-xs font-cairo font-bold tracking-wider text-primary-hover uppercase pb-2 border-b border-white/10 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white">أبواب ودليل منصة وه</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
              {appPortals.map((portal) => (
                <button
                  key={portal.page}
                  type="button"
                  onClick={() => setActivePage(portal.page as any)}
                  className="group flex items-center gap-2 text-xs text-white/75 hover:text-primary transition-colors duration-200 cursor-pointer text-right py-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-white shrink-0 transition-transform duration-200 group-hover:-translate-x-1" />
                  <span className="truncate">{portal.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. خدمات المقتني وبريد الجنوب التراثي */}
          <div className="lg:col-span-4 space-y-6">

            {/* خدمات المقتني */}
            <div className="space-y-3">
              <h4 className="text-xs tracking-wider text-white uppercase font-cairo font-bold pb-2 border-b border-white/10">
                خدماتك وحسابك
              </h4>
              <div className="flex flex-wrap gap-2">
                {clientServices.map((service) => (
                  <button
                    key={service.page}
                    type="button"
                    onClick={() => setActivePage(service.page as any)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-primary text-xs text-white/80 hover:bg-primary hover:text-white font-bold transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    {service.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowIntroVideo(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-primary/30 hover:border-primary text-xs text-white/80 hover:bg-primary hover:text-white font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>فيلم وه التوثيقي</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('play-wah-intro'));
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-primary/30 hover:border-primary text-xs text-white/80 hover:bg-primary hover:text-white font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>بداية وه (WahIntro)</span>
                </button>
              </div>
            </div>

            {/* نشرة بريد الجنوب */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-cairo font-bold tracking-wider text-white uppercase">
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
                    focus:outline-none focus:border-primary transition-colors
                  "
                />
                <button
                  type="submit"
                  aria-label="الاشتراك في النشرة"
                  className="
                    absolute left-1.5 top-1.5 w-9 h-9
                    rounded-lg bg-primary text-white hover:bg-[#C99444]
                    flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md font-bold active:scale-95
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

        {/* الشريط السفلي الحقوق والضمان */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-right">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-xs text-white/60">
            <p className="font-medium tracking-wide">
              كل الحقوق محفوظة © {new Date().getFullYear()} —{' '}
              <span className="text-white hover:text-primary font-bold cursor-pointer transition-colors duration-200">
                مهند أحمد
              </span>{' '}
              &nbsp;|&nbsp; منصة{' '}
              <span className="font-heritage font-bold text-white hover:text-primary transition-colors duration-200 cursor-pointer">
                «وه — WAH»
              </span>
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#D6C6B1]">
              <span>•</span>
              <button
                type="button"
                onClick={() => setActivePage('help')}
                className="hover:text-primary-hover transition-colors cursor-pointer"
              >
                المساعدة والتواصل
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setActivePage('privacy')}
                className="hover:text-primary-hover transition-colors cursor-pointer"
              >
                سياسة الخصوصية
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setActivePage('terms')}
                className="hover:text-primary-hover transition-colors cursor-pointer"
              >
                الشروط والأحكام
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-[11px] font-bold backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              حرف يدوية أصيلة 100%
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-[11px] font-bold backdrop-blur-md">
              <Truck className="w-3.5 h-3.5 text-white" />
              شحن وتغليف آمن للمحافظات
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-[11px] font-bold backdrop-blur-md">
              <Store className="w-3.5 h-3.5 text-white" />
              دعم مباشر لشيوخ الصنعة
            </span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="العودة لأعلى الصفحة"
            className="group flex items-center gap-2 text-xs text-white/70 hover:text-primary transition-colors duration-200 cursor-pointer font-bold"
          >
            <span>اطلع فوق</span>
            <div className="w-9 h-9 rounded-xl border border-white/15 bg-white/[0.04] flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-200">
              <ArrowUp className="w-4 h-4" />
            </div>
          </button>
        </div>

      </div>

      {/* الشريط السفلي الأصيل المزين بنقش وه */}
      <div
        className="relative h-2.5 w-full overflow-hidden opacity-90 border-t border-[#C99444]/20"
        style={{
          backgroundImage: "url('/pattern/pat1.svg')",
          backgroundSize: '14px 100%',
          backgroundRepeat: 'repeat-x'
        }}
        aria-hidden="true"
      />
    </footer>
  );
};

export default Footer;
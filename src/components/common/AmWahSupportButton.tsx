import React, { useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  Building2,
  PackageCheck,
  HelpCircle,
  Phone,
  Headphones,
  MessageSquare,
  Loader2,
  LogIn,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';

export const SUPPORT_PHONE_NUMBER = '01158969931';
export const WHATSAPP_NUMBER = '01158969931';
export const WHATSAPP_INT_NUMBER = '201158969931';

export function getWhatsAppUrl(customMessage?: string): string {
  const defaultMsg =
    'السلام عليكم يا عم وه، أود الاستفسار عن منصة وه ومنتجات سوق وه التراثية.';
  const text = encodeURIComponent(customMessage || defaultMsg);
  return `https://wa.me/${WHATSAPP_INT_NUMBER}?text=${text}`;
}

export const AmWahSupportButton: React.FC = () => {
  const {
    activePage,
    setActivePage,
    isAuthenticated,
    currentUser,
    currentRole,
    openChatWithAdmin,
    setIsAuthModalOpen,
    setAuthModalTab,
    setPostLoginRedirect,
    addToast,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [userMsg, setUserMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // إذا كان المستخدم بالفعل في صفحة المحادثات، لا داعي لإظهار الزر العائم حتى لا يحجب واجهة الشات
  if (activePage === 'messages' || activePage === 'seller-messages') {
    return null;
  }

  const quickQuestions = [
    {
      icon: <PackageCheck className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />,
      title: 'متابعة واستفسار عن حالة طلب',
      badge: 'الطلبات والشحن',
      text: 'السلام عليكم يا عم وه، أود الاستفسار والمتابعة بخصوص حالة طلبي على المنصة وتفاصيل الشحن.',
    },
    {
      icon: <HelpCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />,
      title: 'واجهتني مشكلة فنية أو تقنية في المنصة',
      badge: 'دعم فني',
      text: 'السلام عليكم يا عم وه، واجهتني مشكلة تقنية في المنصة وأحتاج مساعدة الدعم الفني لحلها.',
    },
    {
      icon: <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />,
      title: 'استفسار عن المنتجات أو طلب تفصيل خاص',
      badge: 'منتجات وتفصيل',
      text: 'السلام عليكم يا عم وه، لدي استفسار عن المنتجات التراثية وإمكانية طلب حتة تفصيل ونقش خاص.',
    },
    {
      icon: <Building2 className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />,
      title: 'عروض أسعار بيع بالجملة وتوريدات (B2B)',
      badge: 'شركات وبازارات',
      text: 'السلام عليكم يا عم وه، نود الاستفسار عن عروض أسعار البيع بالجملة والتوريدات للفنادق والشركات.',
    },
    {
      icon: <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
      title: 'محادثة مباشرة مع إدارة المنصة',
      badge: 'مباشر',
      text: 'السلام عليكم يا عم وه، أريد التحدث مباشرة مع إدارة المنصة والدعم الفني.',
    },
  ];

  const handleStartSupportChat = async (promptText?: string) => {
    const finalMsg = (promptText || userMsg).trim();

    if (!isAuthenticated) {
      setPostLoginRedirect('messages');
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      addToast(
        'تسجيل الدخول مطلوب',
        'يرجى تسجيل الدخول للتواصل المباشر مع عم وه والدعم الفني',
        'info'
      );
      setIsOpen(false);
      return;
    }

    try {
      setIsSubmitting(true);
      await openChatWithAdmin(finalMsg ? { initialMessage: finalMsg } : undefined);
      setUserMsg('');
      setIsOpen(false);
    } catch (err: any) {
      console.error('[AmWahSupportButton] Failed to start support chat:', err);
      addToast(
        'خطأ في التواصل',
        err?.message || 'تعذر بدء محادثة الدعم، يرجى المحاولة لاحقاً',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToFullChat = () => {
    if (!isAuthenticated) {
      setPostLoginRedirect('messages');
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      addToast(
        'تسجيل الدخول مطلوب',
        'يرجى تسجيل الدخول للوصول إلى مركز المحادثات',
        'info'
      );
      setIsOpen(false);
      return;
    }

    if (currentRole === 'seller') {
      setActivePage('seller-messages');
    } else {
      setActivePage('messages');
    }
    setIsOpen(false);
  };

  return (
    <div
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] md:bottom-8 left-3 sm:left-6 z-50 select-none font-sans"
      dir="rtl"
    >
      {/* =========================================================
          CHAT / SUPPORT DIALOG
      ========================================================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="
              absolute bottom-full left-0 mb-3
              w-[calc(100vw-2rem)]
              max-w-[380px]
              overflow-hidden
              rounded-3xl
              border border-amber-900/15 dark:border-amber-600/30
              bg-[#faf7f2]/95 dark:bg-stone-900/95
              shadow-2xl
              backdrop-blur-2xl
              text-stone-850 dark:text-stone-100
              origin-bottom-left
              transition-colors duration-200
            "
            style={{
              boxShadow:
                '0 20px 50px -10px rgba(0, 0, 0, 0.35), 0 0 25px -5px rgba(217, 119, 36, 0.15)',
            }}
          >
            {/* =====================================================
                HEADER
            ====================================================== */}
            <div
              className="
                relative
                bg-gradient-to-l
                from-[#2a170a]
                via-[#4a2811]
                to-[#7a421c]
                p-4
                text-white
                flex
                items-center
                justify-between
                shadow-md
                overflow-hidden
                border-b border-amber-500/20
              "
            >
              {/* Decorative glows */}
              <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 right-10 w-32 h-32 rounded-full bg-white/5 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-center gap-3">
                {/* Uncle Wah Avatar with Support Badge */}
                <div className="relative shrink-0">
                  <div
                    className="
                      h-12
                      w-12
                      rounded-2xl
                      bg-stone-900/60
                      p-0.5
                      border border-amber-400/40
                      backdrop-blur-xs
                      overflow-hidden
                      flex
                      items-end
                      justify-center
                      shadow-inner
                    "
                  >
                    <img
                      src="/mascot/welcoming.png"
                      alt="عم وه"
                      style={{
                        imageRendering: 'crisp-edges',
                        WebkitFontSmoothing: 'antialiased',
                      }}
                      className="
                        h-12
                        w-auto
                        object-contain
                        select-none
                        -scale-x-100
                      "
                    />
                  </div>

                  {/* Online indicator */}
                  <span
                    className="
                      absolute
                      -bottom-1
                      -right-1
                      h-4
                      w-4
                      rounded-full
                      bg-emerald-500
                      border-2
                      border-stone-900
                      flex
                      items-center
                      justify-center
                      shadow-xs
                    "
                    title="متصل لخدمتك"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-stone-100 leading-tight">
                      «عم وه» - الدعم الفني
                    </h4>

                    <span
                      className="
                        rounded-full
                        bg-amber-500/20
                        border border-amber-400/30
                        px-2
                        py-0.5
                        text-[9px]
                        font-bold
                        text-amber-300
                      "
                    >
                      متاح الآن
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-300/80 mt-0.5 flex items-center gap-1.5">
                    <Headphones size={11} className="text-amber-400" />
                    <span>مساعدتك المباشرة وإدارة المنصة</span>
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="
                  relative
                  z-10
                  text-stone-300
                  hover:text-white
                  p-1.5
                  rounded-full
                  hover:bg-white/10
                  transition-colors
                  cursor-pointer
                "
                aria-label="إغلاق نافذة الدعم الفني"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* =====================================================
                BODY
            ====================================================== */}
            <div
              className="
                p-4
                bg-[#f4eee5]/80 dark:bg-stone-950/60
                space-y-3.5
                max-h-[340px]
                overflow-y-auto
                custom-scrollbar
                transition-colors duration-200
              "
            >
              {/* Welcome Speech Bubble */}
              <div className="flex items-start gap-2.5">
                <img
                  src="/mascot/char.png"
                  alt="عم وه"
                  style={{ imageRendering: 'crisp-edges' }}
                  className="
                    h-10
                    w-auto
                    object-contain
                    shrink-0
                    select-none
                  "
                />

                <div
                  className="
                    bg-white dark:bg-stone-900/90
                    p-3
                    rounded-2xl
                    rounded-tr-none
                    border border-amber-900/10 dark:border-stone-800
                    text-xs
                    text-stone-800 dark:text-stone-200
                    leading-relaxed
                    shadow-xs
                    transition-colors duration-200
                  "
                >
                  <p className="font-black text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                    <span>يا مرحب بيك في ديار وه! 🏺✨</span>
                  </p>
                  <p>
                    أنا «عم وه» مسؤول الدعم الفني. واجهتك أي مشكلة، محتاج تستفسر عن طلبك أو عندك اقتراح؟ شاور على استفسارك أو اكتب رسالتك وهتواصل معاك فوراً!
                  </p>
                </div>
              </div>

              {/* Auth Prompt if Guest */}
              {!isAuthenticated && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/10 border border-amber-600/20 dark:border-amber-500/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] text-amber-900 dark:text-amber-200">
                    <LogIn className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>سجل دخولك لحفظ محادثاتك ومتابعتها</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPostLoginRedirect('messages');
                      setAuthModalTab('login');
                      setIsAuthModalOpen(true);
                      setIsOpen(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-stone-950 text-[10px] font-black transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    دخول
                  </button>
                </div>
              )}

              {/* Quick Support Categories */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                    استفسارات سريعة للدعم الفني:
                  </p>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400/80 font-bold">رد فوري</span>
                </div>

                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleStartSupportChat(q.text)}
                    className="
                      w-full
                      text-right
                      p-2.5
                      bg-white dark:bg-stone-900/70
                      hover:bg-amber-500/10 dark:hover:bg-amber-500/10
                      border border-amber-900/10 dark:border-stone-800
                      hover:border-amber-600/40 dark:hover:border-amber-500/40
                      rounded-xl
                      text-xs
                      font-medium
                      text-stone-800 dark:text-stone-200
                      flex
                      items-center
                      justify-between
                      gap-2.5
                      transition-all
                      group
                      cursor-pointer
                      disabled:opacity-50
                      shadow-2xs
                    "
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="
                          shrink-0
                          p-1.5
                          bg-amber-50 dark:bg-stone-800/80
                          border border-amber-200/50 dark:border-transparent
                          rounded-lg
                          group-hover:scale-110
                          group-hover:bg-amber-500/20
                          transition-all
                        "
                      >
                        {q.icon}
                      </span>
                      <span className="truncate group-hover:text-amber-700 dark:group-hover:text-amber-300 font-medium">
                        {q.title}
                      </span>
                    </div>

                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 shrink-0 border border-stone-200 dark:border-stone-700/50">
                      {q.badge}
                    </span>
                  </button>
                ))}
              </div>

              {/* Direct Full Chat Center Jump */}
              <button
                type="button"
                onClick={handleGoToFullChat}
                className="
                  w-full
                  p-2.5
                  rounded-xl
                  bg-white dark:bg-stone-800/60
                  hover:bg-stone-50 dark:hover:bg-stone-800
                  border border-amber-900/15 dark:border-stone-700/60
                  text-stone-700 dark:text-stone-300
                  hover:text-stone-950 dark:hover:text-white
                  text-xs
                  font-bold
                  flex
                  items-center
                  justify-center
                  gap-2
                  transition-all
                  cursor-pointer
                  shadow-2xs
                "
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>فتح مركز محادثات الدعم الفني بالكامل</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </button>
            </div>

            {/* =====================================================
                MESSAGE INPUT
            ====================================================== */}
            <div
              className="
                p-3
                bg-[#ede4d7] dark:bg-stone-900
                border-t border-amber-900/10 dark:border-stone-800
                space-y-2
                transition-colors duration-200
              "
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userMsg}
                  onChange={(e) => setUserMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleStartSupportChat();
                    }
                  }}
                  disabled={isSubmitting}
                  placeholder="اكتب استفسارك لعم وه (الدعم الفني)..."
                  className="
                    flex-1
                    text-xs
                    bg-white dark:bg-stone-950
                    text-stone-900 dark:text-stone-100
                    placeholder-stone-400 dark:placeholder-stone-500
                    px-3.5
                    py-2.5
                    rounded-xl
                    border border-amber-900/15 dark:border-stone-800
                    focus:border-amber-600 dark:focus:border-amber-500
                    focus:outline-hidden
                    transition-colors
                    shadow-2xs
                  "
                />

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleStartSupportChat()}
                  className="
                    p-2.5
                    bg-gradient-to-tr from-[#963F25] to-[#D97724]
                    hover:from-[#B24C2B] hover:to-[#f2a45c]
                    text-white
                    rounded-xl
                    shadow-md
                    transition-all
                    active:scale-95
                    hover:scale-[1.03]
                    flex
                    items-center
                    justify-center
                    shrink-0
                    cursor-pointer
                    disabled:opacity-50
                  "
                  aria-label="إرسال للدعم الفني"
                  title="بدء المحادثة مع عم وه"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Subtle phone fallback */}
              <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 px-1 pt-0.5">
                <span className="flex items-center gap-1">
                  <Phone size={10} className="text-amber-600 dark:text-amber-400" />
                  <span>طوارئ الدعم الفني:</span>
                </span>
                <a
                  href={`tel:${SUPPORT_PHONE_NUMBER}`}
                  className="font-mono text-amber-700 dark:text-amber-400/90 hover:underline font-bold"
                >
                  {SUPPORT_PHONE_NUMBER}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          FLOATING TRIGGER BUTTON (عم وه - الدعم الفني)
      ========================================================== */}
      <div className="relative group">
        <motion.button
          type="button"
          id="global-floating-support-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="تواصل مع عم وه - الدعم الفني"
          className="
            relative
            flex
            items-center
            gap-1.5
            sm:gap-2.5
            rounded-full
            border border-amber-600/40 dark:border-amber-600/50
            sm:border-2
            sm:border-amber-600/60 dark:sm:border-amber-600/70
            bg-[#faf7f2]/95
            dark:bg-stone-950/95
            p-1.5
            sm:px-3
            sm:py-1.5
            shadow-2xl
            backdrop-blur-xl
            hover:border-amber-600 dark:hover:border-amber-400
            cursor-pointer
            transition-all
          "
          style={{
            boxShadow:
              '0 8px 25px -4px rgba(217, 119, 36, 0.35), 0 0 12px 1px rgba(178, 76, 43, 0.2)',
          }}
        >
          {/* Brand Pulse Glow */}
          <span
            className="
              absolute
              -inset-1
              rounded-full
              bg-amber-600/20
              blur-xs
              sm:blur-sm
              animate-pulse
              pointer-events-none
            "
          />

          {/* =====================================================
              UNCLE WAH MASCOT WITH SUPPORT BADGE
          ====================================================== */}
          <div
            className="
              relative
              z-10
              -my-1
              sm:-my-2
              shrink-0
            "
          >
            <img
              src="/mascot/welcoming.png"
              alt="عم وه - الدعم الفني"
              style={{
                imageRendering: 'crisp-edges',
                WebkitFontSmoothing: 'antialiased',
              }}
              className="
                h-10
                sm:h-13
                w-auto
                object-contain
                drop-shadow-md
                select-none
                -scale-x-100
                group-hover:scale-110
                transition-transform
                duration-300
              "
            />

            {/* Support Headset Badge */}
            <span
              className="
                absolute
                -bottom-0.5
                -left-0.5
                sm:-bottom-1
                sm:-left-1
                flex
                h-4
                w-4
                sm:h-5
                sm:w-5
                items-center
                justify-center
                rounded-full
                bg-gradient-to-tr from-[#B24C2B] to-[#D97724]
                text-white
                shadow-md
                border border-[#faf7f2] dark:border-stone-900
                sm:border-2
              "
              title="الدعم الفني والمساعدة"
            >
              <Headphones
                size={10}
                className="sm:w-2.5 sm:h-2.5 text-white"
              />
            </span>

            {/* Live Online Pulse Dot */}
            <span
              className="
                absolute
                -top-0.5
                -right-0.5
                h-2.5
                w-2.5
                rounded-full
                bg-emerald-500 dark:bg-emerald-400
                border border-[#faf7f2] dark:border-stone-900
                animate-pulse
              "
              title="متصل لخدمتك"
            />
          </div>

          {/* =====================================================
              BUTTON TEXT
          ====================================================== */}
          <div
            className="
              relative
              z-10
              text-right
              pr-0.5
              hidden
              sm:block
            "
          >
            <span
              className="
                flex
                items-center
                gap-1.5
                text-[11px]
                font-black
                text-stone-900 dark:text-stone-100
                group-hover:text-amber-700 dark:group-hover:text-amber-300
                transition-colors
                leading-tight
              "
            >
              <span>عم وه (الدعم الفني)</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
            </span>

            <span
              className="
                block
                text-[9px]
                font-bold
                text-amber-700 dark:text-amber-400/90
                leading-tight
                mt-0.5
              "
            >
              {isOpen ? 'انقر للإغلاق ✕' : 'خدمة العملاء والدعم 🎧'}
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default AmWahSupportButton;
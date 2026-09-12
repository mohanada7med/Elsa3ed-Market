import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import ForgotPasswordModal from './ForgotPasswordModal';
import {
  X,
  Eye,
  EyeOff,
  User,
  Lock,
  Phone,
  Mail,
  MapPin,
  Store,
  Camera,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  ShieldCheck,
  Sparkles,
  UserRound,
  KeyRound,
  Info,
} from 'lucide-react';

/* =========================================================
   DEFAULT AVATAR
========================================================= */

const DEFAULT_AVATAR =
  'https://res.cloudinary.com/kuana1nl/image/upload/v1788710904/user.jpg';

/* =========================================================
   USERNAME VALIDATION
========================================================= */

const USERNAME_REGEX =
  /^[\p{L}\p{N}_\- ]+$/u;

const MIN_USERNAME_LENGTH = 2;
const MAX_USERNAME_LENGTH = 40;

/* =========================================================
   COMPONENT
========================================================= */

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    login,
    register,
    addToast,
  } = useApp();

  const [roleType, setRoleType] =
    useState<'buyer' | 'seller'>('buyer');

  const [username, setUsername] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [name, setName] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [governorate, setGovernorate] =
    useState('');

  const [workshopName, setWorkshopName] =
    useState('');

  const [forgotPassword, setForgotPassword] =
    useState(false);

  const [forgotIdentifier, setForgotIdentifier] =
    useState('');

  const [isForgotSuccessModalOpen, setIsForgotSuccessModalOpen] =
    useState(false);

  const [forgotSuccessEmailHint, setForgotSuccessEmailHint] =
    useState<string | undefined>(undefined);

  const [forgotSuccessMessage, setForgotSuccessMessage] =
    useState<string | undefined>(undefined);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showRegisterPassword, setShowRegisterPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState('');

  const [avatarPreview, setAvatarPreview] =
    useState<string>(DEFAULT_AVATAR);

  const avatarInputRef =
    useRef<HTMLInputElement>(null);

  /* =========================================================
     PREVENT BACKGROUND SCROLL
  ========================================================= */

  useEffect(() => {
    if (!isAuthModalOpen) {
      const cartDrawerRoot = document.getElementById('cart-drawer-root');
      if (!cartDrawerRoot) {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.style.paddingRight = '';
      }
      return;
    }

    const scrollbarWidth =
      window.innerWidth -
      document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight =
        `${scrollbarWidth}px`;
    }

    return () => {
      const cartDrawerRoot = document.getElementById('cart-drawer-root');
      if (!cartDrawerRoot) {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.style.paddingRight = '';
      }
    };
  }, [isAuthModalOpen]);

  /* =========================================================
     ESCAPE KEY
  ========================================================= */

  /* =========================================================
       PREVENT BACKGROUND SCROLL (SOLID LOCK)
    ========================================================= */

  useEffect(() => {
    if (!isAuthModalOpen) return;

    // حساب عرض السكرول بار لمنع اهتزاز الصفحة على الديسكتوب
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const scrollY = window.scrollY;

    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const originalPaddingRight = document.body.style.paddingRight;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    // قفل كامل على HTML و Body
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      const cartDrawerRoot = document.getElementById('cart-drawer-root');
      if (!cartDrawerRoot) {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        document.body.style.paddingRight = originalPaddingRight;

        // استرجاع نفس موضع التمرير اللي كان المستخدم واقف عليه
        window.scrollTo(0, scrollY);
      }
    };
  }, [isAuthModalOpen]);
  if (!isAuthModalOpen) {
    return null;
  }

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeModal = () => {
    if (submitting) return;

    setIsForgotSuccessModalOpen(false);
    setIsAuthModalOpen(false);

    setForgotPassword(false);
    setError('');

    setShowPassword(false);
    setShowRegisterPassword(false);

    setAvatarPreview(DEFAULT_AVATAR);
  };

  /* =========================================================
     SWITCH TAB
  ========================================================= */

  const switchTab = (
    tab: 'login' | 'register'
  ) => {
    if (submitting) return;

    setAuthModalTab(tab);

    setForgotPassword(false);
    setError('');

    if (tab === 'register') {
      setAvatarPreview(DEFAULT_AVATAR);
    }
  };

  /* =========================================================
     USERNAME
  ========================================================= */

  const handleUsernameChange = (
    value: string
  ) => {
    const cleanedValue =
      value
        .replace(/[^\p{L}\p{N}_\- ]/gu, '')
        .slice(0, MAX_USERNAME_LENGTH);

    setUsername(cleanedValue);
  };

  /* =========================================================
     AVATAR
  ========================================================= */

  const handleAvatarChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(
        'من فضلك اختار صورة صحيحة.'
      );
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        'حجم الصورة لازم يكون أقل من 5 ميجابايت.'
      );
      return;
    }

    setError('');

    const reader =
      new FileReader();

    reader.onloadend = () => {
      if (
        typeof reader.result ===
        'string'
      ) {
        setAvatarPreview(
          reader.result
        );
      }
    };

    reader.readAsDataURL(file);
  };

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleLogin = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError('');

    const normalizedUsername =
      username.trim();

    if (!normalizedUsername) {
      setError(
        'من فضلك اكتب اسم المستخدم.'
      );
      return;
    }

    if (
      normalizedUsername.length <
      MIN_USERNAME_LENGTH
    ) {
      setError(
        'اسم المستخدم قصير جدًا.'
      );
      return;
    }

    const isEmail = normalizedUsername.includes('@');
    if (
      !isEmail &&
      !USERNAME_REGEX.test(
        normalizedUsername
      )
    ) {
      setError(
        'اسم المستخدم يحتوي على رموز غير مسموحة.'
      );
      return;
    }

    if (!password) {
      setError(
        'اكتب كلمة السر لو سمحت.'
      );
      return;
    }

    try {
      setSubmitting(true);

      await login(
        normalizedUsername,
        password
      );

      setIsAuthModalOpen(false);

      setUsername('');
      setPassword('');
      setError('');
    } catch (err: any) {
      setError(
        err?.message ||
        'اسم المستخدم أو كلمة السر مش مظبوطين، راجعهم كده.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     REGISTER
  ========================================================= */

  const handleRegister = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError('');

    const normalizedUsername =
      username.trim();

    const normalizedName =
      name.trim();

    const normalizedPhone =
      phone.trim();

    const normalizedWorkshop =
      workshopName.trim();

    if (!normalizedUsername) {
      setError(
        'من فضلك اكتب اسم المستخدم.'
      );
      return;
    }

    if (
      normalizedUsername.length <
      MIN_USERNAME_LENGTH
    ) {
      setError(
        'اسم المستخدم لازم يكون حرفين على الأقل.'
      );
      return;
    }

    if (
      normalizedUsername.length >
      MAX_USERNAME_LENGTH
    ) {
      setError(
        'اسم المستخدم طويل جدًا.'
      );
      return;
    }

    if (
      !USERNAME_REGEX.test(
        normalizedUsername
      )
    ) {
      setError(
        'اسم المستخدم يسمح بالعربي والإنجليزي والأرقام والمسافات فقط.'
      );
      return;
    }

    if (!normalizedName) {
      setError(
        'من فضلك اكتب الاسم بالكامل.'
      );
      return;
    }

    if (password.length < 6) {
      setError(
        'كلمة السر لازم تكون 6 حروف على الأقل.'
      );
      return;
    }

    if (!normalizedPhone) {
      setError(
        'من فضلك اكتب رقم الموبايل.'
      );
      return;
    }

    if (
      roleType === 'seller' &&
      !normalizedWorkshop
    ) {
      setError(
        'من فضلك اكتب اسم الورشة أو المشروع.'
      );
      return;
    }

    try {
      setSubmitting(true);

      await register({
        username:
          normalizedUsername,

        password,

        name:
          normalizedName,

        phone:
          normalizedPhone,

        email:
          email.trim() ||
          undefined,

        governorate:
          governorate ||
          undefined,

        role:
          roleType,

        workshopName:
          roleType === 'seller'
            ? normalizedWorkshop
            : undefined,

        avatar:
          avatarPreview ||
          DEFAULT_AVATAR,
      });

      addToast(
        'تم إنشاء الحساب بنجاح 🎉',
        'success'
      );

      setIsAuthModalOpen(false);

      setUsername('');
      setPassword('');
      setName('');
      setPhone('');
      setEmail('');
      setGovernorate('');
      setWorkshopName('');

      setRoleType('buyer');

      setAvatarPreview(
        DEFAULT_AVATAR
      );

      if (
        avatarInputRef.current
      ) {
        avatarInputRef.current.value =
          '';
      }
    } catch (err: any) {
      setError(
        err?.message ||
        'حصلت مشكلة أثناء إنشاء الحساب. حاول تاني.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     FORGOT PASSWORD
  ========================================================= */

  const handleForgotPassword =
    async (
      event: React.FormEvent
    ) => {
      event.preventDefault();

      if (submitting) return;

      setError('');

      const trimmedIdentifier = forgotIdentifier.trim();
      if (!trimmedIdentifier) {
        setError(
          'اكتب اسم المستخدم أو الإيميل بتاعك.'
        );
        return;
      }

      try {
        setSubmitting(true);

        const res = await api.requestPasswordReset(
          trimmedIdentifier
        );

        // Determine email hint:
        // Pass user's entered email when an email was entered.
        // If username was entered, do not display username as email and avoid enumeration.
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedIdentifier);
        const emailHint = isEmail ? trimmedIdentifier : undefined;

        setForgotSuccessEmailHint(emailHint);
        setForgotSuccessMessage(res?.message);
        setIsForgotSuccessModalOpen(true);

        // Reset inline forgot-password form back to login tab so when modal closes, user is on login
        setForgotPassword(false);
        setForgotIdentifier('');
        setAuthModalTab('login');
      } catch (err: any) {
        // Do NOT open modal on failure
        setIsForgotSuccessModalOpen(false);
        setError(
          err?.message ||
          'حصلت مشكلة وإحنا بنبعت طلب استرجاع كلمة السر، جرّب تاني.'
        );
      } finally {
        setSubmitting(false);
      }
    };

  /* =========================================================
     DESIGN TOKENS
  ========================================================= */

  const inputClass = `
    w-full
    min-w-0
    h-[54px]
    sm:h-[58px]
    rounded-2xl
    border
    border-black/10
    bg-white/80
    px-11
    sm:px-12
    text-[15px]
    sm:text-[16px]
    font-medium
    text-[#211d18]
    outline-none
    transition-all
    duration-200
    placeholder:text-black/35
    focus:border-[#9a6a35]
    focus:bg-white
    focus:ring-4
    focus:ring-[#9a6a35]/10
    dark:border-white/10
    dark:bg-white/5
    dark:text-[#f5f0e7]
    dark:placeholder:text-white/30
    dark:focus:border-[#9a6a35]
    dark:focus:bg-[#151513]
    dark:focus:ring-[#9a6a35]/10
  `;

  const labelClass = `
    mb-2
    block
    text-[13px]
    sm:text-[14px]
    font-black
    text-[#211d18]
    dark:text-[#f5f0e7]
  `;

  const iconClass = `
    pointer-events-none
    absolute
    right-3.5
    sm:right-4
    top-1/2
    -translate-y-1/2
    text-black/40
    dark:text-white/40
  `;

  const primaryButton = `
    flex
    min-h-[54px]
    sm:min-h-[58px]
    w-full
    items-center
    justify-center
    gap-2
    rounded-2xl
    bg-[#211d18]
    text-white
    dark:bg-white
    dark:text-black
    px-4
    sm:px-5
    text-[15px]
    sm:text-[16px]
    font-black
    shadow-lg
    transition-all
    duration-200
    hover:bg-[#9a6a35]
    dark:hover:bg-[#d5a56d]
    active:scale-[0.99]
    disabled:cursor-not-allowed
    disabled:opacity-60
  `;

  /* =========================================================
     RENDER
  ========================================================= */

  if (!isAuthModalOpen) return null;

  return (
    <div
      id="auth-modal-backdrop"
      dir="rtl"
      onTouchMove={(e) => {
        // منع سحب الخلفية باللمس لو اللمس تم على الـ Backdrop نفسه
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      className="
        fixed
        inset-0
        z-[160]
        flex
        items-center
        justify-center
        overflow-hidden
        bg-black/70
        px-3
        py-3
        sm:px-4
        sm:py-5
        md:px-6
        backdrop-blur-xl
        touch-none
      "

    >
      {/* =====================================================
          MODAL
      ===================================================== */}

      <div
        className="
          relative
          flex
          w-full
          min-w-0
          max-w-[540px]
          max-h-[calc(100dvh-16px)]
          sm:max-h-[calc(100dvh-40px)]
          flex-col
          overflow-hidden
          rounded-[2rem]
          border
          border-black/10
          bg-[#eee8dc]
          shadow-2xl
          dark:border-white/10
          dark:bg-[#151513]
          backdrop-blur-2xl
        "
      >
        {/* =================================================
            BRAND HEADER
        ================================================== */}

        <div
          className="
            relative
            shrink-0
            overflow-hidden
            border-b
            border-black/10
            bg-white/70
            px-4
            pb-4
            pt-4
            sm:px-7
            sm:pb-6
            sm:pt-6
            dark:border-white/10
            dark:bg-[#1c1a17]/80
            backdrop-blur-xl
          "
        >
          {/* Decorative circles */}
          <div
            className="
              pointer-events-none
              absolute
              -left-16
              -top-20
              h-48
              w-48
              rounded-full
              border
              border-[#9a6a35]/15
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -left-8
              -top-12
              h-32
              w-32
              rounded-full
              border
              border-[#9a6a35]/15
            "
          />

          {/* Close Button */}
          <button
            id="auth-modal-close"
            type="button"
            onClick={closeModal}
            disabled={submitting}
            aria-label="إغلاق"
            className="
              absolute
              left-2.5
              top-2.5
              sm:left-4
              sm:top-4
              z-20
              flex
              h-10
              w-10
              sm:h-11
              sm:w-11
              items-center
              justify-center
              rounded-full
              border
              border-black/10
              bg-white/80
              text-[#211d18]
              backdrop-blur-sm
              transition-all
              hover:border-[#9a6a35]
              hover:bg-[#9a6a35]
              hover:text-white
              dark:border-white/10
              dark:bg-white/5
              dark:text-[#f5f0e7]
              dark:hover:border-[#9a6a35]
              dark:hover:bg-[#9a6a35]
              dark:hover:text-white
              cursor-pointer
            "
          >
            <X size={18} />
          </button>

          {/* Brand */}
          <div className="relative z-10 flex min-w-0 items-center gap-3">
            <div
              className="
                flex
                h-12
                w-12
                sm:h-14
                sm:w-14
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-2xl
                bg-[#9a6a35]
                text-white
                shadow-md
              "
            >
              <img
                src="https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png"
                alt="WAH"
                className="
                  h-full
                  w-full
                  object-contain
                  p-1
                "
              />
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-[9px]
                  sm:text-[10px]
                  font-black
                  tracking-[0.25em]
                  text-[#9a6a35]
                "
              >
                WAH
              </p>

              <p className="mt-0.5 truncate text-[14px] sm:text-[16px] font-black text-[#211d18] dark:text-[#f5f0e7]">
                من هنا تبدأ الحكاية
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-3 flex items-center gap-2 sm:mt-4 sm:gap-3">
            <span className="h-px w-6 sm:w-8 bg-[#9a6a35]" />

            <span className="text-[11px] sm:text-[12px] font-bold text-black/60 dark:text-white/60">
              حكايات الصعيد أقرب ليك
            </span>
          </div>
        </div>

        {/* =================================================
            SCROLLABLE CONTENT
        ================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-x-hidden
            overflow-y-auto
            overscroll-contain
            touch-pan-y
            [scrollbar-width:thin]
          "
        >
          <div
            className="
              mx-auto
              w-full
              min-w-0
              px-4
              py-5
              sm:px-7
              sm:py-7
              md:px-8
              md:py-8
            "
          >
            {/* =================================================
                HEADING
            ================================================== */}

            <div className="mb-5 sm:mb-7">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles
                  size={15}
                  className="shrink-0 text-[#9a6a35]"
                />

                <span className="text-[10px] sm:text-[11px] font-black tracking-[0.1em] text-[#9a6a35]">
                  {forgotPassword
                    ? 'ACCOUNT RECOVERY'
                    : authModalTab === 'login'
                      ? 'WELCOME BACK'
                      : 'JOIN WAH'}
                </span>
              </div>

              <h2
                className="
                  text-[23px]
                  leading-tight
                  font-black
                  tracking-tight
                  text-[#211d18]
                  dark:text-[#f5f0e7]
                  sm:text-[28px]
                  md:text-[30px]
                "
              >
                {forgotPassword
                  ? 'استرجاع كلمة السر'
                  : authModalTab === 'login'
                    ? 'أهلاً بيك في وه'
                    : 'انضم لعيلة وه'}
              </h2>

              <p
                className="
                  mt-2
                  text-[13px]
                  leading-6
                  text-black/60
                  dark:text-white/60
                  sm:text-[14px]
                  sm:leading-7
                  font-medium
                "
              >
                {forgotPassword
                  ? 'اكتب بيانات حسابك وهنساعدك في استرجاعه.'
                  : authModalTab === 'login'
                    ? 'كمل رحلتك واكتشف حكايات الصعيد.'
                    : 'اعمل حسابك بسهولة وابدأ رحلتك مع وه.'}
              </p>
            </div>

            {/* =================================================
                ERROR
            ================================================== */}

            {error && (
              <div
                className="
                  mb-5
                  flex
                  min-w-0
                  items-start
                  gap-2.5
                  rounded-2xl
                  border
                  border-red-200
                  bg-red-50
                  px-3.5
                  py-3
                  text-[13px]
                  font-medium
                  leading-6
                  text-red-700
                  dark:border-red-900/40
                  dark:bg-red-950/20
                  dark:text-red-300
                  sm:px-4
                  sm:py-3.5
                  sm:text-[14px]
                "
              >
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />

                <span className="min-w-0 break-words">
                  {error}
                </span>
              </div>
            )}

            {/* =================================================
                FORGOT PASSWORD
            ================================================== */}

            {forgotPassword ? (
              <form
                onSubmit={handleForgotPassword}
                className="space-y-4 sm:space-y-5"
              >
                <div
                  className="
                    rounded-[1.5rem]
                    border
                    border-black/10
                    bg-white/60
                    p-4
                    sm:p-5
                    dark:border-white/10
                    dark:bg-white/5
                    backdrop-blur-xl
                  "
                >
                  <div className="mb-4 flex min-w-0 items-center gap-3 sm:mb-5">
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        sm:h-12
                        sm:w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        bg-[#9a6a35]/10
                        text-[#9a6a35]
                      "
                    >
                      <KeyRound size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[14px] sm:text-[15px] font-black text-[#211d18] dark:text-[#f5f0e7]">
                        نسيت كلمة السر؟
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-black/60 dark:text-white/60 sm:text-[12px] sm:leading-6 font-medium">
                        اكتب الإيميل أو اسم المستخدم وهنبعتلك رابط لإعادة تعيين كلمة السر.
                      </p>
                    </div>
                  </div>

                  <label
                    htmlFor="forgot-identifier-input"
                    className={labelClass}
                  >
                    الإيميل أو اسم المستخدم
                  </label>

                  <div className="relative">
                    <User
                      size={19}
                      className={iconClass}
                    />

                    <input
                      id="forgot-identifier-input"
                      type="text"
                      value={forgotIdentifier}
                      onChange={(e) =>
                        setForgotIdentifier(
                          e.target.value
                        )
                      }
                      placeholder="الإيميل أو اسم المستخدم"
                      className={inputClass}
                      autoComplete="username"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={primaryButton}
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={20}
                        className="animate-spin"
                      />
                      جاري إرسال الرابط...
                    </>
                  ) : (
                    <>
                      إرسال رابط إعادة التعيين
                      <ArrowLeft size={18} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForgotPassword(false);
                    setError('');
                  }}
                  className="
                    flex
                    min-h-[46px]
                    sm:min-h-[48px]
                    w-full
                    items-center
                    justify-center
                    gap-2
                    py-2
                    text-[13px]
                    sm:text-[14px]
                    font-black
                    text-black/60
                    dark:text-white/60
                    transition-colors
                    hover:text-[#9a6a35]
                    dark:hover:text-[#9a6a35]
                    cursor-pointer
                  "
                >
                  <ArrowRight size={17} />
                  رجوع لتسجيل الدخول
                </button>
              </form>
            ) : (
              <>
                {/* =================================================
                    TABS
                ================================================== */}

                <div
                  className="
                    mb-5
                    grid
                    grid-cols-2
                    rounded-2xl
                    border
                    border-black/10
                    bg-white/50
                    p-1
                    dark:border-white/10
                    dark:bg-white/5
                    backdrop-blur-xl
                  "
                >
                  <button
                    id="tab-login"
                    type="button"
                    onClick={() =>
                      switchTab('login')
                    }
                    className={`
                      flex
                      min-h-[46px]
                      sm:min-h-[48px]
                      items-center
                      justify-center
                      gap-1.5
                      sm:gap-2
                      rounded-xl
                      px-2
                      text-[13px]
                      sm:text-[14px]
                      font-black
                      transition-all
                      cursor-pointer
                      ${authModalTab === 'login'
                        ? `
                              bg-[#211d18]
                              text-white
                              dark:bg-white
                              dark:text-black
                              shadow-md
                            `
                        : `
                              text-black/60
                              hover:text-[#9a6a35]
                              dark:text-white/60
                              dark:hover:text-[#9a6a35]
                            `
                      }
                    `}
                  >
                    <User size={17} />
                    <span>ادخل لحسابك</span>
                  </button>

                  <button
                    id="tab-register"
                    type="button"
                    onClick={() =>
                      switchTab('register')
                    }
                    className={`
                      flex
                      min-h-[46px]
                      sm:min-h-[48px]
                      items-center
                      justify-center
                      gap-1.5
                      sm:gap-2
                      rounded-xl
                      px-2
                      text-[13px]
                      sm:text-[14px]
                      font-black
                      transition-all
                      cursor-pointer
                      ${authModalTab === 'register'
                        ? `
                              bg-[#211d18]
                              text-white
                              dark:bg-white
                              dark:text-black
                              shadow-md
                            `
                        : `
                              text-black/60
                              hover:text-[#9a6a35]
                              dark:text-white/60
                              dark:hover:text-[#9a6a35]
                            `
                      }
                    `}
                  >
                    <Sparkles size={16} />
                    <span>اعمل حساب جديد</span>
                  </button>
                </div>

                {/* =================================================
                    LOGIN
                ================================================== */}

                {authModalTab === 'login' && (
                  <form
                    onSubmit={handleLogin}
                    className="space-y-4 sm:space-y-5"
                  >
                    {/* Username */}
                    <div>
                      <label
                        htmlFor="login-username-input"
                        className={labelClass}
                      >
                        اسم المستخدم
                        <span className="mr-1 text-[#9a6a35]">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <User
                          size={20}
                          className={iconClass}
                        />

                        <input
                          id="login-username-input"
                          type="text"
                          value={username}
                          onChange={(e) =>
                            handleUsernameChange(
                              e.target.value
                            )
                          }
                          placeholder="مثال: محمد123"
                          className={inputClass}
                          autoComplete="username"
                          autoCapitalize="none"
                          spellCheck={false}
                        />
                      </div>

                      <div
                        className="
                          mt-2
                          flex
                          min-w-0
                          items-start
                          gap-2
                          rounded-2xl
                          border
                          border-[#9a6a35]/20
                          bg-[#9a6a35]/10
                          px-3.5
                          py-2.5
                          sm:py-3
                          text-[11px]
                          leading-5
                          sm:text-[12px]
                          sm:leading-6
                          text-[#211d18]
                          dark:text-[#f5f0e7]
                        "
                      >
                        <Info
                          size={15}
                          className="mt-0.5 shrink-0 text-[#9a6a35]"
                        />

                        <span className="min-w-0">
                          اكتب نفس اسم المستخدم اللي عملت بيه الحساب.
                          <strong className="mr-1 text-[#9a6a35]">
                            ينفع يكون بالعربي.
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label
                        htmlFor="login-password-input"
                        className={labelClass}
                      >
                        كلمة السر
                        <span className="mr-1 text-[#9a6a35]">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <Lock
                          size={20}
                          className={iconClass}
                        />

                        <input
                          id="login-password-input"
                          type={
                            showPassword
                              ? 'text'
                              : 'password'
                          }
                          value={password}
                          onChange={(e) =>
                            setPassword(
                              e.target.value
                            )
                          }
                          placeholder="اكتب كلمة السر"
                          className={`${inputClass} pl-11 sm:pl-12`}
                          autoComplete="current-password"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              !showPassword
                            )
                          }
                          className="
                            absolute
                            left-1.5
                            sm:left-2
                            top-1/2
                            flex
                            h-10
                            w-10
                            sm:h-11
                            sm:w-11
                            -translate-y-1/2
                            items-center
                            justify-center
                            rounded-xl
                            text-black/50
                            transition-all
                            hover:bg-black/5
                            hover:text-[#9a6a35]
                            dark:text-white/50
                            dark:hover:bg-white/5
                            dark:hover:text-[#9a6a35]
                            cursor-pointer
                          "
                          aria-label={
                            showPassword
                              ? 'إخفاء كلمة السر'
                              : 'إظهار كلمة السر'
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotPassword(true);
                          setError('');
                        }}
                        className="
                          min-h-[42px]
                          text-[12px]
                          sm:text-[13px]
                          font-bold
                          text-[#9a6a35]
                          transition-colors
                          hover:underline
                          cursor-pointer
                        "
                      >
                        نسيت كلمة السر؟
                      </button>

                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-black/50 dark:text-white/50 font-medium">
                        <ShieldCheck size={14} />
                        بياناتك محمية
                      </div>
                    </div>

                    <button
                      id="auth-submit-btn"
                      type="submit"
                      disabled={submitting}
                      className={primaryButton}
                    >
                      {submitting ? (
                        <>
                          <Loader2
                            size={21}
                            className="animate-spin"
                          />
                          جاري الدخول...
                        </>
                      ) : (
                        <>
                          دخول
                          <ArrowLeft size={19} />
                        </>
                      )}
                    </button>

                    <div className="pt-0.5 text-center">
                      <p className="text-[12px] sm:text-[13px] text-black/60 dark:text-white/60 font-medium">
                        مشترك جديد؟
                        <button
                          type="button"
                          onClick={() =>
                            switchTab('register')
                          }
                          className="
                            mr-1.5
                            font-black
                            text-[#9a6a35]
                            hover:underline
                            cursor-pointer
                          "
                        >
                          اعمل حسابك بسهولة
                        </button>
                      </p>
                    </div>
                  </form>
                )}

                {/* =================================================
                    REGISTER
                ================================================== */}

                {authModalTab === 'register' && (
                  <form
                    onSubmit={handleRegister}
                    className="space-y-4 sm:space-y-5"
                  >
                    {/* Role */}
                    <div>
                      <label className={labelClass}>
                        هتستخدم وه إزاي؟
                      </label>

                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        {/* Buyer */}
                        <button
                          id="role-buyer-select"
                          type="button"
                          onClick={() =>
                            setRoleType('buyer')
                          }
                          className={`
                            relative
                            flex
                            min-h-[84px]
                            sm:min-h-[92px]
                            min-w-0
                            flex-col
                            items-center
                            justify-center
                            gap-1.5
                            sm:gap-2
                            rounded-2xl
                            border
                            px-2
                            transition-all
                            cursor-pointer
                            ${roleType === 'buyer'
                              ? `
                                    border-[#9a6a35]
                                    bg-[#9a6a35]/10
                                    text-[#9a6a35]
                                    shadow-sm
                                  `
                              : `
                                    border-black/10
                                    dark:border-white/10
                                    bg-white/60
                                    dark:bg-white/5
                                    text-black/70
                                    dark:text-white/70
                                    hover:border-[#9a6a35]/40
                                  `
                            }
                          `}
                        >
                          {roleType === 'buyer' && (
                            <span className="absolute left-2.5 top-2.5 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#9a6a35] text-white">
                              <Check size={13} />
                            </span>
                          )}

                          <UserRound size={22} />

                          <span className="text-[14px] sm:text-[15px] font-black">
                            مشتري
                          </span>

                          <span className="text-[10px] sm:text-[11px] opacity-70 font-medium">
                            أكتشف واشتري
                          </span>
                        </button>

                        {/* Seller */}
                        <button
                          id="role-seller-select"
                          type="button"
                          onClick={() =>
                            setRoleType('seller')
                          }
                          className={`
                            relative
                            flex
                            min-h-[84px]
                            sm:min-h-[92px]
                            min-w-0
                            flex-col
                            items-center
                            justify-center
                            gap-1.5
                            sm:gap-2
                            rounded-2xl
                            border
                            px-2
                            transition-all
                            cursor-pointer
                            ${roleType === 'seller'
                              ? `
                                    border-[#211d18]
                                    dark:border-white
                                    bg-[#211d18]/10
                                    dark:bg-white/10
                                    text-[#211d18]
                                    dark:text-white
                                    shadow-sm
                                  `
                              : `
                                    border-black/10
                                    dark:border-white/10
                                    bg-white/60
                                    dark:bg-white/5
                                    text-black/70
                                    dark:text-white/70
                                    hover:border-black/30
                                  `
                            }
                          `}
                        >
                          {roleType === 'seller' && (
                            <span className="absolute left-2.5 top-2.5 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#211d18] text-white dark:bg-white dark:text-black">
                              <Check size={13} />
                            </span>
                          )}

                          <Store size={22} />

                          <span className="text-[14px] sm:text-[15px] font-black">
                            بائع
                          </span>

                          <span className="text-[10px] sm:text-[11px] opacity-70 font-medium">
                            أعرض منتجاتي
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Avatar */}
                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                        sm:gap-4
                        rounded-2xl
                        border
                        border-black/10
                        bg-white/60
                        p-3
                        sm:p-4
                        dark:border-white/10
                        dark:bg-white/5
                        backdrop-blur-xl
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          avatarInputRef.current?.click()
                        }
                        className="
                          group
                          relative
                          flex
                          h-[60px]
                          w-[60px]
                          sm:h-[68px]
                          sm:w-[68px]
                          shrink-0
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-2xl
                          bg-black/5
                          dark:bg-white/5
                          cursor-pointer
                        "
                        aria-label="اختيار صورة الحساب"
                      >
                        <img
                          src={
                            avatarPreview ||
                            DEFAULT_AVATAR
                          }
                          alt="الصورة الشخصية"
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                          onError={(event) => {
                            event.currentTarget.onerror =
                              null;

                            event.currentTarget.src =
                              DEFAULT_AVATAR;
                          }}
                        />

                        <span
                          className="
                            absolute
                            inset-0
                            flex
                            items-center
                            justify-center
                            bg-[#9a6a35]/90
                            text-white
                            opacity-0
                            transition-opacity
                            group-hover:opacity-100
                            group-focus-visible:opacity-100
                          "
                        >
                          <Camera size={20} />
                        </span>
                      </button>

                      <input
                        ref={avatarInputRef}
                        id="register-avatar-input"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={
                          handleAvatarChange
                        }
                      />

                      <div className="min-w-0">
                        <p className="text-[13px] sm:text-[14px] font-black text-[#211d18] dark:text-[#f5f0e7]">
                          صورة الحساب
                        </p>

                        <p className="mt-0.5 text-[11px] leading-5 text-black/60 dark:text-white/60 sm:text-[12px] font-medium">
                          اختيارية — لو مش عايز ترفع صورة، هنستخدم الصورة الافتراضية.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            avatarInputRef.current?.click()
                          }
                          className="
                            mt-1
                            text-[11px]
                            sm:text-[12px]
                            font-black
                            text-[#9a6a35]
                            hover:underline
                            cursor-pointer
                          "
                        >
                          تغيير الصورة
                        </button>
                      </div>
                    </div>

                    {/* Username */}
                    <div>
                      <label
                        htmlFor="register-username-input"
                        className={labelClass}
                      >
                        اسم المستخدم
                        <span className="mr-1 text-[#9a6a35]">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <User
                          size={20}
                          className={iconClass}
                        />

                        <input
                          id="register-username-input"
                          type="text"
                          value={username}
                          onChange={(e) =>
                            handleUsernameChange(
                              e.target.value
                            )
                          }
                          placeholder="مثال: محمد123"
                          className={inputClass}
                          autoComplete="username"
                          autoCapitalize="none"
                          spellCheck={false}
                        />
                      </div>

                      <div
                        className="
                          mt-2
                          rounded-2xl
                          border
                          border-[#9a6a35]/20
                          bg-[#9a6a35]/10
                          px-3.5
                          py-2.5
                          sm:py-3
                          dark:border-[#9a6a35]/30
                        "
                      >
                        <div className="flex min-w-0 items-start gap-2">
                          <Info
                            size={16}
                            className="mt-0.5 shrink-0 text-[#9a6a35]"
                          />

                          <div className="min-w-0 text-[11px] leading-5 text-[#211d18] dark:text-[#f5f0e7] sm:text-[12px] font-medium">
                            <p>
                              <strong className="text-[#9a6a35]">
                                مهم:
                              </strong>{' '}
                              ده اسمك في وه والاسم اللي هتستخدمه لتسجيل الدخول بعد كده.
                            </p>

                            <p className="mt-1 text-[10px] opacity-80 sm:text-[11px]">
                              ينفع تكتبه بالعربي أو الإنجليزي، زي: محمد123 أو mohanad.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label
                        htmlFor="register-name-input"
                        className={labelClass}
                      >
                        الاسم بالكامل
                        <span className="mr-1 text-[#9a6a35]">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <UserRound
                          size={20}
                          className={iconClass}
                        />

                        <input
                          id="register-name-input"
                          type="text"
                          value={name}
                          onChange={(e) =>
                            setName(
                              e.target.value
                            )
                          }
                          placeholder="اكتب اسمك بالكامل"
                          className={inputClass}
                          autoComplete="name"
                        />
                      </div>
                    </div>

                    {/* Workshop */}
                    {roleType === 'seller' && (
                      <div>
                        <label
                          htmlFor="register-workshop-input"
                          className={labelClass}
                        >
                          اسم الورشة أو المشروع
                          <span className="mr-1 text-[#9a6a35]">
                            *
                          </span>
                        </label>

                        <div className="relative">
                          <Store
                            size={20}
                            className={iconClass}
                          />

                          <input
                            id="register-workshop-input"
                            type="text"
                            value={workshopName}
                            onChange={(e) =>
                              setWorkshopName(
                                e.target.value
                              )
                            }
                            placeholder="مثال: ورشة فخار"
                            className={inputClass}
                            autoComplete="organization"
                          />
                        </div>
                      </div>
                    )}

                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="register-phone-input"
                        className={labelClass}
                      >
                        رقم الموبايل
                        <span className="mr-1 text-[#9a6a35]">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <Phone
                          size={20}
                          className={iconClass}
                        />

                        <input
                          id="register-phone-input"
                          type="tel"
                          value={phone}
                          onChange={(e) =>
                            setPhone(
                              e.target.value
                            )
                          }
                          placeholder="01xxxxxxxxx"
                          className={inputClass}
                          autoComplete="tel"
                          inputMode="tel"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Governorate */}
                    <div>
                      <label
                        htmlFor="register-governorate-select"
                        className={labelClass}
                      >
                        المحافظة
                      </label>

                      <div className="relative">
                        <MapPin
                          size={20}
                          className={iconClass}
                        />

                        <select
                          id="register-governorate-select"
                          value={governorate}
                          onChange={(e) =>
                            setGovernorate(
                              e.target.value
                            )
                          }
                          className={`${inputClass} cursor-pointer appearance-none`}
                        >
                          <option value="">
                            اختار المحافظة
                          </option>

                          <option value="أسيوط">
                            أسيوط
                          </option>

                          <option value="سوهاج">
                            سوهاج
                          </option>

                          <option value="قنا">
                            قنا
                          </option>

                          <option value="الأقصر">
                            الأقصر
                          </option>

                          <option value="أسوان">
                            أسوان
                          </option>

                          <option value="المنيا">
                            المنيا
                          </option>

                          <option value="بني سويف">
                            بني سويف
                          </option>

                          <option value="الفيوم">
                            الفيوم
                          </option>

                          <option value="الوادي الجديد">
                            الوادي الجديد
                          </option>

                          <option value="القاهرة">
                            القاهرة
                          </option>

                          <option value="الجيزة">
                            الجيزة
                          </option>

                          <option value="الإسكندرية">
                            الإسكندرية
                          </option>

                          <option value="أخرى">
                            محافظة أخرى
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="register-email-input"
                        className={labelClass}
                      >
                        البريد الإلكتروني

                        <span className="mr-1 text-[11px] sm:text-[12px] font-normal text-black/50 dark:text-white/50">
                          اختياري
                        </span>
                      </label>

                      <div className="relative">
                        <Mail
                          size={20}
                          className={iconClass}
                        />

                        <input
                          id="register-email-input"
                          type="email"
                          value={email}
                          onChange={(e) =>
                            setEmail(
                              e.target.value
                            )
                          }
                          placeholder="example@email.com"
                          className={inputClass}
                          autoComplete="email"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label
                        htmlFor="register-password-input"
                        className={labelClass}
                      >
                        كلمة السر
                        <span className="mr-1 text-[#9a6a35]">
                          *
                        </span>
                      </label>

                      <div className="relative">
                        <Lock
                          size={20}
                          className={iconClass}
                        />

                        <input
                          id="register-password-input"
                          type={
                            showRegisterPassword
                              ? 'text'
                              : 'password'
                          }
                          value={password}
                          onChange={(e) =>
                            setPassword(
                              e.target.value
                            )
                          }
                          placeholder="6 حروف على الأقل"
                          className={`${inputClass} pl-11 sm:pl-12`}
                          autoComplete="new-password"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowRegisterPassword(
                              !showRegisterPassword
                            )
                          }
                          className="
                            absolute
                            left-1.5
                            sm:left-2
                            top-1/2
                            flex
                            h-10
                            w-10
                            sm:h-11
                            sm:w-11
                            -translate-y-1/2
                            items-center
                            justify-center
                            rounded-xl
                            text-black/50
                            transition-all
                            hover:bg-black/5
                            hover:text-[#9a6a35]
                            dark:text-white/50
                            dark:hover:bg-white/5
                            dark:hover:text-[#9a6a35]
                            cursor-pointer
                          "
                          aria-label={
                            showRegisterPassword
                              ? 'إخفاء كلمة السر'
                              : 'إظهار كلمة السر'
                          }
                        >
                          {showRegisterPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>

                      <p className="mt-2 text-[11px] leading-5 text-black/60 dark:text-white/60 sm:text-[12px] font-medium">
                        اختار كلمة سر تعرف تفتكرها كويس، ولازم تكون 6 حروف على الأقل.
                      </p>
                    </div>

                    {/* Submit */}
                    <button
                      id="auth-submit-btn"
                      type="submit"
                      disabled={submitting}
                      className={primaryButton}
                    >
                      {submitting ? (
                        <>
                          <Loader2
                            size={21}
                            className="animate-spin"
                          />

                          بنعمل حسابك دلوقتي...
                        </>
                      ) : (
                        <>
                          سجّل حسابك دلوقتي
                          <ArrowLeft size={19} />
                        </>
                      )}
                    </button>

                    <div
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        pb-1
                        text-center
                        text-[11px]
                        leading-5
                        text-black/60
                        dark:text-white/60
                        sm:text-[12px]
                        font-medium
                      "
                    >
                      <ShieldCheck
                        size={15}
                        className="shrink-0 text-[#9a6a35]"
                      />

                      <span>
                        بياناتك في أمان وتقدر تعدلها في أي وقت.
                      </span>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          FORGOT PASSWORD SUCCESS MODAL
      ===================================================== */}
      <ForgotPasswordModal
        isOpen={isForgotSuccessModalOpen}
        onClose={() => setIsForgotSuccessModalOpen(false)}
        emailHint={forgotSuccessEmailHint}
        message={forgotSuccessMessage}
      />
    </div>
  );
};

export interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      {/* محتوى نافذة التسجيل */}
    </div>
  );
}

export default AuthModal;
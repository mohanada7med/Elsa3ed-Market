import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
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
    if (!isAuthModalOpen) return;

    const previousBodyOverflow =
      document.body.style.overflow;

    const previousHtmlOverflow =
      document.documentElement.style.overflow;

    const previousBodyPaddingRight =
      document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth -
      document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight =
        `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow =
        previousBodyOverflow;

      document.documentElement.style.overflow =
        previousHtmlOverflow;

      document.body.style.paddingRight =
        previousBodyPaddingRight;
    };
  }, [isAuthModalOpen]);

  /* =========================================================
     ESCAPE KEY
  ========================================================= */

  useEffect(() => {
    if (!isAuthModalOpen) return;

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === 'Escape' &&
        !submitting
      ) {
        setIsAuthModalOpen(false);
      }
    };

    document.addEventListener(
      'keydown',
      handleEscape
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, [
    isAuthModalOpen,
    submitting,
    setIsAuthModalOpen,
  ]);

  if (!isAuthModalOpen) {
    return null;
  }

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeModal = () => {
    if (submitting) return;

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

    if (
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
        'من فضلك اكتب كلمة المرور.'
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
        'اسم المستخدم أو كلمة المرور غير صحيحة.'
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
        'كلمة المرور لازم تكون 6 أحرف على الأقل.'
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

      setError('');

      if (
        !forgotIdentifier.trim()
      ) {
        setError(
          'اكتب اسم المستخدم أو البريد الإلكتروني.'
        );
        return;
      }

      try {
        setSubmitting(true);

        await api.requestPasswordReset(
          forgotIdentifier.trim()
        );

        addToast(
          'تم إرسال طلب استعادة كلمة المرور للإدارة.',
          'success'
        );

        setForgotPassword(false);
        setForgotIdentifier('');
      } catch (err: any) {
        setError(
          err?.message ||
          'حصلت مشكلة أثناء إرسال طلب استعادة كلمة المرور.'
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
    h-[56px]
    sm:h-[60px]
    rounded-[15px]
    sm:rounded-[17px]
    border
    border-[#DDD2C8]
    bg-[#FCFAF7]
    px-11
    sm:px-12
    text-[15px]
    sm:text-[16px]
    font-medium
    text-[#241B17]
    outline-none
    transition-all
    duration-200
    placeholder:text-[#9B8D83]
    focus:border-[#B24C2B]
    focus:bg-white
    focus:ring-4
    focus:ring-[#B24C2B]/10
    dark:border-[#40342C]
    dark:bg-[#1A1512]
    dark:text-[#FFF8F0]
    dark:placeholder:text-[#82766D]
    dark:focus:border-[#D06A47]
    dark:focus:bg-[#1E1916]
    dark:focus:ring-[#D06A47]/10
  `;

  const labelClass = `
    mb-2
    block
    text-[14px]
    sm:text-[15px]
    font-bold
    text-[#493C34]
    dark:text-[#E2D8D0]
  `;

  const iconClass = `
    pointer-events-none
    absolute
    right-3.5
    sm:right-4
    top-1/2
    -translate-y-1/2
    text-[#8F8177]
    dark:text-[#8B7E75]
  `;

  const primaryButton = `
    flex
    min-h-[56px]
    sm:min-h-[60px]
    w-full
    items-center
    justify-center
    gap-2
    rounded-[15px]
    sm:rounded-[17px]
    bg-[#B24C2B]
    px-4
    sm:px-5
    text-[15px]
    sm:text-[16px]
    font-bold
    text-white
    shadow-[0_10px_30px_rgba(178,76,43,0.18)]
    transition-all
    duration-200
    hover:bg-[#963E21]
    hover:shadow-[0_14px_35px_rgba(178,76,43,0.25)]
    active:scale-[0.99]
    disabled:cursor-not-allowed
    disabled:opacity-60
  `;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      id="auth-modal-backdrop"
      dir="rtl"
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        overflow-hidden
        bg-[#17120F]/70
        px-2
        py-2
        sm:px-4
        sm:py-5
        md:px-6
        backdrop-blur-xl
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
          rounded-[20px]
          sm:rounded-[26px]
          md:rounded-[30px]
          border
          border-[#E6DDD4]
          bg-[#FAF7F2]
          shadow-[0_30px_100px_rgba(0,0,0,0.30)]
          dark:border-[#3A3029]
          dark:bg-[#181310]
          dark:shadow-[0_30px_100px_rgba(0,0,0,0.65)]
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
            border-[#E6DDD4]
            bg-[#F3ECE5]
            px-4
            pb-4
            pt-4
            sm:px-7
            sm:pb-6
            sm:pt-6
            dark:border-[#352B24]
            dark:bg-[#201914]
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
              border-[#B24C2B]/10
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
              border-[#B24C2B]/10
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-20
              -right-10
              h-40
              w-40
              rounded-full
              bg-[#264653]/5
            "
          />

          {/* Close */}

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
              border-[#DCD0C5]
              bg-[#FAF7F2]/90
              text-[#65574E]
              backdrop-blur-sm
              transition-all
              hover:border-[#B24C2B]
              hover:bg-[#B24C2B]
              hover:text-white
              dark:border-[#44382F]
              dark:bg-[#181310]/90
              dark:text-[#B8ACA2]
              dark:hover:border-[#D06A47]
              dark:hover:bg-[#B24C2B]
              dark:hover:text-white
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
                rounded-[14px]
                sm:rounded-[16px]
                bg-[#B24C2B]
                text-white
                shadow-[0_8px_25px_rgba(178,76,43,0.22)]
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
                  font-bold
                  tracking-[0.25em]
                  text-[#B24C2B]
                  dark:text-[#D06A47]
                "
              >
                WAH
              </p>

              <p className="mt-1 truncate text-[14px] sm:text-[15px] font-bold text-[#2A211C] dark:text-[#FFF8F0]">
                من هنا تبدأ الحكاية
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-3 flex items-center gap-2 sm:mt-4 sm:gap-3">
            <span className="h-px w-6 sm:w-8 bg-[#B24C2B]" />

            <span className="text-[11px] sm:text-[12px] font-medium text-[#786A61] dark:text-[#9F9289]">
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
            [scrollbar-width:thin]
            [scrollbar-color:#B8A99E_transparent]
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
                  className="shrink-0 text-[#B24C2B]"
                />

                <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.1em] text-[#B24C2B] dark:text-[#D06A47]">
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
                  font-bold
                  tracking-tight
                  text-[#211914]
                  dark:text-[#FFF8F0]
                  sm:text-[28px]
                  md:text-[30px]
                "
              >
                {forgotPassword
                  ? 'استعادة كلمة المرور'
                  : authModalTab === 'login'
                    ? 'أهلاً بيك في وه'
                    : 'انضم لعيلة وه'}
              </h2>

              <p
                className="
                  mt-2
                  text-[13px]
                  leading-6
                  text-[#776960]
                  dark:text-[#A79B91]
                  sm:text-[14px]
                  sm:leading-7
                "
              >
                {forgotPassword
                  ? 'اكتب بيانات حسابك وهنساعدك في استعادته.'
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
                  rounded-[15px]
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
                    rounded-[17px]
                    sm:rounded-[20px]
                    border
                    border-[#E2D8CE]
                    bg-[#F5EFE8]
                    p-4
                    sm:p-5
                    dark:border-[#392E27]
                    dark:bg-[#211B18]
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
                        rounded-[13px]
                        sm:rounded-[14px]
                        bg-[#264653]/10
                        text-[#264653]
                        dark:bg-[#6C9AA4]/10
                        dark:text-[#8EB8BF]
                      "
                    >
                      <KeyRound size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[14px] sm:text-[15px] font-bold text-[#2B211B] dark:text-[#FFF8F0]">
                        هنرجعك لحسابك
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-[#81736A] dark:text-[#988C83] sm:text-[12px] sm:leading-6">
                        ابعت طلب للإدارة لاستعادة كلمة المرور.
                      </p>
                    </div>
                  </div>

                  <label
                    htmlFor="forgot-identifier-input"
                    className={labelClass}
                  >
                    اسم المستخدم أو البريد الإلكتروني
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
                      placeholder="مثال: محمد123"
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
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      إرسال الطلب
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
                    font-bold
                    text-[#75675E]
                    transition-colors
                    hover:text-[#B24C2B]
                    dark:text-[#B8ACA2]
                    dark:hover:text-[#D86A47]
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
                    rounded-[15px]
                    sm:rounded-[17px]
                    bg-[#EFE7DF]
                    p-1
                    dark:bg-[#211B18]
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
                      min-h-[48px]
                      sm:min-h-[52px]
                      items-center
                      justify-center
                      gap-1.5
                      sm:gap-2
                      rounded-[12px]
                      sm:rounded-[13px]
                      px-2
                      text-[13px]
                      sm:text-[14px]
                      font-bold
                      transition-all
                      ${authModalTab === 'login'
                        ? `
                              bg-[#FAF7F2]
                              text-[#B24C2B]
                              shadow-sm
                              dark:bg-[#302721]
                              dark:text-[#D86A47]
                            `
                        : `
                              text-[#87786E]
                              hover:text-[#B24C2B]
                              dark:text-[#93877E]
                              dark:hover:text-[#D86A47]
                            `
                      }
                    `}
                  >
                    <User size={17} />
                    <span>تسجيل الدخول</span>
                  </button>

                  <button
                    id="tab-register"
                    type="button"
                    onClick={() =>
                      switchTab('register')
                    }
                    className={`
                      flex
                      min-h-[48px]
                      sm:min-h-[52px]
                      items-center
                      justify-center
                      gap-1.5
                      sm:gap-2
                      rounded-[12px]
                      sm:rounded-[13px]
                      px-2
                      text-[13px]
                      sm:text-[14px]
                      font-bold
                      transition-all
                      ${authModalTab === 'register'
                        ? `
                              bg-[#FAF7F2]
                              text-[#B24C2B]
                              shadow-sm
                              dark:bg-[#302721]
                              dark:text-[#D86A47]
                            `
                        : `
                              text-[#87786E]
                              hover:text-[#B24C2B]
                              dark:text-[#93877E]
                              dark:hover:text-[#D86A47]
                            `
                      }
                    `}
                  >
                    <Sparkles size={16} />
                    <span>إنشاء حساب</span>
                  </button>
                </div>

                {/* =================================================
                    LOGIN
                ================================================== */}

                {authModalTab === 'login' && (
                  <form
                    onSubmit={handleLogin}
                    className="space-y-4.5 sm:space-y-5"
                  >
                    {/* Username */}

                    <div>
                      <label
                        htmlFor="login-username-input"
                        className={labelClass}
                      >
                        اسم المستخدم
                        <span className="mr-1 text-[#B24C2B]">
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
                          rounded-[12px]
                          sm:rounded-[13px]
                          border
                          border-[#B24C2B]/15
                          bg-[#B24C2B]/6
                          px-3
                          py-2.5
                          sm:py-3
                          text-[11px]
                          leading-5
                          sm:text-[12px]
                          sm:leading-6
                          text-[#795D4F]
                          dark:border-[#D06A47]/20
                          dark:bg-[#D06A47]/8
                          dark:text-[#C9A99A]
                        "
                      >
                        <Info
                          size={15}
                          className="mt-0.5 shrink-0 text-[#B24C2B]"
                        />

                        <span className="min-w-0">
                          اكتب نفس اسم المستخدم اللي عملت بيه الحساب.
                          <strong className="mr-1 text-[#B24C2B] dark:text-[#D06A47]">
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
                        كلمة المرور
                        <span className="mr-1 text-[#B24C2B]">
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
                          placeholder="اكتب كلمة المرور"
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
                            text-[#8D7E74]
                            transition-all
                            hover:bg-[#B24C2B]/10
                            hover:text-[#B24C2B]
                            dark:text-[#887C73]
                            dark:hover:text-[#D86A47]
                          "
                          aria-label={
                            showPassword
                              ? 'إخفاء كلمة المرور'
                              : 'إظهار كلمة المرور'
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
                          text-[#B24C2B]
                          transition-colors
                          hover:text-[#963E21]
                          dark:text-[#D86A47]
                        "
                      >
                        نسيت كلمة المرور؟
                      </button>

                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#8B7D73] dark:text-[#93877E]">
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
                      <p className="text-[12px] sm:text-[13px] text-[#95877D] dark:text-[#8E8279]">
                        مشترك جديد؟

                        <button
                          type="button"
                          onClick={() =>
                            switchTab('register')
                          }
                          className="
                            mr-1.5
                            font-bold
                            text-[#B24C2B]
                            hover:underline
                            dark:text-[#D86A47]
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
                    className="space-y-4.5 sm:space-y-5"
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
                            rounded-[16px]
                            sm:rounded-[18px]
                            border
                            px-2
                            transition-all
                            ${roleType === 'buyer'
                              ? `
                                    border-[#B24C2B]
                                    bg-[#B24C2B]/6
                                    text-[#B24C2B]
                                    shadow-[0_8px_25px_rgba(178,76,43,0.08)]
                                    dark:border-[#C8613C]
                                    dark:bg-[#C8613C]/10
                                    dark:text-[#D86A47]
                                  `
                              : `
                                    border-[#DED4CA]
                                    bg-[#FCFAF7]
                                    text-[#7E7066]
                                    hover:border-[#B24C2B]/40
                                    dark:border-[#3A3029]
                                    dark:bg-[#1C1714]
                                    dark:text-[#9B8E84]
                                  `
                            }
                          `}
                        >
                          {roleType === 'buyer' && (
                            <span className="absolute left-2 top-2 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#B24C2B] text-white">
                              <Check size={13} />
                            </span>
                          )}

                          <UserRound
                            size={22}
                          />

                          <span className="text-[14px] sm:text-[15px] font-bold">
                            مشتري
                          </span>

                          <span className="text-[10px] sm:text-[11px] opacity-70">
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
                            rounded-[16px]
                            sm:rounded-[18px]
                            border
                            px-2
                            transition-all
                            ${roleType === 'seller'
                              ? `
                                    border-[#264653]
                                    bg-[#264653]/6
                                    text-[#264653]
                                    shadow-[0_8px_25px_rgba(38,70,83,0.08)]
                                    dark:border-[#719DA5]
                                    dark:bg-[#719DA5]/10
                                    dark:text-[#9BC4CA]
                                  `
                              : `
                                    border-[#DED4CA]
                                    bg-[#FCFAF7]
                                    text-[#7E7066]
                                    hover:border-[#264653]/40
                                    dark:border-[#3A3029]
                                    dark:bg-[#1C1714]
                                    dark:text-[#9B8E84]
                                  `
                            }
                          `}
                        >
                          {roleType === 'seller' && (
                            <span className="absolute left-2 top-2 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#264653] text-white dark:bg-[#6C9AA4]">
                              <Check size={13} />
                            </span>
                          )}

                          <Store size={22} />

                          <span className="text-[14px] sm:text-[15px] font-bold">
                            بائع
                          </span>

                          <span className="text-[10px] sm:text-[11px] opacity-70">
                            أعرض منتجاتي
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* =================================================
                        AVATAR
                    ================================================== */}

                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                        sm:gap-4
                        rounded-[16px]
                        sm:rounded-[18px]
                        border
                        border-[#E0D5CB]
                        bg-[#F5EFE8]
                        p-3
                        sm:p-4
                        dark:border-[#392E27]
                        dark:bg-[#201914]
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
                          rounded-[15px]
                          sm:rounded-[17px]
                          bg-[#E6DCD2]
                          text-[#89796E]
                          ring-1
                          ring-black/5
                          dark:bg-[#2A211C]
                          dark:ring-white/10
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
                            bg-[#B24C2B]/90
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
                        <p className="text-[13px] sm:text-[14px] font-bold text-[#30251F] dark:text-[#FFF8F0]">
                          صورة الحساب
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-[#887A70] dark:text-[#978B82] sm:text-[12px] sm:leading-6">
                          اختيارية — لو مش عايز ترفع صورة، هنستخدم الصورة الافتراضية.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            avatarInputRef.current?.click()
                          }
                          className="
                            mt-0.5
                            min-h-[32px]
                            text-[11px]
                            sm:text-[12px]
                            font-bold
                            text-[#B24C2B]
                            hover:underline
                            dark:text-[#D86A47]
                          "
                        >
                          تغيير الصورة
                        </button>
                      </div>
                    </div>

                    {/* =================================================
                        USERNAME
                    ================================================== */}

                    <div>
                      <label
                        htmlFor="register-username-input"
                        className={labelClass}
                      >
                        اسم المستخدم
                        <span className="mr-1 text-[#B24C2B]">
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
                          rounded-[13px]
                          border
                          border-[#B24C2B]/15
                          bg-[#B24C2B]/6
                          px-3
                          py-2.5
                          sm:px-4
                          sm:py-3
                          dark:border-[#D06A47]/20
                          dark:bg-[#D06A47]/8
                        "
                      >
                        <div className="flex min-w-0 items-start gap-2">
                          <Info
                            size={16}
                            className="mt-0.5 shrink-0 text-[#B24C2B]"
                          />

                          <div className="min-w-0 text-[11px] leading-5 text-[#6E5448] dark:text-[#C9A99A] sm:text-[12px] sm:leading-6">
                            <p>
                              <strong className="text-[#B24C2B] dark:text-[#D06A47]">
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

                    {/* =================================================
                        NAME
                    ================================================== */}

                    <div>
                      <label
                        htmlFor="register-name-input"
                        className={labelClass}
                      >
                        الاسم بالكامل
                        <span className="mr-1 text-[#B24C2B]">
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

                    {/* =================================================
                        WORKSHOP
                    ================================================== */}

                    {roleType === 'seller' && (
                      <div>
                        <label
                          htmlFor="register-workshop-input"
                          className={labelClass}
                        >
                          اسم الورشة أو المشروع
                          <span className="mr-1 text-[#B24C2B]">
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

                    {/* =================================================
                        PHONE
                    ================================================== */}

                    <div>
                      <label
                        htmlFor="register-phone-input"
                        className={labelClass}
                      >
                        رقم الموبايل
                        <span className="mr-1 text-[#B24C2B]">
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

                    {/* =================================================
                        GOVERNORATE
                    ================================================== */}

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

                    {/* =================================================
                        EMAIL
                    ================================================== */}

                    <div>
                      <label
                        htmlFor="register-email-input"
                        className={labelClass}
                      >
                        البريد الإلكتروني

                        <span className="mr-1 text-[11px] sm:text-[12px] font-normal text-[#9A8D82]">
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

                    {/* =================================================
                        PASSWORD
                    ================================================== */}

                    <div>
                      <label
                        htmlFor="register-password-input"
                        className={labelClass}
                      >
                        كلمة المرور
                        <span className="mr-1 text-[#B24C2B]">
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
                          placeholder="6 أحرف على الأقل"
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
                            text-[#8D7E74]
                            transition-all
                            hover:bg-[#B24C2B]/10
                            hover:text-[#B24C2B]
                            dark:text-[#887C73]
                            dark:hover:text-[#D86A47]
                          "
                          aria-label={
                            showRegisterPassword
                              ? 'إخفاء كلمة المرور'
                              : 'إظهار كلمة المرور'
                          }
                        >
                          {showRegisterPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>

                      <p className="mt-2 text-[11px] leading-5 text-[#918279] dark:text-[#91867D] sm:text-[12px]">
                        اختار كلمة مرور تقدر تفتكرها، ولازم تكون 6 أحرف على الأقل.
                      </p>
                    </div>

                    {/* =================================================
                        SUBMIT
                    ================================================== */}

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

                          جاري إنشاء الحساب...
                        </>
                      ) : (
                        <>
                          إنشاء الحساب
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
                        text-[#918279]
                        dark:text-[#91867D]
                        sm:text-[12px]
                      "
                    >
                      <ShieldCheck
                        size={15}
                        className="shrink-0"
                      />

                      <span>
                        بياناتك محمية ويمكنك تعديلها لاحقًا.
                      </span>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
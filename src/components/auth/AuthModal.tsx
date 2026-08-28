import React, { useState, useRef } from 'react';
import { useApp, DEFAULT_USER_AVATAR } from '../../context/AppContext';
import { api } from '../../services/api';
import { X, Lock, Mail, User, Phone, Store, ShieldAlert, ArrowLeft, CheckCircle2, Camera, RefreshCw } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    login,
    register,
    addToast
  } = useApp();

  const [roleType, setRoleType] = useState<'buyer' | 'seller'>('buyer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [governorate, setGovernorate] = useState('قنا');
  const [workshopName, setWorkshopName] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('يرجى اختيار ملف صورة صالح (JPG أو PNG أو WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('حجم الصورة يجب ألا يتجاوز 5 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isForgotPassword) {
      if (!forgotIdentifier.trim()) {
        setErrorMessage('من فضلك اكتب اسم المستخدم');
        return;
      }
      setIsSubmitting(true);
      try {
        await api.requestPasswordReset(forgotIdentifier.trim());
        setForgotSubmitted(true);
        addToast('طلب إعادة تعيين كلمة المرور', 'تم إرسال طلبك إلى الإدارة بنجاح', 'success');
      } catch (err: any) {
        setErrorMessage(err?.message || 'فشل في إرسال طلب استعادة كلمة المرور');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      if (authModalTab === 'login') {
        if (!username.trim()) {
          throw new Error('من فضلك اكتب اسم المستخدم');
        }
        if (!password) {
          throw new Error('من فضلك اكتب كلمة المرور');
        }
        await login(username, password);
      } else {
        if (!username.trim()) {
          throw new Error('من فضلك اكتب اسم المستخدم');
        }
        if (!name.trim()) {
          throw new Error('من فضلك اكتب الاسم الكامل');
        }
        if (!password || password.length < 6) {
          throw new Error('كلمة المرور يجب ألا تقل عن 6 خانات');
        }
        if (!phone.trim()) {
          throw new Error('من فضلك اكتب رقم الهاتف');
        }
        if (roleType === 'seller' && !workshopName.trim()) {
          throw new Error('اسم الورشة أو العلامة الحرفية مطلوب لتسجيل البائع');
        }

        await register({
          username: username.trim(),
          name: name.trim(),
          email: email.trim() ? email.trim() : undefined,
          password,
          phone: phone.trim(),
          role: roleType,
          avatar: avatarPreview || undefined,
          governorate,
          workshopName: roleType === 'seller' ? workshopName.trim() : undefined
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'فشلت العملية. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setIsForgotPassword(false);
    setForgotSubmitted(false);
    setErrorMessage(null);
    setAvatarPreview(null);
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#ede4d8] overflow-hidden max-h-[92vh] flex flex-col my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#943310] to-[#b4431a] p-5 sm:p-6 text-white text-center relative shrink-0">
          <button
            type="button"
            id="auth-modal-close"
            onClick={handleClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-2 text-2xl font-heritage font-black">
            ص
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heritage">
            {isForgotPassword
              ? 'استعادة كلمة المرور'
              : authModalTab === 'login'
              ? 'تسجيل الدخول إلى سوق الصعيد'
              : 'إنشاء حساب جديد'}
          </h2>
          <p className="text-xs sm:text-sm text-amber-200/90 mt-1">
            {isForgotPassword
              ? 'أدخل اسم المستخدم أو بريدك الإلكتروني المسجل'
              : 'منصة الحرف التراثية والمنتجات الأصيلة في صعيد مصر'}
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* FORGOT PASSWORD SCREEN */}
          {isForgotPassword ? (
            <div>
              {forgotSubmitted ? (
                <div className="text-center py-6 space-y-4">
                  <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
                  <h3 className="font-bold text-base text-gray-800">تم إرسال طلبك إلى الإدارة.</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                    سيقوم المسؤول بمراجعة الطلب وإنشاء كلمة مرور جديدة لك.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setForgotSubmitted(false);
                      setForgotIdentifier('');
                    }}
                    className="mt-4 px-6 py-2.5 bg-[#943310] hover:bg-[#7c280a] text-white rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer"
                  >
                    العودة لتسجيل الدخول
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="mb-2">
                    <h3 className="font-bold text-sm sm:text-base text-gray-800">نسيت كلمة المرور؟</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      أدخل اسم المستخدم المسجل في المنصة وسيقوم فريق الإدارة بمراجعة الطلب وإنشاء كلمة مرور جديدة لحسابك.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1.5">
                      اسم المستخدم
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="اكتب اسم المستخدم"
                        autoComplete="username"
                        className="w-full pl-3 pr-10 py-3 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm sm:text-base outline-none focus:border-[#943310] min-h-[48px]"
                      />
                      <User className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-label="إرسال طلب إعادة تعيين كلمة المرور"
                    className="w-full py-3 bg-[#943310] hover:bg-[#7c280a] disabled:opacity-60 text-white rounded-xl text-sm sm:text-base font-bold shadow-md transition-colors min-h-[48px] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري إرسال الطلب...</span>
                      </>
                    ) : (
                      <span>إرسال طلب إعادة تعيين كلمة المرور</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setErrorMessage(null);
                    }}
                    aria-label="الرجوع إلى نموذج تسجيل الدخول"
                    className="w-full text-center text-xs sm:text-sm text-gray-600 hover:text-[#943310] font-medium py-2 cursor-pointer"
                  >
                    العودة لتسجيل الدخول
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div>
              {/* Tab switch between Login & Register */}
              <div className="flex border-b border-gray-200 mb-5">
                <button
                  type="button"
                  id="tab-login"
                  role="tab"
                  aria-selected={authModalTab === 'login'}
                  aria-label="تبويب تسجيل الدخول"
                  onClick={() => {
                    setAuthModalTab('login');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 pb-2.5 text-sm sm:text-base font-bold text-center border-b-2 transition-colors cursor-pointer ${
                    authModalTab === 'login'
                      ? 'border-[#943310] text-[#943310]'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  تسجيل الدخول
                </button>
                <button
                  type="button"
                  id="tab-register"
                  role="tab"
                  aria-selected={authModalTab === 'register'}
                  aria-label="تبويب إنشاء حساب جديد"
                  onClick={() => {
                    setAuthModalTab('register');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 pb-2.5 text-sm sm:text-base font-bold text-center border-b-2 transition-colors cursor-pointer ${
                    authModalTab === 'register'
                      ? 'border-[#943310] text-[#943310]'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  حساب جديد
                </button>
              </div>

              {/* Error Alert Box */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ========================================================= */}
              {/* LOGIN FORM (EXTREMELY SIMPLE FOR SENIORS & NON-TECH USERS) */}
              {/* ========================================================= */}
              {authModalTab === 'login' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Field 1: Username */}
                  <div>
                    <label
                      htmlFor="login-username-input"
                      className="block text-sm sm:text-base font-bold text-gray-800 mb-1.5"
                    >
                      اسم المستخدم
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="login-username-input"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="اكتب اسم المستخدم"
                        aria-label="أدخل اسم المستخدم لتسجيل الدخول"
                        autoComplete="username"
                        className="w-full pl-3 pr-11 py-3 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm sm:text-base outline-none focus:border-[#943310] focus:bg-white min-h-[48px] text-gray-900 transition-colors"
                      />
                      <User className="w-5 h-5 text-gray-400 absolute right-3.5 top-3.5" />
                    </div>
                  </div>

                  {/* Field 2: Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="login-password-input"
                        className="text-sm sm:text-base font-bold text-gray-800"
                      >
                        كلمة المرور
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setForgotSubmitted(false);
                          setErrorMessage(null);
                        }}
                        aria-label="استعادة كلمة المرور المنسية"
                        className="text-xs sm:text-sm text-[#943310] hover:underline font-medium cursor-pointer"
                      >
                        نسيت كلمة المرور؟
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        id="login-password-input"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="اكتب كلمة المرور"
                        aria-label="أدخل كلمة المرور الخاصة بحسابك"
                        autoComplete="current-password"
                        className="w-full pl-3 pr-11 py-3 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm sm:text-base outline-none focus:border-[#943310] focus:bg-white min-h-[48px] text-gray-900 transition-colors"
                      />
                      <Lock className="w-5 h-5 text-gray-400 absolute right-3.5 top-3.5" />
                    </div>
                  </div>

                  {/* Main Action Button */}
                  <button
                    type="submit"
                    id="auth-submit-btn"
                    disabled={isSubmitting}
                    aria-label="تأكيد تسجيل الدخول إلى سوق الصعيد"
                    className="w-full py-3.5 mt-2 bg-[#943310] hover:bg-[#7c280a] disabled:opacity-60 text-white rounded-xl text-base font-bold shadow-md transition-colors flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
                  >
                    <span>{isSubmitting ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Switch to Registration */}
                  <div className="text-center pt-3 border-t border-gray-100">
                    <p className="text-xs sm:text-sm text-gray-600">
                      ليس لديك حساب؟{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalTab('register');
                          setErrorMessage(null);
                        }}
                        aria-label="الانتقال إلى نموذج إنشاء حساب جديد"
                        className="font-bold text-[#943310] hover:underline cursor-pointer"
                      >
                        إنشاء حساب جديد
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* ========================================================= */}
              {/* REGISTRATION FORM (BUYER OR SELLER)                       */}
              {/* ========================================================= */}
              {authModalTab === 'register' && (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Account Type Selector (Buyer vs Seller) */}
                  <div className="grid grid-cols-2 gap-2 mb-2 bg-[#faf6f0] p-1.5 rounded-xl border border-[#ebdccd]">
                    <button
                      type="button"
                      id="role-buyer-select"
                      onClick={() => setRoleType('buyer')}
                      aria-label="اختيار نوع الحساب: مشتري ومتسوق"
                      className={`py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        roleType === 'buyer'
                          ? 'bg-[#943310] text-white shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>مشتري / متسوق</span>
                    </button>
                    <button
                      type="button"
                      id="role-seller-select"
                      onClick={() => setRoleType('seller')}
                      aria-label="اختيار نوع الحساب: بائع وورشة صعيدية"
                      className={`py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        roleType === 'seller'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>بائع / ورشة صعيدية</span>
                    </button>
                  </div>

                  {/* Profile Picture Selection (Optional) with Default Preview */}
                  <div className="flex flex-col items-center justify-center p-3 bg-[#faf6f0] rounded-2xl border border-[#ebdccd] text-center">
                    <div className="relative group">
                      <img
                        src={avatarPreview || DEFAULT_USER_AVATAR}
                        alt="صورة الملف الشخصي"
                        className="w-20 h-20 rounded-full object-cover border-2 border-[#943310]/40 shadow-xs bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        title="اختيار صورة شخصية"
                        className="absolute bottom-0 right-0 p-1.5 bg-[#943310] hover:bg-[#78280b] text-white rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="file"
                      ref={avatarInputRef}
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="register-avatar-input"
                    />

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="text-xs font-bold text-[#943310] hover:underline cursor-pointer"
                      >
                        {avatarPreview ? 'تغيير الصورة' : 'اختيار صورة شخصية (اختياري)'}
                      </button>
                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarPreview(null);
                            if (avatarInputRef.current) avatarInputRef.current.value = '';
                          }}
                          className="text-xs text-rose-600 hover:underline cursor-pointer"
                        >
                          استعادة الافتراضية
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-0.5">
                      {avatarPreview ? 'تم تحديد صورة مخصصة' : 'إذا لم تختر صورة، سيتم استخدام الصورة الافتراضية للمنصة'}
                    </span>
                  </div>

                  {/* Field: Username (Supports Arabic) */}
                  <div>
                    <label
                      htmlFor="register-username-input"
                      className="block text-xs sm:text-sm font-bold text-gray-800 mb-1"
                    >
                      اسم المستخدم (باللغة العربية أو الإنجليزية)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="register-username-input"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="اكتب اسم المستخدم (مثال: محمد أو أحمد123)"
                        aria-label="اسم المستخدم الجديد"
                        autoComplete="username"
                        className="w-full pl-3 pr-10 py-2.5 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310] min-h-[44px]"
                      />
                      <User className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  {/* Field: Full Name */}
                  <div>
                    <label
                      htmlFor="register-name-input"
                      className="block text-xs sm:text-sm font-bold text-gray-800 mb-1"
                    >
                      الاسم الكامل
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="register-name-input"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="اكتب اسمك بالكامل"
                        aria-label="الاسم الكامل للشخص"
                        autoComplete="name"
                        className="w-full pl-3 pr-10 py-2.5 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310] min-h-[44px]"
                      />
                      <User className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  {/* Field: Workshop Name (If Seller) */}
                  {roleType === 'seller' && (
                    <div>
                      <label
                        htmlFor="register-workshop-input"
                        className="block text-xs sm:text-sm font-bold text-amber-900 mb-1"
                      >
                        اسم الورشة أو العلامة الحرفية
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="register-workshop-input"
                          required
                          value={workshopName}
                          onChange={(e) => setWorkshopName(e.target.value)}
                          placeholder="مثال: فواخير قنا الأصيلة"
                          aria-label="اسم الورشة أو البراند الحرفي الصعيدي"
                          className="w-full pl-3 pr-10 py-2.5 bg-amber-50/60 border border-amber-300 rounded-xl text-sm outline-none focus:border-amber-600 min-h-[44px]"
                        />
                        <Store className="w-4 h-4 text-amber-600 absolute right-3 top-3" />
                      </div>
                    </div>
                  )}

                  {/* Phone & Governorate Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor="register-phone-input"
                        className="block text-xs sm:text-sm font-bold text-gray-800 mb-1"
                      >
                        رقم الهاتف
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          id="register-phone-input"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="010XXXXXXXX"
                          aria-label="رقم الهاتف للتواصل والطلبات"
                          autoComplete="tel"
                          className="w-full pl-3 pr-10 py-2.5 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310] min-h-[44px]"
                        />
                        <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="register-governorate-select"
                        className="block text-xs sm:text-sm font-bold text-gray-800 mb-1"
                      >
                        المحافظة
                      </label>
                      <select
                        id="register-governorate-select"
                        value={governorate}
                        aria-label="اختر محافظتك في صعيد مصر"
                        onChange={(e) => setGovernorate(e.target.value)}
                        className="w-full py-2.5 px-3 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310] min-h-[44px] cursor-pointer"
                      >
                        <option value="قنا">قنا</option>
                        <option value="سوهاج">سوهاج</option>
                        <option value="أسوان">أسوان</option>
                        <option value="الأقصر">الأقصر</option>
                        <option value="أسيوط">أسيوط</option>
                        <option value="المنيا">المنيا</option>
                        <option value="بني سويف">بني سويف</option>
                        <option value="الوادي الجديد">الوادي الجديد</option>
                        <option value="القاهرة">القاهرة</option>
                        <option value="الجيزة">الجيزة</option>
                        <option value="الإسكندرية">الإسكندرية</option>
                      </select>
                    </div>
                  </div>

                  {/* Field: Optional Email */}
                  <div>
                    <label
                      htmlFor="register-email-input"
                      className="block text-xs sm:text-sm font-bold text-gray-800 mb-1"
                    >
                      البريد الإلكتروني <span className="text-gray-400 font-normal">(اختياري)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="register-email-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com (اختياري)"
                        aria-label="البريد الإلكتروني (اختياري)"
                        autoComplete="email"
                        className="w-full pl-3 pr-10 py-2.5 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310] min-h-[44px]"
                      />
                      <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  {/* Field: Password */}
                  <div>
                    <label
                      htmlFor="register-password-input"
                      className="block text-xs sm:text-sm font-bold text-gray-800 mb-1"
                    >
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="register-password-input"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="اكتب كلمة المرور (6 خانات على الأقل)"
                        aria-label="أنشئ كلمة مرور مكونة من 6 خانات على الأقل"
                        autoComplete="new-password"
                        className="w-full pl-3 pr-10 py-2.5 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310] min-h-[44px]"
                      />
                      <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    id="auth-submit-btn"
                    disabled={isSubmitting}
                    aria-label={roleType === 'seller' ? 'تأكيد تسجيل ورشة حرفية جديدة' : 'تأكيد إنشاء حساب مشتري جديد'}
                    className="w-full py-3.5 mt-2 bg-[#943310] hover:bg-[#7c280a] disabled:opacity-60 text-white rounded-xl text-sm sm:text-base font-bold shadow-md transition-colors flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
                  >
                    <span>
                      {isSubmitting
                        ? 'جاري إنشاء الحساب...'
                        : roleType === 'seller'
                        ? 'تسجيل ورشة جديدة'
                        : 'إنشاء الحساب'}
                    </span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  {/* Switch to Login */}
                  <div className="text-center pt-2 border-t border-gray-100">
                    <p className="text-xs sm:text-sm text-gray-600">
                      لديك حساب بالفعل؟{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalTab('login');
                          setErrorMessage(null);
                        }}
                        aria-label="الانتقال إلى تسجيل الدخول"
                        className="font-bold text-[#943310] hover:underline cursor-pointer"
                      >
                        تسجيل الدخول
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

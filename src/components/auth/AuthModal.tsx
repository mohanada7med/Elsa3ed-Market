import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, Mail, User, Phone, Store, ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';

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

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isForgotPassword) {
      if (!forgotIdentifier.trim()) {
        setErrorMessage('من فضلك اكتب اسم المستخدم أو البريد الإلكتروني');
        return;
      }
      setForgotSubmitted(true);
      addToast('استعادة كلمة المرور', 'تم إرسال تعليمات استعادة كلمة المرور إلى حسابكم المسجل', 'info');
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
                  <h3 className="font-bold text-base text-gray-800">تم إرسال التعليمات بنجاح</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    إذا كان هذا الحساب مسجلاً لدينا، فستصلكم تعليمات إعادة تعيين كلمة المرور فوراً.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setForgotSubmitted(false);
                    }}
                    className="mt-4 px-6 py-2.5 bg-[#943310] hover:bg-[#7c280a] text-white rounded-xl text-sm font-bold shadow-md transition-colors"
                  >
                    العودة لتسجيل الدخول
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1.5">
                      اسم المستخدم أو البريد الإلكتروني
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="اكتب اسم المستخدم أو بريدك المسجل"
                        className="w-full pl-3 pr-10 py-3 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm sm:text-base outline-none focus:border-[#943310] min-h-[48px]"
                      />
                      <User className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#943310] hover:bg-[#7c280a] text-white rounded-xl text-sm sm:text-base font-bold shadow-md transition-colors min-h-[48px]"
                  >
                    إرسال رابط الاستعادة
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="w-full text-center text-xs sm:text-sm text-gray-600 hover:text-[#943310] font-medium py-2"
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

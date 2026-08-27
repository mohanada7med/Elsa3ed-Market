import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, Mail, User, Phone, Store, ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    switchRole,
    login,
    register,
    addToast
  } = useApp();

  const [roleType, setRoleType] = useState<'buyer' | 'seller'>('buyer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('قنا');
  const [workshopName, setWorkshopName] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isForgotPassword) {
      setForgotSubmitted(true);
      addToast('استعادة كلمة المرور', 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني', 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      if (authModalTab === 'login') {
        await login(email, password);
      } else {
        await register({
          name,
          email,
          password,
          phone,
          role: roleType,
          governorate,
          workshopName: roleType === 'seller' ? workshopName : undefined
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'فشلت العملية. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    switchRole(role);
    setIsAuthModalOpen(false);
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#ede4d8] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#943310] to-[#b4431a] p-6 text-white text-center relative">
          <button
            type="button"
            id="auth-modal-close"
            onClick={() => {
              setIsAuthModalOpen(false);
              setIsForgotPassword(false);
              setForgotSubmitted(false);
            }}
            className="absolute top-4 left-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-2 text-2xl font-heritage font-black">
            ص
          </div>
          <h3 className="text-xl font-black font-heritage">
            {isForgotPassword
              ? 'استعادة كلمة المرور'
              : authModalTab === 'login'
              ? 'تسجيل الدخول إلى سوق الصعيد'
              : 'إنشاء حساب جديد'}
          </h3>
          <p className="text-xs text-amber-200/90 mt-1">
            {isForgotPassword
              ? 'أدخل بريدك الإلكتروني المسجل وسنرسل لك تعليمات الاستعادة'
              : 'منصة الحرف التراثية والمنتجات الأصيلة في صعيد مصر'}
          </p>
        </div>

        {/* Quick Demo Switcher for fast testing */}
        <div className="bg-[#f7efe6] p-3 border-b border-[#ebdccd]">
          <span className="text-[11px] font-bold text-[#8c6b53] block text-center mb-2">
            ⚡ تجربة فورية بنقرة واحدة (بدون كتابة بيانات):
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              id="quick-demo-buyer"
              onClick={() => handleQuickDemo('buyer')}
              className="py-1.5 px-2 rounded-lg bg-white border border-[#dfcebe] hover:border-[#943310] text-[#943310] text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>مشتري</span>
            </button>
            <button
              type="button"
              id="quick-demo-seller"
              onClick={() => handleQuickDemo('seller')}
              className="py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
            >
              <Store className="w-3.5 h-3.5" />
              <span>بائع حرفي</span>
            </button>
            <button
              type="button"
              id="quick-demo-admin"
              onClick={() => handleQuickDemo('admin')}
              className="py-1.5 px-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>مدير منصة</span>
            </button>
          </div>
        </div>

        {/* Forgot Password Flow */}
        {isForgotPassword ? (
          <div className="p-6">
            {forgotSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-gray-800">تم إرسال الرابط بنجاح!</h4>
                <p className="text-xs text-gray-600">
                  يرجى تفقد بريدك الإلكتروني والنقر على الرابط لإعادة تعيين كلمة المرور الخاصة بك.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setForgotSubmitted(false);
                  }}
                  className="mt-4 px-6 py-2 bg-[#943310] text-white rounded-xl text-xs font-bold"
                >
                  العودة لتسجيل الدخول
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-3 pr-10 py-2.5 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310]"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#943310] hover:bg-[#7c280a] text-white rounded-xl text-sm font-bold shadow-md transition-colors"
                >
                  إرسال رابط الاستعادة
                </button>

                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full text-center text-xs text-gray-600 hover:text-[#943310] font-medium"
                >
                  العودة لتسجيل الدخول
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="p-6">
            {/* Tab switch between Login & Register */}
            <div className="flex border-b border-gray-200 mb-5">
              <button
                type="button"
                id="tab-login"
                onClick={() => setAuthModalTab('login')}
                className={`flex-1 pb-2.5 text-sm font-bold text-center border-b-2 transition-colors ${
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
                onClick={() => setAuthModalTab('register')}
                className={`flex-1 pb-2.5 text-sm font-bold text-center border-b-2 transition-colors ${
                  authModalTab === 'register'
                    ? 'border-[#943310] text-[#943310]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                حساب جديد
              </button>
            </div>

            {/* Account Type Selector (Buyer vs Seller) */}
            <div className="grid grid-cols-2 gap-2 mb-4 bg-[#faf6f0] p-1.5 rounded-xl border border-[#ebdccd]">
              <button
                type="button"
                onClick={() => setRoleType('buyer')}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  roleType === 'buyer'
                    ? 'bg-[#943310] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>مشتري / متسوق</span>
              </button>
              <button
                type="button"
                onClick={() => setRoleType('seller')}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  roleType === 'seller'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>بائع / ورشة صعيدية</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {authModalTab === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الاسم الكامل</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="أحمد محمود الهاشمي"
                        className="w-full pl-3 pr-10 py-2 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310]"
                      />
                      <User className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  {roleType === 'seller' && (
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">اسم الورشة أو العلامة الحرفية</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={workshopName}
                          onChange={(e) => setWorkshopName(e.target.value)}
                          placeholder="مثال: فواخير قنا الأصيلة"
                          className="w-full pl-3 pr-10 py-2 bg-amber-50/50 border border-amber-300 rounded-xl text-sm outline-none focus:border-amber-600"
                        />
                        <Store className="w-4 h-4 text-amber-600 absolute right-3 top-2.5" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">رقم الهاتف</label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="010XXXXXXXX"
                          className="w-full pl-3 pr-10 py-2 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310]"
                        />
                        <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">المحافظة</label>
                      <select
                        value={governorate}
                        onChange={(e) => setGovernorate(e.target.value)}
                        className="w-full py-2 px-3 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310]"
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
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-3 pr-10 py-2 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310]"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">كلمة المرور</label>
                  {authModalTab === 'login' && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[11px] text-[#943310] hover:underline font-medium"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-10 py-2 bg-[#faf6f0] border border-[#dfcebe] rounded-xl text-sm outline-none focus:border-[#943310]"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                </div>
              </div>

              <button
                type="submit"
                id="auth-submit-btn"
                disabled={isSubmitting}
                className="w-full py-3 mt-2 bg-[#943310] hover:bg-[#7c280a] disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>
                  {isSubmitting
                    ? 'جاري التحقق والاتصال...'
                    : authModalTab === 'login'
                    ? 'دخول فوري'
                    : 'تسجيل الحساب والمتابعة'}
                </span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

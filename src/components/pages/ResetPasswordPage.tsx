import React, { useState, useEffect } from 'react';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

interface ResetPasswordPageProps {
  initialToken?: string | null;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ initialToken }) => {
  const { setActivePage, setIsAuthModalOpen, setAuthModalTab, addToast } = useApp();

  const [token, setToken] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [tokenStatus, setTokenStatus] = useState<'valid' | 'invalid' | 'expired' | 'missing'>('valid');
  const [errorMessage, setErrorMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Extract token from prop or window location search params
  useEffect(() => {
    let resolvedToken = initialToken || '';
    if (!resolvedToken && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      resolvedToken = params.get('token') || '';
    }

    setToken(resolvedToken.trim());

    if (!resolvedToken.trim()) {
      setTokenStatus('missing');
      setIsCheckingToken(false);
      return;
    }

    // Validate token with server
    const checkToken = async () => {
      try {
        setIsCheckingToken(true);
        const res = await api.validateResetToken(resolvedToken.trim());
        if (res.valid) {
          setTokenStatus('valid');
        } else {
          if (res.error?.includes('انتهت')) {
            setTokenStatus('expired');
          } else {
            setTokenStatus('invalid');
          }
          setErrorMessage(res.error || 'رابط إعادة تعيين كلمة السر غير صالح');
        }
      } catch (err: any) {
        setTokenStatus('invalid');
        setErrorMessage(err?.message || 'تعذر التحقق من صلاحية الرابط');
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkToken();
  }, [initialToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!password) {
      setErrorMessage('من فضلك اكتب كلمة السر الجديدة');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('كلمة السر يجب ألا تقل عن 6 خانات');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('كلمتا السر غير متطابقتين');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.resetPasswordWithToken({
        token,
        password,
        confirmPassword
      });

      setIsSuccess(true);
      addToast('تم تغيير كلمة السر بنجاح! يمكنك الآن تسجيل الدخول.', 'success');
    } catch (err: any) {
      setErrorMessage(err?.message || 'فشل في إعادة تعيين كلمة السر، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenLogin = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };

  const handleRequestNewLink = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
    // In AuthModal, users can click "نسيت كلمة السر؟"
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#eee8dc] dark:bg-[#0b0b0a] text-[#211d18] dark:text-[#f5f0e7] transition-colors">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="relative rounded-[2rem] border border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#1c1813]/90 backdrop-blur-xl shadow-xl overflow-hidden p-6 sm:p-8">
          
          {/* Brand header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#9a6a35]/10 dark:bg-[#9a6a35]/20 text-[#9a6a35] flex items-center justify-center mb-4 shadow-inner">
              <KeyRound size={28} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#211d18] dark:text-[#f5f0e7]">
              إعادة تعيين كلمة السر
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-black/60 dark:text-white/60 font-medium">
              أنشئ كلمة سر جديدة قوية لحماية حسابك على منصة وه
            </p>
          </div>

          {/* Loading state */}
          {isCheckingToken && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 size={36} className="animate-spin text-[#9a6a35]" />
              <p className="text-sm font-medium text-black/60 dark:text-white/60">
                جاري التحقق من أمان وصلاحية الرابط...
              </p>
            </div>
          )}

          {/* Success state */}
          {!isCheckingToken && isSuccess && (
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">
                  تم تغيير كلمة السر بنجاح!
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-black/60 dark:text-white/60">
                  تم تحديث كلمة السر لحسابك وتأمين جلساتك. يمكنك الآن تسجيل الدخول مباشرة بكلمة السر الجديدة.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenLogin}
                className="w-full flex items-center justify-center gap-2 min-h-[50px] px-6 rounded-2xl bg-[#9a6a35] hover:bg-[#855928] text-white font-bold shadow-lg shadow-[#9a6a35]/25 transition-all"
              >
                <span>تسجيل الدخول الآن</span>
                <ArrowLeft size={18} />
              </button>
            </div>
          )}

          {/* Invalid / Expired / Missing Token state */}
          {!isCheckingToken && !isSuccess && tokenStatus !== 'valid' && (
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertCircle size={36} />
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#211d18] dark:text-[#f5f0e7]">
                  {tokenStatus === 'expired'
                    ? 'انتهت صلاحية الرابط'
                    : tokenStatus === 'missing'
                    ? 'رابط غير مكتمل'
                    : 'رابط غير صالح'}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-black/60 dark:text-white/60 leading-relaxed">
                  {errorMessage ||
                    (tokenStatus === 'expired'
                      ? 'صلاحية رابط إعادة تعيين كلمة السر (30 دقيقة) انتهت لأسباب أمنية. يرجى طلب رابط جديد.'
                      : 'الرابط الذي استخدمته غير صالح أو تم استخدامه مسبقاً. يرجى طلب رابط استعادة جديد.')}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleRequestNewLink}
                  className="w-full flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-2xl bg-[#9a6a35] hover:bg-[#855928] text-white font-bold shadow-md shadow-[#9a6a35]/20 transition-all"
                >
                  <span>طلب رابط جديد</span>
                  <ArrowLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => setActivePage('home')}
                  className="w-full flex items-center justify-center gap-2 min-h-[46px] px-4 rounded-2xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-sm font-semibold transition-all"
                >
                  <span>العودة للرئيسية</span>
                </button>
              </div>
            </div>
          )}

          {/* Form state (Token is valid) */}
          {!isCheckingToken && !isSuccess && tokenStatus === 'valid' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Alert */}
              {errorMessage && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs sm:text-sm text-rose-700 dark:text-rose-300 flex items-start gap-3">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-black/80 dark:text-white/80">
                  كلمة السر الجديدة
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="اكتب 6 خانات على الأقل"
                    className="w-full min-h-[50px] pr-11 pl-11 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 focus:bg-white dark:focus:bg-[#14120e] focus:border-[#9a6a35] focus:outline-none text-sm transition-all"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-black/80 dark:hover:text-white/80 transition-colors p-1"
                    aria-label={showPassword ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-black/80 dark:text-white/80">
                  تأكيد كلمة السر الجديدة
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد كتابة كلمة السر الجديدة"
                    className="w-full min-h-[50px] pr-11 pl-11 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 focus:bg-white dark:focus:bg-[#14120e] focus:border-[#9a6a35] focus:outline-none text-sm transition-all"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-black/80 dark:hover:text-white/80 transition-colors p-1"
                    aria-label={showConfirmPassword ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Requirements Hint */}
              <div className="rounded-xl bg-black/5 dark:bg-white/5 p-3 text-[11px] sm:text-xs text-black/60 dark:text-white/60 space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className={password.length >= 6 ? 'text-emerald-500' : 'text-black/30 dark:text-white/30'} />
                  <span className={password.length >= 6 ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : ''}>
                    6 خانات على الأقل
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className={confirmPassword && password === confirmPassword ? 'text-emerald-500' : 'text-black/30 dark:text-white/30'} />
                  <span className={confirmPassword && password === confirmPassword ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : ''}>
                    تطابق كلمتي السر
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 min-h-[50px] px-6 rounded-2xl bg-[#9a6a35] hover:bg-[#855928] disabled:opacity-60 text-white font-bold shadow-lg shadow-[#9a6a35]/25 transition-all mt-6 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>جاري حفظ كلمة السر...</span>
                  </>
                ) : (
                  <>
                    <span>حفظ كلمة السر الجديدة</span>
                    <ArrowLeft size={18} />
                  </>
                )}
              </button>

              {/* Back to Home / Login link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="text-xs sm:text-sm font-semibold text-[#9a6a35] hover:underline"
                >
                  تذكرت كلمة السر؟ تسجيل الدخول
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

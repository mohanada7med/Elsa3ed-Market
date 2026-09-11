import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, ShieldAlert, KeyRound, CheckCircle2, RefreshCw, LogOut, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const ForceChangePasswordModal: React.FC = () => {
  const { currentUser, changePersonalPassword, logout, addToast } = useApp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // States for toggling password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Only show when the user is authenticated and has mustChangePassword === true
  if (!currentUser?.id || !currentUser.mustChangePassword) {
    return null;
  }

  // Calculate simple password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-transparent' };
    if (pass.length < 6) return { score: 1, label: 'قصيرة جداً', color: 'bg-red-500' };
    if (pass.length < 8) return { score: 2, label: 'مقبولة', color: 'bg-amber-500' };
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) {
      return { score: 4, label: 'قوية جداً', color: 'bg-emerald-500' };
    }
    return { score: 3, label: 'جيدة', color: 'bg-blue-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentPassword) {
      setErrorMessage('يرجى كتابة كلمة المرور المؤقتة الحالية');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('كلمة المرور الجديدة يجب ألا تقل عن 6 خانات');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage('كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور المؤقتة');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('تأكيد كلمة المرور غير متطابق مع كلمة المرور الجديدة');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePersonalPassword(currentPassword, newPassword);
      addToast('أمان الحساب', 'تم تحديث كلمة المرور الشخصية وتفعيل الحساب بنجاح', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMessage(err?.message || 'فشل في تحديث كلمة المرور، يرجى التأكد من كلمة المرور المؤقتة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-white/95 dark:bg-[#121210]/98 rounded-3xl border border-black/10 dark:border-white/10 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl overflow-hidden relative backdrop-blur-2xl text-[#211d18] dark:text-[#f5f0e7]">

        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#9a6a35]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge & Title */}
        <div className="flex items-center gap-4 border-b border-black/10 dark:border-white/10 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9a6a35]/20 to-[#9a6a35]/5 border border-[#9a6a35]/20 flex items-center justify-center shrink-0 shadow-inner">
            <KeyRound className="w-7 h-7 text-[#9a6a35]" />
          </div>
          <div>
            <h3 className="font-black text-xl text-[#211d18] dark:text-[#f5f0e7]">تعيين كلمة مرور شخصية</h3>
            <p className="text-xs text-[#9a6a35] font-bold mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> إجراء أمني إلزامي لتفعيل الحساب
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-black/[0.03] dark:bg-white/[0.03] rounded-2xl border border-black/5 dark:border-white/5">
          <p className="text-xs text-black/75 dark:text-white/75 leading-relaxed font-medium">
            مرحباً بك يا <strong className="text-[#211d18] dark:text-[#f5f0e7]">{currentUser.name || currentUser.username}</strong>. لقد سجلت الدخول بكلمة مرور مؤقتة. لحماية حسابك، يرجى تعيين كلمة مرور جديدة خاصة بك.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 animate-shake">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 dark:text-red-400" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">

          {/* Current Temporary Password */}
          <div>
            <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1.5">
              كلمة المرور المؤقتة الحالية <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="أدخل الكلمة المؤقتة المُزودة من الإدارة"
                className="w-full pl-10 pr-10 py-3.5 bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-2xl outline-none focus:border-[#9a6a35] dark:focus:border-[#9a6a35] text-xs font-mono text-left text-[#211d18] dark:text-[#f5f0e7] placeholder:text-black/35 dark:placeholder:text-white/35 transition-all focus:ring-2 focus:ring-[#9a6a35]/10"
                dir="ltr"
              />
              <Lock className="w-4 h-4 text-black/40 dark:text-white/40 absolute right-3.5 top-4" />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute left-3.5 top-4 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Personal Password */}
          <div>
            <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1.5">
              كلمة المرور الشخصية الجديدة <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="6 خانات على الأقل"
                className="w-full pl-10 pr-10 py-3.5 bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-2xl outline-none focus:border-[#9a6a35] dark:focus:border-[#9a6a35] text-xs font-mono text-left text-[#211d18] dark:text-[#f5f0e7] placeholder:text-black/35 dark:placeholder:text-white/35 transition-all focus:ring-2 focus:ring-[#9a6a35]/10"
                dir="ltr"
              />
              <KeyRound className="w-4 h-4 text-black/40 dark:text-white/40 absolute right-3.5 top-4" />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute left-3.5 top-4 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1 h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className={`transition-all duration-300 rounded-full ${strength.color}`} style={{ width: `${(strength.score / 4) * 100}%` }} />
                </div>
                <div className="flex justify-between items-center text-[10px] text-black/50 dark:text-white/50 px-0.5">
                  <span>مستوى الأمان: <strong className="text-[#211d18] dark:text-[#f5f0e7]">{strength.label}</strong></span>
                  <span>6 خانات كحد أدنى</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1.5">
              تأكيد كلمة المرور الجديدة <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد إدخال كلمة المرور للتأكيد"
                className="w-full pl-10 pr-10 py-3.5 bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-2xl outline-none focus:border-[#9a6a35] dark:focus:border-[#9a6a35] text-xs font-mono text-left text-[#211d18] dark:text-[#f5f0e7] placeholder:text-black/35 dark:placeholder:text-white/35 transition-all focus:ring-2 focus:ring-[#9a6a35]/10"
                dir="ltr"
              />
              <CheckCircle2 className="w-4 h-4 text-black/40 dark:text-white/40 absolute right-3.5 top-4" />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute left-3.5 top-4 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={() => logout()}
              className="text-xs text-black/60 dark:text-white/60 hover:text-red-600 dark:hover:text-red-400 font-bold py-2 flex items-center gap-1.5 cursor-pointer order-2 sm:order-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج والعودة لاحقاً</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              id="submit-force-change-pwd-btn"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] disabled:opacity-60 font-black rounded-2xl shadow-lg shadow-black/5 transition-all flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ والتأكيد...</span>
                </>
              ) : (
                <span>حفظ وتفعيل الحساب</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForceChangePasswordModal;
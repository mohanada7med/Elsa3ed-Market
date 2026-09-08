import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, ShieldAlert, KeyRound, CheckCircle2, RefreshCw, LogOut } from 'lucide-react';

export const ForceChangePasswordModal: React.FC = () => {
  const { currentUser, changePersonalPassword, logout, addToast } = useApp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Only show when the user is authenticated and has mustChangePassword === true
  if (!currentUser?.id || !currentUser.mustChangePassword) {
    return null;
  }

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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xl animate-in fade-in"
    >
      <div className="bg-white/90 dark:bg-[#151513]/95 rounded-[2rem] border border-black/10 dark:border-white/10 max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl overflow-hidden relative backdrop-blur-2xl text-[#211d18] dark:text-[#f5f0e7]">
        {/* Header Badge & Title */}
        <div className="flex items-center gap-3 border-b border-black/10 dark:border-white/10 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#9a6a35]/10 flex items-center justify-center shrink-0">
            <KeyRound className="w-6 h-6 text-[#9a6a35]" />
          </div>
          <div>
            <h3 className="font-black text-lg text-[#211d18] dark:text-[#f5f0e7]">تعيين كلمة مرور شخصية جديدة</h3>
            <p className="text-xs text-[#9a6a35] font-bold">إجراء أمني إلزامي لتفعيل حسابك</p>
          </div>
        </div>

        <p className="text-xs text-black/70 dark:text-white/70 leading-relaxed font-medium">
          مرحباً بك يا <strong className="text-[#211d18] dark:text-[#f5f0e7]">{currentUser.name || currentUser.username}</strong>. لقد قمت بتسجيل الدخول باستخدام كلمة مرور مؤقتة تم إنشاؤها لك من قبل الإدارة. لحماية وأمان حسابك، يجب تعيين كلمة مرور شخصية جديدة قبل متابعة التصفح.
        </p>

        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 dark:text-red-400" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Current Temporary Password */}
          <div>
            <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1.5">
              كلمة المرور المؤقتة الحالية *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="اكتب كلمة المرور المؤقتة التي زودتك بها الإدارة"
                className="w-full pl-3 pr-10 py-3 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl outline-none focus:border-[#9a6a35] text-xs font-mono text-left text-[#211d18] dark:text-[#f5f0e7] placeholder:text-black/35 dark:placeholder:text-white/35 transition-all"
                dir="ltr"
              />
              <Lock className="w-4 h-4 text-black/40 dark:text-white/40 absolute right-3.5 top-3.5" />
            </div>
          </div>

          {/* New Personal Password */}
          <div>
            <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1.5">
              كلمة المرور الشخصية الجديدة (6 خانات على الأقل) *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة الخاصة بك"
                className="w-full pl-3 pr-10 py-3 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl outline-none focus:border-[#9a6a35] text-xs font-mono text-left text-[#211d18] dark:text-[#f5f0e7] placeholder:text-black/35 dark:placeholder:text-white/35 transition-all"
                dir="ltr"
              />
              <KeyRound className="w-4 h-4 text-black/40 dark:text-white/40 absolute right-3.5 top-3.5" />
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block font-bold text-[#211d18] dark:text-[#f5f0e7] mb-1.5">
              تأكيد كلمة المرور الجديدة *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد إدخال كلمة المرور الجديدة للتأكيد"
                className="w-full pl-3 pr-10 py-3 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl outline-none focus:border-[#9a6a35] text-xs font-mono text-left text-[#211d18] dark:text-[#f5f0e7] placeholder:text-black/35 dark:placeholder:text-white/35 transition-all"
                dir="ltr"
              />
              <CheckCircle2 className="w-4 h-4 text-black/40 dark:text-white/40 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
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
              className="w-full sm:w-auto px-6 py-3 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] disabled:opacity-60 font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ والتأكيد...</span>
                </>
              ) : (
                <span>حفظ كلمة المرور وتفعيل الحساب</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForceChangePasswordModal;

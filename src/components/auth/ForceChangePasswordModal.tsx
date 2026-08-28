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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#E8E1D9] max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl overflow-hidden relative">
        {/* Header Badge & Title */}
        <div className="flex items-center gap-3 border-b border-[#E8E1D9] pb-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="font-black text-base text-[#2D2A26]">تعيين كلمة مرور شخصية جديدة</h3>
            <p className="text-xs text-amber-800 font-medium">إجراء أمني إلزامي لتفعيل حسابك</p>
          </div>
        </div>

        <p className="text-xs text-[#7A6F64] leading-relaxed">
          مرحباً بك يا <strong className="text-[#2D2A26]">{currentUser.name || currentUser.username}</strong>. لقد قمت بتسجيل الدخول باستخدام كلمة مرور مؤقتة تم إنشاؤها لك من قبل الإدارة. لحماية وأمان حسابك، يجب تعيين كلمة مرور شخصية جديدة قبل متابعة التصفح.
        </p>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Current Temporary Password */}
          <div>
            <label className="block font-bold text-[#2D2A26] mb-1">
              كلمة المرور المؤقتة الحالية *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="اكتب كلمة المرور المؤقتة التي زودتك بها الإدارة"
                className="w-full pl-3 pr-10 py-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl outline-none focus:border-[#B45F42] text-xs font-mono text-left"
                dir="ltr"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
            </div>
          </div>

          {/* New Personal Password */}
          <div>
            <label className="block font-bold text-[#2D2A26] mb-1">
              كلمة المرور الشخصية الجديدة (6 خانات على الأقل) *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة الخاصة بك"
                className="w-full pl-3 pr-10 py-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl outline-none focus:border-[#B45F42] text-xs font-mono text-left"
                dir="ltr"
              />
              <KeyRound className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block font-bold text-[#2D2A26] mb-1">
              تأكيد كلمة المرور الجديدة *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد إدخال كلمة المرور الجديدة للتأكيد"
                className="w-full pl-3 pr-10 py-2.5 bg-[#FDFBF7] border border-[#E8E1D9] rounded-xl outline-none focus:border-[#B45F42] text-xs font-mono text-left"
                dir="ltr"
              />
              <CheckCircle2 className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => logout()}
              className="text-xs text-gray-500 hover:text-rose-600 font-medium py-1.5 flex items-center gap-1 cursor-pointer order-2 sm:order-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج والعودة لاحقاً</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              id="submit-force-change-pwd-btn"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#B45F42] hover:bg-[#9E4F36] disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
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

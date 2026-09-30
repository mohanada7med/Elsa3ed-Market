'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Trash2,
  X,
  Lock,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  Store,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSellerMode?: boolean;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  isSellerMode = false,
}) => {
  const { currentUser, currentRole, deleteMyAccount } = useApp();

  const [password, setPassword] = useState('');
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isSeller = isSellerMode || currentRole === 'seller' || currentUser.role === 'seller';

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!confirmationChecked) {
      setErrorMessage('يرجى تحديد خانة التأكيد على فهم عواقب الحذف النهائي');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('يرجى كتابة كلمة المرور لتأكيد هويتك وحذف الحساب');
      return;
    }

    try {
      setIsDeleting(true);
      await deleteMyAccount(password);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'فشل حذف الحساب، يرجى التأكد من كلمة المرور');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#26160D] rounded-3xl border border-rose-500/30 shadow-2xl p-6 sm:p-8 space-y-5 text-right relative overflow-hidden"
        dir="rtl"
      >
        {/* Decorative alert top stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-red-500 to-rose-700" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>منطقة الخطر — حذف الحساب نهائياً</span>
              </div>
              <h3 className="font-main text-xl sm:text-2xl text-[#3B1E0E] dark:text-[#FFF9EE] mt-0.5">
                {isSeller ? 'حذف حساب الورشة وشيوخ الصنعة' : 'حذف حسابك الشخصي نهائياً'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-black/60 dark:text-white/60 cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Consequences notice */}
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200 text-xs space-y-2 leading-relaxed">
          <p className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
            ⚠️ تنبيه هام: هذا الإجراء نهائي ولا يمكن التراجع عنه أو استعادة البيانات:
          </p>
          {isSeller ? (
            <ul className="list-disc list-inside space-y-1 text-[11px] opacity-90 pr-1">
              <li>سيتم <strong>حذف متجر ورشتك بالكامل</strong> من سوق وه ودليل الحرفيين.</li>
              <li>سيتم <strong>حذف كافة المنتجات المعروضة</strong> وصورها ومخزونها من قاعدة البيانات والسيرفرات السحابية.</li>
              <li>سيتم <strong>حذف مقاطع الريلز (Reels)</strong> المصورة الخاصة بورشة الصنعة.</li>
              <li>سيتم حذف الحساب نهائياً وإنهاء كافة الجلسات النشطة فوراً.</li>
            </ul>
          ) : (
            <ul className="list-disc list-inside space-y-1 text-[11px] opacity-90 pr-1">
              <li>سيتم <strong>حذف بيانات دخولك وملفك الشخصي</strong> بالكامل من قاعدة بيانات المنصة.</li>
              <li>سيتم <strong>مسح سلة التسوق</strong>، وقائمة المقتنيات المفضلة، وكافة الإشعارات.</li>
              <li>سيتم <strong>تجهيل وتجريد أي سجلات طلبات سابقة</strong> من اسمك وعنوانك ورقم هاتفك لحماية خصوصيتك التامة (حق النسيان).</li>
              <li>سيتم تسجيل خروجك فوراً ولن تتمكن من الدخول بهذا الحساب مجدداً.</li>
            </ul>
          )}
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Delete Form */}
        <form onSubmit={handleDelete} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold mb-1.5 text-[#3B1E0E] dark:text-[#FFF9EE]">
              أدخل كلمة مرور الحساب للتأكيد <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="اكتب كلمة مرورك الحالية..."
                disabled={isDeleting}
                className="w-full pl-3 pr-10 py-3 bg-black/[0.035] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xl text-xs outline-none focus:border-rose-500 transition-colors"
              />
              <Lock className="w-4 h-4 text-black/40 dark:text-white/40 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmationChecked}
              onChange={(e) => setConfirmationChecked(e.target.checked)}
              disabled={isDeleting}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
            <span className="text-xs text-[#3B1E0E] dark:text-[#FFF9EE] font-medium leading-relaxed">
              أنا متأكد تماماً، وأدرك أن حذف الحساب سيؤدي لمسح كافة بياناتي نهائياً من قاعدة البيانات ولا يمكن استرجاعها.
            </span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold text-black/70 dark:text-white/70 transition-colors cursor-pointer disabled:opacity-50"
            >
              تراجع وإلغاء
            </button>

            <button
              type="submit"
              disabled={isDeleting || !confirmationChecked || !password.trim()}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري حذف الحساب نهائياً...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>حذف الحساب نهائياً من المنصة</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

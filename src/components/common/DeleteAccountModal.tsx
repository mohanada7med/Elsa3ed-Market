'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  Trash2,
  X,
  Lock,
  Loader2,
  ShieldAlert,
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

  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Guard for client-side portal mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset modal state on opening
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirmationChecked(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Lock background scroll completely when modal is open and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyTouchAction = document.body.style.touchAction;
    const originalPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = originalBodyTouchAction;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isDeleting, onClose]);

  if (!mounted || !isOpen || typeof document === 'undefined') return null;

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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 dark:bg-black/90 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      style={{
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 16px))',
        paddingTop: 'max(1rem, env(safe-area-inset-top, 16px))',
      }}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#26160D] rounded-2xl sm:rounded-3xl border border-rose-500/30 shadow-[0_20px_50px_rgba(225,29,72,0.25)] p-4 sm:p-7 space-y-3.5 sm:space-y-4 text-right relative overflow-y-auto overscroll-contain my-auto max-h-[calc(100dvh-2.5rem)] sm:max-h-[90dvh]"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative alert top stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-red-500 to-rose-700 pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-3 sm:pb-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20 shadow-inner">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">منطقة الخطر — حذف الحساب نهائياً</span>
              </div>
              <h3
                id="delete-account-modal-title"
                className="font-cairo font-bold text-base sm:text-xl text-[#3B1E0E] dark:text-[#FFF9EE] mt-0.5 leading-snug"
              >
                {isSeller ? 'حذف حساب الورشة وشيوخ الصنعة' : 'حذف حسابك الشخصي نهائياً'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-black/60 dark:text-white/60 cursor-pointer disabled:opacity-50 shrink-0 transition-colors"
            title="إغلاق"
            aria-label="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Consequences notice */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200 text-xs space-y-2 leading-relaxed">
          <p className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-300 text-[11px] sm:text-xs">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>تنبيه هام: هذا الإجراء نهائي ولا يمكن التراجع عنه أو استعادة البيانات:</span>
          </p>
          {isSeller ? (
            <ul className="list-disc list-inside space-y-1 text-[11px] sm:text-xs opacity-90 pr-1">
              <li>سيتم <strong>حذف متجر ورشتك بالكامل</strong> من سوق وه ودليل الحرفيين.</li>
              <li>سيتم <strong>حذف كافة المنتجات المعروضة</strong> وصورها ومخزونها من قاعدة البيانات والسيرفرات السحابية.</li>
              <li>سيتم <strong>حذف مقاطع الريلز (Reels)</strong> المصورة الخاصة بورشة الصنعة.</li>
              <li>سيتم حذف الحساب نهائياً وإنهاء كافة الجلسات النشطة فوراً.</li>
            </ul>
          ) : (
            <ul className="list-disc list-inside space-y-1 text-[11px] sm:text-xs opacity-90 pr-1">
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
        <form onSubmit={handleDelete} className="space-y-3.5 sm:space-y-4 pt-1">
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
                className="w-full pl-3 pr-10 py-2.5 sm:py-3 bg-black/[0.035] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 rounded-xl text-xs sm:text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
              />
              <Lock className="w-4 h-4 text-black/40 dark:text-white/40 absolute right-3.5 top-3 sm:top-3.5 pointer-events-none" />
            </div>
          </div>

          <label className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmationChecked}
              onChange={(e) => setConfirmationChecked(e.target.checked)}
              disabled={isDeleting}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500 cursor-pointer shrink-0"
            />
            <span className="text-[11px] sm:text-xs text-[#3B1E0E] dark:text-[#FFF9EE] font-medium leading-relaxed">
              أنا متأكد تماماً، وأدرك أن حذف الحساب سيؤدي لمسح كافة بياناتي نهائياً من قاعدة البيانات ولا يمكن استرجاعها.
            </span>
          </label>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-black/10 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold text-black/70 dark:text-white/70 transition-colors cursor-pointer disabled:opacity-50 text-center"
            >
              تراجع وإلغاء
            </button>

            <button
              type="submit"
              disabled={isDeleting || !confirmationChecked || !password.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>جاري حذف الحساب نهائياً...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <span>حذف الحساب نهائياً من المنصة</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
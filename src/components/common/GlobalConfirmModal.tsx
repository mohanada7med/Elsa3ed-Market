import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Trash2, RefreshCw, X } from 'lucide-react';

export const GlobalConfirmModal: React.FC = () => {
  const { confirmModalState, closeConfirmModal } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!confirmModalState) return;
      if (e.key === 'Escape' && !isLoading) {
        closeConfirmModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmModalState, isLoading, closeConfirmModal]);

  if (!confirmModalState) return null;

  const {
    title = 'تأكيد الإجراء',
    message,
    confirmText = 'تأكيد الحذف',
    cancelText = 'تراجع',
    danger = true,
    onConfirm
  } = confirmModalState;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      closeConfirmModal();
    } catch (err) {
      console.error('Confirm modal action error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      id="global-confirm-dialog"
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="bg-white dark:bg-[#151513] rounded-3xl border border-black/10 dark:border-white/10 max-w-md w-full p-5 sm:p-6 space-y-5 shadow-2xl overflow-hidden relative text-[#211d18] dark:text-[#f5f0e7] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                danger
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  : 'bg-[#9a6a35]/10 text-[#9a6a35] dark:text-[#d5a56d] border border-[#9a6a35]/20'
              }`}
            >
              {danger ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-[#211d18] dark:text-[#f5f0e7]">
                {title}
              </h3>
              <p className="text-[11px] text-black/50 dark:text-white/50 font-medium">
                يرجى قراءة التنبيه وتأكيد رغبتك في المتابعة
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={closeConfirmModal}
            className="p-1.5 rounded-xl text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message body */}
        <div className="p-3.5 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/5 dark:border-white/5">
          <p className="text-xs sm:text-sm text-black/80 dark:text-white/80 leading-relaxed font-medium whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            disabled={isLoading}
            onClick={closeConfirmModal}
            id="confirm-modal-cancel-btn"
            className="px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleConfirm}
            id="confirm-modal-submit-btn"
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
              danger
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-[#9a6a35] hover:bg-[#855928] text-white'
            } disabled:opacity-60`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>جاري التنفيذ...</span>
              </>
            ) : (
              <>
                {danger && <Trash2 className="w-3.5 h-3.5" />}
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

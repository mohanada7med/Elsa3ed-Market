import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div id="toast-container" className="fixed bottom-4 sm:bottom-5 left-4 sm:left-5 right-4 sm:right-auto z-50 flex flex-col gap-2.5 max-w-sm w-auto sm:w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = CheckCircle2;
          let borderClass = 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50 dark:bg-[#12241A] text-emerald-950 dark:text-emerald-100 shadow-md';
          let iconColor = 'text-emerald-600 dark:text-emerald-400';

          if (toast.type === 'error') {
            Icon = AlertCircle;
            borderClass = 'border-rose-300 dark:border-rose-800/60 bg-rose-50 dark:bg-[#281315] text-rose-950 dark:text-rose-100 shadow-md';
            iconColor = 'text-rose-600 dark:text-rose-400';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            borderClass = 'border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-[#271C0F] text-amber-950 dark:text-amber-100 shadow-md';
            iconColor = 'text-amber-600 dark:text-[#d6aa72]';
          } else if (toast.type === 'info') {
            Icon = Info;
            borderClass = 'border-orange-300 dark:border-orange-800/60 bg-orange-50 dark:bg-[#261710] text-orange-950 dark:text-orange-100 shadow-md';
            iconColor = 'text-orange-600 dark:text-orange-400';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              id={`toast-${toast.id}`}
              className={`pointer-events-auto p-4 rounded-xl border shadow-lg flex items-start gap-3 backdrop-blur-sm ${borderClass}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-sm leading-tight">{toast.title}</h4>
                  <span className="text-[11px] opacity-60 font-mono">{toast.timestamp}</span>
                </div>
                <p className="text-xs mt-1 text-inherit opacity-90 leading-relaxed">{toast.message}</p>
              </div>
              <button
                type="button"
                id={`toast-close-${toast.id}`}
                onClick={() => removeToast(toast.id)}
                className="text-inherit opacity-50 hover:opacity-100 p-1 transition-opacity"
                aria-label="إغلاق التنبيه"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

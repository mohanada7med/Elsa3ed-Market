import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div id="toast-container" className="fixed bottom-5 left-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = CheckCircle2;
          let borderClass = 'border-emerald-500/40 bg-emerald-50 text-emerald-950';
          let iconColor = 'text-emerald-600';

          if (toast.type === 'error') {
            Icon = AlertCircle;
            borderClass = 'border-rose-500/40 bg-rose-50 text-rose-950';
            iconColor = 'text-rose-600';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            borderClass = 'border-amber-500/40 bg-amber-50 text-amber-950';
            iconColor = 'text-amber-600';
          } else if (toast.type === 'info') {
            Icon = Info;
            borderClass = 'border-orange-500/40 bg-orange-50 text-orange-950';
            iconColor = 'text-orange-600';
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

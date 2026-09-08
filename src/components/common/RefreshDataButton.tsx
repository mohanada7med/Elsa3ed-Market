import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export interface RefreshDataButtonProps {
  onRefresh: () => Promise<void> | void;
  isLoading?: boolean;
  label?: string;
  loadingLabel?: string;
  className?: string;
  size?: 'sm' | 'md';
  variant?: 'default' | 'outline' | 'subtle' | 'compact';
  showLastUpdated?: boolean;
  lastUpdated?: Date | string | null;
  id?: string;
  silentSuccess?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export const RefreshDataButton: React.FC<RefreshDataButtonProps> = ({
  onRefresh,
  isLoading,
  label = 'تحديث البيانات',
  loadingLabel = 'جاري التحديث...',
  className = '',
  size = 'md',
  variant = 'default',
  showLastUpdated = true,
  lastUpdated: externalLastUpdated,
  id,
  silentSuccess = false,
  successMessage,
  errorMessage = 'فشل في تحديث البيانات من قاعدة البيانات'
}) => {
  const { addToast } = useApp();
  const [internalLoading, setInternalLoading] = useState(false);
  const [localLastUpdated, setLocalLastUpdated] = useState<string | null>(() => {
    return new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  });

  const isBusy = isLoading !== undefined ? isLoading : internalLoading;

  const handleRefresh = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isBusy) return;

    setInternalLoading(true);
    try {
      await onRefresh();
      const nowFormatted = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      setLocalLastUpdated(nowFormatted);
      if (!silentSuccess) {
        addToast(
          'تم تحديث البيانات',
          successMessage || 'تم جلب أحدث البيانات من قاعدة البيانات بنجاح',
          'success'
        );
      }
    } catch (err: any) {
      console.error('[RefreshDataButton] Error executing data refresh:', err);
      addToast('فشل التحديث', err?.message || errorMessage, 'error');
    } finally {
      setInternalLoading(false);
    }
  };

  const currentLastUpdated = externalLastUpdated
    ? typeof externalLastUpdated === 'string'
      ? externalLastUpdated
      : externalLastUpdated.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    : localLastUpdated;

  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-1.5 text-[11px] gap-1.5'
    : 'px-3.5 py-2 text-xs gap-2';

  let variantClasses = 'bg-white/80 dark:bg-[#151513]/90 hover:bg-[#9a6a35]/10 dark:hover:bg-[#9a6a35]/20 text-[#211d18] dark:text-[#f5f0e7] border border-black/10 dark:border-white/10 shadow-xs backdrop-blur-md';
  if (variant === 'outline') {
    variantClasses = 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[#211d18] dark:text-[#f5f0e7] border border-black/10 dark:border-white/10';
  } else if (variant === 'subtle') {
    variantClasses = 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black/70 dark:text-white/70 hover:text-[#211d18] dark:hover:text-[#f5f0e7] border border-black/5 dark:border-white/5';
  } else if (variant === 'compact') {
    variantClasses = 'bg-white/80 dark:bg-[#151513]/90 hover:bg-[#9a6a35]/10 dark:hover:bg-[#9a6a35]/20 text-[#211d18] dark:text-[#f5f0e7] border border-black/10 dark:border-white/10 p-2 shadow-xs';
  }

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`} dir="rtl">
      <button
        type="button"
        id={id || 'refresh-data-btn'}
        onClick={handleRefresh}
        disabled={isBusy}
        title={label}
        aria-label={label}
        className={`inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses}`}
      >
        <RefreshCw
          className={`shrink-0 transition-transform duration-500 ${
            size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
          } ${isBusy ? 'animate-spin text-[#9a6a35]' : 'text-black/50 dark:text-white/50 group-hover:text-[#211d18] dark:group-hover:text-white'}`}
        />
        <span className="hidden sm:inline whitespace-nowrap">
          {isBusy ? loadingLabel : label}
        </span>
        <span className="sm:hidden text-[10px] font-bold">
          {isBusy ? 'تحديث...' : 'تحديث'}
        </span>
      </button>

      {showLastUpdated && currentLastUpdated && (
        <span
          className="hidden md:inline-flex items-center text-[11px] text-black/60 dark:text-white/60 font-medium bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-black/10 dark:border-white/10 whitespace-nowrap"
          title="توقيت آخر جلب للبيانات"
        >
          آخر تحديث: {currentLastUpdated}
        </span>
      )}
    </div>
  );
};

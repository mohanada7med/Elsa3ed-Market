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

  let variantClasses = 'bg-white hover:bg-[#F3EFE9] text-[#2D2A26] border border-[#E8E1D9] shadow-2xs';
  if (variant === 'outline') {
    variantClasses = 'bg-transparent hover:bg-[#F3EFE9]/60 text-[#2D2A26] border border-[#E8E1D9]';
  } else if (variant === 'subtle') {
    variantClasses = 'bg-[#FDFBF7] hover:bg-[#F3EFE9] text-[#7A6F64] hover:text-[#2D2A26] border border-[#E8E1D9]/70';
  } else if (variant === 'compact') {
    variantClasses = 'bg-white hover:bg-[#F3EFE9] text-[#2D2A26] border border-[#E8E1D9] p-2';
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
          } ${isBusy ? 'animate-spin text-[#B45F42]' : 'text-[#7A6F64] group-hover:text-[#2D2A26]'}`}
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
          className="hidden md:inline-flex items-center text-[11px] text-[#7A6F64] font-medium bg-[#F8F5F0] px-2.5 py-1 rounded-lg border border-[#E8E1D9]/60 whitespace-nowrap"
          title="توقيت آخر جلب للبيانات"
        >
          آخر تحديث: {currentLastUpdated}
        </span>
      )}
    </div>
  );
};

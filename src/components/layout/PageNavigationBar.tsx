import React, { type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface PageNavigationBarProps {
  backLabel?: string;
  onBack?: () => void;
  title?: string;
  children?: ReactNode;
}

export const PageNavigationBar: React.FC<PageNavigationBarProps> = ({
  backLabel,
  onBack,
  title,
  children,
}) => (
  <nav
    aria-label="تنقل الصفحة"
    dir="rtl"
    className="relative z-40 w-full border-b border-black/10 bg-cream/90 text-espresso backdrop-blur-xl dark:border-white/10 dark:bg-espresso-900/90 dark:text-cream"
  >
    <div className="mx-auto grid min-h-16 max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2 sm:px-8 lg:px-12">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={backLabel || 'رجوع'}
            className="group flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full transition-colors hover:text-primary dark:hover:text-primary-hover"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/60 transition-colors group-hover:bg-espresso group-hover:text-white dark:border-white/10 dark:bg-cream/5 dark:group-hover:bg-white dark:group-hover:text-black">
              <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" />
            </span>
            {backLabel && (
              <span className="hidden max-w-28 truncate text-xs font-bold sm:inline">
                {backLabel}
              </span>
            )}
          </button>
        )}
        {title && (
          <span className="min-w-0 truncate text-xs font-black sm:text-sm">
            {title}
          </span>
        )}
      </div>
      {children && (
        <div className="flex max-w-[55vw] flex-wrap items-center justify-end gap-1.5 sm:max-w-none sm:gap-2">
          {children}
        </div>
      )}
    </div>
  </nav>
);

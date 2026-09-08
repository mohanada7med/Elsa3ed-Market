import React from 'react';
import { renderIcon } from './renderIcon';

export interface WAHInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ElementType | React.ReactNode;
}

export const WAHInput = React.forwardRef<HTMLInputElement, WAHInputProps>(
  ({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const renderedIcon = renderIcon(icon, 'w-4 h-4 shrink-0');

    return (
      <div className="w-full space-y-1.5 text-right">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs sm:text-sm font-bold text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {renderedIcon && (
            <div className="absolute right-3 text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] pointer-events-none shrink-0">
              {renderedIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`w-full min-h-[44px] rounded-xl text-sm font-medium transition-all duration-200 outline-none ${renderedIcon ? 'pr-10 pl-3.5' : 'px-3.5'
              } py-2.5 bg-black/5 dark:bg-white/5 text-[#211d18] dark:text-[#f5f0e7] placeholder:text-black/40 dark:placeholder:text-white/40 border ${error
                ? 'border-rose-500 dark:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-black/10 dark:border-white/10 focus:border-[#9a6a35] dark:focus:border-[#9a6a35] focus:ring-2 focus:ring-[#9a6a35]/20 focus:bg-white dark:focus:bg-[#151513]'
              } ${className}`}
            {...props}
          />
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-black/60 dark:text-white/60">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

WAHInput.displayName = 'WAHInput';

export interface WAHTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const WAHTextarea = React.forwardRef<HTMLTextAreaElement, WAHTextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full space-y-1.5 text-right">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs sm:text-sm font-bold text-[#211d18] dark:text-[#f5f0e7]"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={`w-full min-h-[100px] rounded-xl text-sm font-medium p-3.5 transition-all duration-200 outline-none bg-black/5 dark:bg-white/5 text-[#211d18] dark:text-[#f5f0e7] placeholder:text-black/40 dark:placeholder:text-white/40 border ${error
              ? 'border-rose-500 dark:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-black/10 dark:border-white/10 focus:border-[#9a6a35] dark:focus:border-[#9a6a35] focus:ring-2 focus:ring-[#9a6a35]/20 focus:bg-white dark:focus:bg-[#151513]'
            } ${className}`}
          {...props}
        />

        {error && (
          <p className="text-xs font-semibold text-[var(--wah-error,#B9382B)] dark:text-[var(--wah-error,#E05344)]">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

WAHTextarea.displayName = 'WAHTextarea';

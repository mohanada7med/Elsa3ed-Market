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
            className="block text-xs sm:text-sm font-bold text-espresso dark:text-cream"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {renderedIcon && (
            <div className="absolute right-3 text-espresso/50 dark:text-sand/60 pointer-events-none shrink-0">
              {renderedIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`w-full min-h-[44px] rounded-xl text-sm font-medium transition-all duration-200 outline-none ${renderedIcon ? 'pr-10 pl-3.5' : 'px-3.5'
              } py-2.5 bg-white/90 dark:bg-espresso/60 text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-sand/40 border ${error
                ? 'border-rose-500 dark:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-black/15 dark:border-primary/40 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/25 focus:bg-white dark:focus:bg-espresso'
              } ${className}`}
            {...props}
          />
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-espresso/60 dark:text-sand/60">
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
            className="block text-xs sm:text-sm font-bold text-espresso dark:text-cream"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={`w-full min-h-[100px] rounded-xl text-sm font-medium p-3.5 transition-all duration-200 outline-none bg-white/90 dark:bg-espresso/60 text-espresso dark:text-cream placeholder:text-espresso/40 dark:placeholder:text-sand/40 border ${error
            ? 'border-rose-500 dark:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            : 'border-black/15 dark:border-primary/40 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/25 focus:bg-white dark:focus:bg-espresso'
            } ${className}`}
          {...props}
        />

        {error && (
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-espresso/60 dark:text-sand/60">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

WAHTextarea.displayName = 'WAHTextarea';

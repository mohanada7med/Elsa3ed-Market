import React from 'react';

export interface WAHInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const WAHInput = React.forwardRef<HTMLInputElement, WAHInputProps>(
  ({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
    const inputId = id || React.useId();

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
          {icon && (
            <div className="absolute right-3 text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] pointer-events-none shrink-0">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`w-full min-h-[44px] rounded-xl text-sm font-medium transition-all duration-200 outline-none ${
              icon ? 'pr-10 pl-3.5' : 'px-3.5'
            } py-2.5 bg-[var(--wah-surface-subtle,#FAF6F0)] dark:bg-[var(--wah-surface,#1B1613)] text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] placeholder:text-[var(--wah-text-subtle,#9C8E80)] border ${
              error
                ? 'border-[var(--wah-error,#B9382B)] focus:ring-2 focus:ring-[var(--wah-error,#B9382B)]/20'
                : 'border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] focus:border-[var(--wah-primary,#B24C2B)] dark:focus:border-[var(--wah-primary,#E0633C)] focus:ring-2 focus:ring-[var(--wah-primary,#B24C2B)]/20 focus:bg-white dark:focus:bg-[var(--wah-surface-subtle,#26201B)]'
            } ${className}`}
            {...props}
          />
        </div>

        {error && (
          <p className="text-xs font-semibold text-[var(--wah-error,#B9382B)]">{error}</p>
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

WAHInput.displayName = 'WAHInput';

export interface WAHTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const WAHTextarea = React.forwardRef<HTMLTextAreaElement, WAHTextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const textareaId = id || React.useId();

    return (
      <div className="w-full space-y-1.5 text-right">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs sm:text-sm font-bold text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)]"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={`w-full min-h-[100px] rounded-xl text-sm font-medium p-3.5 transition-all duration-200 outline-none bg-[var(--wah-surface-subtle,#FAF6F0)] dark:bg-[var(--wah-surface,#1B1613)] text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] placeholder:text-[var(--wah-text-subtle,#9C8E80)] border ${
            error
              ? 'border-[var(--wah-error,#B9382B)] focus:ring-2 focus:ring-[var(--wah-error,#B9382B)]/20'
              : 'border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] focus:border-[var(--wah-primary,#B24C2B)] dark:focus:border-[var(--wah-primary,#E0633C)] focus:ring-2 focus:ring-[var(--wah-primary,#B24C2B)]/20 focus:bg-white dark:focus:bg-[var(--wah-surface-subtle,#26201B)]'
          } ${className}`}
          {...props}
        />

        {error && (
          <p className="text-xs font-semibold text-[var(--wah-error,#B9382B)]">{error}</p>
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

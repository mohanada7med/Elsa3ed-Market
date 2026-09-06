import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { renderIcon } from './renderIcon';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'cta'
  | 'icon';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface WAHButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: React.ReactNode;
  icon?: React.ElementType | React.ReactNode;
  iconPosition?: 'start' | 'end';
  loading?: boolean;
  editorialShape?: boolean;
}

export const WAHButton: React.FC<WAHButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'start',
  loading = false,
  editorialShape = false,
  className = '',
  disabled,
  ...props
}) => {
  // Base sizing and touch target
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'min-h-[36px] px-3.5 py-1.5 text-xs gap-1.5',
    md: 'min-h-[44px] px-5 py-2.5 text-sm gap-2',
    lg: 'min-h-[50px] px-7 py-3 text-base gap-2.5 font-bold',
    icon: 'min-h-[44px] min-w-[44px] p-2.5 justify-center'
  };

  // Shape classes
  const shapeClass = editorialShape
    ? 'rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md'
    : 'rounded-xl';

  // Variant classes mapped to centralized tokens
  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-[var(--wah-primary,#B24C2B)] hover:bg-[var(--wah-primary-hover,#963E21)] text-white shadow-xs hover:shadow-md border border-[var(--wah-primary,#B24C2B)] active:scale-[0.98]',
    secondary:
      'bg-[var(--wah-surface-subtle,#F3ECE2)] hover:bg-[var(--wah-surface-muted,#EAE1D5)] dark:bg-[var(--wah-surface-subtle,#26201B)] dark:hover:bg-[var(--wah-surface-muted,#322923)] text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] hover:border-[var(--wah-border-hover,#CBBDB0)] active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-[var(--wah-primary-light,rgba(178,76,43,0.08))] text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] border-1.5 border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] hover:border-[var(--wah-primary,#B24C2B)] hover:text-[var(--wah-primary,#B24C2B)] dark:hover:text-[var(--wah-primary,#E0633C)] active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-[var(--wah-surface-subtle,#F3ECE2)] dark:hover:bg-[var(--wah-surface-subtle,#26201B)] text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] hover:text-[var(--wah-primary,#B24C2B)] dark:hover:text-[var(--wah-primary,#E0633C)] active:scale-[0.98]',
    destructive:
      'bg-[var(--wah-error,#B9382B)]/10 hover:bg-[var(--wah-error,#B9382B)]/20 text-[var(--wah-error,#B9382B)] border border-[var(--wah-error,#B9382B)]/30 active:scale-[0.98]',
    cta:
      'bg-gradient-to-r from-[var(--wah-primary,#B24C2B)] to-[var(--wah-accent,#D97724)] hover:from-[var(--wah-primary-hover,#963E21)] hover:to-[var(--wah-accent-hover,#B86018)] text-white shadow-md hover:shadow-lg active:scale-[0.98]',
    icon:
      'bg-white dark:bg-[var(--wah-surface,#1B1613)] hover:bg-[var(--wah-surface-subtle,#F3ECE2)] dark:hover:bg-[var(--wah-surface-subtle,#26201B)] text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] hover:border-[var(--wah-primary,#B24C2B)]'
  };

  const renderedIcon = renderIcon(icon, 'w-4 h-4 shrink-0');

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-bold font-sans transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wah-primary,#B24C2B)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeClasses[size]} ${shapeClass} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {renderedIcon && iconPosition === 'start' && <span className="shrink-0">{renderedIcon}</span>}
          {children && <span>{children}</span>}
          {renderedIcon && iconPosition === 'end' && <span className="shrink-0">{renderedIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

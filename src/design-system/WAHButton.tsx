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
    : 'rounded-[1.25rem]';

  // Variant classes mapped to unified Wah design tokens
  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] shadow-sm hover:shadow-md border border-transparent active:scale-[0.98]',
    secondary:
      'bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 text-[#211d18] dark:text-[#f5f0e7] border border-black/10 dark:border-white/10 active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[#211d18] dark:text-[#f5f0e7] border border-black/15 dark:border-white/15 hover:border-[#9a6a35] hover:text-[#9a6a35] dark:hover:border-[#9a6a35] dark:hover:text-[#9a6a35] active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] hover:text-[#9a6a35] dark:hover:text-[#9a6a35] active:scale-[0.98]',
    destructive:
      'bg-[#B9382B]/10 hover:bg-[#B9382B]/20 text-[#B9382B] border border-[#B9382B]/30 active:scale-[0.98]',
    cta:
      'bg-[#9a6a35] hover:bg-[#7d5427] dark:hover:bg-[#b88248] text-white shadow-md hover:shadow-lg active:scale-[0.98]',
    icon:
      'bg-white/75 dark:bg-[#151513]/90 hover:bg-white dark:hover:bg-[#20201d] text-[#211d18] dark:text-[#f5f0e7] border border-black/10 dark:border-white/10 hover:border-[#9a6a35]'
  };

  const renderedIcon = renderIcon(icon, 'w-4 h-4 shrink-0');

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-bold font-sans transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9a6a35] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#151513] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeClasses[size]} ${shapeClass} ${variantClasses[variant]} ${className}`}
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

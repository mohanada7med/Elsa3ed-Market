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

  // Variant classes mapped to standardized design tokens
  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-[#6B3A1F] text-[#FFF9EE] hover:bg-[#3B1E0E] dark:bg-[#6B3A1F] dark:text-[#FFF9EE] dark:hover:bg-[#4A2715] shadow-sm hover:shadow-md border border-transparent active:scale-[0.98]',
    secondary:
      'bg-[#F8EBD7] text-[#3B1E0E] hover:bg-[#FFF9EE] border border-[#E0C79B] dark:bg-[#3B1E0E] dark:text-[#FFF9EE] dark:border-[#6B3A1F] dark:hover:bg-[#4A2715] active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-[#F8EBD7]/60 dark:hover:bg-[#3B1E0E]/80 text-[#3B1E0E] dark:text-[#FFF9EE] border border-[#E0C79B] dark:border-[#6B3A1F] hover:border-[#C99444] dark:hover:border-[#C99444] active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-[#F8EBD7]/60 dark:hover:bg-[#3B1E0E]/80 text-[#3B1E0E] dark:text-[#FFF9EE] hover:text-[#C99444] dark:hover:text-[#C99444] active:scale-[0.98]',
    destructive:
      'bg-[#B9382B]/10 hover:bg-[#B9382B]/20 text-[#B9382B] border border-[#B9382B]/30 active:scale-[0.98]',
    cta:
      'bg-[#E66A2E] hover:bg-[#C99444] text-[#FFF9EE] shadow-md hover:shadow-lg active:scale-[0.98]',
    icon:
      'bg-[#F8EBD7] dark:bg-[#3B1E0E] hover:bg-[#FFF9EE] dark:hover:bg-[#4A2715] text-[#3B1E0E] dark:text-[#FFF9EE] border border-[#E0C79B] dark:border-[#6B3A1F] hover:border-[#C99444]'
  };

  const renderedIcon = renderIcon(icon, 'w-4 h-4 shrink-0');

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-bold font-sans transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C99444] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF9EE] dark:focus-visible:ring-offset-[#1B1009] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeClasses[size]} ${shapeClass} ${variantClasses[variant]} ${className}`}
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

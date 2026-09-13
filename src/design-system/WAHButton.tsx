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
      'bg-espresso text-cream hover:bg-primary dark:bg-cream dark:text-espresso dark:hover:bg-sand shadow-sm hover:shadow-md border border-transparent active:scale-[0.98]',
    secondary:
      'bg-sand text-espresso hover:bg-[#FAE1C3] border border-primary/30 dark:bg-espresso dark:text-sand dark:border-primary/40 dark:hover:bg-[#382f25] active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-sand/40 dark:hover:bg-espresso/80 text-espresso dark:text-cream border border-primary/30 dark:border-primary/40 hover:border-primary dark:hover:border-sand active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-sand/50 dark:hover:bg-espresso/80 text-espresso dark:text-cream hover:text-primary dark:hover:text-sand active:scale-[0.98]',
    destructive:
      'bg-[#B9382B]/10 hover:bg-[#B9382B]/20 text-[#B9382B] border border-[#B9382B]/30 active:scale-[0.98]',
    cta:
      'bg-primary hover:bg-primary-hover dark:hover:bg-primary-hover text-white shadow-md hover:shadow-lg active:scale-[0.98]',
    icon:
      'bg-white/85 dark:bg-espresso/90 hover:bg-white dark:hover:bg-[#382f25] text-espresso dark:text-cream border border-primary/30 dark:border-primary/40 hover:border-primary'
  };

  const renderedIcon = renderIcon(icon, 'w-4 h-4 shrink-0');

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-bold font-sans transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#151513] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeClasses[size]} ${shapeClass} ${variantClasses[variant]} ${className}`}
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

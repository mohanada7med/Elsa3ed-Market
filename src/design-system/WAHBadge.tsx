import React from 'react';
import { renderIcon } from './renderIcon';

export type BadgeVariant =
  | 'terracotta'
  | 'nile'
  | 'ochre'
  | 'stone'
  | 'success'
  | 'outline';

export interface WAHBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ElementType | React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const WAHBadge: React.FC<WAHBadgeProps> = ({
  variant = 'terracotta',
  children,
  icon,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';
  const renderedIcon = renderIcon(icon, size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0');

  const variantClasses: Record<BadgeVariant, string> = {
    terracotta:
      'bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d] border border-[#9a6a35]/30',
    nile:
      'bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border border-cyan-500/25',
    ochre:
      'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30',
    stone:
      'bg-black/5 dark:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] border border-black/10 dark:border-white/10',
    success:
      'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25',
    outline:
      'bg-transparent text-black/60 dark:text-white/60 border border-black/10 dark:border-white/10'
  };

  return (
    <span
      className={`inline-flex items-center font-bold tracking-tight rounded-md select-none ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {renderedIcon && <span className="shrink-0">{renderedIcon}</span>}
      <span>{children}</span>
    </span>
  );
};

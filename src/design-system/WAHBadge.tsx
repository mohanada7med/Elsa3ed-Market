import React from 'react';

export type BadgeVariant =
  | 'terracotta'
  | 'nile'
  | 'ochre'
  | 'stone'
  | 'success'
  | 'outline';

interface WAHBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
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

  const variantClasses: Record<BadgeVariant, string> = {
    terracotta:
      'bg-[var(--wah-primary-light,rgba(178,76,43,0.1))] text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] border border-[var(--wah-primary,#B24C2B)]/25',
    nile:
      'bg-[var(--wah-secondary-light,rgba(38,70,83,0.1))] text-[var(--wah-secondary,#264653)] dark:text-[var(--wah-secondary,#427B8C)] border border-[var(--wah-secondary,#264653)]/25',
    ochre:
      'bg-[var(--wah-accent-light,rgba(217,119,36,0.1))] text-[var(--wah-accent,#D97724)] dark:text-[var(--wah-accent,#E68A35)] border border-[var(--wah-accent,#D97724)]/25',
    stone:
      'bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)] text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)]',
    success:
      'bg-[var(--wah-success,#286644)]/10 text-[var(--wah-success,#286644)] dark:text-[#489E6E] border border-[var(--wah-success,#286644)]/25',
    outline:
      'bg-transparent text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)]'
  };

  return (
    <span
      className={`inline-flex items-center font-bold tracking-tight rounded-md select-none ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

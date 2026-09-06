import React from 'react';
import { WAHPattern } from './WAHPattern';
import { PatternType } from './tokens';

interface WAHSectionProps {
  id?: string;
  badge?: React.ReactNode;
  badgeIcon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  pattern?: PatternType;
  patternOpacity?: number;
  bgSurface?: boolean;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export const WAHSection: React.FC<WAHSectionProps> = ({
  id,
  badge,
  badgeIcon,
  title,
  subtitle,
  action,
  pattern,
  patternOpacity = 0.03,
  bgSurface = false,
  children,
  className = '',
  headerClassName = ''
}) => {
  return (
    <section
      id={id}
      className={`relative py-12 sm:py-16 lg:py-20 overflow-hidden ${
        bgSurface
          ? 'bg-[var(--wah-surface-subtle,#F3ECE2)]/60 dark:bg-[var(--wah-surface-subtle,#26201B)]/40 border-y border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)]'
          : ''
      } ${className}`}
    >
      {pattern && (
        <WAHPattern
          type={pattern}
          opacity={patternOpacity}
          className="pointer-events-none"
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {(title || badge || action) && (
          <div
            className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12 ${headerClassName}`}
          >
            <div className="space-y-2 max-w-2xl text-right">
              {badge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--wah-primary-light,rgba(178,76,43,0.1))] border border-[var(--wah-primary,#B24C2B)]/20 text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] text-xs font-bold">
                  {badgeIcon && <span className="shrink-0">{badgeIcon}</span>}
                  <span>{badge}</span>
                </div>
              )}

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] font-serif tracking-tight leading-snug">
                {title}
              </h2>

              {subtitle && (
                <p className="text-xs sm:text-sm lg:text-base text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] font-medium leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {action && (
              <div className="shrink-0 pt-1 md:pt-0 self-start md:self-end">
                {action}
              </div>
            )}
          </div>
        )}

        {children}
      </div>
    </section>
  );
};

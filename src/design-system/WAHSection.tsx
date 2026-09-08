import React from 'react';
import { WAHPattern } from './WAHPattern';
import { PatternType } from './tokens';
import { renderIcon } from './renderIcon';

interface WAHSectionProps {
  id?: string;
  badge?: React.ReactNode;
  eyebrow?: React.ReactNode;
  badgeIcon?: React.ElementType | React.ReactNode;
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
  eyebrow,
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
  const badgeContent = badge ?? eyebrow;
  const renderedBadgeIcon = renderIcon(badgeIcon, 'w-3.5 h-3.5 shrink-0');

  return (
    <section
      id={id}
      className={`relative py-12 sm:py-16 lg:py-20 overflow-hidden ${
        bgSurface
          ? 'bg-black/5 dark:bg-white/5 border-y border-black/10 dark:border-white/10'
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

      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        {(title || badgeContent || action) && (
          <div
            className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12 ${headerClassName}`}
          >
            <div className="space-y-2 max-w-2xl text-right">
              {badgeContent && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9a6a35]/15 border border-[#9a6a35]/30 text-[#9a6a35] dark:text-[#d5a56d] text-xs font-bold">
                  {renderedBadgeIcon}
                  <span>{badgeContent}</span>
                </div>
              )}

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#211d18] dark:text-[#f5f0e7] font-serif tracking-tight leading-snug">
                {title}
              </h2>

              {subtitle && (
                <p className="text-xs sm:text-sm lg:text-base text-black/60 dark:text-white/60 font-medium leading-relaxed">
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

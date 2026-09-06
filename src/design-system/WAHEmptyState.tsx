import React from 'react';
import { WAHPattern } from './WAHPattern';
import { WAHButton } from './WAHButton';
import { PatternType } from './tokens';
import { renderIcon } from './renderIcon';

export interface WAHEmptyStateProps {
  icon?: React.ElementType | React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  pattern?: PatternType;
  className?: string;
}

export const WAHEmptyState: React.FC<WAHEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  pattern = 'pottery',
  className = ''
}) => {
  const renderedIcon = renderIcon(icon, 'w-8 h-8 sm:w-10 sm:h-10');

  return (
    <div
      className={`relative min-h-[300px] sm:min-h-[360px] flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] bg-white dark:bg-[var(--wah-surface,#1B1613)] overflow-hidden ${className}`}
    >
      <WAHPattern type={pattern} opacity={0.05} />

      <div className="relative z-10 max-w-md mx-auto space-y-4">
        {renderedIcon && (
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-[var(--wah-primary-light,rgba(178,76,43,0.1))] text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] flex items-center justify-center border border-[var(--wah-primary,#B24C2B)]/20 shadow-xs">
            {renderedIcon}
          </div>
        )}

        <div className="space-y-1.5">
          <h3 className="text-lg sm:text-xl font-black font-serif text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)]">
            {title}
          </h3>
          {description && (
            <p className="text-xs sm:text-sm text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actionLabel && onAction && (
          <div className="pt-2">
            <WAHButton variant="primary" onClick={onAction}>
              {actionLabel}
            </WAHButton>
          </div>
        )}
      </div>
    </div>
  );
};

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
      className={`relative min-h-[300px] sm:min-h-[360px] flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[2rem] border border-black/10 dark:border-white/10 bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl shadow-lg overflow-hidden ${className}`}
    >
      <WAHPattern type={pattern} opacity={0.05} />

      <div className="relative z-10 max-w-md mx-auto space-y-4">
        {renderedIcon && (
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-[#9a6a35]/15 text-[#9a6a35] dark:text-[#d5a56d] flex items-center justify-center border border-[#9a6a35]/30 shadow-xs">
            {renderedIcon}
          </div>
        )}

        <div className="space-y-1.5">
          <h3 className="text-lg sm:text-xl font-black font-serif text-[#211d18] dark:text-[#f5f0e7]">
            {title}
          </h3>
          {description && (
            <p className="text-xs sm:text-sm text-black/60 dark:text-white/60 leading-relaxed">
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

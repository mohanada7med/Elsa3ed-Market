import React from 'react';
import { WAHButton } from './WAHButton';
import { PatternType } from './tokens';
import { renderIcon } from './renderIcon';

export interface WAHEmptyStateProps {
  icon?: React.ElementType | React.ReactNode;
  mascotSrc?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  pattern?: PatternType;
  className?: string;
}

export const WAHEmptyState: React.FC<WAHEmptyStateProps> = ({
  icon,
  mascotSrc,
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
      className={`relative min-h-[300px] sm:min-h-[360px] flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[2rem] border border-black/10 dark:border-white/10 bg-white/75 dark:bg-espresso-900/90 backdrop-blur-xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Authentic WAH Brand Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.045] mix-blend-multiply dark:mix-blend-screen"
        style={{
          backgroundImage: "url('/pattern/pat2.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '400px auto',
          backgroundPosition: 'center'
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-md mx-auto space-y-4">
        {mascotSrc ? (
          <div className="relative mx-auto w-fit select-none">
            <img
              src={mascotSrc}
              alt="عم وه"
              className="h-32 sm:h-40 w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.22)] mx-auto animate-bounce-subtle"
            />
            <div className="w-24 sm:w-28 h-2 rounded-[100%] bg-black/35 blur-xs mx-auto -mt-1" />
          </div>
        ) : renderedIcon ? (
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-primary/15 text-primary dark:text-primary-hover flex items-center justify-center border border-primary/30 shadow-xs">
            {renderedIcon}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <h3 className="text-lg sm:text-xl font-black font-serif text-espresso dark:text-cream">
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

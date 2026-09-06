import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { WAHPattern } from './WAHPattern';
import { PatternType } from './tokens';

export interface WAHCardProps extends HTMLMotionProps<'div'> {
  editorialShape?: boolean;
  pattern?: PatternType;
  patternOpacity?: number;
  hoverable?: boolean;
  children: React.ReactNode;
}

export const WAHCard: React.FC<WAHCardProps> = ({
  editorialShape = false,
  pattern,
  patternOpacity = 0.04,
  hoverable = true,
  children,
  className = '',
  ...props
}) => {
  const shapeClass = editorialShape
    ? 'rounded-tl-3xl rounded-br-3xl rounded-tr-xl rounded-bl-xl'
    : 'rounded-2xl';

  return (
    <motion.div
      whileHover={hoverable ? { y: -4, transition: { duration: 0.22, ease: 'easeOut' } } : undefined}
      className={`relative bg-white dark:bg-[var(--wah-surface,#1B1613)] border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] shadow-[0_2px_10px_-2px_rgba(36,30,26,0.04)] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.4)] ${
        hoverable ? 'hover:border-[var(--wah-border-hover,#CBBDB0)] dark:hover:border-[var(--wah-primary,#E0633C)] hover:shadow-[0_12px_28px_-6px_rgba(36,30,26,0.08)] dark:hover:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.6)]' : ''
      } transition-all duration-250 overflow-hidden ${shapeClass} ${className}`}
      {...props}
    >
      {pattern && (
        <WAHPattern
          type={pattern}
          opacity={patternOpacity}
          className="pointer-events-none"
        />
      )}
      <div className="relative z-10 w-full h-full flex flex-col">{children}</div>
    </motion.div>
  );
};

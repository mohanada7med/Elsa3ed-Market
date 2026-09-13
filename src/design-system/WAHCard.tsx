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
    ? 'rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-[1rem] rounded-bl-[1rem]'
    : 'rounded-[1.5rem]';

  return (
    <motion.div
      whileHover={hoverable ? { y: -4, transition: { duration: 0.22, ease: 'easeOut' } } : undefined}
      className={`relative bg-white/85 dark:bg-espresso/85 backdrop-blur-xl border border-primary/30 dark:border-primary/40 text-espresso dark:text-cream shadow-md ${
        hoverable ? 'hover:border-primary/60 dark:hover:border-primary/70 hover:shadow-xl' : ''
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

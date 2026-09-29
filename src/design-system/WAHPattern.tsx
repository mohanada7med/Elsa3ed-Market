import React from 'react';
import { PatternType } from './tokens';

export interface WAHPatternProps {
  type?: PatternType;
  className?: string;
  opacity?: number;
  strokeWidth?: number;
  color?: string;
  secondaryColor?: string;
  scale?: number;
  style?: React.CSSProperties;
}

/**
 * WAHPattern — Official WAH Brand Identity Pattern Engine
 * Powered by authentic brand assets:
 * - /pattern/pat1.svg (Nubian / Upper Egypt vector frieze ribbon)
 * - /pattern/pat2.png (Authentic heritage icons: pots, suns, arches, palms, flowers)
 * - /pattern/pat3.png (Authentic Upper Egyptian geometric striped tapestry)
 */
export const WAHPattern: React.FC<WAHPatternProps> = ({
  type = 'geometry',
  className = '',
  opacity = 0.05,
  scale = 1,
  style = {}
}) => {
  // 1. Geometric Stripes Tapestry
  if (type === 'stripes' || type === 'geometry') {
    const baseWidth = Math.round(460 * scale);
    return (
      <div
        className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
        style={{
          opacity,
          backgroundImage: "url('/pattern/pat3.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: `${baseWidth}px auto`,
          backgroundPosition: 'center',
          ...style
        }}
        aria-hidden="true"
      />
    );
  }

  // 2. Vector Frieze Ribbon / Architecture
  if (type === 'architecture') {
    return (
      <div
        className={`w-full overflow-hidden pointer-events-none select-none ${className}`}
        style={{ opacity, ...style }}
        aria-hidden="true"
      >
        <div
          className="w-full h-4 sm:h-5 bg-repeat-x bg-contain"
          style={{
            backgroundImage: "url('/pattern/pat1.svg')",
            backgroundSize: `${18 * scale}px 100%`,
            backgroundRepeat: 'repeat-x'
          }}
        />
      </div>
    );
  }

  // 3. Authentic Heritage Icons (pat2.png)
  const baseWidth = Math.round(500 * scale);
  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      style={{
        opacity,
        backgroundImage: "url('/pattern/pat2.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: `${baseWidth}px auto`,
        backgroundPosition: 'center top',
        ...style
      }}
      aria-hidden="true"
    />
  );
};

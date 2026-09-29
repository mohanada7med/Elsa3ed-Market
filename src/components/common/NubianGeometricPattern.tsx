import React from 'react';

export interface NubianGeometricPatternProps {
  opacity?: number;
  className?: string;
  color?: string;
  variant?: 'tapestry' | 'triangles' | 'frieze' | 'diamonds';
  scale?: number;
  style?: React.CSSProperties;
}

/**
 * NubianGeometricPattern — Authentic Upper Egypt / Nubian Pattern Component
 * Uses official brand patterns from /pattern
 */
export const NubianGeometricPattern: React.FC<NubianGeometricPatternProps> = ({
  opacity = 0.08,
  className = '',
  variant = 'tapestry',
  scale = 1,
  style = {}
}) => {
  // 1. Frieze Ribbon
  if (variant === 'frieze') {
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

  // 2. Tapestry / Triangles (pat3.png)
  if (variant === 'tapestry' || variant === 'triangles') {
    const baseWidth = Math.round(480 * scale);
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

  // 3. Diamonds / Heritage Icons (pat2.png)
  const baseWidth = Math.round(520 * scale);
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

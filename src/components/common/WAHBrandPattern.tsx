import React from 'react';

export type WAHPatternVariant =
  | 'geometric-stripes'
  | 'heritage-icons'
  | 'border-frieze'
  | 'corner-brackets'
  | 'nile-waves'
  | 'subtle-grid';

export interface WAHBrandPatternProps {
  variant?: WAHPatternVariant;
  opacity?: number;
  className?: string;
  color?: string;
  secondaryColor?: string;
  scale?: number;
  style?: React.CSSProperties;
}

/**
 * WAHBrandPattern — Official WAH Brand Identity Pattern Engine
 * Powered by authentic brand assets:
 * - pat1.svg: Authentic Nubian / Upper Egypt vector frieze ribbon
 * - pat2.png: Authentic WAH heritage icons (pots, sun, arches, palms, flowers)
 * - pat3.png: Authentic Upper Egyptian geometric striped tapestry
 */
export const WAHBrandPattern: React.FC<WAHBrandPatternProps> = ({
  variant = 'heritage-icons',
  opacity = 0.06,
  className = '',
  scale = 1,
  style = {}
}) => {
  // 1. Horizontal / Architectural Border Frieze
  if (variant === 'border-frieze') {
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

  // 2. Corner Bracket or Accent Pillar (using vertical pat1.svg)
  if (variant === 'corner-brackets') {
    return (
      <div
        className={`pointer-events-none select-none overflow-hidden ${className}`}
        style={{ opacity, ...style }}
        aria-hidden="true"
      >
        <img
          src="/pattern/pat1.svg"
          alt=""
          className="h-full w-auto object-contain"
          style={{ transform: `scale(${scale})` }}
        />
      </div>
    );
  }

  // 3. Geometric Stripes Tapestry (using authentic pat3.png)
  if (variant === 'geometric-stripes') {
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

  // 4. Default / Heritage Icons (using authentic transparent pat2.png)
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

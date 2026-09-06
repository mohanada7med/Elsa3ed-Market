import React, { useId } from 'react';

interface NubianGeometricPatternProps {
  /** Opacity of the pattern wrapper (default: 0.14 for clearly visible yet elegant heritage texture) */
  opacity?: number;
  /** Custom CSS classes for positioning and styling */
  className?: string;
  /** Base stroke/fill color (default: warm terracotta #B24C2B) */
  color?: string;
  /** Pattern variant: 'tapestry' | 'triangles' | 'frieze' | 'diamonds' */
  variant?: 'tapestry' | 'triangles' | 'frieze' | 'diamonds';
  /** Scale factor (default 1) */
  scale?: number;
}

export const NubianGeometricPattern: React.FC<NubianGeometricPatternProps> = ({
  opacity = 0.14,
  className = '',
  color = '#B24C2B',
  variant = 'tapestry',
  scale = 1
}) => {
  const patternId = useId().replace(/[^a-zA-Z0-9]/g, '');

  if (variant === 'frieze') {
    // Horizontal decorative Nubian geometric frieze band (as on traditional Nubian house parapets)
    return (
      <div
        className={`w-full overflow-hidden pointer-events-none select-none ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        <svg
          className="w-full h-8"
          preserveAspectRatio="repeat-x"
          viewBox="0 0 240 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern
            id={`nubian-frieze-${patternId}`}
            x="0"
            y="0"
            width={48 * scale}
            height={32 * scale}
            patternUnits="userSpaceOnUse"
          >
            {/* Nubian stepped pyramid chevron */}
            <polygon points="24,2 46,28 2,28" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
            <polygon points="24,8 40,26 8,26" fill={color} fillOpacity="0.45" stroke={color} strokeWidth="1" />
            <polygon points="24,14 34,24 14,24" fill={color} fillOpacity="0.75" />
            <circle cx="24" cy="20" r="2.5" fill="#FAF7F2" />
            
            {/* Corner stepped accents */}
            <polygon points="0,32 0,18 14,32" fill={color} fillOpacity="0.35" />
            <polygon points="48,32 48,18 34,32" fill={color} fillOpacity="0.35" />
            
            {/* Stepped teeth on bottom line */}
            <rect x="20" y="29" width="8" height="3" fill={color} />
            <rect x="0" y="29" width="6" height="3" fill={color} />
            <rect x="42" y="29" width="6" height="3" fill={color} />

            {/* Sun rays at apex */}
            <line x1="24" y1="2" x2="24" y2="0" stroke={color} strokeWidth="1.5" />
            <line x1="19" y1="3" x2="16" y2="0" stroke={color} strokeWidth="1.5" />
            <line x1="29" y1="3" x2="32" y2="0" stroke={color} strokeWidth="1.5" />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#nubian-frieze-${patternId})`} />
        </svg>
      </div>
    );
  }

  if (variant === 'triangles') {
    // Stepped Nubian pyramids & chevrons
    const size = 60 * scale;
    return (
      <div
        className={`absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id={`nubian-triangles-${patternId}`}
              width={size}
              height={size}
              patternUnits="userSpaceOnUse"
            >
              {/* Stepped ziggurat pyramid */}
              <path
                d="M 30,6 L 54,30 L 44,30 L 44,40 L 34,40 L 34,50 L 26,50 L 26,40 L 16,40 L 16,30 L 6,30 Z"
                fill={color}
                fillOpacity="0.25"
                stroke={color}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Inner chevron */}
              <polygon points="30,16 42,28 18,28" fill={color} fillOpacity="0.6" stroke={color} strokeWidth="1" />
              <circle cx="30" cy="22" r="2.5" fill="#FAF7F2" />

              {/* Corner accent points */}
              <circle cx="6" cy="6" r="2" fill={color} fillOpacity="0.7" />
              <circle cx="54" cy="6" r="2" fill={color} fillOpacity="0.7" />
              <circle cx="6" cy="54" r="2" fill={color} fillOpacity="0.7" />
              <circle cx="54" cy="54" r="2" fill={color} fillOpacity="0.7" />

              {/* Connecting baseline */}
              <line x1="0" y1="58" x2="60" y2="58" stroke={color} strokeWidth="1" strokeDasharray="3 3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#nubian-triangles-${patternId})`} />
        </svg>
      </div>
    );
  }

  if (variant === 'diamonds') {
    // Nubian interlocking rhombus & suns (المعينات النوبية وقرص الشمس)
    const size = 80 * scale;
    return (
      <div
        className={`absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id={`nubian-diamonds-${patternId}`}
              width={size}
              height={size}
              patternUnits="userSpaceOnUse"
            >
              {/* Main Diamond */}
              <polygon
                points="40,4 76,40 40,76 4,40"
                fill={color}
                fillOpacity="0.1"
                stroke={color}
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              {/* Inner Diamond */}
              <polygon
                points="40,16 64,40 40,64 16,40"
                fill={color}
                fillOpacity="0.25"
                stroke={color}
                strokeWidth="1.2"
              />
              {/* Innermost Diamond */}
              <polygon
                points="40,26 54,40 40,54 26,40"
                fill={color}
                fillOpacity="0.55"
              />
              {/* Center Sun Disc */}
              <circle cx="40" cy="40" r="4" fill="#FAF7F2" stroke={color} strokeWidth="1.5" />

              {/* Corner triangles that form diamonds at intersections */}
              <polygon points="0,0 18,0 0,18" fill={color} fillOpacity="0.35" stroke={color} strokeWidth="1" />
              <polygon points="80,0 62,0 80,18" fill={color} fillOpacity="0.35" stroke={color} strokeWidth="1" />
              <polygon points="0,80 18,80 0,62" fill={color} fillOpacity="0.35" stroke={color} strokeWidth="1" />
              <polygon points="80,80 62,80 80,62" fill={color} fillOpacity="0.35" stroke={color} strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#nubian-diamonds-${patternId})`} />
        </svg>
      </div>
    );
  }

  // Default 'tapestry' variant: Authentic Nubian architectural house facade geometry
  // Distinct, beautifully proportioned, visible Nubian geometry
  const size = 84 * scale;
  return (
    <div
      className={`absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id={`nubian-tapestry-${patternId}`}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            {/* Outer Diamond Framework */}
            <polygon
              points="42,4 80,42 42,80 4,42"
              fill={color}
              fillOpacity="0.08"
              stroke={color}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />

            {/* Concentric Inner Diamond */}
            <polygon
              points="42,14 70,42 42,70 14,42"
              fill={color}
              fillOpacity="0.18"
              stroke={color}
              strokeWidth="1"
              strokeDasharray="3 2"
            />

            {/* Nubian Stepped Chevron - Upper Pyramid */}
            <polygon
              points="42,18 60,36 24,36"
              fill={color}
              fillOpacity="0.45"
              stroke={color}
              strokeWidth="1.2"
            />
            {/* Top inner stepped tier */}
            <polygon
              points="42,24 52,34 32,34"
              fill={color}
              fillOpacity="0.75"
            />

            {/* Nubian Stepped Chevron - Lower Inverted Pyramid */}
            <polygon
              points="42,66 60,48 24,48"
              fill={color}
              fillOpacity="0.45"
              stroke={color}
              strokeWidth="1.2"
            />
            {/* Bottom inner stepped tier */}
            <polygon
              points="42,60 52,50 32,50"
              fill={color}
              fillOpacity="0.75"
            />

            {/* Central Sun Eye */}
            <circle cx="42" cy="42" r="3.5" fill="#FAF7F2" stroke={color} strokeWidth="1.5" />
            <circle cx="42" cy="42" r="6.5" fill="none" stroke={color} strokeWidth="1" strokeDasharray="1.5 1.5" />

            {/* Corner Connecting Nubian Triangles */}
            <polygon points="0,0 20,0 0,20" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
            <polygon points="84,0 64,0 84,20" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
            <polygon points="0,84 20,84 0,64" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />
            <polygon points="84,84 64,84 84,64" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1" />

            {/* Stepped corner lines (Nubian staircase motif) */}
            <path
              d="M 0,6 L 6,6 L 6,0 M 84,6 L 78,6 L 78,0 M 0,78 L 6,78 L 6,84 M 84,78 L 78,78 L 78,84"
              fill="none"
              stroke={color}
              strokeWidth="1.4"
            />

            {/* Nile Wave Zigzags between diamonds */}
            <path
              d="M 42,0 L 46,4 L 42,8 L 38,4 Z"
              fill={color}
              fillOpacity="0.5"
            />
            <path
              d="M 42,76 L 46,80 L 42,84 L 38,80 Z"
              fill={color}
              fillOpacity="0.5"
            />
            <path
              d="M 0,42 L 4,46 L 8,42 L 4,38 Z"
              fill={color}
              fillOpacity="0.5"
            />
            <path
              d="M 76,42 L 80,46 L 84,42 L 80,38 Z"
              fill={color}
              fillOpacity="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#nubian-tapestry-${patternId})`} />
      </svg>
    </div>
  );
};

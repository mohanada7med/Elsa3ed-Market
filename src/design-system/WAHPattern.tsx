import React from 'react';
import { PatternType } from './tokens';

interface WAHPatternProps {
  type?: PatternType;
  className?: string;
  opacity?: number;
  strokeWidth?: number;
  color?: string;
  secondaryColor?: string;
}

/**
 * WAHPattern — Official WAH Brand Identity Vector Pattern Engine
 * Direct digital translation of pages 5, 6, and 7 of the WAH Brand Identity PDF.
 */
export const WAHPattern: React.FC<WAHPatternProps> = ({
  type = 'geometry',
  className = '',
  opacity = 0.08,
  strokeWidth = 1,
  color = '#C99444',
  secondaryColor = '#6B3A1F'
}) => {
  const patternId = React.useId().replace(/[^a-zA-Z0-9]/g, '');

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        style={{ opacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 1. Page 6: WAH Geometric Stripes (Chevrons, Diamonds, Dotted tracks) */}
          {(type === 'geometry' || type === 'stripes') && (
            <pattern
              id={patternId}
              width="96"
              height="128"
              patternUnits="userSpaceOnUse"
            >
              {/* Vertical divider lines */}
              <line x1="0" y1="0" x2="0" y2="128" stroke={secondaryColor} strokeWidth={strokeWidth} strokeOpacity="0.35" />
              <line x1="28" y1="0" x2="28" y2="128" stroke={secondaryColor} strokeWidth={strokeWidth * 0.8} strokeOpacity="0.25" />
              <line x1="68" y1="0" x2="68" y2="128" stroke={secondaryColor} strokeWidth={strokeWidth * 0.8} strokeOpacity="0.25" />
              <line x1="96" y1="0" x2="96" y2="128" stroke={secondaryColor} strokeWidth={strokeWidth} strokeOpacity="0.35" />

              {/* Band 1: Chevron / Triangle chain (▲▼▲▼) */}
              {[0, 32, 64, 96].map((y) => (
                <g key={`chev-${y}`} transform={`translate(2, ${y})`}>
                  <polygon points="12,0 24,14 0,14" fill={color} fillOpacity="0.6" stroke={secondaryColor} strokeWidth={strokeWidth * 0.7} />
                  <polygon points="12,4 20,12 4,12" fill={secondaryColor} fillOpacity="0.75" />
                  <polygon points="0,16 24,16 12,30" fill={color} fillOpacity="0.45" stroke={secondaryColor} strokeWidth={strokeWidth * 0.7} />
                  <polygon points="4,18 20,18 12,27" fill={secondaryColor} fillOpacity="0.6" />
                </g>
              ))}

              {/* Band 2: Vertical dots track */}
              {[8, 24, 40, 56, 72, 88, 104, 120].map((dotY) => (
                <circle key={`dot-${dotY}`} cx="35" cy={dotY} r={1.5} fill={secondaryColor} fillOpacity="0.6" />
              ))}

              {/* Band 3: Diamond Column (◆ • ◆ • ◆) */}
              {[0, 32, 64, 96].map((dY) => (
                <g key={`diamond-${dY}`} transform={`translate(48, ${dY})`}>
                  <polygon points="0,6 8,14 0,22 -8,14" fill={color} fillOpacity="0.7" stroke={secondaryColor} strokeWidth={strokeWidth * 0.8} />
                  <polygon points="0,9 5,14 0,19 -5,14" fill={secondaryColor} fillOpacity="0.85" />
                  <circle cx="0" cy="27" r="1.6" fill={color} />
                </g>
              ))}

              {/* Band 4: Second vertical dots track */}
              {[8, 24, 40, 56, 72, 88, 104, 120].map((dotY) => (
                <circle key={`dot2-${dotY}`} cx="61" cy={dotY} r={1.5} fill={secondaryColor} fillOpacity="0.6" />
              ))}

              {/* Band 5: Second chevron sequence */}
              {[0, 32, 64, 96].map((y) => (
                <g key={`chev2-${y}`} transform={`translate(70, ${y})`}>
                  <polygon points="12,0 24,14 0,14" fill={secondaryColor} fillOpacity="0.5" stroke={color} strokeWidth={strokeWidth * 0.7} />
                  <polygon points="12,4 20,12 4,12" fill={color} fillOpacity="0.75" />
                  <polygon points="0,16 24,16 12,30" fill={secondaryColor} fillOpacity="0.4" stroke={color} strokeWidth={strokeWidth * 0.7} />
                  <polygon points="4,18 20,18 12,27" fill={color} fillOpacity="0.6" />
                </g>
              ))}
            </pattern>
          )}

          {/* 2. Page 7: WAH Heritage Cultural Motifs (Arches, Sun, Fronds, Clay Pots, Flowers) */}
          {type === 'heritage' && (
            <pattern
              id={patternId}
              width="120"
              height="180"
              patternUnits="userSpaceOnUse"
            >
              {/* Divider lines */}
              <line x1="28" y1="0" x2="28" y2="180" stroke={secondaryColor} strokeWidth={strokeWidth * 0.8} strokeOpacity="0.3" />
              <line x1="92" y1="0" x2="92" y2="180" stroke={secondaryColor} strokeWidth={strokeWidth * 0.8} strokeOpacity="0.3" />

              {/* Column A: Heritage Icons */}
              <g transform="translate(14, 0)">
                {/* Arch */}
                <path d="M-6,14 L-6,6 Q-6,0 0,-4 Q6,0 6,6 L6,14 Z" transform="translate(0, 12)" fill={secondaryColor} fillOpacity="0.75" stroke={color} strokeWidth={strokeWidth} />
                {/* Radiant Sun */}
                <circle cx="0" cy="50" r="4.5" fill={color} />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <line key={`s1-${deg}`} x1="0" y1="44" x2="0" y2="42" stroke={color} strokeWidth={strokeWidth * 1.2} transform={`rotate(${deg} 0 50)`} />
                ))}
                {/* Palm Frond */}
                <path d="M0,95 L0,78 M0,90 C3,88 6,86 6,82 M0,90 C-3,88 -6,86 -6,82 M0,84 C3,82 5,80 5,76 M0,84 C-3,82 -5,80 -5,76" stroke={secondaryColor} strokeWidth={strokeWidth * 1.1} strokeLinecap="round" />
                {/* Clay Pot */}
                <g transform="translate(0, 122)">
                  <ellipse cx="0" cy="-6" rx="4" ry="1.2" fill={color} />
                  <path d="M-3,-4 C-8,0 -6,7 -4,10 L4,10 C6,7 8,0 3,-4 Z" fill="#E66A2E" fillOpacity="0.8" stroke={secondaryColor} strokeWidth={strokeWidth} />
                  <path d="M-5,3 L-2,5 L0,3 L2,5 L5,3" stroke="#FFF9EE" strokeWidth={strokeWidth * 0.9} strokeLinecap="round" fill="none" />
                </g>
                {/* 4-petal flower */}
                <g transform="translate(0, 158)">
                  <ellipse cx="0" cy="-4" rx="2" ry="4" fill={color} />
                  <ellipse cx="0" cy="4" rx="2" ry="4" fill={color} />
                  <ellipse cx="-4" cy="0" rx="4" ry="2" fill={color} />
                  <ellipse cx="4" cy="0" rx="4" ry="2" fill={color} />
                  <circle cx="0" cy="0" r="1.5" fill={secondaryColor} />
                </g>
              </g>

              {/* Column B: Chevron & Diamond Pillar */}
              <g transform="translate(60, 0)">
                {[0, 45, 90, 135].map((y) => (
                  <g key={`p-${y}`} transform={`translate(0, ${y})`}>
                    <polygon points="0,4 7,14 0,24 -7,14" fill={color} fillOpacity="0.5" stroke={secondaryColor} strokeWidth={strokeWidth * 0.7} />
                    <polygon points="0,8 4,14 0,20 -4,14" fill={secondaryColor} fillOpacity="0.7" />
                    <circle cx="0" cy="30" r="1.5" fill={color} />
                    <polygon points="0,35 4,41 -4,41" fill={secondaryColor} fillOpacity="0.6" />
                  </g>
                ))}
              </g>

              {/* Column C: Repeated Heritage (offset) */}
              <g transform="translate(106, 0)">
                <circle cx="0" cy="18" r="4" fill={color} />
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <line key={`s2-${deg}`} x1="0" y1="13" x2="0" y2="11" stroke={color} strokeWidth={strokeWidth * 1.2} transform={`rotate(${deg} 0 18)`} />
                ))}
                <g transform="translate(0, 62)">
                  <path d="M-5,10 L-5,4 Q-5,0 0,-3 Q5,0 5,4 L5,10 Z" fill={secondaryColor} fillOpacity="0.7" stroke={color} strokeWidth={strokeWidth} />
                </g>
                <g transform="translate(0, 108)">
                  <ellipse cx="0" cy="-5" rx="3.5" ry="1" fill={color} />
                  <path d="M-2,-3 C-7,0 -5,6 -3,9 L3,9 C5,6 7,0 2,-3 Z" fill={secondaryColor} fillOpacity="0.75" stroke={color} strokeWidth={strokeWidth} />
                </g>
                <g transform="translate(0, 150)">
                  <ellipse cx="0" cy="-3.5" rx="1.8" ry="3.5" fill={color} />
                  <ellipse cx="0" cy="3.5" rx="1.8" ry="3.5" fill={color} />
                  <ellipse cx="-3.5" cy="0" rx="3.5" ry="1.8" fill={color} />
                  <ellipse cx="3.5" cy="0" rx="3.5" ry="1.8" fill={color} />
                  <circle cx="0" cy="0" r="1.2" fill={secondaryColor} />
                </g>
              </g>
            </pattern>
          )}

          {/* 3. Traditional Kilim Woven Grid */}
          {type === 'kilim' && (
            <pattern
              id={patternId}
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path d="M24 0 L48 24 L24 48 L0 24 Z" fill="none" stroke={color} strokeWidth={strokeWidth} />
              <path d="M24 8 L40 24 L24 40 L8 24 Z" fill="none" stroke={secondaryColor} strokeWidth={strokeWidth * 0.75} strokeDasharray="2,2" />
              <circle cx="24" cy="24" r="2" fill={color} />
              <path d="M0 0 L12 12 M36 36 L48 48 M48 0 L36 12 M12 36 L0 48" stroke={color} strokeWidth={strokeWidth * 0.5} />
            </pattern>
          )}

          {/* 4. Pottery Curvature Motif */}
          {type === 'pottery' && (
            <pattern
              id={patternId}
              width="56"
              height="56"
              patternUnits="userSpaceOnUse"
            >
              <path d="M14 10 Q28 6 42 10 Q46 24 38 38 Q28 44 18 38 Q10 24 14 10 Z" fill="none" stroke={color} strokeWidth={strokeWidth} />
              <path d="M20 18 Q28 15 36 18 M22 28 Q28 26 34 28" fill="none" stroke={secondaryColor} strokeWidth={strokeWidth * 0.65} />
              <path d="M0 28 Q14 28 28 56 M28 0 Q42 28 56 28" fill="none" stroke={color} strokeWidth={strokeWidth * 0.5} strokeDasharray="3,3" />
            </pattern>
          )}

          {/* 5. Nile Watercourse Ribbon */}
          {type === 'nile' && (
            <pattern
              id={patternId}
              width="80"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path d="M0 20 Q20 5 40 20 T80 20" fill="none" stroke={color} strokeWidth={strokeWidth} />
              <path d="M0 28 Q20 13 40 28 T80 28" fill="none" stroke={secondaryColor} strokeWidth={strokeWidth * 0.7} strokeDasharray="4,2" />
            </pattern>
          )}

          {/* 6. Palm Grove Fronds */}
          {type === 'palm' && (
            <pattern
              id={patternId}
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <line x1="20" y1="40" x2="20" y2="4" stroke={secondaryColor} strokeWidth={strokeWidth * 1.2} />
              <path d="M20 10 L8 2 M20 10 L32 2 M20 22 L6 14 M20 22 L34 14 M20 34 L8 26 M20 34 L32 26" stroke={color} strokeWidth={strokeWidth * 0.75} />
            </pattern>
          )}

          {/* 7. Architecture / Temple Columns */}
          {type === 'architecture' && (
            <pattern
              id={patternId}
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path d="M10 50 L10 24 A20 20 0 0 1 50 24 L50 50 Z" fill="none" stroke={color} strokeWidth={strokeWidth} />
              <path d="M18 50 L18 26 A12 12 0 0 1 42 26 L42 50" fill="none" stroke={secondaryColor} strokeWidth={strokeWidth * 0.65} />
              <line x1="0" y1="50" x2="60" y2="50" stroke={color} strokeWidth={strokeWidth * 0.8} />
              <line x1="6" y1="8" x2="54" y2="8" stroke={color} strokeWidth={strokeWidth * 0.8} />
            </pattern>
          )}
        </defs>

        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};

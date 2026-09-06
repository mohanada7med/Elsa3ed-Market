import React from 'react';
import { PatternType } from './tokens';

interface WAHPatternProps {
  type?: PatternType;
  className?: string;
  opacity?: number;
  strokeWidth?: number;
  color?: string;
}

export const WAHPattern: React.FC<WAHPatternProps> = ({
  type = 'geometry',
  className = '',
  opacity = 0.06,
  strokeWidth = 1,
  color = 'currentColor'
}) => {
  const patternId = React.useId();

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
          {type === 'kilim' && (
            <pattern
              id={patternId}
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              {/* Modern Kilim Diamond & Chevron Grid */}
              <path
                d="M24 0 L48 24 L24 48 L0 24 Z"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
              />
              <path
                d="M24 8 L40 24 L24 40 L8 24 Z"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth * 0.75}
                strokeDasharray="2,2"
              />
              <circle cx="24" cy="24" r="2" fill={color} />
              <path
                d="M0 0 L12 12 M36 36 L48 48 M48 0 L36 12 M12 36 L0 48"
                stroke={color}
                strokeWidth={strokeWidth * 0.5}
              />
            </pattern>
          )}

          {type === 'pottery' && (
            <pattern
              id={patternId}
              width="56"
              height="56"
              patternUnits="userSpaceOnUse"
            >
              {/* Stepped clay pot silhouette & soft curved rim motif */}
              <path
                d="M14 10 Q28 6 42 10 Q46 24 38 38 Q28 44 18 38 Q10 24 14 10 Z"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
              />
              <path
                d="M20 18 Q28 15 36 18 M22 28 Q28 26 34 28"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth * 0.65}
              />
              <path
                d="M0 28 Q14 28 28 56 M28 0 Q42 28 56 28"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth * 0.5}
                strokeDasharray="3,3"
              />
            </pattern>
          )}

          {type === 'nile' && (
            <pattern
              id={patternId}
              width="80"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              {/* Gentle flowing topographical river lines */}
              <path
                d="M0 10 Q20 0 40 10 T80 10"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
              />
              <path
                d="M0 22 Q20 12 40 22 T80 22"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth * 0.8}
              />
              <path
                d="M0 34 Q20 24 40 34 T80 34"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth * 0.6}
              />
            </pattern>
          )}

          {type === 'palm' && (
            <pattern
              id={patternId}
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              {/* Abstract palm frond ribbing & irrigation canal lines */}
              <line x1="20" y1="0" x2="20" y2="40" stroke={color} strokeWidth={strokeWidth} />
              <path
                d="M20 10 L8 2 M20 10 L32 2 M20 22 L6 14 M20 22 L34 14 M20 34 L8 26 M20 34 L32 26"
                stroke={color}
                strokeWidth={strokeWidth * 0.75}
              />
            </pattern>
          )}

          {type === 'architecture' && (
            <pattern
              id={patternId}
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              {/* Nubian arch & Upper Egyptian temple pylon geometry */}
              <path
                d="M10 50 L10 24 A20 20 0 0 1 50 24 L50 50 Z"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
              />
              <path
                d="M18 50 L18 26 A12 12 0 0 1 42 26 L42 50"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth * 0.65}
              />
              <line x1="0" y1="50" x2="60" y2="50" stroke={color} strokeWidth={strokeWidth * 0.8} />
              <line x1="6" y1="8" x2="54" y2="8" stroke={color} strokeWidth={strokeWidth * 0.8} />
            </pattern>
          )}

          {type === 'geometry' && (
            <pattern
              id={patternId}
              width="44"
              height="44"
              patternUnits="userSpaceOnUse"
            >
              {/* Modern Egyptian golden-ratio geometric intersections */}
              <rect x="2" y="2" width="40" height="40" fill="none" stroke={color} strokeWidth={strokeWidth * 0.75} />
              <path d="M2 2 L42 42 M42 2 L2 42" stroke={color} strokeWidth={strokeWidth * 0.5} strokeDasharray="3,3" />
              <circle cx="22" cy="22" r="8" fill="none" stroke={color} strokeWidth={strokeWidth * 0.75} />
              <circle cx="22" cy="22" r="2" fill={color} />
            </pattern>
          )}
        </defs>

        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};

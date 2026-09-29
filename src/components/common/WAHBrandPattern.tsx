import React, { useId } from 'react';

export type WAHPatternVariant =
  | 'geometric-stripes'  // Page 6 of WAH Brand Identity PDF: Chevrons, diamonds, dotted lines
  | 'heritage-icons'     // Page 7 of WAH Brand Identity PDF: Arches, sunbursts, palm fronds, clay pots, flowers
  | 'border-frieze'      // Architectural upper frieze band for headers and card top borders
  | 'corner-brackets'    // Page 8 of WAH Brand Identity PDF: Traditional Upper Egyptian decorative L-corners
  | 'nile-waves'         // Page 8 of WAH Brand Identity PDF: Flowing dune / river ribbons
  | 'subtle-grid';       // Minimalist textured background for modern cards

interface WAHBrandPatternProps {
  variant?: WAHPatternVariant;
  opacity?: number;
  className?: string;
  color?: string; // default primary accent: #C99444
  secondaryColor?: string; // default medium brown: #6B3A1F
  scale?: number;
}

/**
 * WAHBrandPattern — Official WAH Brand Identity Vector Pattern Engine
 * Directly derived from pages 6, 7, and 8 of the official WAH Brand Identity document.
 */
export const WAHBrandPattern: React.FC<WAHBrandPatternProps> = ({
  variant = 'geometric-stripes',
  opacity = 0.12,
  className = '',
  color = '#C99444',
  secondaryColor = '#6B3A1F',
  scale = 1,
}) => {
  const uniqueId = useId().replace(/[^a-zA-Z0-9]/g, '');

  // ---------------------------------------------------------------------------
  // 1. GEOMETRIC STRIPES (PDF Page 6)
  // Repeating vertical bands of nested chevrons (▲▼▲▼), solid diamonds (◆),
  // and dotted accent lines.
  // ---------------------------------------------------------------------------
  if (variant === 'geometric-stripes') {
    const width = 120 * scale;
    const height = 160 * scale;
    return (
      <div
        className={`absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern
              id={`wah-pattern-stripes-${uniqueId}`}
              width={width}
              height={height}
              patternUnits="userSpaceOnUse"
            >
              {/* Outer vertical divider lines */}
              <line x1="0" y1="0" x2="0" y2={height} stroke={secondaryColor} strokeWidth="1.2" strokeOpacity="0.4" />
              <line x1={width * 0.3} y1="0" x2={width * 0.3} y2={height} stroke={secondaryColor} strokeWidth="1" strokeOpacity="0.3" />
              <line x1={width * 0.7} y1="0" x2={width * 0.7} y2={height} stroke={secondaryColor} strokeWidth="1" strokeOpacity="0.3" />
              <line x1={width} y1="0" x2={width} y2={height} stroke={secondaryColor} strokeWidth="1.2" strokeOpacity="0.4" />

              {/* Band 1: Chevron / Triangle chain (▲▼▲▼) */}
              <g transform={`translate(${width * 0.05}, 0)`}>
                {/* 4 vertically repeating chevron units */}
                {[0, 40, 80, 120].map((yOffset) => (
                  <g key={`chev-${yOffset}`} transform={`translate(0, ${yOffset * scale})`}>
                    {/* Outer chevron */}
                    <polygon
                      points="12,0 24,18 0,18"
                      fill={color}
                      fillOpacity="0.55"
                      stroke={secondaryColor}
                      strokeWidth="0.8"
                    />
                    {/* Inner chevron */}
                    <polygon points="12,4 20,16 4,16" fill={secondaryColor} fillOpacity="0.7" />
                    {/* Inverted chevron below */}
                    <polygon
                      points="0,20 24,20 12,38"
                      fill={color}
                      fillOpacity="0.4"
                      stroke={secondaryColor}
                      strokeWidth="0.8"
                    />
                    <polygon points="4,22 20,22 12,34" fill={secondaryColor} fillOpacity="0.6" />
                  </g>
                ))}
              </g>

              {/* Band 2: Dotted vertical track */}
              <g transform={`translate(${width * 0.38}, 0)`}>
                {[10, 30, 50, 70, 90, 110, 130, 150].map((dotY) => (
                  <circle
                    key={`dot-${dotY}`}
                    cx="0"
                    cy={dotY * scale}
                    r={1.8 * scale}
                    fill={secondaryColor}
                    fillOpacity="0.6"
                  />
                ))}
              </g>

              {/* Band 3: Diamond Column (◆ • ◆ • ◆) */}
              <g transform={`translate(${width * 0.5}, 0)`}>
                {[0, 40, 80, 120].map((dY) => (
                  <g key={`diamond-${dY}`} transform={`translate(0, ${dY * scale})`}>
                    {/* Large Diamond */}
                    <polygon
                      points="0,8 10,18 0,28 -10,18"
                      fill={color}
                      fillOpacity="0.65"
                      stroke={secondaryColor}
                      strokeWidth="1"
                    />
                    {/* Inner Diamond */}
                    <polygon points="0,12 6,18 0,24 -6,18" fill={secondaryColor} fillOpacity="0.75" />
                    {/* Interstitial dot */}
                    <circle cx="0" cy="34" r="2" fill={color} fillOpacity="0.8" />
                  </g>
                ))}
              </g>

              {/* Band 4: Second Dotted track */}
              <g transform={`translate(${width * 0.62}, 0)`}>
                {[10, 30, 50, 70, 90, 110, 130, 150].map((dotY) => (
                  <circle
                    key={`dot2-${dotY}`}
                    cx="0"
                    cy={dotY * scale}
                    r={1.8 * scale}
                    fill={secondaryColor}
                    fillOpacity="0.6"
                  />
                ))}
              </g>

              {/* Band 5: Second chevron sequence with inverted accent */}
              <g transform={`translate(${width * 0.75}, 0)`}>
                {[0, 40, 80, 120].map((yOffset) => (
                  <g key={`chev2-${yOffset}`} transform={`translate(0, ${yOffset * scale})`}>
                    <polygon
                      points="12,0 24,18 0,18"
                      fill={secondaryColor}
                      fillOpacity="0.5"
                      stroke={color}
                      strokeWidth="0.8"
                    />
                    <polygon points="12,5 19,16 5,16" fill={color} fillOpacity="0.7" />
                    <polygon
                      points="0,20 24,20 12,38"
                      fill={secondaryColor}
                      fillOpacity="0.4"
                      stroke={color}
                      strokeWidth="0.8"
                    />
                    <polygon points="5,22 19,22 12,33" fill={color} fillOpacity="0.6" />
                  </g>
                ))}
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#wah-pattern-stripes-${uniqueId})`} />
        </svg>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. HERITAGE ICONS PATTERN (PDF Page 7)
  // Repeating Upper Egyptian cultural icons:
  // Traditional Archway, Radiant Sun, Palm Frond, Clay Water Pot (Qullah/Ballas),
  // 4-petal flower, alternating with diamond & chevron columns.
  // ---------------------------------------------------------------------------
  if (variant === 'heritage-icons') {
    const width = 160 * scale;
    const height = 240 * scale;
    return (
      <div
        className={`absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern
              id={`wah-pattern-heritage-${uniqueId}`}
              width={width}
              height={height}
              patternUnits="userSpaceOnUse"
            >
              {/* Divider columns */}
              <line x1={width * 0.35} y1="0" x2={width * 0.35} y2={height} stroke={secondaryColor} strokeWidth="1" strokeOpacity="0.3" />
              <line x1={width * 0.65} y1="0" x2={width * 0.65} y2={height} stroke={secondaryColor} strokeWidth="1" strokeOpacity="0.3" />

              {/* Column A: Heritage Icons */}
              <g transform={`translate(${width * 0.18}, 0)`}>
                {/* 1. Nubian / Upper Egyptian Arch (Page 7 top) */}
                <g transform="translate(0, 16)">
                  <path
                    d="M-10,18 L-10,8 Q-10,0 0,-6 Q10,0 10,8 L10,18 Z"
                    fill={secondaryColor}
                    fillOpacity="0.8"
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  <path
                    d="M-6,18 L-6,9 Q-6,3 0,-1 Q6,3 6,9 L6,18 Z"
                    fill={color}
                    fillOpacity="0.45"
                  />
                </g>

                {/* 2. Radiant Sun (12 rays) */}
                <g transform="translate(0, 68)">
                  <circle cx="0" cy="0" r="6" fill={color} fillOpacity="0.9" />
                  {/* Sun rays */}
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                    <line
                      key={`ray-${deg}`}
                      x1="0"
                      y1="-8"
                      x2="0"
                      y2="-12"
                      stroke={color}
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      transform={`rotate(${deg})`}
                    />
                  ))}
                </g>

                {/* 3. Palm Frond (جريد النخل) */}
                <g transform="translate(0, 118)">
                  <path d="M0,14 L0,-12" stroke={secondaryColor} strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M0,6 C4,4 10,2 10,-4" stroke={secondaryColor} strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  <path d="M0,6 C-4,4 -10,2 -10,-4" stroke={secondaryColor} strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  <path d="M0,-2 C4,-4 9,-7 8,-12" stroke={secondaryColor} strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  <path d="M0,-2 C-4,-4 -9,-7 -8,-12" stroke={secondaryColor} strokeWidth="1.2" strokeLinecap="round" fill="none" />
                </g>

                {/* 4. Clay Pot / Qullah with geometric collar */}
                <g transform="translate(0, 168)">
                  {/* Pot rim */}
                  <ellipse cx="0" cy="-10" rx="6" ry="1.5" fill={color} />
                  {/* Pot neck */}
                  <path d="M-5,-10 L-4,-6 L4,-6 L5,-10 Z" fill={color} />
                  {/* Pot belly */}
                  <path
                    d="M-4,-6 C-12,0 -10,10 -6,14 L6,14 C10,10 12,0 4,-6 Z"
                    fill="#E66A2E"
                    fillOpacity="0.75"
                    stroke={secondaryColor}
                    strokeWidth="1"
                  />
                  {/* Chevron collar */}
                  <path
                    d="M-7,2 L-4,5 L-1,2 L2,5 L5,2 L7,5"
                    stroke={color}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>

                {/* 5. Four-Petal Flower */}
                <g transform="translate(0, 214)">
                  <ellipse cx="0" cy="-6" rx="2.5" ry="5" fill={color} fillOpacity="0.8" />
                  <ellipse cx="0" cy="6" rx="2.5" ry="5" fill={color} fillOpacity="0.8" />
                  <ellipse cx="-6" cy="0" rx="5" ry="2.5" fill={color} fillOpacity="0.8" />
                  <ellipse cx="6" cy="0" rx="5" ry="2.5" fill={color} fillOpacity="0.8" />
                  <circle cx="0" cy="0" r="2" fill={secondaryColor} />
                </g>
              </g>

              {/* Column B: Chevron & Diamond Pillar */}
              <g transform={`translate(${width * 0.5}, 0)`}>
                {[0, 60, 120, 180].map((blkY) => (
                  <g key={`pillar-${blkY}`} transform={`translate(0, ${blkY * scale})`}>
                    <polygon
                      points="0,6 10,20 0,34 -10,20"
                      fill={color}
                      fillOpacity="0.5"
                      stroke={secondaryColor}
                      strokeWidth="1"
                    />
                    <polygon points="0,11 6,20 0,29 -6,20" fill={secondaryColor} fillOpacity="0.7" />
                    <circle cx="0" cy="42" r="2" fill={color} />
                    <polygon points="0,48 5,56 -5,56" fill={color} fillOpacity="0.8" />
                  </g>
                ))}
              </g>

              {/* Column C: Repeated Heritage Sequence (offset) */}
              <g transform={`translate(${width * 0.82}, 0)`}>
                {/* Sunburst at top */}
                <g transform="translate(0, 20)">
                  <circle cx="0" cy="0" r="5" fill={color} fillOpacity="0.9" />
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                    <line
                      key={`ray2-${deg}`}
                      x1="0"
                      y1="-7"
                      x2="0"
                      y2="-10"
                      stroke={color}
                      strokeWidth="1.2"
                      transform={`rotate(${deg})`}
                    />
                  ))}
                </g>
                {/* Clay Pot in middle */}
                <g transform="translate(0, 80)">
                  <ellipse cx="0" cy="-8" rx="5" ry="1.5" fill={color} />
                  <path
                    d="M-3,-5 C-10,0 -8,8 -5,12 L5,12 C8,8 10,0 3,-5 Z"
                    fill={secondaryColor}
                    fillOpacity="0.75"
                    stroke={color}
                    strokeWidth="1"
                  />
                  <line x1="-5" y1="2" x2="5" y2="2" stroke={color} strokeWidth="1" />
                </g>
                {/* Palm frond */}
                <g transform="translate(0, 140)">
                  <path d="M0,12 L0,-10" stroke={secondaryColor} strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M0,4 C4,2 8,0 8,-5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  <path d="M0,4 C-4,2 -8,0 -8,-5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
                </g>
                {/* Traditional arch at bottom */}
                <g transform="translate(0, 200)">
                  <path
                    d="M-8,14 L-8,6 Q-8,0 0,-4 Q8,0 8,6 L8,14 Z"
                    fill={secondaryColor}
                    fillOpacity="0.7"
                    stroke={color}
                    strokeWidth="1"
                  />
                </g>
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#wah-pattern-heritage-${uniqueId})`} />
        </svg>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. BORDER FRIEZE (Horizontal decorative band for section dividers)
  // ---------------------------------------------------------------------------
  if (variant === 'border-frieze') {
    return (
      <div
        className={`w-full overflow-hidden pointer-events-none select-none ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        <svg
          className="w-full h-5 sm:h-7"
          preserveAspectRatio="repeat-x"
          viewBox="0 0 240 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern
            id={`wah-frieze-${uniqueId}`}
            x="0"
            y="0"
            width={40 * scale}
            height={28 * scale}
            patternUnits="userSpaceOnUse"
          >
            {/* Upper line */}
            <line x1="0" y1="2" x2="40" y2="2" stroke={color} strokeWidth="1.2" />
            {/* Stepped chevron */}
            <polygon points="20,4 38,22 2,22" fill={color} fillOpacity="0.3" stroke={secondaryColor} strokeWidth="1" />
            <polygon points="20,9 32,20 8,20" fill={secondaryColor} fillOpacity="0.65" />
            {/* Center diamond */}
            <polygon points="20,13 24,17 20,21 16,17" fill="#FFF9EE" />
            {/* Bottom tooth line */}
            <line x1="0" y1="26" x2="40" y2="26" stroke={secondaryColor} strokeWidth="1.2" />
            <rect x="18" y="24" width="4" height="3" fill={color} />
            <rect x="0" y="24" width="3" height="3" fill={color} />
            <rect x="37" y="24" width="3" height="3" fill={color} />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#wah-frieze-${uniqueId})`} />
        </svg>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 4. CORNER BRACKETS (PDF Page 8: Traditional L-Frames)
  // ---------------------------------------------------------------------------
  if (variant === 'corner-brackets') {
    return (
      <div className={`absolute inset-0 pointer-events-none ${className}`} style={{ opacity }} aria-hidden="true">
        {/* Top-Right Corner */}
        <div className="absolute top-2 right-2 w-10 h-10">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <path d="M4,36 L4,10 Q4,4 10,4 L36,4" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <polygon points="12,12 18,12 18,18 12,18" fill={secondaryColor} />
            <polygon points="6,24 14,24 10,18" fill={color} />
            <polygon points="24,6 24,14 18,10" fill={color} />
          </svg>
        </div>

        {/* Top-Left Corner */}
        <div className="absolute top-2 left-2 w-10 h-10 -scale-x-100">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <path d="M4,36 L4,10 Q4,4 10,4 L36,4" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <polygon points="12,12 18,12 18,18 12,18" fill={secondaryColor} />
            <polygon points="6,24 14,24 10,18" fill={color} />
            <polygon points="24,6 24,14 18,10" fill={color} />
          </svg>
        </div>

        {/* Bottom-Right Corner */}
        <div className="absolute bottom-2 right-2 w-10 h-10 -scale-y-100">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <path d="M4,36 L4,10 Q4,4 10,4 L36,4" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <polygon points="12,12 18,12 18,18 12,18" fill={secondaryColor} />
            <polygon points="6,24 14,24 10,18" fill={color} />
            <polygon points="24,6 24,14 18,10" fill={color} />
          </svg>
        </div>

        {/* Bottom-Left Corner */}
        <div className="absolute bottom-2 left-2 w-10 h-10 -scale-100">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <path d="M4,36 L4,10 Q4,4 10,4 L36,4" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <polygon points="12,12 18,12 18,18 12,18" fill={secondaryColor} />
            <polygon points="6,24 14,24 10,18" fill={color} />
            <polygon points="24,6 24,14 18,10" fill={color} />
          </svg>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 5. NILE WAVES (PDF Page 8: Dunes & River Ribbon Flow)
  // ---------------------------------------------------------------------------
  if (variant === 'nile-waves') {
    return (
      <div className={`w-full overflow-hidden pointer-events-none select-none ${className}`} style={{ opacity }} aria-hidden="true">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 sm:h-16" fill="none">
          <path
            d="M0,60 C200,10 400,110 600,60 C800,10 1000,110 1200,60 L1200,120 L0,120 Z"
            fill={color}
            fillOpacity="0.18"
          />
          <path
            d="M0,75 C220,30 380,115 600,75 C820,35 980,115 1200,75 L1200,120 L0,120 Z"
            fill={secondaryColor}
            fillOpacity="0.25"
          />
          <path
            d="M0,90 C250,55 350,110 600,90 C850,70 950,115 1200,90"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 6. DEFAULT: Subtle Card Grid
  // ---------------------------------------------------------------------------
  return (
    <div className={`absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden ${className}`} style={{ opacity }} aria-hidden="true">
      <svg className="w-full h-full" width="100%" height="100%">
        <defs>
          <pattern id={`wah-subtle-${uniqueId}`} width={32 * scale} height={32 * scale} patternUnits="userSpaceOnUse">
            <path d="M 0 16 L 32 16 M 16 0 L 16 32" stroke={color} strokeWidth="0.6" strokeOpacity="0.25" />
            <circle cx="16" cy="16" r="1.2" fill={secondaryColor} fillOpacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#wah-subtle-${uniqueId})`} />
      </svg>
    </div>
  );
};

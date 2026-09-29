import React from 'react';

interface ElementProps {
  className?: string;
  size?: number;
  color?: string;
  secondaryColor?: string;
}

/**
 * WAHBrandElements — Official WAH Brand Identity Visual Elements & Graphic Motifs
 * Faithfully constructed from Page 8 ("ICONS & ELEMENTS") of the WAH Brand Identity PDF.
 */

// 1. Traditional Upper Egyptian Arch / Mihrab Window
export const WAHArchIcon: React.FC<ElementProps> = ({
  className = '',
  size = 28,
  color = '#C99444',
  secondaryColor = '#3B1E0E',
}) => (
  <svg
    width={size}
    height={size * 1.3}
    viewBox="0 0 36 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Outer Wall Arch */}
    <path
      d="M2 46V20C2 8 18 2 18 2C18 2 34 8 34 20V46H2Z"
      fill={secondaryColor}
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Stepped Inner Frame */}
    <path
      d="M7 46V22C7 13 18 8 18 8C18 8 29 13 29 22V46H7Z"
      fill={color}
      fillOpacity="0.3"
      stroke={color}
      strokeWidth="1.2"
    />
    {/* Arch Crown Finial */}
    <circle cx="18" cy="8" r="2.5" fill={color} />
  </svg>
);

// 2. Upper Egyptian Radiant Sunburst (12 triangular/tapered rays)
export const WAHSunIcon: React.FC<ElementProps> = ({
  className = '',
  size = 32,
  color = '#C99444',
  secondaryColor = '#E66A2E',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Sun Core */}
    <circle cx="24" cy="24" r="9" fill={color} stroke={secondaryColor} strokeWidth="1.5" />
    <circle cx="24" cy="24" r="5" fill={secondaryColor} fillOpacity="0.4" />
    {/* 12 Radiant Rays */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
      <polygon
        key={`sun-ray-${deg}`}
        points="24,3 26.5,12 21.5,12"
        fill={color}
        transform={`rotate(${deg} 24 24)`}
      />
    ))}
  </svg>
);

// 3. Palm Frond / Date Palm Leaf (جريد النخل)
export const WAHPalmFrondIcon: React.FC<ElementProps> = ({
  className = '',
  size = 28,
  color = '#6B3A1F',
  secondaryColor = '#C99444',
}) => (
  <svg
    width={size}
    height={size * 1.2}
    viewBox="0 0 36 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Central Spine */}
    <path d="M18 42V4" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    {/* Leaflets */}
    <path d="M18 34C26 31 32 28 34 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M18 34C10 31 4 28 2 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M18 24C26 21 32 17 33 11" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M18 24C10 21 4 17 3 11" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M18 14C24 11 29 8 30 2" stroke={secondaryColor} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M18 14C12 11 7 8 6 2" stroke={secondaryColor} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// 4. Traditional Clay Pot / Qullah / Ballas (القلة / البلاص الصعيدي)
export const WAHPotIcon: React.FC<ElementProps> = ({
  className = '',
  size = 28,
  color = '#E66A2E',
  secondaryColor = '#6B3A1F',
}) => (
  <svg
    width={size}
    height={size * 1.25}
    viewBox="0 0 36 45"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Pot Rim */}
    <ellipse cx="18" cy="6" rx="9" ry="2.5" fill="#C99444" stroke={secondaryColor} strokeWidth="1.2" />
    {/* Neck */}
    <path d="M11 6L13 14H23L25 6Z" fill="#C99444" fillOpacity="0.8" />
    {/* Rounded Vessel Belly */}
    <path
      d="M13 14C6 18 3 28 8 36C11 40 15 42 18 42C21 42 25 40 28 36C33 28 30 18 23 14H13Z"
      fill={color}
      stroke={secondaryColor}
      strokeWidth="1.8"
    />
    {/* Traditional chevron engraving on belly */}
    <path
      d="M7 26L11 30L15 26L18 29L21 26L25 30L29 26"
      stroke="#FFF9EE"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 22L12 25L15 22L18 25L21 22L24 25L28 22"
      stroke="#3B1E0E"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 5. Four-Petal Heritage Flower (زهرة الجنوب الهندسية)
export const WAHFlowerIcon: React.FC<ElementProps> = ({
  className = '',
  size = 24,
  color = '#C99444',
  secondaryColor = '#3B1E0E',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* 4 Petals */}
    <ellipse cx="16" cy="6" rx="4" ry="6" fill={color} />
    <ellipse cx="16" cy="26" rx="4" ry="6" fill={color} />
    <ellipse cx="6" cy="16" rx="6" ry="4" fill={color} />
    <ellipse cx="26" cy="16" rx="6" ry="4" fill={color} />
    {/* Center Core Diamond */}
    <polygon points="16,11 21,16 16,21 11,16" fill={secondaryColor} />
    <circle cx="16" cy="16" r="2" fill="#FFF9EE" />
  </svg>
);

// 6. Upper Egyptian Thoroughbred Running Horse (Page 8)
export const WAHHorseIcon: React.FC<ElementProps> = ({
  className = '',
  size = 48,
  color = '#6B3A1F',
  secondaryColor = '#C99444',
}) => (
  <svg
    width={size * 1.5}
    height={size}
    viewBox="0 0 120 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Dynamic Running Upper Egyptian Arabian Horse Body Silhouette */}
    <path
      d="M18 38C22 30 32 20 44 18C47 13 54 8 62 10C64 12 66 16 64 20C70 19 80 22 86 28C92 34 94 40 98 44C104 46 112 44 116 48C108 52 100 50 96 54C94 58 92 68 88 74L84 72C86 66 88 58 84 54C80 50 72 48 66 50C60 52 56 60 52 70L48 68C52 58 56 50 50 48C46 47 40 50 36 58L32 56C36 48 40 44 38 42C34 40 26 44 22 54L18 52C22 42 20 40 18 38Z"
      fill={color}
    />
    {/* Flowing Mane */}
    <path
      d="M44 18C50 14 56 12 62 10C60 14 58 18 54 22C52 18 48 16 44 18Z"
      fill={secondaryColor}
    />
    {/* Geometric Blanket Accents (Page 8 motif) */}
    <polygon points="62,30 68,36 62,42 56,36" fill={secondaryColor} />
    <polygon points="74,32 78,36 74,40 70,36" fill="#FFF9EE" />
    <circle cx="62" cy="36" r="1.5" fill="#3B1E0E" />
    {/* Flowing Tail */}
    <path
      d="M20 40C14 42 8 48 4 56C8 52 14 48 22 46C20 44 20 42 20 40Z"
      fill={secondaryColor}
    />
  </svg>
);

// 7. Palm Tree & Sun Oasis Vignette (Page 8)
export const WAHOasisIcon: React.FC<ElementProps> = ({
  className = '',
  size = 40,
  color = '#6B3A1F',
  secondaryColor = '#C99444',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 54 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Background Sun */}
    <circle cx="16" cy="18" r="8" fill={secondaryColor} fillOpacity="0.4" />
    {/* Palm Tree Trunk */}
    <path d="M34 50C34 38 36 28 40 20" stroke={color} strokeWidth="3" strokeLinecap="round" />
    {/* Palm Tree Canopy */}
    <path d="M40 20C32 14 24 16 20 22" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M40 20C36 10 32 6 28 6" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M40 20C42 10 46 6 50 6" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M40 20C46 14 50 16 54 22" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Ground Dune Curves */}
    <path d="M2 50C16 46 32 46 52 50" stroke={secondaryColor} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

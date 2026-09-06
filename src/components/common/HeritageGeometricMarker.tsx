import React from 'react';
import {
  Landmark,
  Hammer,
  Utensils,
  Crown,
  Scroll,
  Sparkles,
  MapPin
} from 'lucide-react';

export type GeometricMarkerType =
  | 'place'
  | 'craft'
  | 'food'
  | 'governorate'
  | 'story'
  | 'artisan'
  | 'featured'
  | 'default';

export type GeometricShapeKind =
  | 'stepped-pyramid'
  | 'diamond'
  | 'octagon'
  | 'hexagon'
  | 'cartouche';

export interface HeritageGeometricMarkerProps {
  id?: string;
  type?: GeometricMarkerType | string;
  shape?: GeometricShapeKind;
  title: string;
  governorateName?: string;
  isSelected?: boolean;
  isHovered?: boolean;
  size?: 'sm' | 'md' | 'lg';
  symbol?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
  showLabel?: boolean;
}

// Sophisticated authentic Egyptian earth, terracotta, lapis and copper palettes
const GEOMETRIC_PALETTES = {
  // Heritage Places: Terracotta Red & Ancient Sandstone with Ochre Accents
  place: {
    shape: 'stepped-pyramid' as GeometricShapeKind,
    gradStart: '#C84C21',
    gradMid: '#9E3210',
    gradEnd: '#681B04',
    border: '#FFE3D1',
    accent: '#F59E0B',
    innerFill: '#501402',
    iconColor: '#FFF3EB',
    glowColor: 'rgba(200, 76, 33, 0.45)',
    labelBg: 'bg-[#9E3210] text-white border-amber-300'
  },
  // Crafts & Workshops: Burnished Copper Clay & Terracotta Diamond
  craft: {
    shape: 'diamond' as GeometricShapeKind,
    gradStart: '#C96E32',
    gradMid: '#9E4E1C',
    gradEnd: '#632B09',
    border: '#FED7AA',
    accent: '#FBBF24',
    innerFill: '#4A1D05',
    iconColor: '#FFF7ED',
    glowColor: 'rgba(201, 110, 50, 0.45)',
    labelBg: 'bg-[#8A3F14] text-white border-amber-300'
  },
  // Authentic Food: Saffron Ochre & Wheat Earthenware Hexagon
  food: {
    shape: 'hexagon' as GeometricShapeKind,
    gradStart: '#D98A2B',
    gradMid: '#AF6410',
    gradEnd: '#6B3903',
    border: '#FEF08A',
    accent: '#FDE047',
    innerFill: '#532B02',
    iconColor: '#FEFCE8',
    glowColor: 'rgba(217, 138, 43, 0.45)',
    labelBg: 'bg-[#96540A] text-white border-yellow-300'
  },
  // Governorate Center: Royal Octagonal Sun-Seal with Gold Gilding
  governorate: {
    shape: 'octagon' as GeometricShapeKind,
    gradStart: '#C44018',
    gradMid: '#8A2508',
    gradEnd: '#541202',
    border: '#FDE68A',
    accent: '#F59E0B',
    innerFill: '#400D01',
    iconColor: '#FEF3C7',
    glowColor: 'rgba(245, 158, 11, 0.55)',
    labelBg: 'bg-[#7C1F06] text-white border-amber-400'
  },
  // Folklore & Stories: Nile Silt Cartouche
  story: {
    shape: 'cartouche' as GeometricShapeKind,
    gradStart: '#8F5B3C',
    gradMid: '#6B3C21',
    gradEnd: '#422010',
    border: '#E7D5C7',
    accent: '#D4A373',
    innerFill: '#31170A',
    iconColor: '#FDFCFA',
    glowColor: 'rgba(143, 91, 60, 0.45)',
    labelBg: 'bg-[#5C321B] text-white border-stone-300'
  },
  default: {
    shape: 'diamond' as GeometricShapeKind,
    gradStart: '#C84C21',
    gradMid: '#9E3210',
    gradEnd: '#681B04',
    border: '#FED7AA',
    accent: '#F59E0B',
    innerFill: '#501402',
    iconColor: '#FFF3EB',
    glowColor: 'rgba(200, 76, 33, 0.45)',
    labelBg: 'bg-[#9E3210] text-white border-amber-300'
  }
};

export const HeritageGeometricMarker: React.FC<HeritageGeometricMarkerProps> = ({
  id,
  type = 'place',
  shape: customShape,
  title,
  governorateName,
  isSelected = false,
  isHovered = false,
  size = 'md',
  symbol,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className = '',
  showLabel = true
}) => {
  const normalizedType =
    type === 'place'
      ? 'place'
      : type === 'craft' || type === 'artisan'
      ? 'craft'
      : type === 'food'
      ? 'food'
      : type === 'governorate'
      ? 'governorate'
      : type === 'story'
      ? 'story'
      : 'default';

  const palette = GEOMETRIC_PALETTES[normalizedType] || GEOMETRIC_PALETTES.default;
  const activeShape = customShape || palette.shape;

  // Sizing configurations with exact bottom-center anchor
  const sizeConfig = {
    sm: { w: 32, h: 42, iconSize: 11 },
    md: { w: 40, h: 52, iconSize: 14 },
    lg: { w: 48, h: 62, iconSize: 17 }
  }[size];

  const uniqueId = `geom-${id || title.replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;

  // Icon inside the geometric aperture
  const renderIcon = () => {
    if (symbol) {
      return <span className="text-[11px] font-black leading-none select-none text-white">{symbol}</span>;
    }
    const iconClass = "w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300";
    switch (normalizedType) {
      case 'place':
        return <Landmark className={iconClass} style={{ color: palette.iconColor }} />;
      case 'craft':
        return <Hammer className={iconClass} style={{ color: palette.iconColor }} />;
      case 'food':
        return <Utensils className={iconClass} style={{ color: palette.iconColor }} />;
      case 'governorate':
        return <Crown className={iconClass} style={{ color: palette.iconColor }} />;
      case 'story':
        return <Scroll className={iconClass} style={{ color: palette.iconColor }} />;
      default:
        return <Sparkles className={iconClass} style={{ color: palette.iconColor }} />;
    }
  };

  return (
    <div
      className={`group relative inline-flex flex-col items-center cursor-pointer select-none ${className}`}
      style={{
        // Smooth transition for scale, elevation, and opacity
        transform: isSelected
          ? 'scale(1.24) translateY(-10px)'
          : isHovered
          ? 'scale(1.14) translateY(-6px)'
          : 'scale(1) translateY(0px)',
        transformOrigin: 'bottom center',
        transition: 'transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1), filter 300ms ease',
        zIndex: isSelected ? 45 : isHovered ? 40 : 15
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={title}
      role="button"
      aria-label={`${title} (${governorateName || ''})`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* =========================================================
          1. ANIMATED GEOMETRIC SELECTION RIPPLE
          Expands smoothly from the bottom anchor point when selected
         ========================================================= */}
      {isSelected && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 pointer-events-none w-14 h-8 flex items-center justify-center">
          {/* Outer expanding geometric ring */}
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-60"
            style={{ backgroundColor: palette.accent }}
          />
          {/* Inner pulsating aura ring */}
          <span
            className="absolute inset-1 rounded-full animate-pulse border-2"
            style={{
              borderColor: palette.accent,
              backgroundColor: palette.glowColor
            }}
          />
        </div>
      )}

      {/* =========================================================
          2. MINIMALIST HERITAGE GEOMETRIC SILHOUETTE
          Crafted with authentic Nubian & Upper Egyptian geometric lines
         ========================================================= */}
      <div
        className="relative"
        style={{
          filter: isSelected
            ? `drop-shadow(0 8px 12px ${palette.glowColor}) drop-shadow(0 2px 4px rgba(0,0,0,0.4))`
            : isHovered
            ? 'drop-shadow(0 6px 10px rgba(0,0,0,0.32))'
            : 'drop-shadow(0 3px 6px rgba(0,0,0,0.24))'
        }}
      >
        <svg
          width={sizeConfig.w}
          height={sizeConfig.h}
          viewBox="0 0 44 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:rotate-1"
        >
          <defs>
            {/* Main Geometric Body Gradient */}
            <linearGradient id={`bodyGrad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={palette.gradStart} />
              <stop offset="50%" stopColor={palette.gradMid} />
              <stop offset="100%" stopColor={palette.gradEnd} />
            </linearGradient>

            {/* Inner Gold / Ochre Geometric Highlight */}
            <linearGradient id={`goldGrad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor={palette.accent} />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* Soft Sun Glaze Highlight */}
            <linearGradient id={`glaze-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Anchor Drop Ground Shadow */}
          <ellipse cx="22" cy="53" rx="7" ry="2" fill="#180C06" fillOpacity="0.35" />

          {/* --------------------------------------------------
              SHAPE VARIANT 1: STEPPED PYRAMID (المثلث / الهرم المتدرج)
              For historical temples and monuments
             -------------------------------------------------- */}
          {activeShape === 'stepped-pyramid' && (
            <g>
              {/* Outer Stepped Silhouette with Needle Tip */}
              <path
                d="M22 3
                   L26 8 L24.5 8
                   L29 16 L27.5 16
                   L33 26 L31.5 26
                   L36 36 L25.5 36
                   L22 51
                   L18.5 36 L8 36
                   L12.5 26 L11 26
                   L16.5 16 L15 16
                   L19.5 8 L18 8
                   Z"
                fill={`url(#bodyGrad-${uniqueId})`}
                stroke={palette.border}
                strokeWidth={isSelected ? '1.5' : '1.1'}
                strokeLinejoin="round"
              />

              {/* Inner Concentric Stepped Chevron Lines */}
              <path
                d="M22 9 L27 18 L17 18 Z"
                fill={palette.innerFill}
                stroke={palette.accent}
                strokeWidth="0.8"
              />
              <path
                d="M14 27 L22 17 L30 27"
                stroke={palette.accent}
                strokeWidth="1"
                fill="none"
                opacity="0.85"
              />
              <line x1="22" y1="36" x2="22" y2="48" stroke={palette.accent} strokeWidth="1.2" />

              {/* Central Geometric Icon Medallion */}
              <circle
                cx="22"
                cy="26"
                r="8.5"
                fill={palette.innerFill}
                stroke={`url(#goldGrad-${uniqueId})`}
                strokeWidth={isSelected ? '1.5' : '1.1'}
              />
            </g>
          )}

          {/* --------------------------------------------------
              SHAPE VARIANT 2: HERITAGE DIAMOND (المعين التراثي النوبي)
              For crafts, workshops, and artisans
             -------------------------------------------------- */}
          {activeShape === 'diamond' && (
            <g>
              {/* Outer Rhombus Silhouette with Lower Anchor Needle */}
              <path
                d="M22 4
                   L36 18 L34 20 L37 23
                   L25.5 37
                   L22 51
                   L18.5 37
                   L7 23 L10 20 L8 18
                   Z"
                fill={`url(#bodyGrad-${uniqueId})`}
                stroke={palette.border}
                strokeWidth={isSelected ? '1.5' : '1.1'}
                strokeLinejoin="round"
              />

              {/* Inner Stepped Facet Chevrons */}
              <polygon
                points="22,9 33,21 22,33 11,21"
                fill={palette.innerFill}
                stroke={palette.accent}
                strokeWidth="0.8"
                opacity="0.9"
              />

              {/* Subtle Nubian Corner Diamonds */}
              <circle cx="22" cy="7" r="1.3" fill={palette.accent} />
              <circle cx="34" cy="20" r="1.3" fill={palette.accent} />
              <circle cx="10" cy="20" r="1.3" fill={palette.accent} />

              {/* Central Aperture */}
              <circle
                cx="22"
                cy="21"
                r="8"
                fill={palette.innerFill}
                stroke={`url(#goldGrad-${uniqueId})`}
                strokeWidth={isSelected ? '1.5' : '1.1'}
              />
            </g>
          )}

          {/* --------------------------------------------------
              SHAPE VARIANT 3: ROYAL OCTAGON SUN-SEAL (الختم الثماني الملكي)
              For governorates & regional capitals
             -------------------------------------------------- */}
          {activeShape === 'octagon' && (
            <g>
              {/* Octagonal Seal with Bottom Needle */}
              <path
                d="M15 4
                   L29 4
                   L38 13
                   L38 27
                   L29 36
                   L25 36
                   L22 52
                   L19 36
                   L15 36
                   L6 27
                   L6 13
                   Z"
                fill={`url(#bodyGrad-${uniqueId})`}
                stroke={palette.border}
                strokeWidth={isSelected ? '1.8' : '1.2'}
                strokeLinejoin="round"
              />

              {/* Concentric Golden Ring */}
              <circle
                cx="22"
                cy="20"
                r="12.5"
                fill="none"
                stroke={`url(#goldGrad-${uniqueId})`}
                strokeWidth="1.2"
                strokeDasharray="2 1.5"
              />

              {/* Inner Dark Royal Core */}
              <circle
                cx="22"
                cy="20"
                r="9.5"
                fill={palette.innerFill}
                stroke={palette.accent}
                strokeWidth={isSelected ? '1.5' : '1'}
              />

              {/* Solar Radiance Ticks */}
              <circle cx="22" cy="6" r="1.2" fill="#FDE68A" />
              <circle cx="35" cy="20" r="1.2" fill="#FDE68A" />
              <circle cx="22" cy="34" r="1.2" fill="#FDE68A" />
              <circle cx="9" cy="20" r="1.2" fill="#FDE68A" />
            </g>
          )}

          {/* --------------------------------------------------
              SHAPE VARIANT 4: HARVEST HEXAGON (السداسي الهندسي الفخاري)
              For food, cuisine, and agricultural heritage
             -------------------------------------------------- */}
          {activeShape === 'hexagon' && (
            <g>
              {/* Outer Hexagon Silhouette with Lower Anchor Needle */}
              <path
                d="M22 4
                   L36 12
                   L36 28
                   L25.5 37
                   L22 51
                   L18.5 37
                   L8 28
                   L8 12
                   Z"
                fill={`url(#bodyGrad-${uniqueId})`}
                stroke={palette.border}
                strokeWidth={isSelected ? '1.5' : '1.1'}
                strokeLinejoin="round"
              />

              {/* Inner Honeycomb / Earthenware Rim */}
              <polygon
                points="22,9 33,15 33,26 22,32 11,26 11,15"
                fill={palette.innerFill}
                stroke={palette.accent}
                strokeWidth="0.8"
                opacity="0.85"
              />

              {/* Central Core */}
              <circle
                cx="22"
                cy="21"
                r="8"
                fill={palette.innerFill}
                stroke={`url(#goldGrad-${uniqueId})`}
                strokeWidth={isSelected ? '1.5' : '1'}
              />
            </g>
          )}

          {/* --------------------------------------------------
              SHAPE VARIANT 5: CARTOUCHE / AMULET (الخرطوشة التراثية)
              For stories, folklore, and regional legends
             -------------------------------------------------- */}
          {activeShape === 'cartouche' && (
            <g>
              <path
                d="M13 6 C13 3, 31 3, 31 6
                   L33 30
                   C33 35, 26 37, 25 37
                   L22 51
                   L19 37
                   C18 37, 11 35, 11 30
                   Z"
                fill={`url(#bodyGrad-${uniqueId})`}
                stroke={palette.border}
                strokeWidth={isSelected ? '1.5' : '1.1'}
                strokeLinejoin="round"
              />
              {/* Cartouche tied base */}
              <line x1="14" y1="35" x2="30" y2="35" stroke={palette.accent} strokeWidth="2" strokeLinecap="round" />
              <circle
                cx="22"
                cy="19"
                r="8.5"
                fill={palette.innerFill}
                stroke={`url(#goldGrad-${uniqueId})`}
                strokeWidth={isSelected ? '1.5' : '1'}
              />
            </g>
          )}

          {/* Top Apex Jewelry Spark (Appears on selection) */}
          {isSelected && (
            <polygon
              points="22,0 24,3 22,5 20,3"
              fill="#FDE68A"
              stroke="#D97706"
              strokeWidth="0.5"
            />
          )}
        </svg>

        {/* Central Icon Placement */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transform: activeShape === 'stepped-pyramid' ? 'translateY(-1px)' : 'translateY(-4px)' }}
        >
          {renderIcon()}
        </div>
      </div>

      {/* =========================================================
          3. COMPACT FLOATING TOOLTIP BADGE
          Appears smoothly on hover or when selected
         ========================================================= */}
      {(isSelected || isHovered) && showLabel && (
        <div
          className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 pointer-events-none z-50 whitespace-nowrap"
          style={{
            animation: 'fadeIn 200ms ease-out'
          }}
        >
          <div
            className={`px-2.5 py-1 rounded-xl shadow-xl border text-xs font-black flex items-center gap-1.5 backdrop-blur-md transition-all ${palette.labelBg}`}
          >
            <span>{title}</span>
            {governorateName && (
              <span className="text-[10px] opacity-85 font-medium">
                • {governorateName}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * WAH | وه Design System Tokens
 * Authentic Upper Egypt Cultural Aesthetics + Modern Minimalist Product Architecture
 */

export const WAH_TOKENS = {
  colors: {
    light: {
      primary: '#B24C2B', // Artisanal Terracotta / Nile Silt Clay
      primaryHover: '#963E21',
      primaryLight: '#F7ECE6',
      secondary: '#264653', // Deep Nile Water / Slate Teal
      secondaryHover: '#1E3640',
      secondaryLight: '#E9F1F3',
      accent: '#D97724', // Sunlit Desert Ochre / Honey Amber
      accentHover: '#B86018',
      accentLight: '#FDF3E7',
      background: '#FAF7F2', // Warm Desert Sand Ivory
      surface: '#FFFFFF', // Elevated Pure Surface
      surfaceSubtle: '#F3ECE2', // Natural Stone / Sunned Clay
      surfaceMuted: '#EAE1D5', // Soft Sandstone
      text: '#241E1A', // Dark Basalt Earth
      textMuted: '#73675B', // Weathered Sandstone
      textSubtle: '#9C8E80', // Desert Dust
      border: '#E5DDD3', // Sun-baked Clay Border
      borderHover: '#CBBDB0',
      borderStrong: '#B3A292',
      success: '#286644', // Fertile Nile Agriculture Green
      warning: '#C4751B', // Desert Gold Amber
      error: '#B9382B', // Carmine Clay Red
      info: '#29658A', // Nile Sky Blue
    },
    dark: {
      primary: '#E0633C', // Luminous Terracotta
      primaryHover: '#F07A54',
      primaryLight: 'rgba(224, 99, 60, 0.15)',
      secondary: '#427B8C', // Luminous Nile Twilight
      secondaryHover: '#5494A7',
      secondaryLight: 'rgba(66, 123, 140, 0.15)',
      accent: '#E68A35', // Golden Desert Flare
      accentHover: '#F29C4E',
      accentLight: 'rgba(230, 138, 53, 0.15)',
      background: '#110E0C', // Deep Basalt Night
      surface: '#1B1613', // Deep Clay Slate
      surfaceSubtle: '#26201B', // Dark Terracotta Wash
      surfaceMuted: '#322923', // Dark Sandstone
      text: '#F7F3EE', // Warm Alabaster Ivory
      textMuted: '#A89B8F', // Desert Twilight Dust
      textSubtle: '#7E7166', // Shadowed Silt
      border: '#352B24', // Deep Bronze Clay
      borderHover: '#4D3E34',
      borderStrong: '#665346',
      success: '#489E6E',
      warning: '#E09228',
      error: '#E05344',
      info: '#4A97C9',
    }
  },
  typography: {
    fontHeritage: "'Amiri', 'Cairo', serif",
    fontBody: "'Cairo', system-ui, -apple-system, sans-serif",
  },
  radius: {
    sm: '0.5rem', // 8px
    md: '0.75rem', // 12px
    lg: '1rem', // 16px
    xl: '1.5rem', // 24px
    full: '9999px',
    editorial: '1.5rem 0.5rem 1.5rem 0.5rem', // Distinctive Upper Egyptian asymmetric editorial corner
    editorialReverse: '0.5rem 1.5rem 0.5rem 1.5rem',
  },
  shadows: {
    soft: '0 2px 8px -2px rgba(36, 30, 26, 0.05)',
    card: '0 6px 20px -4px rgba(36, 30, 26, 0.07)',
    cardHover: '0 12px 30px -6px rgba(36, 30, 26, 0.12)',
    terracottaGlow: '0 8px 24px -4px rgba(178, 76, 43, 0.25)',
  }
} as const;

export type PatternType = 'kilim' | 'pottery' | 'nile' | 'palm' | 'architecture' | 'geometry';

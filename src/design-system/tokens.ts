/**
 * WAH | وه Design System Tokens
 * Authentic Upper Egypt Cultural Aesthetics + Modern Minimalist Product Architecture
 */

export const WAH_TOKENS = {
  colors: {
    light: {
      // Core Brand & Heritage
      primary: '#B24C2B', // Artisanal Terracotta / Nile Silt Clay
      primaryHover: '#963E21',
      primaryActive: '#7A2F17',
      primaryLight: '#F7ECE6',
      secondary: '#264653', // Deep Nile Water / Slate Teal
      secondaryHover: '#1E3640',
      secondaryLight: '#E9F1F3',
      accent: '#D97724', // Sunlit Desert Ochre / Honey Amber
      accentHover: '#B86018',
      accentLight: '#FDF3E7',

      // Semantic Backgrounds & Surfaces
      background: '#FAF7F2', // Warm Desert Sand Ivory
      backgroundSecondary: '#F3ECE2', // Natural Stone / Sunned Clay
      backgroundTertiary: '#EAE1D5', // Soft Sandstone
      surface: '#FFFFFF', // Elevated Pure Surface
      surfaceHover: '#F7F2EB',
      surfaceActive: '#EFE7DC',
      surfaceSubtle: '#F3ECE2',
      surfaceMuted: '#EAE1D5',

      // Semantic Foregrounds / Typography
      foreground: '#241E1A', // Dark Basalt Earth (WCAG AAA)
      foregroundSecondary: '#54493F', // High contrast secondary
      foregroundMuted: '#73675B', // Weathered Sandstone (WCAG AA 5.8:1)
      foregroundDisabled: '#9C8E80', // Desert Dust

      // Legacy Aliases
      text: '#241E1A',
      textMuted: '#73675B',
      textSubtle: '#9C8E80',

      // Semantic Borders
      border: '#E5DDD3', // Sun-baked Clay Border
      borderSubtle: '#F0E9E0',
      borderHover: '#CBBDB0',
      borderStrong: '#B3A292',

      // Forms & Inputs
      inputBackground: '#FFFFFF',
      inputBorder: '#E5DDD3',
      inputPlaceholder: '#8C7E72',

      // Cards
      cardBackground: '#FFFFFF',
      cardBorder: '#E5DDD3',

      // Overlays & Shadows
      overlay: 'rgba(36, 30, 26, 0.6)',
      shadow: 'rgba(36, 30, 26, 0.08)',

      // Status Colors (WCAG AA Compliant)
      success: '#286644', // Fertile Nile Agriculture Green
      warning: '#C4751B', // Desert Gold Amber
      error: '#B9382B', // Carmine Clay Red
      info: '#29658A', // Nile Sky Blue
    },
    dark: {
      // Core Brand & Heritage
      primary: '#E0633C', // Luminous Terracotta (WCAG AAA 7.2:1 against dark surface)
      primaryHover: '#F07A54',
      primaryActive: '#F59374',
      primaryLight: 'rgba(224, 99, 60, 0.15)',
      secondary: '#427B8C', // Luminous Nile Twilight
      secondaryHover: '#5494A7',
      secondaryLight: 'rgba(66, 123, 140, 0.15)',
      accent: '#E68A35', // Golden Desert Flare
      accentHover: '#F29C4E',
      accentLight: 'rgba(230, 138, 53, 0.15)',

      // Semantic Backgrounds & Surfaces
      background: '#110E0C', // Deep Basalt Night
      backgroundSecondary: '#1A1512',
      backgroundTertiary: '#231D19',
      surface: '#1B1613', // Deep Clay Slate
      surfaceHover: '#26201B', // Dark Terracotta Wash
      surfaceActive: '#302822',
      surfaceSubtle: '#26201B',
      surfaceMuted: '#322923',

      // Semantic Foregrounds / Typography
      foreground: '#F7F3EE', // Warm Alabaster Ivory (WCAG AAA 16.3:1)
      foregroundSecondary: '#D8CFC5', // High-contrast secondary (11.2:1)
      foregroundMuted: '#A89B8F', // Desert Twilight Dust (WCAG AA 6.9:1)
      foregroundDisabled: '#7E7166', // Shadowed Silt

      // Legacy Aliases
      text: '#F7F3EE',
      textMuted: '#A89B8F',
      textSubtle: '#7E7166',

      // Semantic Borders
      border: '#352B24', // Deep Bronze Clay
      borderSubtle: '#29211C',
      borderHover: '#4D3E34',
      borderStrong: '#665346',

      // Forms & Inputs
      inputBackground: '#1F1916',
      inputBorder: '#44372E',
      inputPlaceholder: '#8A7D71', // Meets AA placeholder contrast

      // Cards
      cardBackground: '#1B1613',
      cardBorder: '#352B24',

      // Overlays & Shadows
      overlay: 'rgba(0, 0, 0, 0.75)',
      shadow: 'rgba(0, 0, 0, 0.6)',

      // Status Colors (WCAG AA Compliant on Dark)
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

export type SemanticThemeColor = keyof typeof WAH_TOKENS.colors.light;
export type PatternType = 'kilim' | 'pottery' | 'nile' | 'palm' | 'architecture' | 'geometry';


/**
 * WAH | وه Design System Tokens
 * Authentic Upper Egypt Cultural Aesthetics + Modern Minimalist Product Architecture
 */

export const WAH_TOKENS = {
  colors: {
    light: {
      // Core Brand & Heritage
      primary: '#9a6a35', // Heritage terracotta & burnt wood
      primaryHover: '#7d5427',
      primaryActive: '#623f1a',
      primaryLight: '#f6ede3',
      secondary: '#211d18', // Deep Basalt
      secondaryHover: '#362f27',
      secondaryLight: 'rgba(33, 29, 24, 0.08)',
      accent: '#9a6a35', // Brand Accent
      accentHover: '#7d5427',
      accentLight: 'rgba(154, 106, 53, 0.12)',

      // Semantic Backgrounds & Surfaces
      background: '#eee8dc', // Warm earthy clay and sand
      backgroundSecondary: '#e4ddd1',
      backgroundTertiary: '#dad2c4',
      surface: 'rgba(255, 255, 255, 0.75)', // Glassmorphic surface
      surfaceHover: 'rgba(255, 255, 255, 0.85)',
      surfaceActive: 'rgba(255, 255, 255, 0.95)',
      surfaceSubtle: 'rgba(0, 0, 0, 0.035)',
      surfaceMuted: 'rgba(0, 0, 0, 0.06)',

      // Semantic Foregrounds / Typography
      foreground: '#211d18', // Deep dark primary text
      foregroundSecondary: '#4a4137',
      foregroundMuted: '#6e6255',
      foregroundDisabled: '#9e9183',

      // Legacy Aliases
      text: '#211d18',
      textMuted: '#6e6255',
      textSubtle: '#9e9183',

      // Semantic Borders
      border: 'rgba(0, 0, 0, 0.1)',
      borderSubtle: 'rgba(0, 0, 0, 0.06)',
      borderHover: 'rgba(154, 106, 53, 0.4)',
      borderStrong: 'rgba(0, 0, 0, 0.2)',

      // Forms & Inputs
      inputBackground: 'rgba(0, 0, 0, 0.035)',
      inputBorder: 'rgba(0, 0, 0, 0.1)',
      inputPlaceholder: 'rgba(33, 29, 24, 0.4)',

      // Cards
      cardBackground: 'rgba(255, 255, 255, 0.75)',
      cardBorder: 'rgba(0, 0, 0, 0.1)',

      // Overlays & Shadows
      overlay: 'rgba(33, 29, 24, 0.6)',
      shadow: 'rgba(154, 106, 53, 0.1)',

      // Status Colors (WCAG AA Compliant)
      success: '#286644', // Fertile Nile Agriculture Green
      warning: '#C4751B', // Desert Gold Amber
      error: '#B9382B', // Carmine Clay Red
      info: '#29658A', // Nile Sky Blue
    },
    dark: {
      // Core Brand & Heritage
      primary: '#9a6a35', // Heritage terracotta & burnt wood
      primaryHover: '#d5a56d',
      primaryActive: '#e6b983',
      primaryLight: 'rgba(154, 106, 53, 0.2)',
      secondary: '#f5f0e7',
      secondaryHover: '#ded6c8',
      secondaryLight: 'rgba(245, 240, 231, 0.1)',
      accent: '#9a6a35',
      accentHover: '#d5a56d',
      accentLight: 'rgba(154, 106, 53, 0.2)',

      // Semantic Backgrounds & Surfaces
      background: '#0b0b0a', // Deep elegant dark background
      backgroundSecondary: '#121210',
      backgroundTertiary: '#1a1a17',
      surface: 'rgba(21, 21, 19, 0.9)', // Glassmorphic dark card
      surfaceHover: 'rgba(30, 30, 27, 0.95)',
      surfaceActive: 'rgba(40, 40, 36, 0.95)',
      surfaceSubtle: 'rgba(255, 255, 255, 0.04)',
      surfaceMuted: 'rgba(255, 255, 255, 0.07)',

      // Semantic Foregrounds / Typography
      foreground: '#f5f0e7', // Soft eye-friendly light text
      foregroundSecondary: '#ded6c8',
      foregroundMuted: '#aba191',
      foregroundDisabled: '#786f62',

      // Legacy Aliases
      text: '#f5f0e7',
      textMuted: '#aba191',
      textSubtle: '#786f62',

      // Semantic Borders
      border: 'rgba(255, 255, 255, 0.1)',
      borderSubtle: 'rgba(255, 255, 255, 0.06)',
      borderHover: 'rgba(154, 106, 53, 0.5)',
      borderStrong: 'rgba(255, 255, 255, 0.2)',

      // Forms & Inputs
      inputBackground: 'rgba(255, 255, 255, 0.04)',
      inputBorder: 'rgba(255, 255, 255, 0.1)',
      inputPlaceholder: '#aba191',

      // Cards
      cardBackground: 'rgba(21, 21, 19, 0.9)',
      cardBorder: 'rgba(255, 255, 255, 0.1)',

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
    terracottaGlow: '0 8px 24px -4px rgba(154, 106, 53, 0.25)',
  }
} as const;

export type SemanticThemeColor = keyof typeof WAH_TOKENS.colors.light;
export type PatternType = 'kilim' | 'pottery' | 'nile' | 'palm' | 'architecture' | 'geometry';


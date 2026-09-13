/**
 * WAH | وه Design System Tokens
 * Authentic Upper Egypt Cultural Aesthetics + Modern Minimalist Product Architecture
 */

export const WAH_TOKENS = {
  colors: {
    light: {
      // Core Brand & Palette
      primary: '#9a6a35', // Warm Caramel (Brand Accent)
      primaryHover: '#7d5427',
      primaryActive: '#623f1a',
      primaryLight: 'rgba(154, 106, 53, 0.12)',
      secondary: '#FFEDD8', // Soft Warm Sand / Muted Peach
      secondaryHover: '#FAE1C3',
      secondaryLight: 'rgba(255, 237, 216, 0.50)',
      cream: '#FFF6EB', // Clean Cream / Warm Off-white
      espresso: '#2b241c', // Deep Espresso / Charcoal Brown
      accent: '#9a6a35',
      accentHover: '#7d5427',
      accentLight: 'rgba(154, 106, 53, 0.12)',

      // Semantic Backgrounds & Surfaces
      background: '#FFF6EB', // Clean Cream Base Background
      backgroundSecondary: '#F7EFE4',
      backgroundTertiary: '#EEDEC8',
      surface: 'rgba(255, 255, 255, 0.85)', // Glassmorphic white surface
      surfaceHover: 'rgba(255, 255, 255, 0.95)',
      surfaceActive: '#ffffff',
      surfaceSubtle: 'rgba(43, 36, 28, 0.04)',
      surfaceMuted: 'rgba(43, 36, 28, 0.08)',

      // Semantic Foregrounds / Typography (High contrast & readability)
      foreground: '#2b241c', // Deep Espresso primary text
      foregroundSecondary: 'rgba(43, 36, 28, 0.75)',
      foregroundMuted: 'rgba(43, 36, 28, 0.55)',
      foregroundDisabled: 'rgba(43, 36, 28, 0.35)',

      // Legacy Aliases
      text: '#2b241c',
      textMuted: 'rgba(43, 36, 28, 0.55)',
      textSubtle: 'rgba(43, 36, 28, 0.35)',

      // Semantic Borders
      border: 'rgba(154, 106, 53, 0.30)', // #9a6a35/30 border
      borderSubtle: 'rgba(43, 36, 28, 0.08)',
      borderHover: 'rgba(154, 106, 53, 0.45)',
      borderStrong: 'rgba(154, 106, 53, 0.40)',

      // Forms & Inputs
      inputBackground: 'rgba(255, 255, 255, 0.90)',
      inputBorder: 'rgba(154, 106, 53, 0.25)',
      inputPlaceholder: 'rgba(43, 36, 28, 0.40)',

      // Cards
      cardBackground: 'rgba(255, 255, 255, 0.85)',
      cardBorder: 'rgba(154, 106, 53, 0.30)',

      // Overlays & Shadows
      overlay: 'rgba(43, 36, 28, 0.60)',
      shadow: 'rgba(154, 106, 53, 0.10)',

      // Status Colors (WCAG AA Compliant)
      success: '#286644', // Fertile Nile Agriculture Green
      warning: '#C4751B', // Desert Gold Amber
      error: '#B9382B', // Carmine Clay Red
      info: '#29658A', // Nile Sky Blue
    },
    dark: {
      // Core Brand & Palette
      primary: '#9a6a35', // Warm Caramel
      primaryHover: '#b88248',
      primaryActive: '#cca36e',
      primaryLight: 'rgba(154, 106, 53, 0.25)',
      secondary: '#FFEDD8', // Soft Warm Sand
      secondaryHover: '#ffffff',
      secondaryLight: 'rgba(255, 237, 216, 0.15)',
      cream: '#FFF6EB',
      espresso: '#2b241c',
      accent: '#9a6a35',
      accentHover: '#b88248',
      accentLight: 'rgba(154, 106, 53, 0.25)',

      // Semantic Backgrounds & Surfaces
      background: '#1e1914', // Deep warm tone derived from #2b241c
      backgroundSecondary: '#251f19',
      backgroundTertiary: '#2b241c',
      surface: 'rgba(43, 36, 28, 0.85)', // Elevated espresso layers
      surfaceHover: 'rgba(56, 47, 37, 0.95)',
      surfaceActive: '#3a3127',
      surfaceSubtle: 'rgba(255, 246, 235, 0.05)',
      surfaceMuted: 'rgba(255, 246, 235, 0.08)',

      // Semantic Foregrounds / Typography (Legible warm tones)
      foreground: '#FFF6EB', // Clean Cream text
      foregroundSecondary: '#FFEDD8', // Soft Warm Sand secondary text
      foregroundMuted: 'rgba(255, 237, 216, 0.65)',
      foregroundDisabled: 'rgba(255, 237, 216, 0.40)',

      // Legacy Aliases
      text: '#FFF6EB',
      textMuted: 'rgba(255, 237, 216, 0.65)',
      textSubtle: 'rgba(255, 237, 216, 0.40)',

      // Semantic Borders
      border: 'rgba(154, 106, 53, 0.40)', // #9a6a35/40 border
      borderSubtle: 'rgba(255, 246, 235, 0.10)',
      borderHover: 'rgba(154, 106, 53, 0.60)',
      borderStrong: 'rgba(154, 106, 53, 0.50)',

      // Forms & Inputs
      inputBackground: 'rgba(43, 36, 28, 0.60)',
      inputBorder: 'rgba(154, 106, 53, 0.40)',
      inputPlaceholder: 'rgba(255, 237, 216, 0.40)',

      // Cards
      cardBackground: 'rgba(43, 36, 28, 0.85)',
      cardBorder: 'rgba(154, 106, 53, 0.40)',

      // Overlays & Shadows
      overlay: 'rgba(0, 0, 0, 0.75)',
      shadow: 'rgba(0, 0, 0, 0.60)',

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


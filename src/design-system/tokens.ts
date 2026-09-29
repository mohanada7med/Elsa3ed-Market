/**
 * WAH | وه Design System Tokens
 * Authentic Upper Egypt Cultural Aesthetics + Modern Minimalist Product Architecture
 * Official WAH Brand Color Palette
 */

export const WAH_TOKENS = {
  colors: {
    light: {
      // Core Brand & Palette
      primary: '#6B3A1F', // Medium Brown (Primary Buttons & UI)
      primaryHover: '#3B1E0E', // Dark Brown
      primaryActive: '#26160D',
      primaryLight: 'rgba(107, 58, 31, 0.12)',
      secondary: '#8C6F53', // Brown Gray (Secondary text, metadata)
      secondaryHover: '#6B3A1F',
      secondaryLight: 'rgba(140, 111, 83, 0.15)',
      cream: '#F8EBD7', // Cream (Cards & Surfaces)
      espresso: '#3B1E0E', // Dark Brown (Main headings, logo, primary text, footer)
      accent: '#C99444', // Golden (Brand Accent, highlights, active states)
      accentHover: '#E66A2E', // Orange
      accentLight: 'rgba(201, 148, 68, 0.15)',
      cta: '#E66A2E', // Orange (CTA buttons)
      ctaHover: '#C99444',

      // Semantic Backgrounds & Surfaces
      background: '#FFF9EE', // Main Light Background
      backgroundSecondary: '#F8EBD7',
      backgroundTertiary: '#E0C79B',
      surface: '#F8EBD7', // Cream Cards & Surfaces
      surfaceHover: '#FFF9EE',
      surfaceActive: '#E0C79B',
      surfaceSubtle: 'rgba(107, 58, 31, 0.05)',
      surfaceMuted: 'rgba(107, 58, 31, 0.08)',

      // Semantic Foregrounds / Typography (High contrast & readability)
      foreground: '#3B1E0E', // Dark Brown primary text
      foregroundSecondary: '#8C6F53', // Brown Gray secondary text
      foregroundMuted: '#8C6F53',
      foregroundDisabled: '#D6C6B1', // Secondary Neutral disabled

      // Legacy Aliases
      text: '#3B1E0E',
      textMuted: '#8C6F53',
      textSubtle: '#D6C6B1',

      // Semantic Borders
      border: '#E0C79B', // Light Beige borders
      borderSubtle: 'rgba(224, 199, 155, 0.50)',
      borderHover: '#C99444',
      borderStrong: '#6B3A1F',

      // Forms & Inputs
      inputBackground: 'rgba(255, 249, 238, 0.95)',
      inputBorder: '#E0C79B',
      inputPlaceholder: '#8C6F53',

      // Cards
      cardBackground: '#F8EBD7',
      cardBorder: '#E0C79B',

      // Overlays & Shadows
      overlay: 'rgba(59, 30, 14, 0.65)',
      shadow: 'rgba(59, 30, 14, 0.08)',

      // Status Colors (WCAG AA Compliant)
      success: '#286644', // Fertile Nile Agriculture Green
      warning: '#C4751B', // Desert Gold Amber
      error: '#B9382B', // Carmine Clay Red
      info: '#29658A', // Nile Sky Blue
    },
    dark: {
      // Core Brand & Palette
      primary: '#6B3A1F', // Medium Brown
      primaryHover: '#3B1E0E',
      primaryActive: '#4A2715',
      primaryLight: 'rgba(107, 58, 31, 0.25)',
      secondary: '#D6C6B1', // Secondary Neutral
      secondaryHover: '#FFF9EE',
      secondaryLight: 'rgba(214, 198, 177, 0.15)',
      cream: '#F8EBD7',
      espresso: '#3B1E0E',
      accent: '#C99444', // Golden
      accentHover: '#E66A2E',
      accentLight: 'rgba(201, 148, 68, 0.25)',
      cta: '#E66A2E',
      ctaHover: '#C99444',

      // Semantic Backgrounds & Surfaces
      background: '#1B1009', // Main Dark Background
      backgroundSecondary: '#26160D', // Secondary Background
      backgroundTertiary: '#3B1E0E',
      surface: '#3B1E0E', // Dark Mode Cards / Surfaces
      surfaceHover: '#4A2715', // Elevated Surface
      surfaceActive: '#6B3A1F',
      surfaceSubtle: 'rgba(255, 249, 238, 0.05)',
      surfaceMuted: 'rgba(255, 249, 238, 0.08)',

      // Semantic Foregrounds / Typography (Legible warm tones)
      foreground: '#FFF9EE', // Cream / Off-white text
      foregroundSecondary: '#D6C6B1', // Secondary Neutral text
      foregroundMuted: '#8C6F53', // Brown Gray muted text
      foregroundDisabled: 'rgba(214, 198, 177, 0.40)',

      // Legacy Aliases
      text: '#FFF9EE',
      textMuted: '#8C6F53',
      textSubtle: 'rgba(214, 198, 177, 0.40)',

      // Semantic Borders
      border: '#6B3A1F', // Medium Brown borders
      borderSubtle: 'rgba(107, 58, 31, 0.45)',
      borderHover: '#C99444',
      borderStrong: '#C99444',

      // Forms & Inputs
      inputBackground: '#26160D',
      inputBorder: '#6B3A1F',
      inputPlaceholder: 'rgba(214, 198, 177, 0.50)',

      // Cards
      cardBackground: '#3B1E0E',
      cardBorder: '#6B3A1F',

      // Overlays & Shadows
      overlay: 'rgba(0, 0, 0, 0.80)',
      shadow: 'rgba(0, 0, 0, 0.70)',

      // Status Colors (WCAG AA Compliant on Dark)
      success: '#489E6E',
      warning: '#E09228',
      error: '#E05344',
      info: '#4A97C9',
    }
  },
  typography: {
    wahDisplay: "'SHIN Stout Bold', 'SHIN Stout', 'Cairo', system-ui, sans-serif",
    wahHeading: "'Eskorte Arabic', 'Eskorte', 'Amiri', serif",
    wahBody: "'Effra Arabic', 'Effra', 'Cairo', system-ui, sans-serif",
    fontHeritage: "'Eskorte Arabic', 'Amiri', serif",
    fontBody: "'Effra Arabic', 'Cairo', system-ui, sans-serif",
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
    soft: '0 2px 8px -2px rgba(59, 30, 14, 0.06)',
    card: '0 6px 20px -4px rgba(59, 30, 14, 0.08)',
    cardHover: '0 12px 30px -6px rgba(59, 30, 14, 0.12)',
    terracottaGlow: '0 8px 24px -4px rgba(201, 148, 68, 0.20)',
    ctaGlow: '0 8px 24px -4px rgba(230, 106, 46, 0.30)',
  }
} as const;

export type SemanticThemeColor = keyof typeof WAH_TOKENS.colors.light;
export type PatternType = 'kilim' | 'pottery' | 'nile' | 'palm' | 'architecture' | 'geometry' | 'heritage' | 'stripes';

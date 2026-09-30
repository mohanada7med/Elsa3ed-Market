/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      colors: {
        // =========================================================================
        // 1. OFFICIAL WAH BRAND DESIGN SYSTEM TOKENS
        // =========================================================================
        wah: {
          dark: '#3B1E0E',       // Dark Brown: Headings, primary text, logo, nav, footer, dark elements
          brown: '#6B3A1F',      // Medium Brown: Primary buttons, active nav, dark card bg, important UI
          gold: '#C99444',       // Golden: Main brand accent, indicators, lines, highlights, selected
          orange: '#E66A2E',     // Orange: Main CTA buttons, notifications, badges, highlights
          cream: '#F8EBD7',      // Cream: Cards, secondary sections, soft surfaces, containers
          beige: '#E0C79B',      // Light Beige: Borders, dividers, subtle outlines
          background: '#FFF9EE', // Main Light page background
          muted: '#D6C6B1',      // Secondary Neutral: Muted UI, disabled elements, subtle borders
          secondary: '#8C6F53',  // Brown Gray: Secondary text, metadata, categories, dates, locations
        },
        wahDark: {
          background: '#1B1009', // Main Dark background
          surface: '#26160D',    // Secondary Dark background
          card: '#3B1E0E',       // Dark mode cards / surfaces
          elevated: '#4A2715',   // Elevated surfaces
        },

        // Core Brand Utilities mapped to official WAH palette
        primary: {
          DEFAULT: '#6B3A1F',    // Medium Brown (Primary UI & Buttons)
          hover: 'var(--primary-hover, #3B1E0E)',      // Dark Brown in Light, Golden in Dark
          active: 'var(--primary-active, #26160D)',
          light: 'var(--primary-light, rgba(107, 58, 31, 0.12))',
          50: '#FFF9EE',
          100: '#F8EBD7',
          200: '#E0C79B',
          300: '#D6C6B1',
          400: '#C99444',
          500: '#8C6F53',
          600: '#6B3A1F',
          700: '#4A2715',
          800: '#3B1E0E',
          900: '#1B1009',
        },
        secondary: {
          DEFAULT: '#8C6F53',    // Brown Gray
          hover: '#6B3A1F',
          light: 'rgba(140, 111, 83, 0.15)',
          50: '#FFF9EE',
          100: '#F8EBD7',
          200: '#E0C79B',
          300: '#D6C6B1',
        },
        cream: {
          DEFAULT: '#F8EBD7',    // Cream Cards & Surfaces
          50: '#FFF9EE',         // Light Mode Page Background
          100: '#F8EBD7',
          200: '#E0C79B',
          300: '#D6C6B1',
        },
        espresso: {
          DEFAULT: '#3B1E0E',    // Dark Brown
          50: '#F8EBD7',
          100: '#E0C79B',
          200: '#D6C6B1',
          300: '#8C6F53',
          400: '#6B3A1F',
          500: '#4A2715',
          600: '#3B1E0E',
          700: '#26160D',
          800: '#1B1009',
          900: '#1B1009',        // Dark Mode Base Canvas
          950: '#120904',
        },
        caramel: {
          DEFAULT: '#C99444',    // Golden Accent
          hover: '#E66A2E',
          active: '#6B3A1F',
        },
        gold: {
          DEFAULT: '#C99444',    // Golden Accent
          hover: '#E66A2E',
          light: 'rgba(201, 148, 68, 0.15)',
        },
        orange: {
          DEFAULT: '#E66A2E',    // Orange CTA
          hover: '#C99444',
          light: 'rgba(230, 106, 46, 0.15)',
        },
        sand: {
          DEFAULT: '#E0C79B',    // Light Beige
          hover: '#D6C6B1',
        },

        // Brand Namespace
        brand: {
          primary: '#6B3A1F',
          secondary: '#8C6F53',
          cream: '#F8EBD7',
          espresso: '#3B1E0E',
          gold: '#C99444',
          orange: '#E66A2E',
          beige: '#E0C79B',
          background: '#FFF9EE',
          darkBg: '#1B1009',
        },

        // =========================================================================
        // 2. FUNCTIONAL & SEMANTIC THEME TOKENS (Dynamic CSS Variables)
        // Automatically adapt between Light Mode and Dark Mode
        // =========================================================================
        background: {
          DEFAULT: 'var(--background)',
          secondary: 'var(--background-secondary)',
          tertiary: 'var(--background-tertiary)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          hover: 'var(--surface-hover)',
          active: 'var(--surface-active)',
          subtle: 'var(--surface-subtle)',
          muted: 'var(--surface-muted)',
        },
        foreground: {
          DEFAULT: 'var(--foreground)',
          secondary: 'var(--foreground-secondary)',
          muted: 'var(--foreground-muted)',
          disabled: 'var(--foreground-disabled)',
        },
        border: {
          DEFAULT: 'var(--border)',
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
          hover: 'var(--border-hover)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          light: 'var(--accent-light)',
        },
        cta: {
          DEFAULT: 'var(--cta, #E66A2E)',
          hover: 'var(--cta-hover, #C99444)',
        },

        // Status Feedback Colors (WCAG AA Compliant)
        success: {
          DEFAULT: 'var(--success, #286644)',
          dark: '#489E6E',
        },
        warning: {
          DEFAULT: 'var(--warning, #C4751B)',
          dark: '#E09228',
        },
        error: {
          DEFAULT: 'var(--error, #B9382B)',
          dark: '#E05344',
        },
        info: {
          DEFAULT: 'var(--info, #29658A)',
          dark: '#4A97C9',
        },

        // Form Inputs & Cards
        'input-bg': 'var(--input-background)',
        'input-border': 'var(--input-border)',
        'card-bg': 'var(--card-background)',
        'card-border': 'var(--card-border)',
        'btn-dark': 'var(--btn-dark)',

        // =========================================================================
        // 3. BACKWARD-COMPATIBLE WAH ALIASES
        // =========================================================================
        'wah-primary': 'var(--wah-primary)',
        'wah-primary-hover': 'var(--wah-primary-hover)',
        'wah-primary-light': 'var(--wah-primary-light)',
        'wah-secondary': 'var(--wah-secondary)',
        'wah-secondary-hover': 'var(--wah-secondary-hover)',
        'wah-secondary-light': 'var(--wah-secondary-light)',
        'wah-accent': 'var(--wah-accent)',
        'wah-accent-hover': 'var(--wah-accent-hover)',
        'wah-accent-light': 'var(--wah-accent-light)',
        'wah-bg': 'var(--wah-background)',
        'wah-surface': 'var(--wah-surface)',
        'wah-surface-subtle': 'var(--wah-surface-subtle)',
        'wah-surface-muted': 'var(--wah-surface-muted)',
        'wah-text': 'var(--wah-text)',
        'wah-text-muted': 'var(--wah-text-muted)',
        'wah-text-subtle': 'var(--wah-text-subtle)',
        'wah-border': 'var(--wah-border)',
        'wah-border-hover': 'var(--wah-border-hover)',
        'wah-border-strong': 'var(--wah-border-strong)',
      },
      fontFamily: {
        // =========================================
        // WAH TYPOGRAPHY SYSTEM
        // MainFont → Headings / Titles
        // Cairo    → Body / UI / Normal Text
        // =========================================

        sans: [
          "'Cairo'",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],

        main: [
          "'MainFont'",
          "'Cairo'",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],

        heading: [
          "'MainFont'",
          "'Cairo'",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],

        display: [
          "'MainFont'",
          "'Cairo'",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],

        price: [
          "'Cairo'",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],

        cairo: [
          "'Cairo'",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],

        body: [
          "'Cairo'",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],

        secondary: [
          "'Cairo'",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],

        editorial: [
          "'Cairo'",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],

        heritage: [
          "'MainFont'",
          "'Cairo'",
          "system-ui",
          "sans-serif",
        ],

        amiri: [
          "'Amiri'",
          "'Cairo'",
          "serif",
        ],

        serif: [
          "'Amiri'",
          "'Cairo'",
          "serif",
        ],

        // Legacy aliases
        shin: [
          "'MainFont'",
          "'Cairo'",
          "sans-serif",
        ],

        eskorte: [
          "'AdobeArabic'",
          "'Amiri'",
          "'Cairo'",
          "serif",
        ],

        effra: [
          "'Cairo'",
          "sans-serif",
        ],
      },
      fontSize: {
        // Small text
        '2xs': ['0.6875rem', { lineHeight: '1.1rem' }], // 11px
        'xs': ['0.75rem', { lineHeight: '1.25rem' }],   // 12px

        // Normal body & reading
        'sm': ['0.875rem', { lineHeight: '1.4rem' }],   // 14px
        'base': ['1rem', { lineHeight: '1.65rem' }],    // 16px

        // Large body / supporting text
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.85rem' }],   // 20px

        // Headings & Editorial Display
        '2xl': ['1.5rem', { lineHeight: '2.1rem' }],    // 24px
        '3xl': ['1.875rem', { lineHeight: '2.4rem' }],  // 30px
        '4xl': ['2.25rem', { lineHeight: '2.75rem' }],  // 36px
        '5xl': ['3rem', { lineHeight: '1.2' }],         // 48px
        '6xl': ['3.75rem', { lineHeight: '1.15' }],     // 60px
      },

      borderRadius: {
        'wah-editorial': '1.5rem 0.5rem 1.5rem 0.5rem',
        'wah-editorial-reverse': '0.5rem 1.5rem 0.5rem 1.5rem',
      },
      boxShadow: {
        'wah-soft': '0 2px 8px -2px rgba(59, 30, 14, 0.06)',
        'wah-card': '0 6px 20px -4px rgba(59, 30, 14, 0.08)',
        'wah-hover': '0 12px 30px -6px rgba(59, 30, 14, 0.12)',
        'warm-glow': '0 8px 24px -4px rgba(201, 148, 68, 0.20)',
        'cta-glow': '0 8px 24px -4px rgba(230, 106, 46, 0.30)',
      },
    },
  },
  plugins: [],
};

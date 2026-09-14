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
      colors: {
        // =========================================================================
        // 1. CORE BRAND PRIMITIVES
        // =========================================================================
        primary: {
          DEFAULT: '#9a6a35',     // Warm Caramel (Accent/Brand)
          hover: '#7d5427',
          active: '#623f1a',
          light: 'rgba(154, 106, 53, 0.12)',
          50: '#faf6f0',
          100: '#f3e8d7',
          200: '#e5cfae',
          300: '#d3b080',
          400: '#ba8d52',
          500: '#9a6a35',
          600: '#7d5427',
          700: '#623f1a',
          800: '#4d3115',
          900: '#38230e',
        },
        secondary: {
          DEFAULT: '#FFEDD8',     // Soft Warm Sand / Muted Peach
          hover: '#FAE1C3',
          light: 'rgba(255, 237, 216, 0.50)',
          50: '#fffaf5',
          100: '#FFEDD8',
          200: '#fcdbb8',
          300: '#f7c191',
        },
        cream: {
          DEFAULT: '#FFF6EB',     // Clean Cream / Warm Off-white
          50: '#fffdfa',
          100: '#FFF6EB',
          200: '#F7EFE4',
          300: '#EEDEC8',
        },
        espresso: {
          DEFAULT: '#2b241c',     // Deep Espresso / Charcoal Brown
          50: '#4a3e30',
          100: '#3a3127',
          200: '#2b241c',
          900: '#1e1914',         // Base Dark Canvas
          950: '#120f0c',
        },
        caramel: {
          DEFAULT: '#9a6a35',
          hover: '#7d5427',
          active: '#623f1a',
        },
        sand: {
          DEFAULT: '#FFEDD8',
          hover: '#FAE1C3',
        },

        // Brand Namespace
        brand: {
          primary: '#9a6a35',
          secondary: '#FFEDD8',
          cream: '#FFF6EB',
          espresso: '#2b241c',
          caramel: '#9a6a35',
          sand: '#FFEDD8',
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
        heritage: ["'Amiri'", "'Cairo'", 'serif'],
        sans: ["'Cairo'", 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'wah-editorial': '1.5rem 0.5rem 1.5rem 0.5rem',
        'wah-editorial-reverse': '0.5rem 1.5rem 0.5rem 1.5rem',
      },
      boxShadow: {
        'wah-soft': '0 2px 8px -2px rgba(43, 36, 28, 0.05)',
        'wah-card': '0 6px 20px -4px rgba(43, 36, 28, 0.07)',
        'wah-hover': '0 12px 30px -6px rgba(43, 36, 28, 0.12)',
        'caramel-glow': '0 8px 24px -4px rgba(154, 106, 53, 0.25)',
      },
    },
  },
  plugins: [],
};

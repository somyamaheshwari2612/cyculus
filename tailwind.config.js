/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7B5EA7',
          hover: '#694B96',
          soft: '#F1EAFD',
          light: '#FAF6FE',
        },
        blush: {
          DEFAULT: '#FDEEF2',
          dark: '#F8D7E0',
          soft: '#FFF6F8',
        },
        ink: {
          DEFAULT: '#2E2140',
          muted: '#75678A',
          light: '#A79AB8',
          faint: '#EBE3EF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          bg: '#FAF5F7',
          subtle: '#FDF9FA',
          border: '#F0E6EE',
        },
        // Pastel tint backings matching showcase mockup
        tint: {
          rose: '#FDEEF2',
          roseText: '#B8506E',
          lavender: '#F1EAFD',
          lavenderText: '#7B5EA7',
          peach: '#FEF2E8',
          peachText: '#B86F3B',
          mint: '#EBF8F2',
          mintText: '#3B916E',
        },
        // Clinical severity tokens
        severity: {
          info: '#3B82F6',
          'info-bg': '#EFF6FF',
          discuss: '#8B5CF6',
          'discuss-bg': '#F5F3FF',
          soon: '#F59E0B',
          'soon-bg': '#FEF3C7',
          urgent: '#EF4444',
          'urgent-bg': '#FEE2E2',
        },
        // Flow indicator colors
        flow: {
          none: '#E8E1EA',
          spotting: '#F9A8D4',
          light: '#F472B6',
          medium: '#E11D48',
          heavy: '#9F1239',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"DM Serif Display"', '"Playfair Display"', 'Georgia', 'serif'],
        devanagari: ['Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 8px 24px -4px rgba(123, 94, 167, 0.16)',
        'card': '0 4px 25px rgba(46, 33, 64, 0.04)',
        'float': '0 10px 30px -5px rgba(46, 33, 64, 0.08)',
        'sheet': '0 -8px 30px rgba(46, 33, 64, 0.12)',
        'pill': '0 2px 10px rgba(46, 33, 64, 0.05)',
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      }
    },
  },
  plugins: [],
}

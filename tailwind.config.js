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
          soft: '#E9DFF5',
          light: '#F4EFFB',
        },
        blush: {
          DEFAULT: '#FBEAF0',
          dark: '#F5C9D7',
          soft: '#FFF5F8',
        },
        ink: {
          DEFAULT: '#2B2140',
          muted: '#6E6280',
          light: '#A59BB5',
          faint: '#D6D0DF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          bg: '#FDF7F9',
          subtle: '#FAF4F7',
          border: '#EFE7F0',
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
          none: '#E2E8F0',
          spotting: '#F9A8D4',
          light: '#F472B6',
          medium: '#E11D48',
          heavy: '#9F1239',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', '-apple-system', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(123, 94, 167, 0.08)',
        'card': '0 2px 12px rgba(43, 33, 64, 0.04)',
        'sheet': '0 -8px 30px rgba(43, 33, 64, 0.12)',
        'glow': '0 0 25px rgba(123, 94, 167, 0.25)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}

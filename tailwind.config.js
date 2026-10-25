/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        plum: 'var(--plum)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          soft: 'var(--primary-soft)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        lavender: 'var(--lavender)',
        rose: {
          DEFAULT: 'var(--rose)',
          soft: 'var(--rose-soft)',
          deep: 'var(--rose-deep)',
        },
        sage: {
          DEFAULT: 'var(--sage)',
          soft: 'var(--sage-soft)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
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
      },
      fontFamily: {
        sans: ['Figtree', 'Inter', 'Noto Sans Devanagari', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Times New Roman', 'serif'],
        serif: ['"Cormorant Garamond"', 'Times New Roman', 'serif'],
        devanagari: ['"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: 'var(--shadow-soft-v)',
        lift: 'var(--shadow-lift-v)',
      },
      borderRadius: {
        'xl': 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': 'calc(var(--radius) + 12px)',
      }
    },
  },
  plugins: [],
}

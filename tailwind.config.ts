import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        grotesk: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          container: '#d93820',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          container: '#ff8a00',
        },
        tertiary: {
          DEFAULT: '#059669',
          foreground: '#ffffff',
          container: '#00855d',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        surface: {
          DEFAULT: '#FAF8F5',
          dim: '#ECE7E1',
          bright: '#FAF8F5',
          lowest: '#ffffff',
          low: '#F7F4EF',
          container: '#F1EDE6',
          high: '#EBE5DC',
          highest: '#E4DDD2',
        },
        'on-surface': {
          DEFAULT: '#1E1A17',
          variant: '#58524C',
        },
        'inverse-surface': '#2D2824',
        'inverse-on-surface': '#F6F1EA',
        outline: {
          DEFAULT: '#8C8379',
          variant: '#E3DCD3',
        },
        vermilion: {
          DEFAULT: '#FF5338',
          dark: '#D9381E',
        },
        tangerine: '#FF8A00',
        viridian: '#059669',
      },
      borderRadius: {
        '2xl': '1rem',
        xl: '0.75rem',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        tactile: '0 3px 0 #D9381E',
        'tactile-pressed': '0 1px 0 #D9381E',
        'card-lift': '0 4px 0 rgba(30, 26, 23, 0.04), 0 8px 18px -4px rgba(255, 83, 56, 0.08)',
        'card-lift-hover': '0 8px 0 rgba(30, 26, 23, 0.06), 0 16px 24px -4px rgba(255, 83, 56, 0.14)',
      },
    },
  },
  plugins: [],
}

export default config

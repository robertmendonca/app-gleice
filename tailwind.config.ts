import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#1F1F1F',
          foreground: '#FFFFFF'
        },
        muted: {
          DEFAULT: '#F5F5F5',
          foreground: '#6B6B6B'
        },
        accent: {
          DEFAULT: '#D4AF37',
          foreground: '#1F1F1F'
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', ...fontFamily.sans],
        serif: ['"Cormorant Garamond"', ...fontFamily.serif]
      },
      borderRadius: {
        xl: '1.5rem'
      },
      boxShadow: {
        soft: '0 20px 45px -20px rgba(15, 23, 42, 0.35)'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};

export default config;

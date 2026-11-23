import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta del panel de administracion
        brand: {
          50:  '#f1f8e9',
          100: '#dcedc8',
          200: '#c5e1a5',
          300: '#aed581',
          400: '#9ccc65',
          500: '#8bc34a',
          600: '#7cb342',
          700: '#558b2f',
          800: '#33691e',
          900: '#1b5e20',
          950: '#0a2e0a',
        },
        // Paleta del catalogo publico
        cream: {
          DEFAULT: '#F4F0E6',
          100: '#FBF9F4',
          200: '#ECE6D8',
          300: '#E0D8C5',
        },
        sand: '#E9DFCB',
        ink: {
          DEFAULT: '#1B2A21',
          soft: '#46564B',
          muted: '#77847B',
        },
        forest: {
          DEFAULT: '#234530',
          dark: '#173022',
          light: '#2F5B40',
        },
        lime: {
          DEFAULT: '#9DBF3A',
          soft: '#E3EBC6',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem', // 72px — para pt-18 en el layout admin mobile
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'sheet-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(24px, 18px) scale(1.08)' },
        },
        'pulse-soft': {
          '0%, 100%': { transform: 'scale(0.92)', opacity: '0.6' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'scale(0.6)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'modal-in': {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.96)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'sheet-up': 'sheet-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.25s ease-out both',
        float: 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 9s linear infinite',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'pop-in': 'pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'modal-in': 'modal-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}

export default config

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
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
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem', // 72px — para pt-18 en el layout admin mobile
      },
    },
  },
  plugins: [],
}

export default config

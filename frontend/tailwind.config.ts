import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f0ff',
          100: '#e0e0ff',
          200: '#c7c7fe',
          300: '#a5a5fc',
          400: '#8b85f8',
          500: '#7c6cf1',
          600: '#6d50e6',
          700: '#5e3ed4',
          800: '#4d32b0',
          900: '#3f2b8d',
        },
        bg: {
          void: '#050510',
          deep: '#0a0a1a',
          surface: '#12122a',
          elevated: '#1a1a3e',
        },
        accent: {
          gold: '#fbbf24',
          amber: '#f59e0b',
          emerald: '#34d399',
          rose: '#fb7185',
          sky: '#38bdf8',
          violet: '#a78bfa',
        },
      },
      fontFamily: {
        display: ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
        body: ['SF Pro Text', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124, 108, 241, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(124, 108, 241, 0.5)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
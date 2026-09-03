/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0a0b0d',
          900: '#0e1013',
          850: '#121417',
          800: '#17191d',
          700: '#1f2226',
          600: '#2a2d32',
          500: '#3a3e44',
        },
        ink: {
          100: '#e8e9ea',
          200: '#c7c9cc',
          300: '#9a9da3',
          400: '#6f7278',
          500: '#54575c',
        },
        thermal: {
          DEFAULT: '#e0402f',
          dim: '#7a2a22',
          bright: '#ff5a3c',
        },
        risk: {
          critical: '#e0402f',
          high: '#d97a2b',
          medium: '#c9a227',
          low: '#4f8a5b',
        },
        live: '#3fae5c',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.8s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bell-shake': 'bell-shake 1.6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '80%, 100%': { transform: 'scale(1.9)', opacity: '0' },
        },
        'bell-shake': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '10%': { transform: 'rotate(-12deg)' },
          '20%': { transform: 'rotate(10deg)' },
          '30%': { transform: 'rotate(-8deg)' },
          '40%': { transform: 'rotate(6deg)' },
          '50%': { transform: 'rotate(-4deg)' },
          '60%': { transform: 'rotate(2deg)' },
          '70%': { transform: 'rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
};

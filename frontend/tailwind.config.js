/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutral surface scale. 950 = page canvas (off-white), 900 = card
        // surface (white), descending toward 500 = strongest border/divider.
        base: {
          950: '#f4f5f7',
          900: '#ffffff',
          850: '#f8f9fb',
          800: '#eef0f3',
          700: '#e2e4e9',
          600: '#cdd1d7',
          500: '#a8adb6',
        },
        // Text scale. 100 = primary text (near-black), 500 = most muted
        // label text — same emphasis ordering as before, lighter palette.
        ink: {
          100: '#12151a',
          200: '#30343b',
          300: '#4b5058',
          400: '#6b7078',
          500: '#8a8f97',
        },
        thermal: {
          DEFAULT: '#dc2626',
          dim: '#fecaca',
          bright: '#b91c1c',
        },
        risk: {
          critical: '#dc2626',
          high: '#c2410c',
          medium: '#a16207',
          low: '#15803d',
        },
        live: '#15803d',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'Roboto', '"Helvetica Neue"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
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

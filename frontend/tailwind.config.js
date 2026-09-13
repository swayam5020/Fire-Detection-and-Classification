/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutral surface scale. 950 = page canvas (dark charcoal, not pure
        // black), 900 = card surface (a shade lighter than the canvas),
        // ascending toward 500 = strongest border/divider.
        base: {
          950: '#0d0f12',
          900: '#15181c',
          850: '#1b1f24',
          800: '#20242a',
          700: '#2a2f36',
          600: '#3a4048',
          500: '#565d66',
        },
        // Text scale. 100 = primary text (near-white), 500 = most muted
        // label text — same emphasis ordering as before, dark palette.
        ink: {
          100: '#f1f2f4',
          200: '#d4d7db',
          300: '#aeb2b8',
          400: '#888e96',
          500: '#666d76',
        },
        thermal: {
          DEFAULT: '#ef4444',
          dim: '#7f1d1d',
          bright: '#f87171',
        },
        risk: {
          critical: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          low: '#22c55e',
        },
        live: '#22c55e',
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

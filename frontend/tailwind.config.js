/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutral surface scale, exact hex values from the design key.
        // 950 = page background, 900 = card background, 850 = input/inset,
        // 800 = divider, 700 = card border. 600/500 are derived, darker
        // steps of the same tan family for stronger interactive borders —
        // the key doesn't specify those two, everything else is verbatim.
        base: {
          950: '#E8E1C9', // Page Background
          900: '#F4EFD6', // Card Background
          850: '#EFE6C2', // Input / Inset
          800: '#D8CFB8', // Divider
          700: '#C9C1A7', // Card Border
          600: '#B3A480',
          500: '#96875F',
        },
        // Text scale, exact hex from the key at 100/300/500; 200/400 are
        // interpolated steps between them for components that need a
        // mid-weight tone.
        ink: {
          100: '#0B2A2A', // Primary Text
          200: '#284845',
          300: '#446660', // Secondary Text
          400: '#5F7873',
          500: '#7A8A86', // Muted Text
        },
        sidebar: {
          DEFAULT: '#E1D9C3', // Sidebar Background
          hover: '#D6CEB8', // Sidebar Hover
        },
        // Brand teal. DEFAULT doubles as Button Primary / Sidebar Active;
        // `header` is the distinct, darker "Card Header" teal used by the
        // "// SECTION" bars and table header rows.
        accent: {
          DEFAULT: '#0F5B56', // Brand / Button Primary / Sidebar Active
          dark: '#0B3D3A', // Brand Dark
          light: '#1E7A74', // Brand Light
          hover: '#0F796F', // Button Hover
          header: '#0B4D48', // Card Header
        },
        // Bright teal-green used only for the map's own glow accents and
        // the ESP32 ground-sensor card (a technical/hardware reading that
        // deliberately never borrows the risk-red palette).
        'map-accent': '#00E5A8',
        thermal: {
          DEFAULT: '#E63946', // Critical — also the SOS/alert accent
          dim: '#FED7D7', // Alert Background Light
        },
        risk: {
          critical: '#E63946',
          high: '#F97316',
          medium: '#FFBF24',
          low: '#22C55E',
        },
        live: '#22C55E',
      },
      fontFamily: {
        mono: ['"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
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

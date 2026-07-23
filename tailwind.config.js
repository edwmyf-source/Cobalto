/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // Paleta Cobalto — escala coherente de navy a azul claro
        brand: {
          50:  '#F4F7FD',
          100: '#EBF1FC',
          200: '#DDE7FA',
          300: '#B8CBEF',
          400: '#4C82F0',
          500: '#2C6BD4',
          600: '#0047AB',
          700: '#0B2E68',
          800: '#081F4A',
          900: '#0A2A5C',
        },
        // Neutros con tinte azulado, coherentes con el fondo E4EBF7
        ink: {
          0:   '#FFFFFF',
          50:  '#F4F7FD',
          100: '#EBF1FC',
          200: '#DDE7FA',
          300: '#C9D9F2',
          400: '#8FA3C7',
          500: '#5578AD',
          600: '#33456B',
          700: '#1E3358',
          800: '#12213D',
          900: '#0A2A5C',
        },
        success: { 50: '#f0fdf4', 500: '#22c55e', 700: '#15803d' },
        warn:    { 50: '#fffbeb', 500: '#f59e0b', 700: '#b45309' },
        danger:  { 50: '#fef2f2', 500: '#ef4444', 600: '#dc2626' },
        accent:  { 50: '#EBF1FC', 500: '#2C6BD4', 600: '#0047AB' },
        sidebar: '#081F4A',
      },
    },
  },
  plugins: [],
}

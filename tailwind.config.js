/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#e8eaf6',
          100: '#c5cae9',
          200: '#9fa8da',
          300: '#7986cb',
          400: '#5c6bc0',
          500: '#3949ab',
          600: '#1a237e',
          700: '#0d1b3e',
        },
        ink: {
          900: '#0d1b3e',
          500: '#5c6376',
          400: '#9fa8da',
          300: '#c5cae9',
          200: '#e8eaef',
          100: '#f0f2f8',
        },
        success: { 50: '#f0fdf4', 500: '#22c55e', 700: '#15803d' },
        warn:    { 50: '#fffbeb', 500: '#f59e0b', 700: '#b45309' },
        danger:  { 50: '#fef2f2', 500: '#ef4444' },
        sidebar: '#0d1b3e',
      },
    },
  },
  plugins: [],
}

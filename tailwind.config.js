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
          50:  '#FAF7F5',
          100: '#B8CBB6',
          200: '#8FAE8B',
          300: '#8FAE8B',
          400: '#2F5233',
          500: '#5C1A2E',
          600: '#5C1A2E',
          700: '#5C1A2E',
        },
        ink: {
          900: '#5C1A2E',
          800: '#4A1425',
          700: '#7D2B41',
          600: '#3E5C58',
          500: '#4A5C5A',
          400: '#B09499',
          300: '#D0AEB4',
          200: '#EEE3E5',
          100: '#F5EFF1',
          50:  '#FAF7F5',
          0:   '#ffffff',
        },
        success: { 50: '#f0fdf4', 500: '#22c55e', 700: '#15803d' },
        warn:    { 50: '#fffbeb', 500: '#f59e0b', 700: '#b45309' },
        danger:  { 50: '#fef2f2', 500: '#ef4444' },
        accent:  { 50: '#E8F0E7', 500: '#2F5233', 600: '#24421F' },
        sidebar: '#5C1A2E',
      },
    },
  },
  plugins: [],
}

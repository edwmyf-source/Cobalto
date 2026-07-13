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
          50:  '#F2F7FF',
          100: '#A7D8FF',
          200: '#7EB6FF',
          300: '#7EB6FF',
          400: '#2F5AA8',
          500: '#001A3D',
          600: '#001A3D',
          700: '#001A3D',
        },
        ink: {
          900: '#001A3D',
          800: '#0a2247',
          700: '#132C58',
          600: '#3E4A66',
          500: '#4A5262',
          400: '#5D8BC7',
          300: '#B8C9E0',
          200: '#DDE7F4',
          100: '#EDF3FB',
          50:  '#F2F7FF',
          0:   '#ffffff',
        },
        success: { 50: '#f0fdf4', 500: '#22c55e', 700: '#15803d' },
        warn:    { 50: '#fffbeb', 500: '#f59e0b', 700: '#b45309' },
        danger:  { 50: '#fef2f2', 500: '#ef4444' },
        accent:  { 50: '#FFF6E0', 500: '#FFB703', 600: '#E6A200' },
        sidebar: '#001A3D',
      },
    },
  },
  plugins: [],
}

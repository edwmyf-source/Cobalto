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
          50:  '#FFFFFF',
          100: '#B8CBEF',
          200: '#6B87B8',
          300: '#6B87B8',
          400: '#2C6BD4',
          500: '#0047AB',
          600: '#0047AB',
          700: '#0047AB',
        },
        ink: {
          900: '#0047AB',
          800: '#000000',
          700: '#2C6BD4',
          600: '#3E5C58',
          500: '#4A5C5A',
          400: '#3A5590',
          300: '#B8CBEF',
          200: '#D6E2F5',
          100: '#F5F8FD',
          50:  '#FFFFFF',
          0:   '#ffffff',
        },
        success: { 50: '#f0fdf4', 500: '#22c55e', 700: '#15803d' },
        warn:    { 50: '#fffbeb', 500: '#f59e0b', 700: '#b45309' },
        danger:  { 50: '#fef2f2', 500: '#ef4444' },
        accent:  { 50: '#FBE5E5', 500: '#2C6BD4', 600: '#24421F' },
        sidebar: '#0047AB',
      },
    },
  },
  plugins: [],
}

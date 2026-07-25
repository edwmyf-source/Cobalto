/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // Superficies y fondos
        app:      'var(--bg-app)',
        subtle:   'var(--bg-subtle)',
        surface:  'var(--surface)',
        raised:   'var(--surface-raised)',

        // Texto
        ink: {
          DEFAULT: 'var(--text-primary)',
          0:   '#FFFFFF',
          50:  '#F5F7FA',
          100: '#EEF1F6',
          200: '#E3E8EF',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },

        // Acento Cobalto
        brand: {
          DEFAULT: 'var(--accent)',
          50:  '#F1F6FE',
          100: '#E4EDFB',
          200: '#C7DAF6',
          300: '#9CBEEE',
          400: '#5B8FE0',
          500: '#2C6BD4',
          600: '#1A5AC8',
          700: '#17509F',
          800: '#0B2E68',
          900: '#081F4A',
        },

        line:      'var(--border)',
        'line-soft':'var(--border-soft)',

        success: { DEFAULT: 'var(--success)', bg: 'var(--success-bg)' },
        warning: { DEFAULT: 'var(--warning)', bg: 'var(--warning-bg)' },
        danger:  { DEFAULT: 'var(--error)',   bg: 'var(--error-bg)'   },
        info:    { DEFAULT: 'var(--info)',    bg: 'var(--info-bg)'    },
      },
      spacing: {
        // Escala estricta 4 / 8 / 12 / 16 / 24 / 32 / 48
        1: '4px', 2: '8px', 3: '12px', 4: '16px', 6: '24px', 8: '32px', 12: '48px',
      },
      borderRadius: {
        input: 'var(--r-input)',
        btn:   'var(--r-btn)',
        card:  'var(--r-card)',
        panel: 'var(--r-panel)',
        modal: 'var(--r-modal)',
      },
      boxShadow: {
        card:       'var(--shadow-card)',
        'card-hover':'var(--shadow-card-hover)',
        raised:     'var(--shadow-raised)',
        dropdown:   'var(--shadow-dropdown)',
        modal:      'var(--shadow-modal)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

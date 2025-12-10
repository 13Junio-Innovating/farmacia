import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        foreground: '#0f172a',
        muted: {
          DEFAULT: '#64748b',
          foreground: '#64748b',
        },
        primary: {
          DEFAULT: '#10b981',
        },
      },
      borderRadius: {
        xl: '16px',
      },
    },
  },
  plugins: [],
} satisfies Config

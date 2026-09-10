import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream:  '#F5F1EA',
        ink:    '#0F1417',
        gold:   '#D4A24C',
        muted:  '#8A8A8A',
        line:   '#E5E1D8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      maxWidth: {
        shell: '1240px',
      },
    },
  },
  plugins: [],
} satisfies Config

import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream:    '#F5F1EA',
        ink:      '#0F1417',
        'ink-700': '#1E262B',   // dark surface (search bar background)
        'ink-600': '#2A3339',
        gold:     '#D4A24C',
        'gold-light': '#E6BE6E',
        muted:    '#8A8A8A',
        line:     '#E5E1D8',
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

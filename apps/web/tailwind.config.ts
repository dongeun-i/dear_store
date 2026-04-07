import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      colors: {
        primary: '#b90a5a',
        'primary-container': '#ff4d8d',
        'primary-fixed': '#ffd9e0',
        'on-primary': '#ffffff',
        secondary: '#00677f',
        'secondary-container': '#00ccf9',
        'secondary-fixed': '#b7eaff',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#005266',
        background: '#fef8fa',
        surface: '#fef8fa',
        'surface-container-low': '#f3f4f6',
        'surface-container': '#f8f8f8',
        'surface-container-high': '#ece7e9',
        'surface-container-lowest': '#ffffff',
        'surface-dim': '#ded9db',
        'inverse-surface': '#323031',
        'on-surface': '#1d1b1d',
        'on-surface-variant': '#594046',
        'outline-variant': '#e1bec5',
        error: '#ba1a1a',
        cyan: '#00D1FF',
      },
      boxShadow: {
        card: '0 8px 32px rgba(185,10,90,0.06)',
        float: '0 16px 48px rgba(185,10,90,0.10)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #b90a5a 0%, #ff4d8d 100%)',
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      })
    }),
  ],
}

export default config

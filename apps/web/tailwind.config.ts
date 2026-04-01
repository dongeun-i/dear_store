import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#FFB3C1',
          'pink-dark': '#FF8FA3',
          slate: '#4A4E69',
          'slate-light': '#6B7099',
        },
      },
    },
  },
  plugins: [],
}

export default config

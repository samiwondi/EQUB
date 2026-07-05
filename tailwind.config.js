/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a1628',
          800: '#122240',
          700: '#1a2f57',
          600: '#23406e',
          500: '#2c5085',
        },
        gold: {
          DEFAULT: '#c9a84c',
          dark: '#a8893a',
        },
      },
    },
  },
  plugins: [],
}
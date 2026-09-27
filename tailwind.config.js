/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'slate-850': '#151d2f',
        card: {
          dark: 'rgba(30, 31, 38, 0.6)',
        },
        flux: {
          primary: '#8b5cf6',
          'primary-hover': '#7c3aed',
          accent: '#c084fc',
          success: '#10b981',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
        },
      },
    },
  },
  plugins: [],
}

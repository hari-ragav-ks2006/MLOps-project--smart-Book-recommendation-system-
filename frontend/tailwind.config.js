/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        aardvark: {
          yellow: '#FAED8F',
          'yellow-light': '#FDF9D9',
          'yellow-deep': '#F5DE5D',
          cream: '#FCFAF6',
          'cream-2': '#F4EFE6',
          ink: '#141416',
          'ink-muted': '#585860',
          cobalt: '#1F3DF5',
          coral: '#FF4A32',
          lilac: '#E3D9FF',
          mint: '#D2F5E3',
          clay: '#EADBCE',
        },
        brand: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#8b5cf6',
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#5b21b6',
        },
      },
      boxShadow: {
        'neo': '3px 3px 0px #141416',
        'neo-sm': '2px 2px 0px #141416',
        'neo-lg': '5px 5px 0px #141416',
        'neo-yellow': '4px 4px 0px #FAED8F',
        'card': '0 2px 10px rgba(20,20,22,0.06)',
        'card-hover': '0 20px 40px rgba(20,20,22,0.12)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}

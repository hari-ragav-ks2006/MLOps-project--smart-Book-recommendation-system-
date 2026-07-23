/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
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
        surface: {
          DEFAULT: '#ffffff',
          2: '#f8f7f4',
          3: '#f1efe9',
        },
        bg: '#f8f7f4',
      },
      backgroundImage: {
        'gradient-hero': 'radial-gradient(ellipse at 20% 40%, rgba(124,58,237,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(79,70,229,0.05) 0%, transparent 50%)',
        'gradient-primary': 'linear-gradient(135deg, #7c3aed, #4f46e5)',
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 20px 60px rgba(124,58,237,0.12), 0 4px 12px rgba(0,0,0,0.06)',
        'glow-sm':    '0 4px 20px rgba(124,58,237,0.20)',
        'glow-md':    '0 8px 32px rgba(124,58,237,0.28)',
        'input':      '0 1px 3px rgba(0,0,0,0.05)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease both',
        'slide-up':   'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'float':      'float 4s ease-in-out infinite',
        'shimmer':    'shimmer 1.8s infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float:   { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
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

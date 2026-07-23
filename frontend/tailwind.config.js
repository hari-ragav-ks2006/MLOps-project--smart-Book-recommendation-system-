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
          DEFAULT: '#0d1117',
          2: '#111827',
          3: '#1a2436',
        },
        bg: '#080b14',
      },
      backgroundImage: {
        'gradient-hero': 'radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.10) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(245,101,39,0.08) 0%, transparent 50%)',
        'gradient-card': 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(13,17,23,0) 60%)',
        'gradient-purple': 'linear-gradient(135deg, #8b5cf6, #6366f1)',
        'gradient-emerald': 'linear-gradient(135deg, #10b981, #059669)',
        'gradient-warm': 'linear-gradient(135deg, #f59e0b, #ef4444)',
        'gradient-rose': 'linear-gradient(135deg, #f43f5e, #ec4899)',
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(139,92,246,0.15)',
        'glow-md': '0 0 40px rgba(139,92,246,0.2)',
        'glow-lg': '0 0 80px rgba(139,92,246,0.15)',
        'card-hover': '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.1)',
        'book-hover': '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease both',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.8s infinite',
        'spin-slow': 'spin 4s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
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

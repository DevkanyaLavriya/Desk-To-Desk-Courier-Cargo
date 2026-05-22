/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-red': '#ff3b30',
        'dark-navy': '#111827',
        'deep-bg': '#080b11',
        'accent-cyan': '#00d4ff',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.35)',
        'glass-light': '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
        'neon-cyan': '0 0 20px rgba(0, 212, 255, 0.25)',
        'neon-red': '0 0 20px rgba(255, 59, 48, 0.25)',
        'border-glow': 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}


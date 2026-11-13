/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        parking: {
          dark: '#0a0f1d',
          darker: '#060a15',
          card: '#111827',
          cardBorder: '#1e293b',
          cardHover: '#1f2937',
          electric: '#2563eb',
          electricHover: '#1d4ed8',
          accent: '#38bdf8',
          available: '#10b981',
          occupied: '#ef4444',
          waiting: '#f59e0b',
          sync: '#8b5cf6',
          muted: '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slot-pop': 'slotPop 0.4s ease-out forwards',
      },
      keyframes: {
        slotPop: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}

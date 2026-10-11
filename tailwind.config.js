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
        rizkey: {
          bg: '#20211D',
          surface: '#272824',
          surfaceHover: '#2E2F2A',
          border: '#353630',
          yellow: '#E6C76B',
          yellowHover: '#F0D47C',
          yellowDark: '#C7A84B',
          text: '#ECEBE4',
          subtext: '#989A92',
          muted: '#62645D',
          correct: '#5DBE76',
          incorrect: '#E55858',
          extra: '#B34242',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Roboto Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        pulseSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'caret-blink': 'blink 1s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        fadeIn: 'fadeIn 0.2s ease-out forwards',
        scaleIn: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        slideInRight: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
}

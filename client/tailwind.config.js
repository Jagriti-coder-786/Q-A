/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: {
          bg: '#070A13',
          'bg-secondary': '#0A0F1C',
          surface: '#0D1220',
          'surface-elevated': '#131A2A',
          'surface-hover': '#172033',
          border: 'rgba(148, 163, 184, 0.14)',
          'border-hover': 'rgba(148, 163, 184, 0.25)',
        },
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#6D5EF7',
          700: '#5B4DE0',
          800: '#4C3EC7',
          900: '#3C329E',
          950: '#161338',
          primary: '#6D5EF7',
          highlight: '#A78BFA',
          accent: '#22D3EE'
        },
        accent: {
          cyan: '#22D3EE',
          violet: '#A78BFA',
          emerald: '#34D399',
          amber: '#FBBF24',
          rose: '#FB7185'
        }
      },
      boxShadow: {
        'aurora': '0 0 60px -15px rgba(109, 94, 247, 0.25)',
        'aurora-cyan': '0 0 60px -15px rgba(34, 211, 238, 0.2)',
        'surface': '0 4px 20px -2px rgba(0, 0, 0, 0.6)',
        'elevated': '0 12px 32px -4px rgba(0, 0, 0, 0.75)'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}

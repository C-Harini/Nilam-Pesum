/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F5EFE6',
          300: '#EBE1D3',
        },
        soil: {
          100: '#EFEBE9',
          200: '#D7CCC8',
          300: '#BCAAA4',
          600: '#6D4C41',
          700: '#5C4033',
          800: '#4A3525',
          900: '#3E2723',
        },
        semman: {
          100: '#FCEBE6',
          300: '#E59B8B',
          500: '#B84A39',
          700: '#8B3A2B',
          900: '#5C2218',
        },
        field: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#1E5128',
          700: '#194522',
          800: '#14381C',
          900: '#0F2B15',
        },
        wheat: {
          100: '#FEF3C7',
          200: '#FDE68A',
          400: '#FBBF24',
          500: '#E9A128',
          600: '#D4A343',
          700: '#B45309',
        },
        skyaccent: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        }
      },
      fontFamily: {
        tamil: ['"Anek Tamil"', '"Noto Sans Tamil"', 'Inter', 'sans-serif'],
        sans: ['"Noto Sans Tamil"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Anek Tamil"', 'Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'tactile': '0 4px 14px 0 rgba(74, 53, 37, 0.08)',
        'tactile-hover': '0 8px 24px 0 rgba(74, 53, 37, 0.14)',
        'tactile-active': '0 2px 8px 0 rgba(74, 53, 37, 0.12)',
      }
    },
  },
  plugins: [],
}

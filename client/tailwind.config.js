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
          200: '#F5F0E8',
          300: '#EBE3D5',
        },
        soil: {
          100: '#EFEBE9',
          300: '#BCAAA4',
          600: '#6D4C41',
          700: '#5C4033',
          800: '#4A3525',
          900: '#3E2723',
        },
        field: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
          700: '#2E6F40',
          800: '#1E4D2B',
          900: '#14381E',
        },
        wheat: {
          100: '#FEF3C7',
          200: '#FDE68A',
          400: '#FBBF24',
          500: '#D4A343',
          600: '#B45309',
          700: '#92400E',
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
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
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

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#263C31',
          light: '#365344',
          dark: '#182720',
        },
        ivory: {
          DEFAULT: '#F2F0E9',
          light: '#F9F8F5',
          dark: '#E7E3D8',
        },
        sage: {
          DEFAULT: '#B8C9B4',
          light: '#E2EAE0',
          dark: '#8FA58A',
        },
        earth: {
          DEFAULT: '#B88C70',
          light: '#D3ADA2',
          dark: '#8C6047',
        },
        charcoal: {
          DEFAULT: '#242824',
          light: '#3C423C',
          dark: '#141714',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(38, 60, 49, 0.08)',
        float: '0 20px 40px -15px rgba(24, 39, 32, 0.15)',
      },
    },
  },
  plugins: [],
};


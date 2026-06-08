/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#222733',
        paper: '#f8f4e9',
        shelf: '#e7dbc3',
        card: '#fffaf0',
        dispatch: '#174a72',
        stamp: '#b63f2d',
        brass: '#b4833b',
      },
      boxShadow: {
        slip: '0 8px 20px rgba(34, 39, 51, 0.10)',
      },
    },
  },
  plugins: [],
};

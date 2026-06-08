/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Essays1743', 'Cerebri Sans Pro', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Cerebri Sans Pro', 'Inter', 'Arial', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#3F3332',
        paper: '#F7F7F4',
        shelf: '#EFEEE8',
        card: '#F7F7F4',
        dispatch: '#A06455',
        stamp: '#7A4235',
        brass: '#77725F',
        olive: '#77725F',
        terracotta: '#A06455',
        navy: '#293B51',
        sand: '#D6C9A9',
        graphite: '#3F3332',
        black: '#050505',
        white: '#FFFFFF',
      },
      boxShadow: {
        slip: '0 4px 12px rgba(63, 51, 50, 0.08)',
        panel: '0 8px 24px rgba(63, 51, 50, 0.10)',
        button: '0 6px 16px rgba(122, 66, 53, 0.20)',
      },
    },
  },
  plugins: [],
};

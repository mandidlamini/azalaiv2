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
        ink: '#000000',
        paper: '#F4F0EA',
        shelf: '#B6AB9B',
        card: '#FFFFFF',
        dispatch: '#000000',
        stamp: '#000000',
        brass: '#B6AB9B',
        olive: '#B6AB9B',
        terracotta: '#B6AB9B',
        navy: '#000000',
        sand: '#F4F0EA',
        graphite: '#000000',
        black: '#000000',
        white: '#FFFFFF',
      },
      boxShadow: {
        slip: '0 8px 18px rgba(0, 0, 0, 0.08)',
        panel: '0 18px 48px rgba(0, 0, 0, 0.14)',
        button: '0 10px 22px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
};

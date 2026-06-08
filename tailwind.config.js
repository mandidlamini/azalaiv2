/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Providence Sans', 'Cerebri Sans Pro', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Cerebri Sans Pro', 'Inter', 'Arial', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#4A4947',
        paper: '#F9F7F0',
        shelf: '#D8D2C2',
        card: '#F9F7F0',
        dispatch: '#B17457',
        stamp: '#B17457',
        brass: '#77765F',
        olive: '#77765F',
        terracotta: '#C89478',
      },
      boxShadow: {
        slip: '0 4px 12px rgba(74, 73, 71, 0.08)',
        panel: '0 8px 24px rgba(74, 73, 71, 0.10)',
        button: '0 6px 16px rgba(177, 116, 87, 0.22)',
      },
    },
  },
  plugins: [],
};

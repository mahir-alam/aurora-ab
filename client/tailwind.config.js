/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        aurora: {
          bg:     '#0a0e1a',
          green:  '#00ff88',
          purple: '#8b5cf6',
          card:   '#111827',
          border: '#1f2937',
        },
      },
    },
  },
  plugins: [],
};

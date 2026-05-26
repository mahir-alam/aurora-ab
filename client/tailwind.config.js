/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        aurora: {
          bg:     '#0a0d14',
          green:  '#00ff9d',
          purple: '#b266ff',
          card:   '#131722',
          border: '#1e2638',
        },
      },
    },
  },
  plugins: [],
};

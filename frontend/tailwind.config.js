/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0B2545',
          navyDark: '#061629',
          navyLight: '#133E6D',
          saffron: '#FF9933',
          saffronDark: '#D97706',
          green: '#138808',
          greenDark: '#0D5F06',
          ash: '#F4F6F9',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

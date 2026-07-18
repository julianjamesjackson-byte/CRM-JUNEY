/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'healthcare-teal': '#0D5C75',
        'healthcare-blue': '#2563EB',
        'healthcare-cyan': '#06B6D4',
        'healthcare-emerald': '#10B981',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        customGray: '#697787',
        primaryColor: '#ED4A43',
        hover: '#D43C35',
      }
    },
  },
  plugins: [],
};

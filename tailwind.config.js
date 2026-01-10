/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",       // scan your app folder
    "./components/**/*.{js,ts,jsx,tsx}", // scan your components
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "sans-serif"],      // default font-sans
        mono: ["Roboto Mono", "monospace"],  // default font-mono
      },
    },
  },
  plugins: [],
};

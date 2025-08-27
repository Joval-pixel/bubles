/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bgDark: "#0b0f1a",
        bgLight: "#f9fafb",
        cardDark: "#111827",
        cardLight: "#ffffff",
        accent: "#2563eb"
      }
    }
  },
  plugins: []
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["system-ui", "sans-serif"]
      }
    }
  },
  darkMode: "class",
  plugins: []
};


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#41BCE2",
        secondary: "#FFCB05",
        accent: "#E3350D",
        background: "#1B2A4A",
        foreground: "#FFFFFF",
        muted: "#A8B8D8",
        panel: "#253248",
        navy: "#1B2A4A",
        gold: "#FFCB05",
        capture: "#E3350D",
        sky: "#41BCE2",
      },
    },
  },
  plugins: [],
};

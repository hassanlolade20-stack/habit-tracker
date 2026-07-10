/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./screens/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#FBDCC0',
        primary: '#C1502E',
        secondary: '#E8A87C',
        accent: '#FF7A3C',
        textDark: '#2B1B12',
        textMuted: '#8B6F5C',
        card: '#FFF8F0',
      },
    },
  },
  plugins: [],
};


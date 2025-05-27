/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "green-light": "#6ee7b7", // light green
        "green-dark": "#065f46", // dark green
        "green-accent": "#34d399", // accent for buttons
      },
      boxShadow: {
        "3d": "0 4px 0 0 #065f46, 0 8px 24px 0 rgba(6,95,70,0.15)", // 3D effect for buttons
        card: "0 2px 8px 0 rgba(6,95,70,0.10)", // subtle card shadow
      },
      gradientColorStops: (theme) => ({
        ...theme("colors"),
        "green-light": "#6ee7b7",
        "green-dark": "#065f46",
      }),
    },
  },
  plugins: [],
};

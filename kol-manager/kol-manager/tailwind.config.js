/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#12161A",
          soft: "#39424B",
          mute: "#6B7681",
          line: "#DCDFE3",
        },
        canvas: "#ECEDEF",
        surface: "#FFFFFF",
        jade: {
          DEFAULT: "#0E7C66",
          deep: "#0A5B4B",
          wash: "#E4F2EE",
        },
        tier: {
          nano: "#8A94A0",
          micro: "#0E7C66",
          macro: "#6D4AE0",
          mega: "#B4790A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        data: ["var(--font-data)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,22,26,.06), 0 8px 24px -18px rgba(18,22,26,.28)",
        pop: "0 24px 60px -20px rgba(18,22,26,.35)",
      },
    },
  },
  plugins: [],
};

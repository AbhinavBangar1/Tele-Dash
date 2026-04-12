/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Syne'", "sans-serif"],
      },
      colors: {
        void: "#080b10",
        panel: "#0d1117",
        border: "#1a2030",
        accent: "#00f5a0",
        warn: "#f5a623",
        danger: "#ff4757",
        muted: "#4a5568",
        dim: "#8892a4",
      },
      animation: {
        pulse_slow: "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        blink: "blink 1s step-end infinite",
      },
      keyframes: {
        blink: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

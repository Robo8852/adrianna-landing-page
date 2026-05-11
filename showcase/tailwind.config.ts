import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "ink-green": "#0B3B36",
        gold: "#C9A961",
        "gold-warm": "#D9BE7E",
        parchment: "#F3EEDA",
        "shadow-ink": "#061F1C",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-eb-garamond)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orbit: {
          ivory: "#FBF8F3",
          paper: "#F4EFEA",
          card: "#FFFFFF",
          border: "#E8E2D8",
          "border-strong": "#D5CBC0",
          brown: "#241C15",
          subtle: "#54483C",
          muted: "#887C70",
          gold: "#C5A869",
          "gold-light": "#F7F2E7",
          "gold-dark": "#9A7A3E",
          navy: "#0F2847",
          "navy-dark": "#0A1D33",
          "navy-deep": "#0D2238",
          "navy-light": "#1C3E68",
          "navy-muted": "#38567A",
          sky: "#EAF1F8",
        },
      },
      fontFamily: {
        serif: ["Newsreader", "Playfair Display", "Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

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
          ivory: "#FBF9F5",
          paper: "#F5F0EB",
          card: "#FFFFFF",
          border: "#EAE3D9",
          "border-strong": "#D8CEBF",
          brown: "#241C15",
          subtle: "#54483C",
          muted: "#887C70",
          gold: "#B89758",
          "gold-light": "#F3EBDD",
          "gold-dark": "#9A7A3E",
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

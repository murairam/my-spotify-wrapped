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
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: "var(--accent)",
        "accent-dim": "var(--accent-dim)",
        card: "var(--bg-card)",
        "card-hover": "var(--bg-card-hover)",
        "input": "var(--bg-input)",
      },
      boxShadow: {
        glow: "0 0 18px rgba(0,191,255,0.25), 0 0 4px rgba(0,191,255,0.15)",
        "glow-sm": "0 0 8px rgba(0,191,255,0.2)",
        "glow-lg": "0 0 32px rgba(0,191,255,0.3), 0 0 8px rgba(0,191,255,0.2)",
      },
    },
  },
  plugins: [],
};
export default config;

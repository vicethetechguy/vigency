import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#050505",
        surface: "#111111",
        yellow: "#F9C80E",
        pink: "#E91EAE",
        orange: "#FF6A2A",
        purple: "#B05CFF",
      },
      fontFamily: {
        display: ["var(--font-space)", "sans-serif"],
        body: ["var(--font-montserrat)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 18px 80px rgba(233,30,174,.22)",
      },
    },
  },
  plugins: [],
} satisfies Config;

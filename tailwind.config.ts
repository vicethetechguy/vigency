import type { Config } from "tailwindcss";

/*
 * Vigency brand tokens.
 * Original yellow, orange, pink and purple palette on dark surfaces.
 * Fonts read from CSS variables set in app/globals.css (see app/layout.tsx).
 */
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
        line: "rgba(255,255,255,0.08)",
        accent: "#E91EAE",
        pink: "#E91EAE",
        yellow: "#F9C80E",
        orange: "#FF6A2A",
        purple: "#B05CFF",
      },
      fontFamily: {
        sans: ["var(--font-body)"],
        body: ["var(--font-body)"],
        display: ["var(--font-display)"],
      },
      borderRadius: {
        DEFAULT: "20px",
        brand: "20px",
        "brand-lg": "28px",
        "brand-sm": "14px",
      },
      boxShadow: {
        soft: "0 1px 0 rgba(255,255,255,.06) inset, 0 12px 40px rgba(0,0,0,.45)",
        glow: "0 18px 80px rgba(233,30,174,.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;

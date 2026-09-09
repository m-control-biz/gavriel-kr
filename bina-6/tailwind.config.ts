import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        slatebg: "#0F172A",
        cyan1: "#00F2FE",
        cyan2: "#4FACFE",
      },
      fontFamily: {
        heebo: ["var(--font-heebo)", "Arial", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(0, 242, 254, 0.18)",
        "glow-sm": "0 0 18px rgba(79, 172, 254, 0.28)",
      },
      backgroundImage: {
        "cyber-gradient": "linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)",
      },
    },
  },
  plugins: [],
};

export default config;

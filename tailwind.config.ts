import type { Config } from "tailwindcss";

// Ahenk Live "Radiant" — derin lacivert + elektrik camgöbeği + altın premium
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#050B14",
        surface: "#0A111F",
        "surface-2": "#0d141d",
        elevated: "#151c26",
        line: "rgba(255,255,255,0.08)",
        text: "#dce3f0",
        muted: "#8b97a8",
        primary: "#00E5FF",
        "primary-soft": "#9cf0ff",
        secondary: "#B6C4FF",
        gold: "#F2C94C",
        "gold-2": "#F2994A",
        success: "#34d399",
        danger: "#FFB4AB",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        glow: "0 0 24px -2px rgba(0,229,255,0.45)",
        "glow-sm": "0 0 16px -4px rgba(0,229,255,0.5)",
        gold: "0 0 24px -4px rgba(242,201,76,0.4)",
        card: "0 18px 40px -24px rgba(0,0,0,0.9)",
      },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(14px)" }, "100%": { opacity: "1", transform: "none" } },
        "pulse-dot": { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.35" } },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "pulse-dot": "pulse-dot 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

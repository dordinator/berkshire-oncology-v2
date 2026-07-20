import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Brand navy — #061c46 at the core, with lighter blues for accents/tints.
        ink: {
          DEFAULT: "#061c46",
          soft: "#123056",
          muted: "#5a6884",
        },
        canvas: {
          DEFAULT: "#fafbfc",
          soft: "#eef2f7",
          warm: "#f5f7fa",
        },
        accent: {
          DEFAULT: "#1a4d8f",
          soft: "#3f6fb0",
          glow: "#9fb9dc",
        },
        // Soft cool tints used for the mesh/gradient stops (kept names for reuse).
        lilac: "#aec6e6",
        peach: "#cbdcee",
        mint: "#cfe1e6",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      fontSize: {
        "10xl": "10rem",
      },
      letterSpacing: {
        tightest: "-0.06em",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        marquee: "marquee 30s linear infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

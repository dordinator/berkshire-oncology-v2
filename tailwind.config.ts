import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Canonical brand palette. Public-facing components should use these
        // names instead of one-off hex values so every route draws from the
        // same navy/blue, sage and gold families.
        ink: {
          DEFAULT: "#061c46",
          soft: "#123056",
          muted: "#5a6884",
        },
        canvas: {
          DEFAULT: "#fafbfc",
          soft: "#eef2f7",
          warm: "#f8f8f4",
        },
        accent: {
          DEFAULT: "#1a4d8f",
          soft: "#3f6fb0",
          glow: "#9fb9dc",
          mist: "color-mix(in srgb, #1a4d8f 12%, white)",
        },
        sage: {
          DEFAULT: "#5c7767",
          deep: "color-mix(in srgb, #5c7767 82%, #061c46)",
          mid: "color-mix(in srgb, #5c7767 82%, white)",
          soft: "color-mix(in srgb, #5c7767 68%, white)",
          panel: "color-mix(in srgb, #5c7767 32%, white)",
          mist: "color-mix(in srgb, #5c7767 18%, white)",
          wash: "color-mix(in srgb, #5c7767 10%, white)",
        },
        gold: {
          DEFAULT: "#c8992f",
          ink: "#8a6516",
          soft: "#e3bd6a",
          panel: "#f3dca2",
        },
        paper: {
          DEFAULT: "#fbfaf5",
          soft: "#f8f8f4",
        },
        section: {
          warm: "#f0ece2",
          cool: "#e7edf1",
        },
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

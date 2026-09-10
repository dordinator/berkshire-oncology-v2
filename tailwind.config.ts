import type { Config } from "tailwindcss";
import { palette } from "./src/lib/designTokens";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Shared with CSS variables and canvas; never define a second palette.
        ink: { DEFAULT: palette.ink, muted: palette.inkMuted, soft: palette.inkSoft },
        canvas: { DEFAULT: palette.canvas, soft: palette.canvasSoft, warm: palette.paperSoft },
        accent: {
          DEFAULT: palette.accent,
          soft: palette.accentSoft,
          glow: palette.accentGlow,
          mist: palette.accentMist,
        },
        sage: {
          DEFAULT: palette.sage,
          ink: palette.sageInk,
          deep: palette.sageDeep,
          mid: palette.sageMid,
          soft: palette.sageSoft,
          panel: palette.sagePanel,
          mist: palette.sageMist,
          wash: palette.sageWash,
        },
        mulberry: {
          DEFAULT: palette.mulberry,
          ink: palette.mulberryInk,
          soft: palette.mulberrySoft,
          panel: palette.mulberryPanel,
        },
        // Compatibility for older compositions that still use the old name.
        gold: {
          DEFAULT: palette.mulberry,
          ink: palette.mulberryInk,
          soft: palette.mulberrySoft,
          panel: palette.mulberryPanel,
        },
        paper: { DEFAULT: palette.paper, soft: palette.paperSoft },
        section: { warm: palette.sectionWarm, cool: palette.sectionCool },
        ice: palette.ice,
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
        lg: "var(--radius-button)",
        xl: "var(--radius-panel)",
        "2xl": "var(--radius-panel)",
        "3xl": "var(--radius-panel)",
        "4xl": "var(--radius-panel)",
        panel: "var(--radius-panel)",
        button: "var(--radius-button)",
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

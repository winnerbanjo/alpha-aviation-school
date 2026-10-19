/** @type {import('tailwindcss').Config} */

// Alpha Step Links brand palette (Brand Standards, Edition 01).
// The blue/indigo/slate/gray scales are remapped onto it so every existing
// screen — marketing pages and dashboards alike — inherits the brand system.
const brandBlue = {
  50: "#F2F6FF",
  100: "#DCE8FF",
  200: "#BFD2FF",
  300: "#8EAEFF",
  400: "#5B86FF",
  500: "#1246C8",
  600: "#1246C8",
  700: "#0F3BAA",
  800: "#10264B",
  900: "#10264B",
  950: "#07152E",
};

const brandNeutral = {
  50: "#F5F7FB",
  100: "#EEF2F8",
  200: "#DCE2EB",
  300: "#C3CCDA",
  400: "#8C9AB0",
  500: "#53647C",
  600: "#44546C",
  700: "#2D3E59",
  800: "#172B49",
  900: "#10264B",
  950: "#07152E",
};

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Inter", "sans-serif"],
      },
      colors: {
        blue: brandBlue,
        indigo: brandBlue,
        slate: brandNeutral,
        gray: brandNeutral,
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
        brand: {
          blue: "#1246C8",
          signal: "#5B86FF",
          navy: "#10264B",
          night: "#07152E",
          sky: "#DCE8FF",
          light: "#DCE8FF",
          paper: "#F5F7FB",
          ink: "#172B49",
          muted: "#53647C",
          line: "#DCE2EB",
          gold: "#AA8546",
        },
      },
      letterSpacing: {
        tightest: "-0.035em",
        tighter: "-0.025em",
        tight: "-0.015em",
        widest: "0.15em",
        tracked: "0.2em",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(16, 38, 75, 0.05), 0 1px 2px rgba(16, 38, 75, 0.03)",
        card: "0 4px 20px -2px rgba(16, 38, 75, 0.06), 0 2px 6px -1px rgba(16, 38, 75, 0.04)",
        elevated: "0 12px 36px -4px rgba(16, 38, 75, 0.1), 0 4px 12px -2px rgba(16, 38, 75, 0.06)",
        float: "0 30px 80px -20px rgba(7, 21, 46, 0.45), 0 12px 30px -12px rgba(7, 21, 46, 0.3)",
        glow: "0 0 24px -2px rgba(18, 70, 200, 0.25)",
        "glow-lg": "0 20px 60px -10px rgba(18, 70, 200, 0.55)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: "12px",
        small: "4px",
        panel: "20px",
        stage: "28px",
      },
      keyframes: {
        pulseRadar: {
          "0%": { transform: "scale(0.95)", opacity: "0.8" },
          "50%": { transform: "scale(1.05)", opacity: "0.3" },
          "100%": { transform: "scale(0.95)", opacity: "0.8" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        marquee: {
          "0%": { transform: "translate3d(0,0,0)" },
          "100%": { transform: "translate3d(-50%,0,0)" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        scrollCue: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(200%)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0.25" },
        },
        progress: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        dash: {
          to: { strokeDashoffset: "0" },
        },
      },
      animation: {
        radar: "pulseRadar 4s ease-in-out infinite",
        scan: "scanLine 6s linear infinite",
        marquee: "marquee 40s linear infinite",
        "marquee-slow": "marquee 70s linear infinite",
        float: "floatY 6s ease-in-out infinite",
        "scroll-cue": "scrollCue 2.2s cubic-bezier(.6,0,.4,1) infinite",
        blink: "blink 1.4s steps(1) infinite",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

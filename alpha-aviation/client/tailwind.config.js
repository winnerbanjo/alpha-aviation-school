/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Gill Sans", "Gill Sans MT", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["Libre Baskerville", "serif"],
      },
      colors: {
        blue: {
          50: "#F4F7FF",
          100: "#E7EEFF",
          200: "rgb(var(--brand-light-blue) / <alpha-value>)",
          300: "#7F9FF0",
          400: "#456BD5",
          500: "rgb(var(--brand-blue) / <alpha-value>)",
          600: "rgb(var(--brand-blue) / <alpha-value>)",
          700: "rgb(var(--brand-navy) / <alpha-value>)",
          800: "rgb(var(--brand-navy) / <alpha-value>)",
          900: "rgb(var(--brand-navy) / <alpha-value>)",
          950: "rgb(var(--brand-navy) / <alpha-value>)",
        },
        indigo: {
          50: "#F4F7FF",
          100: "#E7EEFF",
          200: "rgb(var(--brand-light-blue) / <alpha-value>)",
          300: "#7F9FF0",
          400: "#456BD5",
          500: "rgb(var(--brand-blue) / <alpha-value>)",
          600: "rgb(var(--brand-blue) / <alpha-value>)",
          700: "rgb(var(--brand-navy) / <alpha-value>)",
          800: "rgb(var(--brand-navy) / <alpha-value>)",
          900: "rgb(var(--brand-navy) / <alpha-value>)",
          950: "rgb(var(--brand-navy) / <alpha-value>)",
        },
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
          navy: "rgb(var(--brand-navy) / <alpha-value>)",
          blue: "rgb(var(--brand-blue) / <alpha-value>)",
          light: "rgb(var(--brand-light-blue) / <alpha-value>)",
          gold: "rgb(var(--brand-gold) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

import type React from "react"
import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Registers the brand design tokens from tailwind.config.js so overrides such as
// `shadow-none` or `rounded-xl` replace `shadow-glow` / `rounded-panel` correctly.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      shadow: [{ shadow: ["subtle", "card", "elevated", "float", "glow", "glow-lg"] }],
      rounded: [{ rounded: ["card", "small", "panel", "stage"] }],
      tracking: [{ tracking: ["tightest", "tracked"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNGN(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatGBP(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Stagger helper for scroll reveals: style={revealDelay(120)} */
export function revealDelay(ms: number): React.CSSProperties {
  return { ["--d" as string]: `${ms}ms` } as React.CSSProperties
}

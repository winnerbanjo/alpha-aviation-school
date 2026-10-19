import { BrandLogo } from "@/components/layout/BrandLogo";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Kept for existing call sites; the approved lockup always includes the wordmark. */
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "color" | "white";
}

const widths = {
  sm: "w-[176px]",
  md: "w-[212px]",
  lg: "w-[248px]",
};

/** Approved Alpha Step Links horizontal lockup with the Aviation School descriptor. */
export function Logo({ className = "", size = "md", variant = "color" }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <BrandLogo tone={variant === "white" ? "white" : "blue"} className={widths[size]} />
    </span>
  );
}

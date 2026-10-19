import { cn } from "@/lib/utils";

interface BrandLogoProps {
  tone: "white" | "blue";
  className?: string;
  subheading?: string;
  /** Hide the image from assistive tech when a sibling already announces the brand */
  decorative?: boolean;
}

/*
 * Lockup geometry, in the master logo's own 680×190 coordinate space
 * (measured from the rendered artwork):
 *   emblem ink    x 21–168.5; solid base to y 143, corner tips at y 146,
 *                 only the book-spine point continues to y 148.5
 *   wordmark ink  x 195.3–643, caps y 79.5–118.5 (cap height 39);
 *                 the "L" of LINKS ends at x 531.8
 * Descriptor rules:
 *   - cap height = ½ the wordmark cap (Inter 600, 26u)
 *   - baseline on the emblem's optical base (corner tips), not the spine point
 *   - left ink flush with the wordmark "A"; tracking fitted so the final "L"
 *     of SCHOOL ends exactly under the "L" of LINKS
 * Units are artwork units, so the descriptor scales exactly with the logo.
 */
const LOCKUP = {
  x: 195,
  baseline: 147,
  fontSize: 26,
  tracking: 0.287, // em
  weight: 600,
};

/**
 * Approved Alpha Step Links horizontal logo with the division descriptor set
 * beneath the wordmark. The master artwork itself is never altered.
 */
export function BrandLogo({ tone, className, subheading = "Aviation School", decorative = false }: BrandLogoProps) {
  return (
    <span className={cn("relative block", className)}>
            <img
        src={tone === "white" ? "/images/brand/asl-horizontal-white.png" : "/images/brand/asl-horizontal-blue.png"}
        alt={decorative ? "" : `Alpha Step Links ${subheading}`}
        width={680}
        height={190}
        className="block h-auto w-full"
      />
      <svg viewBox="0 0 680 190" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <text
          x={LOCKUP.x}
          y={LOCKUP.baseline}
          fontSize={LOCKUP.fontSize}
          fontWeight={LOCKUP.weight}
          letterSpacing={LOCKUP.tracking * LOCKUP.fontSize}
          fill={tone === "white" ? "#DCE8FF" : "#10264B"}
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {subheading.toUpperCase()}
        </text>
      </svg>
    </span>
  );
}

import type { FlagCode } from "@/lib/certificates/template";
import { CERT_COLORS as C } from "@/lib/certificates/template";
import { CERT_FONT } from "@/lib/certificates/fonts";
import { measureText } from "@/lib/certificates/layout";

// Decorative building blocks for the certificate artwork. Everything is plain
// SVG so it renders identically on screen, in PNG and in PDF exports.

const star = (cx: number, cy: number, outer: number, inner = outer * 0.42) => {
  const points: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    points.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return points.join(" ");
};

export function Star({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  return <polygon points={star(cx, cy, r)} fill={fill} />;
}

/** Characters laid along a circle, upright for the top arc and the bottom arc. */
export function RingText({
  text,
  cx,
  cy,
  radius,
  side,
  family,
  weight,
  size,
  tracking,
  fill,
}: {
  text: string;
  cx: number;
  cy: number;
  radius: number;
  side: "top" | "bottom";
  family: string;
  weight: number;
  size: number;
  tracking: number;
  fill: string;
}) {
  const chars = [...text];
  const spec = { family, weight, size };
  const widths = chars.map((ch) => (ch === " " ? size * 0.32 : measureText(ch, spec)));
  const gap = tracking * size;
  const total = widths.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
  const center = side === "top" ? -Math.PI / 2 : Math.PI / 2;
  const dir = side === "top" ? 1 : -1;
  let cursor = 0;
  return (
    <g fill={fill} fontFamily={family} fontWeight={weight} fontSize={size}>
      {chars.map((ch, i) => {
        const mid = center + dir * (-(total / 2) + cursor + widths[i] / 2) / radius;
        cursor += widths[i] + gap;
        if (ch === " ") return null;
        const x = cx + radius * Math.cos(mid);
        const y = cy + radius * Math.sin(mid);
        const rotate = (mid * 180) / Math.PI + (side === "top" ? 90 : -90);
        return (
          <text
            key={i}
            x={x.toFixed(2)}
            y={y.toFixed(2)}
            textAnchor="middle"
            transform={`rotate(${rotate.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)})`}
          >
            {ch}
          </text>
        );
      })}
    </g>
  );
}

/**
 * Gold corner flourish drawn for the top-left corner; mirrored for the others.
 * `compact` keeps only the outer bracket, for corners next to dense content.
 */
export function CornerOrnament({ transform, gold, compact = false }: { transform?: string; gold: string; compact?: boolean }) {
  const reach = compact ? 122 : 168;
  return (
    <g transform={transform} fill="none" stroke={gold} strokeLinecap="round">
      <path d={`M58 ${reach} V58 H${reach}`} strokeWidth={3} />
      {!compact && (
        <>
          <path d="M70 128 V70 H128" strokeWidth={1.2} opacity={0.8} />
          <path d="M58 92 C78 92 92 78 92 58" strokeWidth={1.4} opacity={0.85} />
          <path d="M84 58 C84 72 72 84 58 84" strokeWidth={1} opacity={0.6} />
          <circle cx={128} cy={70} r={2} fill={gold} stroke="none" />
          <circle cx={70} cy={128} r={2} fill={gold} stroke="none" />
        </>
      )}
      <rect x={51} y={51} width={14} height={14} transform="rotate(45 58 58)" fill={gold} stroke="none" />
      <circle cx={reach} cy={58} r={3.6} fill={gold} stroke="none" />
      <circle cx={58} cy={reach} r={3.6} fill={gold} stroke="none" />
    </g>
  );
}

/**
 * Straight rule drawn as a thin rect. A gradient-stroked <line> would vanish:
 * its bounding box has zero width or height, so bounding-box gradients can't paint it.
 */
export function Rule({
  x1,
  y1,
  x2,
  y2,
  thickness,
  fill,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
  fill: string;
}) {
  const vertical = x1 === x2;
  return vertical ? (
    <rect x={x1 - thickness / 2} y={Math.min(y1, y2)} width={thickness} height={Math.abs(y2 - y1)} fill={fill} />
  ) : (
    <rect x={Math.min(x1, x2)} y={y1 - thickness / 2} width={Math.abs(x2 - x1)} height={thickness} fill={fill} />
  );
}

/** Small diamond-and-rule divider. */
export function Flourish({ cx, y, width, gold }: { cx: number; y: number; width: number; gold: string }) {
  const half = width / 2;
  return (
    <g stroke={gold} fill={gold}>
      <line x1={cx - half} y1={y} x2={cx - 16} y2={y} strokeWidth={1.4} />
      <line x1={cx + 16} y1={y} x2={cx + half} y2={y} strokeWidth={1.4} />
      <rect x={cx - 5.5} y={y - 5.5} width={11} height={11} transform={`rotate(45 ${cx} ${y})`} stroke="none" />
      <circle cx={cx - 22} cy={y} r={2.2} stroke="none" />
      <circle cx={cx + 22} cy={y} r={2.2} stroke="none" />
      <circle cx={cx - half} cy={y} r={2.6} stroke="none" />
      <circle cx={cx + half} cy={y} r={2.6} stroke="none" />
    </g>
  );
}

/** Ink-trimmed crop of the 2048² brand symbol PNG, as fractions of the image. */
const SYMBOL_CROP = { x: 0.07, y: 0.185, w: 0.86, h: 0.625 };

export function BrandSymbol({
  href,
  x,
  y,
  width,
  opacity,
}: {
  href: string;
  x: number;
  y: number;
  width: number;
  opacity?: number;
}) {
  const height = width * (SYMBOL_CROP.h / SYMBOL_CROP.w);
  const S = 1000;
  return (
    <svg
      x={x}
      y={y}
      width={width}
      height={height}
      viewBox={`${SYMBOL_CROP.x * S} ${SYMBOL_CROP.y * S} ${SYMBOL_CROP.w * S} ${SYMBOL_CROP.h * S}`}
      preserveAspectRatio="xMidYMid meet"
      opacity={opacity}
      overflow="hidden"
    >
      <image href={href} width={S} height={S} />
    </svg>
  );
}

BrandSymbol.aspect = SYMBOL_CROP.h / SYMBOL_CROP.w;

/** Institution emblem: navy roundel, gold rings, ring lettering and the white brand mark. */
export function InstitutionSeal({
  cx,
  cy,
  symbolHref,
  ids,
}: {
  cx: number;
  cy: number;
  symbolHref: string;
  ids: { navy: string; gold: string };
}) {
  const symbolWidth = 104;
  const symbolHeight = symbolWidth * BrandSymbol.aspect;
  return (
    <g>
      <circle cx={cx} cy={cy} r={106} fill={`url(#${ids.navy})`} />
      <circle cx={cx} cy={cy} r={101} fill="none" stroke={`url(#${ids.gold})`} strokeWidth={3.5} />
      <circle cx={cx} cy={cy} r={75} fill="none" stroke={`url(#${ids.gold})`} strokeWidth={1.6} />
      <circle cx={cx} cy={cy} r={71} fill={C.night} opacity={0.35} />
      <RingText
        text="ALPHA STEP LINKS"
        cx={cx}
        cy={cy}
        radius={83}
        side="top"
        family={CERT_FONT.display}
        weight={700}
        size={15}
        tracking={0.2}
        fill={C.goldLight}
      />
      <RingText
        text="AVIATION SCHOOL"
        cx={cx}
        cy={cy}
        radius={94}
        side="bottom"
        family={CERT_FONT.display}
        weight={700}
        size={15}
        tracking={0.2}
        fill={C.goldLight}
      />
      <Star cx={cx - 88} cy={cy + 1} r={5.5} fill={C.goldLight} />
      <Star cx={cx + 88} cy={cy + 1} r={5.5} fill={C.goldLight} />
      <BrandSymbol href={symbolHref} x={cx - symbolWidth / 2} y={cy - symbolHeight / 2 - 4} width={symbolWidth} />
    </g>
  );
}

/** Scalloped gold rosette: "Global Skills · Real Opportunities". */
export function GoldRosette({
  cx,
  cy,
  r,
  ids,
}: {
  cx: number;
  cy: number;
  r: number;
  ids: { gold: string; goldDeep: string };
}) {
  const teeth = 44;
  const points: string[] = [];
  for (let i = 0; i < teeth * 2; i += 1) {
    const radius = i % 2 === 0 ? r : r * 0.92;
    const a = (i * Math.PI) / teeth;
    points.push(`${(cx + radius * Math.cos(a)).toFixed(2)},${(cy + radius * Math.sin(a)).toFixed(2)}`);
  }
  return (
    <g>
      <circle cx={cx + 3} cy={cy + 5} r={r} fill={C.night} opacity={0.12} />
      <polygon points={points.join(" ")} fill={`url(#${ids.gold})`} />
      <circle cx={cx} cy={cy} r={r * 0.84} fill={`url(#${ids.goldDeep})`} />
      <circle cx={cx} cy={cy} r={r * 0.8} fill="none" stroke={C.goldLight} strokeWidth={1.4} />
      <circle cx={cx} cy={cy} r={r * 0.56} fill="none" stroke={C.goldLight} strokeWidth={0.9} strokeDasharray="1.5 3" />
      <RingText
        text="GLOBAL SKILLS"
        cx={cx}
        cy={cy}
        radius={r * 0.6}
        side="top"
        family={CERT_FONT.display}
        weight={700}
        size={r * 0.165}
        tracking={0.14}
        fill="#FFF6DF"
      />
      <text
        x={cx}
        y={cy + r * 0.02}
        textAnchor="middle"
        fontFamily={CERT_FONT.sans}
        fontWeight={800}
        fontSize={r * 0.15}
        letterSpacing={r * 0.012}
        fill="#FFF6DF"
      >
        REAL
      </text>
      <text
        x={cx}
        y={cy + r * 0.2}
        textAnchor="middle"
        fontFamily={CERT_FONT.sans}
        fontWeight={800}
        fontSize={r * 0.118}
        letterSpacing={r * 0.008}
        fill="#FFF6DF"
      >
        OPPORTUNITIES
      </text>
      {[-1, 0, 1].map((k) => (
        <Star key={k} cx={cx + k * r * 0.16} cy={cy + r * 0.42} r={r * 0.055} fill="#FFF6DF" />
      ))}
    </g>
  );
}

/** Brand globe with meridians and a gold orbit. */
export function Globe({ cx, cy, r, ids }: { cx: number; cy: number; r: number; ids: { globe: string; clip: string; gold: string } }) {
  return (
    <g>
      <clipPath id={ids.clip}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${ids.globe})`} />
      <g clipPath={`url(#${ids.clip})`} fill="none" stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={1.3}>
        <ellipse cx={cx} cy={cy} rx={r * 0.38} ry={r} />
        <ellipse cx={cx} cy={cy} rx={r * 0.75} ry={r} />
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} />
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} />
        <ellipse cx={cx} cy={cy - r * 0.62} rx={r} ry={r * 0.12} />
        <ellipse cx={cx} cy={cy + r * 0.62} rx={r} ry={r * 0.12} />
      </g>
      <circle cx={cx - r * 0.35} cy={cy - r * 0.4} r={r * 0.45} fill="#FFFFFF" opacity={0.08} />
      <ellipse
        cx={cx}
        cy={cy}
        rx={r * 1.38}
        ry={r * 0.36}
        transform={`rotate(-18 ${cx} ${cy})`}
        fill="none"
        stroke={`url(#${ids.gold})`}
        strokeWidth={2.4}
      />
      <circle cx={cx + r * 1.3} cy={cy - r * 0.45} r={3.4} fill={C.goldLight} />
    </g>
  );
}

const MAPLE =
  "M50 2 L56 14 L64 10 L62 32 L76 20 L80 28 L92 26 L86 42 L94 48 L72 64 L76 74 L54 70 L54 94 L46 94 L46 70 L24 74 L28 64 L6 48 L14 42 L8 26 L20 28 L24 20 L38 32 L36 10 L44 14 Z";

/** Simplified national flags (geometric, no coats of arms). */
export function Flag({ code, x, y, w, h, clipId }: { code: FlagCode; x: number; y: number; w: number; h: number; clipId: string }) {
  const body = (() => {
    switch (code) {
      case "eu": {
        const stars = Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          return (
            <Star
              key={i}
              cx={x + w / 2 + h * 0.33 * Math.cos(a)}
              cy={y + h / 2 + h * 0.33 * Math.sin(a)}
              r={h * 0.065}
              fill="#FFCC00"
            />
          );
        });
        return (
          <>
            <rect x={x} y={y} width={w} height={h} fill="#003399" />
            {stars}
          </>
        );
      }
      case "ca":
        return (
          <>
            <rect x={x} y={y} width={w} height={h} fill="#FFFFFF" />
            <rect x={x} y={y} width={w / 4} height={h} fill="#D52B1E" />
            <rect x={x + (w * 3) / 4} y={y} width={w / 4} height={h} fill="#D52B1E" />
            <path d={MAPLE} fill="#D52B1E" transform={`translate(${x + w / 2 - h * 0.31} ${y + h * 0.16}) scale(${(h * 0.62) / 100})`} />
          </>
        );
      case "es":
        return (
          <>
            <rect x={x} y={y} width={w} height={h} fill="#AA151B" />
            <rect x={x} y={y + h / 4} width={w} height={h / 2} fill="#F1BF00" />
          </>
        );
      case "it":
        return (
          <>
            <rect x={x} y={y} width={w / 3} height={h} fill="#009246" />
            <rect x={x + w / 3} y={y} width={w / 3} height={h} fill="#FFFFFF" />
            <rect x={x + (2 * w) / 3} y={y} width={w / 3} height={h} fill="#CE2B37" />
          </>
        );
      case "de":
        return (
          <>
            <rect x={x} y={y} width={w} height={h / 3} fill="#000000" />
            <rect x={x} y={y + h / 3} width={w} height={h / 3} fill="#DD0000" />
            <rect x={x} y={y + (2 * h) / 3} width={w} height={h / 3} fill="#FFCE00" />
          </>
        );
      case "nl":
        return (
          <>
            <rect x={x} y={y} width={w} height={h / 3} fill="#AE1C28" />
            <rect x={x} y={y + h / 3} width={w} height={h / 3} fill="#FFFFFF" />
            <rect x={x} y={y + (2 * h) / 3} width={w} height={h / 3} fill="#21468B" />
          </>
        );
      case "pt":
        return (
          <>
            <rect x={x} y={y} width={w} height={h} fill="#FF0000" />
            <rect x={x} y={y} width={w * 0.4} height={h} fill="#006600" />
            <circle cx={x + w * 0.4} cy={y + h / 2} r={h * 0.27} fill="none" stroke="#FFCC00" strokeWidth={h * 0.07} />
            <rect x={x + w * 0.4 - h * 0.11} y={y + h / 2 - h * 0.14} width={h * 0.22} height={h * 0.26} rx={h * 0.06} fill="#FFFFFF" stroke="#FF0000" strokeWidth={h * 0.03} />
          </>
        );
      default:
        return null;
    }
  })();
  return (
    <g>
      <clipPath id={clipId}>
        <rect x={x} y={y} width={w} height={h} rx={3} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>{body}</g>
      <rect x={x} y={y} width={w} height={h} rx={3} fill="none" stroke={C.navy} strokeOpacity={0.18} strokeWidth={1} />
    </g>
  );
}

/** Neutral monogram roundel for an accreditation body (no third-party artwork). */
export function MonogramBadge({ cx, cy, mark, gold }: { cx: number; cy: number; mark: string; gold: string }) {
  const size = mark.length > 3 ? 11.5 : 15;
  return (
    <g>
      <circle cx={cx} cy={cy} r={27} fill="#FFFFFF" stroke={C.navy} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={22} fill="none" stroke={gold} strokeWidth={1.1} />
      <text
        x={cx}
        y={cy + size * 0.36}
        textAnchor="middle"
        fontFamily={CERT_FONT.display}
        fontWeight={700}
        fontSize={size}
        letterSpacing={0.5}
        fill={C.navy}
      >
        {mark}
      </text>
    </g>
  );
}

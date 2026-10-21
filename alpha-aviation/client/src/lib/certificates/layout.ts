import { CERT_FONT } from "./fonts";
import { CONGRATULATIONS, DEFAULT_SIGNATORIES, TYPE_COPY, DELIVERY_LABELS } from "./template";
import type { CertificateArtworkData, Signatory } from "./types";
import { formatCertificateDate, printedName } from "./validation";

/** A4 landscape at 150 dpi. All artwork coordinates live in this space. */
export const CANVAS = { width: 1754, height: 1240 } as const;
export const CENTER_X = CANVAS.width / 2;

/** QR placement, shared by the artwork and the PDF exporter (clickable link area). */
export const QR_BOX = { x: 84, y: 932, size: 136 };

interface FontSpec {
  family: string;
  weight: number;
  style?: "normal" | "italic";
  size: number;
  /** em */
  letterSpacing?: number;
}

let measureCtx: CanvasRenderingContext2D | null = null;

const graphemeCount = (text: string) => {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    return Array.from(new Intl.Segmenter("en", { granularity: "grapheme" }).segment(text)).length;
  }
  return [...text].length;
};

export const measureText = (text: string, spec: FontSpec) => {
  if (!measureCtx && typeof document !== "undefined") {
    measureCtx = document.createElement("canvas").getContext("2d");
  }
  const tracking = (spec.letterSpacing ?? 0) * spec.size * Math.max(0, graphemeCount(text) - 1);
  if (!measureCtx) return text.length * spec.size * 0.6 + tracking;
  measureCtx.font = `${spec.style ?? "normal"} ${spec.weight} ${spec.size}px "${spec.family}"`;
  return measureCtx.measureText(text).width + tracking;
};

/** Largest size ≤ spec.size (and ≥ minSize) at which `text` fits on one line. */
export const fitSize = (text: string, spec: FontSpec, maxWidth: number, minSize: number) => {
  const width = measureText(text, spec);
  if (width <= maxWidth) return spec.size;
  return Math.max(minSize, Math.floor(spec.size * (maxWidth / width) * 2) / 2);
};

/** Greedy word wrap. A single word wider than the line is kept whole. */
export const wrapText = (text: string, spec: FontSpec, maxWidth: number) => {
  const words = text.split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && measureText(candidate, spec) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
};

/**
 * Word wrap that keeps the greedy line count but evens out line lengths, so a
 * paragraph never ends on a lone word ("…Communication in / Aviation)").
 */
export const wrapBalanced = (text: string, spec: FontSpec, maxWidth: number) => {
  const greedy = wrapText(text, spec, maxWidth);
  if (greedy.length < 2) return greedy;
  let lo = 0;
  let hi = maxWidth;
  for (let i = 0; i < 14; i += 1) {
    const mid = (lo + hi) / 2;
    if (wrapText(text, spec, mid).length <= greedy.length) hi = mid;
    else lo = mid;
  }
  return wrapText(text, spec, hi);
};

/** Splits words into two lines with the narrowest possible widest line. */
const balancedTwoLines = (text: string, spec: FontSpec): [string, string] => {
  const words = text.split(" ");
  let best: [string, string] = [text, ""];
  let bestWidth = Infinity;
  for (let i = 1; i < words.length; i += 1) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const widest = Math.max(measureText(a, spec), measureText(b, spec));
    if (widest < bestWidth) {
      bestWidth = widest;
      best = [a, b];
    }
  }
  return best;
};

export interface TextLine {
  text: string;
  y: number;
  /** Set only when the line still overflows at the minimum size: condense to this width. */
  compressTo?: number;
}

export interface CertificateLayout {
  title: { text: string; size: number };
  subtitle: string;
  subtitleHalfWidth: number;
  name: { lines: TextLine[]; size: number; condensed: boolean };
  rule: { y: number; halfWidth: number };
  lead: { text: string; y: number; size: number };
  programmes: { lines: TextLine[]; size: number };
  body: { lines: TextLine[]; size: number };
  congratulations: { text: string; y: number; size: number };
  meta: { serial: string; date: string; mode: string; valueSize: number };
  signatures: Array<Signatory & { script: string; scriptSize: number; nameSize: number }>;
}

const NAME_SPEC: FontSpec = { family: CERT_FONT.name, weight: 700, size: 66, letterSpacing: 0.02 };
const PROGRAMME_SPEC: FontSpec = { family: CERT_FONT.serif, weight: 600, size: 26 };
const BODY_SPEC: FontSpec = { family: CERT_FONT.serif, weight: 400, size: 20 };
const CONGRATS_SPEC: FontSpec = { family: CERT_FONT.serif, weight: 400, style: "italic", size: 21 };

export const LAYOUT_LIMITS = {
  nameWidth: 960,
  programmeWidth: 760,
  bodyWidth: 740,
  congratsWidth: 780,
  /** Baseline of "THIS IS TO CERTIFY THAT"; the flexible stack starts below it. */
  stackTop: 528,
  /** Lowest baseline the stack may use before the signature row. */
  stackBottom: 902,
};

const HONORIFICS = /^(dr|prof|professor|mr|mrs|ms|miss|engr|chief|sir|dame|rev|hon)\.?\s+/i;

const layoutName = (fullName: string) => {
  const text = printedName(fullName) || " ";
  const max = LAYOUT_LIMITS.nameWidth;
  // Only a line that still overflows at the minimum size is condensed; others keep natural spacing
  const condense = (line: string, size: number) =>
    measureText(line, { ...NAME_SPEC, size }) > max ? max : undefined;

  const singleSize = fitSize(text, NAME_SPEC, max, 30);
  if (singleSize >= 46 || !text.includes(" ")) {
    return { lines: [{ text, compressTo: condense(text, singleSize) }], size: singleSize };
  }
  const twoLineSpec = { ...NAME_SPEC, size: 54 };
  const [a, b] = balancedTwoLines(text, twoLineSpec);
  const size = Math.min(fitSize(a, twoLineSpec, max, 28), fitSize(b, twoLineSpec, max, 28));
  return {
    lines: [a, b].map((line) => ({ text: line, compressTo: condense(line, size) })),
    size,
  };
};

const layoutProgrammes = (programmes: string[]) => {
  const list = programmes.length ? programmes : ["Programme title"];
  const single = list.length === 1;
  const text = single ? list[0] : `(${list.join(", ")})`;
  const maxLines = single ? 2 : 3;
  let size = single ? 30 : PROGRAMME_SPEC.size;
  const minSize = 19;
  let lines = wrapText(text, { ...PROGRAMME_SPEC, size }, LAYOUT_LIMITS.programmeWidth);
  while (lines.length > maxLines && size > minSize) {
    size -= 0.5;
    lines = wrapText(text, { ...PROGRAMME_SPEC, size }, LAYOUT_LIMITS.programmeWidth);
  }
  return { lines: wrapBalanced(text, { ...PROGRAMME_SPEC, size }, LAYOUT_LIMITS.programmeWidth), size };
};

/**
 * Computes every measured position on the certificate. Fonts must be loaded
 * (see ensureCertificateFonts) or measurements fall back to estimates.
 */
export const computeCertificateLayout = (data: CertificateArtworkData): CertificateLayout => {
  const copy = TYPE_COPY[data.type] ?? TYPE_COPY.completion;

  const titleSpec: FontSpec = { family: CERT_FONT.display, weight: 700, size: 108, letterSpacing: 0.05 };
  const title = { text: "CERTIFICATE", size: fitSize("CERTIFICATE", titleSpec, 900, 80) };

  const name = layoutName(data.fullName);
  const programmes = layoutProgrammes(data.programmes);
  const congratsSize = fitSize(CONGRATULATIONS, CONGRATS_SPEC, LAYOUT_LIMITS.congratsWidth, 15);

  // Vertical stack. Gaps shrink, then body copy shrinks, until it clears the signature row.
  const baseGaps = [36, 22, 36, 16, 16, 14];
  const place = (squeeze: number, bodySize: number) => {
    const gap = baseGaps.map((g) => g * squeeze);
    const nameLineHeight = name.size * 1.14;
    const nameYs: number[] = [];
    let y = LAYOUT_LIMITS.stackTop + gap[0] + name.size * 0.72;
    name.lines.forEach((_, i) => nameYs.push(y + i * nameLineHeight));
    y = nameYs[nameYs.length - 1];
    const ruleY = y + gap[1];
    const leadY = ruleY + gap[2] + 24 * 0.7;
    const progLineHeight = programmes.size * 1.3;
    const progYs = programmes.lines.map((_, i) => leadY + gap[3] + programmes.size * 1.12 + i * progLineHeight);
    const bodyLines = wrapBalanced(copy.body, { ...BODY_SPEC, size: bodySize }, LAYOUT_LIMITS.bodyWidth);
    const bodyLineHeight = bodySize * 1.32;
    const bodyStart = progYs[progYs.length - 1] + gap[4] + bodySize * 1.3;
    const bodyYs = bodyLines.map((_, i) => bodyStart + i * bodyLineHeight);
    const congratsY = bodyYs[bodyYs.length - 1] + gap[5] + congratsSize * 1.5;
    return { nameYs, ruleY, leadY, progYs, bodyLines, bodyYs, congratsY, bodySize };
  };

  let placed = place(1, BODY_SPEC.size);
  for (const squeeze of [0.8, 0.6, 0.45]) {
    if (placed.congratsY <= LAYOUT_LIMITS.stackBottom) break;
    placed = place(squeeze, BODY_SPEC.size);
  }
  for (const bodySize of [18.5, 17]) {
    if (placed.congratsY <= LAYOUT_LIMITS.stackBottom) break;
    placed = place(0.45, bodySize);
  }

  const nameWidth = Math.max(
    ...name.lines.map((line) => line.compressTo ?? measureText(line.text, { ...NAME_SPEC, size: name.size })),
  );

  const metaSpec: FontSpec = { family: CERT_FONT.sans, weight: 600, size: 17 };
  const serial = data.serial || "Assigned on issue";
  const date = formatCertificateDate(data.completionDate) || "—";
  const mode = DELIVERY_LABELS[data.deliveryMode] ?? "—";
  const valueSize = Math.min(
    ...[serial, date, mode].map((v) => fitSize(v, metaSpec, 226, 12)),
  );

  const signatories = (data.signatories?.length ? data.signatories : DEFAULT_SIGNATORIES).slice(0, 2);
  const signatures = signatories.map((s) => {
    const script = s.name.replace(HONORIFICS, "");
    return {
      ...s,
      script,
      scriptSize: fitSize(script, { family: CERT_FONT.script, weight: 400, size: 54 }, 232, 30),
      nameSize: fitSize(s.name, { family: CERT_FONT.serif, weight: 600, size: 23 }, 250, 16),
    };
  });

  const subtitle = copy.subtitle.toUpperCase();
  const subtitleWidth = measureText(subtitle, { family: CERT_FONT.display, weight: 600, size: 30, letterSpacing: 0.3 });

  return {
    title,
    subtitle,
    subtitleHalfWidth: subtitleWidth / 2,
    name: {
      lines: name.lines.map((line, i) => ({ ...line, y: placed.nameYs[i] })),
      size: name.size,
      condensed: name.lines.some((line) => line.compressTo !== undefined),
    },
    rule: { y: placed.ruleY, halfWidth: Math.min(470, Math.max(250, nameWidth / 2 + 60)) },
    lead: { text: copy.lead, y: placed.leadY, size: 24 },
    programmes: {
      lines: programmes.lines.map((text, i) => ({ text, y: placed.progYs[i] })),
      size: programmes.size,
    },
    body: {
      lines: placed.bodyLines.map((text, i) => ({ text, y: placed.bodyYs[i] })),
      size: placed.bodySize,
    },
    congratulations: { text: CONGRATULATIONS, y: placed.congratsY, size: congratsSize },
    meta: { serial, date, mode, valueSize },
    signatures,
  };
};

/** All text that may need non-Latin font subsets. */
export const certificateText = (data: CertificateArtworkData) =>
  [data.fullName, ...data.programmes, ...(data.signatories ?? []).map((s) => `${s.name} ${s.title ?? ""} ${s.organisation ?? ""}`)].join(" ");

/** Hairline guilloché rosette used as a faint security background. */
let guillocheCache: string | null = null;
export const guillochePath = () => {
  if (guillocheCache) return guillocheCache;
  const parts: string[] = [];
  const rings = [
    { R: 300, a: 34, n: 14, curves: 12 },
    { R: 190, a: 20, n: 20, curves: 9 },
  ];
  for (const ring of rings) {
    for (let k = 0; k < ring.curves; k += 1) {
      const phase = (k * 2 * Math.PI) / (ring.curves * ring.n);
      let d = "";
      for (let step = 0; step <= 160; step += 1) {
        const t = (step / 160) * Math.PI * 2;
        const r = ring.R + ring.a * Math.sin(ring.n * t + phase * ring.n);
        const x = r * Math.cos(t);
        const y = r * Math.sin(t) * 0.82;
        d += `${step === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      parts.push(`${d}Z`);
    }
  }
  guillocheCache = parts.join("");
  return guillocheCache;
};

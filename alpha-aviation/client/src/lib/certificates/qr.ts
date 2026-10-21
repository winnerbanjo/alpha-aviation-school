import { create } from "qrcode";

export interface QrGeometry {
  /** Modules per side, excluding the quiet zone. */
  size: number;
  /** Path of all data modules in module units (finder patterns are drawn separately). */
  modulesPath: string;
  /** Top-left module coordinates of the three finder patterns. */
  finders: Array<[number, number]>;
  /** Centre logo window in module units, when one is safe to cut. */
  logo: { x: number; y: number; size: number } | null;
}

const cache = new Map<string, QrGeometry>();

/**
 * Encodes `text` at error-correction level H. The centre is cleared for the
 * brand mark only for versions 1–6, which have no alignment pattern in the
 * middle; larger codes stay intact so they always scan.
 */
export const buildQrGeometry = (text: string): QrGeometry => {
  const hit = cache.get(text);
  if (hit) return hit;

  const qr = create(text, { errorCorrectionLevel: "H" });
  const { size, data } = qr.modules as unknown as { size: number; data: Uint8Array };
  const dark = (r: number, c: number) => data[r * size + c] === 1;

  const inFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);

  let logo: QrGeometry["logo"] = null;
  if (qr.version <= 6) {
    let span = Math.round(size * 0.24);
    if (span % 2 === 0) span += 1;
    const start = (size - span) / 2;
    logo = { x: start, y: start, size: span };
  }
  const inLogo = (r: number, c: number) =>
    !!logo && r >= logo.y && r < logo.y + logo.size && c >= logo.x && c < logo.x + logo.size;

  let path = "";
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (!dark(r, c) || inFinder(r, c) || inLogo(r, c)) continue;
      path += `M${c} ${r}h1v1h-1z`;
    }
  }

  const geometry: QrGeometry = {
    size,
    modulesPath: path,
    finders: [
      [0, 0],
      [size - 7, 0],
      [0, size - 7],
    ],
    logo,
  };
  cache.set(text, geometry);
  return geometry;
};

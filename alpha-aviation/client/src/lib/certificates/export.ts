import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CertificateArtwork } from "@/components/certificates/artwork/CertificateArtwork";
import { loadAccreditationLogos, watermarkFor, type CertificateAssets, type CertificateWatermark } from "./preview";
import { embeddedFontCss, ensureCertificateFonts } from "./fonts";
import { CANVAS, QR_BOX, certificateText, computeCertificateLayout } from "./layout";
import { TYPE_COPY } from "./template";
import type { CertificateArtworkData } from "./types";
import { certificateFileStem } from "./validation";

const MM = { width: 297, height: 210 };

// ─── Assets ──────────────────────────────────────────────────────────────────

/** Loads a same-origin image and re-encodes it at a sensible size as a data URI. */
const imageToDataUrl = (src: string, maxSide: number) =>
  new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });

let assetsPromise: Promise<CertificateAssets> | null = null;

const embeddedAssets = () => {
  if (!assetsPromise) {
    assetsPromise = Promise.all([
      imageToDataUrl("/images/brand/asl-symbol-white.png", 1000),
      imageToDataUrl("/images/brand/asl-symbol-blue.png", 1000),
      loadAccreditationLogos(),
    ]).then(([symbolWhite, symbolBlue, accreditationLogos]) => ({ symbolWhite, symbolBlue, accreditationLogos }));
    assetsPromise.catch(() => {
      assetsPromise = null;
    });
  }
  return assetsPromise;
};

// ─── Rendering ───────────────────────────────────────────────────────────────

export interface ExportOptions {
  watermark?: CertificateWatermark;
}

/** Standalone SVG document with fonts and images inlined. */
export const renderCertificateSvg = async (data: CertificateArtworkData, options: ExportOptions = {}) => {
  const text = certificateText(data);
  await ensureCertificateFonts(text);
  const layout = computeCertificateLayout(data);
  const [assets, fontCss] = await Promise.all([embeddedAssets(), embeddedFontCss(text)]);
  const markup = renderToStaticMarkup(
    createElement(CertificateArtwork, {
      data,
      layout,
      assets,
      fontCss,
      watermark: options.watermark === undefined ? watermarkFor(data) : options.watermark,
      idPrefix: "asl",
    }),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>${markup}`;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const loadSvgImage = async (svg: string) => {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("The certificate image could not be rendered"));
      img.src = url;
    });
    // WebKit can paint an SVG image before its inlined fonts settle; a warm-up
    // draw plus a short pause makes the real draw use the right typefaces.
    const warm = document.createElement("canvas");
    warm.width = 8;
    warm.height = 8;
    warm.getContext("2d")!.drawImage(img, 0, 0, 8, 8);
    await wait(150);
    return { img, release: () => URL.revokeObjectURL(url) };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
};

/** Rasterises the certificate. Scale 2 ≈ 300 dpi on A4. */
export const renderCertificateCanvas = async (
  data: CertificateArtworkData,
  scale = 2,
  options: ExportOptions = {},
) => {
  const svg = await renderCertificateSvg(data, options);
  const { img, release } = await loadSvgImage(svg);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(CANVAS.width * scale);
    canvas.height = Math.round(CANVAS.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available in this browser");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    release();
  }
};

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode the certificate"))),
      type,
      quality,
    );
  });

// ─── Files ───────────────────────────────────────────────────────────────────

export const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
};

export const certificateFilename = (data: CertificateArtworkData, ext: "pdf" | "png" | "svg") =>
  `${certificateFileStem(data.serial, data.fullName)}.${ext}`;

const createPdf = async () => {
  const { jsPDF } = await import("jspdf");
  return new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
};

type Pdf = Awaited<ReturnType<typeof createPdf>>;

const addCertificatePage = (pdf: Pdf, canvas: HTMLCanvasElement, data: CertificateArtworkData, quality: number) => {
  pdf.addImage(canvas.toDataURL("image/jpeg", quality), "JPEG", 0, 0, MM.width, MM.height, undefined, "FAST");
  if (data.verifyUrl) {
    const k = MM.width / CANVAS.width;
    pdf.link(QR_BOX.x * k, QR_BOX.y * k, QR_BOX.size * k, QR_BOX.size * k, { url: data.verifyUrl });
  }
};

export const buildCertificatePdf = async (data: CertificateArtworkData, options: ExportOptions = {}) => {
  const [pdf, canvas] = await Promise.all([createPdf(), renderCertificateCanvas(data, 2, options)]);
  pdf.setProperties({
    title: `${TYPE_COPY[data.type].label} — ${data.fullName}`,
    subject: data.programmes.join("; "),
    author: "Alpha Step Links Aviation School",
    keywords: [data.serial, "certificate", "verification"].filter(Boolean).join(", "),
    creator: "ASL Certificate Registry",
  });
  addCertificatePage(pdf, canvas, data, 0.95);
  return pdf.output("blob");
};

export const downloadCertificatePdf = async (data: CertificateArtworkData, options: ExportOptions = {}) => {
  const blob = await buildCertificatePdf(data, options);
  saveBlob(blob, certificateFilename(data, "pdf"));
  return blob;
};

export const downloadCertificatePng = async (data: CertificateArtworkData, options: ExportOptions = {}) => {
  const canvas = await renderCertificateCanvas(data, 2, options);
  const blob = await canvasToBlob(canvas, "image/png");
  saveBlob(blob, certificateFilename(data, "png"));
  return blob;
};

/** Opens the PDF in a new tab, where the browser's viewer handles printing. */
export const openCertificatePdf = async (data: CertificateArtworkData, options: ExportOptions = {}) => {
  // Open synchronously so pop-up blockers treat it as user-initiated
  const tab = window.open("", "_blank");
  try {
    const blob = await buildCertificatePdf(data, options);
    const url = URL.createObjectURL(blob);
    if (tab) tab.location.href = url;
    else saveBlob(blob, certificateFilename(data, "pdf"));
    setTimeout(() => URL.revokeObjectURL(url), 120_000);
  } catch (error) {
    tab?.close();
    throw error;
  }
};

/** One multi-page PDF for a batch. Uses lighter images so large batches stay manageable. */
export const buildBatchPdf = async (
  items: CertificateArtworkData[],
  onProgress?: (done: number, total: number) => void,
) => {
  const pdf = await createPdf();
  pdf.setProperties({
    title: `ASL certificates (${items.length})`,
    author: "Alpha Step Links Aviation School",
    creator: "ASL Certificate Registry",
  });
  for (let i = 0; i < items.length; i += 1) {
    const canvas = await renderCertificateCanvas(items[i], 1.5);
    if (i > 0) pdf.addPage("a4", "landscape");
    addCertificatePage(pdf, canvas, items[i], 0.86);
    onProgress?.(i + 1, items.length);
    // Yield so the progress UI can paint between pages
    await wait(0);
  }
  return pdf.output("blob");
};

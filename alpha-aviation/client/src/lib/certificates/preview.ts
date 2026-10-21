import { useEffect, useMemo, useState } from "react";
import { ensureCertificateFonts } from "./fonts";
import { certificateText, computeCertificateLayout, type CertificateLayout } from "./layout";
import { CERTIFICATE_TEMPLATE } from "./template";
import type { CertificateArtworkData } from "./types";

export type CertificateWatermark = "specimen" | "revoked" | "superseded" | null;

export interface CertificateAssets {
  symbolWhite: string;
  symbolBlue: string;
  /** Accreditation mark → logo image (data URI). Marks without a logo file are absent. */
  accreditationLogos?: Record<string, string>;
}

// ─── Accreditation logos ─────────────────────────────────────────────────────

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/** Re-encodes a raster logo at a print-friendly size, keeping transparency. */
const rasterToDataUrl = (blob: Blob, maxSide = 480) =>
  new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unreadable logo image"));
    };
    img.src = url;
  });

/** Resolves to a data URI, or null when the file is missing or not an image. */
const loadLogo = async (src: string) => {
  try {
    const res = await fetch(src, { cache: "no-cache" });
    // A missing file comes back as the SPA's index.html, so check the type too
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return null;
    const blob = await res.blob();
    return type.includes("svg") ? await blobToDataUrl(blob) : await rasterToDataUrl(blob);
  } catch {
    return null;
  }
};

let logosPromise: Promise<Record<string, string>> | null = null;

/** Loads every configured accreditation logo once per page; missing ones are skipped. */
export const loadAccreditationLogos = () => {
  if (!logosPromise) {
    const items = CERTIFICATE_TEMPLATE.accreditations.items;
    logosPromise = Promise.all(items.map((item) => loadLogo(item.logo))).then((logos) => {
      const found: Record<string, string> = {};
      logos.forEach((logo, i) => {
        if (logo) found[items[i].mark] = logo;
      });
      return found;
    });
  }
  return logosPromise;
};

/** Screen assets plus whichever accreditation logos exist. */
export function useCertificateAssets(): CertificateAssets {
  const [logos, setLogos] = useState<Record<string, string>>({});
  useEffect(() => {
    let cancelled = false;
    loadAccreditationLogos().then((loaded) => {
      if (!cancelled) setLogos(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return useMemo(() => ({ ...SCREEN_ASSETS, accreditationLogos: logos }), [logos]);
}

/** Brand images as served by the app; exports inline them instead. */
export const SCREEN_ASSETS: CertificateAssets = {
  symbolWhite: "/images/brand/asl-symbol-white.png",
  symbolBlue: "/images/brand/asl-symbol-blue.png",
};

/** Default watermark for a certificate in a given state. */
export const watermarkFor = (data: CertificateArtworkData): CertificateWatermark => {
  if (data.status === "revoked") return "revoked";
  if (data.status === "superseded") return "superseded";
  if (!data.serial) return "specimen";
  return null;
};

/**
 * Measures the certificate once its fonts (including any accent subsets the
 * text needs) are ready. Keeps the previous layout while new fonts load, so
 * typing never flashes an empty preview.
 */
export function useCertificateLayout(data: CertificateArtworkData) {
  const key = useMemo(() => JSON.stringify(data), [data]);
  const [state, setState] = useState<{ key: string; layout: CertificateLayout } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const snapshot = JSON.parse(key) as CertificateArtworkData;
    ensureCertificateFonts(certificateText(snapshot)).then(() => {
      if (!cancelled) setState({ key, layout: computeCertificateLayout(snapshot) });
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return { layout: state?.layout ?? null, pending: state?.key !== key };
}

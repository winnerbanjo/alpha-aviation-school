import { useCallback, useRef, useState } from "react";
import { useToast } from "@/components/ui/toast";
import type { CertificateArtworkData } from "@/lib/certificates/types";

export type DownloadFormat = "pdf" | "png" | "print";

/**
 * Wraps the (lazy-loaded) export pipeline with busy state and error toasts.
 * `onDownloaded` lets admin screens write an audit entry after a file is saved.
 */
export function useCertificateDownload(onDownloaded?: (format: "pdf" | "png") => void) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<DownloadFormat | null>(null);
  const inFlight = useRef(false);

  const run = useCallback(
    async (format: DownloadFormat, data: CertificateArtworkData) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setBusy(format);
      try {
        const exporter = await import("@/lib/certificates/export");
        if (format === "pdf") await exporter.downloadCertificatePdf(data);
        else if (format === "png") await exporter.downloadCertificatePng(data);
        else await exporter.openCertificatePdf(data);
        if (format !== "print") onDownloaded?.(format);
      } catch (error) {
        console.error("Certificate export failed", error);
        toast(
          error instanceof Error && error.message
            ? `Export failed: ${error.message}`
            : "The certificate could not be generated. Please try again.",
          "error",
        );
      } finally {
        inFlight.current = false;
        setBusy(null);
      }
    },
    [onDownloaded, toast],
  );

  return { busy, run };
}

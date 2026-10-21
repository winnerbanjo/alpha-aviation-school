import { useId } from "react";
import { CANVAS, type CertificateLayout } from "@/lib/certificates/layout";
import {
  useCertificateAssets,
  useCertificateLayout,
  watermarkFor,
  type CertificateWatermark,
} from "@/lib/certificates/preview";
import type { CertificateArtworkData } from "@/lib/certificates/types";
import { cn } from "@/lib/utils";
import { CertificateArtwork } from "./artwork/CertificateArtwork";

interface CertificatePreviewProps {
  data: CertificateArtworkData;
  watermark?: CertificateWatermark;
  className?: string;
}

/** Live, resolution-independent preview. Identical to the exported artwork. */
export function CertificatePreview(props: CertificatePreviewProps) {
  const { layout } = useCertificateLayout(props.data);
  return <CertificatePreviewWithLayout {...props} layout={layout} />;
}

/** Preview for callers that already computed the layout (e.g. to report print checks). */
export function CertificatePreviewWithLayout({
  data,
  watermark,
  className,
  layout,
}: CertificatePreviewProps & { layout: CertificateLayout | null }) {
  const idPrefix = `cert${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const assets = useCertificateAssets();

  return (
    <div
      className={cn("relative w-full overflow-hidden bg-[#0A1A38]", className)}
      style={{ aspectRatio: `${CANVAS.width} / ${CANVAS.height}` }}
    >
      {layout ? (
        <CertificateArtwork
          data={data}
          layout={layout}
          assets={assets}
          watermark={watermark === undefined ? watermarkFor(data) : watermark}
          idPrefix={idPrefix}
          className="absolute inset-0 block h-full w-full"
        />
      ) : (
        <div className="absolute inset-[1.5%] animate-pulse bg-gradient-to-br from-[#FBFAF6] to-[#EEF2F8]" aria-label="Preparing certificate preview" />
      )}
    </div>
  );
}

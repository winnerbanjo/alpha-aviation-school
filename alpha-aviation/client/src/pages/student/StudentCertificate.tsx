import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Award,
  Ban,
  Check,
  Copy,
  Download,
  ExternalLink,
  GraduationCap,
  ImageDown,
  BriefcaseBusiness,
  Loader2,
  Lock,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { getMyCertificates } from "@/api/certificates";
import { CertificatePreview } from "@/components/certificates/CertificatePreview";
import { useCertificateDownload } from "@/components/certificates/useCertificateDownload";
import { toArtworkData, type PublicCertificate } from "@/lib/certificates/types";
import { formatCertificateDate, formatVerificationCode } from "@/lib/certificates/validation";

/** LinkedIn "Add licence or certification" deep link. */
const linkedInUrl = (cert: PublicCertificate) => {
  const issued = new Date(cert.issueDate);
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: `${cert.typeLabel} — ${cert.programmes.join(", ")}`.slice(0, 200),
    organizationName: cert.issuer,
    issueYear: String(issued.getUTCFullYear()),
    issueMonth: String(issued.getUTCMonth() + 1),
    certUrl: cert.verifyUrl,
    certId: cert.serial,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
};

function IssuedCertificate({ cert }: { cert: PublicCertificate }) {
  const { busy, run } = useCertificateDownload();
  const [copied, setCopied] = useState(false);
  const art = toArtworkData(cert);
  const revoked = cert.status === "revoked";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cert.verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] xl:items-start"
    >
      <div className="relative overflow-hidden rounded-stage bg-[#07152E] p-3 shadow-float sm:p-5">
        <div aria-hidden className="absolute inset-0 bg-chart-grid mask-fade-b opacity-70" />
        <div aria-hidden className="absolute -right-32 -top-32 h-[380px] w-[380px] rounded-full bg-[#1246C8]/40 blur-[110px]" />
        <div className="relative overflow-hidden rounded-[16px] shadow-elevated">
          <CertificatePreview data={art} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle">
          {revoked ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 ring-1 ring-red-600/15">
              <Ban className="h-3.5 w-3.5" /> Revoked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/15">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified credential
            </span>
          )}
          <h2 className="mt-4 text-xl font-bold tracking-tighter text-[#10264B]">{cert.typeLabel}</h2>
          <ul className="mt-2 space-y-1 text-sm font-medium text-[#172B49]">
            {cert.programmes.map((p) => <li key={p}>{p}</li>)}
          </ul>
          <dl className="mt-5 space-y-2.5 border-t border-[#DCE2EB] pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[#53647C]">Certificate ID</dt>
              <dd className="font-mono text-[13px] font-semibold text-[#10264B]">{cert.serial}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#53647C]">Completed</dt>
              <dd className="font-semibold text-[#10264B]">{formatCertificateDate(cert.completionDate)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#53647C]">Verification code</dt>
              <dd className="font-mono text-[13px] font-semibold text-[#10264B]">{formatVerificationCode(cert.verificationCode)}</dd>
            </div>
          </dl>
          {revoked && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
              This certificate has been revoked by the school. Please contact the administration office.
            </p>
          )}
        </div>

        {!revoked && (
          <div className="rounded-panel border border-[#DCE2EB] bg-white p-5 shadow-subtle">
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => run("pdf", art)} disabled={!!busy} className="col-span-2">
                {busy === "pdf" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download PDF
              </Button>
              <Button variant="outline" onClick={() => run("png", art)} disabled={!!busy}>
                {busy === "png" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageDown className="mr-2 h-4 w-4" />}
                PNG
              </Button>
              <Button variant="outline" onClick={() => run("print", art)} disabled={!!busy}>
                {busy === "print" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                Print
              </Button>
            </div>
            <div className="mt-4 space-y-1 border-t border-[#DCE2EB] pt-4">
              <button type="button" onClick={copy} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#10264B] transition-colors hover:bg-[#F5F7FB]">
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-[#1246C8]" />}
                {copied ? "Link copied" : "Copy verification link"}
              </button>
              <a href={linkedInUrl(cert)} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#10264B] transition-colors hover:bg-[#F5F7FB]">
                <BriefcaseBusiness className="h-4 w-4 text-[#1246C8]" /> Add to LinkedIn profile
              </a>
              <a href={cert.verifyUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#10264B] transition-colors hover:bg-[#F5F7FB]">
                <ExternalLink className="h-4 w-4 text-[#1246C8]" /> Open public verification page
              </a>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}

export function StudentCertificate() {
  const { user } = useAuthStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [certificates, setCertificates] = useState<PublicCertificate[] | null>(null);
  const isGraduated = user?.status === "graduated";

  useEffect(() => {
    getMyCertificates()
      .then(setCertificates)
      .catch(() => setCertificates([]));
  }, []);

  const handleCertDownload = async (url: string) => {
    setIsDownloading(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      const ext = blob.type.includes("pdf") ? ".pdf" : ".png";
      a.download = `certificate-${user?.firstName || "student"}${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Certificate download failed:", err);
      window.open(url, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const header = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="eyebrow text-[#1246C8]">Credentials</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
          My Certificate{certificates && certificates.length > 1 ? "s" : ""}
        </h1>
        <p className="mt-2 text-[#53647C]">
          View, download and share your official, verifiable certificates.
        </p>
      </div>
      {(isGraduated || (certificates?.length ?? 0) > 0) && (
        <div className="self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/15">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Graduated & Cleared
          </span>
        </div>
      )}
    </div>
  );

  if (certificates === null) {
    return (
      <div className="space-y-8 pb-12">
        {header}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="aspect-[1754/1240] animate-pulse rounded-stage bg-white shadow-subtle" />
          <div className="h-72 animate-pulse rounded-panel bg-white shadow-subtle" />
        </div>
      </div>
    );
  }

  if (certificates.length > 0) {
    return (
      <div className="space-y-10 pb-12">
        {header}
        {certificates.map((cert) => (
          <IssuedCertificate key={cert.serial} cert={cert} />
        ))}
      </div>
    );
  }

  if (!isGraduated) {
    return (
      <div className="space-y-8 pb-12">
        {header}

        {/* Not Available View */}
        <div className="relative mx-auto max-w-2xl overflow-hidden rounded-panel border border-[#DCE2EB] bg-white p-12 text-center shadow-subtle">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-chart-grid-light mask-fade-b" />
          <div className="relative">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F7FB] ring-1 ring-[#DCE2EB]">
              <Lock className="w-6 h-6 text-[#53647C]" />
            </div>
            <h2 className="mb-2 text-xl font-bold tracking-tighter text-[#10264B]">
              Certificate Not Available
            </h2>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-[#53647C]">
              Your certificate of completion will be available here once you have graduated.
              Complete all academic tracks, settle outstanding tuition, and pass final clearance checks.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Graduated before generated certificates existed: show the uploaded file, if any.
  return (
    <div className="space-y-8 pb-12">
      {header}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="group relative mx-auto max-w-3xl overflow-hidden rounded-stage bg-[#07152E] p-3 shadow-float sm:p-5"
      >
        <div aria-hidden className="absolute inset-0 bg-chart-grid mask-fade-b opacity-70" />
        <div aria-hidden className="absolute -right-32 -top-32 h-[380px] w-[380px] rounded-full bg-[#1246C8]/40 blur-[110px]" />

        <div className="relative overflow-hidden rounded-[22px] bg-white px-6 py-10 text-center sm:px-14 sm:py-14">
          <div aria-hidden className="absolute inset-3 rounded-2xl border border-[#DCE2EB] pointer-events-none" />
          <div aria-hidden className="absolute inset-5 rounded-xl border border-dashed border-[#1246C8]/25 pointer-events-none" />
          <div aria-hidden className="pointer-events-none absolute -left-24 -bottom-24 h-56 w-56 rounded-full bg-[#DCE8FF]/70 blur-3xl" />

          <div className="relative z-10 space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#10264B] text-white shadow-elevated ring-8 ring-[#DCE8FF] transition-transform duration-300 group-hover:scale-105">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>

            <div>
              <p className="eyebrow justify-center text-[#1246C8]">
                Alpha Step Links Aviation School
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
                Certificate of Completion
              </h2>
            </div>

            <div aria-hidden className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-[#1246C8] to-transparent" />

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#53647C]">This certifies that</p>
              <p className="text-gradient-blue text-3xl font-bold tracking-tightest sm:text-4xl">
                {user?.firstName} {user?.lastName}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#53647C]">has successfully completed the course of study in</p>
              <p className="mx-auto max-w-md text-base font-semibold text-[#172B49]">
                {user?.selectedCourses?.join(", ") || user?.enrolledCourse}
              </p>
            </div>

            {user?.studentIdNumber && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C] tabular-nums">
                Student ID: {user.studentIdNumber}
              </p>
            )}

            <div aria-hidden className="barcode mx-auto h-8 w-40 opacity-60" />

            <div className="pt-2">
              {user?.certificateUrl ? (
                <Button
                  onClick={() => handleCertDownload(user.certificateUrl!)}
                  disabled={isDownloading}
                  className="shrink-0 gap-2"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Downloading Credential...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Certificate (PDF)</span>
                    </>
                  )}
                </Button>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE2EB] bg-[#F5F7FB] px-4 py-2.5 text-xs font-semibold text-[#53647C]">
                  <Award className="w-4 h-4 text-[#1246C8]" />
                  <span>Certificate loading... Awaiting final administrative registry release.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

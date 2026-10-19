import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { GraduationCap, Download, Loader2, Lock, Award, AwardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function StudentCertificate() {
  const { user } = useAuthStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const isGraduated = user?.status === "graduated";

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

  if (!isGraduated) {
    return (
      <div className="space-y-8 pb-12">
        {/* Header section */}
        <div>
          <span className="eyebrow text-[#1246C8]">Credentials</span>
          <h1 className="mt-3 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
            My Certificate
          </h1>
          <p className="mt-2 text-[#53647C]">
            View and download your official graduation certificate.
          </p>
        </div>

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

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow text-[#1246C8]">Credentials</span>
          <h1 className="mt-3 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
            My Certificate
          </h1>
          <p className="mt-2 text-[#53647C]">
            View and download your official graduation certificate.
          </p>
        </div>
        <div className="self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/15">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Graduated & Cleared
          </span>
        </div>
      </div>

      {/* Diploma Showcase Card Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="group relative mx-auto max-w-3xl overflow-hidden rounded-stage bg-[#07152E] p-3 shadow-float sm:p-5"
      >
        <div aria-hidden className="absolute inset-0 bg-chart-grid mask-fade-b opacity-70" />
        <div aria-hidden className="absolute -right-32 -top-32 h-[380px] w-[380px] rounded-full bg-[#1246C8]/40 blur-[110px]" />

        <div className="relative overflow-hidden rounded-[22px] bg-white px-6 py-10 text-center sm:px-14 sm:py-14">
          {/* Decorative Inner Board Frame */}
          <div aria-hidden className="absolute inset-3 rounded-2xl border border-[#DCE2EB] pointer-events-none" />
          <div aria-hidden className="absolute inset-5 rounded-xl border border-dashed border-[#1246C8]/25 pointer-events-none" />
          <div aria-hidden className="pointer-events-none absolute -left-24 -bottom-24 h-56 w-56 rounded-full bg-[#DCE8FF]/70 blur-3xl" />

          {/* Certificate Content wrapper */}
          <div className="relative z-10 space-y-6">
            {/* Graduation Cap Badge */}
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

            {/* Student details */}
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

            {/* Download and Print button */}
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

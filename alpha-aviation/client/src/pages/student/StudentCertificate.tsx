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
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            My Certificate
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            View and download your official graduation certificate.
          </p>
        </div>

        {/* Not Available View */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-12 text-center shadow-sm max-w-2xl mx-auto">
          <div className="relative p-4 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-500 rounded-full border border-slate-200/80 shadow-sm flex items-center justify-center w-16 h-16 mx-auto mb-6">
            <Lock className="w-6 h-6 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Certificate Not Available
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Your certificate of completion will be available here once you have graduated.
            Complete all academic tracks, settle outstanding tuition, and pass final clearance checks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            My Certificate
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            View and download your official graduation certificate.
          </p>
        </div>
        <div className="self-start sm:self-auto">
          <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/30 flex items-center gap-1.5">
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
        className="bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 sm:p-12 shadow-[0px_6px_24px_0px_rgba(0,0,0,0.05),0px_0px_0px_1px_rgba(0,0,0,0.08)] max-w-2xl mx-auto relative overflow-hidden text-center group hover:shadow-md transition-all duration-300"
      >
        {/* Decorative Inner Board Frame */}
        <div className="absolute inset-4 border border-dashed border-slate-200 rounded-2xl pointer-events-none" />

        {/* Certificate Content wrapper */}
        <div className="relative z-10 space-y-6">
          {/* Graduation Cap Badge */}
          <div className="mx-auto p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-emerald-600 rounded-full w-20 h-20 flex items-center justify-center border border-emerald-100/80 shadow-sm relative group-hover:scale-105 transition-transform duration-300">
            <GraduationCap className="w-10 h-10 text-emerald-600" />
          </div>

          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Alpha Step Links Aviation School
            </p>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
              Certificate of Completion
            </h2>
          </div>

          <div className="w-16 h-px bg-slate-200 mx-auto" />

          {/* Student details */}
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">This certifies that</p>
            <p className="text-2xl font-extrabold text-slate-950 tracking-tight font-serif">
              {user?.firstName} {user?.lastName}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">has successfully completed the course of study in</p>
            <p className="text-base font-bold text-slate-800 max-w-md mx-auto">
              {user?.selectedCourses?.join(", ") || user?.enrolledCourse}
            </p>
          </div>

          {user?.studentIdNumber && (
            <p className="text-[11px] font-bold text-slate-400/90 uppercase tracking-wider">
              Student ID: {user.studentIdNumber}
            </p>
          )}

          {/* Download and Print button */}
          <div className="pt-4">
            {user?.certificateUrl ? (
              <Button
                onClick={() => handleCertDownload(user.certificateUrl!)}
                disabled={isDownloading}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-2xl transition-all shadow-sm shrink-0"
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
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl inline-flex items-center gap-2 text-xs font-bold text-slate-500">
                <Award className="w-4 h-4 text-indigo-500" />
                <span>Certificate loading... Awaiting final administrative registry release.</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

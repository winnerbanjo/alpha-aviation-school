import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap, Download, Loader2 } from "lucide-react";

export function StudentCertificate() {
  const { user } = useAuthStore();
  const [isDownloading, setIsDownloading] = useState(false);

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

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          My Certificate
        </h1>
        <p className="text-slate-500">
          Download and view your official graduation certificate.
        </p>
      </div>
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
      <CardHeader className="text-center">
        <div className="mx-auto p-4 bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mb-4">
          <GraduationCap className="w-12 h-12 text-green-600" />
        </div>
        <CardTitle className="text-2xl text-green-900">
          Certificate of Completion
        </CardTitle>
        <CardDescription className="text-green-700">
          Alpha Step Links Aviation School
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div>
          <p className="text-sm text-slate-500">This certifies that</p>
          <p className="text-2xl font-bold text-slate-900">
            {user?.firstName} {user?.lastName}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500">has successfully completed</p>
          <p className="text-lg font-semibold text-slate-800">
            {user?.selectedCourses?.join(", ") || user?.enrolledCourse}
          </p>
        </div>
        {user?.studentIdNumber && (
          <p className="text-sm text-slate-500">
            Student ID: {user.studentIdNumber}
          </p>
        )}
        {user?.certificateUrl ? (
          <button
            onClick={() => handleCertDownload(user.certificateUrl!)}
            disabled={isDownloading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-md mt-4 transition-colors"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Downloading…
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Certificate
              </>
            )}
          </button>
        ) : (
          <p className="text-sm text-slate-500 mt-4">
            Certificate not available yet. Please check back soon.
          </p>
        )}
      </CardContent>
    </Card>
    </div>
  );
}

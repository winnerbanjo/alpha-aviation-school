import { useAuthStore } from "@/store/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, BookOpen, Lock, FileText } from "lucide-react";

interface Resource {
  title: string;
  type: "pdf" | "video" | "doc";
  size: string;
  url?: string;
  locked: boolean;
}

const MOCK_RESOURCES: Resource[] = [
  {
    title: "Aviation Fundamentals Handbook",
    type: "pdf",
    size: "4.2 MB",
    locked: true,
  },
  {
    title: "Airport Operations Guide",
    type: "pdf",
    size: "3.8 MB",
    locked: true,
  },
  {
    title: "Safety Procedures Manual",
    type: "pdf",
    size: "5.1 MB",
    locked: true,
  },
  {
    title: "Customer Service Best Practices",
    type: "doc",
    size: "1.2 MB",
    locked: true,
  },
];

const TYPE_ICONS: Record<string, typeof FileText> = {
  pdf: FileText,
  video: BookOpen,
  doc: FileText,
};

export function StudentResources() {
  const { user } = useAuthStore();
  const isPaid = user?.paymentStatus !== "Pending";

  const handleDownload = (resource: Resource) => {
    if (resource.locked || !isPaid) {
      return;
    }
    if (resource.url) {
      window.open(resource.url, "_blank");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Resource Library
        </h1>
        <p className="text-slate-500">
          Download course materials, study guides, and training resources.
        </p>
      </div>

      {!isPaid && (
        <Card className="border-l-4 border-l-amber-400 bg-white">
          <CardContent className="p-6 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Resources Locked
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Course materials will be unlocked once your payment is confirmed
                by admin. Please complete your payment to access all resources.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Available Materials
          </h2>
          <Badge
            variant="secondary"
            className={
              isPaid
                ? "bg-green-100 text-green-700 hover:bg-green-100 border-none"
                : "bg-amber-100 text-amber-700 hover:bg-amber-100 border-none"
            }
          >
            {isPaid ? "Unlocked" : "Locked"}
          </Badge>
        </div>

        <Card className="border-slate-200">
          <CardContent className="p-0">
            {MOCK_RESOURCES.map((resource, idx) => {
              const Icon = TYPE_ICONS[resource.type] || FileText;
              const isLocked = resource.locked || !isPaid;

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-4 ${
                    idx !== MOCK_RESOURCES.length - 1
                      ? "border-b border-slate-100"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Icon className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {resource.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {resource.type.toUpperCase()} &middot; {resource.size}
                      </p>
                    </div>
                  </div>

                  {isLocked ? (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Lock className="w-4 h-4" />
                      <span className="text-xs font-medium">Locked</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDownload(resource)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <p className="text-xs text-slate-400 text-center">
          More resources will be added as you progress through your courses.
          Contact admin if a resource is missing.
        </p>
      </div>
    </div>
  );
}

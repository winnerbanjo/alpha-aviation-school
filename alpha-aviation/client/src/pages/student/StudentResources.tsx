import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, BookOpen, Lock, FileText, Video, Link as LinkIcon } from "lucide-react";
import { getStudentResources, type CourseResourceItem } from "@/api";
import { openResourceInBrowser } from "@/lib/openResource";

const TYPE_ICONS: Record<CourseResourceItem["type"], typeof FileText> = {
  pdf: FileText,
  video: Video,
  doc: FileText,
  link: LinkIcon,
  other: FileText,
};

export function StudentResources() {
  const { user } = useAuthStore();
  const [resources, setResources] = useState<CourseResourceItem[]>([]);
  const [selectedCourseTitles, setSelectedCourseTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const paymentStatus = user?.paymentStatus || "Pending";
  const isPaid = paymentStatus === "Paid";
  const isUnderReview = paymentStatus === "Under Review";

  useEffect(() => {
    const loadResources = async () => {
      try {
        const response = await getStudentResources();
        setResources(response.data.resources);
        setSelectedCourseTitles(response.data.selectedCourseTitles);
      } catch (error) {
        console.error("Failed to load resources", error);
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  const resourcesByCourse = useMemo(
    () =>
      selectedCourseTitles.map((courseTitle) => ({
        courseTitle,
        resources: resources.filter(
          (resource) => resource.courseTitle === courseTitle,
        ),
      })),
    [resources, selectedCourseTitles],
  );

  const handleDownload = (resource: CourseResourceItem) => {
    if (!isPaid) return;
    openResourceInBrowser(resource.url);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Resource Library
        </h1>
        <p className="text-slate-500">
          Download materials for your enrolled programmes.
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
                {isUnderReview
                  ? "Your receipt is under review. Course materials will be unlocked once admin confirms your payment."
                  : "Course materials will be unlocked once your payment is confirmed by admin. Please complete your payment to access all resources."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Enrolled Programme Materials
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

        {loading ? (
          <Card className="border-slate-200">
            <CardContent className="p-8 text-center text-sm text-slate-500">
              Loading resources...
            </CardContent>
          </Card>
        ) : resourcesByCourse.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="p-10 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="font-semibold text-slate-900">
                No enrolled programmes found
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Your course materials will appear here after enrollment.
              </p>
            </CardContent>
          </Card>
        ) : (
          resourcesByCourse.map(({ courseTitle, resources: courseResources }) => (
            <Card key={courseTitle} className="border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {courseTitle}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {courseResources.length} resource
                    {courseResources.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <CardContent className="p-0">
                {courseResources.length === 0 ? (
                  <div className="p-6 text-sm text-slate-500">
                    No resources have been uploaded for this programme yet.
                  </div>
                ) : (
                  courseResources.map((resource, idx) => {
                    const Icon = TYPE_ICONS[resource.type] || FileText;

                    return (
                      <div
                        key={resource._id}
                        className={`flex items-center justify-between p-4 gap-4 ${
                          idx !== courseResources.length - 1
                            ? "border-b border-slate-100"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                            <Icon className="w-5 h-5 text-slate-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {resource.title}
                            </p>
                            <p className="text-xs text-slate-400">
                              {resource.type.toUpperCase()}
                              {resource.size ? ` · ${resource.size}` : ""}
                            </p>
                            {resource.description && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                {resource.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {!isPaid ? (
                          <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                            <Lock className="w-4 h-4" />
                            <span className="text-xs font-medium">Locked</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDownload(resource)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Open
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

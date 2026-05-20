import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, BookOpen, Lock, FileText, Video, Link as LinkIcon, AlertTriangle } from "lucide-react";
import { getStudentResources, type CourseResourceItem } from "@/api";
import { openResourceInBrowser } from "@/lib/openResource";
import { motion } from "framer-motion";

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
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Resource Library
        </h1>
        <p className="text-sm font-normal text-slate-500 mt-1">
          Download study guides, curriculum files, and templates for your enrolled programmes.
        </p>
      </div>

      {/* Locked Alert Banner */}
      {!isPaid && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-3xl border border-amber-200 bg-amber-50/80 text-amber-900 flex items-start gap-3 shadow-sm backdrop-blur-md"
        >
          <Lock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0 animate-pulse" />
          <div>
            <p className="text-sm font-bold">Resources Locked</p>
            <p className="text-xs text-amber-700/90 mt-0.5">
              {isUnderReview
                ? "Your tuition payment receipt is currently under administrative verification. Study guides and training materials will unlock automatically once confirmed."
                : "Ground school training resources will unlock once your tuition payment is confirmed. Please clear your outstanding balance to download materials."}
            </p>
          </div>
        </motion.div>
      )}

      {/* Main Section Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Enrolled Programme Materials
          </h2>
          {isPaid ? (
            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Fully Unlocked
            </span>
          ) : (
            <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100/30 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Locked
            </span>
          )}
        </div>

        {loading ? (
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-slate-500">Loading resources...</p>
          </div>
        ) : resourcesByCourse.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-12 text-center shadow-sm">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              No Enrolled Programmes Found
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Your course materials and outlines will appear here automatically after your training track enrollment.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {resourcesByCourse.map(({ courseTitle, resources: courseResources }, cIdx) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: cIdx * 0.1 }}
                key={courseTitle}
                className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                {/* Course Header Bar */}
                <div className="px-5 py-4 border-b border-slate-100/80 bg-slate-50/50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative p-2.5 bg-gradient-to-br from-indigo-50 to-indigo-100/60 text-indigo-600 rounded-xl border border-indigo-100/80 shadow-sm flex items-center justify-center w-10 h-10">
                      <BookOpen className="w-5 h-5 relative z-10" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {courseTitle}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {courseResources.length} curriculum resource
                        {courseResources.length === 1 ? "" : "s"} available
                      </p>
                    </div>
                  </div>
                </div>

                {/* Course Resources Body */}
                <div className="divide-y divide-slate-100">
                  {courseResources.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-400">
                      No study guides or material documents uploaded yet for this program.
                    </div>
                  ) : (
                    courseResources.map((resource) => {
                      const Icon = TYPE_ICONS[resource.type] || FileText;

                      return (
                        <div
                          key={resource._id}
                          className="flex items-center justify-between p-4 sm:p-5 gap-4 hover:bg-slate-50/30 transition-colors"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Document Type Icon Wrapper */}
                            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl shrink-0 flex items-center justify-center w-10 h-10 text-slate-500">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">
                                {resource.title}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                                <span className="font-bold text-indigo-600/70">{resource.type.toUpperCase()}</span>
                                {resource.size && (
                                  <>
                                    <span>·</span>
                                    <span>{resource.size}</span>
                                  </>
                                )}
                              </p>
                              {resource.description && (
                                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                                  {resource.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Button: Locked vs Download/Open */}
                          {!isPaid ? (
                            <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shrink-0">
                              <Lock className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-bold">Locked</span>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleDownload(resource)}
                              size="sm"
                              variant="outline"
                              className="rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 font-bold text-xs py-1.5 px-3 shrink-0 flex items-center gap-1 transition-all"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Open</span>
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

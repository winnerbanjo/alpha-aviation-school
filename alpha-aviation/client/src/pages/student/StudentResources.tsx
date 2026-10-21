import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Download, BookOpen, Lock, FileText, Video, Link as LinkIcon } from "lucide-react";
import { getStudentResources, type CourseResourceItem } from "@/api";
import { SecureViewer } from "@/components/dashboard/SecureViewer";
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

  const [activeResource, setActiveResource] = useState<CourseResourceItem | null>(null);
  const [secureViewerOpen, setSecureViewerOpen] = useState(false);

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

    if (resource.type === "doc" || resource.type === "link" || resource.type === "other") {
      window.open(resource.url, "_blank", "noopener,noreferrer");
      return;
    }

    setActiveResource(resource);
    setSecureViewerOpen(true);
  };

  return (
    <>
      <div className="space-y-8 pb-12">
        {/* Header section */}
        <div>
          <span className="eyebrow text-[#1246C8]">Library</span>
          <h1 className="mt-3 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
            Resource Library
          </h1>
          <p className="mt-2 text-[#53647C]">
            Download study guides, curriculum files, and templates for your enrolled programmes.
          </p>
        </div>

        {/* Locked Alert Banner */}
        {!isPaid && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3.5 rounded-panel border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-subtle sm:p-5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <Lock className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-semibold">Resources Locked</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-amber-700">
                {isUnderReview
                  ? "Your tuition payment receipt is currently under administrative verification. Study guides and training materials will unlock automatically once confirmed."
                  : "Ground school training resources will unlock once your tuition payment is confirmed. Please clear your outstanding balance to download materials."}
              </p>
            </div>
          </motion.div>
        )}

        {/* Main Section Content */}
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold tracking-tighter text-[#10264B]">
              Enrolled Programme Materials
            </h2>
            {isPaid ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/15">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Fully Unlocked
              </span>
            ) : (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-600/15">
                <Lock className="w-3 h-3" />
                Locked
              </span>
            )}
          </div>

          {loading ? (
            <div className="rounded-panel border border-[#DCE2EB] bg-white p-12 text-center shadow-subtle">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-[#DCE2EB] border-t-[#1246C8]" />
              <p className="text-sm font-medium text-[#53647C]">Loading resources...</p>
            </div>
          ) : resourcesByCourse.length === 0 ? (
            <div className="rounded-panel border border-[#DCE2EB] bg-white p-12 text-center shadow-subtle">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="mb-1 text-lg font-bold tracking-tighter text-[#10264B]">
                No Enrolled Programmes Found
              </h3>
              <p className="mx-auto max-w-sm text-sm text-[#53647C]">
                Your course materials and outlines will appear here automatically after your training track enrollment.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {resourcesByCourse.map(({ courseTitle, resources: courseResources }, cIdx) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: cIdx * 0.1 }}
                  key={courseTitle}
                  className="group overflow-hidden rounded-panel border border-[#DCE2EB] bg-white shadow-subtle transition-all duration-300 hover:shadow-elevated"
                >
                  {/* Course Header Bar */}
                  <div className="flex items-center justify-between gap-4 border-b border-[#DCE2EB] px-5 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold tracking-tight text-[#10264B] transition-colors group-hover:text-[#1246C8]">
                          {courseTitle}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#53647C]">
                          {courseResources.length} curriculum resource
                          {courseResources.length === 1 ? "" : "s"} available
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Course Resources Body */}
                  <div className="divide-y divide-[#DCE2EB]/70">
                    {courseResources.length === 0 ? (
                      <div className="p-8 text-center text-sm text-[#53647C]">
                        No study guides or material documents uploaded yet for this program.
                      </div>
                    ) : (
                      courseResources.map((resource) => {
                        const Icon = TYPE_ICONS[resource.type] || FileText;

                        return (
                          <div
                            key={resource._id}
                            className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#F5F7FB] sm:px-6"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              {/* Document Type Icon Wrapper */}
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5F7FB] text-[#1246C8] ring-1 ring-[#DCE2EB]">
                                <Icon className="w-[18px] h-[18px]" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#10264B]">
                                  {resource.title}
                                </p>
                                <p className="mt-1 flex items-center gap-1.5 text-xs text-[#53647C]">
                                  <span className="rounded-full bg-[#DCE8FF] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#1246C8]">{resource.type.toUpperCase()}</span>
                                  {resource.size && (
                                    <>
                                      <span className="text-[#8C9AB0]">·</span>
                                      <span className="tabular-nums">{resource.size}</span>
                                    </>
                                  )}
                                </p>
                                {resource.description && (
                                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#53647C]">
                                    {resource.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Action Button: Locked vs Download/Open */}
                            {!isPaid ? (
                              <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#F5F7FB] px-3 py-1.5 text-[#53647C] ring-1 ring-[#DCE2EB]">
                                <Lock className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-semibold">Locked</span>
                              </div>
                            ) : (
                              <Button
                                onClick={() => handleDownload(resource)}
                                size="sm"
                                variant="outline"
                                className="shrink-0 gap-1.5"
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
      <SecureViewer
        isOpen={secureViewerOpen}
        onClose={() => {
          setSecureViewerOpen(false);
          setActiveResource(null);
        }}
        resource={activeResource}
      />
    </>
  );
}

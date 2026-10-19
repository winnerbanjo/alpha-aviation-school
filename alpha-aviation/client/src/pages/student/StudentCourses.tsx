import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Calendar, Clock } from "lucide-react";
import { formatNaira } from "@/data/courseCatalog";
import { Button } from "@/components/ui/button";
import { getMyCourseTracks, type CourseTrackItem } from "@/api";

export function StudentCourses() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const courseSelections = user?.courseSelections || [];
  const isPaid = user?.paymentStatus === "Paid";

  const [courseTracks, setCourseTracks] = useState<CourseTrackItem[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  useEffect(() => {
    if (isPaid) {
      setLoadingTracks(true);
      getMyCourseTracks()
        .then((res) => { if (res?.success) setCourseTracks(res.data.tracks); })
        .catch(() => { })
        .finally(() => setLoadingTracks(false));
    }
  }, [isPaid]);

  const isCleared = user?.adminClearance;
  const isUnderReview = user?.paymentStatus === "Under Review";

  const activeCount = courseTracks.filter((t) => t.status === "active").length;
  const completedCount = courseTracks.filter((t) => t.status === "completed").length;

  const weekLabel = (week: number, currentWeek: number) => {
    if (week < currentWeek) return "Done";
    if (week === currentWeek) return "Current";
    return "Upcoming";
  };

  const weekColor = (progress: number, week: number, currentWeek: number) => {
    if (week < currentWeek || progress >= 100) return "bg-emerald-500";
    if (week === currentWeek) return "bg-gradient-to-r from-[#1246C8] to-[#5B86FF]";
    return "bg-[#DCE2EB]";
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="eyebrow text-[#1246C8]">Ground school</span>
          <h1 className="mt-3 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">My Enrolled Courses</h1>
          <p className="mt-2 text-[#53647C]">
            Monitor your 4-week ground school progress and weekly milestones.
          </p>
        </div>
        {isPaid && courseTracks.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#DCE8FF] px-4 py-2 text-[13px] font-semibold text-[#1246C8]">
              <GraduationCap className="w-4 h-4" />
              <span>{activeCount} Active · {completedCount} Completed</span>
            </div>
          </div>
        )}
      </div>

      {/* Global 4-Week Timeline (Shared across all courses) */}
      {isPaid && courseTracks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle sm:p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <span className="eyebrow text-[#1246C8]">Flight path</span>
              <h2 className="mt-2 text-lg font-bold tracking-tighter text-[#10264B]">Ground School Timeline</h2>
              <p className="mt-1 text-[13px] text-[#53647C]">All selected courses share this 4-week training schedule.</p>
            </div>

            <div className="flex flex-col gap-2 md:items-end">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE2EB] bg-[#F5F7FB] px-3 py-1.5 text-xs font-medium text-[#53647C] tabular-nums">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Date(courseTracks[0].startDate).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                  {" → "}
                  {new Date(courseTracks[0].endDate).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${courseTracks[0].daysRemaining <= 7 && courseTracks[0].status === "active" ? "text-amber-700" : "text-[#1246C8]"}`}>
                <Clock className="w-3.5 h-3.5" />
                {courseTracks[0].status === "completed"
                  ? "Training Period Completed"
                  : courseTracks[0].status === "expired"
                    ? "Training Period Expired"
                    : `${courseTracks[0].daysRemaining} days left`}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[courseTracks[0].week1Progress, courseTracks[0].week2Progress, courseTracks[0].week3Progress, courseTracks[0].week4Progress].map((wp, wi) => {
              const weekNum = wi + 1;
              const currentWeek = courseTracks[0].currentWeek || 1;
              const label = weekLabel(weekNum, currentWeek);
              const barColor = weekColor(wp, weekNum, currentWeek);
              const isCurrent = weekNum === currentWeek;

              return (
                <div key={weekNum} className="group/wk relative">
                  {/* Flight path segment to the next waypoint */}
                  <div
                    aria-hidden
                    className={`absolute left-1/2 top-5 hidden w-[calc(100%+1rem)] border-t-2 md:block md:group-last/wk:hidden ${label === "Done" ? "border-solid border-[#1246C8]" : "border-dashed border-[#DCE2EB]"}`}
                  />
                  <div className="flex items-center gap-3 md:flex-col md:gap-2 md:text-center">
                    <span
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white text-xs font-bold tabular-nums ${isCurrent ? "bg-[#1246C8] text-white shadow-glow" : label === "Done" ? "bg-[#10264B] text-white shadow-subtle" : "bg-[#F5F7FB] text-[#53647C] ring-1 ring-[#DCE2EB]"}`}
                    >
                      0{weekNum}
                    </span>
                    <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${isCurrent ? "text-[#1246C8]" : "text-[#53647C]"}`}>
                      Week {weekNum}
                    </p>
                  </div>

                  <div className={`mt-4 rounded-2xl border p-4 transition-all ${isCurrent ? "border-[#1246C8]/30 bg-[#F2F6FF] shadow-subtle" : "border-[#DCE2EB]/70 bg-[#F5F7FB]"}`}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                        Progress
                      </p>
                      <p className={`text-xs font-bold tabular-nums ${isCurrent ? "text-[#1246C8]" : wp >= 100 ? "text-emerald-700" : "text-[#53647C]"}`}>
                        {wp}%
                      </p>
                    </div>
                    <div className="w-full h-2 bg-[#DCE2EB]/70 rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${wp}%` }}
                        transition={{ duration: 0.8, delay: wi * 0.1, ease: "easeOut" }}
                        className={`h-full ${barColor} rounded-full`}
                      />
                    </div>
                    <p className="text-[11px] text-[#53647C] font-medium flex items-center justify-between">
                      {label}
                      {isCurrent && <span className="flex w-2 h-2 rounded-full bg-[#1246C8] animate-pulse"></span>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* No courses state */}
      {courseSelections.length === 0 ? (
        <div className="rounded-panel border border-[#DCE2EB] bg-white p-12 text-center shadow-subtle">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold tracking-tighter text-[#10264B] mb-1">No Courses Selected</h3>
          <p className="text-sm text-[#53647C] max-w-sm mx-auto mb-6">
            You haven't enrolled in any courses yet. Please navigate to the catalog to choose a ground training track.
          </p>
          <Button
            onClick={() => navigate("/dashboard/overview")}
          >
            Go to Dashboard Overview
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courseSelections.map((course, idx) => {
            const track = courseTracks.find((t) => t.courseTitle === course.title);
            const cardGradient = idx % 2 === 0 ? "from-indigo-500 to-purple-600" : "from-blue-500 to-indigo-600";

            // Fallback progress when no track exists yet
            const fallbackProgress = isCleared ? 100 : isUnderReview ? 35 : 0;
            const overallProgress = track ? track.overallProgress : fallbackProgress;
            const currentWeek = track?.currentWeek ?? 1;

            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                key={course.title}
                className="group relative flex flex-col gap-5 overflow-hidden rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated"
              >
                {/* Glow */}
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#DCE8FF] opacity-0 blur-3xl group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Title row */}
                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold leading-tight tracking-tight text-[#10264B] transition-colors group-hover:text-[#1246C8]">
                        {course.title}
                      </h3>
                      <p className="mt-1 text-[13px] font-medium text-[#53647C] tabular-nums">Tuition: {formatNaira(course.price)}</p>
                    </div>
                  </div>

                </div>



                {/* Pre-payment fallback note */}
                {!track && !isPaid && (
                  <div className="relative pt-4 border-t border-dashed border-[#DCE2EB]">
                    <p className="text-xs text-[#53647C]">4-week track activates after payment confirmation.</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

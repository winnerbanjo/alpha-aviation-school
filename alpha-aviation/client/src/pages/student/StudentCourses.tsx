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
    if (week < currentWeek || progress >= 100) return "bg-gradient-to-r from-emerald-400 to-emerald-500";
    if (week === currentWeek) return "bg-gradient-to-r from-indigo-500 to-purple-500";
    return "bg-slate-100";
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">My Enrolled Courses</h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            Monitor your 4-week ground school progress and weekly milestones.
          </p>
        </div>
        {isPaid && courseTracks.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-indigo-50/60 border border-indigo-100/60 rounded-2xl px-4 py-2 text-indigo-700 font-semibold text-sm">
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
          className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Ground School Timeline</h2>
              <p className="text-xs text-slate-500 mt-1">All selected courses share this 4-week training schedule.</p>
            </div>

            <div className="mt-4 md:mt-0 flex flex-col md:items-end">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Date(courseTracks[0].startDate).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                  {" → "}
                  {new Date(courseTracks[0].endDate).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className={`mt-2 flex items-center gap-1.5 text-xs font-bold ${courseTracks[0].daysRemaining <= 7 && courseTracks[0].status === "active" ? "text-amber-600" : "text-indigo-600"}`}>
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
                <div key={weekNum} className={`rounded-2xl p-4 border transition-all ${isCurrent ? "border-indigo-200/70 bg-indigo-50/50 shadow-sm" : "border-slate-100 bg-slate-50/50"}`}>
                  <div className="flex justify-between items-center mb-2">
                    <p className={`text-[11px] font-bold uppercase tracking-wide ${isCurrent ? "text-indigo-600" : "text-slate-400"}`}>
                      Week {weekNum}
                    </p>
                    <p className={`text-[11px] font-bold ${isCurrent ? "text-indigo-500" : wp >= 100 ? "text-emerald-600" : "text-slate-400"}`}>
                      {wp}%
                    </p>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200/60 rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${wp}%` }}
                      transition={{ duration: 0.8, delay: wi * 0.1, ease: "easeOut" }}
                      className={`h-full ${barColor} rounded-full`}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium flex items-center justify-between">
                    {label}
                    {isCurrent && <span className="flex w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* No courses state */}
      {courseSelections.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-12 text-center shadow-sm">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Courses Selected</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            You haven't enrolled in any courses yet. Please navigate to the catalog to choose a ground training track.
          </p>
          <Button
            onClick={() => navigate("/dashboard/overview")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl px-6 py-2.5 shadow-sm transition-colors text-sm"
          >
            Go to Dashboard Overview
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 flex flex-col gap-5 relative overflow-hidden group"
              >
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/10 to-purple-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Title row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative p-3 bg-gradient-to-br from-indigo-50 to-indigo-100/60 text-indigo-600 rounded-2xl border border-indigo-100/80 shadow-sm flex items-center justify-center w-12 h-12">
                      <BookOpen className="w-6 h-6 relative z-10" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                        {course.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">Tuition: {formatNaira(course.price)}</p>
                    </div>
                  </div>

                </div>



                {/* Pre-payment fallback note */}
                {!track && !isPaid && (
                  <div className="pt-3 border-t border-slate-100 mt-2">
                    <p className="text-xs text-slate-400 italic">4-week track activates after payment confirmation.</p>
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

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
        .catch(() => {})
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

            const weekProgresses = track
              ? [track.week1Progress, track.week2Progress, track.week3Progress, track.week4Progress]
              : [fallbackProgress, 0, 0, 0];

            const startFormatted = track
              ? new Date(track.startDate).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })
              : null;
            const endFormatted = track
              ? new Date(track.endDate).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })
              : null;

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
                  {track && (
                    <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      track.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                        : track.status === "expired"
                        ? "bg-rose-50 text-rose-600 border-rose-200/60"
                        : "bg-indigo-50 text-indigo-700 border-indigo-100/60"
                    }`}>
                      {track.status === "completed" ? "Completed" : track.status === "expired" ? "Expired" : `Week ${currentWeek}/4`}
                    </span>
                  )}
                </div>

                {/* Overall progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-600">Overall Progress</span>
                    <span className="text-indigo-600">{overallProgress}% Completed</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${overallProgress}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className={`h-full bg-gradient-to-r ${cardGradient} rounded-full`}
                    />
                  </div>
                </div>

                {/* 4-week breakdown — only shown when a track exists */}
                {track && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Weekly Breakdown</p>
                    <div className="grid grid-cols-4 gap-2">
                      {weekProgresses.map((wp, wi) => {
                        const weekNum = wi + 1;
                        const label = weekLabel(weekNum, currentWeek);
                        const barColor = weekColor(wp, weekNum, currentWeek);
                        const isCurrent = weekNum === currentWeek;
                        return (
                          <div key={weekNum} className={`rounded-2xl p-3 border transition-all ${isCurrent ? "border-indigo-200/70 bg-indigo-50/50" : "border-slate-100 bg-slate-50/50"}`}>
                            <p className={`text-[10px] font-bold uppercase tracking-wide mb-1.5 ${isCurrent ? "text-indigo-600" : "text-slate-400"}`}>
                              Wk {weekNum}
                            </p>
                            <div className="w-full h-2 bg-slate-200/60 rounded-full overflow-hidden mb-1.5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${wp}%` }}
                                transition={{ duration: 0.8, delay: wi * 0.1, ease: "easeOut" }}
                                className={`h-full ${barColor} rounded-full`}
                              />
                            </div>
                            <p className={`text-[10px] font-bold ${isCurrent ? "text-indigo-500" : wp >= 100 ? "text-emerald-600" : "text-slate-400"}`}>
                              {wp}%
                            </p>
                            <p className="text-[9px] text-slate-400 mt-0.5">{label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Date range & countdown */}
                {track && (
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{startFormatted} → {endFormatted}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${track.daysRemaining <= 7 && track.status === "active" ? "text-amber-600" : "text-slate-500"}`}>
                      <Clock className="w-3.5 h-3.5" />
                      {track.status === "completed"
                        ? "Course completed"
                        : track.daysRemaining > 0
                        ? `${track.daysRemaining} days left`
                        : "Track ended"}
                    </div>
                  </div>
                )}

                {/* Pre-payment fallback note */}
                {!track && !isPaid && (
                  <div className="pt-3 border-t border-slate-100">
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

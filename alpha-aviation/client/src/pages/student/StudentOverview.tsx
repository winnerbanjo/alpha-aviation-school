import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import {
  AlertCircle,
  Sparkles,
  BookOpen,
  X,
  CreditCard,
  GraduationCap,
  Award,
  Wallet,
  Receipt,
  CheckCircle2,
  Plane,
} from "lucide-react";
import { AgentBanner } from "@/components/agent/AgentBanner";
import { formatNaira } from "@/data/courseCatalog";
import { useNavigate } from "react-router-dom";
import { getMyCourseTracks, type CourseTrackItem } from "@/api";

export function StudentOverview() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [courseTracks, setCourseTracks] = useState<CourseTrackItem[]>([]);

  // The graduation modal shows once per browser session, the first time the
  // student is seen as graduated (including after a profile refresh).
  const [gradModalSeenBefore] = useState(() => sessionStorage.getItem("hasSeenGradModal") !== null);
  const [gradModalDismissed, setGradModalDismissed] = useState(false);
  const showGradModal = user?.status === "graduated" && !gradModalSeenBefore && !gradModalDismissed;
  const setShowGradModal = (open: boolean) => {
    if (!open) setGradModalDismissed(true);
  };

  useEffect(() => {
    if (showGradModal) sessionStorage.setItem("hasSeenGradModal", "true");
  }, [showGradModal]);

  // Fetch real course tracks when payment is confirmed
  useEffect(() => {
    if (user?.paymentStatus === "Paid") {
      getMyCourseTracks()
        .then((res) => { if (res?.success) setCourseTracks(res.data.tracks); })
        .catch(() => { });
    }
  }, [user?.paymentStatus]);

  const amountDue = user?.amountDue || 0;
  const amountPaid = user?.paymentStatus === "Paid" ? user?.totalCoursePrice : user?.amountPaid || 0;
  const enrollmentDate = user?.enrollmentDate
    ? new Date(user.enrollmentDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : null;

  const isGraduated = user?.status === "graduated";
  const isPending = user?.paymentStatus === "Pending";
  const isUnderReview = user?.paymentStatus === "Under Review";
  const displayName = user?.firstName || "Student";
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  };
  const isPaid = user?.paymentStatus === "Paid";
  const registeredCourses = user?.courseSelections || [];

  // Clearance Score: 50 pts payment + up to 50 pts from real track progress
  const avgTrackProgress = courseTracks.length
    ? Math.round(courseTracks.reduce((s, t) => s + t.overallProgress, 0) / courseTracks.length)
    : 0;
  let clearanceScore = 0;
  if (isPaid) {
    clearanceScore = 50 + Math.round(avgTrackProgress / 2);
  } else if (isUnderReview) {
    clearanceScore += 25;
  }
  if (user?.documentUrl && !isPaid) {
    clearanceScore = Math.min(100, clearanceScore + 25);
  }
  clearanceScore = Math.min(100, clearanceScore);

  return (
    <div className="space-y-8 pb-12">
      {/* ─── Agent Context Banner (for students enrolled via agent) ─────────── */}
      {user?.enrolledByAgent && (
        <AgentBanner
          agent={user.enrolledByAgent}
          paymentStatus={user.agentPaymentStatus || "Pending"}
        />
      )}

      {/* Dynamic Payment/Under Review Alert Banners — hidden for agent-enrolled students */}
      {!isGraduated && !user?.enrolledByAgent && (isPending || isUnderReview) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`tuition-banner flex flex-col items-start justify-between gap-4 rounded-panel border p-4 shadow-subtle sm:p-5 md:flex-row md:items-center ${isUnderReview
            ? "border-amber-200 bg-amber-50 text-amber-900"
            : "border-red-200 bg-red-50 text-red-900"
            }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isUnderReview ? "bg-amber-100" : "bg-red-100"}`}
            >
              <AlertCircle
                className={`w-5 h-5 ${isUnderReview ? "text-amber-700" : "text-red-700"}`}
              />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {isUnderReview
                  ? "Tuition Receipt Under Review"
                  : "Ground School Tuition Outstanding"}
              </p>
              <p className="mt-0.5 text-[13px] leading-relaxed opacity-80">
                {isUnderReview
                  ? "We are currently verifying your payment upload. Access clearance will update automatically once verified."
                  : `Please clear your outstanding balance of ${formatNaira(amountDue)} to unlock ground school modules.`}
              </p>
            </div>
          </div>
          {isPending && (
            <Button
              onClick={() => navigate("?step=selection")}
              size="sm"
              className="shrink-0"
            >
              <CreditCard className="w-3.5 h-3.5 mr-2" />
              Pay Tuition
            </Button>
          )}
        </motion.div>
      )}

      {/* Mobile Greeting (visible on mobile only) */}
      <div className="block lg:hidden">
        <span className="eyebrow text-[#1246C8]">Student dashboard</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tightest text-[#10264B]">
          {getGreeting()}, {displayName}!
        </h1>
        <p className="mt-2 text-[#53647C]">
          Ready to soar to new heights in your training today?
        </p>
      </div>

      {/* Flight progress — merged course progress, ground courses and boarding pass */}
      <section className="relative overflow-hidden rounded-stage bg-[#07152E] text-white shadow-float">
        <div aria-hidden className="absolute inset-0 bg-chart-grid mask-fade-b opacity-70" />
        <div aria-hidden className="absolute -right-32 -top-32 h-[380px] w-[380px] rounded-full bg-[#1246C8]/40 blur-[110px]" />

        <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="p-6 sm:p-8 lg:p-10">
            <span className="eyebrow text-[#8EAEFF]">Flight progress</span>
            <h2 className="mt-3 text-3xl font-bold leading-[1.1] tracking-tightest sm:text-4xl">
              Your training, <span className="text-gradient-sky">on course.</span>
            </h2>

            <div className="mt-8 grid grid-cols-1 items-center gap-8 md:grid-cols-[auto_minmax(0,1fr)]">
              {/* Left Column: Gauge */}
              <div className="flex flex-col items-center justify-center border-b border-white/10 pb-8 md:border-b-0 md:border-r md:pb-0 md:pr-8">
                <h3 className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EAEFF]">
                  Course Progress
                </h3>
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="url(#clearanceGrad)"
                      strokeWidth="8"
                      strokeDasharray={251.2}
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{
                        strokeDashoffset: 251.2 - (251.2 * clearanceScore) / 100,
                      }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="clearanceGrad"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#5B86FF" />
                        <stop offset="100%" stopColor="#DCE8FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-bold tracking-tightest tabular-nums text-white">
                      {avgTrackProgress}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Registered Ground Courses */}
              <div className="min-w-0 space-y-4">
                {registeredCourses.length > 0 ? (
                  <div className="space-y-5">
                    {registeredCourses.map((course, idx) => {
                      const track = courseTracks.find((t) => t.courseTitle === course.title);
                      const progressValue = track ? track.overallProgress : (user?.adminClearance ? 100 : isUnderReview ? 35 : 0);
                      const colorGradient = idx % 2 === 0 ? "from-[#1246C8] to-[#8EAEFF]" : "from-[#5B86FF] to-[#DCE8FF]";
                      return (
                        <div key={course.title} className="space-y-2">
                          <div className="flex justify-between items-center gap-3 text-sm font-semibold">
                            <span className="text-white/90 truncate max-w-[70%]">{course.title}</span>
                            <span className="text-[#8EAEFF] shrink-0 tabular-nums">({progressValue}%)</span>
                          </div>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressValue}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full bg-gradient-to-r ${colorGradient} rounded-full`}
                            />
                          </div>
                          {track && (
                            <p className="text-[11px] text-white/50 font-medium">
                              Week {track.currentWeek} of 4
                              {track.daysRemaining > 0 ? ` · ${track.daysRemaining} days remaining` : " · Track ended"}
                              {" · "}<span className={track.status === "completed" ? "text-emerald-300" : track.status === "expired" ? "text-red-300" : "text-[#8EAEFF]"}>{track.status.charAt(0).toUpperCase() + track.status.slice(1)}</span>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <BookOpen className="w-6 h-6 text-white/30 mx-auto mb-2" />
                    <p className="text-sm text-white/60">
                      No courses selected yet.
                    </p>
                    <Button
                      onClick={() => navigate("/dashboard/courses")}
                      size="sm"
                      className="mt-4"
                    >
                      Browse Course Catalog
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Boarding pass — enrolment & tuition summary */}
          <div className="relative flex flex-col justify-between gap-6 border-t-2 border-dashed border-white/15 bg-white/[0.03] p-6 sm:p-8 lg:border-l-2 lg:border-t-0">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#DCE8FF]">
                  Boarding pass
                </span>
                <Plane aria-hidden className="h-4 w-4 text-[#8EAEFF]" />
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5">
                <div className="col-span-2 min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Passenger</dt>
                  <dd className="mt-1 truncate text-base font-semibold text-white">
                    {user?.firstName} {user?.lastName}
                  </dd>
                </div>
                <div className="col-span-2 min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Program</dt>
                  <dd className="mt-1 text-sm font-semibold leading-snug text-white">
                    {registeredCourses[0]?.title || "—"}
                    {registeredCourses.length > 1 && (
                      <span className="ml-1.5 text-[#8EAEFF]">+{registeredCourses.length - 1} more</span>
                    )}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Student ID</dt>
                  <dd className="mt-1 truncate text-sm font-semibold tabular-nums text-white">
                    {user?.studentIdNumber || "—"}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Status</dt>
                  <dd className="mt-1.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${isPaid ? "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30" : "bg-amber-400/15 text-amber-300 ring-amber-400/30"}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {isPaid ? "Paid" : isUnderReview ? "Under Review" : "Pending"}
                    </span>
                  </dd>
                </div>
                <div className="col-span-2 min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Enrolled</dt>
                  <dd className="mt-1 truncate text-sm font-semibold text-white">
                    {enrollmentDate || "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl bg-white px-3 py-2.5">
              <div aria-hidden className="barcode h-10 w-full opacity-90" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Real Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Registered Courses Count */}
        <div
          onClick={() => navigate("/dashboard/courses")}
          className="group relative cursor-pointer overflow-hidden rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCE8FF] px-2.5 py-1 text-[11px] font-semibold text-[#1246C8]">
              Ground school
            </span>
          </div>
          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">
              Enrolled Courses
            </p>
            <h3 className="mt-2 text-3xl font-bold tracking-tightest text-[#10264B] tabular-nums">
              {registeredCourses.length}
            </h3>
          </div>
        </div>

        {/* Card 2: Tuition Paid (Real DB value) */}
        <div
          onClick={() => navigate("/dashboard/payments")}
          className="group relative cursor-pointer overflow-hidden rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/15">
              Tuition paid
            </span>
          </div>
          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">
              Total Paid
            </p>
            <h3 className="mt-2 truncate text-3xl font-bold tracking-tightest text-[#10264B] tabular-nums">
              {formatNaira(amountPaid ?? 0)}
            </h3>
          </div>
        </div>

        {/* Card 3: Amount Due (Real DB value) */}
        <div
          onClick={() => navigate("/dashboard/payments")}
          className="group relative cursor-pointer overflow-hidden rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated"
        >
          <div className="flex items-center justify-between">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${amountDue > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}
            >
              {amountDue > 0 ? (
                <Receipt className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${amountDue > 0 ? "bg-red-50 text-red-700 ring-red-600/15" : "bg-emerald-50 text-emerald-700 ring-emerald-600/15"}`}
            >
              {amountDue > 0 ? "Outstanding" : "Settled"}
            </span>
          </div>
          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">
              Amount Due
            </p>
            <h3 className="mt-2 truncate text-3xl font-bold tracking-tightest text-[#10264B] tabular-nums">
              {formatNaira(amountDue)}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Content Layout Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic & Profile Checklists Card */}
        <div className="lg:col-span-2 rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle">
          <span className="eyebrow text-[#1246C8]">Clearance</span>
          <h3 className="mt-2 mb-5 text-lg font-bold tracking-tighter text-[#10264B]">
            Academic & Profile Checklists
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#DCE2EB]/70 bg-[#F5F7FB] p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isPaid ? "bg-emerald-50 text-emerald-600" : isUnderReview ? "bg-amber-50 text-amber-600" : "bg-amber-50 text-amber-600"}`}
                >
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#10264B]">
                    Tuition Settlement
                  </p>
                  <p className="text-[13px] text-[#53647C] mt-0.5">
                    Payment milestone
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${isPaid ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15" : isUnderReview ? "bg-amber-50 text-amber-700 ring-amber-600/15" : "bg-amber-50 text-amber-700 ring-amber-600/15"}`}
              >
                {isPaid
                  ? "Completed"
                  : isUnderReview
                    ? "Under Review"
                    : "Pending"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#DCE2EB]/70 bg-[#F5F7FB] p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isGraduated ? "bg-emerald-50 text-emerald-600" : "bg-[#DCE8FF] text-[#1246C8]"}`}
                >
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#10264B]">
                    Graduation Status
                  </p>
                  <p className="text-[13px] text-[#53647C] mt-0.5">
                    Graduation clearance
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${isGraduated ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15" : "bg-[#DCE8FF] text-[#1246C8]"}`}
              >
                {isGraduated ? "Graduated" : "Not Yet"}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Info Card */}
        <div className="lg:col-span-1 flex flex-col rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle">
          <span className="eyebrow text-[#1246C8]">Passenger</span>
          <h3 className="mt-2 mb-5 text-lg font-bold tracking-tighter text-[#10264B]">
            Student Profile
          </h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1246C8] text-lg font-bold text-white shadow-glow">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="truncate text-base font-bold tracking-tight text-[#10264B]">
                {user?.firstName} {user?.lastName}
              </h4>
              <p className="truncate text-sm text-[#53647C]">{user?.email}</p>
              {user?.studentIdNumber && (
                <p className="mt-2 inline-flex items-center rounded-full bg-[#DCE8FF] px-2.5 py-1 text-[11px] font-semibold text-[#1246C8] tabular-nums">
                  ID: {user.studentIdNumber}
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={() => navigate("/dashboard/profile")}
            variant="outline"
            className="mt-auto w-full"
          >
            Go to Profile
          </Button>
        </div>
      </div>

      {/* High-fidelity graduation details modal */}
      <AnimatePresence>
        {showGradModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#07152E]/60 backdrop-blur-sm z-[100]"
              onClick={() => setShowGradModal(false)}
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md overflow-hidden rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-float pointer-events-auto"
              >
                <button
                  onClick={() => setShowGradModal(false)}
                  className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[#53647C] transition-colors hover:bg-[#F5F7FB] hover:text-[#10264B]"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center py-6">
                  <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-600/15">
                    <GraduationCap className="w-10 h-10 text-emerald-600" />
                    <Sparkles className="w-5 h-5 text-[#5B86FF] absolute -top-1 -right-1 animate-bounce" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tightest text-[#10264B]">
                    Congratulations!
                  </h2>
                  <p className="text-emerald-700 font-semibold text-sm mt-1">
                    You have officially graduated!
                  </p>

                  <p className="text-sm text-[#53647C] mt-4 leading-relaxed px-4">
                    Your flight ground training syllabus has been fully
                    completed. You can now download your official diploma
                    certificate and access permanent records.
                  </p>
                </div>

                <div className="space-y-2 mt-4">
                  <Button
                    className="w-full"
                    onClick={() => {
                      setShowGradModal(false);
                      navigate("/dashboard/certificate");
                    }}
                  >
                    View My Certificate
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowGradModal(false)}
                  >
                    Back to Overview
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

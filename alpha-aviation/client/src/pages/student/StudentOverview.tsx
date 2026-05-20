import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import {
  AlertCircle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  X,
  CreditCard,
  GraduationCap,
  FileText,
  ShieldCheck,
  Hourglass,
  Award,
} from "lucide-react";
import { formatNaira } from "@/data/courseCatalog";
import { useNavigate } from "react-router-dom";

export function StudentOverview() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showGradModal, setShowGradModal] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (user?.status === "graduated") {
      const hasSeenModal = sessionStorage.getItem("hasSeenGradModal");
      if (!hasSeenModal) {
        setShowGradModal(true);
        sessionStorage.setItem("hasSeenGradModal", "true");
      }
    }
  }, [user]);

  const amountDue = user?.amountDue || 0;
  const amountPaid = user?.amountPaid || 0;
  const totalCoursePrice = user?.totalCoursePrice || 0;
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

  // Compute a real Clearance Score (out of 100) based on DB values
  let clearanceScore = 0;
  if (isPaid) {
    clearanceScore += 50;
  } else if (isUnderReview) {
    clearanceScore += 25;
  }
  if (user?.documentUrl) {
    clearanceScore += 50;
  }

  // Dynamic AI Insight text based on real database attributes
  const getAIInsight = () => {
    if (clearanceScore === 100) {
      return "All clearances verified! Your ground school access is fully approved. Feel free to download resources and begin your courses.";
    }
    if (isUnderReview && user?.documentUrl) {
      return "Your tuition receipt is being reviewed by administration. Once verified, your course clearance will reach 100%.";
    }
    if (isPaid && !user?.documentUrl) {
      return "Tuition is fully paid, but your ID verification is pending. Please upload your identity document under Profile Settings to gain full clearance.";
    }
    if (isPending && user?.documentUrl) {
      return "ID verification uploaded. Please proceed to pay your outstanding tuition balance to activate ground school courses.";
    }
    return "Welcome to Alpha Aviation! To begin training, please complete your tuition payment and upload your identity verification document under Profile Settings.";
  };

  const Tabs = [
    {
      title: "enrolled courses",
      subTitle: "enrolledCourses",
      icon: BookOpen,
    },
    {
      title: "tuition paid",
      subTitle: "tuitionPaid",
      icon: CreditCard,
    },
    {
      title: "amount due",
      subTitle: "amountDue",
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Dynamic Payment/Under Review Alert Banners */}
      {!isGraduated && (isPending || isUnderReview) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`tuition-banner p-4 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0px_6px_24px_0px_rgba(0,0,0,0.05),0px_0px_0px_1px_rgba(0,0,0,0.08)] backdrop-blur-md ${
            isUnderReview
              ? "bg-amber-50/80 border-amber-200 text-amber-900"
              : "bg-rose-50/80 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl ${isUnderReview ? "bg-amber-100" : "bg-rose-100"}`}
            >
              <AlertCircle
                className={`w-5 h-5 ${isUnderReview ? "text-amber-700" : "text-rose-700"}`}
              />
            </div>
            <div>
              <p className="font-bold text-sm">
                {isUnderReview
                  ? "Tuition Receipt Under Review"
                  : "Ground School Tuition Outstanding"}
              </p>
              <p className="text-xs text-slate-600/90 mt-0.5">
                {isUnderReview
                  ? "We are currently verifying your payment upload. Access clearance will update automatically once verified."
                  : `Please clear your outstanding balance of ${formatNaira(amountDue)} to unlock ground school modules.`}
              </p>
            </div>
          </div>
          {isPending && (
            <Button
              onClick={() => navigate("?step=selection")}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-2xl py-2 px-4 text-xs transition-all shadow-sm shrink-0"
            >
              <CreditCard className="w-3.5 h-3.5 mr-2" />
              Pay Tuition
            </Button>
          )}
        </motion.div>
      )}

      {/* Mobile Greeting (visible on mobile only) */}
      <div className="block lg:hidden px-1">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {getGreeting()}, {displayName}!
        </h2>
        <p className="text-sm font-normal text-slate-500 mt-1">
          Ready to soar to new heights in your training today?
        </p>
      </div>

      {/* Core Real Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Registered Courses Count */}
        <div
          onClick={() => navigate("/dashboard/courses")}
          className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 relative overflow-hidden shadow-[0px_6px_24px_0px_rgba(0,0,0,0.05),0px_0px_0px_1px_rgba(0,0,0,0.08)]  hover:border-slate-300/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="relative p-3 bg-gradient-to-br from-indigo-50 to-indigo-100/60 text-indigo-600 rounded-2xl border border-indigo-100/80 shadow-sm overflow-hidden flex items-center justify-center w-12 h-12">
              <div className="absolute inset-0 bg-indigo-200/20 blur-sm rounded-full scale-75" />
              <svg
                className="w-6 h-6 relative z-10 text-indigo-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M22 10L12 5L2 10L12 15L22 10Z"
                  fill="currentColor"
                  fillOpacity="0.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 12.5V17C6 18 8.5 19.5 12 19.5C15.5 19.5 18 18 18 17V12.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 10.5V14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Ground school
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Courses
            </p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">
              {registeredCourses.length}
            </h3>
          </div>
        </div>

        {/* Card 2: Tuition Paid (Real DB value) */}
        <div
          onClick={() => navigate("/dashboard/payments")}
          className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-[0px_6px_24px_0px_rgba(0,0,0,0.05),0px_0px_0px_1px_rgba(0,0,0,0.08)]  hover:border-slate-300/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="relative p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-emerald-600 rounded-2xl border border-emerald-100/80 shadow-sm overflow-hidden flex items-center justify-center w-12 h-12">
              <div className="absolute inset-0 bg-emerald-200/20 blur-sm rounded-full scale-75" />
              <svg
                className="w-6 h-6 relative z-10 text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect
                  x="2"
                  y="5"
                  width="20"
                  height="14"
                  rx="2"
                  fill="currentColor"
                  fillOpacity="0.2"
                />
                <path
                  d="M2 9H22"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 14H10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 14L17 16L21 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Tuition paid
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Total Paid
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 truncate">
              {formatNaira(amountPaid)}
            </h3>
          </div>
        </div>

        {/* Card 3: Amount Due (Real DB value) */}
        <div
          onClick={() => navigate("/dashboard/payments")}
          className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-[0px_6px_24px_0px_rgba(0,0,0,0.05),0px_0px_0px_1px_rgba(0,0,0,0.08)]  hover:border-slate-300/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div
              className={`relative p-3 rounded-2xl border shadow-sm overflow-hidden flex items-center justify-center w-12 h-12 ${amountDue > 0 ? "bg-gradient-to-br from-rose-50 to-rose-100/60 text-rose-600 border-rose-100/80" : "bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-emerald-600 border-emerald-100/80"}`}
            >
              <div
                className={`absolute inset-0 blur-sm rounded-full scale-75 ${amountDue > 0 ? "bg-rose-200/20" : "bg-emerald-200/20"}`}
              />
              {amountDue > 0 ? (
                <svg
                  className="w-6 h-6 relative z-10 text-rose-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M5 3H19C20.1046 3 21 3.89543 21 5V21L18 19L15 21L12 19L9 21L6 19L3 21V5C3 3.89543 3.89543 3 5 3Z"
                    fill="currentColor"
                    fillOpacity="0.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 13H15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 17H13"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 7V9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="11"
                    r="0.5"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 relative z-10 text-emerald-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M5 3H19C20.1046 3 21 3.89543 21 5V21L18 19L15 21L12 19L9 21L6 19L3 21V5C3 3.89543 3.89543 3 5 3Z"
                    fill="currentColor"
                    fillOpacity="0.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 11L11 13L15 9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${amountDue > 0 ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"}`}
            >
              {amountDue > 0 ? "Outstanding" : "Settled"}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Amount Due
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 truncate">
              {formatNaira(amountDue)}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Content Layout Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Merged Course Progress & Ground Courses Row Card */}
        <div className="lg:col-span-3 bg-white/90 backdrop-blur-md  rounded-3xl p-6 shadow-[0px_6px_24px_0px_rgba(0,0,0,0.05),0px_0px_0px_1px_rgba(0,0,0,0.08)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Left Column: Gauge */}
            <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-8">
              <h3 className="text-base font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">
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
                    stroke="#f1f5f9"
                    strokeWidth="10"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#clearanceGrad)"
                    strokeWidth="10"
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
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-slate-900">
                    {clearanceScore}%
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Registered Ground Courses */}
            <div className="md:col-span-2 space-y-4">
              {registeredCourses.length > 0 ? (
                <div className="space-y-5">
                  {registeredCourses.map((course, idx) => {
                    const isCleared = user?.adminClearance;
                    const progressValue = isCleared
                      ? 100
                      : isUnderReview
                        ? 35
                        : 0;
                    const colorGradient =
                      idx % 2 === 0
                        ? "from-indigo-500 to-purple-600"
                        : "from-blue-500 to-indigo-600";
                    return (
                      <div key={course.title} className="space-y-1.5">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-slate-700 truncate max-w-[70%]">
                            {course.title}
                          </span>
                          <span className="text-indigo-600 shrink-0">
                            ({progressValue}%)
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressValue}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full bg-gradient-to-r ${colorGradient} rounded-full`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <BookOpen className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">
                    No courses selected yet.
                  </p>
                  <Button
                    onClick={() => navigate("/dashboard/courses")}
                    className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl px-3 py-1.5 text-[11px]"
                  >
                    Browse Course Catalog
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Academic & Profile Checklists Card */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-[0px_6px_24px_0px_rgba(0,0,0,0.05),0px_0px_0px_1px_rgba(0,0,0,0.08)]">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Academic & Profile Checklists
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${isPaid ? "bg-emerald-50 text-emerald-600" : isUnderReview ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`}
                >
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Tuition Settlement
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Payment milestone
                  </p>
                </div>
              </div>
              <span
                className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-full ${isPaid ? "bg-emerald-50 text-emerald-600" : isUnderReview ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`}
              >
                {isPaid
                  ? "Completed"
                  : isUnderReview
                    ? "Under Review"
                    : "Pending"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${isGraduated ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
                >
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Graduation Status
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Graduation clearance
                  </p>
                </div>
              </div>
              <span
                className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-full ${isGraduated ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
              >
                {isGraduated ? "Graduated" : "Not Yet"}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Info Card */}
        <div className="lg:col-span-1 bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-[0px_6px_24px_0px_rgba(0,0,0,0.05),0px_0px_0px_1px_rgba(0,0,0,0.08)]">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Student Profile
          </h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-2xl shrink-0 shadow-inner border border-indigo-200/50">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-slate-900 truncate">
                {user?.firstName} {user?.lastName}
              </h4>
              <p className="text-sm text-slate-500 truncate">{user?.email}</p>
              {user?.studentIdNumber && (
                <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md inline-block mt-1">
                  ID: {user.studentIdNumber}
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={() => navigate("/dashboard/profile")}
            variant="outline"
            className="w-full rounded-2xl py-2.5 text-sm font-bold border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
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
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100]"
              onClick={() => setShowGradModal(false)}
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto relative p-6"
              >
                <button
                  onClick={() => setShowGradModal(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100/50 transition-all z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-gradient-to-tr from-emerald-100 to-teal-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4 relative shadow-inner">
                    <GraduationCap className="w-10 h-10 text-emerald-600" />
                    <Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-1 animate-bounce" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">
                    Congratulations!
                  </h2>
                  <p className="text-emerald-700 font-bold text-sm mt-1">
                    You have officially graduated!
                  </p>

                  <p className="text-xs text-slate-500 mt-4 leading-relaxed px-4">
                    Your flight ground training syllabus has been fully
                    completed. You can now download your official diploma
                    certificate and access permanent records.
                  </p>
                </div>

                <div className="space-y-2 mt-4">
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl py-3 shadow-md shadow-indigo-600/20"
                    onClick={() => {
                      setShowGradModal(false);
                      navigate("/dashboard/certificate");
                    }}
                  >
                    View My Certificate
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-slate-500 hover:text-slate-700 font-bold rounded-2xl py-3"
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

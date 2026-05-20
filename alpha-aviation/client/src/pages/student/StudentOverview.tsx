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

  return (
    <div className="space-y-8 pb-12">
      {/* Dynamic Payment/Under Review Alert Banners */}
      {!isGraduated && (isPending || isUnderReview) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm backdrop-blur-md ${
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
              onClick={() => navigate("/dashboard/payments")}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-2xl py-2 px-4 text-xs transition-all shadow-sm shrink-0"
            >
              <CreditCard className="w-3.5 h-3.5 mr-2" />
              Pay Tuition
            </Button>
          )}
        </motion.div>
      )}

      {/* Core Real Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Registered Courses Count */}
        <div
          onClick={() => navigate("/dashboard/courses")}
          className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 relative overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100/50">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Ground school
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
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
          className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100/50">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Tuition paid
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
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
          className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div
              className={`p-3 rounded-2xl border ${amountDue > 0 ? "bg-rose-50 text-rose-600 border-rose-100/50" : "bg-emerald-50 text-emerald-600 border-emerald-100/50"}`}
            >
              <AlertCircle className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${amountDue > 0 ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"}`}
            >
              {amountDue > 0 ? "Outstanding" : "Settled"}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Amount Due
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 truncate">
              {formatNaira(amountDue)}
            </h3>
          </div>
        </div>

        {/* Card 4: Document Verification (Real DB Value / Placeholder graphic) */}
        {/* <div
          onClick={() => navigate("/dashboard/profile")}
          className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 relative overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all cursor-pointer group"
        > */}
        {/* <div className="flex items-center justify-between">
            <div
              className={`p-3 rounded-2xl border ${user?.documentUrl ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" : "bg-amber-50 text-amber-600 border-amber-100/50"}`}
            >
              <FileText className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user?.documentUrl ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"}`}
            >
              {user?.documentUrl ? "Uploaded" : "Pending"}
            </span>
          </div> */}
        {/* <div className="mt-4 pr-12">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Identity ID
            </p>
            <h3 className="text-xl font-black text-slate-900 mt-1.5 truncate">
              {user?.documentUrl ? "Verified Document" : "Verify Profile"}
            </h3>
          </div> */}

        {/* Avatar overlay graphic */}
        {/* <div className="absolute right-0 bottom-0 w-20 h-20 pointer-events-none transition-transform group-hover:scale-105 duration-300 flex items-end justify-end">
            {!avatarError ? (
              <img
                src="/student_pilot_3d.png"
                alt=""
                onError={() => setAvatarError(true)}
                className="w-18 h-18 object-contain"
              />
            ) : (
              <div className="w-14 h-14 mr-2 mb-2 bg-gradient-to-tr from-purple-100 to-indigo-100 border border-indigo-200 text-indigo-600 rounded-full flex items-center justify-center shadow-inner relative">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
              </div>
            )}
          </div> */}
        {/* </div> */}
      </div>

      {/* Main Content Layout Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Hand: Subject Performance & Status Updates */}
        <div className="lg:col-span-2 space-y-8">
          {/* Course Syllabus / Module Performance */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Registered Ground Courses
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ground school courses registered under your enrollment track
                </p>
              </div>
              <BookOpen className="w-5 h-5 text-indigo-500" />
            </div>

            {registeredCourses.length > 0 ? (
              <div className="space-y-5">
                {registeredCourses.map((course, idx) => {
                  // Determine actual display parameters based on clearance status
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
                    <div key={course.title} className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-700">{course.title}</span>
                        <span className="text-indigo-600">
                          {isCleared
                            ? "Unlocked"
                            : isUnderReview
                              ? "Pending Approval"
                              : "Locked"}{" "}
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
              <div className="text-center py-8">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">
                  No courses selected yet.
                </p>
                <Button
                  onClick={() => navigate("/dashboard/courses")}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl px-4 py-2 text-xs"
                >
                  Browse Course Catalog
                </Button>
              </div>
            )}

            {/* Profile Action Logs */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">
                Academic & Profile Checklists
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${isPaid ? "bg-emerald-50 text-emerald-600" : isUnderReview ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`}
                    >
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Tuition Settlement
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                        Payment verification milestone
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${isPaid ? "bg-emerald-50 text-emerald-600" : isUnderReview ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`}
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
                      className={`p-2.5 rounded-xl ${user?.documentUrl ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
                    >
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Identity Document Verification
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                        Profile document compliance check
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${user?.documentUrl ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
                  >
                    {user?.documentUrl ? "Uploaded" : "Required"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Hand: Clearances & Academic Outlines */}
        <div className="space-y-8">
          {/* Clearance Readiness SVG Gauge */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-6">
                Course Progress
              </h3>

              {/* SVG concentric circular progress gauge */}
              <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  {/* Outer circle track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="10"
                  />
                  {/* Outer circle progress */}
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
                  {/* Definitions for Gradients */}
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
                {/* Center score */}
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-slate-900">
                    {clearanceScore}%
                  </span>
                </div>
              </div>

              {/* Legends list */}
            </div>
          </div>
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

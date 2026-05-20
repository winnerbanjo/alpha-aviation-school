import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Clock, Unlock, Lock, GraduationCap } from "lucide-react";
import { formatNaira } from "@/data/courseCatalog";
import { Button } from "@/components/ui/button";

export function StudentCourses() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const courseSelections = user?.courseSelections || [];

  const isCleared = user?.adminClearance;
  const isUnderReview = user?.paymentStatus === "Under Review";

  const progressValue = isCleared ? 100 : isUnderReview ? 35 : 0;

  const courseModules = [
    "Air Law & ATC Procedures",
    "Aircraft General Knowledge",
    "Flight Performance & Planning",
    "Human Performance & Limitations",
    "Meteorology & Navigation",
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            My Enrolled Courses
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            Access study guides, course outlines, and monitor ground school
            clearance.
          </p>
        </div>
        <div className="flex items-center gap-2 w-fit flex-end justify-end bg-indigo-50/50 border border-indigo-100/60 rounded-2xl px-4 py-2 text-indigo-700 font-semibold text-sm">
          <GraduationCap className="w-4 h-4" />
          <span>
            Cleared Modules: {isCleared ? courseSelections.length : 0} /{" "}
            {courseSelections.length}
          </span>
        </div>
      </div>

      {courseSelections.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-12 text-center shadow-sm">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            No Courses Selected
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            You haven't enrolled in any courses yet. Please navigate to the
            catalog to choose a ground training track.
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
            const cardGradient =
              idx % 2 === 0
                ? "from-indigo-500 to-purple-600"
                : "from-blue-500 to-indigo-600";

            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                key={course.title}
                className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Visual glow element on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/10 to-purple-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div>
                  {/* Top card block: Icon & Badge */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="relative p-3 bg-gradient-to-br from-indigo-50 to-indigo-100/60 text-indigo-600 rounded-2xl border border-indigo-100/80 shadow-sm flex items-center justify-center w-12 h-12">
                      <BookOpen className="w-6 h-6 relative z-10" />
                    </div>
                  </div>

                  {/* Title and Price */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm font-semibold text-slate-500 mt-0.5">
                      Tuition: {formatNaira(course.price)}
                    </p>
                  </div>

                  {/* Progress Block */}
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-slate-600">Course Progress</span>
                      <span className="text-indigo-600">
                        {progressValue}% Completed
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressValue}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${cardGradient} rounded-full`}
                      />
                    </div>
                  </div>

                  {/* Curriculum modules preview list */}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

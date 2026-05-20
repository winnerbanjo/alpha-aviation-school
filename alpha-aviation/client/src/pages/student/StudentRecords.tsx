import { useAuthStore } from "@/store/authStore";
import { CheckCircle2, Calendar, BookOpen, Award, ShieldCheck, UserCheck } from "lucide-react";
import { formatNaira } from "@/data/courseCatalog";
import { motion } from "framer-motion";

export function StudentRecords() {
  const { user } = useAuthStore();
  const courseSelections = user?.courseSelections || [];
  const enrollmentDate = user?.enrollmentDate
    ? new Date(user.enrollmentDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Training Records
        </h1>
        <p className="text-sm font-normal text-slate-500 mt-1">
          View your academic history, course completion logs, and enrollment records.
        </p>
      </div>

      {/* Metrics Row Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Courses */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 relative overflow-hidden shadow-[0px_6px_24px_0px_rgba(0,0,0,0.05),0px_0px_0px_1px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <div className="relative p-3 bg-gradient-to-br from-indigo-50 to-indigo-100/60 text-indigo-600 rounded-2xl border border-indigo-100/80 shadow-sm overflow-hidden flex items-center justify-center w-12 h-12">
              <div className="absolute inset-0 bg-indigo-200/20 blur-sm rounded-full scale-75" />
              <BookOpen className="w-6 h-6 relative z-10 text-indigo-600" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100/30">
              Active tracks
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Tracks
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {courseSelections.length}
            </h3>
          </div>
        </div>

        {/* Card 2: Enrollment Date */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 relative overflow-hidden shadow-[0px_6px_24px_0px_rgba(0,0,0,0.05),0px_0px_0px_1px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <div className="relative p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-emerald-600 rounded-2xl border border-emerald-100/80 shadow-sm overflow-hidden flex items-center justify-center w-12 h-12">
              <div className="absolute inset-0 bg-emerald-200/20 blur-sm rounded-full scale-75" />
              <Calendar className="w-6 h-6 relative z-10 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/30">
              Verified Date
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Admission Date
            </p>
            <h3 className="text-xl font-black text-slate-900 mt-2 truncate">
              {enrollmentDate}
            </h3>
          </div>
        </div>

        {/* Card 3: Total Paid */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 relative overflow-hidden shadow-[0px_6px_24px_0px_rgba(0,0,0,0.05),0px_0px_0px_1px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <div className="relative p-3 bg-gradient-to-br from-purple-50 to-purple-100/60 text-purple-600 rounded-2xl border border-purple-100/80 shadow-sm overflow-hidden flex items-center justify-center w-12 h-12">
              <div className="absolute inset-0 bg-purple-200/20 blur-sm rounded-full scale-75" />
              <Award className="w-6 h-6 relative z-10 text-purple-600" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full border border-purple-100/30">
              Paid to date
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Total Fees Settled
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {formatNaira(user?.amountPaid || 0)}
            </h3>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Course History list */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="px-5 py-4 border-b border-slate-100/80 bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-900">Program Track History</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Enrolled ground school courses and their clearance statuses.</p>
          </div>
          <div className="p-6 space-y-3 flex-1">
            {courseSelections.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold">No course tracks registered yet.</p>
              </div>
            ) : (
              courseSelections.map((course, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={course.title}
                  className="flex items-center justify-between p-3.5 bg-slate-50/60 border border-slate-100/40 rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-sm font-bold text-slate-800">
                      {course.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100/30">
                    In Progress
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Account Details */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100/80 bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-900">Student Registration Information</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Admissions registry details and credential status parameters.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {user?.studentIdNumber && (
                <div className="p-4 bg-slate-50/60 border border-slate-100/40 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Student Registry ID</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {user.studentIdNumber}
                  </p>
                </div>
              )}
              <div className="p-4 bg-slate-50/60 border border-slate-100/40 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Admission Date</p>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  {enrollmentDate}
                </p>
              </div>
              <div className="p-4 bg-slate-50/60 border border-slate-100/40 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tuition Clearance</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-slate-800">
                    {user?.paymentStatus || "Pending"}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-slate-50/60 border border-slate-100/40 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Academic Registry Status</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-bold text-slate-800 uppercase">
                    {user?.status || "active"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

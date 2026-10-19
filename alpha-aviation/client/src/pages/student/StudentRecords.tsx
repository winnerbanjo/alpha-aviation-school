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
        <span className="eyebrow text-[#1246C8]">Logbook</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
          Training Records
        </h1>
        <p className="mt-2 text-[#53647C]">
          View your academic history, course completion logs, and enrollment records.
        </p>
      </div>

      {/* Metrics Row Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Courses */}
        <div className="relative overflow-hidden rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCE8FF] px-2.5 py-1 text-[11px] font-semibold text-[#1246C8]">
              Active tracks
            </span>
          </div>
          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">
              Enrolled Tracks
            </p>
            <h3 className="mt-2 text-3xl font-bold tracking-tightest text-[#10264B] tabular-nums">
              {courseSelections.length}
            </h3>
          </div>
        </div>

        {/* Card 2: Enrollment Date */}
        <div className="relative overflow-hidden rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/15">
              Verified Date
            </span>
          </div>
          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">
              Admission Date
            </p>
            <h3 className="mt-2 truncate text-2xl font-bold tracking-tighter text-[#10264B]">
              {enrollmentDate}
            </h3>
          </div>
        </div>

        {/* Card 3: Total Paid */}
        <div className="relative overflow-hidden rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
              <Award className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCE8FF] px-2.5 py-1 text-[11px] font-semibold text-[#1246C8]">
              Paid to date
            </span>
          </div>
          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">
              Total Fees Settled
            </p>
            <h3 className="mt-2 text-3xl font-bold tracking-tightest text-[#10264B] tabular-nums">
              {formatNaira(user?.amountPaid || 0)}
            </h3>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Course History list */}
        <div className="flex flex-col justify-between overflow-hidden rounded-panel border border-[#DCE2EB] bg-white shadow-subtle">
          <div className="border-b border-[#DCE2EB] px-6 py-5">
            <h3 className="text-base font-bold tracking-tight text-[#10264B]">Program Track History</h3>
            <p className="mt-1 text-[13px] text-[#53647C]">Enrolled ground school courses and their clearance statuses.</p>
          </div>
          <div className="p-6 space-y-2.5 flex-1">
            {courseSelections.length === 0 ? (
              <div className="py-12 text-center text-[#53647C]">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F7FB] ring-1 ring-[#DCE2EB]">
                  <BookOpen className="w-5 h-5 text-[#8C9AB0]" />
                </div>
                <p className="text-sm font-semibold">No course tracks registered yet.</p>
              </div>
            ) : (
              courseSelections.map((course, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={course.title}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#DCE2EB]/70 bg-[#F5F7FB] p-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-sm font-semibold text-[#172B49]">
                      {course.title}
                    </span>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#DCE8FF] px-2.5 py-1 text-[11px] font-semibold text-[#1246C8]">
                    In Progress
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Account Details */}
        <div className="overflow-hidden rounded-panel border border-[#DCE2EB] bg-white shadow-subtle">
          <div className="border-b border-[#DCE2EB] px-6 py-5">
            <h3 className="text-base font-bold tracking-tight text-[#10264B]">Student Registration Information</h3>
            <p className="mt-1 text-[13px] text-[#53647C]">Admissions registry details and credential status parameters.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {user?.studentIdNumber && (
                <div className="rounded-2xl border border-[#DCE2EB]/70 bg-[#F5F7FB] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Student Registry ID</p>
                  <p className="mt-1.5 text-sm font-semibold text-[#10264B] tabular-nums">
                    {user.studentIdNumber}
                  </p>
                </div>
              )}
              <div className="rounded-2xl border border-[#DCE2EB]/70 bg-[#F5F7FB] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Admission Date</p>
                <p className="mt-1.5 text-sm font-semibold text-[#10264B]">
                  {enrollmentDate}
                </p>
              </div>
              <div className="rounded-2xl border border-[#DCE2EB]/70 bg-[#F5F7FB] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Tuition Clearance</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-[#10264B]">
                    {user?.paymentStatus || "Pending"}
                  </span>
                </div>
              </div>
              <div className="rounded-2xl border border-[#DCE2EB]/70 bg-[#F5F7FB] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Academic Registry Status</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#1246C8]" />
                  <span className="text-sm font-semibold uppercase tracking-wide text-[#10264B]">
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

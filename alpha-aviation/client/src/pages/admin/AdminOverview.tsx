import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { StudentProfileModal } from "@/components/dashboard/StudentProfileModal";
import { useAdminData, formatNaira } from "@/hooks/useAdminData";
import { Users, DollarSign, CheckCircle2 } from "lucide-react";
import { AdminStudentTable } from "@/components/admin/AdminStudentTable";
import { AdminUserModal } from "@/components/admin/AdminUserModal";
import {
  AdminPageHeader,
  AdminPageShell,
  AdminPanel,
} from "@/components/admin/AdminDashboardUI";

export function AdminOverview() {
  const {
    enrolledStudents, displayTotalRevenue, displayPendingRevenue,
    safeStudents, loading, lastUpdated,
    fetchStudents, fetchFinancialStats,
    handleMarkAsPaid, handleStudentClick, handleWhatsAppReminder,
    handleDeleteStudent, handleStudentStatusChange, handleEditUser, handleSaveUser, statusUpdating,
    confirmDeleteStudent, deleteModalOpen, setDeleteModalOpen, studentToDelete, setStudentToDelete, deletingInProgress,
    selectedStudent, isProfileModalOpen, setIsProfileModalOpen,
    handleAdminClearanceChange, handleCertificateUploaded,
    userModalOpen, setUserModalOpen, editingUser, setEditingUser, userFormData, setUserFormData,
    courseTrackStats, fetchCourseTrackStats, handleUpdateWeekProgress,
  } = useAdminData();

  const recentStudents = safeStudents.slice(0, 10);

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Command Center"
        description="Overview of enrollments, payments, and recent student activity."
        meta={lastUpdated ? `Last updated: ${lastUpdated.toLocaleString()}` : undefined}
        onRefresh={() => { fetchStudents(); fetchFinancialStats(); fetchCourseTrackStats(); }}
      />

      {safeStudents.length === 0 && !loading && (
        <div className="rounded-panel border border-dashed border-[#C3CCDA] bg-white/70 p-5 text-[#172B49]">
          <p className="text-sm font-semibold text-[#10264B]">No students registered yet.</p>
          <p className="mt-1 text-sm text-[#53647C]">New enrollments will appear in this command center automatically.</p>
        </div>
      )}

      {/* ── Financial KPI Row ─────────────────────────────── */}
      <section className="relative overflow-hidden rounded-stage bg-[#07152E] text-white shadow-elevated">
        <div aria-hidden className="absolute inset-0 bg-chart-grid mask-fade-b opacity-70" />
        <div aria-hidden className="absolute -right-32 -top-32 h-[380px] w-[380px] rounded-full bg-[#1246C8]/40 blur-[110px]" />
        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow text-[#8EAEFF]">Financial snapshot</span>
              <h2 className="mt-3 text-2xl font-bold tracking-tighter sm:text-3xl">
                Enrolment and tuition, <span className="text-gradient-sky">at a glance</span>
              </h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-[#DCE8FF] backdrop-blur-md">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-panel border border-white/10 bg-white/10 md:grid-cols-3">
            <div className="flex flex-col bg-[#07152E]/90 p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#8EAEFF]">
                  <Users className="h-[18px] w-[18px]" />
                </span>
              </div>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EAEFF]">Enrolled Students</p>
              <p className="mt-2 text-3xl font-bold tracking-tightest tabular-nums text-white sm:text-4xl">{enrolledStudents}</p>
              <p className="mt-2 text-sm text-white/60">Total student accounts in the system</p>
            </div>
            <div className="flex flex-col bg-[#07152E]/90 p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/10 text-amber-300">
                  <DollarSign className="h-[18px] w-[18px]" />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300 ring-1 ring-amber-400/20">Pending</span>
              </div>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EAEFF]">Revenue Pending</p>
              <p className="mt-2 text-3xl font-bold tracking-tightest tabular-nums text-white sm:text-4xl">{formatNaira(displayPendingRevenue)}</p>
              <p className="mt-2 text-sm text-white/60">Expected from pending tuition records</p>
            </div>
            <div className="flex flex-col bg-[#07152E]/90 p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                  <CheckCircle2 className="h-[18px] w-[18px]" />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-400/20">Verified</span>
              </div>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EAEFF]">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold tracking-tightest tabular-nums text-white sm:text-4xl">{formatNaira(displayTotalRevenue)}</p>
              <p className="mt-2 text-sm text-white/60">Verified paid tuition revenue</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Course Tracking KPI Row ───────────────────────── */}
      <div>
        <div className="mb-4 flex items-center gap-4">
          <span className="eyebrow text-[#1246C8]">Course tracking</span>
          <div className="h-px flex-1 bg-[#DCE2EB]" />
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-[#DCE2EB] bg-[#DCE2EB] shadow-subtle md:grid-cols-4">

          {/* Active Tracks */}
          <div className="flex flex-col bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCE8FF] px-2.5 py-1 text-[11px] font-semibold text-[#1246C8]">Live</span>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">Active Tracks</p>
            <p className="mt-2 text-3xl font-bold tracking-tightest tabular-nums text-[#10264B]">{courseTrackStats.activeTracks}</p>
            <p className="mt-1.5 text-xs text-[#53647C]">Running 4-week programmes</p>
          </div>

          {/* Completed Tracks */}
          <div className="flex flex-col bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 4 12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">Completed</p>
            <p className="mt-2 text-3xl font-bold tracking-tightest tabular-nums text-[#10264B]">{courseTrackStats.completedTracks}</p>
            <p className="mt-1.5 text-xs text-[#53647C]">Courses at 100% progress</p>
          </div>

          {/* Expiring This Week */}
          <div className="flex flex-col bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinejoin="round" />
                  <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
                  <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
                </svg>
              </div>
              {courseTrackStats.expiringThisWeek > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-600/15">Attention</span>
              )}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">Expiring This Week</p>
            <p className="mt-2 text-3xl font-bold tracking-tightest tabular-nums text-[#10264B]">{courseTrackStats.expiringThisWeek}</p>
            <p className="mt-1.5 text-xs text-[#53647C]">Tracks ending within 7 days</p>
          </div>

          {/* Avg Progress */}
          <div className="flex flex-col bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round" />
                  <line x1="12" y1="20" x2="12" y2="4" strokeLinecap="round" />
                  <line x1="6" y1="20" x2="6" y2="14" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">Avg. Progress</p>
            <p className="mt-2 text-3xl font-bold tracking-tightest tabular-nums text-[#10264B]">{courseTrackStats.avgProgressAll}%</p>
            <p className="mt-1.5 text-xs text-[#53647C]">All active course tracks</p>
            {courseTrackStats.activeTracks > 0 && (
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#EEF2F8]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#1246C8] to-[#5B86FF] transition-all duration-700"
                  style={{ width: `${courseTrackStats.avgProgressAll}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {recentStudents.length > 0 && (
        <AdminPanel>
          <div className="flex items-center justify-between gap-4 border-b border-[#DCE2EB] px-6 py-5">
            <div>
              <h2 className="text-lg font-bold tracking-tighter text-[#10264B]">Recent Students</h2>
              <p className="mt-0.5 text-sm text-[#53647C]">Latest enrolled students and account status.</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#DCE8FF] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#1246C8]">
              {recentStudents.length} shown
            </span>
          </div>
          <AdminStudentTable
            students={recentStudents}
            loading={loading}
            statusUpdating={statusUpdating}
            onStatusChange={handleStudentStatusChange}
            onView={handleStudentClick}
            onEdit={handleEditUser}
            onWhatsApp={handleWhatsAppReminder}
            onDelete={handleDeleteStudent}
          />
        </AdminPanel>
      )}

      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        student={selectedStudent}
        onMarkAsPaid={handleMarkAsPaid}
        onWhatsAppReminder={handleWhatsAppReminder}
        onAdminClearanceChange={handleAdminClearanceChange}
        onCertificateUploaded={handleCertificateUploaded}
        onUpdateWeekProgress={handleUpdateWeekProgress}
      />

      <Modal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setStudentToDelete(null); }} title="Delete Student">
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[#53647C]">Are you sure you want to delete <span className="font-semibold text-[#10264B]">{studentToDelete?.firstName || studentToDelete?.email}</span>? This action cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => { setDeleteModalOpen(false); setStudentToDelete(null); }}>Cancel</Button>
            <Button className="bg-red-600 text-white !shadow-none hover:bg-red-700" onClick={confirmDeleteStudent} disabled={deletingInProgress}>
              {deletingInProgress ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      <AdminUserModal
        isOpen={userModalOpen}
        editingUser={editingUser}
        userFormData={userFormData}
        setUserFormData={setUserFormData}
        onClose={() => { setUserModalOpen(false); setEditingUser(null); }}
        onSave={handleSaveUser}
      />
    </AdminPageShell>
  );
}

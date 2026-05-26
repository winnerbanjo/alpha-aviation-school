import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { StudentProfileModal } from "@/components/dashboard/StudentProfileModal";
import { useAdminData, formatNaira } from "@/hooks/useAdminData";
import { Users, DollarSign, CheckCircle2 } from "lucide-react";
import { AdminStudentTable } from "@/components/admin/AdminStudentTable";
import { AdminUserModal } from "@/components/admin/AdminUserModal";
import {
  AdminMetricCard,
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
    selectedStudent, setSelectedStudent, isProfileModalOpen, setIsProfileModalOpen,
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
        <div className="p-4 rounded-3xl bg-slate-50/90 border border-slate-200/60 text-slate-700 shadow-sm">
          <p className="text-sm font-bold">No students registered yet.</p>
          <p className="text-xs text-slate-500 mt-1">New enrollments will appear in this command center automatically.</p>
        </div>
      )}

      {/* ── Financial KPI Row ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminMetricCard label="Enrolled Students" value={enrolledStudents} helper="Total student accounts in the system" icon={Users} accent="indigo" badge="Live" />
        <AdminMetricCard label="Revenue Pending" value={formatNaira(displayPendingRevenue)} helper="Expected from pending tuition records" icon={DollarSign} accent="amber" />
        <AdminMetricCard label="Total Revenue" value={formatNaira(displayTotalRevenue)} helper="Verified paid tuition revenue" icon={CheckCircle2} accent="emerald" badge="Verified" />
      </div>

      {/* ── Course Tracking KPI Row ───────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Course Tracking</span>
          <div className="flex-1 h-px bg-slate-200/70" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {/* Active Tracks */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-5 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.04),0px_0px_0px_1px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100/60">
                <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/40">Live</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{courseTrackStats.activeTracks}</p>
            <p className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-wide">Active Tracks</p>
            <p className="text-[11px] text-slate-400 mt-1">Running 4-week programmes</p>
          </div>

          {/* Completed Tracks */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-5 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.04),0px_0px_0px_1px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100/60">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 4 12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{courseTrackStats.completedTracks}</p>
            <p className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-wide">Completed</p>
            <p className="text-[11px] text-slate-400 mt-1">Courses at 100% progress</p>
          </div>

          {/* Expiring This Week */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-5 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.04),0px_0px_0px_1px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100/60">
                <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinejoin="round" />
                  <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
                  <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
                </svg>
              </div>
              {courseTrackStats.expiringThisWeek > 0 && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">Attention</span>
              )}
            </div>
            <p className="text-2xl font-black text-slate-900">{courseTrackStats.expiringThisWeek}</p>
            <p className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-wide">Expiring This Week</p>
            <p className="text-[11px] text-slate-400 mt-1">Tracks ending within 7 days</p>
          </div>

          {/* Avg Progress */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-5 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.04),0px_0px_0px_1px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100/60">
                <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round" />
                  <line x1="12" y1="20" x2="12" y2="4" strokeLinecap="round" />
                  <line x1="6" y1="20" x2="6" y2="14" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{courseTrackStats.avgProgressAll}%</p>
            <p className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-wide">Avg. Progress</p>
            <p className="text-[11px] text-slate-400 mt-1">All active course tracks</p>
            {courseTrackStats.activeTracks > 0 && (
              <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${courseTrackStats.avgProgressAll}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {recentStudents.length > 0 && (
        <AdminPanel>
          <div className="px-5 py-4 border-b border-slate-100/80 bg-slate-50/50 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Students</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest enrolled students and account status.</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100/30">
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
          <p className="text-slate-600">Are you sure you want to delete <span className="font-semibold text-slate-900">{studentToDelete?.firstName || studentToDelete?.email}</span>? This action cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => { setDeleteModalOpen(false); setStudentToDelete(null); }}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDeleteStudent} disabled={deletingInProgress}>
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

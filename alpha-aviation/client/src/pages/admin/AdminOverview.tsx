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
    confirmDeleteStudent, deleteModalOpen, setDeleteModalOpen, studentToDelete, deletingInProgress,
    selectedStudent, setSelectedStudent, isProfileModalOpen, setIsProfileModalOpen,
    handleAdminClearanceChange, handleCertificateUploaded,
    userModalOpen, setUserModalOpen, editingUser, setEditingUser, userFormData, setUserFormData,
  } = useAdminData();

  const recentStudents = safeStudents.slice(0, 10);

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Command Center"
        description="Overview of enrollments, payments, and recent student activity."
        meta={lastUpdated ? `Last updated: ${lastUpdated.toLocaleString()}` : undefined}
        onRefresh={() => { fetchStudents(); fetchFinancialStats(); }}
      />

      {safeStudents.length === 0 && !loading && (
        <div className="p-4 rounded-3xl bg-slate-50/90 border border-slate-200/60 text-slate-700 shadow-sm">
          <p className="text-sm font-bold">No students registered yet.</p>
          <p className="text-xs text-slate-500 mt-1">New enrollments will appear in this command center automatically.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminMetricCard label="Enrolled Students" value={enrolledStudents} helper="Total student accounts in the system" icon={Users} accent="indigo" badge="Live" />
        <AdminMetricCard label="Revenue Pending" value={formatNaira(displayPendingRevenue)} helper="Expected from pending tuition records" icon={DollarSign} accent="amber" />
        <AdminMetricCard label="Total Revenue" value={formatNaira(displayTotalRevenue)} helper="Verified paid tuition revenue" icon={CheckCircle2} accent="emerald" badge="Verified" />
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

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { StudentProfileModal } from "@/components/dashboard/StudentProfileModal";
import { useAdminData, formatNaira } from "@/hooks/useAdminData";
import type { StudentStatus } from "@/hooks/useAdminData";
import { Users, DollarSign, CheckCircle2, Eye, MessageCircle, Trash2 } from "lucide-react";
import {
  AdminMetricCard,
  AdminPageHeader,
  AdminPageShell,
  AdminPanel,
} from "@/components/admin/AdminDashboardUI";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AdminOverview() {
  const {
    enrolledStudents, displayTotalRevenue, displayPendingRevenue,
    safeStudents, loading, error, authError, lastUpdated,
    fetchStudents, fetchFinancialStats,
    handleMarkAsPaid, handleStudentClick, handleWhatsAppReminder,
    handleDeleteStudent, handleStudentStatusChange, statusUpdating,
    confirmDeleteStudent, deleteModalOpen, setDeleteModalOpen, studentToDelete, deletingInProgress,
    selectedStudent, setSelectedStudent, isProfileModalOpen, setIsProfileModalOpen,
    handleAdminClearanceChange, handleCertificateUploaded,
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
          <div className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-900">Email</TableHead>
                  <TableHead className="text-slate-900">Student Name</TableHead>
                  <TableHead className="text-slate-900">Payment Status</TableHead>
                  <TableHead className="text-slate-900">Student Status</TableHead>
                  <TableHead className="text-right text-slate-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="animate-pulse">
                        <TableCell><div className="h-3.5 bg-slate-100 rounded w-40" /></TableCell>
                        <TableCell><div className="h-3.5 bg-slate-100 rounded w-28" /></TableCell>
                        <TableCell><div className="h-5 bg-slate-100 rounded-full w-16" /></TableCell>
                        <TableCell><div className="h-5 bg-slate-100 rounded-full w-20" /></TableCell>
                        <TableCell className="text-right"><div className="h-7 bg-slate-100 rounded-lg w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  : recentStudents.map((student) => (
                      <TableRow key={student._id} className="hover:bg-slate-50/70 transition-colors">
                        <TableCell className="font-medium text-slate-900">{student.email}</TableCell>
                        <TableCell>{student.firstName || ""} {student.lastName || ""}</TableCell>
                        <TableCell>
                          <Badge variant={student.paymentStatus === "Paid" ? "success" : "warning"}>
                            {student.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <select
                            value={student.status || "active"}
                            disabled={statusUpdating !== null}
                            onChange={(e) => handleStudentStatusChange(student._id, e.target.value as StudentStatus)}
                            className={`text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${student.status === "banned" ? "border-red-300 text-red-700" : student.status === "graduated" ? "border-green-300 text-green-700" : student.status === "suspended" ? "border-amber-300 text-amber-700" : "border-slate-200/50 text-slate-700"}`}
                          >
                            <option value="active">Active</option>
                            <option value="graduated">Graduated</option>
                            <option value="suspended">Suspended</option>
                            <option value="banned">Banned</option>
                          </select>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleStudentClick(student)} className="rounded-full hover:bg-slate-100" title="View">
                              <Eye className="w-4 h-4 text-slate-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleWhatsAppReminder(student)} className="rounded-full hover:bg-green-50" title="Send Reminder">
                              <MessageCircle className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteStudent(student)} className="rounded-full hover:bg-red-50" title="Delete">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
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
    </AdminPageShell>
  );
}

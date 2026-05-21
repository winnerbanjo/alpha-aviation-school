import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { StudentProfileModal } from "@/components/dashboard/StudentProfileModal";
import { useAdminData, formatNaira } from "@/hooks/useAdminData";
import type { StudentStatus } from "@/hooks/useAdminData";
import { Users, DollarSign, CheckCircle2, Eye, MessageCircle, Trash2, ChevronDown } from "lucide-react";
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

const getInitials = (firstName?: string, lastName?: string, email?: string) => {
  if (firstName || lastName) {
    return `${(firstName || "").charAt(0)}${(lastName || "").charAt(0)}`.toUpperCase();
  }
  return email ? email.substring(0, 2).toUpperCase() : "ST";
};

const getGradient = (str: string) => {
  const hash = str.split("").reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const gradients = [
    "from-indigo-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-violet-500 to-purple-500",
    "from-pink-500 to-rose-500",
    "from-amber-500 to-orange-500",
    "from-sky-500 to-cyan-500",
  ];
  return gradients[Math.abs(hash) % gradients.length];
};

const getStatusSelectStyles = (status?: string) => {
  switch (status) {
    case "graduated":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70";
    case "suspended":
      return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70";
    case "banned":
      return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100/70";
    default:
      return "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100/70";
  }
};

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
                <TableRow className="border-b border-slate-100/80 bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest py-4 px-6">Student</TableHead>
                  <TableHead className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest py-4 px-6">Payment Status</TableHead>
                  <TableHead className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest py-4 px-6">Student Status</TableHead>
                  <TableHead className="text-right text-[11px] font-extrabold text-slate-400 uppercase tracking-widest py-4 px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="animate-pulse">
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0" />
                            <div className="space-y-2">
                              <div className="h-3.5 bg-slate-100 rounded w-28" />
                              <div className="h-3 bg-slate-100 rounded w-40" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6"><div className="h-6 bg-slate-100 rounded-full w-20" /></TableCell>
                        <TableCell className="py-4 px-6"><div className="h-7 bg-slate-100 rounded-full w-28" /></TableCell>
                        <TableCell className="text-right py-4 px-6"><div className="h-8 bg-slate-100 rounded-lg w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  : recentStudents.map((student) => {
                      const initials = getInitials(student.firstName, student.lastName, student.email);
                      return (
                        <TableRow key={student._id} className="hover:bg-slate-50/50 transition-colors group">
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(initials)} flex items-center justify-center text-white text-sm font-semibold shadow-sm flex-shrink-0`}>
                                {initials}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-slate-900 text-sm leading-tight truncate">
                                  {student.firstName || student.lastName ? `${student.firstName || ""} ${student.lastName || ""}` : "Unregistered Student"}
                                </span>
                                <span className="text-xs text-slate-500 font-normal mt-0.5 truncate">
                                  {student.email}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            {student.paymentStatus === "Paid" ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Paid
                              </span>
                            ) : student.paymentStatus === "Under Review" ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                Under Review
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                            <div className="relative inline-block w-28">
                              <select
                                value={student.status || "active"}
                                disabled={statusUpdating !== null}
                                onChange={(e) => handleStudentStatusChange(student._id, e.target.value as StudentStatus)}
                                className={`w-full appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold rounded-full border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${getStatusSelectStyles(student.status)}`}
                              >
                                <option value="active" className="bg-white text-slate-800 font-normal">Active</option>
                                <option value="graduated" className="bg-white text-slate-800 font-normal">Graduated</option>
                                <option value="suspended" className="bg-white text-slate-800 font-normal">Suspended</option>
                                <option value="banned" className="bg-white text-slate-800 font-normal">Banned</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                                <ChevronDown className={`w-3.5 h-3.5 ${student.status === "graduated" ? "text-emerald-500" : student.status === "suspended" ? "text-amber-500" : student.status === "banned" ? "text-red-500" : "text-indigo-500"}`} />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-4 px-6" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" variant="ghost" onClick={() => handleStudentClick(student)} className="rounded-full hover:bg-slate-100/80 p-2" title="View">
                                <Eye className="w-4 h-4 text-slate-600" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleWhatsAppReminder(student)} className="rounded-full hover:bg-green-50 p-2" title="Send Reminder">
                                <MessageCircle className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteStudent(student)} className="rounded-full hover:bg-red-50 p-2" title="Delete">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

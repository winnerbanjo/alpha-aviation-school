import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminData } from "@/hooks/useAdminData";
import type { StudentStatus } from "@/hooks/useAdminData";
import { StudentProfileModal } from "@/components/dashboard/StudentProfileModal";
import { EmptyState } from "@/components/EmptyState";
import {
  Search, MessageCircleMore, SquarePen, Trash2, UserPlus, Upload,
  Loader2, ChevronLeft, ChevronRight, ChevronDown, UserRoundSearch,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminPageShell,
  AdminPanel,
} from "@/components/admin/AdminDashboardUI";

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

const courses = [
  "Aviation Fundamentals & Strategy",
  "Elite Cabin Crew & Safety Operations",
  "Travel & Tourism Management",
  "Airline Customer Service & Passenger Handling",
  "Aviation Safety & Security Awareness",
  "Ticketing & Reservation Systems (GDS Training)",
];

export function AdminStudents() {
  const {
    loading, error, lastUpdated, searchQuery, setSearchQuery,
    paymentFilter, setPaymentFilter, statusFilter, setStatusFilter,
    currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    selectedStudents, filteredStudents, paginatedStudents,
    totalPages, fetchStudents, fetchFinancialStats,
    handleMarkAsPaid, handleStudentClick, handleBatchMarkAsPaid,
    handleStudentStatusChange, handleDeleteStudent, confirmDeleteStudent,
    handleBulkDelete, handleBulkSuspend, handleEditUser, handleSaveUser, handleCsvFileChange,
    handleCsvUpload, handleAdminClearanceChange, handleCertificateUploaded,
    handleWhatsAppReminder, handleInvite, toggleStudentSelection, toggleSelectAll,
    deleteModalOpen, setDeleteModalOpen, studentToDelete, deletingInProgress,
    bulkDeleteModalOpen, setBulkDeleteModalOpen, bulkSuspendModalOpen, setBulkSuspendModalOpen,
    userModalOpen, setUserModalOpen, editingUser, setEditingUser,
    userFormData, setUserFormData, csvModalOpen, setCsvModalOpen, csvPreview, csvFile,
    isProfileModalOpen, setIsProfileModalOpen, selectedStudent, statusUpdating,
  } = useAdminData();
  return (
    <AdminPageShell>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-3xl text-red-700 text-sm font-medium">
          Server Error: {error}
        </div>
      )}

      <AdminPageHeader
        title="Student Management"
        description="Search, update, import, and manage enrolled students."
        meta={lastUpdated ? `Last updated: ${lastUpdated.toLocaleString()}` : undefined}
        onRefresh={() => { fetchStudents(); fetchFinancialStats(); }}
      />

      <AdminPanel className="p-5">
        <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Payment:</span>
              <div className="flex gap-1 border border-slate-200/70 rounded-2xl p-1 bg-white">
                <button onClick={() => setPaymentFilter("all")} className={`px-3 py-1.5 text-sm font-bold rounded-xl transition-colors ${paymentFilter === "all" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"}`}>All</button>
                <button onClick={() => setPaymentFilter("Pending")} className={`px-3 py-1.5 text-sm font-bold rounded-xl transition-colors ${paymentFilter === "Pending" ? "bg-amber-100 text-amber-900" : "text-slate-600 hover:text-slate-900"}`}>Pending</button>
                <button onClick={() => setPaymentFilter("Paid")} className={`px-3 py-1.5 text-sm font-bold rounded-xl transition-colors ${paymentFilter === "Paid" ? "bg-emerald-100 text-emerald-900" : "text-slate-600 hover:text-slate-900"}`}>Paid</button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="text-sm border border-slate-200/70 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="graduated">Graduated</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Show:</span>
              <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-sm border border-slate-200/70 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedStudents.size > 0 && (
            <>
              <Button onClick={handleBatchMarkAsPaid} className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white">
                Mark {selectedStudents.size} as Paid
              </Button>
              <Button onClick={() => setBulkSuspendModalOpen(true)} variant="outline" className="rounded-2xl border-amber-200 text-amber-700 hover:bg-amber-50">
                Suspend
              </Button>
              <Button onClick={() => setBulkDeleteModalOpen(true)} variant="outline" className="rounded-2xl border-red-200 text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-1" />
                Delete ({selectedStudents.size})
              </Button>
            </>
          )}
          <Button onClick={() => { setEditingUser(null); setUserFormData({ email: "", password: "", role: "student", firstName: "", lastName: "", phone: "", status: "active", paymentStatus: "Pending", amountDue: "", amountPaid: "", totalCoursePrice: "", enrolledCourse: "", studentIdNumber: "", adminClearance: false }); setUserModalOpen(true); }} className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
          <Button onClick={() => setCsvModalOpen(true)} variant="outline" className="rounded-2xl border-slate-200/70 bg-white">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={handleInvite} variant="outline" className="rounded-2xl border-slate-200/70 bg-white">
            <MessageCircleMore className="w-4 h-4 mr-2" />
            Invite via WhatsApp
          </Button>
        </div>
        </div>
      </AdminPanel>

      <AdminPanel>
        <div className="px-5 py-4 border-b border-slate-100/80 bg-slate-50/50 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Student Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage student records, payment status, and account status.</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100/30">
            {filteredStudents.length} records
          </span>
        </div>
        <div className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100/80 bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-12 py-4 px-6">
                  <input type="checkbox" checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0} onChange={toggleSelectAll} className="rounded border-slate-300 accent-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                </TableHead>
                <TableHead className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest py-4 px-6">Student</TableHead>
                <TableHead className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest py-4 px-6">Phone</TableHead>
                <TableHead className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest py-4 px-6">Payment Status</TableHead>
                <TableHead className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest py-4 px-6">Student Status</TableHead>
                <TableHead className="text-right text-[11px] font-extrabold text-slate-400 uppercase tracking-widest py-4 px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell className="py-4 px-6"><div className="h-4 w-4 bg-slate-100 rounded" /></TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0" />
                          <div className="space-y-2">
                            <div className="h-3.5 bg-slate-100 rounded w-28" />
                            <div className="h-3 bg-slate-100 rounded w-40" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6"><div className="h-3.5 bg-slate-100 rounded w-24" /></TableCell>
                      <TableCell className="py-4 px-6"><div className="h-6 bg-slate-100 rounded-full w-20" /></TableCell>
                      <TableCell className="py-4 px-6"><div className="h-7 bg-slate-100 rounded-full w-28" /></TableCell>
                      <TableCell className="text-right py-4 px-6"><div className="h-8 bg-slate-100 rounded-lg w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                : filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16">
                        <EmptyState type="students" message={searchQuery || paymentFilter !== "all" || statusFilter !== "all" ? "No students found matching your filters. Try adjusting your search or filter settings." : "No students registered yet. Waiting for first enrollment..."} />
                      </TableCell>
                    </TableRow>
                  )
                : paginatedStudents.map((student) => {
                    const initials = getInitials(student.firstName, student.lastName, student.email);
                    return (
                      <TableRow key={student._id} className="hover:bg-slate-50/50 transition-colors group">
                        <TableCell className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={selectedStudents.has(student._id)} onChange={() => toggleStudentSelection(student._id)} className="rounded border-slate-300 accent-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                        </TableCell>
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
                          {student.phone ? (
                            <span className="text-sm font-medium text-slate-700">{student.phone}</span>
                          ) : (
                            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100/50">Missing</span>
                          )}
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
                            <Button size="sm" variant="ghost" onClick={() => handleStudentClick(student)} className="rounded-full hover:bg-indigo-50 p-2" title="View profile">
                              <UserRoundSearch className="w-4 h-4 text-indigo-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleEditUser(student)} className="rounded-full hover:bg-sky-50 p-2" title="Edit student">
                              <SquarePen className="w-4 h-4 text-sky-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleWhatsAppReminder(student)} className="rounded-full hover:bg-green-50 p-2" title="Send Reminder">
                              <MessageCircleMore className="w-4 h-4 text-green-600" />
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
          {filteredStudents.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/30">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 bg-white font-bold text-xs shadow-sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-xs font-bold text-slate-600 px-3 py-1.5 bg-slate-100/80 rounded-xl">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 bg-white font-bold text-xs shadow-sm">
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </AdminPanel>

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        student={selectedStudent}
        onMarkAsPaid={handleMarkAsPaid}
        onWhatsAppReminder={handleWhatsAppReminder}
        onAdminClearanceChange={handleAdminClearanceChange}
        onCertificateUploaded={handleCertificateUploaded}
      />

      {/* Delete Confirmation Modal */}
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

      {/* Bulk Delete Confirmation Modal */}
      <Modal isOpen={bulkDeleteModalOpen} onClose={() => setBulkDeleteModalOpen(false)} title="Delete Multiple Users">
        <div className="space-y-4">
          <p className="text-slate-600">Are you sure you want to delete <span className="font-semibold text-slate-900">{selectedStudents.size} user(s)</span>? This action cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setBulkDeleteModalOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleBulkDelete} disabled={deletingInProgress}>
              {deletingInProgress ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</> : "Delete All"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Suspend Confirmation Modal */}
      <Modal isOpen={bulkSuspendModalOpen} onClose={() => setBulkSuspendModalOpen(false)} title="Suspend Multiple Users">
        <div className="space-y-4">
          <p className="text-slate-600">Are you sure you want to suspend <span className="font-semibold text-slate-900">{selectedStudents.size} user(s)</span>? They will lose access to their accounts.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setBulkSuspendModalOpen(false)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleBulkSuspend}>Suspend All</Button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit User Modal */}
      <Modal isOpen={userModalOpen} onClose={() => { setUserModalOpen(false); setEditingUser(null); }} title={editingUser ? "Edit Student Details" : "Add New User"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">First Name</label>
              <input type="text" value={userFormData.firstName} onChange={(e) => setUserFormData((prev) => ({ ...prev, firstName: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Last Name</label>
              <input type="text" value={userFormData.lastName} onChange={(e) => setUserFormData((prev) => ({ ...prev, lastName: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Doe" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
            <input type="email" value={userFormData.email} onChange={(e) => setUserFormData((prev) => ({ ...prev, email: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Phone</label>
            <input type="text" value={userFormData.phone} onChange={(e) => setUserFormData((prev) => ({ ...prev, phone: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+234..." />
          </div>
          {!editingUser && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Password</label>
              <input type="text" value={userFormData.password} onChange={(e) => setUserFormData((prev) => ({ ...prev, password: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Temporary password" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Role</label>
            <select value={userFormData.role} onChange={(e) => setUserFormData((prev) => ({ ...prev, role: e.target.value as "admin" | "student" }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {editingUser && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Account Status</label>
                  <select value={userFormData.status} onChange={(e) => setUserFormData((prev) => ({ ...prev, status: e.target.value as typeof prev.status }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="active">Active</option>
                    <option value="graduated">Graduated</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Payment Status</label>
                  <select value={userFormData.paymentStatus} onChange={(e) => setUserFormData((prev) => ({ ...prev, paymentStatus: e.target.value as typeof prev.paymentStatus }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Student ID Number</label>
                <input type="text" value={userFormData.studentIdNumber} onChange={(e) => setUserFormData((prev) => ({ ...prev, studentIdNumber: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ASL-2026-0000" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Enrolled Course</label>
                <select value={userFormData.enrolledCourse} onChange={(e) => setUserFormData((prev) => ({ ...prev, enrolledCourse: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Not assigned</option>
                  {courses.map((course) => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Amount Due</label>
                  <input type="number" min="0" value={userFormData.amountDue} onChange={(e) => setUserFormData((prev) => ({ ...prev, amountDue: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Amount Paid</label>
                  <input type="number" min="0" value={userFormData.amountPaid} onChange={(e) => setUserFormData((prev) => ({ ...prev, amountPaid: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Total Price</label>
                  <input type="number" min="0" value={userFormData.totalCoursePrice} onChange={(e) => setUserFormData((prev) => ({ ...prev, totalCoursePrice: e.target.value }))} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={userFormData.adminClearance} onChange={(e) => setUserFormData((prev) => ({ ...prev, adminClearance: e.target.checked }))} className="rounded border-slate-300" />
                Admin clearance completed
              </label>
            </>
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { setUserModalOpen(false); setEditingUser(null); }}>Cancel</Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveUser}>
              {editingUser ? "Update User" : "Create User"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* CSV Import Modal */}
      <Modal isOpen={csvModalOpen} onClose={() => { setCsvModalOpen(false); setCsvFile(null); setCsvPreview([]); }} title="Import Users via CSV">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Upload a CSV file with columns: email, password, firstName, lastName, phone, role, status</p>
          <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
            <label className="block cursor-pointer">
              <input type="file" accept=".csv" onChange={handleCsvFileChange} className="hidden" />
              <div className="flex flex-col items-center justify-center py-4">
                <Upload className="w-10 h-10 text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-900 mb-1">{csvFile ? csvFile.name : "Click to select CSV file"}</p>
                <p className="text-xs text-slate-500">CSV files only</p>
              </div>
            </label>
          </div>
          {csvPreview.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Preview ({csvPreview.length} users)</p>
              <div className="max-h-40 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-1">Email</th>
                      <th className="text-left py-1">Name</th>
                      <th className="text-left py-1">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-1">{row.email}</td>
                        <td className="py-1">{row.fullname || "N/A"}</td>
                        <td className="py-1">{row.role || "student"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { setCsvModalOpen(false); setCsvFile(null); setCsvPreview([]); }}>Cancel</Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCsvUpload} disabled={!csvPreview.length}>
              Import {csvPreview.length} Users
            </Button>
          </div>
        </div>
      </Modal>
    </AdminPageShell>
  );
}

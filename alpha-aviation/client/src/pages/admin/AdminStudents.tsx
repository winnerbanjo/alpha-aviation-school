import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useAdminData } from "@/hooks/useAdminData";
import { StudentProfileModal } from "@/components/dashboard/StudentProfileModal";
import {
  Search, MessageCircleMore, Trash2, UserPlus, Upload,
  Loader2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { AdminStudentTable } from "@/components/admin/AdminStudentTable";
import { AdminUserModal } from "@/components/admin/AdminUserModal";
import {
  AdminPageHeader,
  AdminPageShell,
  AdminPanel,
} from "@/components/admin/AdminDashboardUI";

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
    handleUpdateWeekProgress,
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
        <AdminStudentTable
          students={paginatedStudents}
          loading={loading}
          selectable
          selectedStudents={selectedStudents}
          allSelected={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
          emptyMessage={searchQuery || paymentFilter !== "all" || statusFilter !== "all" ? "No students found matching your filters. Try adjusting your search or filter settings." : "No students registered yet. Waiting for first enrollment..."}
          statusUpdating={statusUpdating}
          onToggleSelectAll={toggleSelectAll}
          onToggleStudentSelection={toggleStudentSelection}
          onStatusChange={handleStudentStatusChange}
          onView={handleStudentClick}
          onEdit={handleEditUser}
          onWhatsApp={handleWhatsAppReminder}
          onDelete={handleDeleteStudent}
        />
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
        onUpdateWeekProgress={handleUpdateWeekProgress}
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

      <AdminUserModal
        isOpen={userModalOpen}
        editingUser={editingUser}
        userFormData={userFormData}
        setUserFormData={setUserFormData}
        onClose={() => { setUserModalOpen(false); setEditingUser(null); }}
        onSave={handleSaveUser}
      />

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

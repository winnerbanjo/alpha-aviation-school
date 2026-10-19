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
    paymentFilter, setPaymentFilter, enrollmentFilter, setEnrollmentFilter, statusFilter, setStatusFilter,
    currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    selectedStudents, filteredStudents, paginatedStudents,
    totalPages, fetchStudents, fetchFinancialStats,
    handleMarkAsPaid, handleStudentClick, handleBatchMarkAsPaid,
    handleStudentStatusChange, handleDeleteStudent, confirmDeleteStudent,
    handleBulkDelete, handleBulkSuspend, handleEditUser, handleSaveUser, handleCsvFileChange,
    handleCsvUpload, handleAdminClearanceChange, handleCertificateUploaded,
    handleWhatsAppReminder, handleInvite, toggleStudentSelection, toggleSelectAll,
    deleteModalOpen, setDeleteModalOpen, studentToDelete, setStudentToDelete, deletingInProgress,
    bulkDeleteModalOpen, setBulkDeleteModalOpen, bulkSuspendModalOpen, setBulkSuspendModalOpen,
    userModalOpen, setUserModalOpen, editingUser, setEditingUser,
    userFormData, setUserFormData, csvModalOpen, setCsvModalOpen, csvPreview, setCsvPreview, csvFile, setCsvFile,
    isProfileModalOpen, setIsProfileModalOpen, selectedStudent, statusUpdating,
    handleUpdateWeekProgress,
  } = useAdminData();
  return (
    <AdminPageShell>
      {error && (
        <div className="rounded-panel border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          Server Error: {error}
        </div>
      )}

      <AdminPageHeader
        title="Student Management"
        description="Search, update, import, and manage enrolled students."
        meta={lastUpdated ? `Last updated: ${lastUpdated.toLocaleString()}` : undefined}
        onRefresh={() => { fetchStudents(); fetchFinancialStats(); }}
      />

      <AdminPanel className="p-4 sm:p-6">
        <div className="flex flex-col gap-5">
        <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9AB0]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-transparent bg-[#F5F7FB] py-2.5 pl-11 pr-4 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:bg-white focus:ring-4 focus:ring-[#1246C8]/10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Payment</span>
              <div className="flex gap-1 rounded-full border border-[#DCE2EB] bg-[#F5F7FB] p-1">
                <button onClick={() => setPaymentFilter("all")} className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${paymentFilter === "all" ? "bg-[#10264B] text-white shadow-subtle" : "text-[#53647C] hover:text-[#10264B]"}`}>All</button>
                <button onClick={() => setPaymentFilter("Pending")} className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${paymentFilter === "Pending" ? "bg-amber-100 text-amber-800 shadow-subtle" : "text-[#53647C] hover:text-[#10264B]"}`}>Pending</button>
                <button onClick={() => setPaymentFilter("Paid")} className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${paymentFilter === "Paid" ? "bg-emerald-100 text-emerald-800 shadow-subtle" : "text-[#53647C] hover:text-[#10264B]"}`}>Paid</button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Enrolled</span>
              <div className="flex gap-1 rounded-full border border-[#DCE2EB] bg-[#F5F7FB] p-1">
                <button onClick={() => setEnrollmentFilter("all")} className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${enrollmentFilter === "all" ? "bg-[#10264B] text-white shadow-subtle" : "text-[#53647C] hover:text-[#10264B]"}`}>All</button>
                <button onClick={() => setEnrollmentFilter("self")} className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${enrollmentFilter === "self" ? "bg-[#1246C8] text-white shadow-subtle" : "text-[#53647C] hover:text-[#10264B]"}`}>Self</button>
                <button onClick={() => setEnrollmentFilter("agent")} className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${enrollmentFilter === "agent" ? "bg-[#1246C8] text-white shadow-subtle" : "text-[#53647C] hover:text-[#10264B]"}`}>Agent</button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Status</span>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="cursor-pointer rounded-full border border-[#DCE2EB] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#172B49] outline-none transition focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10">
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="graduated">Graduated</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Show</span>
              <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="cursor-pointer rounded-full border border-[#DCE2EB] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#172B49] outline-none transition focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[#DCE2EB] pt-5">
          {selectedStudents.size > 0 && (
            <>
              <Button onClick={handleBatchMarkAsPaid} className="h-10 bg-emerald-600 text-white !shadow-none hover:bg-emerald-700">
                Mark {selectedStudents.size} as Paid
              </Button>
              <Button onClick={() => setBulkSuspendModalOpen(true)} variant="outline" className="h-10 border-amber-200 text-amber-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800">
                Suspend
              </Button>
              <Button onClick={() => setBulkDeleteModalOpen(true)} variant="outline" className="h-10 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-1" />
                Delete ({selectedStudents.size})
              </Button>
            </>
          )}
          <Button onClick={() => { setEditingUser(null); setUserFormData({ email: "", password: "", role: "student", firstName: "", lastName: "", phone: "", status: "active", paymentStatus: "Pending", amountDue: "", amountPaid: "", totalCoursePrice: "", enrolledCourse: "", studentIdNumber: "", adminClearance: false }); setUserModalOpen(true); }} className="h-10">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
          <Button onClick={() => setCsvModalOpen(true)} variant="outline" className="h-10">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={handleInvite} variant="outline" className="h-10">
            <MessageCircleMore className="w-4 h-4 mr-2" />
            Invite via WhatsApp
          </Button>
        </div>
        </div>
      </AdminPanel>

      <AdminPanel>
        <div className="flex items-center justify-between gap-4 border-b border-[#DCE2EB] px-6 py-5">
          <div>
            <h2 className="text-lg font-bold tracking-tighter text-[#10264B]">Student Directory</h2>
            <p className="mt-0.5 text-sm text-[#53647C]">Manage student records, payment status, and account status.</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#DCE8FF] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#1246C8]">
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
          <div className="flex flex-col gap-3 border-t border-[#DCE2EB] bg-[#F5F7FB]/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] tabular-nums text-[#53647C]">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="bg-white text-xs">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold tabular-nums text-[#10264B] ring-1 ring-[#DCE2EB]">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="bg-white text-xs">
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
          <p className="text-sm leading-relaxed text-[#53647C]">Are you sure you want to delete <span className="font-semibold text-[#10264B]">{studentToDelete?.firstName || studentToDelete?.email}</span>? This action cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => { setDeleteModalOpen(false); setStudentToDelete(null); }}>Cancel</Button>
            <Button className="bg-red-600 text-white !shadow-none hover:bg-red-700" onClick={confirmDeleteStudent} disabled={deletingInProgress}>
              {deletingInProgress ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal isOpen={bulkDeleteModalOpen} onClose={() => setBulkDeleteModalOpen(false)} title="Delete Multiple Users">
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[#53647C]">Are you sure you want to delete <span className="font-semibold text-[#10264B]">{selectedStudents.size} user(s)</span>? This action cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setBulkDeleteModalOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 text-white !shadow-none hover:bg-red-700" onClick={handleBulkDelete} disabled={deletingInProgress}>
              {deletingInProgress ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</> : "Delete All"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Suspend Confirmation Modal */}
      <Modal isOpen={bulkSuspendModalOpen} onClose={() => setBulkSuspendModalOpen(false)} title="Suspend Multiple Users">
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[#53647C]">Are you sure you want to suspend <span className="font-semibold text-[#10264B]">{selectedStudents.size} user(s)</span>? They will lose access to their accounts.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setBulkSuspendModalOpen(false)}>Cancel</Button>
            <Button className="bg-amber-600 text-white !shadow-none hover:bg-amber-700" onClick={handleBulkSuspend}>Suspend All</Button>
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
          <p className="text-sm leading-relaxed text-[#53647C]">Upload a CSV file with columns: email, password, firstName, lastName, phone, role, status</p>
          <div className="rounded-2xl border-2 border-dashed border-[#DCE2EB] bg-[#F5F7FB] p-6 transition-colors hover:border-[#1246C8]/50 hover:bg-[#DCE8FF]/30">
            <label className="block cursor-pointer">
              <input type="file" accept=".csv" onChange={handleCsvFileChange} className="hidden" />
              <div className="flex flex-col items-center justify-center py-4">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
                  <Upload className="w-5 h-5" />
                </span>
                <p className="mb-1 text-sm font-semibold text-[#10264B]">{csvFile ? csvFile.name : "Click to select CSV file"}</p>
                <p className="text-xs text-[#53647C]">CSV files only</p>
              </div>
            </label>
          </div>
          {csvPreview.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Preview ({csvPreview.length} users)</p>
              <div className="max-h-40 overflow-y-auto rounded-xl border border-[#DCE2EB]">
                <table className="w-full text-xs text-[#172B49]">
                  <thead>
                    <tr className="border-b border-[#DCE2EB] bg-[#F5F7FB]">
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[#53647C]">Email</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[#53647C]">Name</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[#53647C]">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-[#DCE2EB]/70 last:border-0">
                        <td className="px-3 py-2">{row.email}</td>
                        <td className="px-3 py-2">{row.fullname || "N/A"}</td>
                        <td className="px-3 py-2">{row.role || "student"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { setCsvModalOpen(false); setCsvFile(null); setCsvPreview([]); }}>Cancel</Button>
            <Button className="flex-1" onClick={handleCsvUpload} disabled={!csvPreview.length}>
              Import {csvPreview.length} Users
            </Button>
          </div>
        </div>
      </Modal>
    </AdminPageShell>
  );
}

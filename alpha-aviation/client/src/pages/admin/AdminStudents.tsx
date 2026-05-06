import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminData, StudentStatus } from "@/hooks/useAdminData";
import { StudentProfileModal } from "@/components/dashboard/StudentProfileModal";
import { EmptyState } from "@/components/EmptyState";
import {
  Search, MessageCircle, RefreshCw, Eye, Trash2, UserPlus, Upload,
  Loader2, ChevronLeft, ChevronRight, Pencil, EyeOff, X,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

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
    loading, error, authError, lastUpdated, searchQuery, setSearchQuery,
    paymentFilter, setPaymentFilter, statusFilter, setStatusFilter,
    currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    selectedStudents, setSelectedStudents, filteredStudents, paginatedStudents,
    totalPages, fetchStudents, fetchFinancialStats,
    handleMarkAsPaid, handleStudentClick, handleBatchMarkAsPaid, handleCourseChange,
    handleStudentStatusChange, handleDeleteStudent, confirmDeleteStudent,
    handleBulkDelete, handleBulkSuspend, handleSaveUser, handleCsvFileChange,
    handleCsvUpload, handleAdminClearanceChange, handleCertificateUploaded,
    handleWhatsAppReminder, handleInvite, toggleStudentSelection, toggleSelectAll,
    deleteModalOpen, setDeleteModalOpen, studentToDelete, deletingInProgress,
    bulkDeleteModalOpen, setBulkDeleteModalOpen, bulkSuspendModalOpen, setBulkSuspendModalOpen,
    userModalOpen, setUserModalOpen, editingUser, setEditingUser,
    userFormData, setUserFormData, csvModalOpen, setCsvModalOpen, csvPreview, csvFile,
    isProfileModalOpen, setIsProfileModalOpen, selectedStudent, statusUpdating,
  } = useAdminData();

  const { toast } = useToast();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-8 p-6"
    >
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
          Server Error: {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Student Management</h1>
          <p className="text-slate-500">View and manage all enrolled students</p>
          {lastUpdated && (
            <p className="text-xs text-slate-400 mt-1">Last updated: {lastUpdated.toLocaleString()}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => { fetchStudents(); fetchFinancialStats(); }} className="rounded-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Payment:</span>
              <div className="flex gap-1 border border-slate-200/50 rounded-lg p-1">
                <button onClick={() => setPaymentFilter("all")} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${paymentFilter === "all" ? "bg-[#0061FF] text-white" : "text-slate-600 hover:text-slate-900"}`}>All</button>
                <button onClick={() => setPaymentFilter("Pending")} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${paymentFilter === "Pending" ? "bg-[#007bff] text-white" : "text-slate-600 hover:text-slate-900"}`}>Pending</button>
                <button onClick={() => setPaymentFilter("Paid")} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${paymentFilter === "Paid" ? "bg-green-100 text-green-900" : "text-slate-600 hover:text-slate-900"}`}>Paid</button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="text-sm border border-slate-200/50 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 bg-white">
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="graduated">Graduated</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Show:</span>
              <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-sm border border-slate-200/50 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 bg-white">
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
              <Button onClick={handleBatchMarkAsPaid} className="rounded-full bg-[#0061FF] hover:bg-[#0052E6] text-white transition-all hover:scale-105">
                Mark {selectedStudents.size} as Paid
              </Button>
              <Button onClick={() => setBulkSuspendModalOpen(true)} variant="outline" className="rounded-full border-amber-200 text-amber-700 hover:bg-amber-50">
                Suspend
              </Button>
              <Button onClick={() => setBulkDeleteModalOpen(true)} variant="outline" className="rounded-full border-red-200 text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-1" />
                Delete ({selectedStudents.size})
              </Button>
            </>
          )}
          <Button onClick={() => { setEditingUser(null); setUserFormData({ email: "", password: "", role: "student", firstName: "", lastName: "", phone: "" }); setUserModalOpen(true); }} className="rounded-full bg-green-600 hover:bg-green-700 text-white transition-all hover:scale-105">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
          <Button onClick={() => setCsvModalOpen(true)} variant="outline" className="rounded-full border-slate-200/50">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={handleInvite} variant="outline" className="rounded-full border-slate-200/50">
            <MessageCircle className="w-4 h-4 mr-2" />
            Invite via WhatsApp
          </Button>
        </div>
      </div>

      <Card className="border-slate-200/50">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input type="checkbox" checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0} onChange={toggleSelectAll} className="rounded border-slate-300" />
                </TableHead>
                <TableHead className="text-slate-900">Email</TableHead>
                <TableHead className="text-slate-900">Student Name</TableHead>
                <TableHead className="text-slate-900">Payment Status</TableHead>
                <TableHead className="text-slate-900">Student Status</TableHead>
                <TableHead className="text-right text-slate-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell><div className="h-4 w-4 bg-slate-100 rounded" /></TableCell>
                      <TableCell><div className="h-3.5 bg-slate-100 rounded w-40" /></TableCell>
                      <TableCell><div className="h-3.5 bg-slate-100 rounded w-28" /></TableCell>
                      <TableCell><div className="h-5 bg-slate-100 rounded-full w-16" /></TableCell>
                      <TableCell><div className="h-5 bg-slate-100 rounded-full w-20" /></TableCell>
                      <TableCell className="text-right"><div className="h-7 bg-slate-100 rounded-lg w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                : filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16">
                        <EmptyState type="students" message={searchQuery || paymentFilter !== "all" || statusFilter !== "all" ? "No students found matching your filters. Try adjusting your search or filter settings." : "No students registered yet. Waiting for first enrollment..."} />
                      </TableCell>
                    </TableRow>
                  )
                : paginatedStudents.map((student) => (
                    <TableRow key={student._id} className="cursor-pointer hover:bg-slate-50 transition-colors">
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedStudents.has(student._id)} onChange={() => toggleStudentSelection(student._id)} className="rounded border-slate-300" />
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">{student.email}</TableCell>
                      <TableCell>{student.firstName || ""} {student.lastName || ""}{!student.firstName && !student.lastName && "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={student.paymentStatus === "Paid" ? "success" : "warning"}>{student.paymentStatus}</Badge>
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
          {filteredStudents.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="rounded-full">
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-slate-500">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="rounded-full">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
      <Modal isOpen={userModalOpen} onClose={() => { setUserModalOpen(false); setEditingUser(null); }} title={editingUser ? "Edit User" : "Add New User"}>
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
    </motion.div>
  );
}

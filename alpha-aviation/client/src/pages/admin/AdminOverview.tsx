import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { StudentProfileModal } from "@/components/dashboard/StudentProfileModal";
import { useAdminData, formatNaira } from "@/hooks/useAdminData";
import type { StudentStatus } from "@/hooks/useAdminData";
import { Users, DollarSign, CheckCircle2, RefreshCw, Eye, MessageCircle, Trash2 } from "lucide-react";
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-8 p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Command Center</h1>
          <p className="text-slate-500">Overview of your aviation school operations</p>
          {lastUpdated && (
            <p className="text-xs text-slate-400 mt-1">Last updated: {lastUpdated.toLocaleString()}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { fetchStudents(); fetchFinancialStats(); }}
          className="rounded-full"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {safeStudents.length === 0 && !loading && (
        <div className="p-4 rounded-lg bg-slate-100 border border-slate-200/50 text-slate-700">
          <p className="font-medium">No students registered yet. Waiting for first enrollment...</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-slate-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Enrolled Students</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{enrolledStudents}</p>
                </div>
                <div className="p-3 bg-[#0061FF]/10 rounded-lg">
                  <Users className="w-6 h-6 text-[#0061FF]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-slate-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Revenue Pending</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{formatNaira(displayPendingRevenue)}</p>
                </div>
                <div className="p-3 bg-[#007bff] rounded-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-slate-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{formatNaira(displayTotalRevenue)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {recentStudents.length > 0 && (
        <Card className="border-slate-200/50">
          <CardContent className="p-0 overflow-x-auto">
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
                      <TableRow key={student._id} className="hover:bg-slate-50 transition-colors">
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
          </CardContent>
        </Card>
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
    </motion.div>
  );
}

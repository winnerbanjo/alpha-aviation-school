import { useEffect, useState, useCallback, useRef } from "react";
import {
  getAllStudents,
  getFinancialStats,
  updatePaymentStatus,
  batchUpdatePaymentStatus,
  updateStudentStatus,
  createUser,
  updateUser,
  bulkImportUsers,
  deleteUser as apiDeleteUser,
  bulkDeleteUsers,
  bulkUpdateStatus,
  updateStudentCourse,
  getPendingPayments,
  approvePayment,
  rejectPayment,
} from "@/api";
import { useToast } from "@/components/ui/toast";

export type StudentStatus = "active" | "banned" | "graduated" | "suspended";

export type StudentStatusType = StudentStatus;

export interface Student {
  _id: string;
  email: string;
  role?: "admin" | "student";
  firstName?: string;
  lastName?: string;
  enrolledCourse?: string;
  paymentStatus: "Pending" | "Under Review" | "Paid";
  status?: StudentStatus;
  amountDue: number;
  amountPaid?: number;
  enrollmentDate?: string;
  phone?: string;
  adminClearance?: boolean;
  certificateUrl?: string;
  studentIdNumber?: string;
  paymentReceiptUrl?: string;
  totalCoursePrice?: number;
}

const emptyUserFormData = {
  email: "",
  password: "",
  role: "student" as "admin" | "student",
  firstName: "",
  lastName: "",
  phone: "",
  status: "active" as StudentStatus,
  paymentStatus: "Pending" as "Pending" | "Under Review" | "Paid",
  amountDue: "",
  amountPaid: "",
  totalCoursePrice: "",
  enrolledCourse: "",
  studentIdNumber: "",
  adminClearance: false,
};

export const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount || 0);

export function useAdminData() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalRevenuePendingCalc, setTotalRevenuePendingCalc] = useState(0);
  const [paymentFilter, setPaymentFilter] = useState<"all" | "Pending" | "Under Review" | "Paid">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkSuspendModalOpen, setBulkSuspendModalOpen] = useState(false);
  const [deletingInProgress, setDeletingInProgress] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Student | null>(null);
  const [userFormData, setUserFormData] = useState(emptyUserFormData);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  // Payment verification state
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  const { toast } = useToast();
  const fetchStudentsRef = useRef<((signal?: AbortSignal) => Promise<void>) | null>(null);
  const fetchFinancialStatsRef = useRef<((signal?: AbortSignal) => Promise<void>) | null>(null);

  const fetchStudents = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    setAuthError(false);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const response = await getAllStudents({ signal, headers });
      const raw = response?.data?.students ?? response?.students;
      const list = Array.isArray(raw) ? raw : [];
      setStudents(list);
      setLastUpdated(new Date());
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED" || err?.name === "AbortError") return;
      const status = err?.response?.status;
      const message: string = err?.response?.data?.message ?? err?.message ?? "Failed to load students from server.";
      if (status === 401 || message.toLowerCase().includes("not authorized")) {
        setAuthError(true);
        setError("Auth Failed: Token invalid for new server. Please re-login.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFinancialStats = useCallback(async (signal?: AbortSignal) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const response = await getFinancialStats({ signal, headers });
      setTotalRevenue(response?.data?.totalRevenue ?? 0);
      setTotalRevenuePendingCalc(response?.data?.revenuePending ?? 0);
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED" || err?.name === "AbortError") return;
      const status = err?.response?.status;
      if (status === 401) {
        setAuthError(true);
        setError("Auth Failed: Token invalid for new server. Please re-login.");
      }
    }
  }, []);

  fetchStudentsRef.current = fetchStudents;
  fetchFinancialStatsRef.current = fetchFinancialStats;

  useEffect(() => {
    const controller = new AbortController();
    fetchStudents(controller.signal);
    fetchFinancialStats(controller.signal);
    return () => controller.abort();
  }, [fetchStudents, fetchFinancialStats]);

  const safeStudents = Array.isArray(students) ? students : [];
  const calculatedTotalRevenue = safeStudents
    .filter((s) => s.paymentStatus === "Paid")
    .reduce((sum, s) => sum + (s.amountPaid || s.amountDue || 0), 0);
  const calculatedPendingRevenue = safeStudents
    .filter((s) => s.paymentStatus === "Pending")
    .reduce((sum, s) => sum + (s.amountDue || 0), 0);

  const displayTotalRevenue = totalRevenue > 0 || safeStudents.length === 0 ? totalRevenue : calculatedTotalRevenue;
  const displayPendingRevenue = totalRevenuePendingCalc > 0 || safeStudents.length === 0 ? totalRevenuePendingCalc : calculatedPendingRevenue;

  useEffect(() => {
    if (safeStudents.length > 0 && totalRevenue === 0) setTotalRevenue(calculatedTotalRevenue);
    if (safeStudents.length > 0 && totalRevenuePendingCalc === 0) setTotalRevenuePendingCalc(calculatedPendingRevenue);
  }, [students, calculatedTotalRevenue, calculatedPendingRevenue, totalRevenue, totalRevenuePendingCalc]);

  const handleMarkAsPaid = async (studentId: string) => {
    const student = students.find((s) => s._id === studentId);
    if (!student) return;
    const newStatus = student.paymentStatus === "Pending" ? "Paid" : "Pending";
    const newAmountPaid = newStatus === "Paid" ? student.amountDue : 0;
    const newAmountDue = newStatus === "Pending" ? student.amountDue : 0;
    setStudents((prev) =>
      (Array.isArray(prev) ? prev : []).map((s) =>
        s._id === studentId ? { ...s, paymentStatus: newStatus, amountPaid: newAmountPaid, amountDue: newAmountDue } : s
      )
    );
    try {
      await updatePaymentStatus(studentId);
      fetchFinancialStats();
    } catch (error) {
      setStudents((prev) =>
        (Array.isArray(prev) ? prev : []).map((s) =>
          s._id === studentId ? { ...s, paymentStatus: student.paymentStatus, amountPaid: student.amountPaid || 0, amountDue: student.amountDue } : s
        )
      );
      alert("Failed to update payment status");
    }
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsProfileModalOpen(true);
  };

  const handleBatchMarkAsPaid = async () => {
    if (selectedStudents.size === 0) { alert("Please select at least one student"); return; }
    try {
      await batchUpdatePaymentStatus(Array.from(selectedStudents));
      setSelectedStudents(new Set());
      await fetchStudents();
      await fetchFinancialStats();
      toast(`Marked ${selectedStudents.size} student(s) as paid`, "success");
    } catch (error) {
      toast("Failed to update payment status", "error");
    }
  };

  const handleCourseChange = async (studentId: string, newCourse: string) => {
    try {
      await updateStudentCourse(studentId, newCourse);
      await fetchStudents();
    } catch (error) {
      toast("Failed to update course", "error");
    }
  };

  const handleStudentStatusChange = async (studentId: string, status: StudentStatus) => {
    setStatusUpdating(studentId);
    const extraFields = status === "graduated" ? { paymentStatus: "Paid" as const, amountDue: 0 } : {};
    setStudents((prev) =>
      (Array.isArray(prev) ? prev : []).map((s) =>
        s._id === studentId ? { ...s, status, ...extraFields } : s
      )
    );
    setSelectedStudent((prev) =>
      prev && prev._id === studentId ? { ...prev, status, ...extraFields } : prev
    );
    try {
      await updateStudentStatus(studentId, status);
      toast(`Student status updated to "${status}"`, "success");
    } catch (error) {
      toast("Failed to update student status", "error");
      await fetchStudents();
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleDeleteStudent = (student: Student) => {
    setStudentToDelete(student);
    setDeleteModalOpen(true);
  };

  const handleEditUser = (student: Student) => {
    setEditingUser(student);
    setUserFormData({
      email: student.email || "",
      password: "",
      role: student.role || "student",
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      phone: student.phone || "",
      status: student.status || "active",
      paymentStatus: student.paymentStatus || "Pending",
      amountDue: student.amountDue !== undefined ? String(student.amountDue) : "",
      amountPaid: student.amountPaid !== undefined ? String(student.amountPaid) : "",
      totalCoursePrice: student.totalCoursePrice !== undefined ? String(student.totalCoursePrice) : "",
      enrolledCourse: student.enrolledCourse || "",
      studentIdNumber: student.studentIdNumber || "",
      adminClearance: Boolean(student.adminClearance),
    });
    setUserModalOpen(true);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      await apiDeleteUser(studentToDelete._id);
      setStudents((prev) => prev.filter((s) => s._id !== studentToDelete._id));
      setDeleteModalOpen(false);
      setStudentToDelete(null);
      toast("Student deleted", "success");
    } catch (error) {
      toast("Failed to delete student", "error");
    }
  };

  const handleBulkDelete = async () => {
    setDeletingInProgress(true);
    try {
      await bulkDeleteUsers(Array.from(selectedStudents));
      setStudents((prev) => prev.filter((s) => !selectedStudents.has(s._id)));
      setSelectedStudents(new Set());
      setBulkDeleteModalOpen(false);
      toast(`${selectedStudents.size} user(s) deleted`, "success");
    } catch (error) {
      toast("Failed to delete users", "error");
    } finally {
      setDeletingInProgress(false);
    }
  };

  const handleBulkSuspend = async () => {
    try {
      await bulkUpdateStatus(Array.from(selectedStudents), "suspended");
      setStudents((prev) =>
        prev.map((s) =>
          selectedStudents.has(s._id) ? { ...s, status: "suspended" as const } : s
        )
      );
      setSelectedStudents(new Set());
      setBulkSuspendModalOpen(false);
      toast(`${selectedStudents.size} user(s) suspended`, "success");
    } catch (error) {
      toast("Failed to suspend users", "error");
    }
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await updateUser(editingUser._id, {
          email: userFormData.email,
          firstName: userFormData.firstName,
          lastName: userFormData.lastName,
          phone: userFormData.phone,
          role: userFormData.role,
          status: userFormData.status,
          paymentStatus: userFormData.paymentStatus,
          amountDue: Number(userFormData.amountDue || 0),
          amountPaid: Number(userFormData.amountPaid || 0),
          totalCoursePrice: Number(userFormData.totalCoursePrice || 0),
          enrolledCourse: userFormData.enrolledCourse,
          studentIdNumber: userFormData.studentIdNumber,
          adminClearance: userFormData.adminClearance,
        });
        toast("User updated", "success");
      } else {
        await createUser(userFormData);
        toast("User created", "success");
      }
      await fetchStudents();
      setUserModalOpen(false);
      setUserFormData(emptyUserFormData);
      setEditingUser(null);
    } catch (error) {
      toast("Failed to save user", "error");
    }
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      const headerKeys = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s/g, ""));
      const parsed = lines.slice(1).map((line) => {
        const values = line.split(",");
        const row: any = {};
        headerKeys.forEach((key, idx) => {
          const value = values[idx]?.trim() || "";
          if (key === "email") row.email = value;
          else if (key === "password") row.password = value;
          else if (key === "role") row.role = value;
          else if (key === "firstname" || key === "first") row.firstName = value;
          else if (key === "lastname" || key === "last") row.lastName = value;
          else if (key === "phone" || key === "phonenumber") row.phone = value;
          else if (key === "status") row.status = value;
        });
        row.fullname = [row.firstName, row.lastName].filter(Boolean).join(" ");
        return row;
      }).filter((r) => r.email && r.password);
      setCsvPreview(parsed);
    };
    reader.readAsText(file);
    setCsvFile(file);
  };

  const handleCsvUpload = async () => {
    if (!csvPreview.length) return;
    try {
      await bulkImportUsers(csvPreview);
      toast(`Imported ${csvPreview.length} users`, "success");
      setCsvModalOpen(false);
      setCsvFile(null);
      setCsvPreview([]);
      await fetchStudents();
    } catch (error) {
      toast("Failed to import users", "error");
    }
  };

  const handleAdminClearanceChange = async (studentId: string, cleared: boolean) => {
    try {
      setStudents((prev) =>
        (Array.isArray(prev) ? prev : []).map((s) =>
          s._id === studentId ? { ...s, adminClearance: cleared } : s
        )
      );
    } catch (error) {
      toast("Failed to update admin clearance", "error");
      await fetchStudents();
    }
  };

  const handleCertificateUploaded = (studentId: string, url: string) => {
    setStudents((prev) =>
      (Array.isArray(prev) ? prev : []).map((s) =>
        s._id === studentId ? { ...s, certificateUrl: url } : s
      )
    );
    setSelectedStudent((prev) =>
      prev && prev._id === studentId ? { ...prev, certificateUrl: url } : prev
    );
  };

  const handleWhatsAppReminder = (student: Student) => {
    if (!student.phone?.trim()) {
      toast("This student has no phone number yet", "error");
      return;
    }

    const studentName = `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student";
    const amountDue = student.amountDue || 0;
    const message = encodeURIComponent(
      `Hello ${studentName}, this is Alpha Step Links Aviation School. A reminder of your balance: ${formatNaira(amountDue)}. Please complete your payment to continue your training program. Thank you!`
    );
    const phone = student.phone;
    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleInvite = () => {
    const message = encodeURIComponent(
      "Welcome to Alpha Step Links Aviation School! 🛫\n\nComplete your enrollment here: https://alphasteplinks.com/enroll\n\nWe offer world-class aviation training programs designed to launch your career. Join us today and take the first step towards your aviation dreams!"
    );
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const toggleStudentSelection = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) newSelected.delete(studentId);
    else newSelected.add(studentId);
    setSelectedStudents(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map((s) => s._id)));
    }
  };

  const enrolledStudents = safeStudents.length;

  const filteredStudents = safeStudents.filter((student) => {
    if (paymentFilter !== "all" && student.paymentStatus !== paymentFilter) return false;
    if (statusFilter !== "all" && student.status !== statusFilter) return false;
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${student.firstName || ""} ${student.lastName || ""}`.toLowerCase();
    const phone = (student.phone || "").toLowerCase();
    return student.email.toLowerCase().includes(searchLower) || fullName.includes(searchLower) || phone.includes(searchLower);
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Payment verification functions
  const fetchPendingPayments = async () => {
    try {
      setLoadingPayments(true);
      const response = await getPendingPayments();
      if (response?.success) setPendingPayments(response.data.payments || []);
    } catch (error: any) {
      toast(error.response?.data?.message || "Failed to load pending payments", "error");
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    try {
      setProcessingPayment(true);
      await approvePayment(paymentId);
      toast("Payment approved successfully", "success");
      setPendingPayments((prev) => prev.filter((p) => p._id !== paymentId));
      setSelectedPayment(null);
      fetchStudents();
      fetchFinancialStats();
    } catch (error: any) {
      toast(error.response?.data?.message || "Failed to approve payment", "error");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment || !rejectReason.trim()) {
      toast("Please provide a rejection reason", "error");
      return;
    }
    try {
      setProcessingPayment(true);
      await rejectPayment(selectedPayment._id, rejectReason.trim());
      toast("Payment rejected", "success");
      setPendingPayments((prev) => prev.filter((p) => p._id !== selectedPayment._id));
      setSelectedPayment(null);
      setRejectModalOpen(false);
      setRejectReason("");
      fetchStudents();
    } catch (error: any) {
      toast(error.response?.data?.message || "Failed to reject payment", "error");
    } finally {
      setProcessingPayment(false);
    }
  };

  return {
    students, loading, searchQuery, setSearchQuery, selectedStudents, setSelectedStudents,
    totalRevenue, totalRevenuePendingCalc, paymentFilter, setPaymentFilter, statusFilter, setStatusFilter,
    selectedStudent, setSelectedStudent, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    deleteModalOpen, setDeleteModalOpen, studentToDelete, setStudentToDelete,
    bulkDeleteModalOpen, setBulkDeleteModalOpen, bulkSuspendModalOpen, setBulkSuspendModalOpen,
    deletingInProgress, userModalOpen, setUserModalOpen, editingUser, setEditingUser,
    userFormData, setUserFormData, csvModalOpen, setCsvModalOpen, csvFile, setCsvFile,
    csvPreview, setCsvPreview, isProfileModalOpen, setIsProfileModalOpen,
    lastUpdated, error, authError, statusUpdating,
    pendingPayments, loadingPayments, selectedPayment, setSelectedPayment,
    rejectModalOpen, setRejectModalOpen, rejectReason, setRejectReason, processingPayment,
    toast, safeStudents, enrolledStudents, filteredStudents, paginatedStudents,
    displayTotalRevenue, displayPendingRevenue, totalPages,
    fetchStudents, fetchFinancialStats, fetchPendingPayments,
    handleMarkAsPaid, handleStudentClick, handleBatchMarkAsPaid, handleCourseChange,
    handleStudentStatusChange, handleDeleteStudent, confirmDeleteStudent,
    handleBulkDelete, handleBulkSuspend, handleEditUser, handleSaveUser, handleCsvFileChange,
    handleCsvUpload, handleAdminClearanceChange, handleCertificateUploaded,
    handleWhatsAppReminder, handleInvite, toggleStudentSelection, toggleSelectAll,
    handleApprovePayment, handleRejectPayment,
  };
}

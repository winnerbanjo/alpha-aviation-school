import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "@/api";
import {
  Users,
  CheckCircle2,
  Search,
  MessageCircle,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Plus,
  UserPlus,
  Upload,
} from "lucide-react";
import { StudentProfileModal } from "./StudentProfileModal";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/components/ui/toast";

type StudentStatus = "active" | "banned" | "graduated" | "suspended";

interface Student {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enrolledCourse?: string;
  paymentStatus: "Pending" | "Paid";
  status?: StudentStatus;
  amountDue: number;
  amountPaid?: number;
  enrollmentDate?: string;
  phone?: string;
  adminClearance?: boolean;
  certificateUrl?: string;
}

const courses = [
  "Aviation Fundamentals & Strategy",
  "Elite Cabin Crew & Safety Operations",
  "Travel & Tourism Management",
  "Airline Customer Service & Passenger Handling",
  "Aviation Safety & Security Awareness",
  "Ticketing & Reservation Systems (GDS Training)",
];

type AdminTab = "overview" | "students" | "revenue";
const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount || 0);

export function AdminDashboard({ activeTab }: { activeTab: AdminTab }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set(),
  );
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalRevenuePendingCalc, setTotalRevenuePendingCalc] = useState(0);
  const [paymentFilter, setPaymentFilter] = useState<
    "all" | "Pending" | "Paid"
  >("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // User creation/editing modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Student | null>(null);
  const [userFormData, setUserFormData] = useState({
    email: "",
    password: "",
    role: "student" as "admin" | "student",
    firstName: "",
    lastName: "",
    phone: "",
  });

  // CSV import
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const controller = new AbortController();

    fetchStudents(controller.signal);
    fetchFinancialStats(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  // Calculate stats from students array (fallback if API doesn't return data)
  const safeStudents = Array.isArray(students) ? students : [];
  const calculatedTotalRevenue = safeStudents
    .filter((s) => s.paymentStatus === "Paid")
    .reduce((sum, s) => sum + (s.amountPaid || s.amountDue || 0), 0);

  const calculatedPendingRevenue = safeStudents
    .filter((s) => s.paymentStatus === "Pending")
    .reduce((sum, s) => sum + (s.amountDue || 0), 0);

  // Use calculated values if API values are 0 but we have students
  const displayTotalRevenue =
    totalRevenue > 0 || safeStudents.length === 0
      ? totalRevenue
      : calculatedTotalRevenue;
  const displayPendingRevenue =
    totalRevenuePendingCalc > 0 || safeStudents.length === 0
      ? totalRevenuePendingCalc
      : calculatedPendingRevenue;

  // Update API values when students array changes (if API didn't return data)
  useEffect(() => {
    if (safeStudents.length > 0 && totalRevenue === 0) {
      setTotalRevenue(calculatedTotalRevenue);
    }
    if (safeStudents.length > 0 && totalRevenuePendingCalc === 0) {
      setTotalRevenuePendingCalc(calculatedPendingRevenue);
    }
  }, [
    students,
    calculatedTotalRevenue,
    calculatedPendingRevenue,
    totalRevenue,
    totalRevenuePendingCalc,
  ]);

  const fetchStudents = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    setAuthError(false);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      // Admin students: strictly https://asl-aviation-server.onrender.com/api/admin/students (no bugawheels)
      const response = await getAllStudents({ signal, headers });
      console.log("Admin Data:", response);
      console.log("Backend Response:", response?.data);
      const raw = response?.data?.students ?? response?.students;
      const list = Array.isArray(raw) ? raw : [];
      setStudents(list);
      setLastUpdated(new Date());
    } catch (err: any) {
      // Swallow aborts when user navigates away
      if (
        err?.name === "CanceledError" ||
        err?.code === "ERR_CANCELED" ||
        err?.name === "AbortError"
      ) {
        return;
      }
      console.error("Error fetching students:", err);
      const status = err?.response?.status;
      const message: string =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to load students from server.";

      if (status === 401 || message.toLowerCase().includes("not authorized")) {
        setAuthError(true);
        setError("Auth Failed: Token invalid for new server. Please re-login.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialStats = async (signal?: AbortSignal) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const response = await getFinancialStats({ signal, headers });
      setTotalRevenue(response?.data?.totalRevenue ?? 0);
      setTotalRevenuePendingCalc(response?.data?.revenuePending ?? 0);
    } catch (err: any) {
      if (
        err?.name === "CanceledError" ||
        err?.code === "ERR_CANCELED" ||
        err?.name === "AbortError"
      ) {
        return;
      }
      console.error("Error fetching financial stats:", err);
      const status = err?.response?.status;
      if (status === 401) {
        setAuthError(true);
        setError("Auth Failed: Token invalid for new server. Please re-login.");
      } else if (!error) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load financial stats.",
        );
      }
    }
  };

  const handleMarkAsPaid = async (studentId: string) => {
    const student = students.find((s) => s._id === studentId);
    if (!student) return;

    const newStatus = student.paymentStatus === "Pending" ? "Paid" : "Pending";
    const newAmountPaid = newStatus === "Paid" ? student.amountDue : 0;
    const newAmountDue = newStatus === "Pending" ? student.amountDue : 0;

    // Optimistic update - instant UI
    setStudents((prev) =>
      (Array.isArray(prev) ? prev : []).map((s) =>
        s._id === studentId
          ? {
              ...s,
              paymentStatus: newStatus,
              amountPaid: newAmountPaid,
              amountDue: newAmountDue,
            }
          : s,
      ),
    );

    try {
      await updatePaymentStatus(studentId);
      // Refresh stats in background
      fetchFinancialStats();
    } catch (error) {
      console.error("Error updating payment status:", error);
      // Revert on error
      setStudents((prev) =>
        (Array.isArray(prev) ? prev : []).map((s) =>
          s._id === studentId
            ? {
                ...s,
                paymentStatus: student.paymentStatus,
                amountPaid: student.amountPaid || 0,
                amountDue: student.amountDue,
              }
            : s,
        ),
      );
      alert("Failed to update payment status");
    }
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsProfileModalOpen(true);
  };

  const handleBatchMarkAsPaid = async () => {
    if (selectedStudents.size === 0) {
      alert("Please select at least one student");
      return;
    }

    try {
      await batchUpdatePaymentStatus(Array.from(selectedStudents));
      setSelectedStudents(new Set());
      await fetchStudents();
      await fetchFinancialStats();
      alert(`Marked ${selectedStudents.size} student(s) as paid`);
    } catch (error) {
      console.error("Error batch updating payment status:", error);
      alert("Failed to update payment status");
    }
  };

  const handleCourseChange = async (studentId: string, newCourse: string) => {
    try {
      await updateStudentCourse(studentId, newCourse);
      await fetchStudents();
    } catch (error) {
      console.error("Error updating course:", error);
      alert("Failed to update course");
    }
  };

  const handleStudentStatusChange = async (
    studentId: string,
    status: StudentStatus,
  ) => {
    setStatusUpdating(studentId);
    // Graduating a student automatically marks them as Paid
    const extraFields =
      status === "graduated"
        ? { paymentStatus: "Paid" as const, amountDue: 0 }
        : {};
    setStudents((prev) =>
      (Array.isArray(prev) ? prev : []).map((s) =>
        s._id === studentId ? { ...s, status, ...extraFields } : s,
      ),
    );
    // Also update selectedStudent snapshot so open modal reflects change
    setSelectedStudent((prev) =>
      prev && prev._id === studentId
        ? { ...prev, status, ...extraFields }
        : prev,
    );
    try {
      await updateStudentStatus(studentId, status);
      toast(`Student status updated to "${status}"`, "success");
    } catch (error) {
      console.error("Error updating student status:", error);
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

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      await apiDeleteUser(studentToDelete._id);
      setStudents((prev) => prev.filter((s) => s._id !== studentToDelete._id));
      setDeleteModalOpen(false);
      setStudentToDelete(null);
      toast("Student deleted", "success");
    } catch (error) {
      console.error("Error deleting student:", error);
      toast("Failed to delete student", "error");
    }
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        // Update existing user
        await updateUser(editingUser._id, {
          email: userFormData.email,
          firstName: userFormData.firstName,
          lastName: userFormData.lastName,
          phone: userFormData.phone,
          role: userFormData.role,
        });
        toast("User updated", "success");
      } else {
        // Create new user
        await createUser(userFormData);
        toast("User created", "success");
      }
      // Refetch to get updated list
      await fetchStudents();
      setUserModalOpen(false);
      setUserFormData({
        email: "",
        password: "",
        role: "student",
        firstName: "",
        lastName: "",
        phone: "",
      });
      setEditingUser(null);
    } catch (error) {
      console.error("Error saving user:", error);
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

      // Get header row and normalize
      const headerRow = lines[0];
      const headerKeys = headerRow
        .split(",")
        .map((h) => h.trim().toLowerCase().replace(/\s/g, ""));

      const parsed = lines
        .slice(1)
        .map((line) => {
          // Handle CSV with potential empty fields
          const values = line.split(",");
          const row: any = {};

          headerKeys.forEach((key, idx) => {
            const value = values[idx]?.trim() || "";

            // Map to proper keys
            if (key === "email") row.email = value;
            else if (key === "password") row.password = value;
            else if (key === "role") row.role = value;
            else if (key === "firstname" || key === "first")
              row.firstName = value;
            else if (key === "lastname" || key === "last") row.lastName = value;
            else if (key === "phone" || key === "phonenumber")
              row.phone = value;
            else if (key === "status") row.status = value;
          });

          // Combine name for display
          row.fullname = [row.firstName, row.lastName]
            .filter(Boolean)
            .join(" ");
          return row;
        })
        .filter((r) => r.email && r.password);

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
      console.error("Error importing users:", error);
      toast("Failed to import users", "error");
    }
  };

  const handleAdminClearanceChange = async (
    studentId: string,
    cleared: boolean,
  ) => {
    try {
      setStudents((prev) =>
        (Array.isArray(prev) ? prev : []).map((s) =>
          s._id === studentId ? { ...s, adminClearance: cleared } : s,
        ),
      );
      console.log(
        `Admin clearance ${cleared ? "granted" : "revoked"} for student ${studentId}`,
      );
    } catch (error) {
      console.error("Error updating admin clearance:", error);
      toast("Failed to update admin clearance", "error");
      await fetchStudents();
    }
  };

  const handleCertificateUploaded = (studentId: string, url: string) => {
    setStudents((prev) =>
      (Array.isArray(prev) ? prev : []).map((s) =>
        s._id === studentId ? { ...s, certificateUrl: url } : s,
      ),
    );
    setSelectedStudent((prev) =>
      prev && prev._id === studentId ? { ...prev, certificateUrl: url } : prev,
    );
  };

  const handleWhatsAppReminder = (student: Student) => {
    const studentName =
      `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
      "Student";
    const amountDue = student.amountDue || 0;

    const message = encodeURIComponent(
      `Hello ${studentName}, this is Alpha Step Links Aviation School. A reminder of your balance: ${formatNaira(amountDue)}. ` +
        `Please complete your payment to continue your training program. Thank you!`,
    );

    const phone = student.phone || "2341234567890";
    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleInvite = () => {
    const message = encodeURIComponent(
      "Welcome to Alpha Step Links Aviation School! 🛫\n\n" +
        "Complete your enrollment here: https://alphasteplinks.com/enroll\n\n" +
        "We offer world-class aviation training programs designed to launch your career. " +
        "Join us today and take the first step towards your aviation dreams!",
    );
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const toggleStudentSelection = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map((s) => s._id)));
    }
  };

  // Calculate stats (use safe list to avoid crash)
  const enrolledStudents = safeStudents.length;

  // Filter students based on search, payment status, and student status
  const filteredStudents = safeStudents.filter((student) => {
    // Payment status filter
    if (paymentFilter !== "all" && student.paymentStatus !== paymentFilter) {
      return false;
    }
    // Student status filter
    if (statusFilter !== "all" && student.status !== statusFilter) {
      return false;
    }
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const fullName =
      `${student.firstName || ""} ${student.lastName || ""}`.toLowerCase();
    return (
      student.email.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-6 text-slate-600">
        <div className="animate-pulse rounded-full h-10 w-10 border-2 border-[#0061FF] border-t-transparent mb-4" />
        <p className="text-lg font-medium">Loading Student Data...</p>
        <p className="text-sm text-slate-400 mt-1">Fetching from ASL server</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-medium text-red-800">
            {authError ? "Authentication Failed" : "Error loading dashboard"}
          </p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
        {authError ? (
          <Button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchStudents();
              fetchFinancialStats();
            }}
            className="rounded-full bg-[#0061FF] text-white"
          >
            Retry
          </Button>
        ) : (
          <Button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchStudents();
              fetchFinancialStats();
            }}
            className="rounded-full bg-[#0061FF] text-white"
          >
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-8 p-6"
    >
      {error && (
        <div
          style={{ color: "red" }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          Server Error: {error}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            {activeTab === "overview" && "Command Center"}
            {activeTab === "students" && "Student Management"}
            {activeTab === "revenue" && "Revenue Analytics"}
          </h1>
          <p className="text-slate-500">
            {activeTab === "overview" && "Manage students and track payments"}
            {activeTab === "students" &&
              "View and manage all enrolled students"}
            {activeTab === "revenue" && "Track revenue and payment analytics"}
          </p>
          {lastUpdated && (
            <p className="text-xs text-slate-400 mt-1">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              fetchStudents();
              fetchFinancialStats();
            }}
            className="rounded-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* No-data message when server returned empty list */}
      {safeStudents.length === 0 && (
        <div className="p-4 rounded-lg bg-slate-100 border border-slate-200/50 text-slate-700">
          <p className="font-medium">
            No students registered yet. Waiting for first enrollment...
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Data is loaded from the server. Use &quot;Refresh&quot; or
            &quot;Test Connection&quot; to verify.
          </p>
        </div>
      )}

      {/* Stats Cards - Show only on Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-slate-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">
                      Enrolled Students
                    </p>
                    <p className="text-3xl font-bold tracking-tight text-slate-900">
                      {enrolledStudents}
                    </p>
                  </div>
                  <div className="p-3 bg-[#0061FF]/10 rounded-lg">
                    <Users className="w-6 h-6 text-[#0061FF]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-slate-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">
                      Revenue Pending
                    </p>
                    <p className="text-3xl font-bold tracking-tight text-slate-900">
                      {formatNaira(displayPendingRevenue)}
                    </p>
                  </div>
                  <div className="p-3 bg-[#007bff] rounded-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-slate-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold tracking-tight text-slate-900">
                      {formatNaira(displayTotalRevenue)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Action Bar - Show on Overview and Students tabs */}
      {(activeTab === "overview" || activeTab === "students") && (
        <div className="flex flex-col gap-4">
          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Search Bar */}
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

            {/* Payment Status Filter */}
            <div className="flex items-center gap-4">
              {/* Payment Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  Payment:
                </span>
                <div className="flex gap-1 border border-slate-200/50 rounded-lg p-1">
                  <button
                    onClick={() => setPaymentFilter("all")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      paymentFilter === "all"
                        ? "bg-[#0061FF] text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setPaymentFilter("Pending")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      paymentFilter === "Pending"
                        ? "bg-[#007bff] text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setPaymentFilter("Paid")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      paymentFilter === "Paid"
                        ? "bg-green-100 text-green-900"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Paid
                  </button>
                </div>
              </div>
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  Status:
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-sm border border-slate-200/50 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 bg-white"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="graduated">Graduated</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              {/* Items per page */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  Show:
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="text-sm border border-slate-200/50 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 bg-white"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {selectedStudents.size > 0 && (
              <Button
                onClick={handleBatchMarkAsPaid}
                className="rounded-full bg-[#0061FF] hover:bg-[#0052E6] text-white transition-all hover:scale-105"
              >
                Mark {selectedStudents.size} as Paid
              </Button>
            )}
            <Button
              onClick={() => {
                setEditingUser(null);
                setUserFormData({
                  email: "",
                  password: "",
                  role: "student",
                  firstName: "",
                  lastName: "",
                  phone: "",
                });
                setUserModalOpen(true);
              }}
              className="rounded-full bg-green-600 hover:bg-green-700 text-white transition-all hover:scale-105"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
            <Button
              onClick={() => setCsvModalOpen(true)}
              variant="outline"
              className="rounded-full border-slate-200/50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
          </div>
        </div>
      )}

      {/* Students Table - Show on Overview and Students tabs */}
      {(activeTab === "overview" || activeTab === "students") && (
        <Card className="border-slate-200/50">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={
                        selectedStudents.size === filteredStudents.length &&
                        filteredStudents.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300"
                    />
                  </TableHead>
                  <TableHead className="text-slate-900">Email</TableHead>
                  <TableHead className="text-slate-900">Student Name</TableHead>
                  <TableHead className="text-slate-900">
                    Payment Status
                  </TableHead>
                  <TableHead className="text-slate-900">
                    Student Status
                  </TableHead>
                  <TableHead className="text-right text-slate-900">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!(
                  filteredStudents &&
                  Array.isArray(filteredStudents) &&
                  filteredStudents.length > 0
                ) ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16">
                      {filteredStudents && Array.isArray(filteredStudents) ? (
                        <EmptyState
                          type="students"
                          message={
                            searchQuery ||
                            paymentFilter !== "all" ||
                            statusFilter !== "all"
                              ? "No students found matching your filters. Try adjusting your search or filter settings."
                              : "No students registered yet. Waiting for first enrollment..."
                          }
                        />
                      ) : (
                        <p className="text-slate-500 text-center py-4">
                          No student data available.
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  (paginatedStudents && Array.isArray(paginatedStudents)
                    ? paginatedStudents
                    : []
                  ).map((student) => (
                    <TableRow
                      key={student?._id ?? student?.id ?? Math.random()}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => handleStudentClick(student)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(student._id)}
                          onChange={() => toggleStudentSelection(student._id)}
                          className="rounded border-slate-300"
                        />
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {student.email || "N/A"}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {student.firstName || ""} {student.lastName || ""}
                        {!student.firstName && !student.lastName && "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.paymentStatus === "Paid"
                              ? "success"
                              : "warning"
                          }
                        >
                          {student.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <select
                          value={student.status || "active"}
                          disabled={statusUpdating !== null}
                          onChange={(e) =>
                            handleStudentStatusChange(
                              student._id,
                              e.target.value as StudentStatus,
                            )
                          }
                          className={`text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            student.status === "banned"
                              ? "border-red-300 text-red-700"
                              : student.status === "graduated"
                                ? "border-green-300 text-green-700"
                                : student.status === "suspended"
                                  ? "border-amber-300 text-amber-700"
                                  : "border-slate-200/50 text-slate-700"
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="graduated">Graduated</option>
                          <option value="suspended">Suspended</option>
                          <option value="banned">Banned</option>
                        </select>
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {/* View */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStudentClick(student)}
                            className="rounded-full hover:bg-slate-100"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </Button>
                          {/* WhatsApp Reminder */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleWhatsAppReminder(student)}
                            className="rounded-full hover:bg-green-50"
                            title="Send Reminder"
                          >
                            <MessageCircle className="w-4 h-4 text-green-600" />
                          </Button>
                          {/* Delete */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteStudent(student)}
                            className="rounded-full hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {/* Pagination */}
            {filteredStudents.length > 0 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredStudents.length,
                  )}{" "}
                  of {filteredStudents.length} students
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="rounded-full"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-slate-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="rounded-full"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Revenue Analytics - Show only on Revenue tab */}
      {activeTab === "revenue" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {formatNaira(displayTotalRevenue)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-slate-500">
                From{" "}
                {safeStudents.filter((s) => s.paymentStatus === "Paid").length}{" "}
                paid students
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Pending Revenue</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {formatNaira(displayPendingRevenue)}
                  </p>
                </div>
                <div className="p-3 bg-[#007bff] rounded-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-slate-500">
                From{" "}
                {
                  safeStudents.filter((s) => s.paymentStatus === "Pending")
                    .length
                }{" "}
                pending payments
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/50 md:col-span-2">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-4">
                Payment Status Breakdown
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Paid Students</p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      safeStudents.filter((s) => s.paymentStatus === "Paid")
                        .length
                    }
                  </p>
                </div>
                <div className="p-4 bg-[#007bff] rounded-lg">
                  <p className="text-sm text-white mb-1">Pending Payments</p>
                  <p className="text-2xl font-bold text-white">
                    {
                      safeStudents.filter((s) => s.paymentStatus === "Pending")
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setStudentToDelete(null);
        }}
        title="Delete Student"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900">
              {studentToDelete?.firstName || studentToDelete?.email}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setStudentToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmDeleteStudent}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create/Edit User Modal */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => {
          setUserModalOpen(false);
          setEditingUser(null);
          setUserFormData({
            email: "",
            password: "",
            role: "student",
            firstName: "",
            lastName: "",
            phone: "",
          });
        }}
        title={editingUser ? "Edit User" : "Create New User"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={userFormData.firstName}
                onChange={(e) =>
                  setUserFormData({
                    ...userFormData,
                    firstName: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={userFormData.lastName}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, lastName: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20"
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={userFormData.email}
              onChange={(e) =>
                setUserFormData({ ...userFormData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20"
              placeholder="email@example.com"
              required={!editingUser}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password {editingUser ? "(leave blank to keep)" : "*"}
            </label>
            <input
              type="password"
              value={userFormData.password}
              onChange={(e) =>
                setUserFormData({ ...userFormData, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20"
              placeholder="••••••••"
              required={!editingUser}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role *
            </label>
            <select
              value={userFormData.role}
              onChange={(e) =>
                setUserFormData({
                  ...userFormData,
                  role: e.target.value as "admin" | "student",
                })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={userFormData.phone}
              onChange={(e) =>
                setUserFormData({ ...userFormData, phone: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20"
              placeholder="+234..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setUserModalOpen(false);
                setEditingUser(null);
                setUserFormData({
                  email: "",
                  password: "",
                  role: "student",
                  firstName: "",
                  lastName: "",
                  phone: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveUser}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {editingUser ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* CSV Import Modal */}
      <Modal
        isOpen={csvModalOpen}
        onClose={() => {
          setCsvModalOpen(false);
          setCsvFile(null);
          setCsvPreview([]);
        }}
        title="Import Users from CSV"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">
                {csvFile ? csvFile.name : "Click to upload CSV file"}
              </p>
            </label>
          </div>

          {csvPreview.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">
                Preview ({csvPreview.length} users):
              </p>
              <div className="max-h-40 overflow-auto border rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-2 py-1 text-left">Email</th>
                      <th className="px-2 py-1 text-left">Role</th>
                      <th className="px-2 py-1 text-left">Name</th>
                      <th className="px-2 py-1 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-2 py-1">{row.email}</td>
                        <td className="px-2 py-1">{row.role || "student"}</td>
                        <td className="px-2 py-1">{row.fullname}</td>
                        <td className="px-2 py-1">{row.status || "active"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvPreview.length > 5 && (
                  <p className="text-xs text-slate-500 p-2">
                    ...and {csvPreview.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setCsvModalOpen(false);
                setCsvFile(null);
                setCsvPreview([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCsvUpload}
              disabled={!csvPreview.length}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Import {csvPreview.length} Users
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

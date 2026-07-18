import { useState, useEffect, useCallback } from "react";
import {
  Users, Plus, Search, CreditCard, CheckCircle2, Clock, X, Upload, Eye, EyeOff,
  AlertCircle, Copy, Check
} from "lucide-react";
import { getAgentStudents, registerStudentAsAgent, uploadPaymentForStudent } from "@/api";
import { COURSE_CATALOG, formatNaira } from "@/data/courseCatalog";
import { useToast } from "@/components/ui/toast";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

interface AgentStudent {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentIdNumber: string;
  selectedCourses: string[];
  paymentStatus: string;
  totalCoursePrice: number;
  amountPaid: number;
  createdAt: string;
}

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  selectedCourses: string[];
}

interface PayForm {
  receiptUrl: string;
  amount: string;
}

export function AgentStudents() {
  const [students, setStudents] = useState<AgentStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [showPayModal, setShowPayModal] = useState<AgentStudent | null>(null);
  const [regForm, setRegForm] = useState<RegisterForm>({ firstName: "", lastName: "", email: "", phone: "", password: "", selectedCourses: [] });
  const [payForm, setPayForm] = useState<PayForm>({ receiptUrl: "", amount: "" });
  const [regLoading, setRegLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{ email: string; password: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const { toast } = useToast();

  const loadStudents = useCallback(async () => {
    try {
      const res = await getAgentStudents();
      if (res?.success) setStudents(res.data.students);
    } catch (error) {
      console.error("Failed to load agent students", error);
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const filtered = students.filter(
    (s) =>
      s.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.studentIdNumber.includes(search)
  );

  const toggleCourse = (title: string) => {
    setRegForm((prev) => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(title)
        ? prev.selectedCourses.filter((c) => c !== title)
        : prev.selectedCourses.length < 4
        ? [...prev.selectedCourses, title]
        : prev.selectedCourses,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regForm.selectedCourses.length === 0) { toast("Please select at least one course", "error"); return; }
    if (regForm.password.length < 6) { toast("Password must be at least 6 characters", "error"); return; }
    try {
      setRegLoading(true);
      const res = await registerStudentAsAgent({
        email: regForm.email,
        firstName: regForm.firstName,
        lastName: regForm.lastName,
        phone: regForm.phone,
        selectedCourses: regForm.selectedCourses,
        password: regForm.password,
      });
      if (res?.success) {
        setNewCredentials({ email: res.data.credentials.email, password: res.data.credentials.password });
        await loadStudents();
        setRegForm({ firstName: "", lastName: "", email: "", phone: "", password: "", selectedCourses: [] });
        toast("Student registered successfully!", "success");
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      toast(apiError.response?.data?.message || "Registration failed", "error");
    } finally {
      setRegLoading(false);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPayModal) return;
    if (!payForm.receiptUrl) { toast("Please provide the receipt URL", "error"); return; }
    try {
      setPayLoading(true);
      await uploadPaymentForStudent(showPayModal._id, {
        receiptUrl: payForm.receiptUrl,
        amount: payForm.amount ? Number(payForm.amount) : undefined,
      });
      await loadStudents();
      setShowPayModal(null);
      setPayForm({ receiptUrl: "", amount: "" });
      toast("Payment receipt submitted for review!", "success");
    } catch (err: unknown) {
      const apiError = err as ApiError;
      toast(apiError.response?.data?.message || "Payment upload failed", "error");
    } finally {
      setPayLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === "Paid") return <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5"><CheckCircle2 className="w-3 h-3" />Paid</span>;
    if (status === "Under Review") return <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5"><Clock className="w-3 h-3" />Under Review</span>;
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md px-2 py-0.5"><AlertCircle className="w-3 h-3" />Pending</span>;
  };

  const copyCredentials = () => {
    if (!newCredentials) return;
    navigator.clipboard.writeText(`Email: ${newCredentials.email}\nPassword: ${newCredentials.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">My Students</h1>
          <p className="text-sm text-slate-500 mt-0.5">{students.length} enrolled student{students.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { setShowRegister(true); setNewCredentials(null); }}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Register New Student
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">{search ? "No students match your search" : "No students yet"}</p>
            {!search && <p className="text-sm text-slate-400 mt-1">Register your first student to get started</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Student", "Student ID", "Courses", "Total Fee", "Payment", "Action"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-slate-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-slate-900">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded px-2 py-0.5">{s.studentIdNumber}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        {(s.selectedCourses || []).slice(0, 2).map((c) => (
                          <span key={c} className="text-xs text-slate-600 bg-slate-100 rounded px-2 py-0.5 w-fit max-w-[180px] truncate">{c}</span>
                        ))}
                        {(s.selectedCourses || []).length > 2 && (
                          <span className="text-xs text-slate-400">+{s.selectedCourses.length - 2} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-medium text-slate-900">{formatNaira(s.totalCoursePrice)}</span>
                    </td>
                    <td className="px-4 py-3.5">{statusBadge(s.paymentStatus)}</td>
                    <td className="px-4 py-3.5">
                      {s.paymentStatus !== "Paid" && (
                        <button
                          onClick={() => { setShowPayModal(s); setPayForm({ receiptUrl: "", amount: "" }); }}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-base font-semibold text-slate-900">Register New Student</h2>
              <button onClick={() => { setShowRegister(false); setNewCredentials(null); }} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              {newCredentials ? (
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">Student Registered!</h3>
                  <p className="text-sm text-slate-500">Share these login credentials with the student.</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left space-y-2">
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium text-slate-900">{newCredentials.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</p>
                      <p className="text-sm font-medium text-slate-900 font-mono">{newCredentials.password}</p>
                    </div>
                  </div>
                  <button
                    onClick={copyCredentials}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-4 py-2 transition-colors"
                  >
                    {copied ? <><Check className="w-4 h-4 text-emerald-600" />Copied!</> : <><Copy className="w-4 h-4" />Copy Credentials</>}
                  </button>
                  <button
                    onClick={() => { setShowRegister(false); setNewCredentials(null); }}
                    className="w-full bg-slate-900 text-white font-medium py-2.5 rounded-lg text-sm hover:bg-slate-800 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {([["firstName", "First name"], ["lastName", "Last name"]] as const).map(([field, label]) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                        <input
                          type="text"
                          required
                          value={regForm[field]}
                          onChange={(e) => setRegForm(p => ({ ...p, [field]: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      value={regForm.email}
                      onChange={(e) => setRegForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={regForm.phone}
                      onChange={(e) => setRegForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Password <span className="text-slate-400 font-normal">(student will use this to log in)</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={regForm.password}
                        onChange={(e) => setRegForm(p => ({ ...p, password: e.target.value }))}
                        className="w-full px-3 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Select Courses <span className="text-slate-400 font-normal">({regForm.selectedCourses.length}/4 max)</span>
                    </label>
                    <div className="space-y-1.5">
                      {COURSE_CATALOG.map((c) => {
                        const selected = regForm.selectedCourses.includes(c.title);
                        return (
                          <button
                            key={c.title}
                            type="button"
                            onClick={() => toggleCourse(c.title)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm text-left transition-colors ${selected ? "bg-slate-50 border-slate-900 text-slate-900" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                          >
                            <span className="font-medium">{c.title}</span>
                            <span className="text-xs font-medium shrink-0 ml-2">{formatNaira(c.price)}</span>
                          </button>
                        );
                      })}
                    </div>
                    {regForm.selectedCourses.length > 0 && (
                      <div className="mt-3 flex items-center justify-between px-1">
                        <span className="text-xs text-slate-500">{regForm.selectedCourses.length} course(s) selected</span>
                        <span className="text-sm font-semibold text-slate-900">
                          {formatNaira(regForm.selectedCourses.length === 4 ? 538000 : regForm.selectedCourses.length * 150000)}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {regLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus className="w-4 h-4" /> Register Student</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Upload Payment Receipt</h2>
                <p className="text-xs text-slate-500">{showPayModal.firstName} {showPayModal.lastName}</p>
              </div>
              <button onClick={() => setShowPayModal(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handlePay} className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Amount Due</p>
                <p className="text-xl font-semibold text-slate-900">{formatNaira(showPayModal.totalCoursePrice)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Receipt / Bank Transfer Proof URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    required
                    value={payForm.receiptUrl}
                    onChange={(e) => setPayForm(p => ({ ...p, receiptUrl: e.target.value }))}
                    placeholder="https://drive.google.com/..."
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Upload your bank receipt to Google Drive, Cloudinary, or similar and paste the link here.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount Paid (₦) <span className="text-slate-400 font-normal">(optional — defaults to full balance)</span></label>
                <input
                  type="number"
                  value={payForm.amount}
                  onChange={(e) => setPayForm(p => ({ ...p, amount: e.target.value }))}
                  placeholder={String(showPayModal.totalCoursePrice)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>
              <button
                type="submit"
                disabled={payLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {payLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Upload className="w-4 h-4" /> Submit for Admin Review</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

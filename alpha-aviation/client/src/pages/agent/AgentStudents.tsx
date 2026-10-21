import { useState, useEffect, useCallback } from "react";
import {
  Users, Plus, Search, CreditCard, CheckCircle2, Clock, X, Upload, Eye, EyeOff,
  AlertCircle, Copy, Check, ChevronRight, FileText, Landmark
} from "lucide-react";
import { getAgentStudents, registerStudentAsAgent, uploadPaymentForStudent, paystackPayForStudent } from "@/api";
import { COURSE_CATALOG, formatNaira } from "@/data/courseCatalog";
import { useToast } from "@/components/ui/use-toast";
import { usePaystackPayment } from "react-paystack";
import { useAuthStore } from "@/store/authStore";

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
  const { user: agent } = useAuthStore();
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
  const [payMethod, setPayMethod] = useState<"select" | "paystack" | "manual">("select");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState(false);

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

  const paystackConfig = {
    reference: `AGT-${agent?.id || "agent"}-${Date.now()}`,
    email: agent?.email || "",
    amount: (showPayModal?.totalCoursePrice || 0) * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaystackSuccess = async (ref: { reference: string }) => {
    if (!showPayModal) return;
    try {
      setPayLoading(true);
      await paystackPayForStudent(showPayModal._id, ref.reference);
      await loadStudents();
      setPaySuccess(true);
      toast("Payment successful via Paystack!", "success");
      setTimeout(() => {
        setShowPayModal(null);
        setPayMethod("select");
        setPaySuccess(false);
      }, 2000);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      toast(apiError.response?.data?.message || "Paystack payment failed", "error");
    } finally {
      setPayLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast("File size must be under 5MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setSelectedFile(reader.result as string);
    reader.readAsDataURL(file);
  };

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
    if (!selectedFile) { toast("Please select a receipt file to upload", "error"); return; }
    try {
      setPayLoading(true);
      await uploadPaymentForStudent(showPayModal._id, {
        receiptUrl: selectedFile,
        amount: payForm.amount ? Number(payForm.amount) : undefined,
      });
      await loadStudents();
      setShowPayModal(null);
      setPayMethod("select");
      setSelectedFile(null);
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
    if (status === "Paid") return <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/15"><CheckCircle2 className="h-3 w-3" />Paid</span>;
    if (status === "Under Review") return <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-600/15"><Clock className="h-3 w-3" />Under Review</span>;
    return <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 ring-1 ring-red-600/15"><AlertCircle className="h-3 w-3" />Pending</span>;
  };

  const copyCredentials = () => {
    if (!newCredentials) return;
    navigator.clipboard.writeText(`Email: ${newCredentials.email}\nPassword: ${newCredentials.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow text-[#1246C8]">Agent portal</span>
          <h1 className="mt-3 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">My students</h1>
          <p className="mt-2 text-[#53647C]">{students.length} enrolled student{students.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { setShowRegister(true); setNewCredentials(null); }}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-[#1246C8] px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:bg-[#0F3BAA] hover:shadow-glow-lg sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Register New Student
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9AB0]" />
        <input
          type="text"
          placeholder="Search by name, email or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-[#DCE2EB] bg-white py-2.5 pl-11 pr-4 text-sm text-[#172B49] shadow-subtle outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
        />
      </div>

      <div className="overflow-hidden rounded-panel border border-[#DCE2EB] bg-white shadow-subtle">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1246C8] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
              <Users className="h-6 w-6" />
            </span>
            <p className="font-semibold text-[#10264B]">{search ? "No students match your search" : "No students yet"}</p>
            {!search && <p className="mt-1 text-sm text-[#53647C]">Register your first student to get started</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#DCE2EB] bg-[#F5F7FB]/70">
                  {["Student", "Student ID", "Courses", "Total Fee", "Payment", "Action"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-[#53647C]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s._id} className="border-b border-[#DCE2EB]/70 transition-colors last:border-b-0 hover:bg-[#F5F7FB]">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-[#10264B]">{s.firstName} {s.lastName}</p>
                      <p className="mt-0.5 text-xs text-[#53647C]">{s.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="whitespace-nowrap rounded-md bg-[#F5F7FB] px-2 py-1 font-mono text-xs font-medium text-[#10264B] ring-1 ring-[#DCE2EB]">{s.studentIdNumber}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        {(s.selectedCourses || []).slice(0, 2).map((c) => (
                          <span key={c} className="w-fit max-w-[200px] truncate rounded-full bg-[#DCE8FF]/60 px-2.5 py-0.5 text-xs font-medium text-[#10264B]">{c}</span>
                        ))}
                        {(s.selectedCourses || []).length > 2 && (
                          <span className="pl-1 text-xs font-medium text-[#1246C8]">+{s.selectedCourses.length - 2} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="whitespace-nowrap text-sm font-semibold text-[#10264B] tabular-nums">{formatNaira(s.totalCoursePrice)}</span>
                    </td>
                    <td className="px-5 py-4">{statusBadge(s.paymentStatus)}</td>
                    <td className="px-5 py-4">
                      {s.paymentStatus !== "Paid" && (
                        <button
                          onClick={() => { setShowPayModal(s); setPayForm({ receiptUrl: "", amount: "" }); }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#1246C8] px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#0F3BAA] hover:shadow-glow"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07152E]/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-panel bg-white shadow-float">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-panel border-b border-[#DCE2EB] bg-white/95 px-6 py-5 backdrop-blur">
              <div>
                <span className="eyebrow text-[#1246C8]">New enrolment</span>
                <h2 className="mt-1.5 text-xl font-bold tracking-tighter text-[#10264B]">Register new student</h2>
              </div>
              <button onClick={() => { setShowRegister(false); setNewCredentials(null); }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#53647C] transition-colors hover:bg-[#F5F7FB] hover:text-[#10264B]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {newCredentials ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-600/15">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tighter text-[#10264B]">Student registered!</h3>
                  <p className="text-sm text-[#53647C]">Share these login credentials with the student.</p>
                  <div className="space-y-3 rounded-2xl border border-[#DCE2EB] bg-[#F5F7FB] p-4 text-left">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Email</p>
                      <p className="mt-0.5 break-all text-sm font-semibold text-[#10264B]">{newCredentials.email}</p>
                    </div>
                    <div className="border-t border-[#DCE2EB] pt-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Password</p>
                      <p className="mt-0.5 font-mono text-sm font-semibold text-[#10264B]">{newCredentials.password}</p>
                    </div>
                  </div>
                  <button
                    onClick={copyCredentials}
                    className="inline-flex items-center gap-2 rounded-full border border-[#10264B]/15 bg-white px-4 py-2 text-sm font-semibold text-[#10264B] transition-colors hover:border-[#1246C8] hover:text-[#1246C8]"
                  >
                    {copied ? <><Check className="h-4 w-4 text-emerald-600" />Copied!</> : <><Copy className="h-4 w-4" />Copy Credentials</>}
                  </button>
                  <button
                    onClick={() => { setShowRegister(false); setNewCredentials(null); }}
                    className="w-full rounded-full bg-[#1246C8] py-3 text-sm font-semibold text-white shadow-glow transition-all hover:bg-[#0F3BAA] hover:shadow-glow-lg"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    {([["firstName", "First name"], ["lastName", "Last name"]] as const).map(([field, label]) => (
                      <div key={field}>
                        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">{label}</label>
                        <input
                          type="text"
                          required
                          value={regForm[field]}
                          onChange={(e) => setRegForm(p => ({ ...p, [field]: e.target.value }))}
                          className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Email</label>
                    <input
                      type="email"
                      required
                      value={regForm.email}
                      onChange={(e) => setRegForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Phone</label>
                    <input
                      type="tel"
                      value={regForm.phone}
                      onChange={(e) => setRegForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                      Password <span className="font-normal normal-case tracking-normal text-[#8C9AB0]">(student will use this to log in)</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={regForm.password}
                        onChange={(e) => setRegForm(p => ({ ...p, password: e.target.value }))}
                        className="w-full rounded-xl border border-[#DCE2EB] bg-white py-3 pl-4 pr-11 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C9AB0] transition-colors hover:text-[#1246C8]">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                      Select Courses <span className="font-normal normal-case tracking-normal text-[#8C9AB0]">({regForm.selectedCourses.length}/4 max)</span>
                    </label>
                    <div className="space-y-2">
                      {COURSE_CATALOG.map((c) => {
                        const selected = regForm.selectedCourses.includes(c.title);
                        return (
                          <button
                            key={c.title}
                            type="button"
                            onClick={() => toggleCourse(c.title)}
                            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all ${selected ? "border-[#1246C8] bg-[#DCE8FF]/50 text-[#10264B] ring-4 ring-[#1246C8]/10" : "border-[#DCE2EB] bg-white text-[#172B49] hover:border-[#1246C8]/40 hover:bg-[#F5F7FB]"}`}
                          >
                            <span className="font-medium">{c.title}</span>
                            <span className="ml-2 shrink-0 text-xs font-semibold tabular-nums text-[#1246C8]">{formatNaira(c.price)}</span>
                          </button>
                        );
                      })}
                    </div>
                    {regForm.selectedCourses.length > 0 && (
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-[#F5F7FB] px-4 py-3">
                        <span className="text-xs text-[#53647C]">{regForm.selectedCourses.length} course(s) selected</span>
                        <span className="text-sm font-bold text-[#10264B] tabular-nums">
                          {formatNaira(regForm.selectedCourses.length === 4 ? 538000 : regForm.selectedCourses.length * 150000)}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1246C8] py-3 text-sm font-semibold text-white shadow-glow transition-all hover:bg-[#0F3BAA] hover:shadow-glow-lg disabled:opacity-50 disabled:shadow-none"
                  >
                    {regLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <><Plus className="h-4 w-4" /> Register Student</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07152E]/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-panel bg-white shadow-float">
            <div className="flex items-center justify-between gap-4 border-b border-[#DCE2EB] px-6 py-5">
              <div>
                <span className="eyebrow text-[#1246C8]">Tuition payment</span>
                <h2 className="mt-1.5 text-xl font-bold tracking-tighter text-[#10264B]">Pay for student</h2>
                <p className="mt-0.5 text-xs text-[#53647C]">{showPayModal.firstName} {showPayModal.lastName}</p>
              </div>
              <button onClick={() => { setShowPayModal(null); setPayMethod("select"); setSelectedFile(null); setPaySuccess(false); }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#53647C] transition-colors hover:bg-[#F5F7FB] hover:text-[#10264B]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {paySuccess ? (
              <div className="space-y-4 p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-600/15">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold tracking-tighter text-[#10264B]">Payment successful!</h3>
                <p className="text-sm text-[#53647C]">The payment has been processed and is awaiting admin confirmation.</p>
              </div>
            ) : payMethod === "select" ? (
              <div className="space-y-3 p-6">
                <div className="mb-1 rounded-2xl bg-[#07152E] bg-chart-grid p-5 text-center text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EAEFF]">Amount Due</p>
                  <p className="mt-1.5 text-3xl font-bold tracking-tightest tabular-nums">{formatNaira(showPayModal.totalCoursePrice)}</p>
                </div>

                <button
                  onClick={() => initializePayment({ onSuccess: handlePaystackSuccess })}
                  disabled={payLoading}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-[#DCE2EB] bg-white p-4 text-left transition-all hover:border-[#1246C8] hover:bg-[#F5F7FB] hover:shadow-subtle disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8] transition-colors group-hover:bg-[#1246C8] group-hover:text-white">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#10264B]">Pay Online (Instant)</p>
                    <p className="mt-0.5 text-xs text-[#53647C]">Instant verification via Paystack</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[#8C9AB0] transition-all group-hover:translate-x-0.5 group-hover:text-[#1246C8]" />
                </button>

                <button
                  onClick={() => setPayMethod("manual")}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-[#DCE2EB] bg-white p-4 text-left transition-all hover:border-[#1246C8] hover:bg-[#F5F7FB] hover:shadow-subtle"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8] transition-colors group-hover:bg-[#1246C8] group-hover:text-white">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#10264B]">Manual Bank Transfer</p>
                    <p className="mt-0.5 text-xs text-[#53647C]">Upload receipt for manual review</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[#8C9AB0] transition-all group-hover:translate-x-0.5 group-hover:text-[#1246C8]" />
                </button>
              </div>
            ) : (
              <form onSubmit={handlePay} className="space-y-5 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="rounded-2xl bg-[#07152E] bg-chart-grid px-4 py-3 text-white">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EAEFF]">Amount Due</p>
                    <p className="mt-0.5 text-lg font-bold tracking-tighter tabular-nums">{formatNaira(showPayModal.totalCoursePrice)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setPayMethod("select"); setSelectedFile(null); setPayForm({ receiptUrl: "", amount: "" }); }}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#1246C8] transition-colors hover:bg-[#DCE8FF]/60 hover:text-[#0F3BAA]"
                  >
                    Change Method
                  </button>
                </div>

                <div className="space-y-1 rounded-2xl border border-[#DCE2EB] bg-[#F5F7FB] p-4">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Bank Transfer Details</p>
                  <div className="flex items-center justify-between gap-3 border-b border-[#DCE2EB] py-2 last:border-b-0">
                    <span className="text-xs text-[#53647C]">Account Name</span>
                    <span className="text-right text-sm font-semibold text-[#10264B]">Alpha step links aviation school ltd</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-[#DCE2EB] py-2 last:border-b-0">
                    <span className="text-xs text-[#53647C]">Account Number</span>
                    <span className="font-mono text-sm font-semibold tracking-wider text-[#10264B]">1000485345</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2">
                    <span className="text-xs text-[#53647C]">Bank</span>
                    <span className="text-sm font-semibold text-[#10264B]">Globus bank</span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Upload Payment Receipt</label>
                  {!selectedFile ? (
                    <label className="group block cursor-pointer rounded-2xl border-2 border-dashed border-[#C3CCDA] bg-[#F5F7FB]/60 p-8 text-center transition-all hover:border-[#1246C8] hover:bg-[#DCE8FF]/30">
                      <input type="file" accept="image/*,.pdf" onChange={handleFileSelect} className="hidden" />
                      <Upload className="mx-auto mb-3 h-8 w-8 text-[#8C9AB0] transition-all group-hover:scale-110 group-hover:text-[#1246C8]" />
                      <p className="text-sm font-semibold text-[#10264B]">Click to upload receipt</p>
                      <p className="mt-1 text-xs text-[#8C9AB0]">PNG, JPG or PDF up to 5MB</p>
                    </label>
                  ) : (
                    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-[#DCE2EB] bg-[#F5F7FB]">
                      {selectedFile.startsWith("data:application/pdf") ? (
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-12 w-12 text-[#1246C8]/50" />
                          <span className="text-xs font-semibold text-[#53647C]">PDF Document Selected</span>
                        </div>
                      ) : (
                        <img src={selectedFile} alt="Receipt preview" className="h-full w-full object-cover" />
                      )}
                      <button type="button" onClick={() => setSelectedFile(null)} className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-[#53647C] shadow-subtle backdrop-blur transition-all hover:text-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={payLoading || !selectedFile}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1246C8] py-3 text-sm font-semibold text-white shadow-glow transition-all hover:bg-[#0F3BAA] hover:shadow-glow-lg disabled:opacity-50 disabled:shadow-none"
                >
                  {payLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <><Upload className="h-4 w-4" /> Submit for Admin Review</>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

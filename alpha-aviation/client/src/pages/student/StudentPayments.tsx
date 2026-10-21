import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  CheckCircle2,
  Upload,
  FileText,
  Copy,
  Clock,
  XCircle,
  Landmark,
  ChevronRight,
  X,
  ShieldCheck,
  Wallet,
  Receipt,
} from "lucide-react";
import { uploadPaymentReceipt, verifyPaystackPayment, getProfile } from "@/api";
import { formatNaira } from "@/data/courseCatalog";
import { useToast } from "@/components/ui/use-toast";
import { usePaystackPayment } from "react-paystack";
import { motion, AnimatePresence } from "framer-motion";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export function StudentPayments() {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"selection" | "paystack" | "manual">("selection");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const amountDue = user?.amountDue || 0;
  const amountPaid = user?.amountPaid || 0;
  const paymentStatus = user?.paymentStatus || "Pending";
  const isPending = paymentStatus === "Pending";
  const isUnderReview = paymentStatus === "Under Review";
  const isPaid = paymentStatus === "Paid";
  const paymentReceiptUrl = user?.paymentReceiptUrl || "";

  const bankDetails = {
    accountName: "Alpha step links aviation school ltd",
    accountNumber: "1000485345",
    bank: "Globus bank",
    reference: user?.email || "STUDENT-REF",
  };

  const copyToClipboard = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast("Copied to clipboard", "success");
  };

  const refreshUser = async () => {
    try {
      const profile = await getProfile();
      if (profile?.data?.user) setUser(profile.data.user);
    } catch (error) {
      console.error("Failed to refresh user profile", error);
    }
  };

  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: user?.email || "",
    amount: (user?.amountDue || 0) * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaystackSuccess = async (reference: { reference: string }) => {
    try {
      setUploadingReceipt(true);
      await verifyPaystackPayment(reference.reference);
      setIsSuccess(true);
      toast("Payment successful! Your status is being updated.", "success");
      setTimeout(() => {
        refreshUser();
        setIsSuccess(false);
      }, 3000);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast(apiError.response?.data?.message || "Payment verification failed", "error");
    } finally {
      setUploadingReceipt(false);
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
    reader.onloadend = () => {
      setSelectedFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReceiptUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadingReceipt(true);
      setRejectionReason(null);
      const response = await uploadPaymentReceipt(selectedFile);

      if (user && response?.data) {
        setUser({
          ...user,
          paymentReceiptUrl: response.data.paymentReceiptUrl,
          paymentStatus: "Under Review",
          status: response.data.status || user.status,
        });
      }

      setIsSuccess(true);
      toast("Receipt uploaded successfully. Awaiting review.", "success");
      setTimeout(() => {
        setIsSuccess(false);
        setPaymentMethod("selection");
        setSelectedFile(null);
      }, 3000);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const msg = apiError.response?.data?.message || "Failed to upload receipt";
      toast(msg, "error");
      if (msg.toLowerCase().includes("rejected") || msg.toLowerCase().includes("previous")) {
        setRejectionReason("Your previous receipt was rejected. Please upload a new one.");
      }
    } finally {
      setUploadingReceipt(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div>
        <span className="eyebrow text-[#1246C8]">Billing</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
          Payments & Bills
        </h1>
        <p className="mt-2 text-[#53647C]">
          View your billing status, make payments, and upload payment receipts.
        </p>
      </div>

      {/* ─── AGENT-MANAGED PAYMENT VIEW ─────────────────────────────────────── */}
      {user?.enrolledByAgent ? (
        <div className="space-y-5">
          {/* Status card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-panel border p-5 shadow-subtle sm:p-6 ${
              user.agentPaymentStatus === "Paid"
                ? "bg-emerald-50 border-emerald-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <div className="flex items-center gap-3.5 mb-5">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${user.agentPaymentStatus === "Paid" ? "bg-emerald-100" : "bg-amber-100"}`}>
                {user.agentPaymentStatus === "Paid"
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  : <Clock className="w-5 h-5 text-amber-700" />
                }
              </div>
              <div>
                <p className={`font-semibold text-sm ${user.agentPaymentStatus === "Paid" ? "text-emerald-900" : "text-amber-900"}`}>
                  {user.agentPaymentStatus === "Paid" ? "Tuition Fully Paid" : "Tuition Payment Pending"}
                </p>
                <p className={`text-[13px] mt-0.5 ${user.agentPaymentStatus === "Paid" ? "text-emerald-700" : "text-amber-700"}`}>
                  {user.agentPaymentStatus === "Paid"
                    ? "Your enrollment agent has completed your tuition payment."
                    : "Your enrollment agent is processing your tuition payment."}
                </p>
              </div>
            </div>

            {/* Amount summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">Total Fees</p>
                <p className="mt-1 text-lg font-bold tracking-tight tabular-nums text-[#10264B]">{formatNaira(user.totalCoursePrice || 0)}</p>
              </div>
              <div className="rounded-2xl border border-white bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">Amount Paid</p>
                <p className={`mt-1 text-lg font-bold tracking-tight tabular-nums ${user.agentPaymentStatus === "Paid" ? "text-emerald-700" : "text-[#10264B]"}`}>
                  {formatNaira(user.amountPaid || 0)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Agent contact card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold tracking-tight text-[#10264B]">Your Enrollment Agent</h2>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4 py-3 border-b border-[#DCE2EB]/70">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Agent Name</span>
                <span className="text-sm font-semibold text-[#10264B]">{user.enrolledByAgent.agentName}</span>
              </div>
              {user.enrolledByAgent.agencyName && (
                <div className="flex items-center justify-between gap-4 py-3 border-b border-[#DCE2EB]/70">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Agency</span>
                  <span className="text-sm font-semibold text-[#10264B]">{user.enrolledByAgent.agencyName}</span>
                </div>
              )}
              {user.enrolledByAgent.agentCode && (
                <div className="flex items-center justify-between gap-4 py-3 border-b border-[#DCE2EB]/70">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Agent Code</span>
                  <span className="font-mono text-xs font-semibold text-[#1246C8] bg-[#DCE8FF] rounded-full px-2.5 py-1">
                    {user.enrolledByAgent.agentCode}
                  </span>
                </div>
              )}
              {user.enrolledByAgent.agentEmail && (
                <div className="flex items-center justify-between gap-4 py-3 border-b border-[#DCE2EB]/70">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Email</span>
                  <a href={`mailto:${user.enrolledByAgent.agentEmail}`} className="truncate text-sm font-semibold text-[#1246C8] hover:text-[#0F3BAA]">
                    {user.enrolledByAgent.agentEmail}
                  </a>
                </div>
              )}
              {user.enrolledByAgent.agentPhone && (
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Phone</span>
                  <a href={`tel:${user.enrolledByAgent.agentPhone}`} className="text-sm font-semibold text-[#10264B] hover:text-[#1246C8]">
                    {user.enrolledByAgent.agentPhone}
                  </a>
                </div>
              )}
            </div>
            <p className="mt-4 rounded-2xl bg-[#F5F7FB] px-4 py-3 text-[13px] leading-relaxed text-[#53647C]">
              Your tuition is managed by your enrollment agent. For any billing queries, please contact your agent directly using the details above.
            </p>
          </motion.div>
        </div>
      ) : (
        <>
      {/* Alert Banners */}
      {rejectionReason && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3.5 rounded-panel border border-red-200 bg-red-50 p-4 text-red-900 shadow-subtle sm:p-5"
        >
          <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Receipt Rejected</p>
            <p className="text-[13px] text-red-700 mt-0.5">{rejectionReason}</p>
          </div>
        </motion.div>
      )}

      {isUnderReview && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3.5 rounded-panel border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-subtle sm:p-5"
        >
          <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Receipt Under Review</p>
            <p className="text-[13px] text-amber-700 mt-0.5">
              Your payment receipt has been submitted. Our team will verify it shortly. You will be notified once approved.
            </p>
          </div>
        </motion.div>
      )}

      {/* Core Real Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Total Paid */}
        <div className="relative overflow-hidden rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/15">
              Verified
            </span>
          </div>
          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">
              Total Paid
            </p>
            <h3 className="mt-2 text-3xl font-bold tracking-tightest text-[#10264B] tabular-nums">
              {formatNaira(amountPaid)}
            </h3>
          </div>
        </div>

        {/* Card 2: Amount Due */}
        <div className="relative overflow-hidden rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
              <Receipt className="h-5 w-5" />
            </div>
            {amountDue > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 ring-1 ring-red-600/15">
                Outstanding
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/15">
                Settled
              </span>
            )}
          </div>
          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">
              Amount Due
            </p>
            <h3 className="mt-2 text-3xl font-bold tracking-tightest text-[#10264B] tabular-nums">
              {formatNaira(amountDue)}
            </h3>
          </div>
        </div>
      </div>

      {/* Main double column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Instructions and Processing */}
        <div className="flex flex-col justify-between overflow-hidden rounded-panel border border-[#DCE2EB] bg-white shadow-subtle">
          <div className="flex items-center justify-between gap-4 border-b border-[#DCE2EB] p-6">
            <div>
              <h3 className="text-lg font-bold tracking-tighter text-[#10264B]">
                {isPending ? "Payment Gateway Instructions" : "Tuition Status Summary"}
              </h3>
              <p className="mt-1 text-[13px] text-[#53647C]">
                {isPending
                  ? "Complete outstanding fees below."
                  : isUnderReview
                    ? "Submitted proof is awaiting administrative review."
                    : "No payment due at this time."}
              </p>
            </div>
            {isPending && paymentMethod !== "selection" && !isSuccess && !uploadingReceipt && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPaymentMethod("selection");
                  setSelectedFile(null);
                }}
                className="shrink-0 text-[#1246C8]"
              >
                Change Method
              </Button>
            )}
          </div>

          <div className="flex-1">
            {!isPending ? (
              <div className="p-8 flex flex-col items-center text-center space-y-4">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full ring-1 ${
                    isPaid
                      ? "bg-emerald-50 text-emerald-600 ring-emerald-600/15"
                      : "bg-amber-50 text-amber-600 ring-amber-600/15"
                  }`}
                >
                  {isPaid ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <Clock className="w-8 h-8 animate-pulse" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tighter text-[#10264B]">
                    {isPaid ? "Tuition Fully Cleared" : "Tuition Receipt Verifying"}
                  </h3>
                  <p className="mt-1 max-w-xs mx-auto text-[13px] leading-relaxed text-[#53647C]">
                    {isPaid
                      ? "Congratulations! Your tuition is settled and ground courses access is permanently active."
                      : "Verification is underway. Our team will verify your receipt and notify you shortly."}
                  </p>
                </div>
                {paymentReceiptUrl && isUnderReview && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(paymentReceiptUrl, "_blank")}
                    className="mt-2"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Submitted Receipt
                  </Button>
                )}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-8 flex flex-col items-center text-center space-y-4"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-600/15">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold tracking-tighter text-[#10264B]">
                        Payment Successful!
                      </h3>
                      <p className="mt-1 text-[13px] text-[#53647C]">
                        {paymentMethod === "paystack"
                          ? "Online payment verified. Your ground school courses have been unlocked."
                          : "Receipt submitted successfully. Ground clearance is pending verification."}
                      </p>
                    </div>
                  </motion.div>
                ) : uploadingReceipt ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-12 flex flex-col items-center text-center space-y-4"
                  >
                    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#DCE2EB] border-t-[#1246C8]" />
                    <p className="text-[13px] font-semibold text-[#53647C]">
                      Processing payment verification...
                    </p>
                  </motion.div>
                ) : paymentMethod === "selection" ? (
                  <motion.div
                    key="selection"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="p-6 space-y-4"
                  >
                    <div className="mb-6 rounded-2xl bg-[#F5F7FB] px-4 py-5 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">
                        Total Balance Due
                      </p>
                      <p className="mt-2 text-4xl font-bold tracking-tightest text-[#10264B] tabular-nums">
                        {formatNaira(amountDue)}
                      </p>
                    </div>

                    <div className="grid gap-3">
                      <button
                        onClick={() => initializePayment({ onSuccess: handlePaystackSuccess })}
                        className="group flex items-center gap-4 rounded-2xl border border-[#DCE2EB] bg-white p-4 text-left transition-all hover:border-[#1246C8] hover:shadow-elevated"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F5F7FB] transition-colors group-hover:bg-[#DCE8FF]">
                          <CreditCard className="w-5 h-5 text-[#53647C] group-hover:text-[#1246C8]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#10264B]">
                            Pay Online (Instant)
                          </p>
                          <p className="text-xs text-[#53647C]">
                            Instant verification and active courses via Paystack
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#8C9AB0] transition-transform group-hover:translate-x-0.5 group-hover:text-[#1246C8]" />
                      </button>

                      <button
                        onClick={() => setPaymentMethod("manual")}
                        className="group flex items-center gap-4 rounded-2xl border border-[#DCE2EB] bg-white p-4 text-left transition-all hover:border-[#1246C8] hover:shadow-elevated"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F5F7FB] transition-colors group-hover:bg-[#DCE8FF]">
                          <Landmark className="w-5 h-5 text-[#53647C] group-hover:text-[#1246C8]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#10264B]">
                            Manual Bank Transfer
                          </p>
                          <p className="text-xs text-[#53647C]">
                            Make transfer and upload receipt for confirmation
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#8C9AB0] transition-transform group-hover:translate-x-0.5 group-hover:text-[#1246C8]" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="manual"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="p-6 space-y-6"
                  >
                    <div className="space-y-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                        Transfer Details
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { label: "Account Name", value: bankDetails.accountName },
                          { label: "Account Number", value: bankDetails.accountNumber },
                          { label: "Bank", value: bankDetails.bank },
                          { label: "Reference", value: bankDetails.reference },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="group flex items-center justify-between gap-3 rounded-2xl border border-[#DCE2EB]/70 bg-[#F5F7FB] p-3.5"
                          >
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">{item.label}</p>
                              <p className="mt-0.5 truncate text-sm font-semibold text-[#10264B]">{item.value}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(item.label, item.value)}
                              className="h-8 w-8 shrink-0 p-0 hover:bg-white"
                            >
                              {copiedField === item.label ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-[#53647C]" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                        Upload Proof of Payment
                      </p>

                      {!selectedFile ? (
                        <label className="group block cursor-pointer rounded-2xl border-2 border-dashed border-[#DCE2EB] p-8 text-center transition-all hover:border-[#1246C8] hover:bg-[#F5F7FB]">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8] transition-transform group-hover:scale-105">
                            <Upload className="w-5 h-5" />
                          </div>
                          <p className="text-sm font-semibold text-[#10264B]">
                            Click to upload receipt
                          </p>
                          <p className="mt-1 text-xs text-[#8C9AB0]">
                            PNG, JPG or PDF up to 5MB
                          </p>
                        </label>
                      ) : (
                        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-[#DCE2EB] bg-[#F5F7FB]">
                          {selectedFile.startsWith("data:application/pdf") ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                              <FileText className="w-12 h-12 text-[#8C9AB0] animate-pulse" />
                              <span className="text-xs font-semibold text-[#53647C]">PDF Document Selected</span>
                            </div>
                          ) : (
                            <img src={selectedFile} alt="Preview" className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#53647C] shadow-subtle backdrop-blur transition-all hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {selectedFile && (
                        <Button
                          className="h-12 w-full gap-2"
                          onClick={handleReceiptUpload}
                          disabled={uploadingReceipt}
                        >
                          <ShieldCheck className="w-5 h-5" />
                          <span>{uploadingReceipt ? "Uploading..." : "Confirm & Submit Receipt"}</span>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Right Column: Billing Breakdown */}
        {user?.courseSelections && user.courseSelections.length > 0 && (
          <div className="flex flex-col justify-between overflow-hidden rounded-panel border border-[#DCE2EB] bg-white shadow-subtle">
            <div className="p-6">
              <div className="flex items-center justify-between gap-3 border-b border-[#DCE2EB] pb-5">
                <div>
                  <span className="eyebrow text-[#1246C8]">Fare summary</span>
                  <h3 className="mt-2 text-lg font-bold tracking-tighter text-[#10264B]">
                    Billing Breakdown
                  </h3>
                </div>
                <span className="rounded-full bg-[#DCE8FF] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1246C8]">
                  Boarding pass
                </span>
              </div>
              <div className="space-y-2.5 mt-5">
                {user.courseSelections.map((course) => (
                  <div
                    key={course.title}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-[#DCE2EB]/70 bg-[#F5F7FB] p-3.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-2 w-2 shrink-0 rounded-full bg-[#1246C8]" />
                      <p className="text-sm font-semibold text-[#172B49]">
                        {course.title}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-[#10264B]">
                      {formatNaira(course.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t-2 border-dashed border-[#DCE2EB] bg-[#F5F7FB] p-6">
              <div className="flex items-end justify-between gap-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">Total Program Cost</p>
                <p className="text-2xl font-bold tracking-tightest tabular-nums text-[#10264B]">
                  {formatNaira(user?.totalCoursePrice || amountDue)}
                </p>
              </div>
              <div aria-hidden className="barcode mt-5 h-10 w-full rounded-sm opacity-80" />
            </div>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}

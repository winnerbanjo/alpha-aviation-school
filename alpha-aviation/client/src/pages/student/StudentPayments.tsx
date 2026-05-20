import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
  Copy,
  Clock,
  XCircle,
  Landmark,
  ChevronRight,
  X,
  ShieldCheck,
} from "lucide-react";
import { uploadPaymentReceipt, verifyPaystackPayment, getProfile } from "@/api";
import { formatNaira } from "@/data/courseCatalog";
import { useToast } from "@/components/ui/toast";
import { usePaystackPayment } from "react-paystack";
import { motion, AnimatePresence } from "framer-motion";

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

  const handlePaystackSuccess = async (reference: any) => {
    try {
      setUploadingReceipt(true);
      await verifyPaystackPayment(reference.reference);
      setIsSuccess(true);
      toast("Payment successful! Your status is being updated.", "success");
      setTimeout(() => {
        refreshUser();
        setIsSuccess(false);
      }, 3000);
    } catch (error: any) {
      toast(error.response?.data?.message || "Payment verification failed", "error");
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
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to upload receipt";
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
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Payments & Bills
        </h1>
        <p className="text-sm font-normal text-slate-500 mt-1">
          View your billing status, make payments, and upload payment receipts.
        </p>
      </div>

      {/* Alert Banners */}
      {rejectionReason && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-3xl border border-rose-200 bg-rose-50/80 text-rose-900 flex items-start gap-3 shadow-sm backdrop-blur-md"
        >
          <XCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold">Receipt Rejected</p>
            <p className="text-xs text-rose-700/90 mt-0.5">{rejectionReason}</p>
          </div>
        </motion.div>
      )}

      {isUnderReview && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-3xl border border-indigo-200 bg-indigo-50/80 text-indigo-900 flex items-start gap-3 shadow-sm backdrop-blur-md"
        >
          <Clock className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold">Receipt Under Review</p>
            <p className="text-xs text-indigo-700/90 mt-0.5">
              Your payment receipt has been submitted. Our team will verify it shortly. You will be notified once approved.
            </p>
          </div>
        </motion.div>
      )}

      {/* Core Real Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Total Paid */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 relative overflow-hidden shadow-[0px_6px_24px_0px_rgba(0,0,0,0.05),0px_0px_0px_1px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <div className="relative p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-emerald-600 rounded-2xl border border-emerald-100/80 shadow-sm overflow-hidden flex items-center justify-center w-12 h-12">
              <div className="absolute inset-0 bg-emerald-200/20 blur-sm rounded-full scale-75" />
              <svg
                className="w-6 h-6 relative z-10 text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
                <path d="M6 14h.01M10 14h.01" />
                <circle cx="18" cy="14" r="1" fill="currentColor" />
              </svg>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/30">
              Verified
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Total Paid
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {formatNaira(amountPaid)}
            </h3>
          </div>
        </div>

        {/* Card 2: Amount Due */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 relative overflow-hidden shadow-[0px_6px_24px_0px_rgba(0,0,0,0.05),0px_0px_0px_1px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <div className="relative p-3 bg-gradient-to-br from-rose-50 to-rose-100/60 text-rose-600 rounded-2xl border border-rose-100/80 shadow-sm overflow-hidden flex items-center justify-center w-12 h-12">
              <div className="absolute inset-0 bg-rose-200/20 blur-sm rounded-full scale-75" />
              <svg
                className="w-6 h-6 relative z-10 text-rose-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            {amountDue > 0 ? (
              <span className="text-xs font-bold px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full border border-rose-100/30">
                Outstanding
              </span>
            ) : (
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/30">
                Settled
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Amount Due
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {formatNaira(amountDue)}
            </h3>
          </div>
        </div>
      </div>

      {/* Main double column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Instructions and Processing */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isPending ? "Payment Gateway Instructions" : "Tuition Status Summary"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
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
                className="text-indigo-600 hover:text-indigo-700 font-bold text-xs"
              >
                Change Method
              </Button>
            )}
          </div>

          <div className="flex-1">
            {!isPending ? (
              <div className="p-8 flex flex-col items-center text-center space-y-4">
                <div
                  className={`w-16 h-16 rounded-2xl border flex items-center justify-center ${
                    isPaid
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-indigo-50 text-indigo-600 border-indigo-100"
                  }`}
                >
                  {isPaid ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <Clock className="w-8 h-8 animate-pulse" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {isPaid ? "Tuition Fully Cleared" : "Tuition Receipt Verifying"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    {isPaid
                      ? "Congratulations! Your tuition is settled and ground courses access is permanently active."
                      : "Verification is underway. Our team will verify your receipt and notify you shortly."}
                  </p>
                </div>
                {paymentReceiptUrl && isUnderReview && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(paymentReceiptUrl, "_blank")}
                    className="rounded-2xl border-slate-200 font-semibold text-xs py-2 px-4 mt-2"
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
                    <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Payment Successful!
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
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
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-xs font-bold text-slate-600">
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
                    <div className="text-center mb-6">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Total Balance Due
                      </p>
                      <p className="text-3xl font-black text-slate-900 mt-1">
                        {formatNaira(amountDue)}
                      </p>
                    </div>

                    <div className="grid gap-4">
                      <button
                        onClick={() => initializePayment({ onSuccess: handlePaystackSuccess })}
                        className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/30 transition-all text-left group"
                      >
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                          <CreditCard className="w-6 h-6 text-slate-500 group-hover:text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 text-sm">
                            Pay Online (Instant)
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Instant verification and active courses via Paystack
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600" />
                      </button>

                      <button
                        onClick={() => setPaymentMethod("manual")}
                        className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/30 transition-all text-left group"
                      >
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                          <Landmark className="w-6 h-6 text-slate-500 group-hover:text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 text-sm">
                            Manual Bank Transfer
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Make transfer and upload receipt for confirmation
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600" />
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
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
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
                            className="flex items-center justify-between p-3 bg-slate-50/60 border border-slate-100/40 rounded-2xl group"
                          >
                            <div className="min-w-0">
                              <p className="text-[10px] text-slate-400 uppercase font-bold">{item.label}</p>
                              <p className="text-sm font-bold text-slate-800 truncate">{item.value}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(item.label, item.value)}
                              className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 shrink-0"
                            >
                              {copiedField === item.label ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-slate-400" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Upload Proof of Payment
                      </p>
                      
                      {!selectedFile ? (
                        <label className="block border-2 border-dashed border-slate-200/80 rounded-2xl p-8 hover:bg-slate-50/50 hover:border-indigo-400 transition-all cursor-pointer text-center group">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <Upload className="w-8 h-8 text-slate-300 mx-auto mb-3 group-hover:text-indigo-500 group-hover:scale-110 transition-all" />
                          <p className="text-sm font-bold text-slate-900">
                            Click to upload receipt
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            PNG, JPG or PDF up to 5MB
                          </p>
                        </label>
                      ) : (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 aspect-video bg-slate-50 flex items-center justify-center">
                          {selectedFile.startsWith("data:application/pdf") ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                              <FileText className="w-12 h-12 text-slate-300 animate-pulse" />
                              <span className="text-xs font-bold text-slate-500">PDF Document Selected</span>
                            </div>
                          ) : (
                            <img src={selectedFile} alt="Preview" className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur shadow-sm rounded-full text-slate-600 hover:text-rose-600 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {selectedFile && (
                        <Button
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-2xl font-bold transition-all shadow-sm flex items-center justify-center gap-2"
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
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                Billing Breakdown
              </h3>
              <div className="space-y-3 mt-6">
                {user.courseSelections.map((course) => (
                  <div
                    key={course.title}
                    className="flex items-center justify-between p-3.5 bg-slate-50/60 border border-slate-100/40 rounded-2xl"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
                      <p className="text-sm font-bold text-slate-800">
                        {course.title}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {formatNaira(course.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between p-4 bg-slate-100 rounded-2xl">
                <p className="text-sm font-bold text-slate-500">Total Program Cost</p>
                <p className="text-lg font-black text-slate-900">
                  {formatNaira(user?.totalCoursePrice || amountDue)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

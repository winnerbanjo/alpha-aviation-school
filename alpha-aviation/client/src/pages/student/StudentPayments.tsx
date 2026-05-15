import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
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
} from "lucide-react";
import { uploadPaymentReceipt, verifyPaystackPayment, getProfile } from "@/api";
import { formatNaira } from "@/data/courseCatalog";
import { useToast } from "@/components/ui/toast";
import { usePaystackPayment } from "react-paystack";
import { motion, AnimatePresence } from "framer-motion";

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

export function StudentPayments() {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
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
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Payments & Bills
        </h1>
        <p className="text-slate-500">
          View your billing status, make payments, and upload payment receipts.
        </p>
      </div>

      {rejectionReason && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-rose-900">Receipt Rejected</p>
            <p className="text-sm text-rose-700 mt-1">{rejectionReason}</p>
          </div>
        </div>
      )}

      {isUnderReview && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">Under Review</p>
            <p className="text-sm text-blue-700 mt-1">
              Your payment receipt has been submitted. Our team will verify it shortly. You will be notified once approved.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Paid</p>
                <h3 className="text-lg font-bold text-slate-900">
                  {formatNaira(amountPaid)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Amount Due</p>
                <h3 className="text-lg font-bold text-slate-900">
                  {formatNaira(amountDue)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${isPaid ? "bg-emerald-100 text-emerald-600" : isUnderReview ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"}`}>
                {isPaid ? <CheckCircle2 className="w-6 h-6" /> : isUnderReview ? <Clock className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Status</p>
                <h3 className="text-lg font-bold text-slate-900">
                  <Badge className={isPaid ? "bg-emerald-100 text-emerald-800 border-emerald-200" : isUnderReview ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-amber-100 text-amber-800 border-amber-200"}>
                    {paymentStatus}
                  </Badge>
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-slate-200 overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-slate-900">
                  {isPending ? "Payment Instructions" : "Payment Status"}
                </CardTitle>
                <CardDescription>
                  {isPending
                    ? "Complete your tuition fee payment."
                    : isUnderReview
                      ? "Your submitted receipt is awaiting admin review."
                      : "Your tuition payment has been confirmed."}
                </CardDescription>
              </div>
              {isPending && paymentMethod !== "selection" && !isSuccess && !uploadingReceipt && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPaymentMethod("selection");
                    setSelectedFile(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  Change Method
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!isPending ? (
              <div className="p-8 flex flex-col items-center text-center space-y-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    isPaid
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {isPaid ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <Clock className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {isPaid ? "Payment Complete" : "Payment Under Review"}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm">
                    {isPaid
                      ? "Your payment has been confirmed and your course access is active."
                      : "Your receipt has been submitted. Admin will verify it before your payment is marked as paid."}
                  </p>
                </div>
                {paymentReceiptUrl && isUnderReview && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(paymentReceiptUrl, "_blank")}
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
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Processing Successful!
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {paymentMethod === "paystack"
                        ? "Your online payment has been verified. Your enrollment status is now active."
                        : "Your receipt has been submitted for review. You'll be notified once verified."}
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
                  <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm font-medium text-slate-600">
                    Processing your payment...
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
                    <p className="text-sm text-slate-500 mb-1">Total Amount Due</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {formatNaira(amountDue)}
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <button
                      onClick={() => initializePayment({ onSuccess: handlePaystackSuccess })}
                      className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50/50 transition-all text-left group"
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <CreditCard className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm">
                          Pay Online (Paystack)
                        </p>
                        <p className="text-xs text-slate-500">
                          Instant activation via card or bank app
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600" />
                    </button>

                    <button
                      onClick={() => setPaymentMethod("manual")}
                      className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50/50 transition-all text-left group"
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Landmark className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm">
                          Bank Transfer / Manual
                        </p>
                        <p className="text-xs text-slate-500">
                          Upload receipt after manual transfer
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600" />
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
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group"
                        >
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">{item.label}</p>
                            <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(item.label, item.value)}
                            className="h-8 w-8 p-0"
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
                      <label className="block border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer text-center group">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Upload className="w-8 h-8 text-slate-300 mx-auto mb-3 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
                        <p className="text-sm font-semibold text-slate-900">
                          Click to upload receipt
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          PNG, JPG or PDF up to 5MB
                        </p>
                      </label>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-100 aspect-video bg-slate-50">
                        {selectedFile.startsWith("data:application/pdf") ? (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <FileText className="w-12 h-12 text-slate-300" />
                            <span className="text-xs font-medium text-slate-500">PDF Document</span>
                          </div>
                        ) : (
                          <img src={selectedFile} alt="Preview" className="w-full h-full object-cover" />
                        )}
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur shadow-sm rounded-full text-slate-600 hover:text-rose-600 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {selectedFile && (
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold"
                        onClick={handleReceiptUpload}
                        disabled={uploadingReceipt}
                      >
                        {uploadingReceipt ? "Uploading..." : "Confirm & Submit Receipt"}
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            )}
          </CardContent>
        </Card>

        {user?.courseSelections && user.courseSelections.length > 0 && (
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-900">
                Billing Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {user.courseSelections.map((course) => (
                  <div
                    key={course.title}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {course.title}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatNaira(course.price)}
                    </p>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg mt-2">
                  <p className="text-sm font-medium text-slate-600">Total</p>
                  <p className="text-base font-bold text-slate-900">
                    {formatNaira(user?.totalCoursePrice || amountDue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}

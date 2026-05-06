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
} from "lucide-react";
import { uploadPaymentReceipt } from "@/api";
import { formatNaira } from "@/data/courseCatalog";
import { useToast } from "@/components/ui/toast";

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

  const handleReceiptUpload = async (file: File) => {
    if (!file.type.startsWith("image/") && !file.type.includes("pdf")) {
      toast("Please upload an image file (JPG, PNG) or PDF", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast("File size must be under 5MB", "error");
      return;
    }

    try {
      setUploadingReceipt(true);
      setRejectionReason(null);
      const encodedReceipt = await fileToDataUrl(file);
      const response = await uploadPaymentReceipt(encodedReceipt);

      if (user && response?.data) {
        setUser({
          ...user,
          paymentReceiptUrl: response.data.paymentReceiptUrl,
          paymentStatus: "Under Review",
          status: response.data.status || user.status,
        });
      }

      toast("Receipt uploaded successfully. Awaiting review.", "success");
      setIsUploadModalOpen(false);
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
        <Card className="border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg text-slate-900">
              Payment Instructions
            </CardTitle>
            <CardDescription>
              Complete your payment via bank transfer.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-1">Amount Due</p>
              <p className="text-3xl font-bold text-slate-900">
                {formatNaira(amountDue)}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">
                Bank Transfer Details
              </p>

              {Object.entries({
                "Account Name": bankDetails.accountName,
                "Account Number": bankDetails.accountNumber,
                Bank: bankDetails.bank,
                Reference: bankDetails.reference,
              }).map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-sm font-medium text-slate-900">
                      {value}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(label, value)}
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    {copiedField === label ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}

              <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200">
                Include your email as reference when making the transfer.
              </p>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setIsUploadModalOpen(true)}
                disabled={isUnderReview}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUnderReview ? "Awaiting Review" : "Upload Receipt"}
              </Button>
            </div>
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

      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Payment Receipt"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Upload a screenshot or photo of your bank transfer receipt. Our team
            will verify it shortly.
          </p>

          <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleReceiptUpload(file);
                }}
                className="hidden"
                disabled={uploadingReceipt}
              />
              <div className="flex flex-col items-center justify-center py-4">
                <FileText className="w-10 h-10 text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-900 mb-1">
                  {uploadingReceipt ? "Uploading..." : "Click to select file"}
                </p>
                <p className="text-xs text-slate-500">
                  JPG, PNG, or PDF (Max 5MB)
                </p>
              </div>
            </label>
          </div>

          <a
            href="mailto:support@aslaviationschool.co"
            className="text-xs text-blue-600 hover:text-blue-800 text-center"
          >
            Or email your receipt directly to support@aslaviationschool.co
          </a>
        </div>
      </Modal>
    </div>
  );
}

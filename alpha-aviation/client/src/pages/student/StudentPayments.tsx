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
import { PaymentModal } from "@/components/PaymentModal";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
} from "lucide-react";
import { uploadPaymentReceipt } from "@/api";
import { formatNaira } from "@/data/courseCatalog";

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

export function StudentPayments() {
  const { user, setUser } = useAuthStore();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const amountDue = user?.amountDue || 0;
  const amountPaid = user?.amountPaid || 0;
  const isPending = user?.paymentStatus === "Pending";
  const paymentReceiptUrl = user?.paymentReceiptUrl || "";

  const handleReceiptUpload = async (file: File) => {
    if (!file.type.startsWith("image/") && !file.type.includes("pdf")) {
      alert("Please upload an image file (JPG, PNG) or PDF");
      return;
    }

    try {
      setUploadingReceipt(true);
      const encodedReceipt = await fileToDataUrl(file);
      const response = await uploadPaymentReceipt(encodedReceipt);

      if (user && response?.data) {
        setUser({
          ...user,
          paymentReceiptUrl: response.data.paymentReceiptUrl,
          status: response.data.status || "Payment Received",
        });
      }
    } catch (error: any) {
      console.error("Error uploading receipt:", error);
      alert(
        error.response?.data?.message ||
          "Failed to upload receipt. Please try again.",
      );
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
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Status</p>
                <h3 className="text-lg font-bold text-slate-900">
                  {isPending ? "Pending" : "Paid"}
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

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setIsPaymentModalOpen(true)}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              View Payment Instructions
            </Button>

            <div className="p-4 bg-slate-50 rounded-lg text-sm">
              <p className="font-semibold text-slate-900 mb-2">
                Bank Transfer Details
              </p>
              <ul className="text-slate-600 space-y-1">
                <li>Account Name: Alpha step links aviation school ltd</li>
                <li>Account Number: 1000485345</li>
                <li>Bank: Globus bank</li>
              </ul>
              <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200">
                Include your email ({user?.email}) as reference.
              </p>
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

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amountDue={amountDue}
        userEmail={user?.email}
      />
    </div>
  );
}

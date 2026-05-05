import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import {
  AlertCircle,
  CheckCircle,
  Calendar,
  Upload,
  DollarSign,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  FileText,
  X,
  BookOpen,
  Download
} from "lucide-react";
import { PaymentModal } from "@/components/PaymentModal";
import { uploadPaymentReceipt } from "@/api";
import { formatNaira } from "@/data/courseCatalog";
import { useNavigate } from "react-router-dom";

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

export function StudentOverview() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  
  // Graduation Modal State
  const [showGradModal, setShowGradModal] = useState(false);

  useEffect(() => {
    if (user?.status === "graduated") {
      const hasSeenModal = sessionStorage.getItem("hasSeenGradModal");
      if (!hasSeenModal) {
        setShowGradModal(true);
        sessionStorage.setItem("hasSeenGradModal", "true");
      }
    }
  }, [user]);

  const isPending = user?.paymentStatus === "Pending";
  const amountDue = user?.amountDue || 0;
  const enrollmentDate = user?.enrollmentDate
    ? new Date(user.enrollmentDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const isGraduated = user?.status === "graduated";
  const needsPaymentReceipt =
    !isGraduated &&
    user?.status === "Pending Payment" &&
    !user?.paymentReceiptUrl;
  const registeredCourses = user?.courseSelections || [];

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

      setReceiptUploaded(true);
      setTimeout(() => setReceiptUploaded(false), 5000);
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
    <div className="p-6 lg:p-8 space-y-8 bg-slate-50 min-h-full">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-slate-500">
          Welcome back, {user?.firstName || "Student"}! Here is a summary of your training progress.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Enrolled Program</p>
              <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{user?.enrolledCourse || "N/A"}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Paid</p>
              <h3 className="text-lg font-bold text-slate-900">{formatNaira(user?.amountPaid || 0)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Amount Due</p>
              <h3 className="text-lg font-bold text-slate-900">{formatNaira(amountDue)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 cursor-pointer hover:border-slate-300 transition-colors" onClick={() => navigate('/dashboard/documents')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Identity Document</p>
              <h3 className="text-lg font-bold text-slate-900">
                {user?.documentUrl ? "Verified" : "Pending"}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Action Required: Payment Receipt Upload */}
          {needsPaymentReceipt && (
            <Card className="border-l-4 border-l-blue-600 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-slate-900 mb-1">
                      Action Required: Payment Receipt
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      To finalize your enrollment, please upload your Bank Transfer Receipt.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {receiptUploaded ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg text-center"
                  >
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-900 mb-1">
                      Receipt Uploaded Successfully!
                    </p>
                    <p className="text-xs text-green-700">
                      Our team will verify your payment shortly.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg border-dashed">
                      <label className="block">
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
                        <div className="flex flex-col items-center justify-center py-6 cursor-pointer hover:opacity-80 transition-opacity">
                          <Upload className="w-8 h-8 text-slate-400 mb-2" />
                          <p className="text-sm font-medium text-slate-900 mb-1">
                            {uploadingReceipt ? "Uploading..." : "Click to upload receipt"}
                          </p>
                          <p className="text-xs text-slate-500">
                            JPG, PNG, or PDF (Max 5MB)
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Enrollment Info Card */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-900">Enrollment Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {user?.studentIdNumber && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Student ID</p>
                    <p className="text-base font-semibold text-slate-900">
                      {user.studentIdNumber}
                    </p>
                  </div>
                )}
                {enrollmentDate && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Enrollment Date</p>
                    <p className="text-base font-semibold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {enrollmentDate}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-3">Registered Courses</p>
                <div className="space-y-3">
                  {registeredCourses.map((course) => (
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
                    <p className="text-sm font-medium text-slate-600">Total Registered Value</p>
                    <p className="text-base font-bold text-slate-900">
                      {formatNaira(user?.totalCoursePrice || amountDue)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Billing Status */}
        <div className="space-y-8">
          {!isGraduated && (
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-slate-900">Billing Status</CardTitle>
                  {isPending ? (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
                      Pending
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                      Paid
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {isPending ? (
                  <div className="space-y-6">
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
                      <p className="font-semibold text-slate-900 mb-2">Bank Transfer Details</p>
                      <ul className="text-slate-600 space-y-1">
                        <li>Account Name: Alpha step links aviation school ltd</li>
                        <li>Account Number: 1000485345</li>
                        <li>Bank: Globus bank</li>
                      </ul>
                      <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200">
                        Include your email ({user?.email}) as reference.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-slate-900">Payment Complete</p>
                    <p className="text-sm text-slate-500 mt-1">Thank you for completing your payment.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Links Card */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 gap-2">
              <Button variant="ghost" className="justify-start text-slate-600 hover:text-blue-600" onClick={() => navigate('/dashboard/curriculum')}>
                <BookOpen className="w-4 h-4 mr-3" /> View Curriculum
              </Button>
              <Button variant="ghost" className="justify-start text-slate-600 hover:text-blue-600" onClick={() => navigate('/dashboard/resources')}>
                <Download className="w-4 h-4 mr-3" /> Access Resources
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amountDue={amountDue}
        userEmail={user?.email}
      />

      {/* Graduation Modal Pop-up */}
      <AnimatePresence>
        {showGradModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
              onClick={() => setShowGradModal(false)}
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden pointer-events-auto relative"
              >
                <button
                  onClick={() => setShowGradModal(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="bg-emerald-50 p-8 text-center border-b border-emerald-100">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-900 mb-2">Congratulations!</h2>
                  <p className="text-emerald-700 font-medium">
                    You have officially graduated!
                  </p>
                </div>
                
                <div className="p-6 text-center">
                  <p className="text-slate-600 mb-6">
                    Your hard work has paid off. You can now download your official completion certificate and view your permanent academic records.
                  </p>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      setShowGradModal(false);
                      navigate('/dashboard/certificate');
                    }}
                  >
                    View My Certificate
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

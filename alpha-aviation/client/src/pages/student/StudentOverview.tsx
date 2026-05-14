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
import { useAuthStore } from "@/store/authStore";
import {
  AlertCircle,
  Calendar,
  DollarSign,
  GraduationCap,
  FileText,
  X,
  BookOpen,
  Download,
  CreditCard,
} from "lucide-react";
import { formatNaira } from "@/data/courseCatalog";
import { useNavigate } from "react-router-dom";

export function StudentOverview() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
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

  const amountDue = user?.amountDue || 0;
  const enrollmentDate = user?.enrollmentDate
    ? new Date(user.enrollmentDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const isGraduated = user?.status === "graduated";
  const isPending = user?.paymentStatus === "Pending";
  const underReview = user?.status === "Under Review";
  const registeredCourses = user?.courseSelections || [];

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-slate-50 min-h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-slate-500">
          Welcome back, {user?.firstName || "Student"}! Here is a summary of
          your training progress.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          className="border-slate-200 cursor-pointer hover:border-slate-300 transition-colors"
          onClick={() => navigate("/dashboard/courses")}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Enrolled Courses
              </p>
              <h3 className="text-lg font-bold text-slate-900">
                {registeredCourses.length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-slate-200 cursor-pointer hover:border-slate-300 transition-colors"
          onClick={() => navigate("/dashboard/payments")}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Paid</p>
              <h3 className="text-lg font-bold text-slate-900">
                {formatNaira(user?.amountPaid || 0)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-slate-200 cursor-pointer hover:border-slate-300 transition-colors"
          onClick={() => navigate("/dashboard/payments")}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Amount Due</p>
              <h3 className="text-lg font-bold text-slate-900">
                {formatNaira(amountDue)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-slate-200 cursor-pointer hover:border-slate-300 transition-colors"
          onClick={() => navigate("/dashboard/profile")}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Identity Document
              </p>
              <h3 className="text-lg font-bold text-slate-900">
                {user?.documentUrl ? "Verified" : "Pending"}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-900">
                Enrollment Details
              </CardTitle>
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
                    <p className="text-sm text-slate-500 mb-1">
                      Enrollment Date
                    </p>
                    <p className="text-base font-semibold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {enrollmentDate}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-3">
                  Registered Courses
                </p>
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
                    <p className="text-sm font-medium text-slate-600">
                      Total Registered Value
                    </p>
                    <p className="text-base font-bold text-slate-900">
                      {formatNaira(user?.totalCoursePrice || amountDue)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {!isGraduated && (
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-900">
                  Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {isPending ? (
                  <>
                    <div className="text-center">
                      <p className="text-sm text-slate-500 mb-1">Amount Due</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {formatNaira(amountDue)}
                      </p>
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => navigate("/dashboard/payments")}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Go to Payments
                    </Button>
                  </>
                ) : underReview ? (
                  <div className="text-center py-4">
                    <p className="font-medium text-orange-700">
                      Payment Under Review
                    </p>
                    <p className="text-sm text-slate-500 mb-1">
                      Please wait for the admin to review your payment.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="font-medium text-green-700">
                      Payment Complete
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-900">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 gap-2">
              <Button
                variant="ghost"
                className="justify-start text-slate-600 hover:text-blue-600"
                onClick={() => navigate("/dashboard/courses")}
              >
                <BookOpen className="w-4 h-4 mr-3" /> View My Courses
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-slate-600 hover:text-blue-600"
                onClick={() => navigate("/dashboard/resources")}
              >
                <Download className="w-4 h-4 mr-3" /> Access Resources
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-slate-600 hover:text-blue-600"
                onClick={() => navigate("/dashboard/certificate")}
              >
                <GraduationCap className="w-4 h-4 mr-3" /> View Certificate
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

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
                  <h2 className="text-2xl font-bold text-emerald-900 mb-2">
                    Congratulations!
                  </h2>
                  <p className="text-emerald-700 font-medium">
                    You have officially graduated!
                  </p>
                </div>

                <div className="p-6 text-center">
                  <p className="text-slate-600 mb-6">
                    Your hard work has paid off. You can now download your
                    official completion certificate and view your permanent
                    academic records.
                  </p>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      setShowGradModal(false);
                      navigate("/dashboard/certificate");
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

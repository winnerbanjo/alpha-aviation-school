import { useAuthStore } from "@/store/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Calendar, BookOpen, Award } from "lucide-react";
import { formatNaira } from "@/data/courseCatalog";

export function StudentRecords() {
  const { user } = useAuthStore();
  const courseSelections = user?.courseSelections || [];
  const enrollmentDate = user?.enrollmentDate
    ? new Date(user.enrollmentDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Training Records
        </h1>
        <p className="text-slate-500">
          View your enrollment history, course completion, and academic records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Courses</p>
              <h3 className="text-lg font-bold text-slate-900">
                {courseSelections.length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Enrolled</p>
              <h3 className="text-lg font-bold text-slate-900">
                {enrollmentDate}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Paid</p>
              <h3 className="text-lg font-bold text-slate-900">
                {formatNaira(user?.amountPaid || 0)}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Course History</CardTitle>
          <CardDescription>
            Your enrolled courses and their status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {courseSelections.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              No courses enrolled yet.
            </p>
          ) : (
            courseSelections.map((course) => (
              <div
                key={course.title}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-slate-900">
                    {course.title}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
                  In Progress
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>
            Your enrollment and account details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            {user?.studentIdNumber && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Student ID</p>
                <p className="text-sm font-semibold text-slate-900">
                  {user.studentIdNumber}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 mb-1">Enrollment Date</p>
              <p className="text-sm font-semibold text-slate-900">
                {enrollmentDate}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Payment Status</p>
              <p className="text-sm font-semibold text-slate-900">
                {user?.paymentStatus || "Pending"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Account Status</p>
              <p className="text-sm font-semibold text-slate-900">
                {user?.status || "active"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

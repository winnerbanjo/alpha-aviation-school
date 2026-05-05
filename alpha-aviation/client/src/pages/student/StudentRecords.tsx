import { useAuthStore } from "@/store/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { formatNaira } from "@/data/courseCatalog";

export function StudentRecords() {
  const { user } = useAuthStore();

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Training Records
        </h1>
        <p className="text-slate-500">
          View your completed courses, achievements, and payment history.
        </p>
      </div>
      <Card className="border-slate-200/50">
      <CardHeader>
        <CardTitle>Training Records</CardTitle>
        <CardDescription>
          Your completed courses and achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user?.selectedCourses?.map((course, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium text-slate-900">{course}</span>
            </div>
            <Badge variant="success">Completed</Badge>
          </div>
        ))}
        <div className="pt-4 border-t">
          <p className="text-sm text-slate-500">
            Total Amount Paid:{" "}
            <span className="font-semibold text-slate-900">
              {formatNaira(user?.amountPaid || 0)}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}

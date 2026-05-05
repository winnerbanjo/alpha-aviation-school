import { useAuthStore } from "@/store/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, BarChart3 } from "lucide-react";
import { formatNaira } from "@/data/courseCatalog";

export function StudentCourses() {
  const { user } = useAuthStore();
  const courseSelections = user?.courseSelections || [];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          My Courses
        </h1>
        <p className="text-slate-500">
          View your enrolled courses, curriculum, and training progress.
        </p>
      </div>

      {courseSelections.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No courses enrolled yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courseSelections.map((course) => (
            <Card
              key={course.title}
              className="border-slate-200 hover:border-slate-300 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
                    In Progress
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-4">{course.title}</CardTitle>
                <CardDescription>{formatNaira(course.price)}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="flex items-center gap-6 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>Duration: TBD</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4" />
                    <span>Progress: 0%</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-0" />
                </div>

                <p className="text-xs text-slate-400">
                  Course materials will be available once payment is confirmed by admin.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

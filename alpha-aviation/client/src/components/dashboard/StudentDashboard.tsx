import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import {
  Calendar,
  BookOpen,
  User,
  FileText,
  Download,
  Award,
} from "lucide-react";

import { StudentOverview } from "@/components/student/StudentOverview";
import { CurriculumTimeline } from "@/components/student/CurriculumTimeline";
import { ProfileDashboard } from "@/components/student/ProfileDashboard";
import { DocumentUploader } from "@/components/student/DocumentUploader";
import { ResourceLibrary } from "@/components/student/ResourceLibrary";
import { StudentCertificate } from "@/components/student/StudentCertificate";
import { StudentRecords } from "@/components/student/StudentRecords";
import { getProfile } from "@/api";

export function StudentDashboard() {
  const { user, setUser } = useAuthStore();
  const { tab = "" } = useParams<{ tab: string }>();
  const navigate = useNavigate();

  // Refresh profile on mount so certificateUrl & other admin-set fields are always current
  useEffect(() => {
    const refreshProfile = async () => {
      try {
        const data = await getProfile();
        const fresh = data?.data?.user;
        if (fresh && user) {
          setUser({ ...user, ...fresh });
        }
      } catch {
        // silently ignore — user remains logged in with cached data
      }
    };
    refreshProfile();
  }, []);

  const isGraduated = user?.status === "graduated";

  const tabs = isGraduated
    ? [
        { id: "certificate", label: "My Certificate", icon: Award },
        { id: "records", label: "Training Records", icon: FileText },
        { id: "profile", label: "Profile Settings", icon: User },
      ]
    : [
        { id: "overview", label: "Overview", icon: Calendar },
        { id: "curriculum", label: "Flight Roadmap", icon: BookOpen },
        { id: "documents", label: "Document Vault", icon: FileText },
        { id: "resources", label: "Resource Library", icon: Download },
        { id: "profile", label: "Profile Settings", icon: User },
      ];

  // Default redirect logic if invalid tab or no tab
  useEffect(() => {
    const validTabs = tabs.map((t) => t.id);
    if (!tab || !validTabs.includes(tab)) {
      navigate(`/dashboard/${validTabs[0]}`, { replace: true });
    }
  }, [tab, tabs, navigate]);

  const renderContent = () => {
    switch (tab) {
      case "overview":
        return <StudentOverview />;
      case "curriculum":
        return user?.enrolledCourse ? (
          <Card className="border-slate-200/50">
            <CardHeader className="p-0" />
            <div className="p-6">
              <CurriculumTimeline course={user.enrolledCourse} />
            </div>
          </Card>
        ) : null;
      case "documents":
        return <DocumentUploader />;
      case "profile":
        return <ProfileDashboard />;
      case "resources":
        return (
          <Card className="border-slate-200/50">
            <CardHeader className="p-0" />
            <div className="p-6">
              <ResourceLibrary />
            </div>
          </Card>
        );
      case "certificate":
        return isGraduated ? <StudentCertificate /> : <StudentOverview />;
      case "records":
        return isGraduated ? <StudentRecords /> : <StudentOverview />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 p-6"
    >
      {/* Graduation Banner */}
      {isGraduated && (
        <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="p-3 bg-green-500 rounded-full">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-green-900 text-xl">
                Congratulations on Your Graduation! 🎓
              </CardTitle>
              <CardDescription className="text-green-700">
                You have successfully completed your training at Alpha Step
                Links Aviation School.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          {isGraduated ? "My Certificate" : "My Training"}
        </h1>
        <p className="text-slate-500">
          {isGraduated
            ? "Download your certificate and view your records"
            : "Track your progress and manage your account"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200/50">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => navigate(`/dashboard/${t.id}`)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                tab === t.id
                  ? "border-[#0061FF] text-[#0061FF]"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">{renderContent()}</div>
    </motion.div>
  );
}

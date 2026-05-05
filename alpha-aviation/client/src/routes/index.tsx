import { lazy, Suspense } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";

import GeneralLayout from "../layout/general";
import StudentLayout from "../layout/student/index";
import AdminLayout from "../layout/admin/index";

// Lazy loading all pages to improve bundle performance (Abibus-style)
const Landing = lazy(() =>
  import("../pages/Landing").then((m) => ({ default: m.Landing })),
);
const Courses = lazy(() =>
  import("../pages/Courses").then((m) => ({ default: m.Courses })),
);
const About = lazy(() =>
  import("../pages/About").then((m) => ({ default: m.About })),
);
const Contact = lazy(() =>
  import("../pages/Contact").then((m) => ({ default: m.Contact })),
);

// Auth & Setup
const Login = lazy(() =>
  import("../pages/Login").then((m) => ({ default: m.Login })),
);
const Enroll = lazy(() =>
  import("../pages/Enroll").then((m) => ({ default: m.Enroll })),
);
const ForgotPassword = lazy(() =>
  import("../pages/ForgotPassword").then((m) => ({
    default: m.ForgotPassword,
  })),
);
const ResetPassword = lazy(() =>
  import("../pages/ResetPassword").then((m) => ({ default: m.ResetPassword })),
);
const VerifyOtp = lazy(() =>
  import("../pages/VerifyOtp").then((m) => ({ default: m.VerifyOtp })),
);
const AdminPortal = lazy(() =>
  import("../pages/AdminPortal").then((m) => ({ default: m.AdminPortal })),
);
const AdminOtpVerification = lazy(() =>
  import("../pages/AdminOtpVerification").then((m) => ({
    default: m.AdminOtpVerification,
  })),
);

const AdminDashboard = lazy(() =>
  import("../pages/admin/AdminDashboard").then((m) => ({
    default: m.AdminDashboard,
  })),
);

const StudentOverview = lazy(() =>
  import("../pages/student/StudentOverview").then((m) => ({
    default: m.StudentOverview,
  })),
);
const StudentCourses = lazy(() =>
  import("../pages/student/StudentCourses").then((m) => ({
    default: m.StudentCourses,
  })),
);
const StudentPayments = lazy(() =>
  import("../pages/student/StudentPayments").then((m) => ({
    default: m.StudentPayments,
  })),
);
const StudentProfile = lazy(() =>
  import("../pages/student/StudentProfile").then((m) => ({
    default: m.StudentProfile,
  })),
);
const StudentResources = lazy(() =>
  import("../pages/student/StudentResources").then((m) => ({
    default: m.StudentResources,
  })),
);
const StudentCertificate = lazy(() =>
  import("../pages/student/StudentCertificate").then((m) => ({
    default: m.StudentCertificate,
  })),
);
const StudentRecords = lazy(() =>
  import("../pages/student/StudentRecords").then((m) => ({
    default: m.StudentRecords,
  })),
);

// Global Loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
    <p className="text-slate-500">Loading...</p>
  </div>
);

export const RoutesConfig = () => {
  const routes = useRoutes([
    {
      path: "/",
      element: <GeneralLayout />,
      children: [
        { path: "/", element: <Landing /> },
        { path: "/courses", element: <Courses /> },
        { path: "/about", element: <About /> },
        { path: "/contact", element: <Contact /> },
      ],
    },
    { path: "/login", element: <Login /> },
    { path: "/enroll", element: <Enroll /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "/verify-otp", element: <VerifyOtp /> },
    { path: "/admin", element: <AdminPortal /> },
    { path: "/admin/portal", element: <Navigate to="/admin" replace /> },
    { path: "/admin/verify-otp", element: <AdminOtpVerification /> },

    // Core Admin Layout
    {
      path: "/admin",
      element: (
        <ProtectedRoute adminOnly>
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "dashboard", element: <AdminDashboard activeTab="overview" /> },
        { path: "students", element: <AdminDashboard activeTab="students" /> },
        { path: "revenue", element: <AdminDashboard activeTab="revenue" /> },
      ],
    },

    // Core Student Layout
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <StudentLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "", element: <Navigate to="/dashboard/overview" replace /> },
        { path: "overview", element: <StudentOverview /> },
        { path: "courses", element: <StudentCourses /> },
        { path: "payments", element: <StudentPayments /> },
        { path: "resources", element: <StudentResources /> },
        { path: "certificate", element: <StudentCertificate /> },
        { path: "records", element: <StudentRecords /> },
        { path: "profile", element: <StudentProfile /> },
      ],
    },
  ]);

  return <Suspense fallback={<PageLoader />}>{routes}</Suspense>;
};

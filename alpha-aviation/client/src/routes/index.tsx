import { lazy, Suspense } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";

import GeneralLayout from "../layout/general";
import StudentLayout from "../layout/student/index";
import AdminLayout from "../layout/admin/index";
import AgentLayout from "../layout/agent/index";

// ─── Public pages ─────────────────────────────────────────────────────────────
const Landing = lazy(() => import("../pages/Landing").then((m) => ({ default: m.Landing })));
const Courses = lazy(() => import("../pages/Courses").then((m) => ({ default: m.Courses })));
const About = lazy(() => import("../pages/About").then((m) => ({ default: m.About })));
const Contact = lazy(() => import("../pages/Contact").then((m) => ({ default: m.Contact })));

// ─── Auth ─────────────────────────────────────────────────────────────────────
const Login = lazy(() => import("../pages/Login").then((m) => ({ default: m.Login })));
const Enroll = lazy(() => import("../pages/Enroll").then((m) => ({ default: m.Enroll })));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword").then((m) => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import("../pages/ResetPassword").then((m) => ({ default: m.ResetPassword })));
const VerifyOtp = lazy(() => import("../pages/VerifyOtp").then((m) => ({ default: m.VerifyOtp })));
const AdminPortal = lazy(() => import("../pages/AdminPortal").then((m) => ({ default: m.AdminPortal })));
const AdminOtpVerification = lazy(() => import("../pages/AdminOtpVerification").then((m) => ({ default: m.AdminOtpVerification })));

// ─── Admin pages ──────────────────────────────────────────────────────────────
const AdminOverview = lazy(() => import("../pages/admin/AdminOverview").then((m) => ({ default: m.AdminOverview })));
const AdminStudents = lazy(() => import("../pages/admin/AdminStudents").then((m) => ({ default: m.AdminStudents })));
const AdminPayments = lazy(() => import("../pages/admin/AdminPayments").then((m) => ({ default: m.AdminPayments })));
const AdminRevenue = lazy(() => import("../pages/admin/AdminRevenue").then((m) => ({ default: m.AdminRevenue })));
const AdminResources = lazy(() => import("../pages/admin/AdminResources").then((m) => ({ default: m.AdminResources })));
const AdminNotifications = lazy(() => import("../pages/admin/AdminNotifications").then((m) => ({ default: m.AdminNotifications })));
const AdminAgents = lazy(() => import("../pages/admin/AdminAgents").then((m) => ({ default: m.AdminAgents })));

// ─── Student pages ────────────────────────────────────────────────────────────
const StudentOverview = lazy(() => import("../pages/student/StudentOverview").then((m) => ({ default: m.StudentOverview })));
const StudentCourses = lazy(() => import("../pages/student/StudentCourses").then((m) => ({ default: m.StudentCourses })));
const StudentPayments = lazy(() => import("../pages/student/StudentPayments").then((m) => ({ default: m.StudentPayments })));
const StudentProfile = lazy(() => import("../pages/student/StudentProfile").then((m) => ({ default: m.StudentProfile })));
const StudentResources = lazy(() => import("../pages/student/StudentResources").then((m) => ({ default: m.StudentResources })));
const StudentCertificate = lazy(() => import("../pages/student/StudentCertificate").then((m) => ({ default: m.StudentCertificate })));
const StudentRecords = lazy(() => import("../pages/student/StudentRecords").then((m) => ({ default: m.StudentRecords })));
const StudentNotifications = lazy(() => import("../pages/student/StudentNotifications").then((m) => ({ default: m.StudentNotifications })));

// ─── Agent pages ──────────────────────────────────────────────────────────────
const AgentLogin = lazy(() => import("../pages/agent/AgentLogin").then((m) => ({ default: m.AgentLogin })));
const AgentEnroll = lazy(() => import("../pages/agent/AgentEnroll").then((m) => ({ default: m.AgentEnroll })));
const AgentPending = lazy(() => import("../pages/agent/AgentPending").then((m) => ({ default: m.AgentPending })));
const AgentOverview = lazy(() => import("../pages/agent/AgentOverview").then((m) => ({ default: m.AgentOverview })));
const AgentStudents = lazy(() => import("../pages/agent/AgentStudents").then((m) => ({ default: m.AgentStudents })));
const AgentPayments = lazy(() => import("../pages/agent/AgentPayments").then((m) => ({ default: m.AgentPayments })));
const AgentProfile = lazy(() => import("../pages/agent/AgentProfile").then((m) => ({ default: m.AgentProfile })));

// Global loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
    <p className="text-slate-500">Loading...</p>
  </div>
);

export const RoutesConfig = () => {
  const routes = useRoutes([
    // ─── Public ───────────────────────────────────────────────────────────────
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

    // ─── Admin dashboard ──────────────────────────────────────────────────────
    {
      path: "/admin/dashboard",
      element: (
        <ProtectedRoute adminOnly>
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "", element: <Navigate to="/admin/dashboard/overview" replace /> },
        { path: "overview", element: <AdminOverview /> },
        { path: "students", element: <AdminStudents /> },
        { path: "payments", element: <AdminPayments /> },
        { path: "revenue", element: <AdminRevenue /> },
        { path: "resources", element: <AdminResources /> },
        { path: "notifications", element: <AdminNotifications /> },
        { path: "agents", element: <AdminAgents /> },
      ],
    },
    { path: "/admin/students", element: <Navigate to="/admin/dashboard/students" replace /> },
    { path: "/admin/payments", element: <Navigate to="/admin/dashboard/payments" replace /> },
    { path: "/admin/revenue", element: <Navigate to="/admin/dashboard/revenue" replace /> },
    { path: "/admin/resources", element: <Navigate to="/admin/dashboard/resources" replace /> },
    { path: "/admin/notifications", element: <Navigate to="/admin/dashboard/notifications" replace /> },

    // ─── Student dashboard ────────────────────────────────────────────────────
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
        { path: "notifications", element: <StudentNotifications /> },
        { path: "profile", element: <StudentProfile /> },
      ],
    },

    // ─── Agent routes ─────────────────────────────────────────────────────────
    { path: "/agent/register", element: <AgentEnroll /> },
    { path: "/agent/login", element: <AgentLogin /> },
    { path: "/agent/pending", element: <AgentPending /> },
    {
      path: "/agent/dashboard",
      element: (
        <ProtectedRoute agentOnly>
          <AgentLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "", element: <Navigate to="/agent/dashboard/overview" replace /> },
        { path: "overview", element: <AgentOverview /> },
        { path: "students", element: <AgentStudents /> },
        { path: "payments", element: <AgentPayments /> },
        { path: "profile", element: <AgentProfile /> },
      ],
    },
    { path: "/agent", element: <Navigate to="/agent/dashboard/overview" replace /> },
  ]);

  return <Suspense fallback={<PageLoader />}>{routes}</Suspense>;
};

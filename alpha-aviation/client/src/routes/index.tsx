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
const RegistrationSuccess = lazy(() =>
  import("../pages/RegistrationSuccess").then((m) => ({
    default: m.RegistrationSuccess,
  })),
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
const AdminPortal = lazy(() =>
  import("../pages/AdminPortal").then((m) => ({ default: m.AdminPortal })),
);

const StudentDashboard = lazy(() =>
  import("../pages/student/StudentDashboard").then((m) => ({
    default: m.StudentDashboard,
  })),
);
const AdminDashboard = lazy(() =>
  import("../pages/admin/AdminDashboard").then((m) => ({
    default: m.AdminDashboard,
  })),
);

// Global Loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
    <p className="text-slate-500">Loading...</p>
  </div>
);

// We will map exactly the previous Dashboard rendering here soon
// The Dashboard component will be completely replaced by layout sub-routes

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
        { path: "/registration-success", element: <RegistrationSuccess /> },
      ],
    },
    { path: "/login", element: <Login /> },
    { path: "/enroll", element: <Enroll /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "/admin", element: <AdminPortal /> },
    { path: "/admin/portal", element: <Navigate to="/admin" replace /> },

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
        { path: "", element: <Navigate to="overview" replace /> },
        { path: ":tab", element: <StudentDashboard /> },
      ],
    },
  ]);

  return <Suspense fallback={<PageLoader />}>{routes}</Suspense>;
};

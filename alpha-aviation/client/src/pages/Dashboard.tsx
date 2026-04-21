import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopNav } from "@/components/dashboard/TopNav";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";

export function Dashboard() {
  const { isAuthenticated, user, token, hasHydrated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const storedToken = localStorage.getItem("token");
  const storedUser = (() => {
    try {
      const rawUser = localStorage.getItem("user");
      return rawUser ? JSON.parse(rawUser) : null;
    } catch {
      return null;
    }
  })();
  const effectiveToken = token || storedToken;
  const effectiveUser = user || storedUser;
  const effectiveIsAuthenticated =
    isAuthenticated || Boolean(effectiveToken && effectiveUser);

  const adminTabFromPath = (): "overview" | "students" | "revenue" => {
    if (location.pathname === "/admin/students") return "students";
    if (location.pathname === "/admin/revenue") return "revenue";
    return "overview";
  };

  useEffect(() => {
    if (!hasHydrated) return;

    if (!effectiveIsAuthenticated || !effectiveUser) {
      if (location.pathname.includes("/admin")) {
        navigate("/admin/portal", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
      return;
    }

    if (effectiveUser.role === "admin") {
      const adminPaths = [
        "/admin/dashboard",
        "/admin/students",
        "/admin/revenue",
      ];
      if (!adminPaths.includes(location.pathname)) {
        navigate("/admin/dashboard", { replace: true });
      }
    } else if (effectiveUser.role === "student") {
      if (location.pathname.includes("/admin")) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [
    hasHydrated,
    effectiveIsAuthenticated,
    effectiveUser,
    navigate,
    location.pathname,
  ]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!effectiveIsAuthenticated || !effectiveUser) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <Sidebar role={effectiveUser.role} />
      <div className="flex-1 lg:ml-64 flex flex-col">
        <TopNav role={effectiveUser.role} />
        <main className="flex-1 overflow-y-auto">
          {effectiveUser.role === "admin" ? (
            <AdminDashboard activeTab={adminTabFromPath()} />
          ) : effectiveUser.role === "student" ? (
            <StudentDashboard />
          ) : (
            <div className="flex items-center justify-center py-16">
              <p className="text-slate-500">Redirecting...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

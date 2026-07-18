import { Suspense, useEffect, useRef, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, CreditCard, User, LogOut, Menu, X
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getProfile } from "@/api";
import { Logo } from "@/components/Logo";

const OutletLoader = () => (
  <div className="flex items-center justify-center h-[50vh] w-full">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent" />
  </div>
);

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/agent/dashboard/overview" },
  { icon: Users, label: "My Students", path: "/agent/dashboard/students" },
  { icon: CreditCard, label: "Payments", path: "/agent/dashboard/payments" },
  { icon: User, label: "Profile", path: "/agent/dashboard/profile" },
];

export default function AgentLayout() {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshUser = async () => {
    if (!user) return;
    try {
      const response = await getProfile();
      if (response?.data?.user) {
        setUser({ ...user, ...response.data.user });
      }
    } catch { /* silent */ }
  };

  useEffect(() => { refreshUser(); }, []);

  useEffect(() => {
    pollRef.current = setInterval(() => {
      if (document.visibilityState === "visible") refreshUser();
    }, 60000);
    const onVisibility = () => { if (document.visibilityState === "visible") refreshUser(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [user]);

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.email || "Agent";
  const initials = user?.firstName || user?.lastName
    ? `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase()
    : (user?.email?.[0] || "A").toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/agent/login");
  };

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-slate-950 border-r border-slate-800 z-40 transition-transform duration-300 ease-out flex flex-col justify-between ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex flex-col flex-1 overflow-y-auto px-4 pt-6 pb-4">
          <div className="flex items-center gap-3 px-2 mb-8">
            <Logo showText={false} size="sm" className="text-white" />
          </div>

          <div className="px-2 mb-6">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Agent Portal</p>
            {user?.agentCode && (
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user.agentCode}</p>
            )}
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{displayName}</p>
                <p className="text-xs text-slate-400 truncate">{user?.agencyName || "Agent"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main body */}
      <div className="flex-1 lg:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Top nav */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500">{user?.agencyName || "Agent Account"}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            <Suspense fallback={<OutletLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

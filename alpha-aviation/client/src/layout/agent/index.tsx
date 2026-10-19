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
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1246C8] border-t-transparent" />
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
    <div className="flex h-screen overflow-hidden bg-[#F5F7FB]">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col justify-between overflow-hidden bg-[#07152E] text-white transition-transform duration-300 ease-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-chart-grid mask-fade-b opacity-70" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#1246C8]/35 blur-[90px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-24 h-64 w-64 rounded-full bg-[#1246C8]/20 blur-[100px]" />

        <div className="relative flex flex-1 flex-col overflow-y-auto px-4 pb-4 pt-5">
          <div className="mb-7 flex items-center gap-3 px-1">
            <Logo showText={false} size="sm" variant="white" className="text-white" />
          </div>

          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8EAEFF]/80">Agent Portal</p>
            {user?.agentCode && (
              <p className="flap mt-2.5 px-2 py-1 text-[11px] tracking-[0.14em]">{user.agentCode}</p>
            )}
          </div>

          <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8EAEFF]/80">Workspace</p>
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors ${
                      isActive
                        ? "bg-white text-[#10264B] shadow-subtle [&_svg]:text-[#1246C8]"
                        : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="relative p-4">
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1246C8] text-xs font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                <p className="truncate text-xs text-white/50">{user?.agencyName || "Agent"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
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
          className="fixed inset-0 z-30 bg-[#07152E]/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main body */}
      <div className="flex h-screen flex-1 flex-col overflow-hidden lg:ml-64">
        {/* Top nav */}
        <header className="sticky top-0 z-30 h-[68px] shrink-0 border-b border-[#DCE2EB]/80 bg-white/85 backdrop-blur-xl">
          <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-10">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#10264B] transition-colors hover:bg-[#F5F7FB] lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-tight text-[#10264B]">{displayName}</p>
                <p className="mt-0.5 text-xs text-[#53647C]">{user?.agencyName || "Agent Account"}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1246C8] text-xs font-bold text-white shadow-glow">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            <Suspense fallback={<OutletLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

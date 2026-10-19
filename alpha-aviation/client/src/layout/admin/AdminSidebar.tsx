import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Banknote,
  Bell,
  CreditCard,
  Download,
  Handshake,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuthStore } from "@/store/authStore";
import { getAdminPendingAgents } from "@/api";

interface AdminSidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function AdminSidebar({
  mobileMenuOpen,
  setMobileMenuOpen,
}: AdminSidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery] = useState("");
  const [pendingAgentCount, setPendingAgentCount] = useState(0);

  useEffect(() => {
    getAdminPendingAgents()
      .then((res) => { if (res?.success) setPendingAgentCount(res.count || 0); })
      .catch(() => {});
  }, []);

  const groups = [
    {
      title: "Operations",
      items: [
        {
          icon: LayoutDashboard,
          label: "Command Center",
          path: "/admin/dashboard/overview",
          badge: 0,
        },
        {
          icon: Users,
          label: "Students",
          path: "/admin/dashboard/students",
          badge: 0,
        },
        {
          icon: CreditCard,
          label: "Payments",
          path: "/admin/dashboard/payments",
          badge: 0,
        },
        {
          icon: Banknote,
          label: "Revenue",
          path: "/admin/dashboard/revenue",
          badge: 0,
        },
        {
          icon: Handshake,
          label: "Agent Requests",
          path: "/admin/dashboard/agents",
          badge: pendingAgentCount,
        },
      ],
    },
    {
      title: "Content & Alerts",
      items: [
        {
          icon: Download,
          label: "Resources",
          path: "/admin/dashboard/resources",
          badge: 0,
        },
        {
          icon: Bell,
          label: "Notifications",
          path: "/admin/dashboard/notifications",
          badge: 0,
        },
      ],
    },
  ];

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email || "Admin User";

  const initials =
    user?.firstName || user?.lastName
      ? `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase()
      : (user?.email?.[0] || "A").toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  const filteredGroups = groups
    .map((group) => {
      const items = group.items.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col justify-between overflow-hidden bg-[#07152E] text-white transition-transform duration-300 ease-out ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 bg-chart-grid mask-fade-b opacity-70" />
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 z-0 h-72 w-72 rounded-full bg-[#1246C8]/35 blur-[100px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-24 z-0 h-64 w-64 rounded-full bg-[#1246C8]/20 blur-[100px]" />

        <div className="relative z-10 flex flex-1 flex-col overflow-y-auto px-4 pt-7 pb-4">
          <div className="mb-9 px-3">
            <Logo variant="white" size="sm" />
          </div>

          <nav className="flex-1 space-y-7">
            {filteredGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <span className="block px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8EAEFF]/80">
                  {group.title}
                </span>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.label}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors ${
                            isActive
                              ? "bg-white text-[#10264B] shadow-subtle [&>svg]:text-[#1246C8]"
                              : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                          }`
                        }
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge > 0 && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1246C8] px-1.5 text-[10px] font-bold text-white ring-1 ring-white/20 tabular-nums">
                            {item.badge > 9 ? "9+" : item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="relative z-10 border-t border-white/10 p-4">
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1246C8] text-xs font-semibold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-white">
                  {displayName}
                </p>
                <p className="truncate text-[11px] text-white/50">
                  Admin Portal
                </p>
              </div>
            </div>

            <div className="flex gap-0.5">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                title="Clear Session"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-[#07152E]/60 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

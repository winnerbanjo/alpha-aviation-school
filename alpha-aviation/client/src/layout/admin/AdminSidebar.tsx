import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Banknote,
  Bell,
  CreditCard,
  Download,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuthStore } from "@/store/authStore";

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

  const groups = [
    {
      title: "Operations",
      items: [
        {
          icon: LayoutDashboard,
          label: "Command Center",
          path: "/admin/dashboard/overview",
        },
        {
          icon: Users,
          label: "Students",
          path: "/admin/dashboard/students",
        },
        {
          icon: CreditCard,
          label: "Payments",
          path: "/admin/dashboard/payments",
        },
        {
          icon: Banknote,
          label: "Revenue",
          path: "/admin/dashboard/revenue",
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
        },
        {
          icon: Bell,
          label: "Notifications",
          path: "/admin/dashboard/notifications",
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
        className={`fixed left-0 top-0 h-full w-64 bg-[#f8fafc] backdrop-blur-xl border-r border-slate-200/60 z-40 transition-transform duration-300 ease-out flex flex-col justify-between ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="absolute top-[-100px] w-64 h-64 rounded-full bg-gradient-to-br from-indigo-200/25 to-purple-200/25 blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-[-100px] w-64 h-64 rounded-full bg-gradient-to-tr from-purple-200/20 to-sky-200/20 blur-3xl pointer-events-none z-0" />

        <div className="flex flex-col flex-1 overflow-y-auto px-5 pt-6 pb-4">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="p-2">
              <Logo showText={false} size="sm" className="text-white" />
            </div>
          </div>

          <nav className="flex-1 space-y-6">
            {filteredGroups.map((group) => (
              <div key={group.title} className="space-y-1.5">
                <span className="px-3 text-[10px] font-bold text-slate-400/90 tracking-wider uppercase">
                  {group.title}
                </span>
                <div className="space-y-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.label}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-2xl transition-all duration-200 ${
                            isActive
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 scale-[1.01]"
                              : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-950"
                          }`
                        }
                      >
                        <Icon className="w-4.5 h-4.5" />
                        {item.label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200/50 bg-slate-50/50 backdrop-blur-md rounded-b-2xl">
          <div className="flex items-center justify-between gap-2 p-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-100 to-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-200/30">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {displayName}
                </p>
                <p className="text-[10px] font-medium text-slate-400 truncate">
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
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Clear Session"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
          className="lg:hidden fixed inset-0 bg-slate-950/20 backdrop-blur-xs z-30 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

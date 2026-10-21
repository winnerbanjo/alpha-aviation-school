import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  CreditCard,
  Download,
  GraduationCap,
  FileText,
  Bell,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/Logo";

interface StudentSidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function StudentSidebar({
  mobileMenuOpen,
  setMobileMenuOpen,
}: StudentSidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery] = useState("");

  const groups = [
    {
      title: "General",
      items: [
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          path: "/dashboard/overview",
        },
        {
          icon: BookOpen,
          label: "Courses",
          path: "/dashboard/courses",
        },
        {
          icon: CreditCard,
          label: "Payments & Bills",
          path: "/dashboard/payments",
        },
        {
          icon: Download,
          label: "Resources",
          path: "/dashboard/resources",
        },
        {
          icon: Bell,
          label: "Notifications",
          path: "/dashboard/notifications",
        },
      ],
    },
    {
      title: "Academic & Profile",
      items: [
        {
          icon: GraduationCap,
          label: "Certificate",
          path: "/dashboard/certificate",
        },
        {
          icon: FileText,
          label: "Records",
          path: "/dashboard/records",
        },
        {
          icon: User,
          label: "Profile Settings",
          path: "/dashboard/profile",
        },
      ],
    },
  ];

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email || "Student Pilot";

  const initials =
    user?.firstName || user?.lastName
      ? `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase()
      : (user?.email?.[0] || "S").toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Filter items based on search query
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
      {/* Sidebar aside */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 overflow-hidden bg-[#07152E] text-white border-r border-white/5 z-40 transition-transform duration-300 ease-out flex flex-col justify-between ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 bg-chart-grid mask-fade-b opacity-70" />
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-28 z-0 h-72 w-72 rounded-full bg-[#1246C8]/35 blur-[90px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-24 z-0 h-64 w-64 rounded-full bg-[#5B86FF]/15 blur-[90px]" />

        <div className="relative z-10 flex flex-col flex-1 overflow-y-auto px-3 pt-6 pb-4">
          {/* Brand header */}
          <div className="flex items-center justify-between gap-2 px-1 mb-8">
            <Logo variant="white" size="sm" />
            {user?.enrolledByAgent && (() => {
              const nameParts = (user.enrolledByAgent?.agentName || "").split(" ").filter(Boolean);
              const initials = nameParts.map((p: string) => p[0]).join("").toUpperCase().slice(0, 2) || "AG";
              return (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1246C8] text-[11px] font-bold text-white ring-2 ring-white/15 shadow-glow" title={user.enrolledByAgent?.agentName || "Agent"}>
                  {initials}
                </div>
              );
            })()}
          </div>

          {/* Search bar */}
          {/* <div className="relative px-1 mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search for anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/60 hover:bg-slate-100/90 focus:bg-white border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 text-slate-700 placeholder-slate-400 transition-all duration-200 outline-none"
            />
          </div> */}

          {/* Navigation links */}
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
                          `group flex items-center gap-3 rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors ${
                            isActive
                              ? "bg-white text-[#10264B] shadow-subtle"
                              : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                          }`
                        }
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0 group-aria-[current=page]:text-[#1246C8]" />
                        {item.label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
            {filteredGroups.length === 0 && (
              <div className="text-center py-6">
                <p className="text-xs text-white/50">
                  No navigation items found
                </p>
              </div>
            )}
          </nav>
        </div>

        {/* Profile Card & Logout */}
        <div className="relative z-10 border-t border-white/10 p-3">
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1246C8] text-xs font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-white">
                  {displayName}
                </p>
                <p className="truncate text-[11px] font-medium text-white/50 tabular-nums">
                  {user?.studentIdNumber || "Student Pilot"}
                </p>
              </div>
            </div>

            <div className="flex gap-0.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/dashboard/profile");
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                title="Profile Settings"
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

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-[#07152E]/60 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

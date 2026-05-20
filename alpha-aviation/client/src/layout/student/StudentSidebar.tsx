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
  Search,
  Settings,
  LogOut,
  Menu,
  X,
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
  const [searchQuery, setSearchQuery] = useState("");

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
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white/95 text-slate-800 rounded-xl shadow-md border border-slate-200/80 hover:bg-slate-50 transition-all duration-200"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar aside */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#f8fafc]   backdrop-blur-xl border-r border-slate-200/60 z-40 transition-transform duration-300 ease-out flex flex-col justify-between ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="absolute top-[-100px] w-64 h-64 rounded-full bg-gradient-to-br from-indigo-200/25 to-purple-200/25 blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-[-100px] w-64 h-64 rounded-full bg-gradient-to-tr from-purple-200/20 to-sky-200/20 blur-3xl pointer-events-none z-0" />

        <div className="flex flex-col flex-1 overflow-y-auto px-5 pt-6 pb-4">
          {/* Brand header */}
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="p-2 ">
              <Logo showText={false} size="sm" className="text-white" />
            </div>
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
            {filteredGroups.length === 0 && (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400">
                  No navigation items found
                </p>
              </div>
            )}
          </nav>
        </div>

        {/* Profile Card & Logout */}
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
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Profile Settings"
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

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/20 backdrop-blur-xs z-30 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

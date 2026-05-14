import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNotifications } from "@/api";

interface TopNavProps {
  role: "admin" | "student";
}

export function TopNav({ role }: TopNavProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate(role === "admin" ? "/admin/portal" : "/login");
  };

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email || "User";
  const initials =
    user?.firstName || user?.lastName
      ? `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase()
      : (user?.email?.[0] || "U").toUpperCase();

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const response = await getNotifications();
        setUnreadCount(response.data.unreadCount);
      } catch {
        setUnreadCount(0);
      }
    };

    loadUnreadCount();
  }, [role]);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(
                  role === "admin"
                    ? "/admin/notifications"
                    : "/dashboard/notifications",
                )
              }
              className="relative h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center"
              aria-label="Open notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 hover:bg-slate-50 transition-colors"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  {initials}
                </div>
                <div className="hidden sm:block text-left min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate max-w-36">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-500 truncate max-w-36">
                    {user?.email}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    {role === "student" && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/dashboard/profile");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Profile Settings
                      </button>
                    )}
                    {role === "admin" && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full justify-start rounded-lg text-sm text-red-700 hover:bg-red-50 hover:text-red-700"
                        onClick={() => {
                          setProfileOpen(false);
                          localStorage.clear();
                          window.location.reload();
                        }}
                      >
                        Clear Session
                      </Button>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

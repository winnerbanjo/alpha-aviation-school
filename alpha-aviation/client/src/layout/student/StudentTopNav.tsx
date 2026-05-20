import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import {
  Bell,
  Share2,
  LogOut,
  GraduationCap,
  Plane,
  AlertTriangle,
} from "lucide-react";
import { getNotifications } from "@/api";

export function StudentTopNav() {
  const { user, logout, tutionPaid } = useAuthStore();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.firstName || "Student";

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const response = await getNotifications();
        if (response?.data) {
          setUnreadCount(response.data.unreadCount || 0);
        }
      } catch {
        setUnreadCount(0);
      }
    };

    loadUnreadCount();
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/20  py-4 px-6 lg:px-8 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Greetings and motivational message */}
        <div>
          <h2 className="text-2xl lg:text-2xl font-medium text-slate-900 tracking-tight">
            {getGreeting()}, {displayName}!
          </h2>
          <p className="text-sm font-normal text-slate-700 mt-1">
            Ready to soar to new heights in your training today?
          </p>
        </div>

        {/* Action controls (badges, notifications, share/logout) */}
        <div className="flex items-center  gap-3 self-end sm:self-auto">
          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => navigate("/dashboard/notifications")}
            className="relative h-10 w-10 border-1 border-black/70 rounded-full bg-white text-slate-600 hover:text-slate-900 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center shrink-0"
            aria-label="Open notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Quick Logout/Share CTA */}
          {/* <button
            onClick={handleLogout}
            className="h-10 px-4 rounded-xl bg-slate-900 text-white font-semibold text-xs shadow-sm hover:bg-slate-800 transition-all flex items-center gap-2 shrink-0"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button> */}
        </div>
      </div>
    </header>
  );
}

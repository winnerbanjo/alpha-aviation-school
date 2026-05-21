import { useEffect, useState } from "react";
import { Bell, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getNotifications } from "@/api";
import { useAuthStore } from "@/store/authStore";

interface AdminTopNavProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function AdminTopNav({
  mobileMenuOpen,
  setMobileMenuOpen,
}: AdminTopNavProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const displayName = user?.firstName || "Admin";

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
    <header className="sticky top-0 z-30 bg-white/20 py-4 px-6 lg:px-8 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 bg-white/95 text-slate-800 rounded-xl shadow-md border border-slate-200/80 hover:bg-slate-50 transition-all duration-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <div className="hidden lg:block">
            <h2 className="text-2xl lg:text-2xl font-medium text-slate-900 tracking-tight">
              {getGreeting()}, {displayName}!
            </h2>
            <p className="text-sm font-normal text-slate-700 mt-1">
              Monitor enrollments, payments, resources, and student activity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard/notifications")}
            className="relative h-10 w-10 border-1 border-black/70 rounded-full bg-white text-slate-600 hover:text-slate-900 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center shrink-0"
            aria-label="Open notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

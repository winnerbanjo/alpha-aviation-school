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
    <header className="sticky top-0 z-30 h-[68px] border-b border-[#DCE2EB]/80 bg-white/85 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#10264B] transition-colors hover:bg-[#F5F7FB]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <span className="lg:hidden text-sm font-semibold tracking-tight text-[#10264B]">
            Admin console
          </span>

          <div className="hidden min-w-0 lg:block">
            <h2 className="truncate text-[15px] font-semibold tracking-tight text-[#10264B]">
              {getGreeting()}, {displayName}!
            </h2>
            <p className="mt-0.5 truncate text-[13px] text-[#53647C]">
              Monitor enrollments, payments, resources, and student activity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard/notifications")}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#53647C] transition-colors hover:bg-[#F5F7FB] hover:text-[#10264B]"
            aria-label="Open notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#1246C8] ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

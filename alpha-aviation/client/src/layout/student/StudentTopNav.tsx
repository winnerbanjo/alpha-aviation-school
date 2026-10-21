import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import {
  Bell,
  Menu,
  X,
} from "lucide-react";
import { getNotifications } from "@/api";
import { Logo } from "@/components/Logo";

interface StudentTopNavProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function StudentTopNav({ mobileMenuOpen, setMobileMenuOpen }: StudentTopNavProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

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
    <header className="sticky top-0 z-30 h-[68px] border-b border-[#DCE2EB]/80 bg-white/85 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
      <div className="flex h-full items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button (mobile only) & Greeting (desktop only) */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DCE2EB] bg-white text-[#10264B] transition-colors hover:bg-[#F5F7FB]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <Logo variant="color" size="sm" className="lg:hidden" />

          {/* Greetings and motivational message (desktop only) */}
          <div className="hidden min-w-0 lg:block">
            <h2 className="truncate text-[15px] font-semibold tracking-tight text-[#10264B]">
              {getGreeting()}, {displayName}!
            </h2>
            <p className="mt-0.5 truncate text-xs text-[#53647C]">
              Ready to soar to new heights in your training today?
            </p>
          </div>
        </div>

        {/* Right Side: Notification Icon */}
        <div className="flex items-center gap-2">
          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => navigate("/dashboard/notifications")}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#53647C] transition-colors hover:bg-[#F5F7FB] hover:text-[#10264B]"
            aria-label="Open notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#1246C8] ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

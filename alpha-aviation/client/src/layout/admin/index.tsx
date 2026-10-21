import { Suspense, useEffect, useEffectEvent, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { getProfile } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopNav } from "./AdminTopNav";

const OutletLoader = () => (
  <div className="flex items-center justify-center h-[50vh] w-full">
    <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#DCE8FF] border-t-[#1246C8]" />
  </div>
);

export default function AdminLayout() {
  const { user, setUser } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshUser = async () => {
    if (!user) return;
    try {
      const response = await getProfile();
      if (response?.data?.user) {
        setUser({ ...user, ...response.data.user });
      }
    } catch {
      // Keep the existing admin session if the profile refresh fails.
    }
  };

  // Lets the effects below always call the latest refreshUser without
  // re-subscribing on every render.
  const onRefreshUser = useEffectEvent(() => {
    refreshUser();
  });

  useEffect(() => {
    onRefreshUser();
  }, []);

  useEffect(() => {
    const onFocus = () => onRefreshUser();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user]);

  useEffect(() => {
    pollRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        onRefreshUser();
      }
    }, 60000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        onRefreshUser();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [user]);

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#F5F7FB] text-[#172B49]">
      <div aria-hidden className="pointer-events-none absolute right-[-160px] top-[-160px] z-0 h-[420px] w-[420px] rounded-full bg-[#DCE8FF]/70 blur-[120px]" />

      <AdminSidebar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="relative z-10 flex h-screen flex-1 flex-col overflow-hidden lg:ml-64">
        <main className="relative flex-1 overflow-y-auto">
          <AdminTopNav
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
          <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            <Suspense fallback={<OutletLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

import { Suspense, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { getProfile } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopNav } from "./AdminTopNav";

const OutletLoader = () => (
  <div className="flex items-center justify-center h-[50vh] w-full">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
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

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    const onFocus = () => refreshUser();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user]);

  useEffect(() => {
    pollRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshUser();
      }
    }, 60000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshUser();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [user]);

  return (
    <div className="h-screen bg-white relative flex overflow-hidden">
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-200/25 to-purple-200/25 blur-3xl pointer-events-none z-0" />

      <AdminSidebar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex-1 lg:ml-64 flex flex-col h-screen overflow-hidden relative z-10">
        <main className="flex-1 overflow-y-auto relative">
          <AdminTopNav
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
          <div className="p-6 lg:p-8">
            <Suspense fallback={<OutletLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

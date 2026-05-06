import { Suspense, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../sidebar";
import { TopNav } from "../topnav";
import { useAuthStore } from "@/store/authStore";
import { getProfile } from "@/api";

const OutletLoader = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0061FF] border-t-transparent" />
  </div>
);

export default function StudentLayout() {
  const { user, setUser } = useAuthStore();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshUser = async () => {
    if (!user) return;
    try {
      const response = await getProfile();
      if (response?.data?.user) {
        setUser({ ...user, ...response.data.user });
      }
    } catch {
      // Silent fail — user may be offline or token expired
    }
  };

  // Refresh on mount
  useEffect(() => {
    refreshUser();
  }, []);

  // Refresh on window focus
  useEffect(() => {
    const onFocus = () => refreshUser();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user]);

  // Poll every 60s only when tab is visible
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
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <Sidebar role="student" />
      <div className="flex-1 lg:ml-64 flex flex-col">
        <TopNav role="student" />
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<OutletLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

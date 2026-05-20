import { Suspense, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { StudentSidebar } from "./StudentSidebar";
import { StudentTopNav } from "./StudentTopNav";
import { useAuthStore } from "@/store/authStore";
import { getProfile } from "@/api";
import { PaymentSteps } from "@/components/student/PaymentSteps";
import { PhoneNumberPrompt } from "@/components/student/PhoneNumberPrompt";

const OutletLoader = () => (
  <div className="flex items-center justify-center h-[50vh] w-full">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
  </div>
);

export default function StudentLayout() {
  const { user, setUser, tutionPaid } = useAuthStore();
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
      // Silent fail — user may be offline or token expired
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
    <div className="min-h-screen bg-white relative flex overflow-x-hidden">
      {/* Premium background mesh lights */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-200/25 to-purple-200/25 blur-3xl pointer-events-none z-0" />

      {/* Global prompts */}
      <PaymentSteps
        user={user}
        tutionPaid={tutionPaid}
        refreshUser={refreshUser}
      />
      <PhoneNumberPrompt />

      {/* Modern Sidebar */}
      <StudentSidebar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Body */}
      <div className="flex-1 lg:ml-64 flex flex-col relative z-10">
        <StudentTopNav />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Suspense fallback={<OutletLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

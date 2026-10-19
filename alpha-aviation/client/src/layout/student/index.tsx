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
    <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-[#DCE2EB] border-t-[#1246C8]" />
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
    <div className="h-screen bg-[#F5F7FB] text-[#172B49] relative flex overflow-hidden">
      {/* Soft brand glow behind the canvas */}
      <div aria-hidden className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-[#DCE8FF]/70 blur-[120px] pointer-events-none z-0" />
      {/* <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-200/25 to-purple-200/25 blur-3xl pointer-events-none z-0" /> */}
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
      <div className="flex-1 lg:ml-64 flex flex-col h-screen overflow-hidden relative z-10">
        <main className="flex-1 overflow-y-auto relative">
          <StudentTopNav
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            <Suspense fallback={<OutletLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

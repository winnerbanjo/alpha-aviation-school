import { useEffect, useEffectEvent } from "react";
import { Clock, Mail, LogOut, XCircle, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { getProfile } from "@/api";
import { AuthShell } from "@/components/auth/AuthShell";

export function AgentPending() {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();

  // Refresh the profile once on mount, merging into the latest stored user
  const syncProfile = useEffectEvent(() => {
    getProfile()
      .then((res) => {
        if (res?.data?.user) {
          setUser({ ...user, ...res.data.user });
        }
      })
      .catch(() => {});
  });
  useEffect(() => {
    syncProfile();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await getProfile();
        if (res?.data?.user && res.data.user.agentStatus === "approved") {
          setUser(res.data.user);
          navigate("/agent/dashboard/overview", { replace: true });
        }
      } catch {
        /* silent */
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [navigate, setUser]);

  useEffect(() => {
    if (user?.agentStatus === "approved") {
      navigate("/agent/dashboard/overview", { replace: true });
    }
  }, [user?.agentStatus, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/agent/login");
  };

  const isRejected = user?.agentStatus === "rejected";
  const isSuspended = user?.agentStatus === "suspended";
  const isDeclined = isRejected || isSuspended;

  const statusIcon = isRejected ? XCircle : isSuspended ? AlertTriangle : Clock;
  const StatusIcon = statusIcon;
  const statusTitle = isRejected ? "Application Declined" : isSuspended ? "Account Suspended" : "Under Review";

  return (
    <AuthShell
      eyebrow="Partner application"
      title="Your partner"
      accent="application status."
      description="We review every agent application individually. This page checks for updates automatically and opens your dashboard as soon as you're approved."
      video="instructor-briefing"
    >
      <div className="w-full">
        <div className="rounded-panel border border-[#DCE2EB] bg-white p-8 text-center shadow-subtle">
          <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ring-1 ${
            isDeclined ? "bg-red-50 ring-red-600/15" : "bg-amber-50 ring-amber-600/15"
          }`}>
            <StatusIcon className={`h-7 w-7 ${isDeclined ? "text-red-600" : "text-amber-600"}`} />
          </div>

          <h1 className="mb-3 text-2xl font-bold tracking-tightest text-[#10264B] sm:text-3xl">{statusTitle}</h1>

          <p className="mb-6 text-sm leading-relaxed text-[#53647C]">
            {isRejected
              ? "Unfortunately, your agent application has been declined. Please contact our team if you believe this is an error."
              : isSuspended
              ? "Your agent account has been suspended. Please contact our support team for more information."
              : "Your agent application has been submitted and is being reviewed. This usually takes 24–48 hours."
            }
          </p>

          {isRejected && user?.agentNotes && (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-left">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-red-700">Reason</p>
              <p className="text-sm text-[#172B49]">{user.agentNotes}</p>
            </div>
          )}

          <div className="mb-6 rounded-2xl border border-[#DCE2EB] bg-[#F5F7FB] p-4 text-left">
            <div className="mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#1246C8]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Notification Email</span>
            </div>
            <p className="text-sm font-semibold text-[#10264B]">{user?.email}</p>
            <p className="mt-1 text-xs text-[#53647C]">
              {isDeclined
                ? "Contact our support team for assistance."
                : "You will receive a confirmation email once your application is processed."}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-[#10264B]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#10264B] transition-colors hover:border-[#1246C8] hover:text-[#1246C8]"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </AuthShell>
  );
}

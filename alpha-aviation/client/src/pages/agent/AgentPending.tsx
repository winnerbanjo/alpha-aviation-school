import { Clock, Mail, LogOut, XCircle, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

export function AgentPending() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5 ${
            isDeclined ? "bg-red-50" : "bg-amber-50"
          }`}>
            <StatusIcon className={`w-7 h-7 ${isDeclined ? "text-red-500" : "text-amber-500"}`} />
          </div>

          <h1 className="text-lg font-semibold text-slate-900 mb-2">{statusTitle}</h1>

          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            {isRejected
              ? "Unfortunately, your agent application has been declined. Please contact our team if you believe this is an error."
              : isSuspended
              ? "Your agent account has been suspended. Please contact our support team for more information."
              : "Your agent application has been submitted and is being reviewed. This usually takes 24–48 hours."
            }
          </p>

          {isRejected && user?.agentNotes && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs font-medium text-red-600 uppercase tracking-wider mb-1">Reason</p>
              <p className="text-sm text-slate-700">{user.agentNotes}</p>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Notification Email</span>
            </div>
            <p className="text-sm font-medium text-slate-900">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-1">
              {isDeclined
                ? "Contact our support team for assistance."
                : "You will receive a confirmation email once your application is processed."}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

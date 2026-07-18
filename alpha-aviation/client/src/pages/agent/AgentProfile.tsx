import { useAuthStore } from "@/store/authStore";
import { Building2, Mail, Phone, Shield, Copy, Check } from "lucide-react";
import { useState } from "react";

export function AgentProfile() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (!user?.agentCode) return;
    navigator.clipboard.writeText(user.agentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Agent Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your agency details and account information</p>
      </div>

      <div className="bg-slate-900 rounded-lg p-6 text-white">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Your Agent Code</p>
        <div className="flex items-center gap-3">
          <p className="text-3xl font-mono font-bold tracking-wider">{user?.agentCode || "—"}</p>
          <button
            onClick={copyCode}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-slate-400 text-xs mt-3">Use this code when communicating with the admin team</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-900">Account Details</h2>

        {[
          { icon: Shield, label: "Full Name", value: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "—" },
          { icon: Building2, label: "Agency Name", value: user?.agencyName || "—" },
          { icon: Mail, label: "Email Address", value: user?.email || "—" },
          { icon: Phone, label: "Phone Number", value: user?.phone || "—" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-b-0 last:pb-0">
              <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg shrink-0">
                <Icon className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-medium text-slate-900 mt-0.5">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Account Status</h2>
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${user?.agentStatus === "approved" ? "bg-emerald-500" : "bg-amber-500"}`} />
          <span className={`text-sm font-medium capitalize ${user?.agentStatus === "approved" ? "text-emerald-700" : "text-amber-700"}`}>
            {user?.agentStatus || "Unknown"}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {user?.agentStatus === "approved"
            ? "Your account is active. You can register students and manage payments."
            : "Your account status is being reviewed by the admin team."}
        </p>
      </div>
    </div>
  );
}

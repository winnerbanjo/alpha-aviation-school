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
    <div className="max-w-2xl space-y-6 pb-12">
      <div>
        <span className="eyebrow text-[#1246C8]">Agent portal</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">Agent profile</h1>
        <p className="mt-2 text-[#53647C]">Your agency details and account information</p>
      </div>

      <div className="relative overflow-hidden rounded-stage bg-[#07152E] p-6 text-white shadow-float sm:p-8">
        <div aria-hidden="true" className="absolute inset-0 bg-chart-grid mask-fade-b opacity-70" />
        <div aria-hidden="true" className="absolute -right-32 -top-32 h-[380px] w-[380px] rounded-full bg-[#1246C8]/40 blur-[110px]" />
        <p className="relative mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8EAEFF]">Your Agent Code</p>
        <div className="relative flex flex-wrap items-center gap-3">
          <p className="flap px-3 py-2 text-2xl tracking-[0.14em] sm:text-3xl">{user?.agentCode || "—"}</p>
          <button
            onClick={copyCode}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
            title="Copy code"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <p className="relative mt-4 text-xs text-white/60">Use this code when communicating with the admin team</p>
      </div>

      <div className="space-y-5 rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle sm:p-7">
        <h2 className="text-lg font-bold tracking-tighter text-[#10264B]">Account details</h2>

        {[
          { icon: Shield, label: "Full Name", value: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "—" },
          { icon: Building2, label: "Agency Name", value: user?.agencyName || "—" },
          { icon: Mail, label: "Email Address", value: user?.email || "—" },
          { icon: Phone, label: "Phone Number", value: user?.phone || "—" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-4 border-b border-[#DCE2EB]/70 pb-4 last:border-b-0 last:pb-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">{item.label}</p>
                <p className="mt-0.5 break-words text-sm font-semibold text-[#10264B]">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle sm:p-7">
        <h2 className="mb-4 text-lg font-bold tracking-tighter text-[#10264B]">Account status</h2>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#F5F7FB] px-3 py-1.5 ring-1 ring-[#DCE2EB]">
          <div className={`h-2 w-2 rounded-full ${user?.agentStatus === "approved" ? "bg-emerald-500" : "bg-amber-500"}`} />
          <span className={`text-xs font-semibold capitalize ${user?.agentStatus === "approved" ? "text-emerald-700" : "text-amber-700"}`}>
            {user?.agentStatus || "Unknown"}
          </span>
        </div>
        <p className="mt-3 text-sm text-[#53647C]">
          {user?.agentStatus === "approved"
            ? "Your account is active. You can register students and manage payments."
            : "Your account status is being reviewed by the admin team."}
        </p>
      </div>
    </div>
  );
}

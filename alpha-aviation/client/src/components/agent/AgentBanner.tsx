import { motion } from "framer-motion";
import { Mail, Phone, ShieldCheck } from "lucide-react";

export interface AgentBannerData {
  agentName: string;
  agencyName?: string;
  agentCode?: string;
  agentEmail: string;
  agentPhone?: string;
}

interface AgentBannerProps {
  agent: AgentBannerData;
  paymentStatus: "Pending" | "Paid";
}

export function AgentBanner({ agent, paymentStatus }: AgentBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-stage bg-[#07152E] p-6 text-white shadow-float sm:p-7"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-chart-grid mask-fade-b opacity-70" />
      <div aria-hidden="true" className="absolute -right-32 -top-32 h-[380px] w-[380px] rounded-full bg-[#1246C8]/40 blur-[110px]" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1246C8] text-white shadow-glow">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="eyebrow mb-2 text-[#8EAEFF]">Enrolled via Agent</p>
            <p className="text-lg font-bold tracking-tight">
              <span className="text-gradient-sky">{agent.agentName}</span>
              {agent.agencyName && (
                <span className="font-normal text-white/55"> · {agent.agencyName}</span>
              )}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              {agent.agentCode && (
                <span className="flap px-2 py-1 text-[11px] tracking-[0.14em]">
                  {agent.agentCode}
                </span>
              )}
              {agent.agentEmail && (
                <span className="flex items-center gap-1.5 text-xs text-white/65">
                  <Mail className="h-3.5 w-3.5 text-[#8EAEFF]" />
                  {agent.agentEmail}
                </span>
              )}
              {agent.agentPhone && (
                <span className="flex items-center gap-1.5 text-xs text-white/65">
                  <Phone className="h-3.5 w-3.5 text-[#8EAEFF]" />
                  {agent.agentPhone}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="shrink-0 border-t border-white/10 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">Tuition Status</p>
          <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
            paymentStatus === "Paid"
              ? "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30"
              : "bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/30"
          }`}>
            {paymentStatus === "Paid" ? "✓ Paid by Agent" : "Pending Payment"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

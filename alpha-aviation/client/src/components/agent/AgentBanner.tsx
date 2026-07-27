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
      className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-200/60 rounded-3xl p-5 shadow-[0px_4px_20px_0px_rgba(99,102,241,0.08)] backdrop-blur-md"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-3 bg-indigo-100 border border-indigo-200/60 rounded-2xl shrink-0">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wider text-indigo-600 mb-0.5">Enrolled via Agent</p>
            <p className="text-sm font-bold text-slate-900">
              {agent.agentName}
              {agent.agencyName && (
                <span className="text-slate-500 font-normal"> · {agent.agencyName}</span>
              )}
            </p>
            <div className="flex flex-wrap gap-3 mt-1">
              {agent.agentCode && (
                <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-100 border border-indigo-200 rounded-md px-1.5 py-0.5">
                  {agent.agentCode}
                </span>
              )}
              {agent.agentEmail && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {agent.agentEmail}
                </span>
              )}
              {agent.agentPhone && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {agent.agentPhone}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tuition Status</p>
          <span className={`text-sm font-black px-3 py-1.5 rounded-xl ${
            paymentStatus === "Paid"
              ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
              : "text-amber-700 bg-amber-50 border border-amber-200"
          }`}>
            {paymentStatus === "Paid" ? "✓ Paid by Agent" : "Pending Payment"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

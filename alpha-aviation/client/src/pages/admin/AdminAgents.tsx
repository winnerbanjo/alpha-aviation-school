import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, CheckCircle2, Clock, XCircle, AlertCircle, Search, X, ChevronDown, ChevronRight,
  Building2, Mail, Phone, Shield, RefreshCw
} from "lucide-react";
import {
  getAdminAgents, approveAgent, rejectAgent, suspendAgent, reactivateAgent, getAgentStudentsAdmin
} from "@/api";

interface Agent {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  agencyName?: string;
  agentCode?: string;
  agentStatus: "pending" | "approved" | "rejected" | "suspended";
  agentNotes?: string;
  studentCount: number;
  createdAt: string;
}

interface AgentStudent {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentIdNumber: string;
  paymentStatus: string;
}

type FilterTab = "all" | "pending" | "approved" | "rejected" | "suspended";

export function AdminAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("pending");
  const [search, setSearch] = useState("");
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [agentStudents, setAgentStudents] = useState<Record<string, AgentStudent[]>>({});
  const [studentsLoading, setStudentsLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<Agent | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadAgents = useCallback(async () => {
    try {
      const res = await getAdminAgents();
      if (res?.success) setAgents(res.data.agents);
    } catch (error) {
      console.error("Failed to load agents", error);
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAgents(); }, [loadAgents]);

  const filtered = agents.filter((a) => {
    const matchFilter = filter === "all" || a.agentStatus === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || [a.firstName, a.lastName, a.email, a.agentCode || "", a.agencyName || ""].some((f) => f.toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  const pendingCount = agents.filter((a) => a.agentStatus === "pending").length;

  const toggleExpand = async (agentId: string) => {
    if (expandedAgent === agentId) { setExpandedAgent(null); return; }
    setExpandedAgent(agentId);
    if (!agentStudents[agentId]) {
      setStudentsLoading(agentId);
      try {
        const res = await getAgentStudentsAdmin(agentId);
        if (res?.success) setAgentStudents((p) => ({ ...p, [agentId]: res.data.students }));
      } catch (error) {
        console.error("Failed to load agent students", error);
      }
      finally { setStudentsLoading(null); }
    }
  };

  const handleApprove = async (agent: Agent) => {
    setActionLoading(agent._id + "-approve");
    try {
      await approveAgent(agent._id);
      await loadAgents();
    } catch (error) {
      console.error("Failed to approve agent", error);
    }
    finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;
    setActionLoading(rejectModal._id + "-reject");
    try {
      await rejectAgent(rejectModal._id, rejectReason.trim());
      await loadAgents();
      setRejectModal(null);
      setRejectReason("");
    } catch (error) {
      console.error("Failed to reject agent", error);
    }
    finally { setActionLoading(null); }
  };

  const handleSuspend = async (agent: Agent) => {
    setActionLoading(agent._id + "-suspend");
    try {
      await suspendAgent(agent._id);
      await loadAgents();
    } catch (error) {
      console.error("Failed to suspend agent", error);
    }
    finally { setActionLoading(null); }
  };

  const handleReactivate = async (agent: Agent) => {
    setActionLoading(agent._id + "-reactivate");
    try {
      await reactivateAgent(agent._id);
      await loadAgents();
    } catch (error) {
      console.error("Failed to reactivate agent", error);
    }
    finally { setActionLoading(null); }
  };

  const statusBadge = (status: Agent["agentStatus"]) => {
    const map = {
      pending: { text: "Pending", cls: "text-amber-700 bg-amber-50 ring-amber-600/15", icon: <Clock className="w-3 h-3" /> },
      approved: { text: "Approved", cls: "text-emerald-700 bg-emerald-50 ring-emerald-600/15", icon: <CheckCircle2 className="w-3 h-3" /> },
      rejected: { text: "Rejected", cls: "text-red-700 bg-red-50 ring-red-600/15", icon: <XCircle className="w-3 h-3" /> },
      suspended: { text: "Suspended", cls: "text-orange-700 bg-orange-50 ring-orange-600/15", icon: <AlertCircle className="w-3 h-3" /> },
    };
    const s = map[status];
    return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${s.cls}`}>{s.icon}{s.text}</span>;
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "pending", label: `Pending${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
    { key: "approved", label: "Approved" },
    { key: "all", label: "All" },
    { key: "rejected", label: "Rejected" },
    { key: "suspended", label: "Suspended" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <span className="eyebrow text-[#1246C8]">Administration</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">Agent Requests</h1>
        <p className="mt-2 max-w-2xl text-[#53647C]">Review and manage agent applications and active agents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-[#DCE2EB] bg-[#DCE2EB] shadow-subtle md:grid-cols-4">
        {[
          { label: "Total Agents", value: agents.length, color: "indigo" },
          { label: "Pending", value: agents.filter(a => a.agentStatus === "pending").length, color: "amber" },
          { label: "Approved", value: agents.filter(a => a.agentStatus === "approved").length, color: "emerald" },
          { label: "Total Students", value: agents.reduce((sum, a) => sum + a.studentCount, 0), color: "purple" },
        ].map((s) => (
          <div key={s.label} className="bg-white p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">{s.label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tightest tabular-nums text-[#10264B]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-shrink-0 gap-1 overflow-x-auto rounded-full border border-[#DCE2EB] bg-white p-1 shadow-subtle">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${filter === t.key ? "bg-[#10264B] text-white shadow-subtle" : "text-[#53647C] hover:bg-[#F5F7FB] hover:text-[#10264B]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9AB0]" />
          <input
            type="text"
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-[#DCE2EB] bg-white py-2.5 pl-11 pr-4 text-sm text-[#172B49] shadow-subtle outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
          />
        </div>
      </div>

      {/* Agent list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#DCE8FF] border-t-[#1246C8]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-panel border border-[#DCE2EB] bg-white py-16 text-center shadow-subtle">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F7FB] text-[#8C9AB0]">
            <Users className="h-6 w-6" />
          </div>
          <p className="font-medium text-[#53647C]">{filter === "pending" ? "No pending agent requests" : "No agents found"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((agent) => (
            <motion.div
              key={agent._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-panel border border-[#DCE2EB] bg-white shadow-subtle transition-shadow hover:shadow-card"
            >
              {/* Agent row */}
              <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Avatar + info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DCE8FF] text-sm font-semibold text-[#1246C8]">
                    {(agent.firstName[0] || "") + (agent.lastName[0] || "")}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[15px] font-semibold tracking-tight text-[#10264B]">{agent.firstName} {agent.lastName}</p>
                      {statusBadge(agent.agentStatus)}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                      {agent.agencyName && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-[#172B49]"><Building2 className="h-3.5 w-3.5 text-[#8C9AB0]" />{agent.agencyName}</span>
                      )}
                      <span className="flex items-center gap-1.5 text-xs text-[#53647C]"><Mail className="h-3.5 w-3.5 text-[#8C9AB0]" />{agent.email}</span>
                      {agent.phone && (
                        <span className="flex items-center gap-1.5 text-xs text-[#53647C]"><Phone className="h-3.5 w-3.5 text-[#8C9AB0]" />{agent.phone}</span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {agent.agentCode && (
                        <span className="rounded-full bg-[#DCE8FF] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#1246C8]">{agent.agentCode}</span>
                      )}
                      <span className="text-[11px] tabular-nums text-[#8C9AB0]">{agent.studentCount} student{agent.studentCount !== 1 ? "s" : ""}</span>
                      <span className="text-[11px] text-[#8C9AB0]">Applied {new Date(agent.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {agent.agentStatus === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(agent)}
                        disabled={actionLoading === agent._id + "-approve"}
                        className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {actionLoading === agent._id + "-approve" ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Approve
                      </button>
                      <button
                        onClick={() => { setRejectModal(agent); setRejectReason(""); }}
                        className="flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-2 text-[13px] font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  )}
                  {agent.agentStatus === "approved" && (
                    <button
                      onClick={() => handleSuspend(agent)}
                      disabled={actionLoading === agent._id + "-suspend"}
                      className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-4 py-2 text-[13px] font-semibold text-orange-700 transition-colors hover:border-orange-300 hover:bg-orange-50 disabled:opacity-50"
                    >
                      {actionLoading === agent._id + "-suspend" ? <div className="w-3.5 h-3.5 border-2 border-orange-300 border-t-orange-700 rounded-full animate-spin" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      Suspend
                    </button>
                  )}
                  {(agent.agentStatus === "suspended" || agent.agentStatus === "rejected") && (
                    <button
                      onClick={() => handleReactivate(agent)}
                      disabled={actionLoading === agent._id + "-reactivate"}
                      className="flex items-center gap-1.5 rounded-full border border-[#10264B]/15 bg-white px-4 py-2 text-[13px] font-semibold text-[#10264B] transition-colors hover:border-[#1246C8] hover:text-[#1246C8] disabled:opacity-50"
                    >
                      {actionLoading === agent._id + "-reactivate" ? <div className="w-3.5 h-3.5 border-2 border-[#DCE8FF] border-t-[#1246C8] rounded-full animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      Reactivate
                    </button>
                  )}
                  <button
                    onClick={() => toggleExpand(agent._id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#53647C] transition-colors hover:bg-[#F5F7FB] hover:text-[#10264B]"
                  >
                    {expandedAgent === agent._id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded students */}
              <AnimatePresence>
                {expandedAgent === agent._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[#DCE2EB] bg-[#F5F7FB]/70 px-6 py-5">
                      <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                        <Shield className="h-3.5 w-3.5 text-[#1246C8]" />
                        Students Enrolled by This Agent
                      </p>
                      {studentsLoading === agent._id ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-[#DCE8FF] border-t-[#1246C8]" />
                        </div>
                      ) : !agentStudents[agent._id]?.length ? (
                        <p className="py-4 text-center text-sm text-[#8C9AB0]">No students enrolled yet</p>
                      ) : (
                        <div className="space-y-2">
                          {agentStudents[agent._id].map((s) => (
                            <div key={s._id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#DCE2EB] bg-white px-4 py-3">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#10264B]">{s.firstName} {s.lastName}</p>
                                <p className="truncate font-mono text-xs text-[#53647C]">{s.studentIdNumber} · {s.email}</p>
                              </div>
                              <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15" : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/15"}`}>
                                {s.paymentStatus}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#07152E]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="w-full max-w-md overflow-hidden rounded-panel border border-[#DCE2EB] bg-white shadow-float"
            >
              <div className="flex items-center justify-between border-b border-[#DCE2EB] px-6 py-5">
                <h2 className="text-lg font-bold tracking-tighter text-[#10264B]">Reject Agent Application</h2>
                <button onClick={() => setRejectModal(null)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#53647C] transition-colors hover:bg-[#F5F7FB] hover:text-[#10264B]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <p className="text-sm leading-relaxed text-[#53647C]">
                  You are rejecting <strong className="font-semibold text-[#10264B]">{rejectModal.firstName} {rejectModal.lastName}</strong>'s agent application. Please provide a reason — this will be emailed to the applicant.
                </p>
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Rejection Reason <span className="text-red-500">*</span></label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    placeholder="e.g. Incomplete information provided, unable to verify agency details..."
                    className="w-full resize-none rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setRejectModal(null)}
                    className="flex-1 rounded-full border border-[#10264B]/15 bg-white py-3 text-sm font-semibold text-[#10264B] transition-colors hover:border-[#1246C8] hover:text-[#1246C8]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectReason.trim() || actionLoading?.includes("-reject")}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading?.includes("-reject") ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Reject Application"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

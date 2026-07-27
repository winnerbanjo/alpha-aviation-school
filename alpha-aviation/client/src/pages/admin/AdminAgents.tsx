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
      pending: { text: "Pending", cls: "text-amber-700 bg-amber-50 border-amber-200", icon: <Clock className="w-3 h-3" /> },
      approved: { text: "Approved", cls: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
      rejected: { text: "Rejected", cls: "text-rose-700 bg-rose-50 border-rose-200", icon: <XCircle className="w-3 h-3" /> },
      suspended: { text: "Suspended", cls: "text-orange-700 bg-orange-50 border-orange-200", icon: <AlertCircle className="w-3 h-3" /> },
    };
    const s = map[status];
    return <span className={`inline-flex items-center gap-1 text-xs font-bold border rounded-full px-2.5 py-0.5 ${s.cls}`}>{s.icon}{s.text}</span>;
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "pending", label: `Pending${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
    { key: "approved", label: "Approved" },
    { key: "all", label: "All" },
    { key: "rejected", label: "Rejected" },
    { key: "suspended", label: "Suspended" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Agent Requests</h1>
        <p className="text-sm text-slate-500 mt-0.5">Review and manage agent applications and active agents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Agents", value: agents.length, color: "indigo" },
          { label: "Pending", value: agents.filter(a => a.agentStatus === "pending").length, color: "amber" },
          { label: "Approved", value: agents.filter(a => a.agentStatus === "approved").length, color: "emerald" },
          { label: "Total Students", value: agents.reduce((sum, a) => sum + a.studentCount, 0), color: "purple" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 overflow-x-auto flex-shrink-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter === t.key ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
      </div>

      {/* Agent list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl text-center py-16">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">{filter === "pending" ? "No pending agent requests" : "No agents found"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((agent) => (
            <motion.div
              key={agent._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-[0px_2px_12px_0px_rgba(0,0,0,0.04)]"
            >
              {/* Agent row */}
              <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Avatar + info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200/30 shrink-0">
                    {(agent.firstName[0] || "") + (agent.lastName[0] || "")}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-900">{agent.firstName} {agent.lastName}</p>
                      {statusBadge(agent.agentStatus)}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {agent.agencyName && (
                        <span className="text-xs text-slate-500 flex items-center gap-1"><Building2 className="w-3 h-3" />{agent.agencyName}</span>
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" />{agent.email}</span>
                      {agent.phone && (
                        <span className="text-xs text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" />{agent.phone}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {agent.agentCode && (
                        <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-1.5 py-0.5">{agent.agentCode}</span>
                      )}
                      <span className="text-[10px] text-slate-400">{agent.studentCount} student{agent.studentCount !== 1 ? "s" : ""}</span>
                      <span className="text-[10px] text-slate-400">Applied {new Date(agent.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
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
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                      >
                        {actionLoading === agent._id + "-approve" ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Approve
                      </button>
                      <button
                        onClick={() => { setRejectModal(agent); setRejectReason(""); }}
                        className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-4 py-2 rounded-xl transition-all"
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
                      className="flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                    >
                      {actionLoading === agent._id + "-suspend" ? <div className="w-3.5 h-3.5 border-2 border-orange-300 border-t-orange-700 rounded-full animate-spin" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      Suspend
                    </button>
                  )}
                  {(agent.agentStatus === "suspended" || agent.agentStatus === "rejected") && (
                    <button
                      onClick={() => handleReactivate(agent)}
                      disabled={actionLoading === agent._id + "-reactivate"}
                      className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                    >
                      {actionLoading === agent._id + "-reactivate" ? <div className="w-3.5 h-3.5 border-2 border-indigo-300 border-t-indigo-700 rounded-full animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      Reactivate
                    </button>
                  )}
                  <button
                    onClick={() => toggleExpand(agent._id)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
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
                    <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        Students Enrolled by This Agent
                      </p>
                      {studentsLoading === agent._id ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : !agentStudents[agent._id]?.length ? (
                        <p className="text-sm text-slate-400 text-center py-4">No students enrolled yet</p>
                      ) : (
                        <div className="space-y-2">
                          {agentStudents[agent._id].map((s) => (
                            <div key={s._id} className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl px-4 py-2.5">
                              <div>
                                <p className="text-sm font-bold text-slate-900">{s.firstName} {s.lastName}</p>
                                <p className="text-xs text-slate-500 font-mono">{s.studentIdNumber} · {s.email}</p>
                              </div>
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${s.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
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
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl"
            >
              <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900">Reject Agent Application</h2>
                <button onClick={() => setRejectModal(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600">
                  You are rejecting <strong>{rejectModal.firstName} {rejectModal.lastName}</strong>'s agent application. Please provide a reason — this will be emailed to the applicant.
                </p>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Rejection Reason <span className="text-rose-400">*</span></label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    placeholder="e.g. Incomplete information provided, unable to verify agency details..."
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none placeholder-slate-400"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setRejectModal(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectReason.trim() || actionLoading?.includes("-reject")}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-2xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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

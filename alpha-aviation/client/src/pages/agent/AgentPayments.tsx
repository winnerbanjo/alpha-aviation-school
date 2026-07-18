import { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, Clock, AlertCircle, FileText, Search } from "lucide-react";
import { getAgentPayments } from "@/api";
import { formatNaira } from "@/data/courseCatalog";

interface AgentPayment {
  _id: string;
  amount: number;
  status: string;
  reference: string;
  receiptUrl?: string;
  createdAt: string;
  student?: {
    firstName: string;
    lastName: string;
    email: string;
    studentIdNumber: string;
  };
}

export function AgentPayments() {
  const [payments, setPayments] = useState<AgentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAgentPayments()
      .then((res) => { if (res?.success) setPayments(res.data.payments); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.reference.toLowerCase().includes(q) ||
      p.student?.firstName?.toLowerCase().includes(q) ||
      p.student?.lastName?.toLowerCase().includes(q) ||
      p.student?.studentIdNumber?.includes(q)
    );
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { icon: React.ReactNode; text: string; cls: string }> = {
      pending_review: { icon: <Clock className="w-3 h-3" />, text: "Under Review", cls: "text-amber-700 bg-amber-50 border-amber-200" },
      approved: { icon: <CheckCircle2 className="w-3 h-3" />, text: "Approved", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
      rejected: { icon: <AlertCircle className="w-3 h-3" />, text: "Rejected", cls: "text-red-700 bg-red-50 border-red-200" },
    };
    const s = map[status] || { icon: <AlertCircle className="w-3 h-3" />, text: status, cls: "text-slate-700 bg-slate-50 border-slate-200" };
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium border rounded-md px-2 py-0.5 ${s.cls}`}>
        {s.icon}{s.text}
      </span>
    );
  };

  const totalPaid = payments.filter(p => p.status === "approved").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === "pending_review").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Payment History</h1>
        <p className="text-sm text-slate-500 mt-0.5">All payments made on behalf of your students</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Submitted", value: payments.length, icon: FileText, isCurrency: false },
          { label: "Total Approved", value: totalPaid, icon: CheckCircle2, isCurrency: true },
          { label: "Under Review", value: totalPending, icon: Clock, isCurrency: true },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-slate-600" />
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.label}</p>
              <p className="text-xl font-semibold text-slate-900 mt-1">
                {card.isCurrency ? formatNaira(card.value as number) : card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by student or reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">{search ? "No payments match your search" : "No payments yet"}</p>
            <p className="text-sm text-slate-400 mt-1">Payments you submit for your students will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Student", "Reference", "Amount", "Status", "Date", "Receipt"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-slate-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3.5">
                      {p.student ? (
                        <>
                          <p className="text-sm font-medium text-slate-900">{p.student.firstName} {p.student.lastName}</p>
                          <p className="text-xs text-slate-500 font-mono">{p.student.studentIdNumber}</p>
                        </>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 rounded px-2 py-0.5 block max-w-[180px] truncate">{p.reference}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-medium text-slate-900">{formatNaira(p.amount)}</span>
                    </td>
                    <td className="px-4 py-3.5">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {p.receiptUrl ? (
                        <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-slate-700 hover:text-slate-900 underline">
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

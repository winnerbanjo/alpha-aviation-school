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
      pending_review: { icon: <Clock className="h-3 w-3" />, text: "Under Review", cls: "bg-amber-50 text-amber-700 ring-amber-600/15" },
      approved: { icon: <CheckCircle2 className="h-3 w-3" />, text: "Approved", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/15" },
      rejected: { icon: <AlertCircle className="h-3 w-3" />, text: "Rejected", cls: "bg-red-50 text-red-700 ring-red-600/15" },
    };
    const s = map[status] || { icon: <AlertCircle className="h-3 w-3" />, text: status, cls: "bg-[#F5F7FB] text-[#53647C] ring-[#DCE2EB]" };
    return (
      <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${s.cls}`}>
        {s.icon}{s.text}
      </span>
    );
  };

  const totalPaid = payments.filter(p => p.status === "approved").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === "pending_review").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <span className="eyebrow text-[#1246C8]">Agent portal</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">Payment history</h1>
        <p className="mt-2 text-[#53647C]">All payments made on behalf of your students</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {[
          { label: "Total Submitted", value: payments.length, icon: FileText, isCurrency: false },
          { label: "Total Approved", value: totalPaid, icon: CheckCircle2, isCurrency: true },
          { label: "Under Review", value: totalPending, icon: Clock, isCurrency: true },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-panel border border-[#DCE2EB] bg-white p-5 shadow-subtle sm:p-6">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">{card.label}</p>
              <p className="mt-2 break-words text-2xl font-bold tracking-tightest text-[#10264B] tabular-nums sm:text-3xl">
                {card.isCurrency ? formatNaira(card.value as number) : card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9AB0]" />
        <input
          type="text"
          placeholder="Search by student or reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-[#DCE2EB] bg-white py-2.5 pl-11 pr-4 text-sm text-[#172B49] shadow-subtle outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
        />
      </div>

      <div className="overflow-hidden rounded-panel border border-[#DCE2EB] bg-white shadow-subtle">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1246C8] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
              <CreditCard className="h-6 w-6" />
            </span>
            <p className="font-semibold text-[#10264B]">{search ? "No payments match your search" : "No payments yet"}</p>
            <p className="mt-1 text-sm text-[#53647C]">Payments you submit for your students will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#DCE2EB] bg-[#F5F7FB]/70">
                  {["Student", "Reference", "Amount", "Status", "Date", "Receipt"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-[#53647C]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id} className="border-b border-[#DCE2EB]/70 transition-colors last:border-b-0 hover:bg-[#F5F7FB]">
                    <td className="px-5 py-4">
                      {p.student ? (
                        <>
                          <p className="text-sm font-semibold text-[#10264B]">{p.student.firstName} {p.student.lastName}</p>
                          <p className="mt-0.5 font-mono text-xs text-[#53647C]">{p.student.studentIdNumber}</p>
                        </>
                      ) : (
                        <span className="text-sm text-[#8C9AB0]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="block max-w-[180px] truncate rounded-md bg-[#F5F7FB] px-2 py-1 font-mono text-xs text-[#2D3E59] ring-1 ring-[#DCE2EB]">{p.reference}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="whitespace-nowrap text-sm font-semibold text-[#10264B] tabular-nums">{formatNaira(p.amount)}</span>
                    </td>
                    <td className="px-5 py-4">{statusBadge(p.status)}</td>
                    <td className="px-5 py-4">
                      <span className="whitespace-nowrap text-xs text-[#53647C] tabular-nums">
                        {new Date(p.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {p.receiptUrl ? (
                        <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full border border-[#10264B]/15 bg-white px-3 py-1 text-xs font-semibold text-[#10264B] transition-colors hover:border-[#1246C8] hover:text-[#1246C8]">
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-[#8C9AB0]">—</span>
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

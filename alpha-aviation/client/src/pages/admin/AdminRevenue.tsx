import { useAdminData, formatNaira } from "@/hooks/useAdminData";
import { CheckCircle2, Clock, DollarSign, WalletCards } from "lucide-react";
import {
  AdminPageHeader,
  AdminPageShell,
  AdminPanel,
} from "@/components/admin/AdminDashboardUI";

export function AdminRevenue() {
  const {
    displayTotalRevenue, displayPendingRevenue, safeStudents,
    fetchStudents, fetchFinancialStats,
  } = useAdminData();

  const paidStudents = safeStudents.filter((s) => s.paymentStatus === "Paid").length;
  const pendingStudents = safeStudents.filter((s) => s.paymentStatus === "Pending").length;
  const underReviewStudents = safeStudents.filter((s) => s.paymentStatus === "Under Review").length;

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Revenue Analytics"
        description="Track verified tuition revenue, pending balances, and payment status distribution."
        onRefresh={() => { fetchStudents(); fetchFinancialStats(); }}
      />

      <section className="relative overflow-hidden rounded-stage bg-[#07152E] text-white shadow-elevated">
        <div aria-hidden className="absolute inset-0 bg-chart-grid mask-fade-b opacity-70" />
        <div aria-hidden className="absolute -right-32 -top-32 h-[380px] w-[380px] rounded-full bg-[#1246C8]/40 blur-[110px]" />
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.5fr_1fr] lg:items-end lg:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                <DollarSign className="h-[18px] w-[18px]" />
              </span>
              <span className="eyebrow text-[#8EAEFF]">Total Revenue</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-400/20">Verified</span>
            </div>
            <p className="mt-6 break-words text-4xl font-bold tracking-tightest tabular-nums sm:text-5xl lg:text-6xl">
              <span className="text-gradient-sky">{formatNaira(displayTotalRevenue)}</span>
            </p>
            <p className="mt-3 text-sm text-white/60">{`From ${paidStudents} paid students`}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EAEFF]">Pending Revenue</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/10 text-amber-300">
                <WalletCards className="h-[18px] w-[18px]" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tightest tabular-nums text-white">{formatNaira(displayPendingRevenue)}</p>
            <p className="mt-2 text-sm text-white/60">{`From ${pendingStudents} pending payments`}</p>
          </div>
        </div>
      </section>

      <AdminPanel>
        <div className="border-b border-[#DCE2EB] px-6 py-5">
          <h2 className="text-lg font-bold tracking-tighter text-[#10264B]">Payment Status Breakdown</h2>
          <p className="mt-0.5 text-sm text-[#53647C]">A quick view of tuition clearance across the student body.</p>
        </div>
        <div className="grid grid-cols-1 gap-px bg-[#DCE2EB] sm:grid-cols-3">
          {[
            { label: "Paid Students", value: paidStudents, icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600" },
            { label: "Pending Payments", value: pendingStudents, icon: Clock, className: "bg-amber-50 text-amber-600" },
            { label: "Under Review", value: underReviewStudents, icon: WalletCards, className: "bg-[#DCE8FF] text-[#1246C8]" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">{item.label}</p>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full ${item.className}`}>
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tightest tabular-nums text-[#10264B]">{item.value}</p>
              </div>
            );
          })}
        </div>
      </AdminPanel>
    </AdminPageShell>
  );
}

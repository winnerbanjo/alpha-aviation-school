import { useAdminData, formatNaira } from "@/hooks/useAdminData";
import { CheckCircle2, Clock, DollarSign, WalletCards } from "lucide-react";
import {
  AdminMetricCard,
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AdminMetricCard label="Total Revenue" value={formatNaira(displayTotalRevenue)} helper={`From ${paidStudents} paid students`} icon={DollarSign} accent="emerald" badge="Verified" />
        <AdminMetricCard label="Pending Revenue" value={formatNaira(displayPendingRevenue)} helper={`From ${pendingStudents} pending payments`} icon={WalletCards} accent="amber" />
      </div>

      <AdminPanel>
        <div className="px-5 py-4 border-b border-slate-100/80 bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900">Payment Status Breakdown</h2>
          <p className="text-xs text-slate-500 mt-0.5">A quick view of tuition clearance across the student body.</p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Paid Students", value: paidStudents, icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
            { label: "Pending Payments", value: pendingStudents, icon: Clock, className: "bg-amber-50 text-amber-700 border-amber-100" },
            { label: "Under Review", value: underReviewStudents, icon: WalletCards, className: "bg-indigo-50 text-indigo-700 border-indigo-100" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`p-4 rounded-2xl border ${item.className}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">{item.label}</p>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-3xl font-black mt-3">{item.value}</p>
              </div>
            );
          })}
        </div>
      </AdminPanel>
    </AdminPageShell>
  );
}

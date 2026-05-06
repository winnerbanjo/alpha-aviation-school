import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminData, formatNaira } from "@/hooks/useAdminData";
import { DollarSign, RefreshCw } from "lucide-react";

export function AdminRevenue() {
  const {
    displayTotalRevenue, displayPendingRevenue, safeStudents,
    fetchStudents, fetchFinancialStats,
  } = useAdminData();

  const paidStudents = safeStudents.filter((s) => s.paymentStatus === "Paid").length;
  const pendingStudents = safeStudents.filter((s) => s.paymentStatus === "Pending").length;
  const underReviewStudents = safeStudents.filter((s) => s.paymentStatus === "Under Review").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-8 p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Revenue Analytics</h1>
          <p className="text-slate-500">Track revenue and payment analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { fetchStudents(); fetchFinancialStats(); }} className="px-3 py-1.5 text-sm border border-slate-200 rounded-full hover:bg-slate-50 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold tracking-tight text-slate-900">{formatNaira(displayTotalRevenue)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500">From {paidStudents} paid students</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Pending Revenue</p>
                <p className="text-3xl font-bold tracking-tight text-slate-900">{formatNaira(displayPendingRevenue)}</p>
              </div>
              <div className="p-3 bg-[#007bff] rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-slate-500">From {pendingStudents} pending payments</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50 md:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-4">Payment Status Breakdown</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Paid Students</p>
                <p className="text-2xl font-bold text-green-600">{paidStudents}</p>
              </div>
              <div className="p-4 bg-[#007bff] rounded-lg">
                <p className="text-sm text-white mb-1">Pending Payments</p>
                <p className="text-2xl font-bold text-white">{pendingStudents}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Under Review</p>
                <p className="text-2xl font-bold text-blue-600">{underReviewStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

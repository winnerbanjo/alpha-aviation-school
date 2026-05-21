import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useAdminData, formatNaira } from "@/hooks/useAdminData";
import {
  Eye, CheckCircle2, XCircle, FileText, Loader2,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminPageShell,
  AdminPanel,
} from "@/components/admin/AdminDashboardUI";

export function AdminPayments() {
  const {
    pendingPayments, loadingPayments, selectedPayment, setSelectedPayment,
    rejectModalOpen, setRejectModalOpen, rejectReason, setRejectReason,
    processingPayment, fetchPendingPayments, handleApprovePayment,
    handleRejectPayment,
  } = useAdminData();

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Payment Verification"
        description="Review submitted receipts and approve or reject tuition payments."
        onRefresh={fetchPendingPayments}
        refreshing={loadingPayments}
      />

      <AdminPanel>
        <div className="px-5 py-4 border-b border-slate-100/80 bg-slate-50/50 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pending Receipts</h2>
            <p className="text-xs text-slate-500 mt-0.5">Receipts awaiting admin review and clearance.</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
            {pendingPayments.length} pending
          </span>
        </div>
        <div className="p-5">
          {loadingPayments ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : pendingPayments.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-lg font-bold text-slate-900 mb-2">All caught up</p>
              <p className="text-sm text-slate-500">No pending payment receipts to review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((payment) => {
                const student = payment.student || {};
                return (
                  <div key={payment._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/70 rounded-2xl border border-slate-200/70 gap-4 hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center gap-4">
                      {payment.receiptUrl ? (
                        <button onClick={() => setSelectedPayment(payment)} className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 hover:border-indigo-300 transition-colors shrink-0 bg-white">
                          {payment.receiptUrl.endsWith(".pdf") ? (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-slate-400" />
                            </div>
                          ) : (
                            <img src={payment.receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
                          )}
                        </button>
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">
                          {student.firstName || ""} {student.lastName || ""}
                        </p>
                        <p className="text-xs text-slate-500">{student.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-xs">
                            {formatNaira(payment.amount || student.amountDue || 0)}
                          </Badge>
                          {student.studentIdNumber && (
                            <span className="text-xs text-slate-400">{student.studentIdNumber}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedPayment(payment)} className="rounded-xl text-slate-600">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setSelectedPayment(payment); setRejectModalOpen(true); }} className="rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50">
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => handleApprovePayment(payment._id)} disabled={processingPayment} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AdminPanel>

      {/* Payment Detail Modal */}
      <Modal isOpen={!!selectedPayment && !rejectModalOpen} onClose={() => setSelectedPayment(null)} title="Payment Receipt Details">
        {selectedPayment && (() => {
          const student = selectedPayment.student || {};
          return (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                <p className="text-sm text-slate-500">Student</p>
                <p className="text-base font-semibold text-slate-900">{student.firstName || ""} {student.lastName || ""}</p>
                <p className="text-sm text-slate-500">{student.email}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                <p className="text-sm text-slate-500">Amount</p>
                <p className="text-2xl font-bold text-slate-900">{formatNaira(selectedPayment.amount || student.amountDue || 0)}</p>
              </div>
              {selectedPayment.receiptUrl && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Receipt</p>
                  {selectedPayment.receiptUrl.endsWith(".pdf") ? (
                    <div className="p-8 bg-slate-100 rounded-lg text-center">
                      <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">PDF Receipt</p>
                      <a href={selectedPayment.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 inline-block">Open in new tab</a>
                    </div>
                  ) : (
                    <div className="rounded-lg overflow-hidden border border-slate-200">
                      <img src={selectedPayment.receiptUrl} alt="Payment Receipt" className="w-full max-h-80 object-contain bg-slate-50" />
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => setRejectModalOpen(true)}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApprovePayment(selectedPayment._id)} disabled={processingPayment}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve Payment
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Rejection Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => { setRejectModalOpen(false); setRejectReason(""); }} title="Reject Payment">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Provide a reason for rejecting this payment. The student will see this message and be asked to upload a new receipt.</p>
          <textarea className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={4} placeholder="e.g., The receipt is unclear, amount does not match, etc." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { setRejectModalOpen(false); setRejectReason(""); }} disabled={processingPayment}>Cancel</Button>
            <Button className="flex-1 bg-rose-600 hover:bg-rose-700 text-white" onClick={handleRejectPayment} disabled={!rejectReason.trim() || processingPayment}>
              {processingPayment ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </AdminPageShell>
  );
}

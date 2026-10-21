import { useEffect, useEffectEvent } from "react";
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

  // Load once on mount; the effect event calls the latest fetchPendingPayments
  const loadPendingPayments = useEffectEvent(() => {
    fetchPendingPayments();
  });
  useEffect(() => {
    loadPendingPayments();
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
        <div className="flex items-center justify-between gap-4 border-b border-[#DCE2EB] px-6 py-5">
          <div>
            <h2 className="text-lg font-bold tracking-tighter text-[#10264B]">Pending Receipts</h2>
            <p className="mt-0.5 text-sm text-[#53647C]">Receipts awaiting admin review and clearance.</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-amber-700 ring-1 ring-amber-600/15">
            {pendingPayments.length} pending
          </span>
        </div>
        <div className="p-4 sm:p-6">
          {loadingPayments ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#1246C8]" />
            </div>
          ) : pendingPayments.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/15">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <p className="mb-1.5 text-lg font-bold tracking-tighter text-[#10264B]">All caught up</p>
              <p className="text-sm text-[#53647C]">No pending payment receipts to review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPayments.map((payment) => {
                const student = payment.student || {};
                return (
                  <div key={payment._id} className="flex flex-col justify-between gap-4 rounded-2xl border border-[#DCE2EB] bg-white p-4 transition-all hover:border-[#BFD2FF] hover:shadow-card sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      {payment.receiptUrl ? (
                        <button onClick={() => setSelectedPayment(payment)} className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#DCE2EB] bg-[#F5F7FB] transition-colors hover:border-[#1246C8]">
                          {payment.receiptUrl.endsWith(".pdf") ? (
                            <div className="flex h-full w-full items-center justify-center bg-[#DCE8FF] text-[#1246C8]">
                              <FileText className="w-6 h-6" />
                            </div>
                          ) : (
                            <img src={payment.receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
                          )}
                        </button>
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-[#DCE2EB] bg-[#F5F7FB]">
                          <FileText className="w-6 h-6 text-[#8C9AB0]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold tracking-tight text-[#10264B]">
                          {student.firstName || ""} {student.lastName || ""}
                        </p>
                        <p className="truncate text-xs text-[#53647C]">{student.email}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge className="border-transparent bg-[#DCE8FF] text-[#1246C8] tabular-nums hover:bg-[#DCE8FF]">
                            {formatNaira(payment.amount || student.amountDue || 0)}
                          </Badge>
                          {student.studentIdNumber && (
                            <span className="font-mono text-[11px] text-[#8C9AB0]">{student.studentIdNumber}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedPayment(payment)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setSelectedPayment(payment); setRejectModalOpen(true); }} className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700">
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => handleApprovePayment(payment._id)} disabled={processingPayment} className="bg-emerald-600 text-white !shadow-none hover:bg-emerald-700">
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
              <div className="space-y-1 rounded-2xl border border-[#DCE2EB] bg-[#F5F7FB] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Student</p>
                <p className="pt-1 text-base font-semibold tracking-tight text-[#10264B]">{student.firstName || ""} {student.lastName || ""}</p>
                <p className="text-sm text-[#53647C]">{student.email}</p>
              </div>
              <div className="space-y-1 rounded-2xl border border-[#DCE2EB] bg-[#F5F7FB] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Amount</p>
                <p className="pt-1 text-2xl font-bold tracking-tightest tabular-nums text-[#10264B]">{formatNaira(selectedPayment.amount || student.amountDue || 0)}</p>
              </div>
              {selectedPayment.receiptUrl && (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">Receipt</p>
                  {selectedPayment.receiptUrl.endsWith(".pdf") ? (
                    <div className="rounded-2xl border border-[#DCE2EB] bg-[#F5F7FB] p-8 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-[#172B49]">PDF Receipt</p>
                      <a href={selectedPayment.receiptUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm font-semibold text-[#1246C8] hover:underline">Open in new tab</a>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-[#DCE2EB]">
                      <img src={selectedPayment.receiptUrl} alt="Payment Receipt" className="w-full max-h-80 object-contain bg-[#F5F7FB]" />
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-3 border-t border-[#DCE2EB] pt-5">
                <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700" onClick={() => setRejectModalOpen(true)}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button className="flex-1 bg-emerald-600 text-white !shadow-none hover:bg-emerald-700" onClick={() => handleApprovePayment(selectedPayment._id)} disabled={processingPayment}>
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
          <p className="text-sm leading-relaxed text-[#53647C]">Provide a reason for rejecting this payment. The student will see this message and be asked to upload a new receipt.</p>
          <textarea className="w-full resize-none rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10" rows={4} placeholder="e.g., The receipt is unclear, amount does not match, etc." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { setRejectModalOpen(false); setRejectReason(""); }} disabled={processingPayment}>Cancel</Button>
            <Button className="flex-1 bg-red-600 text-white !shadow-none hover:bg-red-700" onClick={handleRejectPayment} disabled={!rejectReason.trim() || processingPayment}>
              {processingPayment ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </AdminPageShell>
  );
}

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useAdminData, formatNaira } from "@/hooks/useAdminData";
import {
  RefreshCw, Eye, CheckCircle2, XCircle, FileText, Loader2, Clock,
} from "lucide-react";

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-8 p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Payment Verification</h1>
          <p className="text-slate-500">Review and verify student payment receipts</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPendingPayments} disabled={loadingPayments} className="rounded-full">
          <RefreshCw className={`w-4 h-4 mr-2 ${loadingPayments ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardContent className="pt-6">
          {loadingPayments ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : pendingPayments.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-900 mb-2">All caught up!</p>
              <p className="text-sm text-slate-500">No pending payment receipts to review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((payment) => {
                const student = payment.student || {};
                return (
                  <div key={payment._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 gap-4">
                    <div className="flex items-center gap-4">
                      {payment.receiptUrl ? (
                        <button onClick={() => setSelectedPayment(payment)} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-slate-200 hover:border-blue-400 transition-colors shrink-0">
                          {payment.receiptUrl.endsWith(".pdf") ? (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-slate-400" />
                            </div>
                          ) : (
                            <img src={payment.receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
                          )}
                        </button>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {student.firstName || ""} {student.lastName || ""}
                        </p>
                        <p className="text-xs text-slate-500">{student.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                            {formatNaira(payment.amount || student.amountDue || 0)}
                          </Badge>
                          {student.studentIdNumber && (
                            <span className="text-xs text-slate-400">{student.studentIdNumber}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedPayment(payment)} className="text-slate-600">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setSelectedPayment(payment); setRejectModalOpen(true); }} className="text-rose-600 border-rose-200 hover:bg-rose-50">
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => handleApprovePayment(payment._id)} disabled={processingPayment} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

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
    </motion.div>
  );
}

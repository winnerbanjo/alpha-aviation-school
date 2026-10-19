import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Landmark,
  AlertCircle,
  Copy,
  CheckCircle2,
  Upload,
  ChevronRight,
  X,
  FileText,
} from "lucide-react";
import { uploadPaymentReceipt, verifyPaystackPayment } from "@/api";
import { usePaystackPayment } from "react-paystack";
import { useSearchParams } from "react-router-dom";

interface PaymentStepsProps {
  user: any;
  tutionPaid: "Pending" | "Paid" | "Under Review" | boolean;
  refreshUser: () => Promise<void>;
}

export function PaymentSteps({
  user,
  tutionPaid,
  refreshUser,
}: PaymentStepsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const stepInUrl = searchParams.get("step") as
    | "prompt"
    | "selection"
    | "manual"
    | null;
  const paymentStep = stepInUrl || "prompt";

  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Start hidden to check cooldown
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [method, setMethod] = useState<"paystack" | "manual" | null>(null);
  const paymentStatus =
    typeof tutionPaid === "string"
      ? tutionPaid
      : user?.paymentStatus || (tutionPaid ? "Paid" : "Pending");
  const shouldShowPaymentModal = paymentStatus === "Pending";

  const setPaymentStep = (step: "prompt" | "selection" | "manual") => {
    setSearchParams({ step });
    setIsVisible(true);
    if (step !== "manual") setSelectedFile(null);
  };

  const closeModal = () => {
    setIsVisible(false);
    setSearchParams({});
    setSelectedFile(null);
    // Store current timestamp as last closed time
    localStorage.setItem("payment_modal_last_closed", Date.now().toString());
  };

  useEffect(() => {
    if (!shouldShowPaymentModal) {
      setIsVisible(false);
      if (stepInUrl) setSearchParams({});
      return;
    }

    if (stepInUrl) {
      setIsVisible(true);
      return;
    }

    const lastClosed = localStorage.getItem("payment_modal_last_closed");
    const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

    if (!lastClosed || Date.now() - parseInt(lastClosed) > COOLDOWN_MS) {
      setIsVisible(true);
    }
  }, [shouldShowPaymentModal, stepInUrl, setSearchParams]);

  const bankDetails = {
    accountName: "Alpha step links aviation school ltd",
    accountNumber: "1000485345",
    bank: "Globus bank",
    reference: user?.email || "STUDENT-REF",
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaystackSuccess = async (reference: string) => {
    try {
      setMethod("paystack");
      setUploading(true);
      await verifyPaystackPayment(reference);
      setUploaded(true);
      setTimeout(() => {
        refreshUser();
        closeModal();
      }, 2000);
    } catch (error) {
      console.error("Verification failed", error);
      alert("Payment verification failed. Please contact support.");
    } finally {
      setUploading(false);
    }
  };

  const onSuccess = (reference: any) => {
    handlePaystackSuccess(reference.reference);
  };

  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: user?.email || "",
    amount: (user?.amountDue || 0) * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const confirmAndUpload = async () => {
    if (!selectedFile) return;

    try {
      setMethod("manual");
      setUploading(true);
      await uploadPaymentReceipt(selectedFile);
      setUploaded(true);
      setTimeout(() => {
        refreshUser();
        closeModal();
      }, 2000);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload receipt. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  console.log(tutionPaid);

  return (
    <AnimatePresence>
      {shouldShowPaymentModal && isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-[#07152E]/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-[500px] bg-white rounded-panel border border-[#DCE2EB] overflow-hidden shadow-float relative"
          >
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 z-20 flex h-9 w-9 items-center justify-center rounded-full text-[#53647C] transition-colors hover:bg-[#F5F7FB] hover:text-[#10264B]"
            >
              <X className="w-5 h-5" />
            </button>

            {paymentStep !== "prompt" && (
              <button
                onClick={() =>
                  setPaymentStep(
                    paymentStep === "manual" ? "selection" : "prompt",
                  )
                }
                className="absolute top-5 left-5 z-20 flex h-9 w-9 items-center justify-center rounded-full text-[#53647C] transition-colors hover:bg-[#F5F7FB] hover:text-[#10264B]"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            )}

            {/* Numbered waypoints for the payment flow */}
            <div aria-hidden className="absolute left-1/2 top-6 z-10 flex -translate-x-1/2 items-center gap-1.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold tabular-nums ${paymentStep === "prompt" ? "bg-[#1246C8] text-white shadow-glow" : "bg-[#10264B] text-white"}`}
              >
                01
              </span>
              <span
                className={`w-6 border-t-2 ${paymentStep !== "prompt" ? "border-solid border-[#1246C8]" : "border-dashed border-[#DCE2EB]"}`}
              />
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold tabular-nums ${paymentStep === "selection" ? "bg-[#1246C8] text-white shadow-glow" : paymentStep === "manual" ? "bg-[#10264B] text-white" : "bg-[#F5F7FB] text-[#53647C] ring-1 ring-[#DCE2EB]"}`}
              >
                02
              </span>
              <span
                className={`w-6 border-t-2 ${paymentStep === "manual" ? "border-solid border-[#1246C8]" : "border-dashed border-[#DCE2EB]"}`}
              />
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold tabular-nums ${paymentStep === "manual" ? "bg-[#1246C8] text-white shadow-glow" : "bg-[#F5F7FB] text-[#53647C] ring-1 ring-[#DCE2EB]"}`}
              >
                03
              </span>
            </div>

            <div className="px-6 pb-8 pt-20 sm:px-8 flex flex-col items-center text-center">
              {uploaded && tutionPaid == "Under Review" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 w-full py-8"
                >
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-600/15">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tighter text-[#10264B]">
                      {method === "paystack"
                        ? "Payment Successful!"
                        : "Receipt Uploaded Successfully!"}
                    </h2>
                    <p className="text-[#53647C]">
                      {method === "paystack"
                        ? "Thank you for your payment. Your enrollment status has been updated."
                        : "Your receipt has been submitted for review. You'll be notified once it has been verified."}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 ring-1 ring-emerald-600/15">
                    {method === "paystack"
                      ? "Redirecting you to the dashboard..."
                      : "Closing in a few seconds..."}
                  </div>
                </motion.div>
              ) : uploading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6 w-full py-12 flex flex-col items-center"
                >
                  <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-[#DCE2EB] border-t-[#1246C8]" />
                  <h2 className="text-2xl font-bold tracking-tighter text-[#10264B]">
                    Processing...
                  </h2>
                  <p className="text-[#53647C]">
                    Please hold on while we process your request. This will only
                    take a moment.
                  </p>
                </motion.div>
              ) : (
                <>
                  {paymentStep === "prompt" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6 w-full"
                    >
                      <div className="relative">
                        <div className="relative z-10 mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#DCE8FF]">
                          <CreditCard className="w-11 h-11 text-[#1246C8]" />
                        </div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#DCE8FF] rounded-full animate-ping opacity-30" />
                      </div>

                      <div className="space-y-2">
                        <span className="eyebrow justify-center text-[#1246C8]">Tuition</span>
                        <h2 className="text-2xl font-bold tracking-tighter text-[#10264B]">
                          Pay your tuition fee now
                        </h2>
                        <p className="leading-relaxed text-[#53647C]">
                          To continue accessing your courses and learning
                          materials, please complete your tuition fee payment.
                        </p>
                      </div>

                      <button
                        onClick={() => setPaymentStep("selection")}
                        className="w-full rounded-full bg-[#1246C8] py-4 font-semibold text-white shadow-glow transition-all hover:bg-[#0F3BAA] hover:shadow-glow-lg active:scale-[0.98]"
                      >
                        Pay Now
                      </button>
                    </motion.div>
                  )}

                  {paymentStep === "selection" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6 w-full"
                    >
                      <div className="text-left mb-6">
                        <h2 className="text-xl font-bold tracking-tighter text-[#10264B]">
                          Select Payment Method
                        </h2>
                        <p className="mt-1 text-sm text-[#53647C]">
                          Choose how you'd like to pay your tuition
                        </p>
                      </div>

                      <div className="grid gap-3">
                        <button
                          onClick={() => setPaymentStep("manual")}
                          className="group flex items-center gap-4 rounded-2xl border border-[#DCE2EB] bg-white p-4 text-left transition-all hover:border-[#1246C8] hover:shadow-elevated"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F5F7FB] transition-colors group-hover:bg-[#DCE8FF]">
                            <Landmark className="w-5 h-5 text-[#53647C] group-hover:text-[#1246C8]" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#10264B]">
                              Bank Transfer
                            </p>
                            <p className="text-xs text-[#53647C]">
                              Upload your receipt after transfer
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-[#8C9AB0] ml-auto transition-transform group-hover:translate-x-0.5 group-hover:text-[#1246C8]" />
                        </button>

                        <button
                          onClick={() => {
                            initializePayment({ onSuccess });
                          }}
                          disabled={uploading}
                          className="group flex items-center gap-4 rounded-2xl border border-[#DCE2EB] bg-white p-4 text-left transition-all hover:border-[#1246C8] hover:shadow-elevated disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F5F7FB] transition-colors group-hover:bg-[#DCE8FF]">
                            <CreditCard className="w-5 h-5 text-[#53647C] group-hover:text-[#1246C8]" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#10264B]">
                              Pay with Paystack
                            </p>
                            <p className="text-xs text-[#53647C]">
                              {uploading
                                ? "Verifying..."
                                : "Fast and secure online payment"}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-[#8C9AB0] ml-auto transition-transform group-hover:translate-x-0.5 group-hover:text-[#1246C8]" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {paymentStep === "manual" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6 w-full text-left"
                    >
                      <div>
                        <h2 className="text-xl font-bold tracking-tighter text-[#10264B]">
                          Bank Details
                        </h2>
                        <p className="mt-1 text-sm text-[#53647C]">
                          Transfer the tuition fee to the account below
                        </p>
                      </div>

                      <AnimatePresence mode="wait">
                        {!selectedFile ? (
                          <motion.div
                            key="bank-details"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4 rounded-2xl border border-[#DCE2EB] bg-[#F5F7FB] p-5"
                          >
                            {[
                              { label: "Bank Name", value: bankDetails.bank },
                              {
                                label: "Account Number",
                                value: bankDetails.accountNumber,
                              },
                              {
                                label: "Account Name",
                                value: bankDetails.accountName,
                              },
                              {
                                label: "Payment Reference",
                                value: bankDetails.reference,
                              },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className="flex justify-between items-center gap-3 group"
                              >
                                <div className="min-w-0">
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                                    {item.label}
                                  </p>
                                  <p className="mt-0.5 truncate text-sm font-semibold text-[#10264B]">
                                    {item.value}
                                  </p>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(item.value)}
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white"
                                >
                                  {copied ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-[#53647C]" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="preview"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="relative group overflow-hidden rounded-2xl border border-[#DCE2EB] aspect-video bg-[#F5F7FB]"
                          >
                            {selectedFile.startsWith("data:application/pdf") ? (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-subtle ring-1 ring-[#DCE2EB]">
                                  <FileText className="w-7 h-7 text-[#1246C8]" />
                                </div>
                                <span className="text-sm font-medium text-[#53647C]">
                                  PDF Document Selected
                                </span>
                              </div>
                            ) : (
                              <img
                                src={selectedFile}
                                alt="Receipt Preview"
                                className="w-full h-full object-cover"
                              />
                            )}
                            <button
                              onClick={() => setSelectedFile(null)}
                              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#53647C] shadow-subtle backdrop-blur transition-all hover:text-red-600"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-4">
                        {!selectedFile ? (
                          <>
                            <p className="text-center text-xs text-[#53647C]">
                              After payment, upload your receipt for
                              verification
                            </p>
                            <label className="block">
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={handleFileSelect}
                                disabled={uploading}
                              />
                              <div className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#10264B] py-4 font-semibold text-white transition-colors hover:bg-[#07152E]">
                                <Upload className="w-5 h-5" />
                                {uploading ? "Uploading..." : "Upload Receipt"}
                              </div>
                            </label>
                          </>
                        ) : (
                          <button
                            onClick={confirmAndUpload}
                            disabled={uploading}
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1246C8] py-4 font-semibold text-white shadow-glow transition-all hover:bg-[#0F3BAA] hover:shadow-glow-lg disabled:opacity-50"
                          >
                            {uploading ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-5 h-5" />
                                Confirm & Upload Receipt
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

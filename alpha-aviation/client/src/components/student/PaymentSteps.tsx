import React, { useState } from "react";
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
} from "lucide-react";
import { uploadPaymentReceipt, verifyPaystackPayment } from "@/api";
import { usePaystackPayment } from "react-paystack";

interface PaymentStepsProps {
  user: any;
  tutionPaid: boolean;
  refreshUser: () => Promise<void>;
}

export function PaymentSteps({
  user,
  tutionPaid,
  refreshUser,
}: PaymentStepsProps) {
  const [paymentStep, setPaymentStep] = useState<
    "prompt" | "selection" | "manual"
  >("prompt");
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

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
      setUploading(true);
      await verifyPaystackPayment(reference);
      setUploaded(true);
      setTimeout(() => {
        refreshUser();
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await uploadPaymentReceipt(base64String);
        setUploaded(true);
        setTimeout(() => {
          refreshUser();
        }, 2000);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {!tutionPaid && isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-[500px] bg-white rounded-3xl overflow-hidden shadow-2xl relative"
          >
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors z-20"
            >
              <X className="w-6 h-6" />
            </button>

            {paymentStep !== "prompt" && (
              <button
                onClick={() =>
                  setPaymentStep(
                    paymentStep === "manual" ? "selection" : "prompt",
                  )
                }
                className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors z-20"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
            )}

            <div className="p-8 pt-20 flex flex-col items-center text-center">
              {paymentStep === "prompt" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 w-full"
                >
                  <div className="relative">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto relative z-10">
                      <CreditCard className="w-12 h-12 text-[#0061FF]" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-blue-100 rounded-full animate-ping opacity-20" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">
                      Pay your tuition fee now
                    </h2>
                    <p className="text-slate-500 leading-relaxed">
                      To continue accessing your courses and learning materials,
                      please complete your tuition fee payment.
                    </p>
                  </div>

                  <button
                    onClick={() => setPaymentStep("selection")}
                    className="w-full py-4 bg-[#0061FF] text-white rounded-2xl font-semibold shadow-lg shadow-blue-200 hover:bg-[#0052E6] transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                    <h2 className="text-xl font-bold text-slate-900">
                      Select Payment Method
                    </h2>
                    <p className="text-sm text-slate-500">
                      Choose how you'd like to pay your tuition
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <button
                      onClick={() => setPaymentStep("manual")}
                      className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-[#0061FF] hover:bg-blue-50/50 transition-all text-left group"
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Landmark className="w-6 h-6 text-slate-600 group-hover:text-[#0061FF]" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          Bank Transfer / Manual
                        </p>
                        <p className="text-xs text-slate-500">
                          Upload your receipt after transfer
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 ml-auto" />
                    </button>

                    <button
                      onClick={() => {
                        // @ts-ignore - types can be tricky with libraries
                        initializePayment(onSuccess);
                      }}
                      className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-[#0061FF] hover:bg-blue-50/50 transition-all text-left group"
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <CreditCard className="w-6 h-6 text-slate-600 group-hover:text-[#0061FF]" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          Pay with Paystack
                        </p>
                        <p className="text-xs text-slate-500">
                          Fast and secure online payment
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 ml-auto" />
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
                    <h2 className="text-xl font-bold text-slate-900">
                      Bank Details
                    </h2>
                    <p className="text-sm text-slate-500">
                      Transfer the tuition fee to the account below
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100">
                    {[
                      { label: "Bank Name", value: bankDetails.bank },
                      {
                        label: "Account Number",
                        value: bankDetails.accountNumber,
                      },
                      { label: "Account Name", value: bankDetails.accountName },
                      {
                        label: "Payment Reference",
                        value: bankDetails.reference,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between items-center group"
                      >
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                            {item.label}
                          </p>
                          <p className="text-sm font-semibold text-slate-800">
                            {item.value}
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(item.value)}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                          {copied ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  {!uploaded ? (
                    <div className="space-y-3">
                      <p className="text-xs text-orange-600 text-center">
                        After payment, upload your receipt for verification
                      </p>
                      <label className="block">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                        <div className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-800 transition-colors">
                          <Upload className="w-5 h-5" />
                          {uploading ? "Uploading..." : "Upload Receipt"}
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-green-900">
                          Receipt Uploaded
                        </p>
                        <p className="text-xs text-green-700">
                          We will verify your payment shortly
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

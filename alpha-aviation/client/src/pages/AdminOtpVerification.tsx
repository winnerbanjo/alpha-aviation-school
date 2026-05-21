import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { verifyAdminOTP, resendAdminOTP, login as apiLogin } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/toast";
import { Shield, RefreshCw, CheckCircle, Mail } from "lucide-react";
import { NoIndexSEO } from "@/components/seo/NoIndexSEO";

export function AdminOtpVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { toast } = useToast();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [email, setEmail] = useState("");
  const [tempToken, setTempToken] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tempTokenParam = searchParams.get("tempToken");
    if (emailParam) setEmail(emailParam);
    if (tempTokenParam) setTempToken(tempTokenParam);
  }, [searchParams]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6 && /^\d$/.test(char)) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);
    if (pastedData.length > 0 && pastedData.length < 6) {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast("Please enter the complete 6-digit code", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyAdminOTP({ email, otp: otpString, tempToken });
      if (response.success && response.data?.token) {
        login(
          {
            id: response.data.user.id || response.data.user._id,
            email: response.data.user.email,
            role: response.data.user.role,
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            phone: response.data.user.phone,
            adminLevel: response.data.user.adminLevel,
            permissions: response.data.user.permissions,
          },
          response.data.token
        );
        toast("Welcome back, Admin!", "success");
        navigate("/admin/dashboard/overview", { replace: true });
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Invalid verification code. Please try again.";
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendAdminOTP({ email, tempToken });
      setTimeLeft(300);
      setOtp(["", "", "", "", "", ""]);
      toast("New verification code sent!", "success");
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to resend code.";
      toast(message, "error");
    } finally {
      setResending(false);
    }
  };

  const isExpired = timeLeft <= 0;

  return (
    <>
      <NoIndexSEO
        title="Admin OTP Verification"
        description="Verify the one-time code sent to the admin email address."
        url="/admin/verify-otp"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/50 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-slate-900 rounded-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">
              Verify Your Identity
            </h1>
            <p className="text-slate-500 text-sm">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-slate-700">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3 flex items-center gap-2 justify-center">
                <Mail className="w-4 h-4" />
                Verification Code
              </label>
              <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 text-slate-900 transition-all bg-white"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            <div className="text-center">
              {!isExpired ? (
                <p className="text-sm text-slate-500">
                  Code expires in{" "}
                  <span className="font-semibold text-slate-700">
                    {formatTime(timeLeft)}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-red-500">
                  Code expired. Please request a new one.
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || isExpired}
              className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 text-white py-3 font-medium"
            >
              {loading ? (
                "Verifying..."
              ) : (
                <>
                  Verify & Sign In
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <div>
              <p className="text-sm text-slate-500 mb-2">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-2 text-slate-900 font-medium hover:underline underline-offset-4 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
                {resending ? "Sending..." : "Resend Code"}
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={() => navigate("/admin", { replace: true })}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                ← Back to Admin Login
              </button>
            </div>
          </div>
        </div>
        </motion.div>
      </div>
    </>
  );
}

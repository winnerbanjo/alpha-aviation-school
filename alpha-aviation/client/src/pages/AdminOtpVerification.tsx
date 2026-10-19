import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { verifyAdminOTP, resendAdminOTP, login as apiLogin } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/toast";
import { RefreshCw, CheckCircle, Mail } from "lucide-react";
import { NoIndexSEO } from "@/components/seo/NoIndexSEO";
import { AuthShell } from "@/components/auth/AuthShell";

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
      <AuthShell
        eyebrow="Administrator access"
        title="Confirm it's"
        accent="really you."
        description="Enter the verification code sent to your admin email to sign in."
        video="airport-operations-model"
      >
        <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div>
          <div className="mb-10">
            <span className="eyebrow text-[#1246C8]">Two-step verification</span>
            <h1 className="mt-4 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
              Verify your identity
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[#53647C]">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-[#10264B]">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                <Mail className="h-3.5 w-3.5" />
                Verification Code
              </label>
              <div className="flex gap-2 sm:gap-3" onPaste={handlePaste}>
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
                    className="h-14 w-12 rounded-xl border border-[#DCE2EB] bg-white text-center text-xl font-bold text-[#10264B] outline-none transition focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10 sm:w-14"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            <div>
              {!isExpired ? (
                <p className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F7FB] px-3.5 py-1.5 text-[13px] text-[#53647C]">
                  Code expires in{" "}
                  <span className="font-semibold tabular-nums text-[#10264B]">
                    {formatTime(timeLeft)}
                  </span>
                </p>
              ) : (
                <p className="inline-flex items-center rounded-full bg-red-50 px-3.5 py-1.5 text-[13px] font-medium text-red-700 ring-1 ring-red-600/15">
                  Code expired. Please request a new one.
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || isExpired}
              className="h-12 w-full"
            >
              {loading ? (
                "Verifying..."
              ) : (
                <>
                  Verify & Sign In
                  <CheckCircle className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-10 space-y-4 border-t border-[#DCE2EB] pt-6 text-center">
            <div>
              <p className="mb-3 text-sm text-[#53647C]">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#1246C8] transition-colors hover:text-[#10264B] disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
                {resending ? "Sending..." : "Resend Code"}
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={() => navigate("/admin", { replace: true })}
                className="text-sm font-medium text-[#53647C] underline-offset-4 transition-colors hover:text-[#10264B] hover:underline"
              >
                ← Back to Admin Login
              </button>
            </div>
          </div>
        </div>
        </motion.div>
      </AuthShell>
    </>
  );
}

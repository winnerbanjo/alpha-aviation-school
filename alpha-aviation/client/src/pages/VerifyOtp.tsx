import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  verifyEnrollmentOTP,
  resendEnrollmentOTP,
  verifyAdminOTP,
  resendAdminOTP,
} from "@/api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw, CheckCircle } from "lucide-react";
import { NoIndexSEO } from "@/components/seo/NoIndexSEO";
import { AuthShell, AuthBackLink } from "@/components/auth/AuthShell";
import { asApiError } from "@/lib/errors";

type OTPPurpose = "enrollment" | "admin_login";

export function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { toast } = useToast();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes for enrollment, 5 for admin
  const [purpose, setPurpose] = useState<OTPPurpose>("enrollment");
  const [email, setEmail] = useState("");
  const [tempToken, setTempToken] = useState("");

  // Form data for enrollment
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const purposeParam = searchParams.get("purpose") as OTPPurpose;
    const emailParam = searchParams.get("email");
    // Secrets arrive in router state so they never appear in the URL.
    const secrets = (location.state ?? {}) as { password?: string; tempToken?: string };
    const tempTokenParam = secrets.tempToken;
    const firstNameParam = searchParams.get("firstName");
    const lastNameParam = searchParams.get("lastName");
    const phoneParam = searchParams.get("phone");
    const passwordParam = secrets.password;
    const coursesParam = searchParams.get("courses");

    if (purposeParam && (purposeParam === "enrollment" || purposeParam === "admin_login")) {
      setPurpose(purposeParam);
      setTimeLeft(purposeParam === "admin_login" ? 300 : 600);
    }

    if (emailParam) setEmail(emailParam);
    if (tempTokenParam) setTempToken(tempTokenParam);
    if (firstNameParam) setFirstName(firstNameParam);
    if (lastNameParam) setLastName(lastNameParam);
    if (phoneParam) setPhone(phoneParam);
    if (passwordParam) setPassword(passwordParam);
    if (coursesParam) {
      try {
        setSelectedCourses(JSON.parse(decodeURIComponent(coursesParam)));
      } catch {
        console.error("Failed to parse courses");
      }
    }
  }, [searchParams, location.state]);

  // Timer countdown
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
    if (value.length > 1) return; // Prevent pasting multiple digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
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
      if (purpose === "enrollment") {
        const response = await verifyEnrollmentOTP({
          email,
          otp: otpString,
          firstName,
          lastName,
          phone,
          password,
          selectedCourses,
        });

        if (response.success && response.data?.token) {
          login(
            {
              id: response.data.user.id || response.data.user._id,
              email: response.data.user.email,
              role: response.data.user.role,
              firstName: response.data.user.firstName,
              lastName: response.data.user.lastName,
              phone: response.data.user.phone,
              enrolledCourse: response.data.user.enrolledCourse,
              selectedCourses: response.data.user.selectedCourses,
              courseSelections: response.data.user.courseSelections,
              paymentStatus: response.data.user.paymentStatus,
              amountDue: response.data.user.amountDue,
              amountPaid: response.data.user.amountPaid,
              totalCoursePrice: response.data.user.totalCoursePrice,
              enrollmentDate: response.data.user.enrollmentDate,
              emergencyContact: response.data.user.emergencyContact,
              bio: response.data.user.bio,
              documentUrl: response.data.user.documentUrl,
              status: response.data.user.status,
              paymentReceiptUrl: response.data.user.paymentReceiptUrl,
              studentIdNumber: response.data.user.studentIdNumber,
              adminClearance: response.data.user.adminClearance,
            },
            response.data.token
          );

          toast("Account created successfully!", "success");
          navigate("/dashboard", { replace: true });
        }
      } else {
        const response = await verifyAdminOTP({
          email,
          otp: otpString,
          tempToken,
        });

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
      }
    } catch (caught) {
      const err = asApiError(caught);
      const message =
        err.response?.data?.message || "Invalid verification code. Please try again.";
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);

    try {
      if (purpose === "enrollment") {
        await resendEnrollmentOTP(email);
        setTimeLeft(600);
        setOtp(["", "", "", "", "", ""]);
        toast("New verification code sent!", "success");
      } else {
        await resendAdminOTP({ email, tempToken });
        setTimeLeft(300);
        setOtp(["", "", "", "", "", ""]);
        toast("New verification code sent!", "success");
      }
    } catch (caught) {
      const err = asApiError(caught);
      const message =
        err.response?.data?.message || "Failed to resend code. Please try again.";
      toast(message, "error");
    } finally {
      setResending(false);
    }
  };

  const isExpired = timeLeft <= 0;

  return (
    <>
      <NoIndexSEO
        title="Verify OTP"
        description="Verify your one-time code to continue your Alpha Step Links Aviation School enrollment or admin login."
        url="/verify-otp"
      />
      <AuthShell
        eyebrow={purpose === "enrollment" ? "Email verification" : "Administrator access"}
        title={purpose === "enrollment" ? "Verify your" : "Admin"}
        accent={purpose === "enrollment" ? "email." : "verification."}
        description={
          purpose === "enrollment"
            ? "Enter the verification code sent to your email to complete enrollment."
            : "Enter the verification code sent to your admin email to sign in."
        }
        video="airport-operations-model"
        back={<AuthBackLink onClick={() => navigate(-1)}>Go back</AuthBackLink>}
      >
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-10">
              <span className="eyebrow text-[#1246C8]">One-time code</span>
              <h1 className="mt-4 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
                Enter verification code
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-[#53647C]">
                We sent a 6-digit code to <span className="font-semibold text-[#10264B]">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
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

              {/* Timer */}
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
                className="group h-12 w-full"
              >
                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    Verify & Continue
                    <CheckCircle className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            {/* Resend */}
            <div className="mt-10 border-t border-[#DCE2EB] pt-6 text-center">
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

            {/* Back to login */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() =>
                  navigate(purpose === "admin_login" ? "/login" : "/enroll", {
                    replace: true,
                  })
                }
                className="text-sm font-medium text-[#53647C] underline-offset-4 transition-colors hover:text-[#10264B] hover:underline"
              >
                ← Back to {purpose === "admin_login" ? "Login" : "Enrollment"}
              </button>
            </div>
          </motion.div>
      </AuthShell>
    </>
  );
}

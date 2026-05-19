import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  verifyEnrollmentOTP,
  resendEnrollmentOTP,
  verifyAdminOTP,
  resendAdminOTP,
  login as apiLogin,
} from "@/api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/toast";
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from "lucide-react";
import { NoIndexSEO } from "@/components/seo/NoIndexSEO";

type OTPPurpose = "enrollment" | "admin_login";

export function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const [password, setPassword] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const purposeParam = searchParams.get("purpose") as OTPPurpose;
    const emailParam = searchParams.get("email");
    const tempTokenParam = searchParams.get("tempToken");
    const firstNameParam = searchParams.get("firstName");
    const lastNameParam = searchParams.get("lastName");
    const passwordParam = searchParams.get("password");
    const coursesParam = searchParams.get("courses");

    if (purposeParam && (purposeParam === "enrollment" || purposeParam === "admin_login")) {
      setPurpose(purposeParam);
      setTimeLeft(purposeParam === "admin_login" ? 300 : 600);
    }

    if (emailParam) setEmail(emailParam);
    if (tempTokenParam) setTempToken(tempTokenParam);
    if (firstNameParam) setFirstName(firstNameParam);
    if (lastNameParam) setLastName(lastNameParam);
    if (passwordParam) setPassword(passwordParam);
    if (coursesParam) {
      try {
        setSelectedCourses(JSON.parse(decodeURIComponent(coursesParam)));
      } catch (e) {
        console.error("Failed to parse courses");
      }
    }
  }, [searchParams]);

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
          navigate("/admin/dashboard", { replace: true });
        }
      }
    } catch (err: any) {
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
    } catch (err: any) {
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
      <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden relative">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-6/12 h-screen sticky top-0 bg-slate-900 overflow-hidden relative z-10">
        <div className="absolute inset-0 z-0">
          <img
            src="/wing.png"
            alt="Aviation Background"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/60 to-transparent" />
        </div>

        <div className="absolute inset-4 overflow-hidden">
          <div className="absolute top-8 left-8 z-20">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-3 w-fit px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:border-white/30 transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                <ArrowLeft className="w-3 h-3" />
              </div>
              <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                Go Back
              </span>
            </button>
          </div>

          <div className="absolute inset-0 flex flex-col justify-center px-12 z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h1 className="text-4xl xl:text-5xl font-semibold tracking-tighter text-white mb-6 leading-[1.05]">
                {purpose === "enrollment" ? (
                  <>
                    Verify Your
                    <br />
                    <span className="italic text-[#0061FF]">Email</span>
                  </>
                ) : (
                  <>
                    Admin
                    <br />
                    <span className="italic text-[#0061FF]">Verification</span>
                  </>
                )}
              </h1>
              <p className="text-white/60 text-lg leading-relaxed max-w-sm font-medium">
                {purpose === "enrollment"
                  ? "Enter the verification code sent to your email to complete enrollment."
                  : "Enter the verification code sent to your admin email to sign in."}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 lg:h-screen overflow-y-auto z-10 bg-white">
        <div className="max-w-md mx-auto px-6 py-12 lg:py-24 h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-12">
              <div className="inline-flex justify-center mb-6">
                <div className="p-3 bg-[#0061FF]/10 rounded-full border border-[#0061FF]/20 shadow-sm shadow-[#0061FF]/10">
                  <Mail className="w-8 h-8 text-[#0061FF]" />
                </div>
              </div>
              <h2 className="text-4xl font-semibold tracking-tighter text-slate-900 mb-2">
                Enter Verification Code
              </h2>
              <p className="text-slate-400 text-sm font-medium">
                We sent a 6-digit code to <span className="text-slate-600">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">
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
                      className="w-14 h-14 text-center text-2xl font-bold bg-white border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900 transition-all"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Timer */}
              <div className="text-center">
                {!isExpired ? (
                  <p className="text-sm text-slate-400">
                    Code expires in{" "}
                    <span className="text-slate-600 font-semibold">
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
                className="w-full rounded-[1.25rem] bg-slate-900 hover:bg-black text-white h-16 font-bold text-sm tracking-tight transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-2xl shadow-slate-200"
              >
                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    Verify & Continue
                    <CheckCircle className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Resend */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400 font-medium mb-3">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-2 text-[#0061FF] font-bold hover:underline underline-offset-4 transition-colors disabled:opacity-50"
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
                className="text-sm text-slate-500 hover:text-slate-800 font-medium hover:underline underline-offset-4 transition-colors"
              >
                ← Back to {purpose === "admin_login" ? "Login" : "Enrollment"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </>
  );
}

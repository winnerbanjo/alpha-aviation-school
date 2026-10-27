import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { login as apiLogin } from "@/api";
import { motion } from "framer-motion";
import { NoIndexSEO } from "@/components/seo/NoIndexSEO";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { toast } = useToast();
  const isAgentLogin = location.pathname.startsWith("/agent");
  const loginTitle = isAgentLogin ? "Agent Login" : "Student Login";
  const loginDescription = isAgentLogin
    ? "Sign in to manage student enrollments, tuition uploads, and agent records."
    : "Log in to access your dashboard and course progress.";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast("Please enter your email and password", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await apiLogin(email, password);
      const { data } = response.data;

      if (data?.requiresOTP && data?.tempToken) {
        navigate(`/verify-otp?purpose=admin_login&email=${encodeURIComponent(email)}`, {
          replace: true,
          state: { tempToken: data.tempToken },
        });
        toast("Verification code sent to your email!", "success");
      } else if (data?.token && data.user) {
        const { user: userData, token } = data;

        login(
          {
            id: userData._id || userData.id,
            email: userData.email,
            role: userData.role,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            // Student fields
            enrolledCourse: userData.enrolledCourse,
            selectedCourses: userData.selectedCourses,
            courseSelections: userData.courseSelections,
            paymentStatus: userData.paymentStatus,
            amountDue: userData.amountDue,
            amountPaid: userData.amountPaid,
            totalCoursePrice: userData.totalCoursePrice,
            enrollmentDate: userData.enrollmentDate,
            emergencyContact: userData.emergencyContact,
            bio: userData.bio,
            documentUrl: userData.documentUrl,
            status: userData.status,
            paymentReceiptUrl: userData.paymentReceiptUrl,
            studentIdNumber: userData.studentIdNumber,
            adminClearance: userData.adminClearance,
            // Agent context for students enrolled via agent
            enrolledByAgent: userData.enrolledByAgent || null,
            agentPaymentStatus: userData.agentPaymentStatus,
            // Agent-specific fields
            agentStatus: userData.agentStatus,
            agencyName: userData.agencyName,
            agentCode: userData.agentCode,
          },
          token,
        );

        toast(`Welcome back, ${userData.firstName || userData.email}!`, "success");

        if (userData.role === "admin") {
          navigate("/admin/dashboard/overview", { replace: true });
        } else if (userData.role === "agent") {
          if (userData.agentStatus === "pending") {
            navigate("/agent/pending", { replace: true });
          } else if (userData.agentStatus === "approved") {
            navigate("/agent/dashboard/overview", { replace: true });
          } else {
            // rejected / suspended — show pending page with status message
            navigate("/agent/pending", { replace: true });
          }
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        toast("Login failed. Check your credentials.", "error");
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const message =
        apiError.response?.data?.message || "Invalid credentials. Please try again.";
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NoIndexSEO
        title={loginTitle}
        description={loginDescription}
        url={isAgentLogin ? "/agent/login" : "/login"}
      />
      <AuthShell
        eyebrow={isAgentLogin ? "Partner portal" : "Student portal"}
        title="Welcome back to"
        accent="the flight deck."
        description={loginDescription}
        video="flight-deck-mentoring"
        facts={[
          { label: "Career tracks", value: "7" },
          { label: "Weeks per course", value: "4" },
          { label: "Learning modes", value: "Lagos & live online" },
        ]}
      >
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-10">
              <span className="eyebrow text-[#1246C8]">Sign in</span>
              <h1 className="mt-4 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
                {loginTitle}
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-[#53647C]">
                Enter your credentials to access your portal.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                  placeholder="name@academy.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                  Portal Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#DCE2EB] bg-white py-3 pl-4 pr-12 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#53647C] transition-colors hover:bg-[#F5F7FB] hover:text-[#1246C8]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="group mt-2 h-12 w-full"
              >
                {loading ? "Authenticating..." : "Sign In to Portal"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>

            <div className="mt-10 space-y-3 border-t border-[#DCE2EB] pt-6 text-center">
              <p className="text-sm text-[#53647C]">
                {isAgentLogin ? "New partner?" : "New to the academy?"}{" "}
                <Link
                  to={isAgentLogin ? "/agent/register" : "/enroll"}
                  className="font-semibold text-[#1246C8] underline-offset-4 transition-colors hover:text-[#10264B] hover:underline"
                >
                  {isAgentLogin ? "Apply as Agent" : "Start Enrollment"}
                </Link>
              </p>
              <p className="text-sm text-[#53647C]">
                <Link
                  to="/forgot-password"
                  className="font-medium text-[#53647C] underline-offset-4 transition-colors hover:text-[#10264B] hover:underline"
                >
                  Forgot your password?
                </Link>
              </p>
            </div>
          </motion.div>
      </AuthShell>
    </>
  );
}

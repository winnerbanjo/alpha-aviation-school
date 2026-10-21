import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { login as apiLogin } from "@/api";
import { NoIndexSEO } from "@/components/seo/NoIndexSEO";
import { AuthShell } from "@/components/auth/AuthShell";
import { useToast } from "@/components/ui/use-toast";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export function AgentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { toast } = useToast();

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
        navigate(
          `/verify-otp?purpose=admin_login&email=${encodeURIComponent(email)}&tempToken=${encodeURIComponent(data.tempToken)}`,
          { replace: true },
        );
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
            enrolledByAgent: userData.enrolledByAgent || null,
            agentPaymentStatus: userData.agentPaymentStatus,
            agentStatus: userData.agentStatus,
            agencyName: userData.agencyName,
            agentCode: userData.agentCode,
          },
          token,
        );

        toast(
          `Welcome back, ${userData.firstName || userData.email}!`,
          "success",
        );

        if (userData.role === "admin") {
          navigate("/admin/dashboard/overview", { replace: true });
        } else if (userData.role === "agent") {
          if (userData.agentStatus === "pending") {
            navigate("/agent/pending", { replace: true });
          } else if (userData.agentStatus === "approved") {
            navigate("/agent/dashboard/overview", { replace: true });
          } else {
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
        apiError.response?.data?.message ||
        "Invalid credentials. Please try again.";
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NoIndexSEO
        title="Agent Login"
        description="Sign in to manage student enrollments, tuition uploads, and agent records."
        url="/agent/login"
      />
      <AuthShell
        eyebrow="Partner portal"
        title="Welcome back,"
        accent="partner."
        description="Sign in to manage student enrollments, tuition uploads, and agent records."
        video="instructor-briefing"
      >
        <div className="w-full">
          <div>
            <div className="mb-10">
              <span className="eyebrow text-[#1246C8]">Agent access</span>
              <h1 className="mt-4 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
                Agent sign in
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-[#53647C]">
                Enter the email and password linked to your agency account.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                  placeholder="name@agency.com"
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="mt-2 h-12 w-full"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-10 space-y-2 border-t border-[#DCE2EB] pt-6 text-center">
              <p className="text-sm text-[#53647C]">
                New partner?{" "}
                <Link
                  to="/agent/register"
                  className="font-semibold text-[#1246C8] underline-offset-4 transition-colors hover:text-[#10264B] hover:underline"
                >
                  Apply as Agent
                </Link>
              </p>
            </div>
          </div>
        </div>
      </AuthShell>
    </>
  );
}

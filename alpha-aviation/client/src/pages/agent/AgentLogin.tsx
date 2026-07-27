import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { login as apiLogin } from "@/api";
import { NoIndexSEO } from "@/components/seo/NoIndexSEO";
import { Building2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-2.5 bg-slate-900 rounded-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-xl font-semibold text-slate-900">
                Agent Sign In
              </h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-900 bg-white text-sm"
                  placeholder="name@agency.com"
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-900 bg-white text-sm"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 text-white py-2.5 text-sm font-medium"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-slate-500">
                New partner?{" "}
                <Link
                  to="/agent/register"
                  className="text-slate-900 font-medium hover:underline"
                >
                  Apply as Agent
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

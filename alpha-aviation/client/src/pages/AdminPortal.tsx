import { useState, useEffect } from "react";
import { useSearchParams, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { login as apiLogin } from "@/api";
import { NoIndexSEO } from "@/components/seo/NoIndexSEO";
import { AuthShell } from "@/components/auth/AuthShell";

export function AdminPortal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login: setAuth, isAuthenticated, user } = useAuthStore();

  const sessionExpired = searchParams.get("session_expired") === "1";
  const authFailed = searchParams.get("auth_failed") === "1";

  useEffect(() => {
    if (sessionExpired) {
      setError("Your session has expired. Please log in again.");
      window.history.replaceState({}, "", "/admin");
    } else if (authFailed) {
      setError("Authentication failed. Please check your credentials.");
      window.history.replaceState({}, "", "/admin");
    }
  }, [sessionExpired, authFailed]);

  if (isAuthenticated && user?.role === "admin") {
    return <Navigate to="/admin/dashboard/overview" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const emailValue = email.trim().toLowerCase();
    const passwordValue = password;

    if (!emailValue || !passwordValue) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      const response = await apiLogin(emailValue, passwordValue);
      const outerBody = response.data;
      const inner = outerBody?.data;

      if (!outerBody?.success) {
        setError(outerBody?.message || "Login failed.");
        setLoading(false);
        return;
      }

      if (inner?.requiresOTP && inner?.tempToken) {
        navigate(
          `/admin/verify-otp?email=${encodeURIComponent(emailValue)}&tempToken=${encodeURIComponent(inner.tempToken)}`,
          { replace: true },
        );
        setLoading(false);
        return;
      }

      if (!inner?.token || !inner?.user) {
        setError("Login failed.");
        setLoading(false);
        return;
      }

      if (inner.user.role !== "admin") {
        setError("Access denied. Admin credentials required.");
        setLoading(false);
        return;
      }

      setAuth(
        {
          id: inner.user.id,
          email: inner.user.email,
          role: inner.user.role,
          firstName: inner.user.firstName,
          lastName: inner.user.lastName,
          phone: inner.user.phone,
          adminLevel: inner.user.adminLevel,
          permissions: inner.user.permissions,
        },
        inner.token,
      );

      navigate("/admin/dashboard/overview", { replace: true });
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else if (err.response?.status === 429) {
        setError("Too many attempts. Please wait a few minutes.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (
        err.message?.includes("timeout") ||
        err.code === "ECONNABORTED"
      ) {
        setError("Request timed out. Please try again.");
      } else if (
        err.message?.includes("Network Error") ||
        err.code === "ERR_NETWORK"
      ) {
        setError("Server unreachable. Please check connection.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NoIndexSEO
        title="Admin Portal"
        description="Secure admin sign-in for Alpha Step Links Aviation School."
        url="/admin"
      />
      <AuthShell
        eyebrow="Administrator access"
        title="Secure sign-in"
        accent="for ASL staff."
        description="This area is restricted to authorised Alpha Step Links Aviation School administrators."
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
            <span className="eyebrow text-[#1246C8]">Staff only</span>
            <h1 className="mt-4 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
              Admin portal
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[#53647C]">
              Sign in with your admin credentials
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]"
              >
                <Mail className="h-3.5 w-3.5" />
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                placeholder="admin@yourcompany.com"
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]"
              >
                <Lock className="h-3.5 w-3.5" />
                Password
              </label>
              <input
                id="admin-password"
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

          <div className="mt-10 border-t border-[#DCE2EB] pt-6 text-center">
            <a
              href="/login"
              className="text-sm font-medium text-[#53647C] transition-colors hover:text-[#1246C8]"
            >
              Student login →
            </a>
          </div>
        </div>
        </motion.div>
      </AuthShell>
    </>
  );
}

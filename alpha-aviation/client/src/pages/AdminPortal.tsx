import { useState, useEffect } from "react";
import { useSearchParams, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Shield, Mail, Lock, AlertCircle } from "lucide-react";
import { login as apiLogin } from "@/api";

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
    return <Navigate to="/admin/dashboard" replace />;
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

      if (!outerBody?.success || !inner?.token || !inner?.user) {
        setError(outerBody?.message || "Login failed.");
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

      navigate("/admin/dashboard", { replace: true });
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
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">
              Admin Portal
            </h1>
            <p className="text-slate-500 text-sm">
              Sign in with your admin credentials
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-slate-900 mb-2 flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 text-slate-900 transition-all bg-white"
                placeholder="admin@yourcompany.com"
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-slate-900 mb-2 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 text-slate-900 transition-all bg-white"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 text-white py-3 shadow-sm transition-all duration-300 hover:scale-[1.02] font-medium"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Student login →
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { resetPassword } from "@/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { NoIndexSEO } from "@/components/seo/NoIndexSEO";
import { AuthShell, AuthBackLink } from "@/components/auth/AuthShell";
import { asApiError } from "@/lib/errors";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast(
        "Invalid or missing reset token. Please request a new link.",
        "error",
      );
      return;
    }
    if (password.length < 6) {
      toast("Password must be at least 6 characters", "error");
      return;
    }
    if (password !== confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      toast("Password reset successfully! You can now sign in.", "success");
      navigate("/login", { replace: true });
    } catch (caught) {
      const err = asApiError(caught);
      const message =
        err.response?.data?.message || "Reset link is invalid or has expired.";
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NoIndexSEO
        title="Reset Password"
        description="Set a new password for your Alpha Step Links Aviation School account."
        url="/reset-password"
      />
      <AuthShell
        eyebrow="Account security"
        title="Set a new"
        accent="secure password."
        description="Choose a strong password. This link is valid for 1 hour only."
        video="aircraft-planning"
        back={<AuthBackLink to="/login">Back to sign in</AuthBackLink>}
      >
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-10">
              <span className="eyebrow text-[#1246C8]">Password reset</span>
              <h1 className="mt-4 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
                Reset password
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-[#53647C]">
                Enter and confirm your new password below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#DCE2EB] bg-white py-3 pl-4 pr-12 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                    placeholder="Min. 6 characters"
                    minLength={6}
                    required
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

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                  placeholder="Re-enter your password"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="mt-2 h-12 w-full"
              >
                {loading ? "Resetting..." : "Reset Password"}
                <ShieldCheck className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </motion.div>
      </AuthShell>
    </>
  );
}

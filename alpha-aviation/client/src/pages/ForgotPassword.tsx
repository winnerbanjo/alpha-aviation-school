import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { forgotPassword } from "@/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { NoIndexSEO } from "@/components/seo/NoIndexSEO";
import { AuthShell, AuthBackLink } from "@/components/auth/AuthShell";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast("Please enter your email address", "error");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      toast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NoIndexSEO
        title="Forgot Password"
        description="Request a password reset link for your Alpha Step Links Aviation School account."
        url="/forgot-password"
      />
      <AuthShell
        eyebrow="Account recovery"
        title="Regain access to"
        accent="your account."
        description="Enter your registered email and we'll send you a secure reset link."
        video="aircraft-planning"
        back={<AuthBackLink to="/login">Back to sign in</AuthBackLink>}
      >
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {!sent ? (
              <>
                <div className="mb-10">
                  <span className="eyebrow text-[#1246C8]">Password reset</span>
                  <h1 className="mt-4 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
                    Forgot password
                  </h1>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#53647C]">
                    Enter your account email and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                      placeholder="name@academy.com"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="mt-2 h-12 w-full"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                    <Mail className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                <div className="mt-10 border-t border-[#DCE2EB] pt-6 text-center">
                  <p className="text-sm text-[#53647C]">
                    Remember your password?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-[#1246C8] underline-offset-4 transition-colors hover:text-[#10264B] hover:underline"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-600/15">
                  <Mail className="h-7 w-7 text-emerald-600" />
                </div>
                <div>
                  <span className="eyebrow text-[#1246C8]">Link sent</span>
                  <h1 className="mt-4 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
                    Check your inbox
                  </h1>
                  <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-[#53647C]">
                    If <span className="font-semibold text-[#10264B]">{email}</span>{" "}
                    is registered, a password reset link has been sent. It
                    expires in 1 hour.
                  </p>
                </div>
                <Link to="/login">
                  <Button className="mt-4 h-12 px-8">
                    Back to Sign In
                  </Button>
                </Link>
              </motion.div>
            )}
          </motion.div>
      </AuthShell>
    </>
  );
}

import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { resetPassword } from "@/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

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
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Reset link is invalid or has expired.";
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-6/12 h-screen sticky top-0 bg-slate-900 overflow-hidden z-10">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src="/wing.png"
            alt="Aviation Background"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/60 to-transparent" />
        </motion.div>

        <div className="absolute inset-4 overflow-hidden">
          <div className="absolute top-8 left-8 z-20">
            <Link
              to="/"
              className="group flex items-center gap-3 w-fit px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:border-white/30 transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                <ArrowLeft className="w-3 h-3" />
              </div>
              <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                Go Home
              </span>
            </Link>
          </div>

          <div className="absolute inset-0 flex flex-col justify-center px-12 z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h1 className="text-4xl xl:text-5xl font-semibold tracking-tighter text-white mb-6 leading-[1.05]">
                Set a New <br />
                <span className="italic text-[#0061FF]">Secure</span> Password.
              </h1>
              <p className="text-white/60 text-lg leading-relaxed max-w-sm font-medium">
                Choose a strong password. This link is valid for 1 hour only.
              </p>
            </motion.div>
          </div>
        </div>

        <div
          className="absolute top-0 right-0 h-full w-24 bg-white z-20 pointer-events-none"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%, 100% 0)" }}
        />
      </div>

      {/* Right Panel */}
      <div className="flex-1 lg:h-screen overflow-y-auto z-10 bg-white">
        <div className="max-w-md mx-auto px-6 py-12 lg:py-24 h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Mobile back */}
            <div className="lg:hidden mb-8">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center bg-slate-50">
                  <ArrowLeft className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                  Back to Login
                </span>
              </Link>
            </div>

            <div className="mb-12">
              <div className="inline-flex justify-center mb-6">
                <div className="p-3 bg-[#0061FF]/10 rounded-full border border-[#0061FF]/20">
                  <ShieldCheck className="w-8 h-8 text-[#0061FF]" />
                </div>
              </div>
              <h2 className="text-4xl font-semibold tracking-tighter text-slate-900 mb-2">
                Reset Password
              </h2>
              <p className="text-slate-400 text-sm font-medium">
                Enter and confirm your new password below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white px-5 py-4 border-2 border-slate-300 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-[#0061FF]/5 focus:border-[#0061FF] text-slate-900 transition-all placeholder:text-slate-300 font-medium"
                    placeholder="Min. 6 characters"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white px-5 py-4 border-2 border-slate-300 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-[#0061FF]/5 focus:border-[#0061FF] text-slate-900 transition-all placeholder:text-slate-300 font-medium"
                  placeholder="Re-enter your password"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-[1.25rem] bg-slate-900 hover:bg-black text-white h-16 font-bold text-sm tracking-tight transition-all hover:scale-[1.01] active:scale-[0.99] shadow-2xl shadow-slate-200"
              >
                {loading ? "Resetting..." : "Reset Password"}
                <ShieldCheck className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, GraduationCap } from "lucide-react";
import { forgotPassword } from "@/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

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
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-6/12 h-screen sticky top-0 bg-slate-900 overflow-hidden relative z-10">
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
          {/* Go Home */}
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
                Regain Access to <br />
                <span className="italic text-[#0061FF]">Your</span> Account.
              </h1>
              <p className="text-white/60 text-lg leading-relaxed max-w-sm font-medium">
                Enter your registered email and we'll send you a secure reset
                link.
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

            {!sent ? (
              <>
                <div className="mb-12">
                  <div className="inline-flex justify-center mb-6">
                    <div className="p-3 bg-[#0061FF]/10 rounded-full border border-[#0061FF]/20">
                      <GraduationCap className="w-8 h-8 text-[#0061FF]" />
                    </div>
                  </div>
                  <h2 className="text-4xl font-semibold tracking-tighter text-slate-900 mb-2">
                    Forgot Password
                  </h2>
                  <p className="text-slate-400 text-sm font-medium">
                    Enter your account email and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white px-5 py-4 border-2 border-slate-300 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-[#0061FF]/5 focus:border-[#0061FF] text-slate-900 transition-all placeholder:text-slate-300 font-medium"
                      placeholder="name@academy.com"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-[1.25rem] bg-slate-900 hover:bg-black text-white h-16 font-bold text-sm tracking-tight transition-all hover:scale-[1.01] active:scale-[0.99] shadow-2xl shadow-slate-200"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                    <Mail className="w-4 h-4 ml-2" />
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-sm text-slate-400 font-medium">
                    Remember your password?{" "}
                    <Link
                      to="/login"
                      className="text-[#0061FF] font-bold hover:underline underline-offset-4"
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
                className="text-center space-y-6"
              >
                <div className="mx-auto w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-semibold tracking-tighter text-slate-900 mb-2">
                    Check Your Inbox
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                    If <span className="font-bold text-slate-700">{email}</span>{" "}
                    is registered, a password reset link has been sent. It
                    expires in 1 hour.
                  </p>
                </div>
                <Link to="/login">
                  <Button className="rounded-[1.25rem] bg-slate-900 hover:bg-black text-white h-14 px-10 font-bold text-sm tracking-tight mt-4">
                    Back to Sign In
                  </Button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

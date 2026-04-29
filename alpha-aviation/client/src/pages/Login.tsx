import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { login as apiLogin } from "@/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  Shield,
  Plane,
  Star,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      // The backend returns { success: true, message: "...", data: { token, user } }
      const { data } = response.data;

      if (data?.token && data.user) {
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
          },
          token,
        );

        toast(`Welcome back, ${userData.firstName}!`, "success");
        navigate(
          userData.role === "admin" ? "/admin/dashboard" : "/dashboard",
          {
            replace: true,
          },
        );
      } else {
        toast("Login failed. Check your credentials.", "error");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Invalid credentials. Please try again.";
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden relative">
      {/* Left Panel: Cinematic Hero */}
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

          {/* Main Narrative Overlay */}
          <div className="absolute inset-0 flex flex-col justify-center px-12 z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h1 className="text-4xl xl:text-5xl font-semibold tracking-tighter text-white mb-6 leading-[1.05]">
                Welcome Back to the <br />
                <span className="italic text-[#0061FF]">Elite</span> Flight
                Deck.
              </h1>
              <p className="text-white/60 text-lg leading-relaxed max-w-sm font-medium">
                Log in to access your dashboard and course progress.
              </p>
            </motion.div>
          </div>
        </div>

        {/* The Curved Cutout Effect */}
        <div
          className="absolute top-0 right-0 h-full w-24 bg-white z-20 pointer-events-none"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%, 100% 0)" }}
        />
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex-1 lg:h-screen overflow-y-auto z-10 bg-white">
        <div className="max-w-md mx-auto px-6 py-12 lg:py-24 h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Mobile-only Back to Home */}
            <div className="lg:hidden mb-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center bg-slate-50 group-hover:bg-slate-100 transition-colors">
                  <ArrowLeft className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                  Back to Home
                </span>
              </Link>
            </div>

            <div className="mb-12">
              <div className="inline-flex justify-center mb-6">
                <div className="p-3 bg-[#0061FF]/10 rounded-full border border-[#0061FF]/20 shadow-sm shadow-[#0061FF]/10">
                  <GraduationCap className="w-8 h-8 text-[#0061FF]" />
                </div>
              </div>
              <h2 className="text-4xl font-semibold tracking-tighter text-slate-900 mb-2">
                Student Login
              </h2>
              <p className="text-slate-400 text-sm font-medium">
                Enter your credentials to enter your dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white px-5 py-4 border-2 border-slate-500 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-[#0061FF]/5 focus:border-[#0061FF] text-slate-900 transition-all placeholder:text-slate-300 font-medium"
                  placeholder="name@academy.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">
                  Portal Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white px-5 py-4 border-2 border-slate-500 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-[#0061FF]/5 focus:border-[#0061FF] text-slate-900 transition-all placeholder:text-slate-300 font-medium"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-[1.25rem] bg-slate-900 hover:bg-black text-white h-16 font-bold text-sm tracking-tight transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-2xl shadow-slate-200"
              >
                {loading ? "Authenticating..." : "Sign In to Portal"}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <div className="mt-12 text-center space-y-4">
              <p className="text-sm text-slate-400 font-medium">
                New to the academy?{" "}
                <Link
                  to="/enroll"
                  className="text-[#0061FF] font-bold hover:underline underline-offset-4"
                >
                  Start Enrollment
                </Link>
              </p>
              <p className="text-sm text-slate-400 font-medium">
                <Link
                  to="/forgot-password"
                  className="text-slate-500 hover:text-slate-800 font-medium hover:underline underline-offset-4 transition-colors"
                >
                  Forgot your password?
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

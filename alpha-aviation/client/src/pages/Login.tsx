import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { login as apiLogin } from "@/api";
import { motion } from "framer-motion";
import { GraduationCap, Plane } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiLogin(email, password);
      const { data } = response.data;

      if (!data?.success || !data.token || !data.user) {
        setLoading(false);
        return;
      }

      const { user: userData, token } = data;

      login(
        {
          id: userData.id,
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
          paymentMethod: userData.paymentMethod,
          trainingMethod: userData.trainingMethod,
          status: userData.status,
          paymentReceiptUrl: userData.paymentReceiptUrl,
          studentIdNumber: userData.studentIdNumber,
          adminClearance: userData.adminClearance,
        },
        token
      );

      navigate(userData.role === "admin" ? "/admin/dashboard" : "/dashboard", { replace: true });
    } catch (err: any) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      {/* Floating Background Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[10%] text-white/10"
        >
          <GraduationCap size={140} strokeWidth={1} />
        </motion.div>
        <motion.div
          animate={{ x: [-15, 15, -15], y: [0, -10, 0], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] right-[15%] text-orange-500/20"
        >
          <Plane size={80} strokeWidth={1} />
        </motion.div>
        <motion.div
          animate={{ x: [10, -10, 10], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[25%] left-[20%] text-white/10"
        >
          <GraduationCap size={60} strokeWidth={1} />
        </motion.div>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex justify-center mb-4">
              <div className="p-3 bg-[#0061FF]/10 rounded-full">
                <GraduationCap className="w-8 h-8 text-[#0061FF]" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">
              Welcome Back
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900 transition-all"
                placeholder="Email address"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900 transition-all"
                placeholder="Password"
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#0061FF] hover:bg-[#0052E6] text-white py-3 shadow-sm transition-all duration-300 hover:scale-[1.02]"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
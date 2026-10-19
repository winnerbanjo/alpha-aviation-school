import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { agentRegister } from "@/api";
import { AuthShell } from "@/components/auth/AuthShell";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export function AgentEnroll() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    agencyName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }
    if (form.password.length < 6) {
      toast("Password must be at least 6 characters", "error");
      return;
    }
    try {
      setLoading(true);
      const res = await agentRegister({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        agencyName: form.agencyName,
      });
      toast("Application submitted! You will be notified once approved.", "success");
      if (res?.data?.token && res?.data?.user) {
        login(res.data.user, res.data.token);
      }
      navigate("/agent/pending");
    } catch (err: unknown) {
      const apiError = err as ApiError;
      toast(apiError.response?.data?.message || "Registration failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Partner programme"
      title="Grow with"
      accent="Alpha Step Links."
      description="Refer students to our aviation, travel and hospitality programmes, then manage their enrollments and tuition uploads from one dashboard."
      video="instructor-briefing"
      wide
      facts={[
        { label: "Programs to refer", value: "7" },
        { label: "Learning modes", value: "Lagos & live online" },
        { label: "Offices", value: "UK & Nigeria" },
      ]}
    >
      <div className="w-full">
        <div>
          <div className="mb-10">
            <span className="eyebrow text-[#1246C8]">Become a partner</span>
            <h1 className="mt-4 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
              Agent application
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[#53647C]">
              Partner with Alpha Step Links Aviation School
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="grid grid-cols-1 gap-5 sm:col-span-2 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                  First name
                </label>
                <input
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  placeholder="John"
                  className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                />
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                  Last name
                </label>
                <input
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                  className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                Agency name <span className="font-normal normal-case tracking-normal text-[#8C9AB0]">(optional)</span>
              </label>
              <input
                name="agencyName"
                type="text"
                value={form.agencyName}
                onChange={handleChange}
                placeholder="Doe Aviation Partners"
                className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="john@doeaviation.com"
                className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                Phone
              </label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+234 801 234 5678"
                className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:col-span-2 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Min. 6 characters"
                  className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                />
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                  Confirm
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Repeat password"
                  className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 w-full sm:col-span-2"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>

          <p className="mt-10 border-t border-[#DCE2EB] pt-6 text-center text-sm text-[#53647C]">
            Already have an account?{" "}
            <Link to="/agent/login" className="font-semibold text-[#1246C8] underline-offset-4 transition-colors hover:text-[#10264B] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { register } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { COURSE_CATALOG, computeEnrollmentPrice } from "@/data/courseCatalog";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Star,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  User,
  BookOpen,
  Settings2,
  Award,
} from "lucide-react";

export function Enroll() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    showPassword: false,
    selectedCourses: [] as string[],
    paymentMethod: [] as string[],
    trainingMethod: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  const toggleCourseSelection = (courseTitle: string) => {
    setFormData((current) => {
      const isSelected = current.selectedCourses.includes(courseTitle);
      if (isSelected) {
        return {
          ...current,
          selectedCourses: current.selectedCourses.filter(
            (c) => c !== courseTitle,
          ),
        };
      }
      if (current.selectedCourses.length >= 4) {
        toast("Maximum 4 courses — unselect one to swap", "error");
        return current;
      }
      return {
        ...current,
        selectedCourses: [...current.selectedCourses, courseTitle],
      };
    });
  };

  const testimonials = [
    {
      name: "Chiamaka Okoro",
      role: "Class of 2024",
      image:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200&h=200",
    },
    {
      name: "Tunde Bakare",
      role: "Flight Student",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200",
    },
    {
      name: "Amina Yusuf",
      role: "Graduate",
      image:
        "https://images.unsplash.com/photo-1567532939604-b6c5b0ad2e01?auto=format&fit=crop&q=80&w=200&h=200",
    },
  ];
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const nextTestimonial = () =>
    setTestimonialIdx((p) => (p + 1) % testimonials.length);
  const prevTestimonial = () =>
    setTestimonialIdx(
      (p) => (p - 1 + testimonials.length) % testimonials.length,
    );

  const handleStep1Next = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      toast("Please fill in all fields to continue", "error");
      return;
    }
    if (formData.password.length < 6) {
      toast("Password must be at least 6 characters", "error");
      return;
    }
    setStep(2);
  };

  const handleStep2Next = () => {
    if (formData.selectedCourses.length === 0) {
      toast("Select at least one course to continue", "error");
      return;
    }
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        selectedCourses: formData.selectedCourses,
        paymentMethod: formData.paymentMethod,
        trainingMethod: formData.trainingMethod,
        role: "student",
      });

      if (response?.data?.token && response?.data?.user) {
        const { token, user } = response.data;
        login({ ...user, id: user.id }, token);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        toast("Enrollment successful! Welcome to the academy.", "success");
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/registration-success");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Registration failed. Please try again.";
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const count = formData.selectedCourses.length;
  const enrollmentPrice = computeEnrollmentPrice(count);
  const isBundle = count === 4;

  const stepLabels = [
    { icon: User, label: "Account" },
    { icon: BookOpen, label: "Courses" },
    { icon: Settings2, label: "Preferences" },
  ];

  const leftPanelText = [
    {
      heading: (
        <>
          Your Career in <br /> Aviation Starts{" "}
          <span className="italic text-[#0061FF]">Here.</span>
        </>
      ),
      sub: "Create your account in seconds. No commitment yet — just your details.",
    },
    {
      heading: (
        <>
          Choose Your <br /> <span className="italic text-[#0061FF]">Path</span>{" "}
          to Success.
        </>
      ),
      sub: "Select up to 4 courses. Pick all 4 to unlock the international internship bundle.",
    },
    {
      heading: (
        <>
          Almost <span className="italic text-[#0061FF]">There.</span>
        </>
      ),
      sub: "Tell us how you prefer to pay and train. We'll accommodate you.",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#0061FF]/[0.02] pointer-events-none z-0" />

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-6/12 h-screen top-0 bg-slate-900 overflow-hidden relative z-10">
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
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-900/60 to-transparent" />
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

          {/* Step Progress Pills */}

          {/* Headline — updates per step */}
          <div className="absolute inset-0 flex flex-col justify-center px-12 z-10 pt-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-4xl xl:text-5xl font-semibold tracking-tighter text-white mb-6 leading-[1.05]">
                  {leftPanelText[step - 1].heading}
                </h1>
                <p className="text-white/60 text-lg leading-relaxed max-w-sm font-medium">
                  {leftPanelText[step - 1].sub}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Testimonial Carousel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-8 left-8 z-20"
            >
              <div className="bg-black/30 backdrop-blur-2xl p-5 rounded-[1.5rem] border border-white/10 flex items-center gap-4 max-w-[300px]">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/20">
                    <img
                      src={testimonials[testimonialIdx].image}
                      alt={testimonials[testimonialIdx].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-[#0061FF] rounded-lg p-1 border border-white/20">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm tracking-tight">
                    {testimonials[testimonialIdx].name}
                  </h4>
                  <p className="text-white/50 text-[11px] font-medium mt-0.5">
                    {testimonials[testimonialIdx].role}
                  </p>
                  <div className="flex items-center gap-0.5 mt-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="w-2.5 h-2.5 text-[#0061FF] fill-[#0061FF]"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-10 right-10 flex gap-3 z-20">
            <button
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Curved cutout */}
        <div
          className="absolute top-0 right-0 h-full w-24 bg-white z-20 pointer-events-none"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%, 100% 0)" }}
        />
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="flex-1 lg:h-screen overflow-y-auto z-10 bg-white">
        <div className="max-w-xl mx-auto px-6 py-12 lg:py-20">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Mobile-only Back to Home */}
            <div className="lg:hidden mb-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center bg-slate-50 group-hover:bg-slate-100 transition-colors">
                  <ArrowLeft className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                  Back to Home
                </span>
              </Link>
            </div>

            {/* Top nav */}
            <div className="flex items-center justify-between mb-10">
              <div className="min-w-[100px]">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full border border-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white transition-all">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold tracking-widest uppercase">
                      Step {step - 1}
                    </span>
                  </button>
                )}
              </div>
              {/* Step dots */}
              <div className="flex items-center gap-1.5 bg-white p-2 rounded-full border border-slate-300 shadow-sm">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                      step === s
                        ? "w-10 bg-[#0061FF]"
                        : step > s
                          ? "w-4 bg-[#0061FF]/30"
                          : "w-4 bg-slate-100"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step label */}
            <div className="mb-8">
              <div className="inline-block px-3 py-1 bg-[#0061FF]/10 text-[#0061FF] text-[10px] font-extrabold uppercase tracking-widest rounded-md mb-3">
                Step {step} of 3 —{" "}
                {step === 1
                  ? "Create Account"
                  : step === 2
                    ? "Choose Courses"
                    : "Payment & Training Preferences"}
              </div>
              <h2 className="text-3xl font-semibold tracking-tighter text-slate-900 mb-1">
                {step === 1
                  ? "Begin Your Journey"
                  : step === 2
                    ? "Select Your Programme"
                    : "Final Details"}
              </h2>
              <p className="text-sm text-slate-400 font-medium">
                {step === 1 ? (
                  <>
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-[#0061FF] font-bold hover:underline underline-offset-4"
                    >
                      Sign in
                    </Link>
                  </>
                ) : step === 2 ? (
                  "Tell us what you'd like to study."
                ) : (
                  "Tell us how you'd like to pay and study."
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <AnimatePresence mode="wait">
                {/* ══ STEP 1: Account Details ══ */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full bg-white px-5 py-4 border-2 border-slate-300 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-[#0061FF]/5 focus:border-[#0061FF] text-slate-900 transition-all placeholder:text-slate-300 font-medium"
                          placeholder="Your first name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full bg-white px-5 py-4 border-2 border-slate-300 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-[#0061FF]/5 focus:border-[#0061FF] text-slate-900 transition-all placeholder:text-slate-300 font-medium"
                          placeholder="Your last name"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full bg-white px-5 py-4 border-2 border-slate-300 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-[#0061FF]/5 focus:border-[#0061FF] text-slate-900 transition-all placeholder:text-slate-300 font-medium"
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={formData.showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          className="w-full bg-white px-5 py-4 border-2 border-slate-300 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-[#0061FF]/5 focus:border-[#0061FF] text-slate-900 transition-all placeholder:text-slate-300 font-medium"
                          placeholder="Min. 6 characters"
                          minLength={6}
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              showPassword: !formData.showPassword,
                            })
                          }
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {formData.showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleStep1Next}
                      className="w-full rounded-[1.25rem] bg-slate-900 hover:bg-black text-white h-14 font-bold text-sm tracking-tight transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-xl shadow-slate-200"
                    >
                      Continue to Course Selection
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                )}

                {/* ══ STEP 2: Course Selection ══ */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="space-y-6"
                  >
                    {/* International internship callout */}
                    <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#0061FF]/8 to-indigo-50 border border-[#0061FF]/20 rounded-2xl">
                      <div className="p-2 bg-[#0061FF] rounded-lg shrink-0">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-0.5">
                          International Internship Programme
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          For international internships,{" "}
                          <span className="font-bold text-[#0061FF]">
                            4 courses are required — ₦538,000
                          </span>{" "}
                          (bundled discount, saves ₦62,000).
                        </p>
                      </div>
                    </div>

                    {/* Course list */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                          Available Programmes
                        </label>
                        {count > 0 && (
                          <span className="text-[10px] font-bold text-[#0061FF] bg-[#0061FF]/10 px-2.5 py-1 rounded-full">
                            {count}/4 selected
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {COURSE_CATALOG.map((course) => {
                          const isSelected = formData.selectedCourses.includes(
                            course.title,
                          );
                          return (
                            <button
                              key={course.title}
                              type="button"
                              onClick={() =>
                                toggleCourseSelection(course.title)
                              }
                              className={`group flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 ${
                                isSelected
                                  ? "border-[#0061FF] bg-[#0061FF]/5"
                                  : "border-slate-200 bg-white hover:border-slate-400"
                              }`}
                            >
                              <div className="flex items-center gap-3 text-left">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                    isSelected
                                      ? "bg-[#0061FF] text-white"
                                      : "bg-slate-100 text-slate-300 group-hover:bg-slate-200"
                                  }`}
                                >
                                  {isSelected ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <GraduationCap className="w-4 h-4" />
                                  )}
                                </div>
                                <div>
                                  <span
                                    className={`text-sm font-bold block ${
                                      isSelected
                                        ? "text-slate-900"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    {course.title}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    ₦150,000
                                  </span>
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-[#0061FF] shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Running price summary */}
                    {count > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl border-2 ${
                          isBundle
                            ? "border-green-400 bg-green-50"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                              {isBundle
                                ? "Bundle Price (4 courses)"
                                : `${count} course${count > 1 ? "s" : ""} selected`}
                            </p>
                            {isBundle && (
                              <p className="text-[11px] text-green-600 font-semibold mt-0.5">
                                You save ₦62,000 🎉
                              </p>
                            )}
                          </div>
                          <p
                            className={`text-2xl font-bold tracking-tight ${
                              isBundle ? "text-green-700" : "text-slate-900"
                            }`}
                          >
                            ₦{enrollmentPrice.toLocaleString("en-NG")}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <Button
                      type="button"
                      onClick={handleStep2Next}
                      disabled={count === 0}
                      className="w-full rounded-[1.25rem] bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white h-14 font-bold text-sm tracking-tight transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-xl shadow-slate-200"
                    >
                      Continue to Preferences
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                )}

                {/* ══ STEP 3: Payment & Training Preferences ══ */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="space-y-8"
                  >
                    {/* Payment Method - single select */}
                    <div className="space-y-4">
                      <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">
                        Scholarship &amp; Tuition
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {["Full Payment", "Installmental Payment"].map(
                          (method) => {
                            const isSelected =
                              formData.paymentMethod[0] === method;
                            return (
                              <button
                                key={method}
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    paymentMethod: isSelected ? [] : [method],
                                  })
                                }
                                className={`p-6 rounded-[1.5rem] border-2 text-center transition-all duration-300 ${
                                  isSelected
                                    ? "border-[#0061FF] bg-[#0061FF]/5 shadow-lg shadow-[#0061FF]/5"
                                    : "border-slate-300 bg-white hover:border-[#0061FF]"
                                }`}
                              >
                                <div
                                  className={`w-10 h-10 rounded-2xl mx-auto mb-3 flex items-center justify-center transition-all ${
                                    isSelected
                                      ? "bg-[#0061FF] text-white rotate-3"
                                      : "bg-slate-50 text-slate-300"
                                  }`}
                                >
                                  <CreditCard className="w-5 h-5" />
                                </div>
                                <span
                                  className={`text-sm font-bold tracking-tight block ${
                                    isSelected
                                      ? "text-slate-900"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {method}
                                </span>
                              </button>
                            );
                          },
                        )}
                      </div>
                    </div>
                    {/* Training Mode - single select */}
                    <div className="space-y-4">
                      <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">
                        Preferred Training Mode
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {["Physical", "Virtual", "Distance Learning"].map(
                          (method) => {
                            const isSelected =
                              formData.trainingMethod[0] === method;
                            return (
                              <button
                                key={method}
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    trainingMethod: isSelected ? [] : [method],
                                  })
                                }
                                className={`py-4 px-2 rounded-[1.25rem] border-2 text-center transition-all duration-300 ${
                                  isSelected
                                    ? "border-slate-600 bg-slate-900 text-white"
                                    : "border-slate-300 bg-white text-slate-400 hover:border-slate-500"
                                }`}
                              >
                                <span className="text-[10px] font-extrabold uppercase tracking-tighter block">
                                  {method}
                                </span>
                              </button>
                            );
                          },
                        )}
                      </div>
                    </div>
                    {/* Order Summary */}\
                    <div className="flex flex-col gap-3">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-[1.25rem] bg-[#0061FF] hover:bg-[#0052E6] disabled:bg-[#0061FF]/50 text-white h-14 font-bold text-sm tracking-tight transition-all hover:scale-[1.01] active:scale-[0.99] shadow-2xl shadow-[#0061FF]/20"
                      >
                        {loading
                          ? "Processing Enrollment…"
                          : "Complete Enrollment"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { register } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { COURSE_CATALOG } from "@/data/courseCatalog";
import { useToast } from "@/components/ui/toast";
import {
  GraduationCap,
  ArrowLeft,
  Check,
  ChevronRight,
  Plane,
  Shield,
  CreditCard,
  Star,
  ArrowRight,
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
            (course) => course !== courseTitle,
          ),
        };
      }

      if (current.selectedCourses.length >= 4) {
        toast("You can select at most 4 courses", "error");
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
      text: "The best decision I made for my career. The training is standard.",
      image:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200&h=200",
    },
    {
      name: "Tunde Bakare",
      role: "Flight Student",
      text: "Excellent instructors and very professional environment.",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200",
    },
    {
      name: "Amina Yusuf",
      role: "Graduate",
      text: "Highly recommended for anyone serious about aviation in Nigeria.",
      image:
        "https://images.unsplash.com/photo-1567532939604-b6c5b0ad2e01?auto=format&fit=crop&q=80&w=200&h=200",
    },
  ];
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const nextTestimonial = () =>
    setTestimonialIdx((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () =>
    setTestimonialIdx(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.password ||
        formData.selectedCourses.length === 0
      ) {
        toast("Please fill in all required fields", "error");
        setLoading(false);
        return;
      }

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

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden relative">
      {/* Background Glow for Form Side */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#0061FF]/[0.02] pointer-events-none z-0" />

      {/* Left Panel: Cinematic Hero with Enriched UI */}
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
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-900/60 to-transparent" />
        </motion.div>

        {/* The Enriched Container (Rounded Style) */}
        <div className="absolute inset-4 overflow-hidden ">
          {/* Top Micro-UI: Now "Go Home" */}
          <div className="absolute top-8 left-8 right-8 z-20">
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
          <div className="absolute inset-0 flex flex-col justify-center px-12 z-10 pt-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h1 className="text-4xl xl:text-5xl font-semibold tracking-tighter text-white mb-6 leading-[1.05]">
                Master the Skies with <br /> Precision and{" "}
                <span className="italic text-[#0061FF]">Elite</span> Pedigree.
              </h1>
              <p className="text-white/60 text-lg leading-relaxed max-w-sm font-medium">
                Our legacy is built on the success of thousands of pilots
                worldwide.
              </p>
            </motion.div>
          </div>

          {/* Floating Success Card Carousel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-8 left-8 z-20"
            >
              <div className="bg-black/30 backdrop-blur-2xl p-5 rounded-[1.5rem] border border-white/10 flex items-center gap-4 max-w-[320px]">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0061FF] to-indigo-500 overflow-hidden border border-white/20">
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
                  {/* <p className="text-white/80 text-[10px] mt-2 line-clamp-2 italic">
                    "{testimonials[testimonialIdx].text}"
                  </p> */}
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

          {/* Bottom Nav Carousel Buttons */}
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

        {/* The Curved Cutout Effect on the right side of the image panel */}
        <div
          className="absolute top-0 right-0 h-full w-24 bg-white z-20 pointer-events-none"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%, 100% 0)" }}
        />
      </div>

      {/* Right Panel: Form Content (Preserved) */}
      <div className="flex-1 lg:h-screen overflow-y-auto z-10 bg-white">
        <div className="max-w-xl mx-auto px-6 py-12 lg:py-24">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-12">
              {/* Conditional Nav: Back to Step 1 or Placeholder */}
              <div className="min-w-[120px]">
                {step === 2 && (
                  <button
                    onClick={() => setStep(1)}
                    className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full border border-slate-500 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold tracking-widest uppercase text-slate-900">
                      Step 1
                    </span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 shadow-sm bg-white p-2 rounded-full border border-slate-500">
                {[1, 2].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                      step === s ? "w-10 bg-[#0061FF]" : "w-4 bg-slate-100"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mb-12">
              <div className="inline-block px-3 py-1 bg-[#0061FF]/10 text-[#0061FF] text-[10px] font-black uppercase tracking-widest rounded-md mb-4">
                Step {step} of 2
              </div>
              <h2 className="text-4xl font-semibold tracking-tighter text-slate-900 mb-2">
                Begin Your Journey
              </h2>
              <p className="text-sm text-slate-400 font-medium">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#0061FF] font-bold hover:underline underline-offset-4"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
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
                          className="w-full bg-white px-5 py-4 border-2 border-slate-500 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-[#0061FF]/5 focus:border-[#0061FF] text-slate-900 transition-all placeholder:text-slate-300 font-medium"
                          placeholder="Your first name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
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
                          className="w-full bg-white px-5 py-4 border-2 border-slate-500 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-[#0061FF]/5 focus:border-[#0061FF] text-slate-900 transition-all placeholder:text-slate-300 font-medium"
                          placeholder="Your last name"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                        Professional Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full bg-white px-5 py-4 border-2 border-slate-500 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-[#0061FF]/5 focus:border-[#0061FF] text-slate-900 transition-all placeholder:text-slate-300 font-medium"
                        placeholder="email@aviation.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                        Secure Password
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full bg-white px-5 py-4 border-2 border-slate-500 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-[#0061FF]/5 focus:border-[#0061FF] text-slate-900 transition-all placeholder:text-slate-300 font-medium"
                        placeholder="••••••••"
                        minLength={6}
                        required
                      />
                    </div>

                    <div className="space-y-4 pt-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                        Course Interest
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {COURSE_CATALOG.slice(0, 4).map((course) => {
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
                              className={`group flex items-center justify-between p-5 rounded-[1.25rem] border-2 transition-all duration-300 ${
                                isSelected
                                  ? "border-[#0061FF] bg-[#0061FF]/5 shadow-lg shadow-[#0061FF]/5"
                                  : "border-slate-500 bg-white hover:border-[#0061FF] hover:shadow-xl hover:shadow-slate-200/50"
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                    isSelected
                                      ? "bg-[#0061FF] text-white rotate-6"
                                      : "bg-slate-50 text-slate-300 group-hover:bg-slate-100"
                                  }`}
                                >
                                  {isSelected ? (
                                    <Check className="w-5 h-5" />
                                  ) : (
                                    <Plane className="w-5 h-5" />
                                  )}
                                </div>
                                <div className="text-left">
                                  <span
                                    className={`text-[14px] font-bold tracking-tight block ${
                                      isSelected
                                        ? "text-slate-900"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    {course.title}
                                  </span>
                                  <span className="text-[10px] text-slate-300 font-medium uppercase tracking-tighter">
                                    Professional Track
                                  </span>
                                </div>
                              </div>
                              <ArrowRight
                                className={`w-4 h-4 transition-all duration-300 ${
                                  isSelected
                                    ? "opacity-100 translate-x-0"
                                    : "opacity-0 -translate-x-4"
                                } text-[#0061FF]`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => {
                        if (
                          formData.firstName &&
                          formData.lastName &&
                          formData.email &&
                          formData.password &&
                          formData.selectedCourses.length > 0
                        ) {
                          setStep(2);
                        } else {
                          toast("Complete all fields to proceed", "info");
                        }
                      }}
                      className="w-full rounded-[1.25rem] bg-slate-900 hover:bg-black text-white h-16 font-bold text-sm tracking-tight transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-2xl shadow-slate-200"
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                        Scholarship & Tuition
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {["Full Payment", "Installmental Payment"].map(
                          (method) => {
                            const isSelected =
                              formData.paymentMethod.includes(method);
                            return (
                              <button
                                key={method}
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    paymentMethod: isSelected
                                      ? formData.paymentMethod.filter(
                                          (m) => m !== method,
                                        )
                                      : [...formData.paymentMethod, method],
                                  });
                                }}
                                className={`p-8 rounded-[1.5rem] border-2 text-center transition-all duration-300 ${
                                  isSelected
                                    ? "border-[#0061FF] bg-[#0061FF]/5 shadow-lg shadow-[#0061FF]/5"
                                    : "border-slate-500 bg-white hover:border-[#0061FF] hover:shadow-xl hover:shadow-slate-200/50"
                                }`}
                              >
                                <div
                                  className={`w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all ${
                                    isSelected
                                      ? "bg-[#0061FF] text-white rotate-3"
                                      : "bg-slate-50 text-slate-300"
                                  }`}
                                >
                                  <CreditCard className="w-5 h-5" />
                                </div>
                                <span
                                  className={`text-[14px] font-bold tracking-tight block ${
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

                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                        Preferred Training Mode
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {["Physical", "Virtual", "Distance Learning"].map(
                          (method) => {
                            const isSelected =
                              formData.trainingMethod.includes(method);
                            return (
                              <button
                                key={method}
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    trainingMethod: isSelected
                                      ? formData.trainingMethod.filter(
                                          (m) => m !== method,
                                        )
                                      : [...formData.trainingMethod, method],
                                  });
                                }}
                                className={`py-4 px-2 rounded-[1.25rem] border-2 text-center transition-all duration-300 ${
                                  isSelected
                                    ? "border-slate-500 bg-slate-900 text-white"
                                    : "border-slate-500 bg-white hover:border-slate-100 text-slate-400"
                                }`}
                              >
                                <span
                                  className={`text-[10px] font-black uppercase tracking-tighter block`}
                                >
                                  {method}
                                </span>
                              </button>
                            );
                          },
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-[1.25rem] bg-[#0061FF] hover:bg-[#0052E6] text-white h-16 font-bold text-sm tracking-tight transition-all hover:scale-[1.01] active:scale-[0.99] shadow-2xl shadow-[#0061FF]/20"
                      >
                        {loading
                          ? "Processing Academy File..."
                          : "Finalize Enrollment"}
                      </Button>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-slate-900 transition-colors"
                      >
                        Back to Identity
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-xs text-slate-400 font-medium">
                Member of the Academy?{" "}
                <Link
                  to="/login"
                  className="text-[#0061FF] font-bold hover:underline underline-offset-4"
                >
                  Sign In here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

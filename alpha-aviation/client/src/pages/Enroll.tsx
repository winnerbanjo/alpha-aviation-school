import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PhoneNumberInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "@/lib/phone";
import { register } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { COURSE_CATALOG, computeEnrollmentPrice } from "@/data/courseCatalog";
import { useToast } from "@/components/ui/use-toast";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  ArrowLeft,
  Check,
  Star,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Award,
} from "lucide-react";
import { asApiError } from "@/lib/errors";
import { EnrollSEO } from "@/components/seo/SEO";

export function Enroll() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    showPassword: false,
    selectedCourses: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  const toggleCourseSelection = (courseTitle: string) => {
    if (
      !formData.selectedCourses.includes(courseTitle) &&
      formData.selectedCourses.length >= 4
    ) {
      toast("Maximum 4 courses — unselect one to swap", "error");
      return;
    }
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
      !formData.phone ||
      !formData.password
    ) {
      toast("Please fill in all fields to continue", "error");
      return;
    }
    if (formData.password.length < 6) {
      toast("Password must be at least 6 characters", "error");
      return;
    }
    if (!isValidPhoneNumber(formData.phone)) {
      toast("Please enter a valid phone number", "error");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.selectedCourses.length === 0) {
      toast("Select at least one course to continue", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        selectedCourses: formData.selectedCourses,
        role: "student",
      });

      if (response?.success && response?.data?.token) {
        login(
          {
            id: response.data.user.id || response.data.user._id,
            email: response.data.user.email,
            role: response.data.user.role,
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            phone: response.data.user.phone,
            enrolledCourse: response.data.user.enrolledCourse,
            selectedCourses: response.data.user.selectedCourses,
            courseSelections: response.data.user.courseSelections,
            paymentStatus: response.data.user.paymentStatus,
            amountDue: response.data.user.amountDue,
            amountPaid: response.data.user.amountPaid,
            totalCoursePrice: response.data.user.totalCoursePrice,
            enrollmentDate: response.data.user.enrollmentDate,
            emergencyContact: response.data.user.emergencyContact,
            bio: response.data.user.bio,
            documentUrl: response.data.user.documentUrl,
            status: response.data.user.status,
            paymentReceiptUrl: response.data.user.paymentReceiptUrl,
            studentIdNumber: response.data.user.studentIdNumber,
            adminClearance: response.data.user.adminClearance,
          },
          response.data.token,
        );

        toast("Account created successfully!", "success");
        navigate("/dashboard", { replace: true });
      } else if (response?.success && response?.data?.requiresVerification) {
        // The password travels in router state, never in the URL (history, logs, referrers).
        navigate(
          `/verify-otp?purpose=enrollment&email=${encodeURIComponent(formData.email)}&firstName=${encodeURIComponent(formData.firstName)}&lastName=${encodeURIComponent(formData.lastName)}&phone=${encodeURIComponent(formData.phone)}&courses=${encodeURIComponent(JSON.stringify(formData.selectedCourses))}`,
          { replace: true, state: { password: formData.password } },
        );
        toast("Verification code sent to your email!", "success");
      } else {
        toast("Registration failed. Please try again.", "error");
      }
    } catch (caught) {
      const err = asApiError(caught);
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

  const leftPanelText = [
    {
      heading: (
        <>
          Your career in aviation{" "}
          <span className="text-gradient-sky">starts here.</span>
        </>
      ),
      sub: "Create your account in seconds. No commitment yet — just your details.",
    },
    {
      heading: (
        <>
          Choose your{" "}
          <span className="text-gradient-sky">path to success.</span>
        </>
      ),
      sub: "Select up to 4 courses. Pick all 4 to unlock the international internship bundle.",
    },
  ];

  return (
    <AuthShell
      eyebrow="Student enrollment"
      title={leftPanelText[step - 1].heading}
      description={leftPanelText[step - 1].sub}
      heroKey={step}
      video="aviation-instruction"
      wide
      facts={[
        { label: "Tuition", value: "₦150,000 per course" },
        { label: "4-course bundle", value: "₦538,000" },
        { label: "Duration", value: "4 weeks" },
      ]}
      panelFooter={
        <div className="flex items-end justify-between gap-6">
          {/* Testimonial Carousel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="glass flex max-w-[320px] items-center gap-4 rounded-2xl p-4">
                <div className="relative shrink-0">
                  <div className="h-14 w-14 overflow-hidden rounded-full border border-white/20">
                    <img
                      src={testimonials[testimonialIdx].image}
                      alt={testimonials[testimonialIdx].name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-[#07152E] bg-[#1246C8] p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-tight text-white">
                    {testimonials[testimonialIdx].name}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-white/60">
                    {testimonials[testimonialIdx].role}
                  </p>
                  <div className="mt-2 flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="h-2.5 w-2.5 fill-[#8EAEFF] text-[#8EAEFF]"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex shrink-0 gap-2">
            <button
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/60 transition-all hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextTestimonial}
              aria-label="Next testimonial"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      }
    >
      <EnrollSEO />
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Top nav */}
            <div className="mb-8 flex items-center justify-between">
              <div className="min-w-[100px]">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="group flex items-center gap-2.5 text-[#53647C] transition-colors hover:text-[#10264B]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DCE2EB] transition-all group-hover:border-[#10264B] group-hover:bg-[#10264B] group-hover:text-white">
                      <ArrowLeft className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                      Step {step - 1}
                    </span>
                  </button>
                )}
              </div>
              {/* Step dots */}
              <div className="flex items-center gap-1.5 rounded-full border border-[#DCE2EB] bg-white p-2 shadow-subtle">
                {[1, 2].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                      step === s
                        ? "w-10 bg-[#1246C8]"
                        : step > s
                          ? "w-4 bg-[#1246C8]/30"
                          : "w-4 bg-[#DCE2EB]"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step label */}
            <div className="mb-10">
              <span className="eyebrow text-[#1246C8]">
                Step {step} of 2 —{" "}
                {step === 1 ? "Create Account" : "Choose Courses"}
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
                {step === 1 ? "Begin your journey" : "Select your programme"}
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-[#53647C]">
                {step === 1 ? (
                  <>
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-[#1246C8] underline-offset-4 transition-colors hover:text-[#10264B] hover:underline"
                    >
                      Sign in
                    </Link>
                  </>
                ) : (
                  "Tell us what you'd like to study."
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
                      <div>
                        <label htmlFor="enroll-first-name" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                          First Name
                        </label>
                        <input
                          id="enroll-first-name"
                          type="text"
                          autoComplete="given-name"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                          placeholder="Your first name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="enroll-last-name" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                          Last Name
                        </label>
                        <input
                          id="enroll-last-name"
                          type="text"
                          autoComplete="family-name"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                          placeholder="Your last name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="enroll-email" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                        Email Address
                      </label>
                      <input
                        id="enroll-email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="enroll-phone" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                        Phone Number
                      </label>
                      <PhoneNumberInput
                        id="enroll-phone"
                        value={formData.phone}
                        onChange={(phone) =>
                          setFormData({ ...formData, phone })
                        }
                        required
                        inputClassName="border-[#DCE2EB] bg-white text-[#172B49] placeholder:text-[#8C9AB0]"
                      />
                    </div>

                    <div>
                      <label htmlFor="enroll-password" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="enroll-password"
                          type={formData.showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-[#DCE2EB] bg-white py-3 pl-4 pr-12 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10"
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
                          aria-label={formData.showPassword ? "Hide password" : "Show password"}
                          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#53647C] transition-colors hover:bg-[#F5F7FB] hover:text-[#1246C8]"
                        >
                          {formData.showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleStep1Next}
                      className="group mt-2 h-12 w-full"
                    >
                      Continue to Course Selection
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                    <div className="flex items-start gap-4 rounded-2xl border border-[#1246C8]/15 bg-[#DCE8FF]/50 p-4 sm:p-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1246C8]">
                        <Award className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-semibold text-[#10264B]">
                          International Internship Programme
                        </p>
                        <p className="text-[13px] leading-relaxed text-[#53647C]">
                          For international internships,{" "}
                          <span className="font-semibold text-[#1246C8]">
                            4 courses are required — ₦538,000
                          </span>{" "}
                          (bundled discount, saves ₦62,000).
                        </p>
                      </div>
                    </div>

                    {/* Course list */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]">
                          Available Programmes
                        </label>
                        {count > 0 && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCE8FF] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#1246C8]">
                            {count}/4 selected
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
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
                              aria-pressed={isSelected}
                              className={`group flex items-center justify-between gap-3 rounded-2xl border p-4 transition-all duration-200 ${
                                isSelected
                                  ? "border-[#1246C8] bg-[#DCE8FF]/40 shadow-subtle ring-4 ring-[#1246C8]/10"
                                  : "border-[#DCE2EB] bg-white hover:border-[#1246C8]/40 hover:shadow-subtle"
                              }`}
                            >
                              <div className="flex items-center gap-3 text-left">
                                <div
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all ${
                                    isSelected
                                      ? "bg-[#1246C8] text-white"
                                      : "bg-[#F5F7FB] text-[#53647C] group-hover:bg-[#DCE8FF] group-hover:text-[#1246C8]"
                                  }`}
                                >
                                  {isSelected ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <GraduationCap className="h-4 w-4" />
                                  )}
                                </div>
                                <div>
                                  <span
                                    className={`block text-sm font-semibold leading-snug ${
                                      isSelected
                                        ? "text-[#10264B]"
                                        : "text-[#172B49]"
                                    }`}
                                  >
                                    {course.title}
                                  </span>
                                  <span className="mt-0.5 block text-[12px] tabular-nums text-[#53647C]">
                                    ₦150,000
                                  </span>
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="h-4 w-4 shrink-0 text-[#1246C8]" />
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
                        className={`overflow-hidden rounded-2xl border ${
                          isBundle
                            ? "border-emerald-200 bg-emerald-50/70"
                            : "border-[#DCE2EB] bg-[#F5F7FB]"
                        }`}
                      >
                        <div className="flex items-stretch">
                          <div className="min-w-0 flex-1 p-5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#53647C]">
                              {isBundle
                                ? "Bundle Price (4 courses)"
                                : `${count} course${count > 1 ? "s" : ""} selected`}
                            </p>
                            {isBundle && (
                              <p className="mt-1 text-[12px] font-semibold text-emerald-700">
                                You save ₦62,000 🎉
                              </p>
                            )}
                            <div aria-hidden="true" className="barcode mt-4 h-8 w-32 rounded-sm opacity-80" />
                          </div>
                          <div className="flex flex-col justify-center border-l-2 border-dashed border-[#DCE2EB] bg-white/60 px-5 py-5 text-right sm:px-7">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#53647C]">
                              Total
                            </p>
                            <p
                              className={`mt-1 text-2xl font-bold tracking-tightest tabular-nums sm:text-3xl ${
                                isBundle ? "text-emerald-700" : "text-[#10264B]"
                              }`}
                            >
                              ₦{enrollmentPrice.toLocaleString("en-NG")}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      disabled={count === 0 || loading}
                      className="h-12 w-full"
                    >
                      {loading
                        ? "Processing Enrollment…"
                        : "Complete Enrollment"}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
    </AuthShell>
  );
}

import React, { useState } from "react";
import { siteConfig } from "@/lib/site-config";
import { PrimaryButton } from "@/components/ui/Buttons";
import { sendContactMessage } from "@/api";

export function ContactForm() {
  const [officeTarget, setOfficeTarget] = useState<string>("uk");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("General Institutional Enquiry");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Please provide your name";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please provide a valid email";
    }
    if (!phone.trim()) errs.phone = "Please provide a phone number we can reach you on";
    if (!message.trim()) errs.message = "Please include your message or inquiry";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const deskLabel = officeTarget === "uk" ? "UK Headquarters" : "Nigerian Hub";

  // Sends through the school's existing contact endpoint (POST /auth/contact).
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSending) return;
    setIsSending(true);
    setSendError("");
    try {
      await sendContactMessage({
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: `[${subject}] Attention: ASL ${deskLabel}\n\n${message.trim()}`,
      });
      setIsSubmitted(true);
    } catch (err) {
      const apiMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSendError(apiMessage || "We couldn't send your message just now. Please try again or email us directly.");
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setMessage("");
  };

  const mailtoSubject = encodeURIComponent(`[${subject}] From ${fullName}`);
  const mailtoBody = encodeURIComponent(
    `Attention: ASL ${officeTarget === "uk" ? "UK Headquarters" : "Nigerian Hub"}\n\nName: ${fullName}\nEmail: ${email}\nPhone: ${phone || "N/A"}\n\nMessage:\n${message}`
  );
  const mailtoUrl = `mailto:${siteConfig.primaryEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <div className="bg-white rounded-stage border border-[#DCE2EB] p-6 sm:p-10 shadow-elevated">
      {isSubmitted ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#10264B]">
            Message sent
          </h3>
          <p className="text-sm text-[#53647C] max-w-md mx-auto">
            Thank you, {fullName.trim().split(" ")[0] || "there"}. Our {deskLabel} admissions desk has your message and will reply to {email} within 24 business hours.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <PrimaryButton type="button" variant="outline" onClick={resetForm}>
              Send another message
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#1246C8] block mb-1">
              DESTINATION DESK
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOfficeTarget("uk")}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  officeTarget === "uk"
                    ? "border-[#1246C8] bg-[#DCE8FF]/40 text-[#1246C8] font-bold"
                    : "border-[#DCE2EB] text-[#53647C] hover:border-[#1246C8]/40"
                }`}
              >
                UK HEADQUARTERS
                <span className="block text-[10px] opacity-70 font-normal mt-0.5">Ruislip, London</span>
              </button>

              <button
                type="button"
                onClick={() => setOfficeTarget("ng")}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  officeTarget === "ng"
                    ? "border-[#1246C8] bg-[#DCE8FF]/40 text-[#1246C8] font-bold"
                    : "border-[#DCE2EB] text-[#53647C] hover:border-[#1246C8]/40"
                }`}
              >
                NIGERIAN CENTER
                <span className="block text-[10px] opacity-70 font-normal mt-0.5">Ilasamaja, Lagos</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#10264B] mb-1 uppercase">
                Your Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-4 py-3 rounded-xl border border-[#DCE2EB] bg-[#F5F7FB] transition-colors focus:bg-white text-sm text-[#10264B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1246C8]"
              />
              {errors.fullName && (
                <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#10264B] mb-1 uppercase">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full px-4 py-3 rounded-xl border border-[#DCE2EB] bg-[#F5F7FB] transition-colors focus:bg-white text-sm text-[#10264B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1246C8]"
              />
              {errors.email && (
                <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#10264B] mb-1 uppercase">
                Telephone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 ... or +44 ..."
                className="w-full px-4 py-3 rounded-xl border border-[#DCE2EB] bg-[#F5F7FB] transition-colors focus:bg-white text-sm text-[#10264B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1246C8]"
              />
              {errors.phone && (
                <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#10264B] mb-1 uppercase">
                Inquiry Topic
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#DCE2EB] bg-[#F5F7FB] transition-colors focus:bg-white text-sm text-[#10264B] bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1246C8]"
              >
                <option value="General Institutional Enquiry">General Institutional Enquiry</option>
                <option value="Program Enrollment & Cohorts">Program Enrollment & Cohorts</option>
                <option value="Corporate / Airline Staff Training">Corporate / Airline Staff Training</option>
                <option value="International Corridors & Pathways">International Corridors & Pathways</option>
                <option value="Certificate Verification">Certificate Verification</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#10264B] mb-1 uppercase">
              Message / Inquiries *
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can our admissions or academic office assist you?"
              className="w-full px-4 py-3 rounded-xl border border-[#DCE2EB] bg-[#F5F7FB] transition-colors focus:bg-white text-sm text-[#10264B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1246C8]"
            />
            {errors.message && (
              <p className="text-[11px] text-red-600 mt-1">{errors.message}</p>
            )}
          </div>

          {sendError && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {sendError}{" "}
              <a href={mailtoUrl} className="font-semibold underline underline-offset-4">
                Email {siteConfig.primaryEmail}
              </a>
            </p>
          )}

          <div className="flex items-center justify-between gap-4 pt-2">
            <span className="text-[11px] text-[#53647C]">
              DIRECT DESK: {siteConfig.primaryEmail}
            </span>
            <PrimaryButton type="submit" arrow disabled={isSending} className="pr-3">
              {isSending ? "Sending…" : "Send message"}
            </PrimaryButton>
          </div>
        </form>
      )}
    </div>
  );
}

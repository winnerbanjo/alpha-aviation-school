import React from "react";
import { Link } from "react-router-dom";
import { Container } from "@/components/ui/Container";
import { revealDelay } from "@/lib/utils";

const steps = [
  {
    code: "01",
    waypoint: "Explore",
    title: "Explore the programs",
    desc: "Review seven course tracks across ticketing, passenger services, hospitality and travel management.",
    linkText: "Browse curricula",
    linkHref: "/courses",
  },
  {
    code: "02",
    waypoint: "Plan",
    title: "Choose your route",
    desc: "Take one program at ₦150,000, or any four as the international career track for ₦538,000.",
    linkText: "Compare programs",
    linkHref: "/courses",
  },
  {
    code: "03",
    waypoint: "Check in",
    title: "Enroll online",
    desc: "Create your student account, select your programs and settle tuition securely from your student dashboard.",
    linkText: "Start enrollment",
    linkHref: "/enroll",
  },
  {
    code: "04",
    waypoint: "Board",
    title: "Talk with admissions",
    desc: "Our admissions team in Ruislip or Lagos discusses your requirements and the next steps with you.",
    linkText: "Contact admissions",
    linkHref: "/contact",
  },
];

export function StudentJourneySection() {
  return (
    <section aria-labelledby="journey-title" className="relative overflow-hidden bg-white py-24 sm:py-32">
      <Container>
        <div className="mx-auto mb-16 max-w-3xl text-center sm:mb-20">
          <span data-reveal className="eyebrow justify-center text-[#1246C8]">Admissions journey</span>
          <h2 id="journey-title" data-reveal style={revealDelay(80)} className="mt-5 text-[34px] font-bold leading-[1.05] tracking-tightest text-[#10264B] sm:text-5xl lg:text-[56px]">
            From first look <span className="text-gradient-blue">to first class.</span>
          </h2>
          <p data-reveal style={revealDelay(160)} className="mx-auto mt-5 max-w-2xl text-base leading-[1.7] text-[#53647C] sm:text-lg">
            A clear, honest four-step path with guidance from real advisors — no automated debits or placement promises.
          </p>
        </div>

        <div className="relative">
          {/* Flight path line (desktop) */}
          <div aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-[27px] hidden lg:block">
            <div className="h-px w-full border-t-2 border-dashed border-[#DCE2EB]" />
            <div data-reveal="line" className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#1246C8] to-[#5B86FF]" />
          </div>

          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {steps.map((step, i) => (
              <li key={step.code} data-reveal style={revealDelay(200 + i * 150)} className="relative">
                <div className="flex items-center gap-4 lg:flex-col lg:text-center">
                  <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-white bg-[#10264B] text-sm font-bold text-white shadow-elevated">
                    {step.code}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1246C8]">{step.waypoint}</span>
                </div>
                <div className="group mt-6 rounded-panel border border-[#DCE2EB] bg-[#F5F7FB] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[#1246C8]/40 hover:bg-white hover:shadow-elevated">
                  <h3 className="text-lg font-bold tracking-tight text-[#10264B]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#53647C]">{step.desc}</p>
                  <Link to={step.linkHref} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1246C8] hover:text-[#10264B]">
                    {step.linkText}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

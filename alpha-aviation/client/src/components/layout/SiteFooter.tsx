import React from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "@/lib/site-config";
import { programsData } from "@/lib/programs";
import { PrimaryButton } from "@/components/ui/Buttons";
import { BrandLogo } from "@/components/layout/BrandLogo";

const institutionLinks = [
  { label: "About Alpha Step Links", href: "/about" },
  { label: "Student experience", href: "/student-experience" },
  { label: "International opportunities", href: "/international-opportunities" },
  { label: "Admissions FAQs", href: "/faqs" },
  { label: "Contact & locations", href: "/contact" },
  { label: "Enroll & tuition", href: "/enroll" },
  { label: "Student login", href: "/login" },
  { label: "Agent portal", href: "/agent/login" },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const offices = [siteConfig.offices.uk, siteConfig.offices.nigeria];

  return (
    <footer className="relative isolate overflow-hidden bg-[#07152E] text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-chart-grid mask-fade-b opacity-70" />
        <div className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-[#1246C8]/30 blur-[120px]" />
      </div>

      {/* Closing statement */}
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <div className="flex flex-col justify-between gap-10 border-b border-white/10 pb-16 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow text-[#8EAEFF]">Alpha Step Links Aviation School</p>
            <p className="mt-6 max-w-3xl text-[40px] font-bold leading-[1.02] tracking-tightest sm:text-6xl lg:text-7xl">
              A clear direction <span className="text-gradient-sky">forward.</span>
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <PrimaryButton href="/enroll" size="lg" arrow>
              Enroll now
            </PrimaryButton>
            <PrimaryButton href="/courses" size="lg" variant="glass">
              Explore programs
            </PrimaryButton>
          </div>
        </div>

        {/* Directory */}
        <div className="grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-6 lg:col-span-4">
            <Link to="/" aria-label="Alpha Step Links Aviation School home" className="inline-block">
              <BrandLogo tone="white" className="w-[260px]" />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-[#DCE8FF]/65">
              IATA-aligned professional training in airline ticketing, GDS operations, passenger services, hospitality and travel management — taught in Lagos and live online, with UK headquarters in Ruislip.
            </p>
            <div className="flex flex-wrap gap-2">
              {siteConfig.socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/80 transition-colors hover:border-white hover:bg-white hover:text-[#07152E]"
                >
                  {social.platform}
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8EAEFF]">Programs</h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {programsData.map((prog) => (
                <li key={prog.slug}>
                  <Link to={`/courses/${prog.slug}`} className="text-white/70 transition-colors hover:text-white">
                    {prog.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8EAEFF]">Institution</h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {institutionLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-white/70 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 lg:col-span-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8EAEFF]">Admissions desks</h3>
            {offices.map((office) => (
              <div key={office.badge} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="flex items-center gap-2 text-xs font-semibold text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {office.badge}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/55">{office.addressLines.join(", ")}</p>
                <a href={`tel:${office.phoneRaw}`} className="mt-2 inline-block text-sm font-semibold text-white hover:text-[#8EAEFF]">
                  {office.phone}
                </a>
              </div>
            ))}
            <a href={`mailto:${siteConfig.primaryEmail}`} className="inline-block break-all text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
              {siteConfig.primaryEmail}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-white/45 sm:px-6 md:flex-row lg:px-8">
          <p>© {currentYear} Alpha Step Links Aviation School. Alpha Step Links is the parent brand.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to="/privacy-policy" className="hover:text-white">Privacy policy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/faqs" className="hover:text-white">FAQs</Link>
            <Link to="/contact" className="hover:text-white">Offices</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

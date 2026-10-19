import { ContactSEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { PrimaryButton } from "@/components/ui/Buttons";
import { ContactForm } from "@/components/forms/ContactForm";
import { PageHero } from "@/components/sections/PageHero";
import { siteConfig } from "@/lib/site-config";
import { revealDelay } from "@/lib/utils";


const offices = [
  { code: "LHR", title: "Ruislip, Greater London", office: siteConfig.offices.uk },
  { code: "LOS", title: "Ilasamaja, Lagos", office: siteConfig.offices.nigeria },
];

export function Contact() {
  return (
    <div className="flex flex-col">
      <ContactSEO />
      <PageHero
        breadcrumbs={[{ label: "Contact Us" }]}
        eyebrow="Admissions & campus desks"
        title="Talk to a real"
        accent="admissions advisor."
        description="Questions about curricula, cohort dates, GDS training or tuition? Contact our desks in Ruislip, UK, or Lagos, Nigeria — every enquiry is reviewed within 24 business hours."
        video="aviation-campus"
        facts={[
          { label: "UK desk", value: siteConfig.offices.uk.phone },
          { label: "Nigeria desk", value: siteConfig.offices.nigeria.phone },
          { label: "Email", value: siteConfig.primaryEmail },
          { label: "Response", value: "Within 24 business hours" },
        ]}
      />

      <section className="bg-[#F5F7FB] py-20 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="space-y-5 lg:col-span-5">
              <span data-reveal className="eyebrow text-[#1246C8]">Our locations</span>
              <h2 data-reveal style={revealDelay(80)} className="text-[34px] font-bold leading-[1.05] tracking-tightest text-[#10264B] sm:text-5xl">
                Two desks, <span className="text-gradient-blue">one standard.</span>
              </h2>

              {offices.map(({ code, title, office }, i) => (
                <article
                  key={code}
                  data-reveal
                  style={revealDelay(160 + i * 100)}
                  className="overflow-hidden rounded-stage border border-[#DCE2EB] bg-white shadow-subtle"
                >
                  <div className="flex items-center justify-between bg-[#10264B] px-6 py-5 text-white">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8EAEFF]">{office.badge}</p>
                      <h3 className="mt-1 text-xl font-bold tracking-tight">{title}</h3>
                    </div>
                    <span className="text-3xl font-bold tracking-tightest text-white/90">{code}</span>
                  </div>
                  <div className="grid gap-4 p-6 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">Address</p>
                      <address className="mt-1.5 not-italic leading-relaxed text-[#172B49]">
                        {office.addressLines.map((line) => (
                          <span key={line} className="block">{line}</span>
                        ))}
                      </address>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">Telephone</p>
                        <a href={`tel:${office.phoneRaw}`} className="mt-1 block font-semibold text-[#1246C8] hover:underline">
                          {office.phone}
                        </a>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">Hours</p>
                        <p className="mt-1 text-[#172B49]">{office.officeHours}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-dashed border-[#DCE2EB] px-6 py-4 text-xs text-[#53647C]">
                    <span className="tabular-nums">
                      {office.coordinates.lat}, {office.coordinates.lng}
                    </span>
                    <a href={office.mapUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1246C8] hover:underline">
                      Open in Google Maps ↗
                    </a>
                  </div>
                </article>
              ))}

              <div data-reveal className="rounded-stage bg-[#1246C8] p-6 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">Central admissions mailbox</p>
                <a href={`mailto:${siteConfig.primaryEmail}`} className="mt-2 block break-all text-xl font-bold hover:underline">
                  {siteConfig.primaryEmail}
                </a>
                <p className="mt-2 text-sm text-white/75">Enquiries are reviewed by academic officers within 24 business hours.</p>
                <PrimaryButton href="/enroll" variant="white" size="sm" arrow className="mt-5 pr-3">
                  Use the enquiry form
                </PrimaryButton>
              </div>
            </div>

            <div data-reveal style={revealDelay(120)} className="lg:sticky lg:top-28 lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

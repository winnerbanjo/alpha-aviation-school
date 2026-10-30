import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RouteMap } from "@/components/graphics/RouteMap";
import { PageHero } from "@/components/sections/PageHero";
import { CTAConversionBanner } from "@/components/sections/CTAConversionBanner";
import { siteConfig } from "@/lib/site-config";
import { revealDelay } from "@/lib/utils";


const nodes = [
  {
    code: "LHR",
    tag: "Headquarters",
    title: "United Kingdom headquarters",
    address: siteConfig.offices.uk.addressLines.join(", "),
    body: "Our UK headquarters handles academic policy, curriculum review and admissions support for the school.",
    footer: `Tel ${siteConfig.offices.uk.phone}`,
  },
  {
    code: "LOS",
    tag: "Training centre",
    title: "West Africa training centre",
    address: siteConfig.offices.nigeria.addressLines.join(", "),
    body: "Our in-person training centre, with computer labs for GDS training, passenger check-in practice and regular monthly cohort intakes.",
    footer: `Tel ${siteConfig.offices.nigeria.phone}`,
  },
  {
    code: "YYZ",
    tag: "Advisement",
    title: "Canadian pathway advisory",
    address: "Toronto educational corridor, Ontario, Canada",
    body: "Academic guidance and document evaluation support for graduates planning further aviation management or travel study in Canada.",
    footer: "Academic articulation guidance",
  },
];

const codes = [
  { code: "LOS", label: "Lagos" },
  { code: "LHR", label: "London Heathrow" },
  { code: "YYZ", label: "Toronto Pearson" },
  { code: "PRM", label: "Reduced mobility" },
  { code: "UMNR", label: "Unaccompanied minor" },
  { code: "BSP", label: "Billing & settlement" },
];

export function InternationalOpportunities() {
  return (
    <div className="flex flex-col">
      <SEO title="International Opportunities & Global Corridors" description="Discover the international reach of Alpha Step Links Aviation School: UK headquarters in Ruislip, practical training in Lagos and study-pathway advice for Canada and the UK. IATA-aligned curricula and cross-border career pathways." url="/international-opportunities" />
      <PageHero
        breadcrumbs={[{ label: "International Opportunities" }]}
        eyebrow="Cross-border perspectives"
        title="An international outlook"
        accent="for a borderless industry."
        description="Civil aviation doesn't stop at borders. Alpha Step Links connects UK headquarters with training in Nigeria and academic advisement for Canada."
        video="airport-operations-model"
        facts={[
          { label: "Headquarters", value: "Ruislip, UK" },
          { label: "Training", value: "Lagos, Nigeria" },
          { label: "Advisement", value: "Canada pathway" },
          { label: "Standards", value: "IATA-aligned" },
        ]}
      />

      {/* Route map */}
      <section className="bg-white py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="Global hubs"
            title="Three locations,"
            accent="one connected network."
            description="Select a hub to see its role — from our headquarters in Ruislip to our practical training centre in Lagos and our advisement for Canada."
            align="center"
          />
          <div data-reveal="scale" className="mx-auto max-w-5xl">
            <RouteMap tone="light" />
          </div>
        </Container>
      </section>

      {/* Node profiles */}
      <section className="bg-[#F5F7FB] py-24 sm:py-32">
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            {nodes.map((n, i) => (
              <article
                key={n.code}
                data-reveal
                style={revealDelay(i * 120)}
                className="relative flex flex-col overflow-hidden rounded-stage border border-[#DCE2EB] bg-white p-8"
              >
                <span aria-hidden="true" className="absolute -right-3 -top-6 text-[120px] font-bold leading-none tracking-tightest text-[#F5F7FB]">
                  {n.code}
                </span>
                <span className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1246C8]">{n.tag}</span>
                <h3 className="relative mt-10 text-2xl font-bold tracking-tighter text-[#10264B]">{n.title}</h3>
                <p className="relative mt-2 text-xs leading-relaxed text-[#53647C]">{n.address}</p>
                <p className="relative mt-5 text-sm leading-relaxed text-[#53647C]">{n.body}</p>
                <div className="relative mt-auto pt-6">
                  <p className="border-t border-dashed border-[#DCE2EB] pt-5 text-sm font-semibold text-[#10264B]">{n.footer}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Standards */}
      <section className="relative overflow-hidden bg-[#07152E] py-24 text-white sm:py-32">
        <div aria-hidden="true" className="absolute inset-0 bg-chart-grid opacity-60" />
        <Container className="relative">
          <div className="grid items-center gap-14 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <SectionHeading
                eyebrow="Global regulatory context"
                title="Curricula aligned with"
                accent="international aviation bodies."
                description="Whether you're ticketing a transatlantic flight or coordinating baggage at a regional airport, civil aviation follows shared rules worldwide."
                isDark
                className="mb-8"
              />
              <p data-reveal className="text-base leading-[1.75] text-white/70">
                We teach three-letter IATA airport codes, two-letter airline designators, e-ticket coupon statuses, passenger assistance codes and Billing and Settlement Plan reconciliation used by airlines globally.
              </p>
              <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {codes.map((c, i) => (
                  <li key={c.code} data-reveal style={revealDelay(i * 60)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <span className="flap px-2 py-1 text-sm tracking-[0.12em]">{c.code}</span>
                    <span className="mt-3 block text-xs text-white/60">{c.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-6">
              <div data-reveal="scale" className="relative aspect-[4/3] overflow-hidden rounded-stage shadow-float">
                <img src="/images/generated/global-network.webp" alt="Illustrated global flight network connecting continents" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              </div>
              <div data-reveal style={revealDelay(150)} className="mt-5 rounded-panel border border-[#5B86FF]/30 bg-[#1246C8]/15 p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8EAEFF]">Ethical disclosure</p>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  Alpha Step Links Aviation School is an educational institution. We do not provide or guarantee visas, immigration status, work permits or foreign employment. Documentation modules teach verification procedures; visa decisions rest solely with the relevant diplomatic missions.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CTAConversionBanner />
    </div>
  );
}

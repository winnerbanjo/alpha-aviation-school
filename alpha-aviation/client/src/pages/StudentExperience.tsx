import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowLink, PrimaryButton } from "@/components/ui/Buttons";
import { VideoCard } from "@/components/ui/VideoCard";
import { AircraftSystemsGraphic } from "@/components/graphics/AircraftSystemsGraphic";
import { PageHero } from "@/components/sections/PageHero";
import { CTAConversionBanner } from "@/components/sections/CTAConversionBanner";
import { cn, revealDelay } from "@/lib/utils";


const tracks = [
  {
    code: "Track A",
    title: "Intensive weekday cohort",
    badge: "Full immersion",
    featured: true,
    rows: [
      ["Duration", "4 consecutive weeks"],
      ["Days", "Mon–Thu lectures, Friday labs"],
      ["Hours", "10:00 – 15:00 WAT"],
      ["Mode", "In-person (Lagos) or live virtual"],
    ],
    body: "Ideal for candidates seeking rapid entry into airline ticketing or customer-facing roles. Complete every module in one month.",
    cta: "Enroll for a weekday intake",
  },
  {
    code: "Track B",
    title: "Weekend executive track",
    badge: "Flexible",
    featured: false,
    rows: [
      ["Duration", "6 consecutive weekends"],
      ["Saturday", "10:00 – 16:00"],
      ["Sunday", "13:00 – 17:00"],
      ["Mode", "In-person (Lagos) or live virtual"],
    ],
    body: "Designed for working professionals, travel agency founders and university students who want a qualification without weekday disruption.",
    cta: "Enroll for a weekend intake",
  },
];

export function StudentExperience() {
  return (
    <div className="flex flex-col">
      <SEO title="Student Experience & Simulation Labs" description="Explore the student learning journey at Alpha Step Links Aviation School: computerized GDS simulation stations, mock passenger check-in desks, executive grooming, and cohort schedules." url="/student-experience" />
      <PageHero
        breadcrumbs={[{ label: "Student Experience" }]}
        eyebrow="Learning environment & facilities"
        title="Learn it."
        accent="Then do it."
        description="Learning happens through simulated airline workflows — from typing GDS terminal commands to resolving complex passenger scenarios — so you train for the real demands of airports and airlines."
        video="hangar-practical"
        facts={[
          { label: "Labs", value: "GDS workstations" },
          { label: "Practice", value: "Passenger service suite" },
          { label: "Schedules", value: "Weekday or weekend" },
          { label: "Mode", value: "Lagos & live virtual" },
        ]}
      />

      {/* Simulation lab */}
      <section className="bg-white py-24 sm:py-32">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="Hands-on simulation"
                title="The GDS terminal &"
                accent="passenger handling lab."
                description="We bridge the gap between classroom theory and real airline desks, with workstation terminals configured for global reservation workflows."
                className="mb-8"
              />
              <div data-reveal className="space-y-4 text-base leading-[1.75] text-[#53647C]">
                <p>
                  Students practise command-line navigation, PNR creation, fare quote audits and reissue routines aligned with Sabre, Amadeus and Galileo workflows.
                </p>
                <p>
                  In the passenger handling suite, trainees rehearse gate announcements, lounge etiquette, passport checks and de-escalation for delayed or irregular flights.
                </p>
              </div>
              <div data-reveal className="mt-8">
                <ArrowLink href="/courses/air-ticketing">Explore the air ticketing modules</ArrowLink>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="grid grid-cols-6 gap-4">
                <div data-reveal="scale" className="relative col-span-6 aspect-[16/10] overflow-hidden rounded-stage shadow-float">
                  <img src="/images/generated/simulation-lab.webp" alt="Students practising airline reservations at classroom workstations" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                </div>
                <div data-reveal style={revealDelay(100)} className="relative col-span-3 aspect-square overflow-hidden rounded-panel">
                  <img src="/images/generated/customer-service.webp" alt="Passenger service trainee assisting a traveller at a counter" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                </div>
                <div data-reveal style={revealDelay(200)} className="col-span-3 flex flex-col justify-between rounded-panel bg-[#1246C8] p-6 text-white">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">In the lab</span>
                  <p className="text-xl font-bold leading-snug tracking-tight sm:text-2xl">Real commands. Real scenarios. Real confidence.</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Aviation in motion — film gallery */}
      <section className="bg-[#07152E] py-24 text-white sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="Aviation in motion"
            title="A closer look at"
            accent="the world you'll join."
            description="Careful instruction and airport systems sit behind every journey — from the flight deck to the runway. Hover a film to play it."
            isDark
          />
          <div className="grid gap-4 md:grid-cols-12 md:gap-5">
            <div data-reveal="scale" className="md:col-span-7">
              <VideoCard name="flight-deck-mentoring" className="aspect-[16/10] md:aspect-auto md:h-full md:min-h-[440px]" />
            </div>
            <div data-reveal="scale" style={revealDelay(120)} className="md:col-span-5">
              <VideoCard name="airport-operations-model" className="aspect-[16/10] md:aspect-auto md:h-full md:min-h-[440px]" />
            </div>
            <div data-reveal="scale" style={revealDelay(60)} className="md:col-span-5">
              <VideoCard name="aviation-instruction" className="aspect-[16/10]" />
            </div>
            <div data-reveal="scale" style={revealDelay(180)} className="md:col-span-7">
              <VideoCard name="aircraft-planning" className="aspect-[16/10] md:aspect-auto md:h-full" />
            </div>
          </div>
        </Container>
      </section>

      {/* Aircraft zoning */}
      <section className="bg-[#F5F7FB] py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="Operational zoning"
            title="Understand the"
            accent="whole aircraft ecosystem."
            description="Training spans every passenger touchpoint — from the forward boarding door and galley to the cargo hold and flight dispatch."
            align="center"
          />
          <div data-reveal="scale" className="mx-auto max-w-5xl">
            <AircraftSystemsGraphic variant="light" />
          </div>
        </Container>
      </section>

      {/* Cohort tracks */}
      <section className="bg-white py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="Cohort formats"
            title="For school leavers"
            accent="and working professionals."
            description="Choose intensive weekday immersion or the executive weekend schedule."
            align="center"
          />
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
            {tracks.map((t, i) => (
              <div key={t.code} data-reveal style={revealDelay(i * 120)}>
                <article
                  className={cn(
                    "flex h-full flex-col rounded-stage p-8 transition-transform duration-500 ease-out-expo hover:-translate-y-1.5 sm:p-10",
                    t.featured ? "bg-[#10264B] text-white shadow-float" : "border border-[#DCE2EB] bg-[#F5F7FB] text-[#10264B]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("text-[11px] font-semibold uppercase tracking-[0.2em]", t.featured ? "text-[#8EAEFF]" : "text-[#1246C8]")}>{t.code}</span>
                    <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", t.featured ? "bg-[#1246C8] text-white" : "bg-[#DCE8FF] text-[#1246C8]")}>{t.badge}</span>
                  </div>
                  <h3 className="mt-6 text-3xl font-bold tracking-tighter">{t.title}</h3>
                  <dl className={cn("mt-6 divide-y text-sm", t.featured ? "divide-white/10" : "divide-[#DCE2EB]")}>
                    {t.rows.map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 py-3">
                        <dt className={t.featured ? "text-white/60" : "text-[#53647C]"}>{k}</dt>
                        <dd className="text-right font-semibold">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className={cn("mt-6 text-sm leading-relaxed", t.featured ? "text-white/75" : "text-[#53647C]")}>{t.body}</p>
                  <div className="mt-auto pt-8">
                    <PrimaryButton href="/enroll" variant={t.featured ? "white" : "primary"} arrow className="w-full justify-between pr-3">
                      {t.cta}
                    </PrimaryButton>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Community */}
      <section className="bg-[#F5F7FB] py-24 sm:py-32">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <span data-reveal className="eyebrow text-[#1246C8]">Graduate pathways</span>
              <h2 data-reveal style={revealDelay(80)} className="mt-5 text-[34px] font-bold leading-[1.05] tracking-tightest text-[#10264B] sm:text-5xl">
                A community of <span className="text-gradient-blue">certified graduates.</span>
              </h2>
              <p data-reveal style={revealDelay(160)} className="mt-5 text-base leading-[1.75] text-[#53647C]">
                Our programs prepare graduates for roles across travel management companies, airline ticket counters, airport ground handling and hospitality front desks.
              </p>
            </div>
            <div data-reveal="mask" className="relative aspect-[16/10] overflow-hidden rounded-stage shadow-float lg:col-span-7">
              <img src="/graduants.jpg" alt="ASL Aviation School graduates" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            </div>
          </div>
        </Container>
      </section>

      <CTAConversionBanner />
    </div>
  );
}

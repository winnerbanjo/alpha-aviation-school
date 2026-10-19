import { AboutSEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowLink, PrimaryButton } from "@/components/ui/Buttons";
import { VideoCard } from "@/components/ui/VideoCard";
import { PageHero } from "@/components/sections/PageHero";
import { CTAConversionBanner } from "@/components/sections/CTAConversionBanner";
import { revealDelay } from "@/lib/utils";


const coreValues = [
  {
    title: "Excellence",
    desc: "We strive for the highest standards in every aspect of our training, so graduates are prepared for competitive aviation and travel environments.",
  },
  {
    title: "Precision",
    desc: "Accuracy, systematic checklists and adherence to standard operating procedures are at the heart of aviation — we instil them through hands-on simulation.",
  },
  {
    title: "Global reach",
    desc: "Connecting students across Nigeria, the United Kingdom and Canada with internationally aligned curricula and cross-border career perspectives.",
  },
  {
    title: "Community & integrity",
    desc: "Youth empowerment, honest disclosures and transparent tuition — building a diverse, capable workforce for the industry.",
  },
];

const disclosures = [
  "Standard tuition: ₦150,000 per 4-week program",
  "4-course international track: ₦538,000 (save ₦62,000)",
  "No fabricated employment guarantees or visa claims",
  "Certificate verification through our academic records desk",
];

export function About() {
  return (
    <div className="flex flex-col">
      <AboutSEO />
      <PageHero
        breadcrumbs={[{ label: "About ASL" }]}
        eyebrow="Institutional identity & mission"
        title="Purpose with direction."
        accent="Excellence with integrity."
        description="Alpha Step Links Aviation School was founded on a simple conviction: aspiring aviation and travel professionals deserve rigorous, practical and honest education that translates directly into industry capability."
        video="aircraft-planning"
        facts={[
          { label: "Parent brand", value: "Alpha Step Links" },
          { label: "Headquarters", value: "Ruislip, UK" },
          { label: "Training centre", value: "Lagos, Nigeria" },
          { label: "Format", value: "4-week programs" },
        ]}
      />

      {/* Story */}
      <section className="bg-white py-24 sm:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <SectionHeading
                eyebrow="Parent brand heritage"
                title="A disciplined identity,"
                accent="a clear direction."
                description="Alpha Step Links is guided by one philosophy: “A clear direction forward.” We present our education with measured confidence, precise facts and responsible administration."
                className="mb-10"
              />
              <div data-reveal className="space-y-5 text-base leading-[1.8] text-[#53647C]">
                <p>
                  In an education market too often compromised by exaggerated promises, Alpha Step Links Aviation School stands apart through adherence to verifiable standards.
                </p>
                <p>
                  Our courses in air ticketing and reservations, passenger handling and travel agency management bridge the gap between classroom theory and the daily realities of airport terminals, airline sales desks and corporate travel agencies.
                </p>
                <p>
                  With administrative oversight from our offices in Ruislip, Greater London, and classroom labs in Ilasamaja, Lagos, every student trains under one standard of professional conduct.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div data-reveal="scale" className="sm:row-span-2">
                  <VideoCard name="instructor-briefing" playMode="view" className="aspect-[9/14] sm:aspect-auto sm:h-full sm:min-h-[460px]" />
                </div>
                <div data-reveal style={revealDelay(100)} className="flex flex-col justify-between rounded-panel bg-[#1246C8] p-7 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Our mission</p>
                  <p className="mt-4 text-lg font-semibold leading-snug">
                    To deliver practical, world-class aviation training that empowers impactful careers in the global aerospace and travel sectors.
                  </p>
                </div>
                <div data-reveal style={revealDelay(200)} className="flex flex-col justify-between rounded-panel bg-[#10264B] p-7 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">Our vision</p>
                  <p className="mt-4 text-lg font-semibold leading-snug">
                    To inspire and equip skilled aviation professionals across continents, fostering safety consciousness and operational excellence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Values — expanding panels */}
      <section className="bg-[#07152E] py-24 text-white sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="Organisational principles"
            title="Four values that"
            accent="guide every cohort."
            description="Our values reflect the exacting demands of civil aviation and our ethical obligations to students."
            isDark
          />

          <div className="flex flex-col gap-3 lg:h-[440px] lg:flex-row">
            {coreValues.map((val, i) => (
              <div
                key={val.title}
                className="lg:flex-1 lg:transition-[flex-grow] lg:duration-700 lg:ease-out-expo lg:hover:flex-[2.4]"
              >
                <div data-reveal style={revealDelay(i * 100)} className="h-full">
                <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-panel border border-white/10 bg-white/[0.04] p-7 transition-colors duration-500 hover:border-[#5B86FF]/60 hover:bg-[#1246C8]">
                  <span aria-hidden="true" className="absolute -right-6 -top-10 text-[160px] font-bold leading-none tracking-tightest text-white/[0.04] transition-colors duration-500 group-hover:text-white/10">
                    0{i + 1}
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-[#8EAEFF] group-hover:text-white/80">Value 0{i + 1}</span>
                  <div className="relative mt-16 lg:mt-0">
                    <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl">{val.title}</h3>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70 transition-opacity duration-500 group-hover:text-white/90 lg:opacity-60 lg:group-hover:opacity-100">
                      {val.desc}
                    </p>
                  </div>
                </article>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Transparency — flight manifest */}
      <section className="bg-[#F5F7FB] py-24 sm:py-32">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div data-reveal="scale" className="relative aspect-[4/3] overflow-hidden rounded-stage shadow-float lg:col-span-5">
              <img src="/images/campus/aviation-academy-story.png" alt="Alpha Step Links aviation academy story illustration" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="lg:col-span-7">
              <span data-reveal className="eyebrow text-[#1246C8]">Transparency statement</span>
              <h2 data-reveal style={revealDelay(80)} className="mt-5 text-[34px] font-bold leading-[1.05] tracking-tightest text-[#10264B] sm:text-5xl">
                We publish verified facts only.
              </h2>
              <p data-reveal style={revealDelay(160)} className="mt-5 max-w-xl text-base leading-[1.75] text-[#53647C]">
                Alpha Step Links Aviation School operates from <strong className="text-[#10264B]">Ruislip HA4 7AE, United Kingdom</strong> and <strong className="text-[#10264B]">Ilasamaja, Lagos 102214, Nigeria</strong>.
              </p>
              <ul className="mt-8 divide-y divide-[#DCE2EB] overflow-hidden rounded-panel border border-[#DCE2EB] bg-white">
                {disclosures.map((item, i) => (
                  <li key={item} data-reveal style={revealDelay(200 + i * 80)} className="flex items-center gap-4 px-5 py-4 text-sm text-[#172B49]">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div data-reveal className="mt-8 flex flex-wrap items-center gap-6">
                <PrimaryButton href="/contact" arrow className="pr-3">Contact our offices</PrimaryButton>
                <ArrowLink href="/faqs">Read the admissions FAQs</ArrowLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CTAConversionBanner />
    </div>
  );
}

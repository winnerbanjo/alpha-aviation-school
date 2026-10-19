import { programImagery } from "@/lib/program-imagery";
import React from "react";
import { Link, useParams } from "react-router-dom";
import { SEO } from "@/components/seo/SEO";
import { NotFound } from "@/pages/NotFound";
import { programsData, getProgramBySlug } from "@/lib/programs";
import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Accordion";
import { PrimaryButton } from "@/components/ui/Buttons";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { PageHero } from "@/components/sections/PageHero";
import { CTAConversionBanner } from "@/components/sections/CTAConversionBanner";
import { formatNGN, revealDelay } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

export function CourseDetail() {
  const { slug = "" } = useParams();
  const program = getProgramBySlug(slug);

  if (!program) {
    return <NotFound />;
  }

  const index = programsData.findIndex((p) => p.slug === program.slug);
  const flightNo = `ASL${101 + index}`;
  const relatedPrograms = programsData.filter((p) => p.slug !== program.slug).slice(0, 3);

  const accordionFaqs = program.faqItems.map((f, i) => ({
    id: `prog-faq-${i}`,
    question: f.question,
    answer: f.answer,
  }));

  return (
    <div className="flex flex-col">
      <SEO title={program.title} description={program.shortDescription} url={`/courses/${program.slug}`} />
      <PageHero
        breadcrumbs={[{ label: "Our Programs", href: "/courses" }, { label: program.title }]}
        eyebrow={`${flightNo} · ${program.category}`}
        title={program.title}
        description={program.shortDescription}
        image={{ src: programImagery[program.id].src }}
        facts={[
          { label: "Duration", value: program.duration },
          { label: "Tuition", value: formatNGN(program.priceNGN) },
          { label: "Delivery", value: "Lagos & live virtual" },
          { label: "Modules", value: `${program.outline.length} units` },
        ]}
      >
        <PrimaryButton href={`/enroll?program=${program.slug}`} size="lg" arrow>
          Enroll in this program
        </PrimaryButton>
        <PrimaryButton href="#syllabus" size="lg" variant="glass">
          View the syllabus
        </PrimaryButton>
      </PageHero>

      <section className="bg-white py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-20 lg:col-span-8">
              {/* Overview */}
              <div>
                <span data-reveal className="eyebrow text-[#1246C8]">Program overview</span>
                <p data-reveal style={revealDelay(80)} className="mt-6 text-2xl font-semibold leading-[1.4] tracking-tight text-[#10264B] sm:text-[28px]">
                  {program.description}
                </p>
                <ul className="mt-10 grid gap-3 sm:grid-cols-2">
                  {program.highlights.map((h, i) => (
                    <li key={h} data-reveal style={revealDelay(i * 80)} className="flex gap-4 rounded-panel border border-[#DCE2EB] bg-[#F5F7FB] p-5">
                      <span className="text-sm font-bold tabular-nums text-[#1246C8]">0{i + 1}</span>
                      <span className="text-sm leading-relaxed text-[#172B49]">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Syllabus flight path */}
              <div id="syllabus" className="scroll-mt-28">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <span data-reveal className="eyebrow text-[#1246C8]">Syllabus</span>
                    <h2 data-reveal style={revealDelay(80)} className="mt-4 text-3xl font-bold tracking-tighter text-[#10264B] sm:text-4xl">
                      Your flight path, module by module.
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#DCE8FF] px-3.5 py-1.5 text-xs font-semibold text-[#1246C8]">
                    {program.outline.length} units · {program.duration}
                  </span>
                </div>

                <ol className="relative mt-10 border-l-2 border-dashed border-[#DCE2EB] pl-8 sm:pl-10">
                  {program.outline.map((mod, idx) => {
                    const last = idx === program.outline.length - 1;
                    return (
                      <li key={mod} data-reveal style={revealDelay(idx * 50)} className="group relative pb-4 last:pb-0">
                        <span
                          aria-hidden="true"
                          className={`absolute -left-[41px] top-4 flex h-5 w-5 items-center justify-center rounded-full border-4 border-white sm:-left-[49px] ${last ? "bg-[#1246C8]" : "bg-[#10264B]"} shadow-subtle transition-transform group-hover:scale-125`}
                        />
                        <div className="flex items-center justify-between gap-4 rounded-2xl border border-transparent px-5 py-4 transition-all duration-300 group-hover:border-[#DCE2EB] group-hover:bg-[#F5F7FB]">
                          <div className="flex items-center gap-5">
                            <span className="w-7 text-sm font-bold tabular-nums text-[#1246C8]">{String(idx + 1).padStart(2, "0")}</span>
                            <span className="text-base font-semibold text-[#10264B]">{mod}</span>
                          </div>
                          {last && (
                            <span className="hidden shrink-0 rounded-full bg-[#1246C8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white sm:inline">
                              Arrival
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Audience & careers */}
              <div className="grid gap-4 md:grid-cols-2">
                <div data-reveal className="rounded-stage bg-[#10264B] p-8 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8EAEFF]">Who should enrol</p>
                  <ul className="mt-6 space-y-4">
                    {program.targetAudience.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-relaxed text-white/85">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5B86FF]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div data-reveal style={revealDelay(100)} className="rounded-stage border border-[#DCE2EB] bg-[#F5F7FB] p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1246C8]">Relevant career paths</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {program.careerOutcomes.map((item) => (
                      <li key={item} className="rounded-full border border-[#DCE2EB] bg-white px-3.5 py-2 text-sm font-medium text-[#10264B]">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-xs text-[#53647C]">Career preparation only — no placement guarantees.</p>
                </div>
              </div>

              {accordionFaqs.length > 0 && (
                <div>
                  <h2 data-reveal className="mb-6 text-2xl font-bold tracking-tighter text-[#10264B]">Questions about this program</h2>
                  <Accordion items={accordionFaqs} />
                </div>
              )}
            </div>

            {/* Ticket sidebar */}
            <aside className="lg:col-span-4">
              <div className="space-y-4 lg:sticky lg:top-28">
                <div data-reveal="scale" className="overflow-hidden rounded-stage border border-[#DCE2EB] bg-white shadow-float">
                  <div className="bg-[#1246C8] p-6 text-white">
                    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                      <span>Course ticket</span>
                      <span className="flap px-2 py-0.5 text-[11px] text-white">{flightNo}</span>
                    </div>
                    <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Standard tuition</p>
                    <p className="mt-1 text-4xl font-bold tracking-tightest tabular-nums">{formatNGN(program.priceNGN)}</p>
                    <p className="mt-2 text-xs text-white/75">Course materials and practical terminal access included.</p>
                  </div>
                  <dl className="divide-y divide-[#DCE2EB] border-b-2 border-dashed border-[#DCE2EB] px-6 text-sm">
                    {[
                      ["Duration", program.duration],
                      ["Delivery", "In-person & virtual"],
                      ["Intake", "Monthly cohorts"],
                      ["Location", "Lagos & online"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-3">
                        <dt className="text-[#53647C]">{k}</dt>
                        <dd className="font-semibold text-[#10264B]">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="space-y-3 p-6">
                    <PrimaryButton href={`/enroll?program=${program.slug}`} arrow className="w-full justify-between pr-3">
                      Enroll in this program
                    </PrimaryButton>
                    <p className="text-center text-xs text-[#53647C]">
                      Or choose 4 courses for the{" "}
                      <Link to="/enroll" className="font-semibold text-[#1246C8] underline-offset-2 hover:underline">
                        ₦538,000 international track
                      </Link>
                    </p>
                  </div>
                </div>

                <div data-reveal style={revealDelay(100)} className="rounded-panel border border-[#DCE2EB] bg-[#F5F7FB] p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1246C8]">Certification</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#53647C]">{program.certificationNote}</p>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* Related */}
      <section className="bg-[#F5F7FB] py-20 sm:py-28">
        <Container>
          <div className="mb-10 flex items-end justify-between gap-6">
            <h2 data-reveal className="text-3xl font-bold tracking-tighter text-[#10264B] sm:text-4xl">Connecting flights</h2>
            <Link to="/courses" className="hidden text-sm font-semibold text-[#1246C8] hover:text-[#10264B] sm:inline">
              All programs →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedPrograms.map((rp, i) => (
              <div key={rp.slug} data-reveal style={revealDelay(i * 100)}>
                <ProgramCard program={rp} />
              </div>
            ))}
          </div>
        </Container>
      </section>

      <CTAConversionBanner />
    </div>
  );
}

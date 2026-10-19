import { CoursesSEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PrimaryButton } from "@/components/ui/Buttons";
import { VideoCard } from "@/components/ui/VideoCard";
import { ProgramFilter } from "@/components/programs/ProgramFilter";
import { PageHero } from "@/components/sections/PageHero";
import { CTAConversionBanner } from "@/components/sections/CTAConversionBanner";
import { programsData } from "@/lib/programs";
import { revealDelay } from "@/lib/utils";


const standards = [
  { value: "4 weeks", label: "Intensive format", note: "Monday–Thursday lectures plus practical Friday lab sessions." },
  { value: "₦150,000", label: "Flat tuition", note: "Per course, with no hidden examination or simulation surcharges." },
  { value: "₦538,000", label: "4-course track", note: "International career bundle — a saving of ₦62,000." },
];

export function Courses() {
  return (
    <div className="flex flex-col">
      <CoursesSEO />
      <PageHero
        breadcrumbs={[{ label: "Our Programs" }]}
        eyebrow="Seven 4-week professional tracks"
        title="Training built"
        accent="to airline standards."
        description="Every course combines hands-on Global Distribution System simulation, international fare rules, passenger handling procedures and practical assessment."
        video="aviation-instruction"
        facts={[
          { label: "Programs", value: "7 tracks" },
          { label: "Duration", value: "4 weeks each" },
          { label: "Delivery", value: "Lagos & live virtual" },
          { label: "Tuition", value: "₦150,000" },
        ]}
      >
        <PrimaryButton href="#catalogue" size="lg" arrow>
          Browse the catalogue
        </PrimaryButton>
        <PrimaryButton href="/enroll" size="lg" variant="glass">
          Ask about intakes
        </PrimaryButton>
      </PageHero>

      <section id="catalogue" className="scroll-mt-8 bg-[#F5F7FB] py-20 sm:py-28">
        <Container>
          <ProgramFilter programs={programsData} />
        </Container>
      </section>

      <section className="bg-white py-24 sm:py-32">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <SectionHeading
                eyebrow="Curriculum integrity"
                title="One standard,"
                accent="every cohort."
                description="Whether you study in person at our Lagos centre or join the live virtual classroom from the UK, Canada or across Africa, your syllabus is identical."
                className="mb-10"
              />
              <dl className="grid gap-3">
                {standards.map((s, i) => (
                  <div key={s.label} data-reveal style={revealDelay(i * 100)} className="flex flex-row-reverse items-center justify-end gap-6 rounded-panel border border-[#DCE2EB] bg-[#F5F7FB] p-5">
                    <dt>
                      <span className="block text-sm font-semibold text-[#10264B]">{s.label}</span>
                      <span className="mt-0.5 block text-sm text-[#53647C]">{s.note}</span>
                    </dt>
                    <dd className="w-32 shrink-0 text-2xl font-bold tracking-tighter text-[#1246C8] sm:w-36 sm:text-3xl">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div data-reveal="scale" className="lg:col-span-6">
              <VideoCard name="airport-operations-model" playMode="view" className="aspect-[4/3]" />
            </div>
          </div>
        </Container>
      </section>

      <CTAConversionBanner />
    </div>
  );
}

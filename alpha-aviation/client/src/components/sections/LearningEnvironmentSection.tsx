import React from "react";
import { Container } from "@/components/ui/Container";
import { ArrowLink } from "@/components/ui/Buttons";
import { VideoCard } from "@/components/ui/VideoCard";
import { revealDelay } from "@/lib/utils";

const capabilities = [
  {
    title: "Computerised GDS workstations",
    body: "Training terminals for airline inventory simulation, route mapping and IATA tariff calculation.",
  },
  {
    title: "Passenger service suite",
    body: "Mock check-in counters and boarding gates for document checks, baggage tagging and conflict resolution drills.",
  },
  {
    title: "Grooming & speech lab",
    body: "Posture, presentation and public-address voice projection for cabin and customer-facing roles.",
  },
];

export function LearningEnvironmentSection() {
  return (
    <section aria-labelledby="learning-title" className="bg-[#F5F7FB] py-24 sm:py-32">
      <Container>
        <div className="mb-12 flex flex-col justify-between gap-6 sm:mb-16 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <span data-reveal className="eyebrow text-[#1246C8]">Facilities &amp; environment</span>
            <h2 id="learning-title" data-reveal style={revealDelay(80)} className="mt-5 text-[34px] font-bold leading-[1.05] tracking-tightest text-[#10264B] sm:text-5xl lg:text-[56px]">
              Where theory meets <span className="text-gradient-blue">the terminal.</span>
            </h2>
          </div>
          <p data-reveal style={revealDelay(160)} className="max-w-md text-base leading-[1.7] text-[#53647C]">
            Hover over a film to bring it to life. From reservation labs to passenger service drills, learning happens by doing.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-12">
          <div data-reveal="scale" className="md:col-span-8">
            <VideoCard name="hangar-practical" className="aspect-[4/3] md:aspect-auto md:h-full md:min-h-[520px]" />
          </div>
          <div data-reveal="scale" style={revealDelay(120)} className="md:col-span-4">
            <VideoCard name="instructor-briefing" className="aspect-[9/14] md:aspect-auto md:h-full md:min-h-[520px]" />
          </div>

          {capabilities.map((c, i) => (
            <div key={c.title} data-reveal style={revealDelay(i * 100)} className="md:col-span-4">
            <div
              className="group relative h-full overflow-hidden rounded-panel border border-[#DCE2EB] bg-white p-7 transition-colors duration-500 hover:border-[#1246C8] hover:bg-[#1246C8]"
            >
              <span className="text-xs font-semibold tabular-nums text-[#1246C8] transition-colors group-hover:text-white/70">
                Capability 0{i + 1}
              </span>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-[#10264B] transition-colors group-hover:text-white">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#53647C] transition-colors group-hover:text-white/80">{c.body}</p>
              <span aria-hidden="true" className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full border border-[#1246C8]/10 transition-all duration-700 group-hover:scale-150 group-hover:border-white/20" />
            </div>
            </div>
          ))}
        </div>

        <div data-reveal className="mt-10">
          <ArrowLink href="/student-experience">Tour the full student experience</ArrowLink>
        </div>
      </Container>
    </section>
  );
}

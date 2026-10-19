import React from "react";
import { Container } from "@/components/ui/Container";
import { ArrowLink } from "@/components/ui/Buttons";
import { BackgroundVideo } from "@/components/ui/BackgroundVideo";
import { RouteMap } from "@/components/graphics/RouteMap";
import { revealDelay } from "@/lib/utils";

export function InternationalCorridorSection() {
  return (
    <section aria-labelledby="international-title" className="relative isolate overflow-hidden bg-[#07152E] py-24 text-white sm:py-32">
      <BackgroundVideo name="airport-operations-model" tone="deep" showControl={false} className="opacity-50" />
      <div aria-hidden="true" className="absolute inset-0 bg-[#07152E]/60" />

      <Container className="relative z-10">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span data-reveal className="eyebrow text-[#8EAEFF]">Global outlook</span>
            <h2 id="international-title" data-reveal style={revealDelay(80)} className="mt-5 text-[34px] font-bold leading-[1.05] tracking-tightest sm:text-5xl lg:text-[56px]">
              Nigeria. The United Kingdom. <span className="text-gradient-sky">Canada.</span>
            </h2>
            <p data-reveal style={revealDelay(160)} className="mt-6 text-base leading-[1.75] text-[#DCE8FF]/75 sm:text-lg">
              Aviation is borderless. We connect learners in West Africa with UK institutional governance and guidance for further study pathways in Canada.
            </p>
            <ul data-reveal style={revealDelay(240)} className="mt-8 space-y-3 text-sm text-white/75">
              {[
                "Same syllabus whether you join in Lagos or live online",
                "IATA codes, fare rules and airline procedures used worldwide",
                "Clear advice on documentation — never visa or job guarantees",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1246C8]">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div data-reveal style={revealDelay(320)} className="mt-10">
              <ArrowLink href="/international-opportunities" tone="light">
                Explore international opportunities
              </ArrowLink>
            </div>
          </div>

          <div data-reveal="right" style={revealDelay(200)} className="lg:col-span-7">
            <RouteMap />
          </div>
        </div>
      </Container>
    </section>
  );
}

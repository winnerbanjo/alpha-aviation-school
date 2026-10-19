import React from "react";
import { Container } from "@/components/ui/Container";
import { PrimaryButton } from "@/components/ui/Buttons";
import { BackgroundVideo } from "@/components/ui/BackgroundVideo";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { siteConfig } from "@/lib/site-config";
import { revealDelay } from "@/lib/utils";

const fields = [
  { label: "Passenger", value: "You" },
  { label: "Programs", value: "7 to choose from" },
  { label: "Duration", value: "4 weeks" },
  { label: "Mode", value: "Lagos · Live online" },
];

export function CTAConversionBanner() {
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden bg-[#1246C8] py-24 text-white sm:py-32">
      <BackgroundVideo name="flight-deck-mentoring" tone="soft" showControl={false} className="opacity-40" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#1246C8]/90 via-[#10264B]/85 to-[#07152E]/95" />

      <Container className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <span data-reveal className="eyebrow justify-center text-[#DCE8FF]">Your boarding pass</span>
          <h2 id="cta-title" data-reveal style={revealDelay(80)} className="mt-5 text-[36px] font-bold leading-[1.04] tracking-tightest sm:text-6xl">
            Take the next step towards your future.
          </h2>
        </div>

        <div data-reveal="scale" style={revealDelay(180)} className="mx-auto mt-14 max-w-5xl">
        <div
          className="ticket-notch group grid overflow-hidden rounded-stage bg-white text-[#10264B] shadow-float transition-transform duration-700 ease-out-expo hover:-rotate-[0.6deg] lg:grid-cols-[1fr_300px]"
        >
          {/* Main pass */}
          <div className="p-7 sm:p-10">
            <div className="flex items-center justify-between gap-4">
              <BrandLogo tone="blue" className="-my-3 -ml-1.5 w-[200px] sm:w-[220px]" />
              <span className="rounded-full bg-[#DCE8FF] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1246C8]">Boarding pass</span>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#53647C]">From</p>
                <p className="mt-1 text-3xl font-bold tracking-tightest sm:text-5xl">Ambition</p>
              </div>
              <div aria-hidden="true" className="flex flex-1 items-center gap-2 px-2 text-[#1246C8]">
                <span className="h-px flex-1 border-t-2 border-dashed border-[#DCE2EB]" />
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="rotate-90 transition-transform duration-700 ease-out-expo group-hover:translate-y-[-6px]">
                  <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z" />
                </svg>
                <span className="h-px flex-1 border-t-2 border-dashed border-[#DCE2EB]" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#53647C]">To</p>
                <p className="mt-1 text-3xl font-bold tracking-tightest text-[#1246C8] sm:text-5xl">Career</p>
              </div>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-5 border-t border-[#DCE2EB] pt-6 sm:grid-cols-4">
              {fields.map((f) => (
                <div key={f.label}>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">{f.label}</dt>
                  <dd className="mt-1 text-sm font-semibold">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Stub */}
          <div className="relative flex flex-col justify-between gap-6 border-t-2 border-dashed border-[#DCE2EB] bg-[#F5F7FB] p-7 sm:p-8 lg:border-l-2 lg:border-t-0">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#53647C]">Gate</p>
              <p className="mt-1 text-2xl font-bold tracking-tight">Admissions</p>
              <div aria-hidden="true" className="barcode mt-5 h-14 w-full rounded-sm opacity-90" />
            </div>
            <div className="flex flex-col gap-2.5">
              <PrimaryButton href="/enroll" arrow className="w-full justify-between pr-3">
                Enroll now
              </PrimaryButton>
              <PrimaryButton href="/courses" variant="outline" className="w-full">
                View all programs
              </PrimaryButton>
            </div>
          </div>
        </div>
        </div>

        <div data-reveal style={revealDelay(260)} className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/70">
          <a href={`tel:${siteConfig.offices.uk.phoneRaw}`} className="hover:text-white">UK {siteConfig.offices.uk.phone}</a>
          <a href={`tel:${siteConfig.offices.nigeria.phoneRaw}`} className="hover:text-white">Nigeria {siteConfig.offices.nigeria.phone}</a>
          <a href={`mailto:${siteConfig.primaryEmail}`} className="hover:text-white">{siteConfig.primaryEmail}</a>
        </div>
      </Container>
    </section>
  );
}

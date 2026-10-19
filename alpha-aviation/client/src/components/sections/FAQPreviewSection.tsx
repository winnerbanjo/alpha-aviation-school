import React from "react";
import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Accordion";
import { ArrowLink, PrimaryButton } from "@/components/ui/Buttons";
import { allFaqs } from "@/lib/faqs-data";
import { siteConfig } from "@/lib/site-config";
import { revealDelay } from "@/lib/utils";

export function FAQPreviewSection() {
  const previewFaqs = allFaqs.slice(0, 5);

  return (
    <section aria-labelledby="faq-title" className="bg-[#F5F7FB] py-24 sm:py-32">
      <Container>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <span data-reveal className="eyebrow text-[#1246C8]">Admissions questions</span>
              <h2 id="faq-title" data-reveal style={revealDelay(80)} className="mt-5 text-[34px] font-bold leading-[1.05] tracking-tightest text-[#10264B] sm:text-5xl">
                Good questions, <span className="text-gradient-blue">clear answers.</span>
              </h2>
              <p data-reveal style={revealDelay(160)} className="mt-5 text-base leading-[1.7] text-[#53647C]">
                Course formats, curriculum alignment, tuition and study modes — answered plainly.
              </p>

              <div data-reveal style={revealDelay(240)} className="mt-8 rounded-panel bg-[#10264B] p-6 text-white">
                <p className="text-sm font-semibold">Still deciding?</p>
                <p className="mt-1 text-sm text-white/70">Talk to an advisor at {siteConfig.primaryEmail}</p>
                <PrimaryButton href="/contact" variant="white" size="sm" arrow className="mt-5 pr-3">
                  Contact admissions
                </PrimaryButton>
              </div>
            </div>
          </div>

          <div data-reveal style={revealDelay(120)} className="lg:col-span-8">
            <Accordion items={previewFaqs} />
            <div className="mt-8">
              <ArrowLink href="/faqs">See all {allFaqs.length} questions</ArrowLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

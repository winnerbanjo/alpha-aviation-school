import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { FaqClient } from "@/components/faqs/FaqClient";
import { allFaqs } from "@/lib/faqs-data";
import { CTAConversionBanner } from "@/components/sections/CTAConversionBanner";


export function Faqs() {
  return (
    <div className="flex flex-col">
      <SEO title="Admissions & Institutional FAQs" description="Get clear, honest answers regarding Alpha Step Links Aviation School admissions, IATA curricula alignment, GDS software labs, tuition fees, and international study modes." url="/faqs" />
      <PageHero
        breadcrumbs={[{ label: "Admissions FAQs" }]}
        eyebrow="Knowledge archive"
        title="Frequently asked"
        accent="questions."
        description="Transparent answers about entry requirements, Global Distribution Systems, international pathways and tuition payment structures."
        size="compact"
      />

      {/* Main FAQ Section */}
      <section className="py-16 sm:py-24 bg-[#F5F7FB] border-b border-[#DCE2EB]">
        <Container size="narrow">
          <FaqClient faqs={allFaqs} />
        </Container>
      </section>

      {/* CTA Section */}
      <CTAConversionBanner />
    </div>
  );
}

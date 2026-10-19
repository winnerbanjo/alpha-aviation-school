import { HomeSEO } from "@/components/seo/SEO";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatementSection } from "@/components/sections/StatementSection";
import { ShowreelSection } from "@/components/sections/ShowreelSection";
import { DeparturesBoard } from "@/components/sections/DeparturesBoard";
import { WhyASLSection } from "@/components/sections/WhyASLSection";
import { LearningEnvironmentSection } from "@/components/sections/LearningEnvironmentSection";
import { InternationalCorridorSection } from "@/components/sections/InternationalCorridorSection";
import { StudentJourneySection } from "@/components/sections/StudentJourneySection";
import { FAQPreviewSection } from "@/components/sections/FAQPreviewSection";
import { CTAConversionBanner } from "@/components/sections/CTAConversionBanner";

export function Landing() {
  return (
    <div className="flex flex-col">
      <HomeSEO />

      {/* 1. Full-screen film hero with flight-plan card and departures ticker */}
      <HeroSection />

      {/* 2. Who we are — scroll-lit statement and key figures */}
      <StatementSection />

      {/* 3. Interactive showreel featuring every film clip */}
      <ShowreelSection />

      {/* 4. Programs as an airport departures board */}
      <DeparturesBoard />

      {/* 5. Why ASL — sticky scrollytelling */}
      <WhyASLSection />

      {/* 6. Learning environment bento with hover-to-play films */}
      <LearningEnvironmentSection />

      {/* 7. International outlook with animated route map */}
      <InternationalCorridorSection />

      {/* 8. Four-step admissions flight path */}
      <StudentJourneySection />

      {/* 9. FAQ preview */}
      <FAQPreviewSection />

      {/* 10. Boarding-pass call to action */}
      <CTAConversionBanner />
    </div>
  );
}

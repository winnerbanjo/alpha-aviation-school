import { HeroSection } from "@/components/home/HeroSection";
import { AboutSummary } from "@/components/home/AboutSummary";
import { TrainingCourses } from "@/components/home/TrainingCourses";
import { StorySection } from "@/components/home/StorySection";
import { CoreValues } from "@/components/home/CoreValues";
import { HomeSEO } from "@/components/seo/SEO";
import { CTASection } from "@/components/home/CTASection";
import { TrustGrid } from "@/components/home/TrustGrid";

const aboutUsText =
  "Alpha Step Links Aviation School is a certified and fast-growing aviation training institution dedicated to nurturing the next generation of aviation professionals. With a presence in Nigeria, the United Kingdom, and Canada, we specialize in high-quality programs including Aviation & Travel Training, Ticketing & Reservation, Cabin Crew Courses, IATA-aligned curricula, Youth Empowerment initiatives, International Internship Pathways, and Franchise & Licensing Programs like Classroom-in-a-Box. Our experienced instructors, state-of-the-art facilities, and curriculum aligned with international standards ensure students gain practical skills in air transport, safety, operations, and aviation management. Committed to innovation and excellence, we prepare graduates for thriving careers in airlines, airports, and aviation services worldwide.";

const legacyText =
  "Founded as part of the broader Alpha Step Links Ltd., which offers integrated services in travel, education, and logistics, Alpha Step Links Aviation School has quickly established itself as a beacon of excellence in aviation training. From our roots in Nigeria, we've expanded internationally to the UK and Canada, building a legacy of producing highly skilled graduates who contribute to the aviation sector's growth. Our commitment to youth empowerment and innovative programs, such as international internships and franchise opportunities, has created lasting impact, with ongoing expansions in 2026 solidifying our role in shaping the future of aviation.";

export function Landing() {
  return (
    <>
      <HomeSEO />
      <HeroSection />
      <AboutSummary />
      <TrainingCourses />
      <TrustGrid />
      {/* <StorySection aboutUsText={aboutUsText} legacyText={legacyText} /> */}
      <CTASection />
      {/* <CoreValues /> */}
    </>
  );
}

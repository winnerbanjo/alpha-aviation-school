import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Plane,
  Award,
  Target,
  Users,
  Globe,
  Ticket,
  Headphones,
  Building2,
  FileText,
  TrendingUp,
  ChevronRight,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

const professionalCourses = [
  {
    id: "air-ticketing",
    title: "Air Ticketing & Reservation Management",
    icon: Ticket,
  },
  {
    id: "customer-service",
    title: "Customer Service & Communication in Aviation",
    icon: Headphones,
  },
  {
    id: "hospitality",
    title: "Hospitality & Tourism Management",
    icon: Building2,
  },
  {
    id: "travel-agency",
    title: "Travel Agency Operations",
    icon: Globe,
  },
  {
    id: "visa-processing",
    title: "Visa Processing & Documentation",
    icon: FileText,
  },
  {
    id: "tourism-marketing",
    title: "Tourism Marketing & Entrepreneurship",
    icon: TrendingUp,
  },
];

const aboutUsText =
  "Alpha Step Links Aviation School is a certified and fast-growing aviation training institution dedicated to nurturing the next generation of aviation professionals. With a presence in Nigeria, the United Kingdom, and Canada, we specialize in high-quality programs including Aviation & Travel Training, Ticketing & Reservation, Cabin Crew Courses, IATA-aligned curricula, Youth Empowerment initiatives, International Internship Pathways, and Franchise & Licensing Programs like Classroom-in-a-Box. Our experienced instructors, state-of-the-art facilities, and curriculum aligned with international standards ensure students gain practical skills in air transport, safety, operations, and aviation management. Committed to innovation and excellence, we prepare graduates for thriving careers in airlines, airports, and aviation services worldwide.";

const legacyText =
  "Founded as part of the broader Alpha Step Links Ltd., which offers integrated services in travel, education, and logistics, Alpha Step Links Aviation School has quickly established itself as a beacon of excellence in aviation training. From our roots in Nigeria, we've expanded internationally to the UK and Canada, building a legacy of producing highly skilled graduates who contribute to the aviation sector's growth. Our commitment to youth empowerment and innovative programs, such as international internships and franchise opportunities, has created lasting impact, with ongoing expansions in 2026 solidifying our role in shaping the future of aviation.";

function StorySection({
  aboutUsText,
  legacyText,
}: {
  aboutUsText: string;
  legacyText: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const imgScale = useTransform(
    scrollYProgress,
    [0, 0.4, 0.6, 1],
    [0.8, 1.1, 1.1, 1.2],
  );
  const textOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.5],
    [0, 1, 1, 0],
  );
  const legacyOpacity = useTransform(
    scrollYProgress,
    [0.5, 0.6, 0.8, 1],
    [0, 1, 1, 0],
  );
  const imgMask = useTransform(
    scrollYProgress,
    [0, 0.3],
    ["circle(20%)", "circle(100%)"],
  );

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-slate-900">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Cinematic Backdrop */}
        <motion.div
          style={{ scale: imgScale, clipPath: imgMask }}
          className="absolute inset-0 z-0"
        >
          <img
            src="/forging.jpg"
            alt="Aviation Narrative"
            className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-transparent to-slate-900 opacity-80" />
        </motion.div>

        {/* Narrative Layers */}
        <div className="relative z-10 w-full h-full flex items-center justify-center px-4 sm:px-6">
          {/* Layer 1: The Vision */}
          <motion.div
            style={{ opacity: textOpacity }}
            className="text-center space-y-12 max-w-5xl absolute pointer-events-none"
          >
            <span className="text-xs font-black text-blue-400 uppercase tracking-[1em] mb-4 block drop-shadow-sm">
              The Vision
            </span>
            <h2 className="text-6xl sm:text-[8rem] font-bold text-white tracking-tighter leading-[0.9] drop-shadow-md">
              Forging the <br /> Sky.
            </h2>
            <p className="text-xl sm:text-3xl text-slate-200 font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-sm">
              We define the standards of excellence in aviation training,
              nurturing the next generation across continents.
            </p>
          </motion.div>

          {/* Layer 2: The Legacy */}
          <motion.div
            style={{ opacity: legacyOpacity }}
            className="flex flex-col lg:flex-row max-w-5xl  items-center justify-center w-full h-full py-32 absolute pointer-events-none"
          >
            <div className="lg:w-1/2 space-y-8 text-left">
              <span className="text-xs font-black text-[#FF6B35] uppercase tracking-[1em] mb-4 block drop-shadow-sm">
                Our Legacy
              </span>
              <h3 className="text-5xl sm:text-7xl font-bold text-white leading-tight drop-shadow-md">
                A Global <br /> Footprint.
              </h3>
              <p className="text-lg text-slate-300 max-w-md font-medium drop-shadow-sm">
                From Nigeria to the UK and Canada, our legacy is built on the
                success of 10,000+ elite graduates.
              </p>
            </div>

            <div className="lg:w-1/3 flex flex-col gap-12">
              <div className="border-l-2 border-[#FF6B35] pl-8 py-2">
                <p className="text-6xl font-bold text-white drop-shadow-lg">
                  3+
                </p>
                <p className="text-xs text-slate-300 font-bold uppercase tracking-[0.5em] mt-2">
                  Continents
                </p>
              </div>
              <div className="border-l-2 border-blue-400 pl-8 py-2">
                <p className="text-6xl font-bold text-white drop-shadow-lg">
                  10k+
                </p>
                <p className="text-xs text-slate-300 font-bold uppercase tracking-[0.5em] mt-2">
                  Professionals
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function Landing() {
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [legacyExpanded, setLegacyExpanded] = useState(false);

  const getFirstThreeLines = (text: string) => {
    const sentences = text.split(". ");
    return sentences.slice(0, 3).join(". ") + ".";
  };

  return (
    <>
      {/* 1. Hero Section - Reference Inspired */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-start overflow-hidden bg-gradient-to-b from-[#e3f2fd] via-[#f0f8ff] to-white pt-40 pb-20">
        {/* Floating Icons Background Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Graduation Cap */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] left-[10%] text-[#0061FF]/40"
          >
            <GraduationCap size={120} strokeWidth={1.5} />
          </motion.div>

          {/* Plane 1 */}
          <motion.div
            animate={{
              x: [-20, 20, -20],
              y: [0, -15, 0],
              rotate: [0, 10, 0],
              opacity: [0.3, 0.4, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[35%] right-[15%] text-[#FF6B35]/40"
          >
            <Plane size={100} strokeWidth={1.5} />
          </motion.div>

          {/* Plane 2 - Small */}
          <motion.div
            animate={{
              x: [20, -20, 20],
              y: [0, 10, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[40%] left-[20%] text-[#0061FF]/30"
          >
            <Plane size={60} strokeWidth={1.5} />
          </motion.div>
        </div>

        {/* Massive Centered Typography Segment */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 w-full text-center space-y-8 mt-4">
          <h1 className="text-[3.5rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[6.5rem] font-bold tracking-tight text-slate-900 leading-[1.05]">
            Elevating Aviation <br />
            <span className="text-slate-600/80 font-medium tracking-tight">
              Simplifying The Sky.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
            Comprehensive aviation training, expert career pathways, and
            industry-standard curricula — delivered with precision, safety, and
            operational excellence.
          </p>

          {/* Fully Rounded Pill Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link to="/courses">
              <Button className="w-full sm:w-auto rounded-full px-8 py-6 text-base font-medium bg-[#FF6B35] hover:bg-[#E55A26] text-white shadow-[0_8px_20px_rgba(255,107,53,0.25)] transition-all duration-300">
                Explore Programs
              </Button>
            </Link>
            <Link to="/enroll">
              <Button className="w-full sm:w-auto rounded-full px-8 py-6 text-base font-medium bg-slate-900 text-white hover:bg-black shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all duration-300">
                Enroll Today
              </Button>
            </Link>
          </div>
        </div>

        {/* Cinematic Bottom Image Masking */}
        <div className="absolute bottom-0 left-0 right-0 h-[50vh] z-10 overflow-hidden translate-y-16 lg:translate-y-24">
          <img
            src="/clean-airplane-interior.jpg"
            alt="Aviation wing and sky"
            className="w-full h-full object-cover object-top opacity-90 scale-105"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 30%, black 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 30%, black 100%)",
            }}
          />
        </div>
      </section>

      {/* 2. Training Courses - Editorial List (Premium Human Touch) */}
      <section
        id="courses"
        className="bg-white py-32 border-t border-slate-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-8">
            <div className="space-y-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-[0.4em]">
                Our specializations
              </span>
              <h2 className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Advanced <br /> Training.
              </h2>
            </div>
            <p className="text-xl text-slate-500 max-w-md font-light leading-relaxed">
              Tailored curriculum designed for the modern aviation professional,
              delivered with global certification integrity.
            </p>
          </div>

          <div className="border-t border-slate-900/10">
            {professionalCourses?.map((course, index) => {
              return (
                <div
                  key={course.id}
                  className="group block border-b border-slate-900/10 py-12 transition-all duration-500 hover:bg-slate-50 relative overflow-hidden px-4 sm:px-8"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-10">
                      <span className="text-sm font-bold text-slate-300 group-hover:text-blue-600 transition-colors">
                        0{index + 1}
                      </span>
                      <h3 className="text-3xl sm:text-5xl font-bold text-slate-900 group-hover:translate-x-4 transition-transform duration-500">
                        {course.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-6"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3 & 4. Our Story - High-End Cinematic Narrative */}
      <StorySection aboutUsText={aboutUsText} legacyText={legacyText} />

      {/* 5. Core Values - Geometric Grid (Premium Human Touch) */}
      <section className="bg-white py-32 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-24 gap-8">
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900">
              Our <span className="text-blue-600">Foundation.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 border-l border-t border-slate-100">
            <div className="p-12 sm:p-20 border-r border-b border-slate-100 space-y-6 group hover:bg-slate-50 transition-colors duration-500">
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                01
              </span>
              <h3 className="text-3xl font-bold text-slate-900">Excellence.</h3>
              <p className="text-xl text-slate-500 font-light leading-relaxed">
                We strive for the highest standards in every aspect of our
                training, from curriculum design to instructor expertise.
              </p>
            </div>
            <div className="p-12 sm:p-20 border-r border-b border-slate-100 space-y-6 group hover:bg-slate-50 transition-colors duration-500">
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                02
              </span>
              <h3 className="text-3xl font-bold text-slate-900">Precision.</h3>
              <p className="text-xl text-slate-500 font-light leading-relaxed">
                Accuracy and attention to detail are at the heart of aviation;
                we instill these principles through rigorous programs.
              </p>
            </div>
            <div className="p-12 sm:p-20 border-r border-b border-slate-100 space-y-6 group hover:bg-slate-50 transition-colors duration-500">
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                03
              </span>
              <h3 className="text-3xl font-bold text-slate-900">
                Global Reach.
              </h3>
              <p className="text-xl text-slate-500 font-light leading-relaxed">
                Connecting students to international opportunities and IATA
                certifications across Nigeria, the UK, and Canada.
              </p>
            </div>
            <div className="p-12 sm:p-20 border-r border-b border-slate-100 space-y-6 group hover:bg-slate-50 transition-colors duration-500">
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                04
              </span>
              <h3 className="text-3xl font-bold text-slate-900">Community.</h3>
              <p className="text-xl text-slate-500 font-light leading-relaxed">
                Dedicated to youth empowerment and fostering inclusive education
                to build a diverse aviation workforce.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

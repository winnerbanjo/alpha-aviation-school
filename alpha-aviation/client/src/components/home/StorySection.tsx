import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface StorySectionProps {
  aboutUsText: string;
  legacyText: string;
}

export function StorySection({ aboutUsText, legacyText }: StorySectionProps) {
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

        <div className="relative z-10 w-full h-full flex items-center justify-center px-4 sm:px-6">
          <motion.div
            style={{ opacity: textOpacity }}
            className="text-center space-y-12 max-w-5xl absolute pointer-events-none"
          >
            <span className="text-xs font-bold text-blue-400 uppercase tracking-[1em] mb-4 block drop-shadow-sm">
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

          <motion.div
            style={{ opacity: legacyOpacity }}
            className="flex flex-col lg:flex-row max-w-5xl  items-center justify-center w-full h-full py-32 absolute pointer-events-none"
          >
            <div className="lg:w-1/2 space-y-8 text-left">
              <span className="text-xs font-bold text-[#FF6B35] uppercase tracking-[1em] mb-4 block drop-shadow-sm">
                Our Legacy
              </span>
              <h3 className="text-5xl sm:text-7xl font-bold text-white leading-tight drop-shadow-md">
                A Global <br /> Footprint.
              </h3>
              <p className="text-lg text-slate-300 max-w-md font-medium drop-shadow-sm">
                From Nigeria to the UK and Canada, our legacy is built on the
                success of 500+ elite graduates.
              </p>
            </div>

            <div className="lg:w-1/3 flex flex-col gap-12">
              <div className="border-l-2 border-[#FF6B35] pl-8 py-2">
                <p className="text-6xl font-bold text-white drop-shadow-lg">
                  300+
                </p>
                <p className="text-xs text-slate-300 font-bold uppercase tracking-[0.5em] mt-2">
                  Students
                </p>
              </div>
              <div className="border-l-2 border-blue-400 pl-8 py-2">
                <p className="text-6xl font-bold text-white drop-shadow-lg">
                  500+
                </p>
                <p className="text-xs text-slate-300 font-bold uppercase tracking-[0.5em] mt-2">
                  Graduates
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

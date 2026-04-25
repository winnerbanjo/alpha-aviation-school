import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { AboutSEO } from "@/components/seo/SEO";

const values = [
  {
    icon: "material-symbols:award-star-outline",
    title: "Excellence",
    description:
      "We strive for the highest standards in every aspect of our training, ensuring our graduates excel in elite aviation environments.",
  },
  {
    icon: "material-symbols:target-play-outline",
    title: "Precision",
    description:
      "Accuracy and attention to detail are at the heart of aviation; we instill these principles through rigorous, hands-on programs.",
  },
  {
    icon: "material-symbols:public",
    title: "Global Reach",
    description:
      "Spanning Nigeria, the UK, and Canada, we connect students to international opportunities and IATA-aligned certifications.",
  },
  {
    icon: "material-symbols:groups-outline",
    title: "Community",
    description:
      "We are dedicated to youth empowerment and fostering inclusive education to build a diverse aviation workforce.",
  },
];

export function About() {
  return (
    <>
      <AboutSEO />

      {/* Cinematic Header */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/modern-cockpit.png"
            alt="About Alpha Aviation"
            className="w-full h-full object-cover grayscale brightness-50 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center pt-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-[10px] sm:text-[11px] font-extrabold text-[#FF6B35] uppercase tracking-[0.6em] mb-6 sm:mb-8"
          >
            Institutional Legacy
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-semibold text-white leading-[1.1] sm:leading-[1] tracking-tighter uppercase italic"
          >
            Our Story <br />
            Soaring Higher
          </motion.h1>
        </div>
      </section>

      {/* The Alpha Narrative (Split-Screen) */}
      <section className="py-20 sm:py-32 bg-white relative overflow-hidden text-center md:text-left">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8 sm:space-y-12"
            >
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900 leading-tight uppercase tracking-tight">
                  Defining the <br className="hidden sm:block" /> Future of
                  Flight.
                </h2>
                <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed max-w-xl mx-auto md:mx-0">
                  Alpha Step Links Aviation School is a certified and
                  fast-growing aviation training institution dedicated to
                  nurturing the next generation of aviation professionals. With
                  a presence in Nigeria, the United Kingdom, and Canada, we
                  specialize in high-quality programs including Aviation &
                  Travel Training, Ticketing & Reservation, and Cabin Crew
                  Courses.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 sm:gap-8 border-t border-slate-100 pt-10 sm:pt-12">
                <div className="space-y-1 sm:space-y-2 text-left">
                  <p className="text-xl sm:text-2xl font-semibold text-slate-950">
                    500+
                  </p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Graduates
                  </p>
                </div>
                <div className="space-y-1 sm:space-y-2 text-left">
                  <p className="text-xl sm:text-2xl font-semibold text-slate-950">
                    3
                  </p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Continents
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-video sm:aspect-square lg:aspect-video rounded-3xl overflow-hidden shadow-2xl group"
            >
              <img
                src="https://images.unsplash.com/photo-1544016768-982d1554f0b9?auto=format&fit=crop&q=80"
                alt="Legacy Excellence"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/40 to-transparent" />
              <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 p-4 sm:p-6 bg-white shadow-xl rounded-2xl border border-slate-100">
                <Icon
                  icon="mdi:airplane-marker"
                  width="24"
                  className="sm:w-8 text-[#FF6B35]"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values (Inverted Grid) */}
      <section className="relative bg-white py-20 sm:py-32 overflow-hidden border-t border-slate-50">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(#020617 1px, transparent 1px), linear-gradient(90deg, #020617 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-950 uppercase tracking-tight">
              Our Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-l border-t border-slate-100">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 sm:p-12 border-b border-r border-slate-100 hover:bg-slate-50 transition-all duration-500"
              >
                <div className="relative z-10 space-y-6 text-center md:text-left">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-50 flex items-center justify-center text-[#FF6B35] border border-slate-100 group-hover:border-[#FF6B35]/30 transition-colors mx-auto md:mx-0">
                    <Icon
                      icon={v.icon}
                      width="20"
                      height="20"
                      className="sm:w-6 sm:h-6"
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-950 uppercase tracking-tight">
                    {v.title}
                  </h3>
                  <p className="text-[13px] sm:text-sm text-slate-500 font-medium leading-relaxed group-hover:text-slate-600 transition-colors">
                    {v.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision (Authority Quote Layout) */}
      <section className="bg-slate-950 py-24 sm:py-32 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-20 sm:space-y-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8 sm:space-y-10"
          >
            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.5em]">
              The Mission
            </span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white leading-[1.2] sm:leading-[1.1] uppercase italic">
              "To deliver world-class training that empowers impactful careers
              in the dynamic aviation industry."
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-8 sm:space-y-10"
          >
            <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.5em]">
              The Vision
            </span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white leading-[1.2] sm:leading-[1.1] uppercase italic text-[#FF6B35]">
              "To inspire and train aviation professionals across continents,
              fostering innovation and safety."
            </h3>
          </motion.div>
        </div>

        {/* Subtle background element */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-5 flex items-center justify-center">
          <h1 className="text-[25vw] sm:text-[20vw] font-bold text-white whitespace-nowrap">
            MISSION
          </h1>
        </div>
      </section>
    </>
  );
}

import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

const features = [
  {
    title: "Global Internship Pathways",
    description:
      "Launch your career with exclusive placements in major aviation hubs across Nigeria, the UK, and Canada.",
    icon: "material-symbols:business-center-outline",
  },
  {
    title: "IATA Standard Curriculum",
    description:
      "Our programs are aligned with global industry standards, ensuring your certifications are recognized worldwide.",
    icon: "material-symbols:verified-outline",
  },
  {
    title: "Elite Career Mentorship",
    description:
      "Learn directly from seasoned pilots, cabin crew leads, and aviation executives with decades of experience.",
    icon: "material-symbols:school-outline",
  },
  {
    title: "Advanced Flight Theory",
    description:
      "Deep-dive into modern aerodynamics, navigation, and safety protocols using cutting-edge instructional tech.",
    icon: "material-symbols:flight-land-rounded",
  },
  {
    title: "International Certifications",
    description:
      "Gain the credentials needed to operate in international airspace and global airport operations.",
    icon: "material-symbols:public",
  },
  {
    title: "Flexible Learning Modes",
    description:
      "Balance your lifestyle with hybrid training options designed for busy professionals and elite students.",
    icon: "material-symbols:calendar-month-outline",
  },
];

export function TrustGrid() {
  return (
    <section className="relative bg-slate-950 py-32 overflow-hidden">
      {/* Tiled Grid Background System (Dark Theme) */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="text-center mb-24 space-y-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-white leading-tight uppercase tracking-tight"
          >
            The Alpha <br className="md:hidden" /> Advantage
          </motion.h2>
        </div>

        {/* Feature Tiles Grid (Dark Theme) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-l border-t border-white/5">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group relative p-8 sm:p-12 border-b border-r border-white/5 hover:bg-white/[0.02] transition-all duration-500 overflow-hidden"
            >
              {/* Animated Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0061FF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

              <div className="relative z-10 space-y-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-900 flex items-center justify-center text-[#FF6B35] border border-white/10 group-hover:border-[#FF6B35]/50 transition-colors">
                  <Icon
                    icon={feature.icon}
                    width="20"
                    height="20"
                    className="sm:w-6 sm:h-6"
                  />
                </div>

                <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                  {feature.title}
                </h3>

                <p className="text-sm text-slate-400 font-medium leading-relaxed group-hover:text-slate-300 transition-colors">
                  {feature.description}
                </p>
              </div>

              {/* Tiled corner accent */}
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Icon
                  icon="lucide:grid-3x3"
                  width="40"
                  className="text-white sm:w-[60px]"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Global Slogan (Dark Theme) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 flex flex-col md:flex-row items-center justify-between gap-10 border-t border-white/5 pt-12"
        >
          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-slate-950 bg-slate-900 flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={`https://i.pravatar.cc/100?u=student${i}`}
                    alt="Student"
                  />
                </div>
              ))}
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">
              Joined by <span className="text-white">5,000+</span> Elite
              Students
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-3">
              <Icon icon="flag:ng-4x3" width="16" className="sm:w-5" />
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                Nigeria
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Icon icon="flag:gb-4x3" width="16" className="sm:w-5" />
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                UK
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Icon icon="flag:ca-4x3" width="16" className="sm:w-5" />
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                Canada
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

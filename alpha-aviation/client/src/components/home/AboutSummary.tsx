import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

export function AboutSummary() {
  return (
    <section className="relative bg-white py-24 overflow-hidden border-b border-slate-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Content */}
          <div className="space-y-5 lg:space-y-8">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-6xl font-black text-slate-900 leading-tight sm:leading-[0.95] tracking-tight uppercase"
            >
              Defining the <br />
              New Standards <br />
              <span className="text-[#0061FF]">of Excellence.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg max-w-lg leading-relaxed text-slate-500"
            >
              Alpha Step Links Aviation School is a global training institution
              bridging Nigeria, the UK, and Canada. We specialize in high-impact
              programs designed for the next generation of aviation pioneers.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4"
            >
              <div className="space-y-2">
                <Icon
                  icon="ph:globe-hemisphere-west-fill"
                  width="28"
                  className="sm:w-8 text-[#FF6B35]"
                />
                <h4 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-widest">
                  Global Reach
                </h4>
                <p className="text-[10px] sm:text-xs text-slate-400 font-bold leading-relaxed">
                  Present in Nigeria, UK & Canada.
                </p>
              </div>
              <div className="space-y-2">
                <Icon
                  icon="ph:star-four-fill"
                  width="28"
                  className="sm:w-8 text-[#0061FF]"
                />
                <h4 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-widest">
                  IATA Aligned
                </h4>
                <p className="text-[10px] sm:text-xs text-slate-400 font-bold leading-relaxed">
                  Industry standard curriculum.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Visual Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl sm:rounded-[3rem] overflow-hidden shadow-2xl">
              <img
                src="/aviation-academy-story.png"
                alt="Aviation Excellence"
                className="w-full h-[300px] sm:h-[500px] object-cover brightness-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
            </div>

            {/* Decorative Accents */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#FF6B35]/10 rounded-full blur-3xl hidden sm:block" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#0061FF]/10 rounded-full blur-3xl hidden sm:block" />

            <div className="absolute -bottom-6 -right-6 sm:bottom-10 sm:-left-10 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl z-20">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 rounded-xl sm:rounded-2xl flex items-center justify-center text-white">
                  <Icon icon="mdi:airplane" width="20" className="sm:w-6" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                    10k+
                  </p>
                  <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Graduates
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

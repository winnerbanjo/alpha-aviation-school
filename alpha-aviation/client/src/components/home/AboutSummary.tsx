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
              className="text-4xl sm:text-6xl font-black text-slate-900 lg:leading-[0.95] lg:tracking-tight lg:uppercase"
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
              className="text-lg  max-w-lg "
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
              className="grid grid-cols-2 gap-8 pt-4"
            >
              <div className="space-y-2">
                <Icon
                  icon="ph:globe-hemisphere-west-fill"
                  width="32"
                  className="text-[#FF6B35]"
                />
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest">
                  Global Reach
                </h4>
                <p className="text-xs text-slate-400 font-bold leading-relaxed">
                  Present in Nigeria, UK & Canada.
                </p>
              </div>
              <div className="space-y-2">
                <Icon
                  icon="ph:star-four-fill"
                  width="32"
                  className="text-[#0061FF]"
                />
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest">
                  IATA Aligned
                </h4>
                <p className="text-xs text-slate-400 font-bold leading-relaxed">
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
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl skew-y-1">
              <img
                src="/aviation-academy-story.png"
                alt="Aviation Excellence"
                className="w-full h-[500px] object-cover brightness-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
            </div>

            {/* Decorative Accents */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#FF6B35]/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#0061FF]/10 rounded-full blur-3xl" />

            <div className="absolute bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-xl z-20 hidden md:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                  <Icon icon="mdi:airplane" width="24" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 leading-none">
                    10k+
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
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

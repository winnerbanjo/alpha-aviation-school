import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Cinematic Background Layering */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="w-full h-full"
        >
          <img
            src="/clean-airplane-interior.jpg"
            alt="Cinematic Aviation background"
            className="w-full h-full object-cover grayscale-[30%] brightness-75 scale-110"
          />
        </motion.div>

        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-slate-950 to-transparent" />

        {/* Moving Glare/Light Effects */}
        <motion.div
          animate={{
            x: ["-100%", "100%"],
            opacity: [0, 0.2, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] pointer-events-none"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 w-full py-32">
        <div className="max-w-4xl space-y-10">
          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-[3rem] sm:text-[6rem] md:text-[7.5rem] lg:text-[8.5rem] font-black text-white leading-[0.95] sm:leading-[0.85] tracking-tighter uppercase"
          >
            Elevating <br />
            The Sky <span className="text-[#FF6B35]">.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-base sm:text-xl text-white max-w-2xl font-normal leading-relaxed"
          >
            Alpha Step Links Aviation School is a global beacon of excellence.
            From expert pilot training to elite travel management.
          </motion.p>

          {/* CTA Group */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-6"
          >
            <Link to="/enroll" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto group relative bg-[#FF6B35] hover:bg-[#E55A26] text-white px-8 lg:px-10 py-4 lg:py-6 rounded-full font-bold transition-all shadow-2xl shadow-orange-950/20 flex items-center justify-center gap-4 overflow-hidden">
                <span className="relative z-10 uppercase tracking-widest text-xs lg:text-sm">
                  Start Your Journey
                </span>
                <Icon
                  icon="mdi:airplane-takeoff"
                  className="relative z-10 w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-2 transition-transform"
                />
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom Global Status Bar (Institutional Presence) */}
      <div className="absolute bottom-8 sm:bottom-12 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-12 border-t border-white/10 pt-8 sm:pt-10"
          >
            <div className="flex items-center gap-8 text-slate-500">
              <div className="flex items-center gap-3 group">
                <Icon
                  icon="ph:certificate-fill"
                  width="20"
                  className="sm:w-6 group-hover:text-white transition-colors"
                />
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                  IATA Aligned
                </span>
              </div>
              <div className="flex items-center gap-3 group">
                <Icon
                  icon="ph:star-four-fill"
                  width="20"
                  className="sm:w-6 group-hover:text-white transition-colors"
                />
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                  ISO Certified
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

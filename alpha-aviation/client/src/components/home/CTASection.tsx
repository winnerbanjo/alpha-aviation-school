import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="relative h-auto bg-white py-16 sm:py-32 overflow-hidden">
      <div className="mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] sm:text-[11px] font-black text-slate-900 uppercase tracking-[0.5em] mb-4 sm:mb-6"
          >
            Take the Next Step
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-6 sm:mb-8 uppercase"
          >
            Join Us & <span className="text-[#0061FF]">Fly!</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-500 max-w-2xl mb-10 sm:mb-12 font-medium leading-relaxed"
          >
            Ready to work together? Talk with one of our industry experts to
            discuss <br className="hidden md:block" /> your goals and see how we
            can help you accelerate your aviation career.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/enroll">
              <button className="bg-[#4361EE] hover:bg-[#324fdb] text-white px-10 py-5 rounded-full font-bold transition-all shadow-xl shadow-blue-200">
                Let's talk!
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Arched Window Visuals */}
        <div className="absolute  inset-0 pointer-events-none flex justify-between items-center px-4 md:px-12 opacity-40 md:opacity-100">
          {/* Left Arch */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="hidden lg:block  absolute  top-[10%] w-[300px] h-[500px] rounded-t-full overflow-hidden border-2 border-slate-50 shadow-2xl rotate-[-5deg]"
          >
            <img
              src="/people-portrait-with-plane-flying-sky.jpg"
              alt="Aviation Scene"
              className="w-full h-full object-cover grayscale-[20%] brightness-110"
            />
          </motion.div>

          {/* Right Arch */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="hidden lg:block absolute right-[-5%] top-[-5%] w-[350px] h-[600px] rounded-t-full overflow-hidden border-2 border-slate-50 shadow-2xl rotate-[3deg]"
          >
            <img
              src="/wing.png"
              alt="Aviation Wing"
              className="w-full h-full object-cover scale-150"
            />
          </motion.div>
        </div>
      </div>

      {/* Decorative Blur Slogans in background as well if needed, but let's keep it clean as per reference */}
    </section>
  );
}

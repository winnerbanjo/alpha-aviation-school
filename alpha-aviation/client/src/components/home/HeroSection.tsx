import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plane, GraduationCap } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-start overflow-hidden bg-gradient-to-b from-[#e3f2fd] via-[#f0f8ff] to-white pt-40 pb-20">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
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
  );
}

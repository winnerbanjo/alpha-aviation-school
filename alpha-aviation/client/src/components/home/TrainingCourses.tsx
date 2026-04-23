import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const professionalCourses = [
  {
    id: "air-ticketing",
    title: "Air Ticketing & Reservation Management",
    icon: "material-symbols:local-activity-outline",
    description:
      "Master the global distribution systems and reservation protocols used by major airlines.",
    image: "/smiling-traveler-with-suitcase.jpg",
    studentCount: "1,250",
  },
  {
    id: "customer-service",
    title: "Customer Service & Communication",
    icon: "material-symbols:headset-mic-outline",
    description:
      "Develop the elite interpersonal skills required for excellence in aviation passenger handling.",
    image: "/smiling-female-staff-standing.jpg",
    studentCount: "3,800",
  },
  {
    id: "hospitality",
    title: "Hospitality & Tourism Management",
    icon: "material-symbols:hotel-outline",
    description:
      "Strategic management training for the luxury hospitality and international tourism sectors.",
    image: "/black-woman-with-suitcase-airport.jpg",
    studentCount: "2,100",
  },
  {
    id: "travel-agency",
    title: "Travel Agency Operations",
    icon: "material-symbols:public",
    description:
      "Comprehensive training on the commercial and operational side of global travel agencies.",
    image: "/people-portrait-with-plane-flying-sky.jpg",
    studentCount: "950",
  },
  {
    id: "visa-processing",
    title: "Visa Processing & Documentation",
    icon: "material-symbols:description-outline",
    description:
      "Specialized expertise in international travel regulations and complex visa documentation.",
    image: "/aviation-academy-story.png",
    studentCount: "4,600",
  },
  {
    id: "tourism-marketing",
    title: "Tourism Marketing & Entrepreneurship",
    icon: "material-symbols:trending-up",
    description:
      "Launch your own aviation business with expert marketing and entrepreneurial strategies.",
    image: "/clean-airplane-interior.jpg",
    studentCount: "1,150",
  },
];

export function TrainingCourses() {
  return (
    <section
      id="courses"
      className="relative bg-[#F8FAFC] py-20 lg:py-32 overflow-hidden"
    >
      {/* Background Cinematic Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.25]">
        {/* Large Decorative Slogan in Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
          <h2 className="text-[15rem] md:text-[25rem] font-black uppercase text-slate-200/50 leading-none whitespace-nowrap">
            Alpha Aviation school
          </h2>
        </div>

        {/* Floating Flight Elements */}
        <motion.div
          animate={{
            x: ["-10%", "110%"],
            y: [0, -30, 0],
            rotate: [5, 10, 5],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-0 text-slate-200/40"
        >
          <Icon
            icon="game-icons:commercial-airplane"
            width="400"
            height="400"
          />
        </motion.div>

        <motion.div
          animate={{
            x: ["110%", "-10%"],
            y: [0, 40, 0],
            rotate: [-5, -15, -5],
          }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-0 text-slate-200/30"
        >
          <Icon icon="mdi:airplane-takeoff" width="300" height="300" />
        </motion.div>

        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-100 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 lg:mb-24 gap-7 lg:gap-12">
          <div className="space-y-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black text-slate-900 lg:leading-[0.95] lg:tracking-tight lg:uppercase"
            >
              Elite Training <br /> Programs .
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg  max-w-md font-normal"
          >
            A high-fidelity curriculum tailored for the modern aviation
            industry, blending operational excellence with world-class
            standards.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {professionalCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="group relative bg-white cursor-pointer rounded-[2rem] overflow-hidden border border-slate-100 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.08)] flex flex-col h-full transition-all duration-500 hover:shadow-[0_40px_70px_-20px_rgba(0,0,0,0.12)]"
            >
              {/* Image Section (2/5ths of the card) */}
              <div className="relative h-[240px] overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Icon Badge */}
                <div className="absolute bottom-6 right-6 w-14 h-14 rounded-2xl bg-white/95 backdrop-blur-md flex items-center justify-center text-slate-900 shadow-xl transform transition-transform group-hover:translate-y-1">
                  <Icon icon={course.icon} width="28" height="28" />
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-slate-900 leading-[1.2] uppercase tracking-tight transition-colors">
                    {course.title}
                  </h3>
                </div>

                <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1 font-medium">
                  {course.description}
                </p>

                {/* Social Proof - No enroll button, just student count */}
                <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden"
                        >
                          <img
                            src={`https://i.pravatar.cc/100?u=${course.id}${i}`}
                            alt="Student"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 leading-none">
                        {course.studentCount}+
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Graduates
                      </span>
                    </div>
                  </div>

                  <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#FF6B35]/10 group-hover:text-[#FF6B35] transition-all">
                    <Icon
                      icon="material-symbols:arrow-outward"
                      width="18"
                      height="18"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <Link to="/courses">
            <button className="px-12 py-5 bg-transparent border-2 border-slate-900 text-slate-900 rounded-full font-black uppercase text-sm tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-xl shadow-slate-200/50">
              Explore All Programs
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

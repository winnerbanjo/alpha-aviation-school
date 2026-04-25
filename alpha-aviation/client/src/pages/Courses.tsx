import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { CoursesSEO } from "@/components/seo/SEO";
import { Link } from "react-router-dom";

const licensedCourses = [
  "Airline Cabin Crew Training",
  "Airline Customer Service",
  "Airport Operations Fundamental",
  "Cargo Introductory Course",
  "Foundation in Travel & Tourism with Galileo",
];

const professionalCourses = [
  {
    id: "air-ticketing",
    title: "Air Ticketing & Reservation Management",
    icon: "material-symbols:local-activity-outline",
    duration: "4 weeks",
    outline: [
      "Introduction to Airline Operations & Industry Structure",
      "IATA Codes, Geography & Global Airline Network",
      "Passenger Handling Procedures & Travel Documentation",
      "Reservations & GDS Workflow",
      "Fare Construction & Fare Rules",
      "Ticketing & E-Ticketing Practices",
      "Refunds, Reissues & Irregular Operations",
      "Customer Service, Complaint Handling & Service Recovery",
      "Practical GDS Workshops & Mock BSP Reporting",
      "Final Review, Examination & Certification",
    ],
  },
  {
    id: "customer-service",
    title: "Customer Service & Communication in Aviation",
    icon: "material-symbols:support-agent",
    duration: "4 weeks",
    outline: [
      "Introduction to Aviation Customer Service",
      "Principles of Customer Care & Service Culture",
      "Communication Techniques in Aviation",
      "Handling Difficult Passengers & Service Recovery",
      "Cross-Cultural Awareness & Sensitivity in Aviation",
      "Complaint Management, Escalation & Documentation",
      "Documentation & Reporting",
      "Practical Scenarios & Role-Play Exercises",
      "Summary & Key Learning Points",
    ],
  },
  {
    id: "hospitality",
    title: "Hospitality & Tourism Management",
    icon: "material-symbols:apartment",
    duration: "4 weeks",
    outline: [
      "Introduction to Hospitality & Tourism Management",
      "Overview of the Aviation, Hospitality, and Tourism Industry",
      "Organization Structure of Hospitality and Aviation Services",
      "Customer Service Excellence in Aviation & Tourism",
      "Airport and Airline Hospitality Operations",
      "Tourism Management and Travel Operations",
      "Airline Cabin Services and In-Flight Hospitality",
      "Ground Handling and Airport Passenger Services",
      "Communication Skills and Professional Grooming",
      "Safety, Security, and Emergency Management",
      "Aviation Law, Ethics, and Professional Conduct",
      "Technology in Hospitality, Tourism, and Aviation",
      "Cultural Awareness and International Tourism",
      "Career Opportunities in Aviation, Hospitality & Tourism",
    ],
  },
  {
    id: "travel-agency",
    title: "Travel Agency Operations",
    icon: "material-symbols:public",
    duration: "4 weeks",
    outline: [
      "Introduction to the travel industry",
      "Travel products and services",
      "Reservations and booking procedures",
      "Travel documentation",
      "Tour planning and Itinerary development",
      "Legal, Ethical and regulatory issues",
      "Practical training and case studies",
    ],
  },
  {
    id: "visa-processing",
    title: "Visa Processing & Documentation",
    icon: "material-symbols:description-outline",
    duration: "4 weeks",
    outline: [
      "Definition of visa processing and documentation",
      "Introduction to visa processing",
      "Types of visas",
      "Visa application procedures",
      "Visa documentation requirements",
      "Document verification and assessment",
      "Customer service and communication",
      "Practical training and case studies",
    ],
  },
  {
    id: "hotel-management",
    title: "Hotel & Front Office Management",
    icon: "material-symbols:concierge-outline",
    duration: "4 weeks",
    outline: [
      "Introduction to Hospitality in Aviation",
      "Overview of Hotel Operations",
      "Front Office Department: Roles & Responsibilities",
      "Guest Cycle in Hotel Operations",
      "Front Office Procedures & Systems",
      "Customer Service Excellence in Front Office Management",
      "Handling Complaints & Service Recovery",
      "Cultural Awareness & Professional Ethics",
      "Safety, Security & Emergency Procedures",
      "Revenue & Financial Awareness",
      "Technology & Innovation in Hotel Front Office",
      "Professional Grooming & Workplace Etiquette",
      "Career Opportunities in Hotel & Aviation Hospitality",
      "Practical Scenarios & Case Studies",
      "Summary & Key Learning Points",
    ],
  },
  {
    id: "tourism-marketing",
    title: "Tourism Marketing & Entrepreneurship",
    icon: "material-symbols:trending-up",
    duration: "4 weeks",
    outline: [
      "Foundations of Tourism & Travel Industry Marketing",
      "Tourist Behaviour, Customer Needs & Service Excellence",
      "Tourism Products, Packaging & Distribution Channels",
      "Destination Marketing, Branding & Promotion",
      "Digital Tourism Marketing & Modern Travel Retailing",
      "Tourism Entrepreneurship, Professionalism & Career Paths",
    ],
  },
];

export function Courses() {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const toggleCourse = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  return (
    <>
      <CoursesSEO />

      {/* Cinematic Header */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/programs-hero.png"
            alt="Elite Programs"
            className="w-full h-full object-cover grayscale brightness-50 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center pt-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-[10px] sm:text-[11px] font-extrabold text-[#FF6B35] uppercase tracking-[0.6em] mb-6 sm:mb-8"
          >
            Institutional Mastery
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-semibold text-white leading-[1.1] sm:leading-[1] tracking-tighter uppercase italic"
          >
            Training <br />
            Excellence
          </motion.h1>
        </div>
      </section>

      {/* Licensed Excellence (Deep Section) */}
      <section className="relative bg-white py-24 sm:py-32 overflow-hidden">
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 text-center md:text-left"
          >
            <h2 className="text-2xl sm:text-4xl font-semibold text-slate-950 uppercase tracking-tight mb-4">
              Licensed Excellence
            </h2>
            <p className="text-slate-500 font-medium tracking-wide uppercase text-xs">
              Industry Certified & IATA Aligned Programs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-l border-t border-slate-100">
            {licensedCourses.map((course, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group p-8 sm:p-12 border-b border-r border-slate-100 hover:bg-slate-50 transition-all duration-500"
              >
                <div className="space-y-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#FF6B35] border border-slate-100 group-hover:border-[#FF6B35]/30 transition-colors">
                    <Icon icon="material-symbols:verified-outline" width="20" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-950 uppercase tracking-tight leading-tight">
                    {course}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-slate-200" />
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Certified Program
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Mastery (Dark Section) */}
      <section className="bg-slate-950 py-24 sm:py-32 relative overflow-hidden">
        {/* Subtle grid for dark section */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 text-center"
          >
            <span className="text-[10px] font-extrabold text-[#FF6B35] uppercase tracking-[0.6em] mb-6 block">
              Global Standards
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-white uppercase tracking-tight mb-4 italic">
              Professional Mastery
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/5 border border-white/5 overflow-hidden rounded-3xl shadow-2xl">
            {professionalCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900 p-8 sm:p-12 hover:bg-slate-800/50 transition-all duration-500 group flex flex-col"
              >
                <div className="flex-1 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-[#FF6B35] border border-white/5 group-hover:border-[#FF6B35]/30 transition-all">
                      <Icon icon={course.icon} width="24" />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-full border border-white/5">
                      {course.duration}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl sm:text-2xl font-semibold text-white uppercase tracking-tighter leading-none">
                      {course.title}
                    </h3>
                  </div>

                  <div>
                    <button
                      onClick={() => toggleCourse(course.id)}
                      className="flex items-center gap-4 text-xs font-extrabold text-[#FF6B35] uppercase tracking-[0.2em] group/btn"
                    >
                      <span className="border-b border-[#FF6B35]/0 group-hover/btn:border-[#FF6B35] transition-all">
                        {expandedCourse === course.id
                          ? "Collapse Curriculum"
                          : "View Full Curriculum"}
                      </span>
                      <Icon
                        icon="heroicons:chevron-down-20-solid"
                        className={`transition-transform duration-500 ${
                          expandedCourse === course.id ? "rotate-180" : ""
                        }`}
                        width="16"
                      />
                    </button>

                    <AnimatePresence>
                      {expandedCourse === course.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: "circOut" }}
                          className="overflow-hidden"
                        >
                          <ul className="pt-8 space-y-4">
                            {course.outline.map((item, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-4 text-slate-400 group/item"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B35]/30 mt-1.5 shrink-0 group-hover/item:bg-[#FF6B35] transition-colors" />
                                <span className="text-[13px] font-medium leading-relaxed">
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Massive Institutional Quote */}
      <section className="bg-white py-32 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-5 overflow-hidden flex items-center justify-center">
          <h1 className="text-[30vw] font-bold text-slate-950 whitespace-nowrap italic">
            EXCELLENCE
          </h1>
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-12">
          <Icon
            icon="ri:double-quotes-l"
            width="60"
            className="text-[#FF6B35] mx-auto opacity-20"
          />
          <h2 className="text-2xl md:text-4xl font-semibold text-slate-900 uppercase leading-[1.1] italic">
            "We don't just train aviation staff; we engineer the next generation
            of global aerospace leaders."
          </h2>
          <div className="flex items-center justify-center gap-6">
            <div className="h-px w-12 bg-slate-200" />
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.5em]">
              The Alpha Philosophy
            </span>
            <div className="h-px w-12 bg-slate-200" />
          </div>
        </div>
      </section>
    </>
  );
}

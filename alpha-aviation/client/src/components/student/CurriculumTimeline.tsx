import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { ModuleDetailsModal } from "./ModuleDetailsModal";

interface Module {
  name: string;
  completed: boolean;
}

interface CurriculumTimelineProps {
  course: string;
}

const courseModules: Record<string, Module[]> = {
  "Aviation Fundamentals & Strategy": [
    { name: "Meteorology", completed: true },
    { name: "Air Law", completed: true },
    { name: "Navigation", completed: false },
    { name: "Flight Ops", completed: false },
    { name: "Aircraft Systems", completed: false },
  ],
  "Elite Cabin Crew & Safety Operations": [
    { name: "Aviation Safety", completed: true },
    { name: "Safety Ops", completed: true },
    { name: "First Aid", completed: false },
    { name: "In-flight Service", completed: false },
    { name: "Emergency Protocols", completed: false },
  ],
  "Travel & Tourism Management": [
    { name: "Tourism Fundamentals", completed: true },
    { name: "Travel Planning", completed: false },
    { name: "Destination Management", completed: false },
  ],
  "Airline Customer Service & Passenger Handling": [
    { name: "Service Excellence", completed: true },
    { name: "Check-in Procedures", completed: false },
    { name: "Baggage Handling", completed: false },
  ],
  "Aviation Safety & Security Awareness": [
    { name: "Safety Systems", completed: true },
    { name: "Security Protocols", completed: false },
    { name: "Risk Assessment", completed: false },
  ],
  "Ticketing & Reservation Systems (GDS Training)": [
    { name: "GDS Introduction", completed: true },
    { name: "Booking Systems", completed: false },
    { name: "Ticketing Operations", completed: false },
  ],
};

export function CurriculumTimeline({ course }: CurriculumTimelineProps) {
  const modules = courseModules[course] || [
    { name: "Module 1: Course Modules", completed: false },
  ];
  const [selectedModule, setSelectedModule] = useState<{
    name: string;
    completed: boolean;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModuleClick = (module: { name: string; completed: boolean }) => {
    setSelectedModule(module);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="space-y-5">
        <div>
          <span className="eyebrow text-[#1246C8]">Flight path</span>
          <h3 className="mt-2 text-xl font-bold tracking-tighter text-[#10264B]">
            Course Journey
          </h3>
        </div>
        <div className="relative">
          {/* Vertical Line */}
          <div aria-hidden className="absolute left-[19px] top-2 bottom-2 border-l-2 border-dashed border-[#DCE2EB]" />

          {/* Modules */}
          <div className="space-y-6">
            {modules.map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-4 cursor-pointer group group/row"
                onClick={() => handleModuleClick(module)}
              >
                {/* Flown segment of the flight path */}
                <div
                  aria-hidden
                  className={`absolute left-[19px] top-10 -bottom-6 border-l-2 group-last/row:hidden ${
                    module.completed ? "border-[#1246C8]" : "border-transparent"
                  }`}
                />

                {/* Icon */}
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white transition-transform group-hover:scale-110 ${
                    module.completed
                      ? "bg-[#1246C8] shadow-glow"
                      : "bg-[#F5F7FB] ring-1 ring-[#DCE2EB] group-hover:ring-[#1246C8]/40"
                  }`}
                >
                  {module.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-[#8C9AB0]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <p
                    className={`text-sm font-semibold transition-colors group-hover:text-[#1246C8] ${
                      module.completed ? "text-[#10264B]" : "text-[#53647C]"
                    }`}
                  >
                    {module.name}
                  </p>
                  {module.completed && (
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Completed</p>
                  )}
                  <p className="mt-1 text-xs font-medium text-[#1246C8] opacity-0 transition-opacity group-hover:opacity-100">
                    Click for details →
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Module Details Modal */}
      {selectedModule && (
        <ModuleDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          moduleName={selectedModule.name}
          completed={selectedModule.completed}
          course={course}
        />
      )}
    </>
  );
}

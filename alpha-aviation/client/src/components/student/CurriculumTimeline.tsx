import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'
import { ModuleDetailsModal } from './ModuleDetailsModal'

interface Module {
  name: string
  completed: boolean
}

interface CurriculumTimelineProps {
  course: string
}

const courseModules: Record<string, Module[]> = {
  'Aviation Fundamentals & Strategy': [
    { name: 'Meteorology', completed: true },
    { name: 'Air Law', completed: true },
    { name: 'Navigation', completed: false },
    { name: 'Flight Ops', completed: false },
    { name: 'Aircraft Systems', completed: false },
  ],
  'Elite Cabin Crew & Safety Operations': [
    { name: 'Aviation Safety', completed: true },
    { name: 'Safety Ops', completed: true },
    { name: 'First Aid', completed: false },
    { name: 'In-flight Service', completed: false },
    { name: 'Emergency Protocols', completed: false },
  ],
  'Travel & Tourism Management': [
    { name: 'Tourism Fundamentals', completed: true },
    { name: 'Travel Planning', completed: false },
    { name: 'Destination Management', completed: false },
  ],
  'Airline Customer Service & Passenger Handling': [
    { name: 'Service Excellence', completed: true },
    { name: 'Check-in Procedures', completed: false },
    { name: 'Baggage Handling', completed: false },
  ],
  'Aviation Safety & Security Awareness': [
    { name: 'Safety Systems', completed: true },
    { name: 'Security Protocols', completed: false },
    { name: 'Risk Assessment', completed: false },
  ],
  'Ticketing & Reservation Systems (GDS Training)': [
    { name: 'GDS Introduction', completed: true },
    { name: 'Booking Systems', completed: false },
    { name: 'Ticketing Operations', completed: false },
  ],
}

export function CurriculumTimeline({ course }: CurriculumTimelineProps) {
  const modules = courseModules[course] || [
    { name: 'Module 1: Course Modules', completed: false },
  ]
  const [selectedModule, setSelectedModule] = useState<{ name: string; completed: boolean } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleModuleClick = (module: { name: string; completed: boolean }) => {
    setSelectedModule(module)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight text-slate-900">
          Course Journey
        </h3>
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
          
          {/* Modules */}
          <div className="space-y-6">
            {modules.map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-4 cursor-pointer group"
                onClick={() => handleModuleClick(module)}
              >
                {/* Icon */}
                <div className={`relative z-10 p-1.5 rounded-full transition-all group-hover:scale-110 ${
                  module.completed 
                    ? 'bg-green-100 group-hover:bg-green-200' 
                    : 'bg-slate-100 group-hover:bg-slate-200'
                }`}>
                  {module.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 pt-1">
                  <p className={`text-sm font-medium transition-colors group-hover:text-[#0061FF] ${
                    module.completed 
                      ? 'text-slate-900' 
                      : 'text-slate-500'
                  }`}>
                    {module.name}
                  </p>
                  {module.completed && (
                    <p className="text-xs text-slate-400 mt-1">Completed</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
  )
}

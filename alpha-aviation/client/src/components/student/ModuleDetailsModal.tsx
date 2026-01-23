import { Modal } from '@/components/ui/modal'
import { CheckCircle2, Clock, BookOpen, Award } from 'lucide-react'
import { motion } from 'framer-motion'

interface ModuleDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  moduleName: string
  completed: boolean
  course: string
}

const moduleDetails: Record<string, Record<string, { description: string; duration: string; topics: string[] }>> = {
  'Aviation Fundamentals & Strategy': {
    'Meteorology': {
      description: 'Understanding weather patterns, atmospheric conditions, and their impact on flight operations.',
      duration: '4 weeks',
      topics: ['Weather Systems', 'Atmospheric Pressure', 'Wind Patterns', 'Weather Forecasting']
    },
    'Air Law': {
      description: 'Comprehensive study of aviation regulations, airspace classifications, and legal requirements.',
      duration: '3 weeks',
      topics: ['ICAO Regulations', 'Airspace Classifications', 'Flight Rules', 'Legal Responsibilities']
    },
    'Navigation': {
      description: 'Master navigation techniques including charts, GPS, and traditional navigation methods.',
      duration: '5 weeks',
      topics: ['Chart Reading', 'GPS Systems', 'Dead Reckoning', 'Radio Navigation']
    },
    'Flight Ops': {
      description: 'Operational procedures, flight planning, and safety protocols for commercial aviation.',
      duration: '6 weeks',
      topics: ['Flight Planning', 'Operational Procedures', 'Safety Protocols', 'Emergency Procedures']
    },
    'Aircraft Systems': {
      description: 'In-depth understanding of aircraft systems, engines, and avionics.',
      duration: '5 weeks',
      topics: ['Engine Systems', 'Avionics', 'Hydraulic Systems', 'Electrical Systems']
    }
  },
  'Elite Cabin Crew & Safety Operations': {
    'Aviation Safety': {
      description: 'Fundamental safety principles and procedures for cabin crew operations.',
      duration: '3 weeks',
      topics: ['Safety Regulations', 'Emergency Equipment', 'Safety Briefings', 'Cabin Safety']
    },
    'Safety Ops': {
      description: 'Advanced safety operations and emergency response procedures.',
      duration: '4 weeks',
      topics: ['Emergency Procedures', 'Evacuation Protocols', 'Fire Safety', 'Medical Emergencies']
    },
    'First Aid': {
      description: 'Medical first aid training for in-flight medical emergencies.',
      duration: '2 weeks',
      topics: ['CPR', 'Medical Emergencies', 'First Aid Kits', 'Patient Assessment']
    },
    'In-flight Service': {
      description: 'Premium service delivery and customer interaction techniques.',
      duration: '4 weeks',
      topics: ['Service Excellence', 'Customer Interaction', 'Meal Service', 'Special Requests']
    },
    'Emergency Protocols': {
      description: 'Comprehensive emergency response and crisis management training.',
      duration: '3 weeks',
      topics: ['Emergency Landings', 'Crisis Management', 'Passenger Management', 'Communication']
    }
  }
}

export function ModuleDetailsModal({
  isOpen,
  onClose,
  moduleName,
  completed,
  course
}: ModuleDetailsModalProps) {
  const details = moduleDetails[course]?.[moduleName] || {
    description: 'Module details coming soon.',
    duration: 'TBD',
    topics: []
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={moduleName}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          {completed ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Completed</span>
            </>
          ) : (
            <>
              <Clock className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium text-slate-500">In Progress</span>
            </>
          )}
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Description
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">{details.description}</p>
        </div>

        {/* Duration */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Duration
          </h4>
          <p className="text-sm text-slate-600">{details.duration}</p>
        </div>

        {/* Topics */}
        {details.topics.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Key Topics
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {details.topics.map((topic, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg"
                >
                  <div className="w-1.5 h-1.5 bg-[#0061FF] rounded-full" />
                  <span className="text-sm text-slate-700">{topic}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </Modal>
  )
}

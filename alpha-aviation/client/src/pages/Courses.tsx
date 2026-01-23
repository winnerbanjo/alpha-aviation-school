import { motion } from 'framer-motion'
import { TopBar } from '@/components/TopBar'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plane, Users, Briefcase, Shield, Globe, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'

const courses = [
  {
    id: 'pilot',
    title: 'Private Pilot License (PPL)',
    icon: Plane,
    description: 'Comprehensive flight training program covering meteorology, navigation, air law, and flight operations. Includes 40 flight hours with certified instructors. Perfect for aspiring commercial pilots.',
    modules: ['Meteorology', 'Air Law', 'Navigation', 'Flight Operations', 'Aircraft Systems'],
    duration: '18 Months',
    flightHours: '40 Hours',
    price: '₦4,500,000',
    priceNote: 'Includes flight hours and ground school'
  },
  {
    id: 'cabin-crew',
    title: 'Cabin Crew Excellence',
    icon: Users,
    description: 'Elite cabin crew training focusing on aviation safety protocols, first aid certification, grooming standards, and in-flight service excellence. Launch your career in the skies with world-class training.',
    modules: ['Aviation Safety', 'Safety Operations', 'First Aid & CPR', 'In-flight Service', 'Emergency Protocols'],
    duration: '6 Months',
    flightHours: 'N/A',
    price: '₦850,000',
    priceNote: 'Includes certification and uniform'
  },
  {
    id: 'ground-operations',
    title: 'Ground Operations',
    icon: Briefcase,
    description: 'Master ground operations including logistics management, safety protocols, ticketing systems, and baggage handling. Essential skills for airport operations and airline ground staff.',
    modules: ['Logistics Management', 'Safety Protocols', 'Ticketing Systems', 'Baggage Handling', 'Check-in Procedures'],
    duration: '4 Months',
    flightHours: 'N/A',
    price: '₦600,000',
    priceNote: 'Includes GDS training'
  },
  {
    id: 'aviation-fundamentals',
    title: 'Aviation Fundamentals & Strategy',
    icon: Shield,
    description: 'Foundational aviation knowledge covering safety systems, ICAO regulations, and career pathways. Perfect for those starting their aviation journey or seeking industry overview.',
    modules: ['Safety Systems', 'ICAO Regulations', 'Career Pathways', 'Industry Overview', 'Aviation Law'],
    duration: '3 Months',
    flightHours: 'N/A',
    price: '₦350,000',
    priceNote: 'Foundation course'
  },
  {
    id: 'travel-tourism',
    title: 'Travel & Tourism Management',
    icon: Globe,
    description: 'Comprehensive travel and tourism management program covering destination management, travel planning, customer relations, and business strategies for success in the travel sector.',
    modules: ['Tourism Fundamentals', 'Travel Planning', 'Destination Management', 'Customer Relations', 'Business Strategy'],
    duration: '6 Months',
    flightHours: 'N/A',
    price: '₦750,000',
    priceNote: 'Includes industry certification'
  },
  {
    id: 'ticketing',
    title: 'Ticketing & Reservation Systems (GDS Training)',
    icon: CreditCard,
    description: 'Professional GDS training for airline ticketing and reservation systems. Master industry-standard booking platforms including Amadeus, Sabre, and Galileo. Hands-on training with real-world scenarios.',
    modules: ['GDS Introduction', 'Booking Systems', 'Ticketing Operations', 'Reservation Management', 'Fare Calculation'],
    duration: '4 Months',
    flightHours: 'N/A',
    price: '₦650,000',
    priceNote: 'Includes GDS certification'
  }
]

export function Courses() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <TopBar />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl sm:text-6xl font-semibold tracking-tighter text-slate-900 mb-4">
              Our Training Programs
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              World-class aviation training designed to launch your career in the skies
            </p>
          </motion.div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => {
              const Icon = course.icon
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                  className="h-full"
                >
                  <Card className="border-slate-200/50 h-full hover:shadow-xl transition-all duration-300 flex flex-col">
                    <CardHeader className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-3 bg-[#0061FF]/10 rounded-lg flex-shrink-0">
                          <Icon className="w-6 h-6 text-[#0061FF]" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold tracking-tight text-slate-900 mb-2">
                            {course.title}
                          </CardTitle>
                        </div>
                      </div>
                      <CardDescription className="text-slate-600 leading-relaxed mb-4">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col">
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-2">Course Modules:</p>
                        <ul className="space-y-2">
                          {course.modules.map((module, idx) => (
                            <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#0061FF] rounded-full flex-shrink-0" />
                              {module}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-200/50 space-y-3 mt-auto">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-400">Duration</p>
                            <p className="text-sm font-semibold text-slate-900">{course.duration}</p>
                          </div>
                          {course.flightHours !== 'N/A' && (
                            <div>
                              <p className="text-xs text-slate-400">Flight Hours</p>
                              <p className="text-sm font-semibold text-slate-900">{course.flightHours}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="pt-2 border-t border-slate-200/50">
                          <p className="text-xs text-slate-400 mb-1">Investment</p>
                          <p className="text-2xl font-bold tracking-tight text-[#0061FF] mb-1">
                            {course.price}
                          </p>
                          <p className="text-xs text-slate-500">{course.priceNote}</p>
                        </div>
                      </div>
                      
                      <Link to="/enroll" className="mt-4">
                        <Button className="w-full rounded-lg bg-[#0061FF] hover:bg-[#0052E6] text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
                          Enroll Now
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

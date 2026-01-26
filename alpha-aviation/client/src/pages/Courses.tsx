import { motion } from 'framer-motion'
import { TopBar } from '@/components/TopBar'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plane, Users, Briefcase, Shield, Globe, CreditCard, Ticket, Headphones, Building2, FileText, MapPin, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

const licensedCourses = [
  'Airline Cabin Crew Training',
  'Airline Customer Service',
  'Airport Operations Fundamental',
  'Cargo Introductory Course',
  'Foundation in Travel & Tourism with Galileo'
]

const professionalCourses = [
  {
    id: 'air-ticketing',
    title: 'Air Ticketing & Reservation Management',
    icon: Ticket,
    duration: '4 weeks',
    outline: [
      'Introduction to Airline Operations & Industry Structure',
      'IATA Codes, Geography & Global Airline Network',
      'Passenger Handling Procedures & Travel Documentation',
      'Reservations & GDS Workflow',
      'Fare Construction & Fare Rules',
      'Ticketing & E-Ticketing Practices',
      'Refunds, Reissues & Irregular Operations',
      'Customer Service, Complaint Handling & Service Recovery',
      'Practical GDS Workshops & Mock BSP Reporting',
      'Final Review, Examination & Certification'
    ]
  },
  {
    id: 'customer-service',
    title: 'Customer Service & Communication in Aviation',
    icon: Headphones,
    duration: '4 weeks',
    outline: [
      'Introduction to Aviation Customer Service',
      'Principles of Customer Care & Service Culture',
      'Communication Techniques in Aviation',
      'Handling Difficult Passengers & Service Recovery',
      'Cross-Cultural Awareness & Sensitivity in Aviation',
      'Complaint Management, Escalation & Documentation',
      'Documentation & Reporting',
      'Practical Scenarios & Role-Play Exercises',
      'Summary & Key Learning Points'
    ]
  },
  {
    id: 'hospitality',
    title: 'Hospitality & Tourism Management',
    icon: Building2,
    duration: '4 weeks',
    outline: [
      'Introduction to Hospitality & Tourism Management',
      'Overview of the Aviation, Hospitality, and Tourism Industry',
      'Organization Structure of Hospitality and Aviation Services',
      'Customer Service Excellence in Aviation & Tourism',
      'Airport and Airline Hospitality Operations',
      'Tourism Management and Travel Operations',
      'Airline Cabin Services and In-Flight Hospitality',
      'Ground Handling and Airport Passenger Services',
      'Communication Skills and Professional Grooming',
      'Safety, Security, and Emergency Management',
      'Aviation Law, Ethics, and Professional Conduct',
      'Technology in Hospitality, Tourism, and Aviation',
      'Cultural Awareness and International Tourism',
      'Career Opportunities in Aviation, Hospitality & Tourism'
    ]
  },
  {
    id: 'travel-agency',
    title: 'Travel Agency Operations',
    icon: Globe,
    duration: '4 weeks',
    outline: [
      'Introduction to the travel industry',
      'Travel products and services',
      'Reservations and booking procedures',
      'Travel documentation',
      'Tour planning and Itinerary development',
      'Legal, Ethical and regulatory issues',
      'Practical training and case studies'
    ]
  },
  {
    id: 'visa-processing',
    title: 'Visa Processing & Documentation',
    icon: FileText,
    duration: '4 weeks',
    outline: [
      'Definition of visa processing and documentation',
      'Introduction to visa processing',
      'Types of visas',
      'Visa application procedures',
      'Visa documentation requirements',
      'Document verification and assessment',
      'Customer service and communication',
      'Practical training and case studies'
    ]
  },
  {
    id: 'hotel-management',
    title: 'Hotel & Front Office Management',
    icon: Building2,
    duration: '4 weeks',
    outline: [
      'Introduction to Hospitality in Aviation',
      'Overview of Hotel Operations',
      'Front Office Department: Roles & Responsibilities',
      'Guest Cycle in Hotel Operations',
      'Front Office Procedures & Systems',
      'Customer Service Excellence in Front Office Management',
      'Handling Complaints & Service Recovery',
      'Cultural Awareness & Professional Ethics',
      'Safety, Security & Emergency Procedures',
      'Revenue & Financial Awareness',
      'Technology & Innovation in Hotel Front Office',
      'Professional Grooming & Workplace Etiquette',
      'Career Opportunities in Hotel & Aviation Hospitality',
      'Practical Scenarios & Case Studies',
      'Summary & Key Learning Points'
    ]
  },
  {
    id: 'tourism-marketing',
    title: 'Tourism Marketing & Entrepreneurship',
    icon: TrendingUp,
    duration: '4 weeks',
    outline: [
      'Foundations of Tourism & Travel Industry Marketing',
      'Tourist Behaviour, Customer Needs & Service Excellence',
      'Tourism Products, Packaging & Distribution Channels',
      'Destination Marketing, Branding & Promotion',
      'Digital Tourism Marketing & Modern Travel Retailing',
      'Tourism Entrepreneurship, Professionalism & Career Paths'
    ]
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
              Training Courses
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Comprehensive aviation and travel training programs designed to launch your career
            </p>
          </motion.div>
        </div>
      </section>

      {/* Licensed Courses Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-slate-900 mb-4">
              Licensed Courses
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {licensedCourses.map((course, index) => (
                <motion.div
                  key={course}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card className="border-slate-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#0061FF]/10 rounded-lg flex-shrink-0">
                          <Plane className="w-5 h-5 text-[#0061FF]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                            {course}
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Professional Courses Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16"
          >
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-slate-900 mb-8">
              Professional Courses
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {professionalCourses.map((course, index) => {
                const Icon = course.icon
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
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
                            <CardDescription className="text-slate-600">
                              Course duration: {course.duration}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-1 flex flex-col">
                        <div>
                          <p className="text-sm font-bold text-slate-900 mb-3">COURSE OUTLINE</p>
                          <ul className="space-y-2">
                            {course.outline.map((item, idx) => (
                              <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-[#0061FF] rounded-full flex-shrink-0 mt-1.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <Link to="/enroll" className="mt-auto">
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
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

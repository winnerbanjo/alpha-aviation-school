import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  Plane, 
  Award,
  Target,
  Users,
  Globe,
  Ticket,
  Headphones,
  Building2,
  FileText,
  TrendingUp,
  ChevronRight,
  ArrowRight
} from 'lucide-react'

const professionalCourses = [
  {
    id: 'air-ticketing',
    title: 'Air Ticketing & Reservation Management',
    icon: Ticket
  },
  {
    id: 'customer-service',
    title: 'Customer Service & Communication in Aviation',
    icon: Headphones
  },
  {
    id: 'hospitality',
    title: 'Hospitality & Tourism Management',
    icon: Building2
  },
  {
    id: 'travel-agency',
    title: 'Travel Agency Operations',
    icon: Globe
  },
  {
    id: 'visa-processing',
    title: 'Visa Processing & Documentation',
    icon: FileText
  },
  {
    id: 'tourism-marketing',
    title: 'Tourism Marketing & Entrepreneurship',
    icon: TrendingUp
  }
]

const aboutUsText = 'Alpha Step Links Aviation School is a certified and fast-growing aviation training institution dedicated to nurturing the next generation of aviation professionals. With a presence in Nigeria, the United Kingdom, and Canada, we specialize in high-quality programs including Aviation & Travel Training, Ticketing & Reservation, Cabin Crew Courses, IATA-aligned curricula, Youth Empowerment initiatives, International Internship Pathways, and Franchise & Licensing Programs like Classroom-in-a-Box. Our experienced instructors, state-of-the-art facilities, and curriculum aligned with international standards ensure students gain practical skills in air transport, safety, operations, and aviation management. Committed to innovation and excellence, we prepare graduates for thriving careers in airlines, airports, and aviation services worldwide.'

const legacyText = 'Founded as part of the broader Alpha Step Links Ltd., which offers integrated services in travel, education, and logistics, Alpha Step Links Aviation School has quickly established itself as a beacon of excellence in aviation training. From our roots in Nigeria, we\'ve expanded internationally to the UK and Canada, building a legacy of producing highly skilled graduates who contribute to the aviation sector\'s growth. Our commitment to youth empowerment and innovative programs, such as international internships and franchise opportunities, has created lasting impact, with ongoing expansions in 2026 solidifying our role in shaping the future of aviation.'

export function Landing() {
  const [aboutExpanded, setAboutExpanded] = useState(false)
  const [legacyExpanded, setLegacyExpanded] = useState(false)

  const getFirstThreeLines = (text: string) => {
    const sentences = text.split('. ')
    return sentences.slice(0, 3).join('. ') + '.'
  }

  return (
    <>
      {/* 1. Hero Section - 50/50 Split Screen */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-sm font-semibold text-[#0061FF] uppercase tracking-wider mb-4">
                  Our Standard
                </h2>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                  We Fuel Your Ambition: Your Journey to Success Starts Here
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl">
                  Our curriculum isn't just taught; it's engineered by industry veterans to meet international aviation benchmarks.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link to="/courses" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto rounded-lg px-8 py-6 text-base bg-[#0061FF] hover:bg-[#0052E6] text-white transition-all duration-300"
                  >
                    Explore Courses
                  </Button>
                </Link>
                <Link to="/enroll" className="w-full sm:w-auto">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto rounded-lg px-8 py-6 text-base border-2 border-slate-200 hover:border-[#0061FF] hover:text-[#0061FF] transition-all duration-300"
                  >
                    Enroll Now
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right: Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="/people-portrait-with-plane-flying-sky.jpg"
                  alt="Aviation professionals"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Training Courses - iOS App Store Style */}
      <section id="courses" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              Training Courses
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Comprehensive aviation and travel training programs designed to launch your career
            </p>
          </motion.div>

          {/* iOS App Store Style Course Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionalCourses?.map((course, index) => {
              if (!course) return null
              const Icon = course?.icon
              if (!Icon) return null
              return (
                <motion.div
                  key={course?.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                  onClick={() => window.location.href = '/courses'}
                >
                  {/* Plus/Arrow Icon in Corner */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="p-2 bg-[#0061FF]/10 rounded-full">
                      <ArrowRight className="w-4 h-4 text-[#0061FF]" />
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#0061FF]/10 rounded-xl flex-shrink-0 group-hover:bg-[#0061FF]/20 transition-colors duration-300">
                      <Icon className="w-7 h-7 text-[#0061FF]" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-1 group-hover:text-[#0061FF] transition-colors duration-300">
                        {course?.title || ''}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 3. About Us - Asymmetric Modern (Image Left, Text Right) */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            {/* Left: Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative order-2 lg:order-1"
            >
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/clean-airplane-interior.jpg"
                  alt="Aviation training facility"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Right: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-6 order-1 lg:order-2"
            >
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
                About Us
              </h2>
              <div className="space-y-4">
                <p className="text-content text-slate-600 text-lg leading-relaxed">
                  {aboutExpanded ? aboutUsText : getFirstThreeLines(aboutUsText)}
                </p>
                {!aboutExpanded && (
                  <button
                    onClick={() => setAboutExpanded(true)}
                    className="inline-flex items-center gap-2 text-[#0061FF] font-semibold hover:gap-3 transition-all duration-300 group"
                  >
                    <span>Read More</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
                {aboutExpanded && (
                  <Link 
                    to="/about"
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#0061FF] text-[#0061FF] rounded-lg font-semibold hover:bg-[#0061FF] hover:text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <span>Read Our Full Story</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. Legacy - Alternating Side-by-Side (Text Left, Image Right) */}
      <section className="bg-[#F9FAFB] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
                Legacy
              </h2>
              <div className="space-y-4">
                <p className="text-content text-slate-600 text-lg leading-relaxed">
                  {legacyExpanded ? legacyText : getFirstThreeLines(legacyText)}
                </p>
                {!legacyExpanded && (
                  <button
                    onClick={() => setLegacyExpanded(true)}
                    className="inline-flex items-center gap-2 text-[#0061FF] font-semibold hover:gap-3 transition-all duration-300 group"
                  >
                    <span>Read More</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
                {legacyExpanded && (
                  <Link 
                    to="/about"
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#0061FF] text-[#0061FF] rounded-lg font-semibold hover:bg-[#0061FF] hover:text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <span>Discover Our Legacy</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </motion.div>

            {/* Right: Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/smiling-female-staff-standing.jpg"
                  alt="Global aviation education"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 5. Core Values - Clean Cards */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              Our Core Values
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -2 }}
              className="bg-white border border-slate-200 rounded-lg p-6 transition-all duration-300"
            >
              <Award className="w-8 h-8 text-[#0061FF] mb-4" />
              <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-3">Excellence</h3>
              <p className="text-content text-slate-600 text-sm">
                We strive for the highest standards in every aspect of our training, from curriculum design to instructor expertise, ensuring our graduates are equipped to excel in competitive aviation environments.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -2 }}
              className="bg-white border border-slate-200 rounded-lg p-6 transition-all duration-300"
            >
              <Target className="w-8 h-8 text-[#0061FF] mb-4" />
              <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-3">Precision</h3>
              <p className="text-content text-slate-600 text-sm">
                Accuracy and attention to detail are at the heart of aviation; we instill these principles through rigorous, hands-on programs that emphasize safety protocols, operational efficiency, and technical mastery.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -2 }}
              className="bg-white border border-slate-200 rounded-lg p-6 transition-all duration-300"
            >
              <Globe className="w-8 h-8 text-[#0061FF] mb-4" />
              <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-3">Global Reach</h3>
              <p className="text-content text-slate-600 text-sm">
                With operations spanning Nigeria, the UK, and Canada, we connect students to international opportunities, including internships and IATA-aligned certifications, bridging local talent with worldwide aviation demands.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -2 }}
              className="bg-white border border-slate-200 rounded-lg p-6 transition-all duration-300"
            >
              <Users className="w-8 h-8 text-[#0061FF] mb-4" />
              <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-3">Community</h3>
              <p className="text-content text-slate-600 text-sm">
                We are dedicated to giving back through youth empowerment initiatives, fostering inclusive education, and supporting local communities in Lagos and beyond to build a stronger, more diverse aviation workforce.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}

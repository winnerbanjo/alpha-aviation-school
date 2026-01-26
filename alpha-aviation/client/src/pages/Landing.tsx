import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/Navbar'
import { 
  Plane, 
  Shield, 
  Globe, 
  GraduationCap, 
  Headphones, 
  UserCheck, 
  AlertTriangle, 
  Briefcase, 
  Ticket,
  Award,
  Target,
  Users
} from 'lucide-react'

export function Landing() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar scrolled={scrolled} />
      
      {/* Hero Section - Two Column Layout */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Text & CTAs - Shows first on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6 sm:space-y-8 order-2 lg:order-1"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tighter text-slate-900 leading-tight">
              The Sky is No Longer the Limit. It's Your Training Ground.
            </h1>
            <p className="text-lg sm:text-xl text-slate-500 max-w-xl">
              Join West Africa's elite aviation academy. We combine global safety standards with hands-on precision to launch the next generation of pilots, cabin crew, and aviation leaders.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link to="/courses" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full px-8 py-6 text-base border-slate-200/50 hover:bg-white shadow-sm transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                >
                  Plan Your Study
                </Button>
              </Link>
              <Link to="/enroll" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="rounded-full px-8 py-6 text-base bg-[#0061FF] hover:bg-[#0052E6] text-white shadow-sm transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                >
                  Enroll Now
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right: Image with Animation - Shows second on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-1 lg:order-2"
          >
            <motion.img
              src="/people-portrait-with-plane-flying-sky.jpg"
              alt="Aviation professionals"
              className="w-full h-auto rounded-3xl shadow-2xl object-cover aspect-video sm:aspect-auto"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* Our Standard Section - Bento Grid */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter text-slate-900 mb-4">
            Our Standard
          </h2>
          <p className="text-base sm:text-lg text-slate-500 max-w-3xl mx-auto">
            Certified Excellence. Our curriculum isn't just taught; it's engineered by industry veterans to meet international aviation benchmarks.
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Large About Us Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 premium-card p-8 sm:p-10 glass-text"
          >
            <div className="mb-6">
              <Plane className="w-10 h-10 text-[#0061FF] mb-4" />
              <h3 className="heading-lg text-slate-900 mb-4">About Us</h3>
            </div>
            <p className="text-content text-slate-600 text-base sm:text-lg max-w-4xl mx-auto">
              {(() => {
                try {
                  return 'Alpha Step Links Aviation School is a certified and fast-growing aviation training institution dedicated to nurturing the next generation of aviation professionals. With a presence in Nigeria, the United Kingdom, and Canada, we specialize in high-quality programs including Aviation & Travel Training, Ticketing & Reservation, Cabin Crew Courses, IATA-aligned curricula, Youth Empowerment initiatives, International Internship Pathways, and Franchise & Licensing Programs like Classroom-in-a-Box. Our experienced instructors, state-of-the-art facilities, and curriculum aligned with international standards ensure students gain practical skills in air transport, safety, operations, and aviation management. Committed to innovation and excellence, we prepare graduates for thriving careers in airlines, airports, and aviation services worldwide.'
                } catch (e) {
                  return 'Alpha Step Links Aviation School - Certified Excellence in Aviation Training'
                }
              })()}
            </p>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="premium-card p-8 sm:p-10 bg-gradient-to-br from-[#0061FF]/5 to-white"
          >
            <div className="mb-6">
              <Shield className="w-10 h-10 text-[#0061FF] mb-4" />
              <h3 className="heading-lg text-slate-900 mb-4">Mission</h3>
            </div>
              <p className="text-content text-slate-600 text-lg font-medium max-w-2xl">
                {(() => {
                  try {
                    return 'To deliver world-class aviation training that meets global standards, empowers learners with essential practical skills, and equips them for successful, impactful careers in the dynamic aviation industry.'
                  } catch (e) {
                    return 'Delivering world-class aviation training.'
                  }
                })()}
              </p>
          </motion.div>

          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="premium-card p-8 sm:p-10 bg-gradient-to-br from-slate-50 to-white"
          >
            <div className="mb-6">
              <Globe className="w-10 h-10 text-[#0061FF] mb-4" />
              <h3 className="heading-lg text-slate-900 mb-4">Vision</h3>
            </div>
              <p className="text-content text-slate-600 text-lg font-medium max-w-2xl">
                {(() => {
                  try {
                    return 'To become the premier global leader in aviation education, expanding our reach to inspire and train aviation professionals across continents, fostering innovation and safety in the skies for generations to come.'
                  } catch (e) {
                    return 'Becoming the premier global leader in aviation education.'
                  }
                })()}
              </p>
          </motion.div>
        </div>

        {/* Legacy Section with Map Background */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20"
        >
          <div className="relative premium-card p-8 sm:p-12 overflow-hidden">
            {/* Subtle map/timeline background element */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-[#0061FF] rounded-full"></div>
              <div className="absolute top-1/2 right-1/4 w-24 h-24 border-2 border-[#0061FF] rounded-full"></div>
              <div className="absolute bottom-1/4 left-1/2 w-20 h-20 border-2 border-[#0061FF] rounded-full"></div>
            </div>
            <div className="relative z-10">
              <h3 className="heading-lg text-slate-900 mb-6">Legacy</h3>
              <p className="text-content text-slate-600 text-base sm:text-lg max-w-4xl">
                {(() => {
                  try {
                    return 'Founded as part of the broader Alpha Step Links Ltd., which offers integrated services in travel, education, and logistics, Alpha Step Links Aviation School has quickly established itself as a beacon of excellence in aviation training. From our roots in Nigeria, we\'ve expanded internationally to the UK and Canada, building a legacy of producing highly skilled graduates who contribute to the aviation sector\'s growth. Our commitment to youth empowerment and innovative programs, such as international internships and franchise opportunities, has created lasting impact, with ongoing expansions in 2026 solidifying our role in shaping the future of aviation.'
                  } catch (e) {
                    return 'Alpha Step Links Aviation School - Building a legacy of excellence in aviation training.'
                  }
                })()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Core Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20"
        >
          <h3 className="heading-lg text-slate-900 mb-10 text-center">Our Core Values</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              whileHover={{ y: -4 }}
              className="premium-card p-8"
            >
              <div className="mb-4">
                <Award className="w-8 h-8 text-[#0061FF] mb-3" />
                <h4 className="text-xl font-bold tracking-tight text-slate-900 mb-3">Excellence</h4>
              </div>
              <p className="text-content text-slate-600 text-sm">
                We strive for the highest standards in every aspect of our training, from curriculum design to instructor expertise, ensuring our graduates are equipped to excel in competitive aviation environments.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ y: -4 }}
              className="premium-card p-8"
            >
              <div className="mb-4">
                <Target className="w-8 h-8 text-[#0061FF] mb-3" />
                <h4 className="text-xl font-bold tracking-tight text-slate-900 mb-3">Precision</h4>
              </div>
              <p className="text-content text-slate-600 text-sm">
                Accuracy and attention to detail are at the heart of aviation; we instill these principles through rigorous, hands-on programs that emphasize safety protocols, operational efficiency, and technical mastery.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ y: -4 }}
              className="premium-card p-8"
            >
              <div className="mb-4">
                <Globe className="w-8 h-8 text-[#0061FF] mb-3" />
                <h4 className="text-xl font-bold tracking-tight text-slate-900 mb-3">Global Reach</h4>
              </div>
              <p className="text-content text-slate-600 text-sm">
                With operations spanning Nigeria, the UK, and Canada, we connect students to international opportunities, including internships and IATA-aligned certifications, bridging local talent with worldwide aviation demands.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ y: -4 }}
              className="premium-card p-8"
            >
              <div className="mb-4">
                <Users className="w-8 h-8 text-[#0061FF] mb-3" />
                <h4 className="text-xl font-bold tracking-tight text-slate-900 mb-3">Community</h4>
              </div>
              <p className="text-content text-slate-600 text-sm">
                We are dedicated to giving back through youth empowerment initiatives, fostering inclusive education, and supporting local communities in Lagos and beyond to build a stronger, more diverse aviation workforce.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Training Courses Section */}
      <section id="courses" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter text-slate-900 mb-4">
              The Courses We Offer
            </h2>
            <p className="text-base sm:text-lg text-slate-500 max-w-3xl mx-auto">
              At Alpha Step Links Aviation School, we offer a comprehensive range of aviation training programs 
              designed to meet the diverse needs of aspiring aviation professionals. Our courses are structured 
              to provide both theoretical knowledge and practical skills essential for success in the aviation industry.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Course 1: Aviation Fundamentals & Strategy */}
            <Link to="/courses">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white p-6 border border-slate-200/50 rounded-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
              >
              <div className="mb-4 aspect-video overflow-hidden rounded-lg">
                <img
                  src="/smiling-female-staff-standing.jpg"
                  alt="Aviation Fundamentals"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mb-3">
                <GraduationCap className="w-6 h-6 text-[#0061FF]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold tracking-tighter text-slate-900 mb-2">
                Aviation Fundamentals & Strategy
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                A comprehensive introduction to the aviation industry covering fundamental concepts, industry overview, 
                and career pathways. Perfect for beginners looking to start their aviation journey.
              </p>
              </motion.div>
            </Link>

            {/* Course 2: Airline Customer Service & Passenger Handling */}
            <Link to="/courses">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white p-6 border border-slate-200/50 rounded-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="mb-4 aspect-video overflow-hidden rounded-lg">
                  <img
                    src="/smiling-traveler-with-suitcase.jpg"
                    alt="Customer Service"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mb-3">
                  <Headphones className="w-6 h-6 text-[#0061FF]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold tracking-tighter text-slate-900 mb-2">
                  Airline Customer Service & Passenger Handling
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Learn essential customer service skills and passenger handling techniques required for ground staff 
                  and customer-facing roles in the aviation industry.
                </p>
              </motion.div>
            </Link>

            {/* Course 3: Elite Cabin Crew & Safety Operations */}
            <Link to="/courses">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white p-6 border border-slate-200/50 rounded-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="mb-4 aspect-video overflow-hidden rounded-lg">
                  <img
                    src="/people-portrait-with-plane-flying-sky.jpg"
                    alt="Elite Cabin Crew"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mb-3">
                  <UserCheck className="w-6 h-6 text-[#0061FF]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold tracking-tighter text-slate-900 mb-2">
                  Elite Cabin Crew & Safety Operations
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Intensive training program preparing candidates for cabin crew positions, covering safety procedures, 
                  service excellence, and emergency protocols.
                </p>
              </motion.div>
            </Link>

            {/* Course 4: Aviation Safety & Security Awareness */}
            <Link to="/courses">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white p-6 border border-slate-200/50 rounded-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="mb-4 aspect-video overflow-hidden rounded-lg">
                  <img
                    src="/clean-airplane-interior.jpg"
                    alt="Safety & Security"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mb-3">
                  <AlertTriangle className="w-6 h-6 text-[#0061FF]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold tracking-tighter text-slate-900 mb-2">
                  Aviation Safety & Security Awareness
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Critical training on aviation safety protocols, security measures, and regulatory compliance 
                  essential for all aviation professionals.
                </p>
              </motion.div>
            </Link>

            {/* Course 5: Travel & Tourism Management */}
            <Link to="/courses">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white p-6 border border-slate-200/50 rounded-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="mb-4 aspect-video overflow-hidden rounded-lg">
                  <img
                    src="/black-woman-with-suitcase-airport.jpg"
                    alt="Travel & Tourism"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mb-3">
                  <Briefcase className="w-6 h-6 text-[#0061FF]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold tracking-tighter text-slate-900 mb-2">
                  Travel & Tourism Management
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Comprehensive program covering travel industry operations, tourism management, and business 
                  strategies for success in the travel sector.
                </p>
              </motion.div>
            </Link>

            {/* Course 6: Ticketing & Reservation Systems (GDS Training) */}
            <Link to="/courses">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white p-6 border border-slate-200/50 rounded-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="mb-4 aspect-video overflow-hidden rounded-lg">
                  <img
                    src="/smiling-female-staff-standing.jpg"
                    alt="GDS Training"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mb-3">
                  <Ticket className="w-6 h-6 text-[#0061FF]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold tracking-tighter text-slate-900 mb-2">
                  Ticketing & Reservation Systems (GDS Training)
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Hands-on training on Global Distribution Systems (GDS) including ticketing, reservations, fare 
                  calculation, and airline booking systems.
                </p>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

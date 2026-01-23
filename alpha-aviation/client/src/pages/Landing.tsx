import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { TopBar } from '@/components/TopBar'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { 
  Plane, 
  Shield, 
  Globe, 
  GraduationCap, 
  Headphones, 
  UserCheck, 
  AlertTriangle, 
  Briefcase, 
  Ticket 
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
      <TopBar />
      <Navbar scrolled={scrolled} />
      
      {/* Hero Section - Two Column Layout */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
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
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Column 1: Our Mission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-6 sm:p-8 border border-slate-200/50 rounded-lg bg-white hover:shadow-lg transition-shadow"
          >
            <div className="mb-4">
              <Plane className="w-8 h-8 text-[#0061FF]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tighter text-slate-900 mb-3">Our Mission</h3>
            <p className="text-slate-500 leading-relaxed text-sm sm:text-base">
              To provide exceptional aviation training that equips students with the knowledge, skills, and 
              confidence needed to excel in the aviation industry. We strive to maintain the highest standards 
              of education and safety in all our programs.
            </p>
          </motion.div>

          {/* Column 2: Excellence & Safety - Bento Box with Background */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative p-6 sm:p-8 border border-slate-200/50 rounded-lg overflow-hidden group"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-15 transition-opacity"
              style={{ backgroundImage: 'url(/clean-airplane-interior.jpg)' }}
            />
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
            <div className="relative z-10">
              <div className="mb-4">
                <Shield className="w-8 h-8 text-[#0061FF]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tighter text-slate-900 mb-3">Excellence & Safety</h3>
              <p className="text-slate-500 leading-relaxed text-sm sm:text-base">
                Our commitment to excellence is reflected in our comprehensive curriculum, modern training facilities, 
                and adherence to international aviation safety standards. We ensure every student receives personalized 
                attention and practical experience.
              </p>
            </div>
          </motion.div>

          {/* Column 3: Global Reputation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-6 sm:p-8 border border-slate-200/50 rounded-lg bg-white hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1"
          >
            <div className="mb-4">
              <Globe className="w-8 h-8 text-[#0061FF]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tighter text-slate-900 mb-3">Global Reputation</h3>
            <p className="text-slate-500 leading-relaxed text-sm sm:text-base">
              With a track record of producing skilled aviation professionals, Alpha Step Links has built a 
              reputation for excellence both locally and internationally. Our graduates are highly sought after 
              by leading airlines and aviation companies worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Training Courses Section */}
      <section id="courses" className="bg-white py-16 sm:py-24 lg:py-32">
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

      {/* Footer */}
      <footer id="contact" className="border-t border-slate-200/50 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Column 1: About */}
            <div>
              <h4 className="text-sm font-semibold tracking-tighter text-slate-900 mb-4">About</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Alpha Step Links Aviation School is a certified aviation training institution dedicated to 
                excellence in aviation education.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-sm font-semibold tracking-tighter text-slate-900 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#about" className="hover:text-slate-900 transition-colors">About Us</a></li>
                <li><a href="#courses" className="hover:text-slate-900 transition-colors">Training Courses</a></li>
                <li><Link to="/login" className="hover:text-slate-900 transition-colors">Student Portal</Link></li>
                <li><Link to="/enroll" className="hover:text-slate-900 transition-colors">Enroll Now</Link></li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div>
              <h4 className="text-sm font-semibold tracking-tighter text-slate-900 mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>7 Chief Tajudeen Odubiyi St</li>
                <li>+234 XXX XXX XXXX</li>
                <li>info@alphasteplinks.com</li>
              </ul>
            </div>

            {/* Column 4: Follow Us */}
            <div>
              <h4 className="text-sm font-semibold tracking-tighter text-slate-900 mb-4">Follow Us</h4>
              <p className="text-sm text-slate-500">
                Stay connected with us on social media for the latest updates and news.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500">
                © 2024 Alpha Step Links Aviation School. All rights reserved.
              </p>
              <p className="text-sm text-slate-400">
                Designed by <span className="text-slate-600">Nasio Themes</span> || Powered by <span className="text-slate-600">WordPress</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
      <Footer />
    </div>
  )
}

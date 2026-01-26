import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  Plane, 
  Shield, 
  Globe, 
  Award,
  Target,
  Users,
  GraduationCap,
  Briefcase
} from 'lucide-react'

export function Landing() {
  const scrollToSection = (id: string) => {
    // Navigate to courses page with hash
    window.location.href = `/courses#${id}`
  }

  return (
    <>
      {/* 1. Hero Section - Certified Excellence with Background */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/people-portrait-with-plane-flying-sky.jpg)' }}
        />
        <div className="absolute inset-0 bg-slate-900/70" />
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">
              Certified Excellence
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              Our curriculum isn't just taught; it's engineered by industry veterans to meet international aviation benchmarks.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/courses">
                <Button 
                  size="lg" 
                  className="rounded-full px-8 py-6 text-base bg-white text-slate-900 hover:bg-slate-100 shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Explore Courses
                </Button>
              </Link>
              <Link to="/enroll">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="rounded-full px-8 py-6 text-base border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  Enroll Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Stats Row - Global Reach */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 text-center"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-[#0061FF]" />
              <span className="text-2xl font-bold text-slate-900">Nigeria</span>
            </div>
            <div className="hidden sm:block w-px h-12 bg-slate-300" />
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-[#0061FF]" />
              <span className="text-2xl font-bold text-slate-900">UK</span>
            </div>
            <div className="hidden sm:block w-px h-12 bg-slate-300" />
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-[#0061FF]" />
              <span className="text-2xl font-bold text-slate-900">Canada</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Core Values Section */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              Our Core Values
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="premium-card p-10 border-slate-200"
            >
              <div className="mb-6">
                <Award className="w-10 h-10 text-[#0061FF] mb-4" />
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">Excellence</h3>
              </div>
              <p className="text-content text-slate-600">
                We strive for the highest standards in every aspect of our training, from curriculum design to instructor expertise, ensuring our graduates are equipped to excel in competitive aviation environments.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="premium-card p-10 border-slate-200"
            >
              <div className="mb-6">
                <Target className="w-10 h-10 text-[#0061FF] mb-4" />
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">Precision</h3>
              </div>
              <p className="text-content text-slate-600">
                Accuracy and attention to detail are at the heart of aviation; we instill these principles through rigorous, hands-on programs that emphasize safety protocols, operational efficiency, and technical mastery.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -4 }}
              className="premium-card p-10 border-slate-200"
            >
              <div className="mb-6">
                <Globe className="w-10 h-10 text-[#0061FF] mb-4" />
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">Global Reach</h3>
              </div>
              <p className="text-content text-slate-600">
                With operations spanning Nigeria, the UK, and Canada, we connect students to international opportunities, including internships and IATA-aligned certifications, bridging local talent with worldwide aviation demands.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -4 }}
              className="premium-card p-10 border-slate-200"
            >
              <div className="mb-6">
                <Users className="w-10 h-10 text-[#0061FF] mb-4" />
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">Community</h3>
              </div>
              <p className="text-content text-slate-600">
                We are dedicated to giving back through youth empowerment initiatives, fostering inclusive education, and supporting local communities in Lagos and beyond to build a stronger, more diverse aviation workforce.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Course Categories - Visual Split */}
      <section id="courses" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              Training Courses
            </h2>
            <p className="text-lg text-slate-500 max-w-3xl mx-auto text-center">
              Comprehensive aviation and travel training programs designed to launch your career
            </p>
          </motion.div>

          {/* Category Cards Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Licensed Courses Category */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              onClick={() => scrollToSection('licensed-courses')}
              className="premium-card p-12 cursor-pointer group hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-6 mb-6">
                <div className="p-4 bg-[#0061FF]/10 rounded-xl">
                  <GraduationCap className="w-12 h-12 text-[#0061FF]" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                    Licensed Courses
                  </h3>
                  <p className="text-content text-slate-600">
                    Industry-certified programs that meet international aviation standards
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#0061FF] font-semibold group-hover:gap-4 transition-all">
                <span>View Courses</span>
                <span>→</span>
              </div>
            </motion.div>

            {/* Professional Courses Category */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              onClick={() => scrollToSection('professional-courses')}
              className="premium-card p-12 cursor-pointer group hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-6 mb-6">
                <div className="p-4 bg-[#0061FF]/10 rounded-xl">
                  <Briefcase className="w-12 h-12 text-[#0061FF]" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                    Professional Courses
                  </h3>
                  <p className="text-content text-slate-600">
                    Specialized training programs for career advancement in aviation and travel
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#0061FF] font-semibold group-hover:gap-4 transition-all">
                <span>View Courses</span>
                <span>→</span>
              </div>
            </motion.div>
          </div>

          {/* Quick Course Links */}
          <div className="text-center">
            <Link to="/courses">
              <Button 
                size="lg" 
                className="rounded-full px-8 py-6 text-base bg-[#0061FF] hover:bg-[#0052E6] text-white shadow-lg transition-all duration-300 hover:scale-105"
              >
                View All Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. About/Legacy - Bento Grid Layout */}
      <section id="about" className="py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              About Alpha Step Links
            </h2>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Large About Us Card - 2/3 width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-2 premium-card p-10 glass-text"
            >
              <div className="mb-6">
                <Plane className="w-10 h-10 text-[#0061FF] mb-4" />
                <h3 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">About Us</h3>
              </div>
              <p className="text-content text-slate-600 text-base sm:text-lg max-w-3xl mx-auto text-center">
                Alpha Step Links Aviation School is a certified and fast-growing aviation training institution dedicated to nurturing the next generation of aviation professionals. With a presence in Nigeria, the United Kingdom, and Canada, we specialize in high-quality programs including Aviation & Travel Training, Ticketing & Reservation, Cabin Crew Courses, IATA-aligned curricula, Youth Empowerment initiatives, International Internship Pathways, and Franchise & Licensing Programs like Classroom-in-a-Box. Our experienced instructors, state-of-the-art facilities, and curriculum aligned with international standards ensure students gain practical skills in air transport, safety, operations, and aviation management. Committed to innovation and excellence, we prepare graduates for thriving careers in airlines, airports, and aviation services worldwide.
              </p>
            </motion.div>

            {/* Mission Card - 1/3 width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="premium-card p-10 bg-gradient-to-br from-[#0061FF]/5 to-white"
            >
              <div className="mb-6">
                <Shield className="w-10 h-10 text-[#0061FF] mb-4" />
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">Mission</h3>
              </div>
              <p className="text-content text-slate-600 text-lg font-medium max-w-3xl mx-auto text-center">
                To deliver world-class aviation training that meets global standards, empowers learners with essential practical skills, and equips them for successful, impactful careers in the dynamic aviation industry.
              </p>
            </motion.div>

            {/* Vision Card - 1/3 width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="premium-card p-10 bg-gradient-to-br from-slate-50 to-white"
            >
              <div className="mb-6">
                <Globe className="w-10 h-10 text-[#0061FF] mb-4" />
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">Vision</h3>
              </div>
              <p className="text-content text-slate-600 text-lg font-medium max-w-3xl mx-auto text-center">
                To become the premier global leader in aviation education, expanding our reach to inspire and train aviation professionals across continents, fostering innovation and safety in the skies for generations to come.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. Legacy Section - Footer Pre */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="premium-card p-12 bg-white">
              <h3 className="text-3xl font-bold tracking-tight text-slate-900 mb-6 text-center">
                Legacy
              </h3>
              <p className="text-content text-slate-600 text-base sm:text-lg max-w-3xl mx-auto text-center">
                Founded as part of the broader Alpha Step Links Ltd., which offers integrated services in travel, education, and logistics, Alpha Step Links Aviation School has quickly established itself as a beacon of excellence in aviation training. From our roots in Nigeria, we've expanded internationally to the UK and Canada, building a legacy of producing highly skilled graduates who contribute to the aviation sector's growth. Our commitment to youth empowerment and innovative programs, such as international internships and franchise opportunities, has created lasting impact, with ongoing expansions in 2026 solidifying our role in shaping the future of aviation.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

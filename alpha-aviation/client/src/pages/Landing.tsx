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
  Ticket,
  Headphones,
  Building2,
  FileText,
  TrendingUp
} from 'lucide-react'

const professionalCourses = [
  {
    id: 'air-ticketing',
    title: 'Air Ticketing & Reservation Management',
    icon: Ticket,
    duration: '4 weeks'
  },
  {
    id: 'customer-service',
    title: 'Customer Service & Communication in Aviation',
    icon: Headphones,
    duration: '4 weeks'
  },
  {
    id: 'hospitality',
    title: 'Hospitality & Tourism Management',
    icon: Building2,
    duration: '4 weeks'
  },
  {
    id: 'travel-agency',
    title: 'Travel Agency Operations',
    icon: Globe,
    duration: '4 weeks'
  },
  {
    id: 'visa-processing',
    title: 'Visa Processing & Documentation',
    icon: FileText,
    duration: '4 weeks'
  },
  {
    id: 'tourism-marketing',
    title: 'Tourism Marketing & Entrepreneurship',
    icon: TrendingUp,
    duration: '4 weeks'
  }
]

export function Landing() {
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
              className="premium-card p-10 border-slate-200 transition-all duration-300"
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
              className="premium-card p-10 border-slate-200 transition-all duration-300"
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
              className="premium-card p-10 border-slate-200 transition-all duration-300"
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
              className="premium-card p-10 border-slate-200 transition-all duration-300"
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

      {/* 4. Professional Courses - Original Card Design */}
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

          {/* Original Course Cards - Title + Duration + View Full Curriculum */}
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
                  whileHover={{ y: -4 }}
                  className="premium-card p-8 border-slate-200 transition-all duration-300"
                >
                  <div className="mb-6">
                    <div className="p-3 bg-[#0061FF]/10 rounded-lg w-fit mb-4">
                      <Icon className="w-8 h-8 text-[#0061FF]" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-3">
                      {course?.title || ''}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-[#0061FF]/10 text-[#0061FF] text-sm font-semibold rounded-full">
                        {course?.duration || ''}
                      </span>
                    </div>
                  </div>
                  <Link to="/courses" className="block">
                    <Button 
                      variant="outline"
                      className="w-full border-slate-200 hover:border-[#0061FF] hover:text-[#0061FF] transition-all duration-300"
                    >
                      View Full Curriculum →
                    </Button>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. About Us - Shortened with Read More */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="premium-card p-12 bg-white">
              <div className="mb-6">
                <Plane className="w-10 h-10 text-[#0061FF] mb-4" />
                <h3 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">About Us</h3>
              </div>
              <p className="text-content text-slate-600 text-lg mb-6 max-w-3xl mx-auto text-center">
                Alpha Step Links Aviation School is a certified and fast-growing aviation training institution dedicated to nurturing the next generation of aviation professionals. With a presence in Nigeria, the United Kingdom, and Canada, we specialize in high-quality programs including Aviation & Travel Training, Ticketing & Reservation, Cabin Crew Courses, IATA-aligned curricula, Youth Empowerment initiatives, International Internship Pathways, and Franchise & Licensing Programs like Classroom-in-a-Box.
              </p>
              <div className="text-center">
                <Link 
                  to="/about" 
                  className="inline-flex items-center gap-2 text-[#0061FF] font-semibold hover:gap-4 transition-all duration-300 group"
                >
                  <span>Read Our Full Story</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. Legacy Section - Shortened with Read More */}
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
              <p className="text-content text-slate-600 text-lg mb-6 max-w-3xl mx-auto text-center">
                Founded as part of the broader Alpha Step Links Ltd., which offers integrated services in travel, education, and logistics, Alpha Step Links Aviation School has quickly established itself as a beacon of excellence in aviation training. From our roots in Nigeria, we've expanded internationally to the UK and Canada, building a legacy of producing highly skilled graduates who contribute to the aviation sector's growth.
              </p>
              <div className="text-center">
                <Link 
                  to="/about" 
                  className="inline-flex items-center gap-2 text-[#0061FF] font-semibold hover:gap-4 transition-all duration-300 group"
                >
                  <span>Discover Our Legacy</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

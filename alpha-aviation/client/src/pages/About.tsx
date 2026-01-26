import { motion } from 'framer-motion'
import { TopBar } from '@/components/TopBar'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Target, Globe, Users } from 'lucide-react'

const values = [
  {
    icon: Award,
    title: 'Excellence',
    description: 'We strive for the highest standards in every aspect of our training, from curriculum design to instructor expertise, ensuring our graduates are equipped to excel in competitive aviation environments.'
  },
  {
    icon: Target,
    title: 'Precision',
    description: 'Accuracy and attention to detail are at the heart of aviation; we instill these principles through rigorous, hands-on programs that emphasize safety protocols, operational efficiency, and technical mastery.'
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'With operations spanning Nigeria, the UK, and Canada, we connect students to international opportunities, including internships and IATA-aligned certifications, bridging local talent with worldwide aviation demands.'
  },
  {
    icon: Users,
    title: 'Community',
    description: 'We are dedicated to giving back through youth empowerment initiatives, fostering inclusive education, and supporting local communities in Lagos and beyond to build a stronger, more diverse aviation workforce.'
  }
]

export function About() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <TopBar />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <h1 className="heading-xl text-slate-900 mb-6">
              About Alpha Step Links Aviation School
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid: About Us, Mission & Vision */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-20">
            {/* Large About Us Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="lg:col-span-2 premium-card border-slate-200 glass-text p-10"
            >
              <h2 className="heading-lg text-slate-900 mb-6">About Us</h2>
              <p className="text-content text-slate-600 text-base sm:text-lg max-w-2xl">
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
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="premium-card border-slate-200 h-full">
                <CardContent className="p-10">
                  <h2 className="heading-lg text-slate-900 mb-6 text-2xl sm:text-3xl">
                    Mission
                  </h2>
                  <p className="text-content text-slate-600 text-lg font-medium max-w-xl">
                    {(() => {
                      try {
                        return 'To deliver world-class aviation training that meets global standards, empowers learners with essential practical skills, and equips them for successful, impactful careers in the dynamic aviation industry.'
                      } catch (e) {
                        return 'Delivering world-class aviation training.'
                      }
                    })()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="premium-card border-slate-200 h-full">
                <CardContent className="p-10">
                  <h2 className="heading-lg text-slate-900 mb-6 text-2xl sm:text-3xl">
                    Vision
                  </h2>
                  <p className="text-content text-slate-600 text-lg font-medium max-w-xl">
                    {(() => {
                      try {
                        return 'To become the premier global leader in aviation education, expanding our reach to inspire and train aviation professionals across continents, fostering innovation and safety in the skies for generations to come.'
                      } catch (e) {
                        return 'Becoming the premier global leader in aviation education.'
                      }
                    })()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Alpha Step Links Legacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-20"
          >
            <Card className="premium-card border-slate-200">
              <CardContent className="p-8 md:p-12">
                <h2 className="heading-lg text-slate-900 mb-6">
                  Legacy
                </h2>
                <p className="text-content text-slate-600 text-base sm:text-lg max-w-4xl mx-auto">
                  {(() => {
                    try {
                      return 'Founded as part of the broader Alpha Step Links Ltd., which offers integrated services in travel, education, and logistics, Alpha Step Links Aviation School has quickly established itself as a beacon of excellence in aviation training. From our roots in Nigeria, we\'ve expanded internationally to the UK and Canada, building a legacy of producing highly skilled graduates who contribute to the aviation sector\'s growth. Our commitment to youth empowerment and innovative programs, such as international internships and franchise opportunities, has created lasting impact, with ongoing expansions in 2026 solidifying our role in shaping the future of aviation.'
                    } catch (e) {
                      return 'Alpha Step Links Aviation School - Building a legacy of excellence in aviation training.'
                    }
                  })()}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Core Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h2 className="heading-lg text-slate-900 mb-10 text-center">
              Our Core Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values?.map((value, index) => {
                if (!value) return null
                const Icon = value?.icon
                if (!Icon) return null
                return (
                  <motion.div
                    key={value?.title || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="premium-card h-full">
                      <CardContent className="p-8">
                        <div className="flex justify-center mb-4">
                          <div className="p-3 bg-[#0061FF]/10 rounded-lg">
                            <Icon className="w-8 h-8 text-[#0061FF]" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-3">
                          {value?.title || ''}
                        </h3>
                        <p className="text-content text-slate-600 text-sm">
                          {value?.description || ''}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

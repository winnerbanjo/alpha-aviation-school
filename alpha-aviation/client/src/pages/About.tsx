import { motion } from 'framer-motion'
import { TopBar } from '@/components/TopBar'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Target, Globe, Users } from 'lucide-react'

const values = [
  {
    icon: Award,
    title: 'Excellence',
    description: 'We maintain the highest standards in aviation training, ensuring our graduates are industry-ready.'
  },
  {
    icon: Target,
    title: 'Precision',
    description: 'Every module is carefully crafted to meet international aviation benchmarks and regulations.'
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Our curriculum is designed to prepare students for careers anywhere in the world.'
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Join a network of aviation professionals and alumni who support each other\'s success.'
  }
]

export function About() {
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
              Global Excellence in Aviation Education
            </h1>
            <p className="text-xl text-slate-500 max-w-3xl mx-auto">
              Alpha Step Links Aviation School is a certified aviation training institution dedicated to shaping the next generation of aviation professionals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="border-slate-200/50 h-full">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-semibold tracking-tighter text-slate-900 mb-4">
                    Our Mission
                  </h2>
                  <p className="text-slate-500 leading-relaxed">
                    To provide world-class aviation training that combines global safety standards with hands-on precision. 
                    We are committed to launching the next generation of pilots, cabin crew, and aviation leaders through 
                    comprehensive, industry-aligned programs that meet international aviation benchmarks.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="border-slate-200/50 h-full">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-semibold tracking-tighter text-slate-900 mb-4">
                    Our Vision
                  </h2>
                  <p className="text-slate-500 leading-relaxed">
                    To become West Africa's premier aviation academy, recognized globally for excellence in training, 
                    safety standards, and graduate success. We envision a future where every student who walks through 
                    our doors emerges as a confident, skilled aviation professional ready to excel in the global aviation industry.
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
            className="mb-16"
          >
            <Card className="border-slate-200/50">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-3xl font-semibold tracking-tighter text-slate-900 mb-6">
                  The Alpha Step Links Legacy
                </h2>
                <div className="space-y-4 text-slate-500 leading-relaxed">
                  <p>
                    Alpha Step Links Aviation School stands as a beacon of excellence in aviation education. 
                    Our curriculum isn't just taught; it's engineered by industry veterans to meet international 
                    aviation benchmarks.
                  </p>
                  <p>
                    We combine global safety standards with hands-on precision to launch the next generation of 
                    pilots, cabin crew, and aviation leaders. Our programs are designed to provide comprehensive 
                    training that prepares students for real-world aviation challenges.
                  </p>
                  <p>
                    With a commitment to excellence and a focus on student success, Alpha Step Links continues to 
                    set the standard for aviation training in West Africa and beyond.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Core Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h2 className="text-3xl font-semibold tracking-tighter text-slate-900 mb-8 text-center">
              Our Core Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                  >
                    <Card className="border-slate-200/50 h-full text-center">
                      <CardContent className="p-6">
                        <div className="flex justify-center mb-4">
                          <div className="p-3 bg-[#0061FF]/10 rounded-lg">
                            <Icon className="w-6 h-6 text-[#0061FF]" />
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold tracking-tighter text-slate-900 mb-2">
                          {value.title}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {value.description}
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
      <Footer />
    </div>
  )
}

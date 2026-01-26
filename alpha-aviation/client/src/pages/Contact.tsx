import { useState } from 'react'
import { motion } from 'framer-motion'
import { TopBar } from '@/components/TopBar'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Mail, Send } from 'lucide-react'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would send to your backend
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', phone: '', message: '' })
    }, 3000)
  }

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
              Get in Touch
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Have questions? We're here to help you start your aviation journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="border-slate-200/50">
                <CardHeader>
                  <CardTitle className="text-slate-900 tracking-tighter">Send us a Message</CardTitle>
                  <CardDescription className="text-slate-500">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-900 mb-2">
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-900 mb-2">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900"
                        placeholder="+234 XXX XXX XXXX"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-slate-900 mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={5}
                        className="w-full px-4 py-2.5 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900 resize-none"
                        placeholder="Tell us how we can help..."
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submitted}
                      className="w-full rounded-full bg-[#0061FF] hover:bg-[#0052E6] text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {submitted ? 'Message Sent!' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-6"
            >
              <Card className="border-slate-200/50">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold tracking-tighter text-slate-900 mb-6">
                    Contact Information
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-[#0061FF]/10 rounded-lg">
                        <MapPin className="w-5 h-5 text-[#0061FF]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 mb-1">Address</h3>
                        <p className="text-slate-500">
                          7 Chief Tajudeen Odubiyi St Lagos, Nigeria
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-[#0061FF]/10 rounded-lg">
                        <Phone className="w-5 h-5 text-[#0061FF]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 mb-1">Phone No</h3>
                        <p className="text-slate-500">02013306373</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-[#0061FF]/10 rounded-lg">
                        <Mail className="w-5 h-5 text-[#0061FF]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 mb-1">Email</h3>
                        <p className="text-slate-500">info@alphasteplinksaviationschool.com</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card className="border-slate-200/50">
                <CardContent className="p-0">
                  <div className="w-full h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Map Integration</p>
                      <p className="text-xs text-slate-400 mt-1">7 Chief Tajudeen Odubiyi St Lagos, Nigeria</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

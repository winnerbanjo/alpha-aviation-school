import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Mail, Send, Clock, Globe } from 'lucide-react'
import { sendContactMessage } from '@/api'
import { ContactSEO } from '@/components/seo/SEO'

const locations = [
  {
    country: "Nigeria",
    address: "7 Chief Tajudeen Odubiyi St, Ilasamaja, Lagos 102214",
    phone: "+234 814 025 7174",
    email: "info@alphasteplinksaviationschool.com"
  },
  {
    country: "United Kingdom",
    address: "London, United Kingdom",
    phone: "+44 20 7946 0958",
    email: "uk@alphasteplinksaviationschool.com"
  },
  {
    country: "Canada",
    address: "Toronto, Canada",
    phone: "+1 647 123 4567",
    email: "canada@alphasteplinksaviationschool.com"
  }
]

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await sendContactMessage(formData)
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', message: '' })
      setTimeout(() => setSubmitted(false), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ContactSEO />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-4 sm:px-6 bg-gradient-to-b from-[#e3f2fd] via-[#f0f8ff] to-white pt-32 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-bold text-blue-600 uppercase tracking-[0.4em] mb-6 block">
              Contact Us
            </span>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Let's Start Your <br />
              <span className="text-[#FF6B35]">Aviation Journey.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Have questions about our programs? Our team is here to help you every step of the way.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="lg:col-span-7"
            >
              <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-100">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                  Send us a Message
                </h2>
                <p className="text-slate-500 mb-8">
                  We'll get back to you within 24 hours.
                </p>
                
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 mb-6">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-900 mb-2">
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-5 py-3.5 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900 bg-white"
                        placeholder="John Doe"
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
                        className="w-full px-5 py-3.5 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900 bg-white"
                        placeholder="+234 XXX XXX XXXX"
                        required
                      />
                    </div>
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
                      className="w-full px-5 py-3.5 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900 bg-white"
                      placeholder="john@example.com"
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
                      className="w-full px-5 py-3.5 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900 bg-white resize-none"
                      placeholder="Tell us about your goals and questions..."
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitted || loading}
                    className="w-full rounded-full bg-[#FF6B35] hover:bg-[#E55A26] text-white py-6 text-base font-medium"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitted ? 'Message Sent!' : loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="lg:col-span-5 space-y-6"
            >
              <div className="bg-slate-900 rounded-3xl p-8 sm:p-10">
                <h2 className="text-2xl font-bold text-white mb-8">
                  Our Locations
                </h2>
                <div className="space-y-8">
                  {locations.map((loc, index) => (
                    <div key={index} className="border-l-2 border-[#FF6B35] pl-6">
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#FF6B35]" />
                        {loc.country}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                          <p className="text-slate-300 text-sm">{loc.address}</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                          <p className="text-slate-300 text-sm">{loc.phone}</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                          <p className="text-slate-300 text-sm">{loc.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Office Hours */}
              <div className="bg-[#0061FF]/5 rounded-3xl p-8 border border-[#0061FF]/10">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-[#0061FF]" />
                  <h3 className="text-lg font-semibold text-slate-900">Office Hours</h3>
                </div>
                <div className="space-y-2 text-slate-600">
                  <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                  <p>Saturday: 9:00 AM - 2:00 PM</p>
                  <p className="text-slate-400 text-sm">Sunday: Closed</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}

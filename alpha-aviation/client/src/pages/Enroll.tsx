import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TopBar } from '@/components/TopBar'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { register } from '@/api'

export function Enroll() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    enrolledCourse: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        enrolledCourse: formData.enrolledCourse,
        role: 'student',
      })
      
      // Redirect to registration success page
      navigate('/registration-success')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <TopBar />
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-slate-200/50 bg-white">
            <CardHeader>
              <CardTitle className="text-3xl font-semibold tracking-tighter text-slate-900">
                Enrollment Form
              </CardTitle>
              <CardDescription className="text-slate-500">
                Start your aviation career journey with us
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900"
                    placeholder="Create a password (min. 6 characters)"
                    minLength={6}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Course Interest
                  </label>
                  <select
                    value={formData.enrolledCourse}
                    onChange={(e) => setFormData({ ...formData, enrolledCourse: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900 bg-white"
                    required
                  >
                    <option value="">Select a course</option>
                    <option>Aviation Fundamentals & Strategy</option>
                    <option>Elite Cabin Crew & Safety Operations</option>
                    <option>Travel & Tourism Management</option>
                    <option>Airline Customer Service & Passenger Handling</option>
                    <option>Aviation Safety & Security Awareness</option>
                    <option>Ticketing & Reservation Systems (GDS Training)</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#0061FF] hover:bg-[#0052E6] text-white py-2.5 shadow-sm transition-all duration-300 hover:scale-105"
                >
                  {loading ? 'Submitting...' : 'Submit Enrollment'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/"
                  className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                >
                  ← Back to home
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

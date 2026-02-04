import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { register } from '@/api'
import { useAuthStore } from '@/store/authStore'

export function Enroll() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    enrolledCourse: '',
    paymentMethod: [] as string[],
    trainingMethod: [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.enrolledCourse) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      // Validate payment method
      if (!formData.paymentMethod || formData.paymentMethod.length === 0) {
        setError('Please select a payment method')
        setLoading(false)
        return
      }

      // Validate training method
      if (!formData.trainingMethod || formData.trainingMethod.length === 0) {
        setError('Please select a training method')
        setLoading(false)
        return
      }

      const response = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        enrolledCourse: formData.enrolledCourse,
        paymentMethod: formData.paymentMethod,
        trainingMethod: formData.trainingMethod,
        role: 'student',
      })
      
      // Auto-login: Save token and user data, then redirect to dashboard
      if (response?.data?.token && response?.data?.user) {
        const { token, user } = response.data
        
        // Save to auth store (which persists to localStorage)
        login(
          {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            enrolledCourse: user.enrolledCourse,
            paymentStatus: user.paymentStatus,
            amountDue: user.amountDue,
            amountPaid: user.amountPaid,
            enrollmentDate: user.enrollmentDate,
            phone: user.phone,
            emergencyContact: user.emergencyContact,
            bio: user.bio,
            documentUrl: user.documentUrl,
            paymentMethod: user.paymentMethod,
            trainingMethod: user.trainingMethod,
            status: user.status,
          },
          token
        )
        
        // Explicitly save token to localStorage for API interceptor
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Redirect immediately to dashboard
        navigate('/dashboard', { replace: true })
      } else {
        // Fallback: redirect to registration success if response structure is unexpected
        navigate('/registration-success')
      }
    } catch (err: any) {
      // Only show error message if server sends 400 or 500 error
      if (err.response?.status === 400 || err.response?.status === 500) {
        setError(err.response?.data?.message || 'Registration failed. Please check your information and try again.')
      } else {
        // For other errors (network, etc.), don't show error message but log for debugging
        console.error('Registration error:', err)
        // Still reset loading state
      }
      setLoading(false)
    }
  }

  return (
    <>
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
                    <option>Airline Cabin Crew Training</option>
                    <option>Airline Customer Service</option>
                    <option>Airport Operations Fundamental</option>
                    <option>Cargo Introductory Course</option>
                    <option>Foundation in Travel & Tourism with Galileo</option>
                    <option>Air Ticketing & Reservation Management</option>
                    <option>Customer Service & Communication in Aviation</option>
                    <option>Hospitality & Tourism Management</option>
                    <option>Travel Agency Operations</option>
                    <option>Visa Processing & Documentation</option>
                    <option>Hotel & Front Office Management</option>
                    <option>Tourism Marketing & Entrepreneurship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-4">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="tile-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.paymentMethod.includes('Full Payment')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              paymentMethod: [...formData.paymentMethod, 'Full Payment']
                            })
                          } else {
                            setFormData({
                              ...formData,
                              paymentMethod: formData.paymentMethod.filter(m => m !== 'Full Payment')
                            })
                          }
                        }}
                        className="sr-only"
                      />
                      <div className={`tile-content w-full p-6 rounded-xl border-2 transition-all ${
                        formData.paymentMethod.includes('Full Payment')
                          ? 'border-[#0061FF] bg-[#0061FF]/10'
                          : 'border-slate-200 bg-white'
                      }`}>
                        <div className="text-center">
                          <div className={`w-5 h-5 rounded border-2 mx-auto mb-3 ${
                            formData.paymentMethod.includes('Full Payment')
                              ? 'border-[#0061FF] bg-[#0061FF]'
                              : 'border-slate-300'
                          }`}>
                            {formData.paymentMethod.includes('Full Payment') && (
                              <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">Course fee (Full Payment)</span>
                        </div>
                      </div>
                    </label>
                    <label className="tile-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.paymentMethod.includes('Installmental Payment')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              paymentMethod: [...formData.paymentMethod, 'Installmental Payment']
                            })
                          } else {
                            setFormData({
                              ...formData,
                              paymentMethod: formData.paymentMethod.filter(m => m !== 'Installmental Payment')
                            })
                          }
                        }}
                        className="sr-only"
                      />
                      <div className={`tile-content w-full p-6 rounded-xl border-2 transition-all ${
                        formData.paymentMethod.includes('Installmental Payment')
                          ? 'border-[#0061FF] bg-[#0061FF]/10'
                          : 'border-slate-200 bg-white'
                      }`}>
                        <div className="text-center">
                          <div className={`w-5 h-5 rounded border-2 mx-auto mb-3 ${
                            formData.paymentMethod.includes('Installmental Payment')
                              ? 'border-[#0061FF] bg-[#0061FF]'
                              : 'border-slate-300'
                          }`}>
                            {formData.paymentMethod.includes('Installmental Payment') && (
                              <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">Course fee (installmental payment)</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-4">
                    Training Method
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="tile-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.trainingMethod.includes('Physical')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              trainingMethod: [...formData.trainingMethod, 'Physical']
                            })
                          } else {
                            setFormData({
                              ...formData,
                              trainingMethod: formData.trainingMethod.filter(m => m !== 'Physical')
                            })
                          }
                        }}
                        className="sr-only"
                      />
                      <div className={`tile-content w-full p-6 rounded-xl border-2 transition-all ${
                        formData.trainingMethod.includes('Physical')
                          ? 'border-[#0061FF] bg-[#0061FF]/10'
                          : 'border-slate-200 bg-white'
                      }`}>
                        <div className="text-center">
                          <div className={`w-5 h-5 rounded border-2 mx-auto mb-3 ${
                            formData.trainingMethod.includes('Physical')
                              ? 'border-[#0061FF] bg-[#0061FF]'
                              : 'border-slate-300'
                          }`}>
                            {formData.trainingMethod.includes('Physical') && (
                              <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">Physical</span>
                        </div>
                      </div>
                    </label>
                    <label className="tile-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.trainingMethod.includes('Virtual')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              trainingMethod: [...formData.trainingMethod, 'Virtual']
                            })
                          } else {
                            setFormData({
                              ...formData,
                              trainingMethod: formData.trainingMethod.filter(m => m !== 'Virtual')
                            })
                          }
                        }}
                        className="sr-only"
                      />
                      <div className={`tile-content w-full p-6 rounded-xl border-2 transition-all ${
                        formData.trainingMethod.includes('Virtual')
                          ? 'border-[#0061FF] bg-[#0061FF]/10'
                          : 'border-slate-200 bg-white'
                      }`}>
                        <div className="text-center">
                          <div className={`w-5 h-5 rounded border-2 mx-auto mb-3 ${
                            formData.trainingMethod.includes('Virtual')
                              ? 'border-[#0061FF] bg-[#0061FF]'
                              : 'border-slate-300'
                          }`}>
                            {formData.trainingMethod.includes('Virtual') && (
                              <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">Virtual</span>
                        </div>
                      </div>
                    </label>
                    <label className="tile-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.trainingMethod.includes('Distance Learning')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              trainingMethod: [...formData.trainingMethod, 'Distance Learning']
                            })
                          } else {
                            setFormData({
                              ...formData,
                              trainingMethod: formData.trainingMethod.filter(m => m !== 'Distance Learning')
                            })
                          }
                        }}
                        className="sr-only"
                      />
                      <div className={`tile-content w-full p-6 rounded-xl border-2 transition-all ${
                        formData.trainingMethod.includes('Distance Learning')
                          ? 'border-[#0061FF] bg-[#0061FF]/10'
                          : 'border-slate-200 bg-white'
                      }`}>
                        <div className="text-center">
                          <div className={`w-5 h-5 rounded border-2 mx-auto mb-3 ${
                            formData.trainingMethod.includes('Distance Learning')
                              ? 'border-[#0061FF] bg-[#0061FF]'
                              : 'border-slate-300'
                          }`}>
                            {formData.trainingMethod.includes('Distance Learning') && (
                              <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">Distance Learning</span>
                        </div>
                      </div>
                    </label>
                  </div>
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
    </>
  )
}

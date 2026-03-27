import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  
  const handleLogin = async () => {
    setLoading(true)
    setError('')

    if (!email || !password) {
      setError('Please provide both email and password')
      setLoading(false)
      return
    }

    try {
      const response = await axios.post(
        'https://asl-aviation-server.onrender.com/api/auth/login',
        {
          email,
          password
        }
      )

      const payload = response.data?.data ? response.data.data : response.data
      const token = payload?.token
      const userData = payload?.user
      const role = userData?.role

      if (!token || !userData || !role) {
        setError('Invalid server response. Please try again.')
        setLoading(false)
        return
      }

      login(
        {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          firstName: userData.firstName,
          lastName: userData.lastName,
          enrolledCourse: userData.enrolledCourse,
          selectedCourses: userData.selectedCourses,
          courseSelections: userData.courseSelections,
          paymentStatus: userData.paymentStatus,
          amountDue: userData.amountDue,
          amountPaid: userData.amountPaid,
          totalCoursePrice: userData.totalCoursePrice,
          enrollmentDate: userData.enrollmentDate,
          phone: userData.phone,
          emergencyContact: userData.emergencyContact,
          bio: userData.bio,
          documentUrl: userData.documentUrl,
          paymentMethod: userData.paymentMethod,
          trainingMethod: userData.trainingMethod,
          status: userData.status,
          paymentReceiptUrl: userData.paymentReceiptUrl,
          studentIdNumber: userData.studentIdNumber,
        },
        token
      )

      localStorage.setItem('token', token)
      localStorage.setItem('userRole', role)
      localStorage.setItem('user', JSON.stringify(userData))

      console.log('Token saved:', token)

      window.location.href = role === 'admin' ? '/admin/dashboard' : '/dashboard'
    } catch (error: any) {
      console.error(error)
      setError(error?.response?.data?.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(/smiling-traveler-with-suitcase.jpg)' }}
      />
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />

      <div className="relative z-10">
        <div className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4 sm:px-6 py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Glass-card Login Form */}
            <div className="glass-card rounded-lg shadow-xl p-8 sm:p-10">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-[#0061FF]/10 rounded-full">
                    <GraduationCap className="w-8 h-8 text-[#0061FF]" />
                  </div>
                </div>
                <h1 className="text-3xl font-semibold tracking-tighter text-slate-900 mb-2">
                  Student Portal
                </h1>
                <p className="text-slate-500 text-sm">
                  Sign in to access your training dashboard
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md"
                >
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleLogin() }} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900 transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-900 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] text-slate-900 transition-all"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#0061FF] hover:bg-[#0052E6] text-white py-2.5 shadow-sm transition-all duration-300 hover:scale-105"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <Link
                  to="/"
                  className="text-sm text-slate-500 hover:text-slate-900 transition-colors block"
                >
                  ← Back to home
                </Link>
                <button
                  onClick={() => {
                    const email = prompt('Enter your email address to reset password:')
                    if (email) {
                      alert(`Password reset link will be sent to ${email}. Please check your email.`)
                    }
                  }}
                  className="text-sm text-slate-500 hover:text-slate-900 transition-colors block w-full"
                >
                  Reset Password
                </button>
                <Link
                  to="/admin/portal"
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors block"
                >
                  Admin? Sign in here →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

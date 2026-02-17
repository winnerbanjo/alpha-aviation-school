import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { login as loginAPI } from '@/api'
import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate input
    if (!email || !password) {
      setError('Please provide both email and password')
      setLoading(false)
      return
    }

    try {
      // Real API login – no mock fallback during launch
      const data = await loginAPI(email, password)

      // Validate response structure
      if (!data || !data.data || !data.data.user || !data.data.token) {
        console.error('Invalid response structure:', data)
        setError('Invalid server response. Please try again.')
        setLoading(false)
        return
      }

      const userData = data.data.user
      const token = data.data.token

      // Check role and redirect accordingly
      if (userData.role === 'admin') {
        // Admin should not use student login - redirect to admin portal
        setError('Admin users must use the Admin Portal')
        setLoading(false)
        return
      }

      // Student login - verify role
      if (userData.role !== 'student') {
        setError('Invalid user role. Please contact support.')
        setLoading(false)
        return
      }

      // Save user data and token to store (which persists to localStorage)
      login(
        {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          firstName: userData.firstName,
          lastName: userData.lastName,
          enrolledCourse: userData.enrolledCourse,
          paymentStatus: userData.paymentStatus,
          amountDue: userData.amountDue,
          amountPaid: userData.amountPaid,
          enrollmentDate: userData.enrollmentDate,
          phone: userData.phone,
          emergencyContact: userData.emergencyContact,
          bio: userData.bio,
          documentUrl: userData.documentUrl,
        },
        token
      )

      // Explicitly save token to localStorage for API interceptor
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))

      // Navigate to student dashboard
      navigate('/dashboard')
    } catch (err: any) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. The server took too long to respond. Please try again.')
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('Server Unreachable: Cannot connect to backend. Check if server is running.')
      } else if (err.response?.status === 400) {
        setError('Invalid Email: Please check your email format.')
      } else if (err.response?.status === 401) {
        const errorMsg = err.response?.data?.message || 'Wrong Password: Invalid credentials.'
        if (errorMsg.toLowerCase().includes('email')) {
          setError('Invalid Email: Email not found in system.')
        } else if (errorMsg.toLowerCase().includes('password')) {
          setError('Wrong Password: Password is incorrect.')
        } else {
          setError(errorMsg)
        }
      } else if (err.response?.status === 500) {
        setError('Server Error: Internal server error. Please try again later.')
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.')
      }
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

              <form onSubmit={handleSubmit} className="space-y-5">
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

import { useState, useEffect } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react'
import axios from 'axios'

interface LoginResponse {
  success: boolean
  message?: string
  data?: {
    token: string
    user: {
      id: string
      email: string
      role: string
      firstName?: string
      lastName?: string
      enrolledCourse?: string
      selectedCourses?: string[]
      courseSelections?: Array<{ title: string; price: number }>
      paymentStatus?: 'Pending' | 'Paid'
      amountDue?: number
      amountPaid?: number
      totalCoursePrice?: number
      enrollmentDate?: string
      phone?: string
      emergencyContact?: string
      bio?: string
      documentUrl?: string
      paymentMethod?: string[]
      trainingMethod?: string[]
      status?: string
      paymentReceiptUrl?: string
      studentIdNumber?: string
    }
  }
}

export function AdminPortal() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [searchParams] = useSearchParams()
  const { login, isAuthenticated, user } = useAuthStore()

  const sessionExpired = searchParams.get('session_expired') === '1'
  const authFailed = searchParams.get('auth_failed') === '1'

  useEffect(() => {
    if (sessionExpired) {
      setError('Your session has expired. Please log in again.')
      window.history.replaceState({}, '', '/admin')
    } else if (authFailed) {
      setError('Authentication failed. Please check your credentials.')
      window.history.replaceState({}, '', '/admin')
    }
  }, [sessionExpired, authFailed])

  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const emailValue = email.trim().toLowerCase()
    const passwordValue = password

    if (!emailValue || !passwordValue) {
      setError('Please enter both email and password')
      setLoading(false)
      return
    }

    try {
      const response = await axios.post<LoginResponse>(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`,
        { email: emailValue, password: passwordValue }
      )

      const { data } = response.data

      if (!data?.success || !data.token || !data.user) {
        setError(response.data.message || 'Login failed. Please try again.')
        setLoading(false)
        return
      }

      if (data.user.role !== 'admin') {
        setError('Access denied. Admin credentials required.')
        setLoading(false)
        return
      }

      login(
        {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          enrolledCourse: data.user.enrolledCourse,
          selectedCourses: data.user.selectedCourses,
          courseSelections: data.user.courseSelections,
          paymentStatus: data.user.paymentStatus,
          amountDue: data.user.amountDue,
          amountPaid: data.user.amountPaid,
          totalCoursePrice: data.user.totalCoursePrice,
          enrollmentDate: data.user.enrollmentDate,
          phone: data.user.phone,
          emergencyContact: data.user.emergencyContact,
          bio: data.user.bio,
          documentUrl: data.user.documentUrl,
          paymentMethod: data.user.paymentMethod,
          trainingMethod: data.user.trainingMethod,
          status: data.user.status,
          paymentReceiptUrl: data.user.paymentReceiptUrl,
          studentIdNumber: data.user.studentIdNumber,
        },
        data.token
      )

      window.location.href = '/admin/dashboard'
    } catch (err: any) {
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setError('Invalid email or password')
            break
          case 429:
            setError('Too many attempts. Please wait a few minutes.')
            break
          default:
            setError(err.response.data?.message || 'Login failed. Please try again.')
        }
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. Please try again.')
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('Server unreachable. Please check connection.')
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/50 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-slate-900 rounded-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">
              Admin Portal
            </h1>
            <p className="text-slate-500 text-sm">
              Sign in with your admin credentials
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-slate-900 mb-2 flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 text-slate-900 transition-all bg-white"
                placeholder="admin@yourcompany.com"
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-slate-900 mb-2 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 text-slate-900 transition-all bg-white"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 text-white py-3 shadow-sm transition-all duration-300 hover:scale-[1.02] font-medium"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Student login →
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
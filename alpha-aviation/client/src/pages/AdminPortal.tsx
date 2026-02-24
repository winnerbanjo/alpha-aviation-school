import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Shield, Lock, Building2 } from 'lucide-react'
import axios from 'axios'

export function AdminPortal() {
  console.log('LOCAL STORAGE:', localStorage)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [adminEmail, setAdminEmail] = useState('admin@alpha.com')
  const [adminPassword, setAdminPassword] = useState('')
  const [authLoginError, setAuthLoginError] = useState('')
  const [authLoginLoading, setAuthLoginLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const { login } = useAuthStore()
  const sessionExpired = searchParams.get('session_expired') === '1'
  const authFailed = searchParams.get('auth_failed') === '1'

  useEffect(() => {
    if (sessionExpired) {
      setError('Session expired. Please log in again.')
      window.history.replaceState({}, '', '/admin/portal')
    } else if (authFailed) {
      setError('Authentication Failed. Please use your admin email and password below.')
      window.history.replaceState({}, '', '/admin/portal')
    }
  }, [sessionExpired, authFailed])

  const handleMasterKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post(
        'https://asl-aviation-server.onrender.com/api/auth/login',
        {
          email: 'admin@alpha.com',
          password
        }
      )

      const payload = response.data?.data ? response.data.data : response.data
      const token = payload?.token
      const userData = payload?.user
      const role = userData?.role

      if (!token || !userData || role !== 'admin') {
        setError('Invalid admin credentials.')
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

      localStorage.setItem('token', token)
      localStorage.setItem('userRole', role)
      localStorage.setItem('user', JSON.stringify(userData))

      window.location.href = '/admin/dashboard'
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid password. Access denied.')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoginError('')
    setAuthLoginLoading(true)

    try {
      const response = await axios.post(
        'https://asl-aviation-server.onrender.com/api/auth/login',
        {
          email: adminEmail,
          password: adminPassword
        }
      )
      const payload = response.data?.data ? response.data.data : response.data

      if (!payload || !payload.user || !payload.token) {
        setAuthLoginError('Invalid server response. Please try again.')
        setAuthLoginLoading(false)
        return
      }

      if (payload.user.role !== 'admin') {
        setAuthLoginError('Unauthorized. Please use the Student Portal for non-admin accounts.')
        setAuthLoginLoading(false)
        return
      }

      login(
        {
          id: payload.user.id,
          email: payload.user.email,
          role: payload.user.role,
          firstName: payload.user.firstName,
          lastName: payload.user.lastName,
          enrolledCourse: payload.user.enrolledCourse,
          paymentStatus: payload.user.paymentStatus,
          amountDue: payload.user.amountDue,
          amountPaid: payload.user.amountPaid,
          enrollmentDate: payload.user.enrollmentDate,
          phone: payload.user.phone,
          emergencyContact: payload.user.emergencyContact,
          bio: payload.user.bio,
          documentUrl: payload.user.documentUrl,
        },
        payload.token
      )

      localStorage.setItem('token', payload.token)
      localStorage.setItem('userRole', payload.user.role)
      localStorage.setItem('user', JSON.stringify(payload.user))

      window.location.href = '/admin/dashboard'
    } catch (err: any) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setAuthLoginError('Request timed out. The server took too long to respond. Please try again.')
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setAuthLoginError('Server unreachable. Please check your connection and try again.')
      } else if (err.response?.status === 400) {
        setAuthLoginError('Invalid Email: Please check your email format.')
      } else if (err.response?.status === 401) {
        const errorMsg = err.response?.data?.message || 'Wrong Password: Invalid credentials.'
        setAuthLoginError(errorMsg)
      } else {
        setAuthLoginError(err.response?.data?.message || 'Login failed. Please try again.')
      }
    } finally {
      setAuthLoginLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Private Admin Portal Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/50 p-8 sm:p-10">
          {/* Header */}
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
              Private access - Master Key or Admin Login
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg"
            >
              <p className="text-sm text-amber-800">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleMasterKeySubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-slate-900 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Master Access Key
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 text-slate-900 transition-all bg-white"
                placeholder="e.g. alphaadmin2026"
                required
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 text-white py-3 shadow-sm transition-all duration-300 hover:scale-[1.02] font-medium"
            >
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </Button>
          </form>
        </div>

        {/* When authFailed, show full backend-powered login on this page */}
        {authFailed && (
          <div className="bg-white/95 rounded-2xl shadow-xl border border-slate-200/60 p-6 sm:p-8">
            <div className="mb-4 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-slate-100 rounded-xl">
                  <Building2 className="w-5 h-5 text-slate-700" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                Login with Admin Account
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                This form connects directly to the ASL server at
                {' '}
                https://asl-aviation-server.onrender.com/api/auth/login
              </p>
            </div>

            {authLoginError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-xs text-red-600">{authLoginError}</p>
              </motion.div>
            )}

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-medium text-slate-900 mb-1.5 flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  Admin Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200/60 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 text-slate-900 text-sm bg-white"
                  placeholder="admin@alpha.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="admin-login-password"
                  className="block text-xs font-medium text-slate-900 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="admin-login-password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200/60 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 text-slate-900 text-sm bg-white"
                  placeholder="Enter your admin password"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={authLoginLoading}
                className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 text-white py-2.5 text-sm font-medium"
              >
                {authLoginLoading ? 'Connecting…' : 'Login to Admin Dashboard'}
              </Button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  )
}

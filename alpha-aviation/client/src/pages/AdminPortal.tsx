import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Shield, Lock } from 'lucide-react'

export function AdminPortal() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check password - NO email field, password-only
    if (password === 'alphaadmin2026') {
      // Create mock admin user for auth store
      const mockAdmin = {
        id: 'admin-alpha-2026',
        email: 'admin@alpha.com',
        role: 'admin' as const,
        firstName: 'Admin',
        lastName: 'User',
        enrolledCourse: '',
        paymentStatus: 'Paid' as const,
        amountDue: 0,
        amountPaid: 0,
        enrollmentDate: new Date().toISOString(),
        phone: '',
        emergencyContact: '',
        bio: '',
        documentUrl: ''
      }

      // Generate a mock token (in production, this would come from API)
      const mockToken = 'admin-token-' + Date.now()

      // Save to auth store and localStorage
      login(mockAdmin, mockToken)
      
      // Explicitly save token to localStorage for API interceptor
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockAdmin))
      
      // Navigate to admin dashboard
      navigate('/admin/dashboard')
    } else {
      setError('Invalid password. Access denied.')
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
              Private access - Password required
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
      </motion.div>
    </div>
  )
}

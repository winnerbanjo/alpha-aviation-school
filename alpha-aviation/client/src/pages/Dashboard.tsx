import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopNav } from '@/components/dashboard/TopNav'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'
import { StudentDashboard } from '@/components/dashboard/StudentDashboard'

export function Dashboard() {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Redirect to appropriate login based on route
      if (location.pathname.includes('/admin')) {
        navigate('/admin/portal', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
      return
    }

    // STRICT role-based routing - Students CANNOT access admin routes
    if (user.role === 'admin') {
      // Admin must go to /admin/dashboard
      if (location.pathname !== '/admin/dashboard' && !location.pathname.includes('/admin/dashboard')) {
        navigate('/admin/dashboard', { replace: true })
        return
      }
    } else if (user.role === 'student') {
      // Student must go to /dashboard - BLOCK admin routes
      if (location.pathname === '/admin/dashboard' || location.pathname.includes('/admin')) {
        navigate('/dashboard', { replace: true })
        return
      }
    }
  }, [isAuthenticated, user, navigate, location.pathname])

  if (!isAuthenticated || !user) {
    return null
  }

  // Google-Tier App Layout: Fixed Sidebar + Top Nav + Content (NO public site elements)
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Fixed Left Sidebar */}
      <Sidebar role={user.role} />
      
      {/* Main Content Area with Top Nav */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Top Navigation Bar */}
        <TopNav role={user.role} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {user.role === 'admin' ? (
            <AdminDashboard />
          ) : user.role === 'student' ? (
            <StudentDashboard />
          ) : (
            <div className="flex items-center justify-center py-16">
              <p className="text-slate-500">Redirecting...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

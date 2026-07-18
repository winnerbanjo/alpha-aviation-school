import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  adminOnly?: boolean
  agentOnly?: boolean
  children?: React.ReactNode
}

export function ProtectedRoute({ adminOnly, agentOnly, children }: ProtectedRouteProps) {
  const { hasHydrated, token: storeToken, user } = useAuthStore()
  const token = storeToken || localStorage.getItem('token')
  const userRole = user?.role || localStorage.getItem('userRole')

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  if (!token) {
    if (agentOnly) return <Navigate to="/agent/login" replace />
    return <Navigate to={adminOnly ? "/admin" : "/login"} replace />
  }

  // Agent-only route guards
  if (agentOnly) {
    if (userRole !== 'agent') return <Navigate to="/agent/login" replace />
    if (user?.agentStatus === 'pending') return <Navigate to="/agent/pending" replace />
    if (user?.agentStatus === 'rejected' || user?.agentStatus === 'suspended') return <Navigate to="/agent/pending" replace />
    return <>{children}</>
  }

  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/admin" replace />
  }

  // Redirect agents who try to hit student or admin routes
  if (!adminOnly && userRole === 'admin') {
    return <Navigate to="/admin/dashboard/overview" replace />
  }
  if (!adminOnly && userRole === 'agent') {
    return <Navigate to="/agent/dashboard/overview" replace />
  }

  return <>{children}</>
}

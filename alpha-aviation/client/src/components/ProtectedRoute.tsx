import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  adminOnly?: boolean
  children?: React.ReactNode
}

export function ProtectedRoute({ adminOnly, children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  // Not authenticated - redirect to appropriate login
  if (!isAuthenticated) {
    if (adminOnly) {
      return <Navigate to="/admin/portal" replace />
    }
    return <Navigate to="/login" replace />
  }

  // Admin-only route - STRICT check: must be admin
  if (adminOnly) {
    if (!user || user.role !== 'admin') {
      // Student or non-admin trying to access admin route
      return <Navigate to="/dashboard" replace />
    }
    // Admin accessing admin route - allow
    return children ? <>{children}</> : <Outlet />
  }

  // Student route - if admin tries to access, redirect to admin dashboard
  if (user && user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  // Student accessing student route - allow
  return children ? <>{children}</> : <Outlet />
}

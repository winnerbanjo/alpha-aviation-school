import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  adminOnly?: boolean
  children?: React.ReactNode
}

export function ProtectedRoute({ adminOnly, children }: ProtectedRouteProps) {
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
    return <Navigate to="/login" replace />
  }

  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/admin" replace />
  }

  if (!adminOnly && userRole === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <>{children}</>
}

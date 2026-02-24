import React from 'react'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  adminOnly?: boolean
  children?: React.ReactNode
}

export function ProtectedRoute({ adminOnly, children }: ProtectedRouteProps) {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')
  console.log('ProtectedRoute token:', token)

  if (!token) {
    console.log('No token found, redirecting')
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

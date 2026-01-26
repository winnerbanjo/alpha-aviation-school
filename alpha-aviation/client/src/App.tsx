import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { AdminPortal } from './pages/AdminPortal'
import { Dashboard } from './pages/Dashboard'
import { Enroll } from './pages/Enroll'
import { RegistrationSuccess } from './pages/RegistrationSuccess'
import { Courses } from './pages/Courses'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Footer } from './components/Footer'

function Layout() {
  // Hooks MUST be called at the top level, never inside conditions or try-catch
  const location = useLocation()
  const isDashboardRoute = location?.pathname?.includes('/dashboard') || false
  
  try {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/portal" element={<AdminPortal />} />
            <Route path="/enroll" element={<Enroll />} />
            <Route path="/registration-success" element={<RegistrationSuccess />} />
            {/* Student Dashboard - Default /dashboard route */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Admin Dashboard - /admin/dashboard route */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Legacy routes for backward compatibility */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/student"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        {!isDashboardRoute && <Footer />}
      </div>
    )
  } catch (error) {
    console.error('Layout error:', error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App

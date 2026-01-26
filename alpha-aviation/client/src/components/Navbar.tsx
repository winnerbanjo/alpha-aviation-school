import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/Logo'

interface NavbarProps {
  scrolled?: boolean
}

export function Navbar({ scrolled = false }: NavbarProps) {
  const { isAuthenticated, logout, user } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Determine dashboard path based on user role
  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'

  return (
    <>
      <nav 
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <Logo size="sm" showText={true} />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <Link to="/" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                About Us
              </Link>
              <Link to="/courses" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Training Courses
              </Link>
              <Link to="/contact" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Contact Us
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to={dashboardPath}>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="rounded-full"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="rounded-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/enroll">
                    <Button
                      size="sm"
                      className="rounded-full bg-[#0061FF] hover:bg-[#0052E6] text-white shadow-sm transition-all duration-300 hover:scale-105"
                    >
                      Enroll Now
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-slate-900"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Glassmorphism */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-20">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="glass-card relative z-50 mx-4 rounded-lg shadow-xl border border-white/90 p-6">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-sm text-slate-900 hover:text-[#0061FF] transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="text-sm text-slate-900 hover:text-[#0061FF] transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link 
                to="/courses" 
                className="text-sm text-slate-900 hover:text-[#0061FF] transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Training Courses
              </Link>
              <Link 
                to="/contact" 
                className="text-sm text-slate-900 hover:text-[#0061FF] transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
              
              <div className="pt-4 border-t border-slate-200/50 space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link to={dashboardPath} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full rounded-full">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full rounded-full"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full rounded-full">
                        Login
                      </Button>
                    </Link>
                    <Link to="/enroll" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        size="sm"
                        className="w-full rounded-full bg-[#0061FF] hover:bg-[#0052E6] text-white"
                      >
                        Enroll Now
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

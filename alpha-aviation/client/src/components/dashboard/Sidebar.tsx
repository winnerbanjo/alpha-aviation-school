import { NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Banknote, 
  BookOpen, 
  User, 
  FileText, 
  Download,
  Menu,
  X,
  LogOut
} from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/Logo'

interface SidebarProps {
  role: 'admin' | 'student'
}

export function Sidebar({ role }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  type NavItem = {
    icon: typeof LayoutDashboard
    label: string
    path: string
    tab?: string
  }

  const adminNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Command Center', path: '/admin/dashboard', tab: 'overview' },
    { icon: Users, label: 'Students', path: '/admin/dashboard', tab: 'students' },
    { icon: Banknote, label: 'Revenue', path: '/admin/dashboard', tab: 'revenue' },
  ]

  const studentNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard', tab: 'overview' },
    { icon: BookOpen, label: 'Flight Roadmap', path: '/dashboard', tab: 'curriculum' },
    { icon: FileText, label: 'Document Vault', path: '/dashboard', tab: 'documents' },
    { icon: Download, label: 'Resource Library', path: '/dashboard', tab: 'resources' },
    { icon: User, label: 'Profile Settings', path: '/dashboard', tab: 'profile' },
  ]

  const navItems = role === 'admin' ? adminNavItems : studentNavItems

  // Check if a nav item is active
  const isActive = (item: NavItem) => {
    if (item.tab) {
      // For both admin and student dashboards, check sessionStorage for active tab
      const activeTab = sessionStorage.getItem(role === 'admin' ? 'adminTab' : 'activeTab')
      return activeTab === item.tab
    }
    return location.pathname === item.path
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-md border border-slate-800"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-40 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-slate-800">
            <Logo showText={false} size="md" className="text-white" />
            <h1 className="text-xl font-semibold tracking-tight text-white mt-2">
              Alpha Step Links Aviation School
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {role === 'admin' ? 'Admin Portal' : 'Student Portal'}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item)
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => {
                    setMobileMenuOpen(false)
                    // Store active tab in sessionStorage for both admin and student
                    if (item.tab) {
                      const storageKey = role === 'admin' ? 'adminTab' : 'activeTab'
                      sessionStorage.setItem(storageKey, item.tab)
                      // Trigger a custom event to notify dashboard component
                      window.dispatchEvent(new CustomEvent('tabChange', { detail: item.tab }))
                    }
                  }}
                  className={({ isActive: navIsActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      navIsActive || active
                        ? 'bg-[#0061FF]/20 text-white border-l-2 border-[#0061FF]'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-slate-800 space-y-2">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            {role === 'admin' && (
              <button
                onClick={() => {
                  logout()
                  navigate('/admin/portal')
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-300 rounded-lg hover:bg-red-900/20 hover:text-red-300 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

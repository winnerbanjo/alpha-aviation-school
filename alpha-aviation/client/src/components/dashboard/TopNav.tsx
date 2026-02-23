import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TopNavProps {
  role: 'admin' | 'student'
}

export function TopNav({ role }: TopNavProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(role === 'admin' ? '/admin/portal' : '/login')
  }

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.email || 'User'

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <User className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{displayName}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {role === 'admin' && (
              <Button
                type="button"
                variant="outline"
                className="rounded-lg border-red-200 text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                onClick={() => {
                  localStorage.clear()
                  window.location.reload()
                }}
              >
                Clear Session
              </Button>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="rounded-lg border-slate-200 hover:bg-slate-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

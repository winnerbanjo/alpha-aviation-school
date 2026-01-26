import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  id: string
  email: string
  role: 'student' | 'admin'
  firstName?: string
  lastName?: string
  enrolledCourse?: string
  paymentStatus?: 'Pending' | 'Paid'
  amountDue?: number
  amountPaid?: number
  enrollmentDate?: string
  phone?: string
  emergencyContact?: string
  bio?: string
  documentUrl?: string
  adminClearance?: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        // Save to localStorage explicitly for API interceptor
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        // Clear localStorage on logout
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('auth-storage')
        set({ user: null, token: null, isAuthenticated: false })
      },
      setUser: (user) => {
        // Update user and sync to localStorage
        const currentState = get()
        if (currentState.token) {
          localStorage.setItem('user', JSON.stringify(user))
        }
        set({ user })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Ensure token is synced to localStorage root for API interceptor
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          localStorage.setItem('token', state.token)
          localStorage.setItem('user', JSON.stringify(state.user))
        }
      },
    }
  )
)

import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('auth-storage')
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/admin/portal')) {
        window.location.href = '/login'
      }
    }
    // For network errors, don't crash - let components handle gracefully
    if (!error.response && error.request) {
      console.warn('Network error - server may be unreachable, using mock data fallback')
    }
    return Promise.reject(error)
  }
)

// Auth API calls
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  } catch (error: any) {
    // Re-throw with more context for better error handling
    if (error.response) {
      // Server responded with error status
      throw error
    } else if (error.request) {
      // Request made but no response (network error)
      throw new Error('Network Error: Server is unreachable')
    } else {
      // Something else happened
      throw error
    }
  }
}

export const register = async (userData: {
  email: string
  password: string
  role?: 'admin' | 'student'
  firstName?: string
  lastName?: string
  enrolledCourse?: string
  amountDue?: number
}) => {
  const response = await api.post('/auth/register', userData)
  return response.data
}

export const getProfile = async () => {
  const response = await api.get('/auth/profile')
  return response.data
}

// Student API calls
export const updateStudentProfile = async (phone?: string, bio?: string, emergencyContact?: string) => {
  const response = await api.patch('/student/profile', { phone, bio, emergencyContact })
  return response.data
}

export const uploadDocument = async (documentUrl: string) => {
  const response = await api.post('/student/upload-document', { documentUrl })
  return response.data
}

// Admin API calls
export const getAllStudents = async () => {
  const response = await api.get('/admin/students')
  return response.data
}

export const getFinancialStats = async () => {
  const response = await api.get('/admin/financial-stats')
  return response.data
}

export const updatePaymentStatus = async (studentId: string) => {
  const response = await api.patch(`/admin/students/${studentId}`)
  return response.data
}

export const batchUpdatePaymentStatus = async (studentIds: string[]) => {
  const response = await api.patch('/admin/students/batch-payment', { studentIds })
  return response.data
}

export const updateStudentCourse = async (studentId: string, enrolledCourse: string) => {
  const response = await api.patch(`/admin/students/${studentId}/course`, { enrolledCourse })
  return response.data
}

// Payment API calls
export const getPayments = async () => {
  const response = await api.get('/payments')
  return response.data
}

export const createPayment = async (paymentData: {
  amount: number
  description?: string
  paymentMethod?: string
}) => {
  const response = await api.post('/payments', paymentData)
  return response.data
}

export default api

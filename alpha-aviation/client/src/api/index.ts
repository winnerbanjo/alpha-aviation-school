import axios from 'axios'

// Exact backend URL, no trailing slash; paths use /api/auth/... to match backend
const RENDER_API_BASE = 'https://bugawheels.onrender.com'

const getApiBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  if (import.meta.env.PROD) {
    return RENDER_API_BASE
  }
  return 'http://localhost:5000'
}

// Create axios instance with timeout and CORS credentials
const api = axios.create({
  baseURL: getApiBaseURL(),
  timeout: 30000, // 30s - allow Render cold start to wake without showing timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // required for Vercel (.co) <-> Render cross-origin
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
    // For network errors, surface real error (no mock fallback during launch)
    if (!error.response && error.request) {
      // console.warn('Network error - server may be unreachable')
    }
    return Promise.reject(error)
  }
)

// Auth API calls
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/api/auth/login', { email, password })
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
  paymentMethod?: string[]
  trainingMethod?: string[]
}) => {
  const response = await api.post('/api/auth/register', userData)
  return response.data
}

export const getProfile = async () => {
  const response = await api.get('/api/auth/profile')
  return response.data
}

// Student API calls
export const updateStudentProfile = async (phone?: string, bio?: string, emergencyContact?: string) => {
  const response = await api.patch('/api/student/profile', { phone, bio, emergencyContact })
  return response.data
}

export const uploadDocument = async (documentUrl: string) => {
  const response = await api.post('/api/student/upload-document', { documentUrl })
  return response.data
}

export const uploadPaymentReceipt = async (receiptUrl: string) => {
  const response = await api.post('/api/student/upload-payment-receipt', { receiptUrl })
  return response.data
}

// Admin API calls
export const getAllStudents = async () => {
  try {
    const response = await api.get('/api/admin/students')
    return response.data
  } catch (error: any) {
    // Mock fallback disabled for launch – surface real error
    // if (!error.response && error.request) { ... }
    throw error
  }
}

export const getFinancialStats = async () => {
  try {
    const response = await api.get('/api/admin/financial-stats')
    return response.data
  } catch (error: any) {
    // Mock fallback disabled for launch – surface real error
    throw error
  }
}

export const updatePaymentStatus = async (studentId: string) => {
  const response = await api.patch(`/api/admin/students/${studentId}`)
  return response.data
}

export const batchUpdatePaymentStatus = async (studentIds: string[]) => {
  const response = await api.patch('/api/admin/students/batch-payment', { studentIds })
  return response.data
}

export const updateStudentCourse = async (studentId: string, enrolledCourse: string) => {
  const response = await api.patch(`/api/admin/students/${studentId}/course`, { enrolledCourse })
  return response.data
}

// Payment API calls
export const getPayments = async () => {
  const response = await api.get('/api/payments')
  return response.data
}

export const createPayment = async (paymentData: {
  amount: number
  description?: string
  paymentMethod?: string
}) => {
  const response = await api.post('/api/payments', paymentData)
  return response.data
}

export default api

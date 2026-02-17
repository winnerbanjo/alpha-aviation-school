import axios from 'axios'

// Hardcoded ASL server – no env override so live site cannot point to old URL
const API_URL = 'https://asl-aviation-server.onrender.com/api'

const api = axios.create({
  baseURL: import.meta.env.PROD ? API_URL : 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor: Bearer token (required for admin/student API)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: 401 = session expired; send to portal with message (no immediate redirect for admin)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('auth-storage')
      // TEMPORARILY DISABLED so errors stay on screen for debugging (re-enable when stable)
      // const isAdminRoute = window.location.pathname.includes('/admin')
      // if (isAdminRoute) { window.location.href = '/admin/portal?session_expired=1' }
      // else if (!window.location.pathname.includes('/login')) { window.location.href = '/login?session_expired=1' }
    }
    if (!error.response && error.request) {
      // network error – let callers handle
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
  paymentMethod?: string[]
  trainingMethod?: string[]
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

export const uploadPaymentReceipt = async (receiptUrl: string) => {
  const response = await api.post('/student/upload-payment-receipt', { receiptUrl })
  return response.data
}

// Admin API calls
export const getAdminTest = async () => {
  const response = await api.get('/admin/test');
  return response.data;
};

// Uses baseURL https://asl-aviation-server.onrender.com/api → GET /admin/students (no bugawheels)
export const getAllStudents = async () => {
  try {
    const response = await api.get('/admin/students')
    return response.data
  } catch (error: any) {
    // Mock fallback disabled for launch – surface real error
    // if (!error.response && error.request) { ... }
    throw error
  }
}

export const getFinancialStats = async () => {
  try {
    const response = await api.get('/admin/financial-stats')
    return response.data
  } catch (error: any) {
    // Mock fallback disabled for launch – surface real error
    throw error
  }
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

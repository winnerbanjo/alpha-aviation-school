import axios, { type AxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Bearer token (required for admin/student API)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: 401 = session expired; send to portal with message (no immediate redirect for admin)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("auth-storage");
    } else if (
      error.response?.data?.message &&
      typeof error.response.data.message === "string" &&
      error.response.data.message.toLowerCase().includes("not authorized")
    ) {
      // Force reset if backend explicitly reports "Not authorized"
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("auth-storage");
    }
    if (!error.response && error.request) {
      // network error – let callers handle
    }
    return Promise.reject(error);
  },
);

// Auth API calls
export const login = async (
  email: string,
  password: string,
  config?: AxiosRequestConfig,
) => {
  try {
    const response = await api.post("/auth/login", { email, password }, config);
    return response;
  } catch (error: any) {
    // Re-throw with more context for better error handling
    if (error.response) {
      // Server responded with error status
      throw error;
    } else if (error.request) {
      // Request made but no response (network error)
      throw new Error("Network Error: Server is unreachable");
    } else {
      // Something else happened
      throw error;
    }
  }
};

export const register = async (userData: {
  email: string;
  password: string;
  role?: "admin" | "student";
  firstName?: string;
  lastName?: string;
  selectedCourses?: string[];
  amountDue?: number;
  paymentMethod?: string[];
  trainingMethod?: string[];
}) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const sendContactMessage = async (contactData: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) => {
  const response = await api.post("/auth/contact", contactData);
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token: string, password: string) => {
  const response = await api.post("/auth/reset-password", { token, password });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/auth/profile");
  return response.data;
};

// Student API calls
export const updateStudentProfile = async (
  phone?: string,
  bio?: string,
  emergencyContact?: string,
) => {
  const response = await api.patch("/student/profile", {
    phone,
    bio,
    emergencyContact,
  });
  return response.data;
};

export const uploadDocument = async (documentUrl: string) => {
  const response = await api.post("/student/upload-document", { documentUrl });
  return response.data;
};

export const uploadPaymentReceipt = async (receiptUrl: string) => {
  const response = await api.post("/student/upload-payment-receipt", {
    receiptUrl,
  });
  return response.data;
};

// Admin API calls
export const getAdminTest = async (config?: AxiosRequestConfig) => {
  // Admin connection tests are allowed up to 60s to survive Render cold starts
  const response = await api.get("/admin/test", { timeout: 60000, ...config });
  return response.data;
};

// Uses baseURL https://asl-aviation-server.onrender.com/api → GET /admin/students (no bugawheels)
export const getAllStudents = async (config?: AxiosRequestConfig) => {
  try {
    // Admin dashboard core data: extend timeout to 60s for Render cold starts
    const response = await api.get("/admin/students", {
      timeout: 60000,
      ...config,
    });
    return response.data;
  } catch (error: any) {
    // Mock fallback disabled for launch – surface real error
    // if (!error.response && error.request) { ... }
    throw error;
  }
};

export const getFinancialStats = async (config?: AxiosRequestConfig) => {
  try {
    // Financial stats are part of the admin dashboard; allow up to 60s
    const response = await api.get("/admin/financial-stats", {
      timeout: 60000,
      ...config,
    });
    return response.data;
  } catch (error: any) {
    // Mock fallback disabled for launch – surface real error
    throw error;
  }
};

export const updatePaymentStatus = async (
  studentId: string,
  config?: AxiosRequestConfig,
) => {
  const response = await api.patch(
    `/admin/students/${studentId}`,
    undefined,
    config,
  );
  return response.data;
};

export const batchUpdatePaymentStatus = async (
  studentIds: string[],
  config?: AxiosRequestConfig,
) => {
  const response = await api.patch(
    "/admin/students/batch-payment",
    { studentIds },
    config,
  );
  return response.data;
};

export const updateStudentCourse = async (
  studentId: string,
  enrolledCourse: string,
  config?: AxiosRequestConfig,
) => {
  const response = await api.patch(
    `/admin/students/${studentId}/course`,
    { enrolledCourse },
    config,
  );
  return response.data;
};

export const updateStudentStatus = async (
  studentId: string,
  status: "active" | "banned" | "graduated" | "suspended",
  config?: AxiosRequestConfig,
) => {
  const response = await api.patch(
    `/admin/students/${studentId}/status`,
    { status },
    config,
  );
  return response.data;
};

// User management
export const createUser = async (
  userData: {
    email: string;
    password: string;
    role: "admin" | "student";
    firstName?: string;
    lastName?: string;
    phone?: string;
  },
  config?: AxiosRequestConfig,
) => {
  const response = await api.post("/admin/users", userData, config);
  return response.data;
};

export const updateUser = async (
  userId: string,
  userData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: "admin" | "student";
    status?: "active" | "banned" | "graduated" | "suspended";
    paymentStatus?: "Pending" | "Paid";
  },
  config?: AxiosRequestConfig,
) => {
  const response = await api.put(`/admin/users/${userId}`, userData, config);
  return response.data;
};

export const deleteUser = async (
  userId: string,
  config?: AxiosRequestConfig,
) => {
  const response = await api.delete(`/admin/users/${userId}`, config);
  return response.data;
};

export const bulkImportUsers = async (
  users: Array<{
    email: string;
    password: string;
    role?: "admin" | "student";
    firstName?: string;
    lastName?: string;
    phone?: string;
    status?: "active" | "banned" | "graduated" | "suspended";
    studentIdNumber?: string;
  }>,
  config?: AxiosRequestConfig,
) => {
  const response = await api.post(
    "/admin/users/bulk-import",
    { users },
    config,
  );
  return response.data;
};

export const bulkDeleteUsers = async (
  userIds: string[],
  config?: AxiosRequestConfig,
) => {
  const response = await api.post(
    "/admin/users/bulk-delete",
    { userIds },
    config,
  );
  return response.data;
};

export const bulkUpdateStatus = async (
  userIds: string[],
  status: "active" | "banned" | "graduated" | "suspended",
  config?: AxiosRequestConfig,
) => {
  const response = await api.post(
    "/admin/users/bulk-status",
    { userIds, status },
    config,
  );
  return response.data;
};

export const uploadCertificate = async (
  userId: string,
  certificateUrl: string,
  config?: AxiosRequestConfig,
) => {
  const response = await api.post(
    `/admin/users/${userId}/certificate`,
    { certificateUrl },
    config,
  );
  return response.data;
};

// Payment API calls
export const getPayments = async () => {
  const response = await api.get("/payments");
  return response.data;
};

export const createPayment = async (paymentData: {
  amount: number;
  description?: string;
  paymentMethod?: string;
}) => {
  const response = await api.post("/payments", paymentData);
  return response.data;
};

export default api;

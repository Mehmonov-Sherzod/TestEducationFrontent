import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { storage } from '@utils/storage'

// Create axios instance
// In development, requests go through Vite proxy (no baseURL needed)
// In production, use the full API URL
const isDev = import.meta.env.DEV
const api = axios.create({
  baseURL: isDev ? '' : (import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001'),
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'en-US',
  },
  timeout: 30000, // 30 seconds
})

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken()

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle responses and errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - clear auth and redirect
    if (error.response?.status === 401) {
      storage.clearAuth()
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }

    return Promise.reject(error)
  }
)

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  // If backend returned errors array (PascalCase)
  if (error.response?.data?.Errors?.length > 0) {
    return error.response.data.Errors.join(', ')
  }

  // If backend returned a message
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  // If axios error with message
  if (error.message) {
    return error.message
  }

  // Default error message
  return 'An unexpected error occurred'
}

export default api

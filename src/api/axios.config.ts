import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { storage } from '@utils/storage'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://10.30.13.228:5000',
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'en-US',
  },
  timeout: 30000, // 30 seconds
})

console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://10.30.13.228:5000')

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken()

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
    })

    return config
  },
  (error: AxiosError) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - Handle responses and errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    })
    // Return the data directly for successful responses
    return response.data
  },
  (error: AxiosError) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    })

    // Handle 401 Unauthorized - clear auth and redirect
    if (error.response?.status === 401) {
      storage.clearAuth()
      // Only redirect if not already on home page
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden')
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('Resource not found')
    }

    // Handle 500 Server Error
    if (error.response?.status && error.response.status >= 500) {
      console.error('Server error occurred')
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error - please check your connection')
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

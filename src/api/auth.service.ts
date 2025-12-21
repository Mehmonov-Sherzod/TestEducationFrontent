import api from './axios.config'
import { ApiResponse } from '@appTypes/api.types'
import { LoginData, LoginResult, RegisterData, RegisterResult } from '@appTypes/auth.types'
import { API_ENDPOINTS } from '@utils/constants'

/**
 * Authentication API service
 */
export const authService = {
  /**
   * Login user with email and password
   * POST /api/Auth/Login
   */
  login: async (data: LoginData): Promise<ApiResponse<LoginResult>> => {
    // Backend expects PascalCase properties
    // axios interceptor returns response.data directly
    return api.post(API_ENDPOINTS.AUTH.LOGIN, {
      Email: data.email,
      Password: data.password,
    })
  },

  /**
   * Register new user
   * POST /api/Auth/Register
   */
  register: async (data: RegisterData): Promise<ApiResponse<RegisterResult>> => {
    // Backend expects PascalCase properties
    return api.post(API_ENDPOINTS.AUTH.REGISTER, {
      FullName: data.fullName,
      Email: data.email,
      Password: data.password,
      PhoneNumber: data.phoneNumber,
    })
  },
}

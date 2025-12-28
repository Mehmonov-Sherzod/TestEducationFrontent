import api from './axios.config'
import { ApiResponse } from '@appTypes/api.types'
import { SendOTPData, VerifyOTPData, ResetPasswordData } from '@appTypes/auth.types'
import {
  User,
  CreateUserByAdminData,
  UpdateUserData,
  UpdatePasswordData,
  UserResponse
} from '@appTypes/user.types'
import { PaginationResult, PageOption } from '@appTypes/pagination.types'

/**
 * User API service
 * All endpoints match backend UserController
 */
export const userService = {
  /**
   * Create user by admin
   * POST /api/User/Create
   * Requires: ManageAdmins permission
   */
  createUserByAdmin: async (data: CreateUserByAdminData): Promise<ApiResponse<UserResponse>> => {
    return api.post('/api/User/Create', {
      FullName: data.fullName,
      Email: data.email,
      Password: data.password,
      PhoneNumber: data.phoneNumber,
      RoleIds: data.roleIds,
    })
  },

  /**
   * Get all users
   * GET /api/User/User-GetAll
   * Requires: ManageUsers or ManageUsersStudent permission
   */
  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    return api.get('/api/User/User-GetAll')
  },

  /**
   * Get user by ID
   * GET /api/User/{id}
   * Requires: ManageUsersStudent permission
   */
  getUserById: async (id: number): Promise<ApiResponse<User>> => {
    return api.get(`/api/User/${id}`)
  },

  /**
   * Get current logged-in user
   * GET /api/User/me
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return api.get('/api/User/me')
  },

  /**
   * Update user profile
   * PUT /api/User
   */
  updateUser: async (data: UpdateUserData): Promise<ApiResponse<UserResponse>> => {
    return api.put('/api/User', {
      FullName: data.fullName,
      Email: data.email,
      PhoneNumber: data.phoneNumber,
    })
  },

  /**
   * Delete user by ID
   * DELETE /api/User/{id}
   * Requires: ManageAdmins or ManageUsersStudent permission
   */
  deleteUser: async (id: number): Promise<ApiResponse<string>> => {
    return api.delete(`/api/User/${id}`)
  },

  /**
   * Get paginated users
   * POST /api/User/get-all-page
   * Requires: ManageAdmins or ManageUsersStudent permission
   */
  getUsersPage: async (pageOption: PageOption): Promise<ApiResponse<PaginationResult<User>>> => {
    return api.post('/api/User/get-all-page', {
      PageNumber: pageOption.pageNumber,
      PageSize: pageOption.pageSize,
    })
  },

  /**
   * Get user permissions by ID
   * GET /api/User/{id}-Get-ById-Permission-User
   * Requires: ManageAdmins permission
   */
  getUserPermissions: async (id: number): Promise<ApiResponse<string[]>> => {
    return api.get(`/api/User/${id}-Get-ById-Permission-User`)
  },

  /**
   * Update user password
   * PUT /api/User/{id}-Update-password
   */
  updatePassword: async (id: number, data: UpdatePasswordData): Promise<ApiResponse<UserResponse>> => {
    return api.put(`/api/User/${id}-Update-password`, {
      OldPassword: data.oldPassword,
      NewPassword: data.newPassword,
    })
  },

  /**
   * Verify OTP code
   * POST /api/User/verify-otp
   */
  verifyOTP: async (data: VerifyOTPData): Promise<ApiResponse<string>> => {
    return api.post('/api/User/verify-otp', {
      Email: data.email,
      Code: data.code,
    })
  },

  /**
   * Send OTP code to email
   * POST /api/User/Send-otp-code
   */
  sendOTP: async (data: SendOTPData): Promise<ApiResponse<boolean>> => {
    return api.post('/api/User/Send-otp-code', {
      Email: data.email,
    })
  },

  /**
   * Forgot password - reset with OTP
   * POST /api/User/Forget-Password
   */
  forgotPassword: async (data: ResetPasswordData): Promise<ApiResponse<string>> => {
    return api.post('/api/User/Forget-Password', {
      OtpCode: data.otpCode,
      Email: data.email,
      NewPassword: data.newPassword,
    })
  },

  /**
   * Update user role
   * PUT /api/User/{userId}-Update-Role-User
   */
  updateUserRole: async (userId: string, roleId: string): Promise<ApiResponse<any>> => {
    return api.put(`/api/User/${userId}-Update-Role-User`, {
      RoleId: roleId,
    })
  },
}

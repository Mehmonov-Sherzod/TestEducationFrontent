// User entity (matches backend UserResponseModel)
export interface User {
  id: number
  fullName: string
  email: string
  password?: string // Sometimes returned by backend
  phoneNumber: string
  roles?: string[]
  permissions?: string[]
}

// Create user request (matches backend CreateUserModel)
export interface CreateUserData {
  fullName: string
  email: string
  password: string
  phoneNumber: string
}

// Create user by admin (matches backend CreateUserByAdminModel)
export interface CreateUserByAdminData {
  fullName: string
  email: string
  password: string
  phoneNumber: string
  roleIds: number[]
}

// Update user request (matches backend UpdateUserModel)
export interface UpdateUserData {
  fullName: string
  email: string
  phoneNumber: string
}

// Update password request (matches backend UpdateUserPassword)
export interface UpdatePasswordData {
  oldPassword: string
  newPassword: string
}

// Base response model (matches backend BaseResponseModel)
export interface BaseResponse {
  id: number
}

// Generic user response (for Create/Update operations)
export interface UserResponse extends BaseResponse {}

// For backward compatibility
export interface UpdateUserProfile {
  fullName?: string
  phoneNumber?: string
}

export interface UpdatePassword {
  oldPassword: string
  newPassword: string
}

import { User } from './user.types'

// Login request
export interface LoginData {
  email: string
  password: string
  rememberMe?: boolean
}

// Login response from backend (uses PascalCase)
export interface LoginResult {
  Id?: number
  UserId?: number
  Username: string
  Email: string
  Token: string
  Roles: string[]
  Permissions: string[]
}

// Register request
export interface RegisterData {
  fullName: string
  email: string
  password: string
  confirmPassword?: string
  phoneNumber: string
}

// Register response (uses PascalCase)
export interface RegisterResult {
  Id: number
}

// OTP request
export interface SendOTPData {
  email: string
}

// Verify OTP request
export interface VerifyOTPData {
  email: string
  code: string
}

// Reset password request
export interface ResetPasswordData {
  otpCode: string
  email: string
  newPassword: string
}

// Auth state
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Form types for components
export type FormType = 'login' | 'register' | 'forgot-password'

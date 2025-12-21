import { z } from 'zod'
import { VALIDATION } from './constants'

// Login form schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Register form schema
export const registerSchema = z.object({
  fullName: z.string()
    .min(VALIDATION.NAME_MIN_LENGTH, `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`)
    .max(VALIDATION.NAME_MAX_LENGTH, `Name must not exceed ${VALIDATION.NAME_MAX_LENGTH} characters`),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  password: z.string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>

// Forgot password - email step
export const forgotPasswordEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export type ForgotPasswordEmailData = z.infer<typeof forgotPasswordEmailSchema>

// Forgot password - OTP step
export const otpSchema = z.object({
  code: z.string()
    .length(VALIDATION.OTP_LENGTH, `OTP must be ${VALIDATION.OTP_LENGTH} digits`)
    .regex(/^\d+$/, 'OTP must contain only numbers'),
})

export type OTPFormData = z.infer<typeof otpSchema>

// Forgot password - new password step
export const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// Password strength calculator
export const getPasswordStrength = (password: string): {
  score: number
  label: string
  color: string
} => {
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  const strengthLevels = [
    { label: 'Very Weak', color: '#e53e3e' },
    { label: 'Weak', color: '#ff5757' },
    { label: 'Fair', color: '#cc2828' },
    { label: 'Good', color: '#991e1e' },
    { label: 'Strong', color: '#721c1c' },
    { label: 'Very Strong', color: '#4d1111' },
  ]

  return {
    score: Math.min(score, 5),
    ...strengthLevels[score] || strengthLevels[0],
  }
}

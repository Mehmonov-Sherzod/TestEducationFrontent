// API Base URL - Use environment variable or default to localhost:5000
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/Auth/Login',
    REGISTER: '/api/Auth/Register',
  },
  USER: {
    ME: '/api/User/me',
    UPDATE: '/api/User',
    SEND_OTP: '/api/User/Send-otp-code',
    VERIFY_OTP: '/api/User/verify-otp',
    FORGOT_PASSWORD: '/api/User/Forget-Password',
    UPDATE_PASSWORD: '/api/User/{id}-Update-password',
  },
  AI: {
    GET_MEANING: '/api/Ai/get-meaning',
  },
} as const

// Animation timings (in seconds)
export const ANIMATION_DURATION = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
  FORM_MORPH: 0.4,
} as const

// Form validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  OTP_LENGTH: 6,
  OTP_EXPIRY_SECONDS: 60,
} as const

// Colors (for programmatic use)
export const COLORS = {
  CRIMSON: {
    600: '#991e1e',
    500: '#cc2828',
    400: '#e53e3e',
  },
  DARK: {
    900: '#121212',
    850: '#1a1a1a',
    800: '#242424',
  },
} as const

// App messages
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login successful! Redirecting...',
    REGISTER: 'Registration successful! Please login.',
    OTP_SENT: 'OTP sent to your email',
    OTP_VERIFIED: 'OTP code accepted',
    PASSWORD_RESET: 'Password reset successfully',
  },
  ERROR: {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_EXISTS: 'Email already registered',
    OTP_INVALID: 'Invalid OTP code',
    OTP_EXPIRED: 'OTP expired. Please request a new one.',
  },
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  AUTH: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  SUBJECTS: '/subjects',
  TOPICS: '/topics',
  QUESTIONS: '/questions',
  TESTS: '/tests',
  DTM_TEST: '/dtm-test',
  RESULTS: '/results',
  USERS: '/users',
  PROFILE: '/profile',
  LIBRARY: '/library',
  USER_BALANCES: '/user-balances',
  BALANCE_SETTINGS: '/balance-settings',
  CHANGE_PASSWORD: '/change-password',
  MY_BALANCE: '/my-balance',
  SETTINGS: '/settings',
  AI: '/ai',
} as const

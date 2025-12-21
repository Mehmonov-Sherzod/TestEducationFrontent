import { create } from 'zustand'
import { User } from '@appTypes/user.types'
import { LoginData, RegisterData } from '@appTypes/auth.types'
import { authService } from '@api/auth.service'
import { storage } from '@utils/storage'
import { handleApiError } from '@api/axios.config'
import toast from 'react-hot-toast'
import { MESSAGES } from '@utils/constants'

interface AuthState {
  // State
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  login: (data: LoginData) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  setUser: (user: User) => void
  setToken: (token: string, rememberMe?: boolean) => void
  initializeAuth: () => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  // Login action
  login: async (data: LoginData) => {
    set({ isLoading: true })
    try {
      const response = await authService.login(data)

      // Backend returns PascalCase: Succeeded, Result, Errors
      if (response.Succeeded && response.Result) {
        // Backend uses PascalCase for all properties
        const { Token, Username, Email, Roles, Permissions, UserId, Id } = response.Result

        console.log('=== Login Response ===')
        console.log('Full response.Result:', response.Result)
        console.log('UserId:', UserId)
        console.log('Id:', Id)

        // Try to get user ID from response (could be 'Id' or 'UserId')
        const userIdFromResponse = UserId || Id || 0

        if (!userIdFromResponse) {
          console.warn('⚠️ WARNING: Backend did not return user ID in login response!')
        }

        // Create user object
        const user: User = {
          id: userIdFromResponse,
          fullName: Username,
          email: Email,
          phoneNumber: '', // Not returned in login
          roles: Roles,
          permissions: Permissions,
        }

        console.log('Created user object:', user)

        // Store token and user
        storage.setToken(Token, data.rememberMe || false)
        storage.setUser(user)

        // Update store
        set({
          user,
          token: Token,
          isAuthenticated: true,
          isLoading: false,
        })

        toast.success(MESSAGES.SUCCESS.LOGIN)
        return true
      } else {
        const errorMessage = response.Errors?.join(', ') || MESSAGES.ERROR.INVALID_CREDENTIALS
        toast.error(errorMessage)
        set({ isLoading: false })
        return false
      }
    } catch (error) {
      const errorMessage = handleApiError(error)
      toast.error(errorMessage)
      set({ isLoading: false })
      return false
    }
  },

  // Register action
  register: async (data: RegisterData) => {
    set({ isLoading: true })
    try {
      const response = await authService.register(data)

      // Backend returns PascalCase: Succeeded, Result, Errors
      if (response.Succeeded) {
        toast.success(MESSAGES.SUCCESS.REGISTER)
        set({ isLoading: false })
        return true
      } else {
        const errorMessage = response.Errors?.join(', ') || MESSAGES.ERROR.GENERIC
        toast.error(errorMessage)
        set({ isLoading: false })
        return false
      }
    } catch (error) {
      const errorMessage = handleApiError(error)
      toast.error(errorMessage)
      set({ isLoading: false })
      return false
    }
  },

  // Logout action
  logout: () => {
    storage.clearAuth()
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
    toast.success('Logged out successfully')
  },

  // Set user
  setUser: (user: User) => {
    storage.setUser(user)
    set({ user, isAuthenticated: true })
  },

  // Set token
  setToken: (token: string, rememberMe = false) => {
    storage.setToken(token, rememberMe)
    set({ token, isAuthenticated: true })
  },

  // Initialize auth from storage
  initializeAuth: () => {
    const token = storage.getToken()
    const user = storage.getUser()

    if (token && user) {
      set({
        token,
        user,
        isAuthenticated: true,
      })
    }
  },

  // Clear auth
  clearAuth: () => {
    storage.clearAuth()
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  },
}))

// Initialize auth on app load
if (typeof window !== 'undefined') {
  useAuthStore.getState().initializeAuth()
}

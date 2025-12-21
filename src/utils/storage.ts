/**
 * LocalStorage wrapper with type safety and error handling
 */

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  REMEMBER_ME: 'remember_me',
  TOKEN_EXPIRY: 'token_expiry',
} as const

export const storage = {
  // Token management
  getToken: (): string | null => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
      const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY)

      if (expiry && Date.now() > parseInt(expiry)) {
        storage.clearAuth()
        return null
      }

      return token
    } catch (error) {
      console.error('Error getting token:', error)
      return null
    }
  },

  setToken: (token: string, rememberMe: boolean = false): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      const expiryDays = rememberMe ? 30 : 1
      const expiry = Date.now() + expiryDays * 24 * 60 * 60 * 1000
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiry.toString())
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, rememberMe.toString())
    } catch (error) {
      console.error('Error setting token:', error)
    }
  },

  // User management
  getUser: (): any | null => {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.USER)
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  },

  setUser: (user: any): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
    } catch (error) {
      console.error('Error setting user:', error)
    }
  },

  // Clear auth data
  clearAuth: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
      localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY)
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME)
    } catch (error) {
      console.error('Error clearing auth:', error)
    }
  },

  // Check if user chose to be remembered
  getRememberMe: (): boolean => {
    try {
      return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true'
    } catch (error) {
      return false
    }
  },
}

// JWT token validation helper
export const isTokenValid = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

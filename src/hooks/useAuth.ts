import { useAuthStore } from '@store/authStore'

/**
 * Hook to access auth store actions and state
 */
export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    setUser,
    setToken,
    clearAuth,
  } = useAuthStore()

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    setUser,
    setToken,
    clearAuth,
  }
}

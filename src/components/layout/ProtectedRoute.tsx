import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { ROUTES } from '@utils/constants'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Protected route wrapper - redirects to home if not authenticated
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH} replace />
  }

  return <>{children}</>
}

import { Navigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../services/firebase'
import { Box, Spinner } from '@chakra-ui/react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [user, loading] = useAuthState(auth)

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Spinner size="xl" />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // TODO: Add role-based access control using Firebase custom claims
  if (requiredRole) {
    // Implementation will check user.getIdTokenResult().claims.role
  }

  return <>{children}</>
}

export default ProtectedRoute
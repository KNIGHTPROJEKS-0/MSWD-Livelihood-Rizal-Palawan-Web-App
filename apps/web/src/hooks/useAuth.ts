import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { signOut } from 'firebase/auth'

export const useAuth = () => {
  const [user, loading, error] = useAuthState(auth)

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return {
    user,
    loading,
    error,
    logout,
    isAuthenticated: !!user
  }
}
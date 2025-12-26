import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children }) {
  const { loading, isAuthenticated } = useAuth()

  // While checking auth state, render nothing
  if (loading) return null

  // Not logged in → redirect to admin login
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />
  }

  // Logged in → allow access
  return children
}

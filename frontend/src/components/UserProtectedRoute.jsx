import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function UserProtectedRoute({ children }) {
  const { loading, isUser } = useAuth()

  // While checking auth state, show loading
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <p className="muted">Loading...</p>
      </div>
    )
  }

  // Not logged in as user → redirect to login
  if (!isUser()) {
    return <Navigate to="/login" replace />
  }

  // Logged in as user → allow access
  return children
}


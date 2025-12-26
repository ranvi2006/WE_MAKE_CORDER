import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    try {
      await login({ email, password })
      navigate('/admin/dashboard')
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Invalid email or password'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h2>Admin Login</h2>

        <p className="muted" style={{ marginTop: 8 }}>
          Sign in to access the admin dashboard.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <div className="form-row">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          <div className="form-row">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="form-actions">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

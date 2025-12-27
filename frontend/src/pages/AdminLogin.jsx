import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../pages/css/AdminLogin.css'

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
      <div
        className="card"
        style={{
          maxWidth: 900,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 32,
          alignItems: 'center',
        }}
      >
        {/* Left: Login Form */}
        <div>
          <h2>Admin Login</h2>

          <p className="muted" style={{ marginTop: 8, maxWidth: 360 }}>
            Sign in to securely access the admin dashboard and manage
            counseling requests, interviews, and courses.
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
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

        {/* Right: Image */}
        <img
          src="/images/admin-login.png"
          alt="Admin login security"
          style={{
            width: '100%',
            borderRadius: 16,
            objectFit: 'cover',
          }}
        />
      </div>
    </section>
  )
}

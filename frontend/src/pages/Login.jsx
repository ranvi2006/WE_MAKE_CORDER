import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone) {
  return /^\d{10}$/.test(phone.replace(/\D/g, ''))
}

export default function Login() {
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setErrors({})

    const nextErrors = {}

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!validateEmail(form.email)) {
      nextErrors.email = 'Please enter a valid email address'
    }

    if (!form.password) {
      nextErrors.password = 'Password is required'
    } else if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setLoading(true)
    try {
      await loginUser({ email: form.email, password: form.password })
      navigate('/')
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
      <div className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <h2>Login</h2>

        <p className="muted" style={{ marginTop: 8 }}>
          Sign in to access your account and book interview practice sessions.
        </p>

        {error && <div className="error-message" style={{ marginTop: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <div className="form-row">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && (
              <div className="field-error">{errors.email}</div>
            )}
          </div>

          <div className="form-row">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && (
              <div className="field-error">{errors.password}</div>
            )}
          </div>

          <div className="form-actions">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p className="muted">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--btn-bg)', fontWeight: 600 }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}


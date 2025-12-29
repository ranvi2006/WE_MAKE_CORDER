import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone) {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10
}

function validateOTP(otp) {
  return /^\d{6}$/.test(otp)
}

export default function Register() {
  const { registerUser, checkEmail, sendOtp, verifyOtp, resendOtp } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1: email check, 2: OTP verification, 3: complete registration
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    otp: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setError('')
    setSuccess('')
  }

  // Step 1: Check email and send OTP (FRONTEND ONLY - calls backend APIs)
  async function handleEmailCheck(e) {
    e.preventDefault()
    setError('')
    setErrors({})

    if (!form.email.trim()) {
      setErrors({ email: 'Email is required' })
      return
    }

    if (!validateEmail(form.email)) {
      setErrors({ email: 'Please enter a valid email address' })
      return
    }

    setLoading(true)
    try {
      // Check if email exists (FRONTEND calls backend)
      await checkEmail(form.email)
      
      // Email is available, send OTP (FRONTEND calls backend - backend generates and sends OTP)
      await sendOtp(form.email)
      setStep(2)
      setSuccess('OTP sent to your email. Please check your inbox.')
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Failed to verify email'
      )
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP (FRONTEND ONLY - calls backend API)
  async function handleVerifyOtp(e) {
    e.preventDefault()
    setError('')
    setErrors({})

    if (!form.otp.trim()) {
      setErrors({ otp: 'OTP is required' })
      return
    }

    if (!validateOTP(form.otp)) {
      setErrors({ otp: 'OTP must be 6 digits' })
      return
    }

    setLoading(true)
    try {
      // Verify OTP (FRONTEND calls backend - backend verifies OTP)
      await verifyOtp(form.email, form.otp)
      setEmailVerified(true)
      setStep(3)
      setSuccess('Email verified successfully! Please complete your registration.')
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Invalid or expired OTP'
      )
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Resend OTP (FRONTEND ONLY - calls backend API)
  async function handleResendOtp() {
    setError('')
    setLoading(true)
    try {
      // Resend OTP (FRONTEND calls backend - backend generates new OTP and sends email)
      await resendOtp(form.email)
      setSuccess('New OTP sent successfully. Please check your email.')
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Failed to resend OTP'
      )
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Complete registration (FRONTEND ONLY - calls backend API)
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setErrors({})

    const nextErrors = {}

    if (!form.name.trim()) {
      nextErrors.name = 'Name is required'
    }

    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone number is required'
    } else if (!validatePhone(form.phone)) {
      nextErrors.phone = 'Please enter a valid 10-digit phone number'
    }

    if (!form.password) {
      nextErrors.password = 'Password is required'
    } else if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters'
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password'
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    if (!emailVerified) {
      setError('Please verify your email with OTP first.')
      return
    }

    setLoading(true)
    try {
      // Register user (FRONTEND calls backend - backend creates account)
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/\D/g, ''),
        password: form.password
      })

      setSuccess('Thank you, your account has been created successfully!')
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <div className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <h2>Create Account</h2>

        <p className="muted" style={{ marginTop: 8 }}>
          Register to access interview practice, learning resources, and more.
        </p>

        {error && <div className="error-message" style={{ marginTop: 16 }}>{error}</div>}
        {success && <div className="success-message" style={{ marginTop: 16 }}>{success}</div>}

        {step === 1 && (
          <form onSubmit={handleEmailCheck} style={{ marginTop: 24 }}>
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

            <div className="form-actions">
              <button className="btn" type="submit" disabled={loading}>
                {loading ? 'Checking...' : 'Continue'}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={{ marginTop: 24 }}>
            <div className="form-row">
              <label>Enter OTP *</label>
              <input
                type="text"
                name="otp"
                value={form.otp}
                onChange={handleChange}
                placeholder="000000"
                maxLength="6"
                autoComplete="off"
              />
              {errors.otp && (
                <div className="field-error">{errors.otp}</div>
              )}
              <p className="muted" style={{ marginTop: 8, fontSize: '0.9rem' }}>
                OTP sent to {form.email}. OTP expires in 5 minutes.
              </p>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleResendOtp}
                disabled={loading}
                style={{ marginRight: 12 }}
              >
                Resend OTP
              </button>
              <button className="btn" type="submit" disabled={loading || !form.otp.trim()}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
            <div className="form-row">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                autoComplete="name"
              />
              {errors.name && (
                <div className="field-error">{errors.name}</div>
              )}
            </div>

            <div className="form-row" style={{ marginTop: 16 }}>
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                disabled
                style={{ background: '#f9fafb', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-row" style={{ marginTop: 16 }}>
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="1234567890"
                maxLength="10"
                autoComplete="tel"
              />
              {errors.phone && (
                <div className="field-error">{errors.phone}</div>
              )}
            </div>

            <div className="form-row" style={{ marginTop: 16 }}>
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.password && (
                <div className="field-error">{errors.password}</div>
              )}
            </div>

            <div className="form-row" style={{ marginTop: 16 }}>
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <div className="field-error">{errors.confirmPassword}</div>
              )}
            </div>

            <div className="form-actions">
              <button className="btn" type="submit" disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p className="muted">
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--btn-bg)', fontWeight: 600 }}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

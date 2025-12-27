import { useState } from 'react'
import client from '../api/client'
import '../pages/css/Counseling.css'

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email)
}

export default function Counseling() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    goal: '',
    message: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [serverError, setServerError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSuccess('')
    setServerError('')

    const nextErrors = {}

    if (!form.name.trim()) nextErrors.name = 'Name is required'
    if (!form.email.trim() || !validateEmail(form.email))
      nextErrors.email = 'Valid email is required'
    if (!form.goal.trim()) nextErrors.goal = 'Please select a goal'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setLoading(true)
    try {
      await client.post('/api/counseling-requests', form)
      setSuccess('Your counseling request has been submitted successfully.')
      setForm({ name: '', email: '', goal: '', message: '' })
    } catch (err) {
      setServerError(
        err?.response?.data?.message ||
          err.message ||
          'Failed to submit request'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      {/* Header */}
      <div
        className="card"
        style={{
          marginBottom: 32,
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: 32,
          alignItems: 'center',
          maxWidth: 1100,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <div>
          <h2>Book Counseling</h2>
          <p className="muted" style={{ marginTop: 10, maxWidth: 520 }}>
            Get one-on-one guidance from experienced mentors to clarify
            your goals, prepare for interviews, and plan your career path
            with confidence.
          </p>
        </div>

        <img
          src="/images/counseling-hero.png"
          alt="Career counseling"
          style={{
            width: '100%',
            borderRadius: 16,
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Form */}
      <div
        className="card"
        style={{
          maxWidth: 720,
          margin: '0 auto',
        }}
      >
        {success && <div className="success-message">{success}</div>}
        {serverError && <div className="error-message">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <label>Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
            />
            {errors.name && (
              <div className="field-error">{errors.name}</div>
            )}
          </div>

          <div className="form-row">
            <label>Email *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            {errors.email && (
              <div className="field-error">{errors.email}</div>
            )}
          </div>

          <div className="form-row">
            <label>Goal *</label>
            <select
              name="goal"
              value={form.goal}
              onChange={handleChange}
            >
              <option value="">Select a goal</option>
              <option value="Career guidance">Career guidance</option>
              <option value="Interview preparation">
                Interview preparation
              </option>
              <option value="Skill development">Skill development</option>
            </select>
            {errors.goal && (
              <div className="field-error">{errors.goal}</div>
            )}
          </div>

          <div className="form-row">
            <label>Message</label>
            <textarea
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              placeholder="Optional details"
            />
          </div>

          <div className="form-actions">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

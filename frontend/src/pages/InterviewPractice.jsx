import { useState } from 'react'
import client from '../api/client'
import '../pages/css/InterviewPractice.css'

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email)
}

export default function InterviewPractice() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    experience: '',
    availability: ''
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
    if (!form.role.trim()) nextErrors.role = 'Role is required'
    if (!form.experience.trim())
      nextErrors.experience = 'Experience is required'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setLoading(true)
    try {
      await client.post('/api/interview-practice-requests', form)
      setSuccess('Your interview practice request has been submitted successfully.')
      setForm({
        name: '',
        email: '',
        role: '',
        experience: '',
        availability: ''
      })
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
    <section className="interview-page">
      {/* Hero */}
      <div className="interview-hero card">
        <div className="interview-hero-text">
          <h2>Interview Practice</h2>
          <p>
            Practice real interview scenarios with experienced mentors and receive
            actionable feedback to improve your confidence, communication, and
            technical clarity.
          </p>
        </div>

        <div className="interview-hero-image">
          <img src="/images/interview-hero.png" alt="Mock interview practice" />
        </div>
      </div>

      {/* Form */}
      <div className="card interview-form">
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
            {errors.name && <div className="field-error">{errors.name}</div>}
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
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>

          <div className="form-row">
            <label>Role Applying For *</label>
            <input
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder="Frontend Developer"
            />
            {errors.role && <div className="field-error">{errors.role}</div>}
          </div>

          <div className="form-row">
            <label>Experience *</label>
            <select
              name="experience"
              value={form.experience}
              onChange={handleChange}
            >
              <option value="">Select experience</option>
              <option value="Fresher">Fresher</option>
              <option value="1-3 years">1–3 years</option>
              <option value="3-5 years">3–5 years</option>
              <option value="5+ years">5+ years</option>
            </select>
            {errors.experience && (
              <div className="field-error">{errors.experience}</div>
            )}
          </div>

          <div className="form-row">
            <label>Availability</label>
            <textarea
              name="availability"
              rows={3}
              value={form.availability}
              onChange={handleChange}
              placeholder="e.g. Weekdays after 6 PM"
            />
          </div>

          <div className="form-actions">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Submitting…' : 'Request Interview'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

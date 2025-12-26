import { useState } from 'react'
import client from '../api/client'

function validateEmail(email){
  return /\S+@\S+\.\S+/.test(email)
}

export default function Counseling(){
  const [form, setForm] = useState({ name:'', email:'', goal:'', message:'' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [serverError, setServerError] = useState('')

  function handleChange(e){
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(e => ({ ...e, [name]: '' }))
  }

  async function handleSubmit(e){
    e.preventDefault()
    setServerError('')
    setSuccess('')

    const next = {}
    if(!form.name.trim()) next.name = 'Name is required'
    if(!form.email.trim() || !validateEmail(form.email)) next.email = 'Valid email is required'
    if(!form.goal.trim()) next.goal = 'Please select a goal'

    setErrors(next)
    if(Object.keys(next).length) return

    setSubmitting(true)
    try{
      await client.post('/api/counseling-requests', {
        name: form.name,
        email: form.email,
        goal: form.goal,
        message: form.message
      })
      setSuccess('Your counseling request has been submitted and is pending review.')
      setForm({ name:'', email:'', goal:'', message:'' })
    }catch(err){
      setServerError(err?.response?.data?.message || err.message || 'Failed to submit request')
    }finally{
      setSubmitting(false)
    }
  }

  return (
    <section>
      <div style={{maxWidth:720,margin:'0 auto'}} className="card">
        <h2>Book Counseling</h2>
        <p className="muted">Tell us a bit about your goals and we'll match you with a counselor.</p>

        {success && <div className="success-message" role="status">{success}</div>}
        {serverError && <div className="error-message" role="alert">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <label>Name *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>

          <div className="form-row">
            <label>Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>

          <div className="form-row">
            <label>Goal *</label>
            <select name="goal" value={form.goal} onChange={handleChange}>
              <option value="">Choose a goal</option>
              <option value="career">Career guidance</option>
              <option value="interview">Interview preparation</option>
              <option value="skill">Skill development</option>
            </select>
            {errors.goal && <div className="field-error">{errors.goal}</div>}
          </div>

          <div className="form-row">
            <label>Message</label>
            <textarea name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Share background or specific questions (optional)" />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Request'}</button>
          </div>
        </form>
      </div>
    </section>
  )
}

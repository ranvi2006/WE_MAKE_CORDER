import { useState } from 'react'
import client from '../api/client'

function validateEmail(email){
  return /\S+@\S+\.\S+/.test(email)
}

export default function InterviewPractice(){
  const [form, setForm] = useState({ name:'', email:'', role:'', level:'', availability:'' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [serverError, setServerError] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeError, setResumeError] = useState('')

  function handleChange(e){
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function handleFileChange(e){
    setResumeError('')
    const f = e.target.files && e.target.files[0]
    if(!f){ setResumeFile(null); return }
    if(f.type !== 'application/pdf'){
      setResumeFile(null)
      setResumeError('Only PDF resumes are accepted')
      return
    }
    const max = 5 * 1024 * 1024 // 5MB
    if(f.size > max){
      setResumeFile(null)
      setResumeError('Resume must be 5MB or smaller')
      return
    }
    setResumeFile(f)
  }

  async function handleSubmit(e){
    e.preventDefault()
    setServerError('')
    setSuccess('')

    const next = {}
    if(!form.name.trim()) next.name = 'Name is required'
    if(!form.email.trim() || !validateEmail(form.email)) next.email = 'Valid email is required'
    if(!form.role.trim()) next.role = 'Role is required'
    if(!form.level) next.level = 'Select experience level'

    setErrors(next)
    if(Object.keys(next).length) return

    setSubmitting(true)
    try{
      if(resumeFile){
        const fd = new FormData()
        fd.append('name', form.name)
        fd.append('email', form.email)
        fd.append('role', form.role)
        fd.append('level', form.level)
        fd.append('availability', form.availability)
        fd.append('resume', resumeFile)

        await client.post('/api/interview-practice-requests', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await client.post('/api/interview-practice-requests', form)
      }

      setSuccess('Your interview practice request has been submitted. We will contact you to schedule.')
      setForm({ name:'', email:'', role:'', level:'', availability:'' })
      setResumeFile(null)
      setResumeError('')
      // reset file input value if needed (DOM)
      const fileInput = document.querySelector('input[name="resume"]')
      if(fileInput) fileInput.value = ''
    }catch(err){
      setServerError(err?.response?.data?.message || err.message || 'Failed to submit request')
    }finally{
      setSubmitting(false)
    }
  }

  return (
    <section>
      <div style={{maxWidth:720,margin:'0 auto'}} className="card">
        <h2>Interview Practice</h2>
        <p className="muted">Book a mock interview session and receive actionable feedback.</p>

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
            <label>Role applying for *</label>
            <input name="role" value={form.role} onChange={handleChange} placeholder="e.g. Frontend Engineer" />
            {errors.role && <div className="field-error">{errors.role}</div>}
          </div>

          <div className="form-row">
            <label>Experience level *</label>
            <select name="level" value={form.level} onChange={handleChange}>
              <option value="">Select level</option>
              <option value="Fresher">Fresher</option>
              <option value="1-3 years">1–3 years</option>
              <option value="3-5 years">3–5 years</option>
              <option value="5+ years">5+ years</option>
            </select>
            {errors.level && <div className="field-error">{errors.level}</div>}
          </div>

          <div className="form-row">
            <label>Availability (dates/times)</label>
            <textarea name="availability" value={form.availability} onChange={handleChange} rows={3} placeholder="e.g. Weekdays after 6pm" />
          </div>

          <div className="form-row">
            <label>Resume (PDF, optional)</label>
            <input name="resume" type="file" accept="application/pdf" onChange={handleFileChange} />
            {resumeFile && <div className="muted" style={{marginTop:8}}>{resumeFile.name}</div>}
            {resumeError && <div className="field-error">{resumeError}</div>}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn" disabled={submitting}>{submitting ? 'Submitting…' : 'Request Practice'}</button>
          </div>
        </form>
      </div>
    </section>
  )
}


import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuth()

  async function handleSubmit(e){
    e.preventDefault()
    setError('')
    if(!email || !password){
      setError('Email and password are required')
      return
    }
    setLoading(true)
    try{
      const { token, admin } = await authService.loginAdmin(email, password)
      if(token){
        // update context
        setAuth(token, admin)
        navigate('/admin/dashboard')
      }else{
        setError('Invalid response from server')
      }
    }catch(err){
      setError(err?.response?.data?.message || err.message || 'Login failed')
    }finally{
      setLoading(false)
    }
  }

  return (
    <section>
      <div className="card" style={{maxWidth:520,margin:'0 auto'}}>
        <h2>Admin Login</h2>
        <p className="muted">Sign in to access the admin dashboard.</p>

        {error && <div className="error-message" style={{marginTop:12}}>{error}</div>}

        <form onSubmit={handleSubmit} style={{marginTop:14}}>
          <div className="form-row">
            <label>Email</label>
            <input name="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>

          <div className="form-row">
            <label>Password</label>
            <input name="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>

          <div className="form-actions">
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
          </div>
        </form>
      </div>
    </section>
  )
}

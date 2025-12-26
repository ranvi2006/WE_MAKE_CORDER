import { useState } from 'react'
import client from '../api/client'

export default function MyMeetings(){
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [requests, setRequests] = useState([])

  async function handleSubmit(e){
    e.preventDefault()
    setError('')
    setRequests([])
    if(!email || !/\S+@\S+\.\S+/.test(email)){
      setError('Please enter a valid email')
      return
    }
    setLoading(true)
    try{
      const res = await client.get(`/api/my-requests`, { params: { email } })
      const data = Array.isArray(res.data) ? res.data : (res.data?.requests || [])
      setRequests(data)
    }catch(err){
      setError(err?.response?.data?.message || err.message || 'Failed to load requests')
    }finally{
      setLoading(false)
    }
  }

  return (
    <section>
      <div className="card">
        <h2>My Meetings</h2>
        <p className="muted">Enter your email to view counseling and interview requests.</p>

        <form onSubmit={handleSubmit} style={{display:'flex',gap:12,marginTop:12,flexWrap:'wrap'}}>
          <input name="email" type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} style={{flex:'1 1 320px'}} />
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Searching…' : 'Find'}</button>
        </form>

        {error && <div className="error-message" style={{marginTop:12}}>{error}</div>}

        {!loading && requests.length === 0 && !error && (
          <p className="muted" style={{marginTop:12}}>No requests found. Try a different email.</p>
        )}

        {loading && <p className="muted" style={{marginTop:12}}>Loading…</p>}

        {requests.length > 0 && (
          <div style={{marginTop:16}}>
            <div className="requests-table">
              <div className="table-head">
                <div>Type</div>
                <div>Status</div>
                <div>Meeting</div>
                <div></div>
              </div>
              {requests.map((r)=> (
                <div key={r.id || r._id || r.createdAt} className="table-row">
                  <div>{r.type || (r.requestType==='interview'?'Interview':'Counseling')}</div>
                  <div>{r.status || 'Pending'}</div>
                  <div>{r.meetingDate ? new Date(r.meetingDate).toLocaleString() : (r.scheduledAt ? new Date(r.scheduledAt).toLocaleString() : '—')}</div>
                  <div>
                    {r.meetingLink ? (
                      <a className="btn" href={r.meetingLink} target="_blank" rel="noopener noreferrer">Join Meeting</a>
                    ) : (
                      <span className="muted">No link</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile cards */}
            <div className="requests-cards">
              {requests.map((r)=> (
                <div key={r.id || r._id || r.createdAt} className="request-card">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <strong>{r.type || (r.requestType==='interview'?'Interview':'Counseling')}</strong>
                    <span className="muted">{r.status || 'Pending'}</span>
                  </div>
                  <div style={{marginTop:8}}>{r.meetingDate ? new Date(r.meetingDate).toLocaleString() : (r.scheduledAt ? new Date(r.scheduledAt).toLocaleString() : 'Meeting time not set')}</div>
                  <div style={{marginTop:10}}>
                    {r.meetingLink ? (
                      <a className="btn" href={r.meetingLink} target="_blank" rel="noopener noreferrer">Join Meeting</a>
                    ) : (
                      <span className="muted">No meeting link yet</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

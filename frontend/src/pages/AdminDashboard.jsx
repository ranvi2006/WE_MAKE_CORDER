import { useEffect, useState } from 'react'
import client from '../api/client'

export default function AdminDashboard(){
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    client.get('/api/admin/stats')
      .then(res => {
        if(!mounted) return
        setStats(res.data || {})
      })
      .catch(err => {
        if(!mounted) return
        setError(err?.response?.data?.message || err.message || 'Failed to load stats')
      })
      .finally(()=> mounted && setLoading(false))

    return ()=>{ mounted = false }
  }, [])

  const cards = [
    { key: 'totalCounseling', label: 'Total Counseling Requests', value: stats?.totalCounseling ?? stats?.counselingTotal ?? stats?.counseling ?? 0 },
    { key: 'totalInterview', label: 'Total Interview Requests', value: stats?.totalInterview ?? stats?.interviewTotal ?? stats?.interview ?? 0 },
    { key: 'todaysRequests', label: "Today's Requests", value: stats?.todaysRequests ?? stats?.today ?? 0 },
    { key: 'scheduledMeetings', label: 'Scheduled Meetings', value: stats?.scheduledMeetings ?? stats?.scheduled ?? 0 }
  ]

  return (
    <section>
      <div className="card">
        <h2>Admin Dashboard</h2>
        <p className="muted">Overview of platform activity.</p>

        {loading && <p className="muted" style={{marginTop:12}}>Loading stats…</p>}
        {error && <div className="error-message" style={{marginTop:12}}>{error}</div>}

        {!loading && !error && (
          <div className="stats-grid" style={{marginTop:16}}>
            {cards.map(c => (
              <div key={c.key} className="stat-card card">
                <div style={{fontSize:12,color:'var(--text-secondary)'}}>{c.label}</div>
                <div style={{fontSize:28,fontWeight:700,marginTop:8,color:'var(--text-primary)'}}>{c.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

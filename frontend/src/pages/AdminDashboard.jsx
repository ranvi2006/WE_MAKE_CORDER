import { useEffect, useState } from 'react'
import client from '../api/client'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)

    client
      .get('/api/admin/stats')
      .then((res) => {
        if (!mounted) return
        setStats(res.data || {})
      })
      .catch((err) => {
        if (!mounted) return
        setError(
          err?.response?.data?.message ||
            err.message ||
            'Failed to load dashboard stats'
        )
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  const cards = [
    {
      key: 'counseling',
      label: 'Counseling Requests',
      value: stats?.totalCounseling ?? 0
    },
    {
      key: 'interview',
      label: 'Interview Practice Requests',
      value: stats?.totalInterview ?? 0
    },
    {
      key: 'today',
      label: "Today's Requests",
      value: stats?.todaysRequests ?? 0
    },
    {
      key: 'scheduled',
      label: 'Scheduled Meetings',
      value: stats?.scheduledMeetings ?? 0
    }
  ]

  return (
    <section>
      <div className="card">
        <h2>Admin Dashboard</h2>

        <p className="muted" style={{ marginTop: 8 }}>
          Overview of platform activity and requests.
        </p>

        {loading && <p className="muted">Loading dashboard…</p>}

        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <div className="stats-grid" style={{ marginTop: 16 }}>
            {cards.map((c) => (
              <div key={c.key} className="stat-card">
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)'
                  }}
                >
                  {c.label}
                </div>

                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    marginTop: 8
                  }}
                >
                  {c.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

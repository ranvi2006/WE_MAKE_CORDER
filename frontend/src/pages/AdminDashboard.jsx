import { useEffect, useState } from 'react'
import client from '../api/client'
import '../pages/css/AdminDashboard.css'

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
      {/* Header + Background */}
      <div
        className="card"
        style={{
          backgroundImage:
            'linear-gradient(rgba(27,53,96,0.85), rgba(27,53,96,0.85)), url(/images/admin-dashboard-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#fff',
        }}
      >
        <h2>Admin Dashboard</h2>

        <p style={{ marginTop: 8, opacity: 0.9 }}>
          Overview of platform activity and incoming requests.
        </p>

        {loading && <p style={{ opacity: 0.8 }}>Loading dashboard…</p>}

        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <div className="stats-grid" style={{ marginTop: 20 }}>
            {cards.map((c) => (
              <div key={c.key} className="stat-card premium-stat">
                <div style={{ fontSize: 13, opacity: 0.85 }}>
                  {c.label}
                </div>

                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    marginTop: 6
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

import { useState } from 'react'
import client from '../api/client'

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email)
}

export default function MyMeetings() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState({
    counselingRequests: [],
    interviewPracticeRequests: []
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setData({ counselingRequests: [], interviewPracticeRequests: [] })

    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const res = await client.get('/api/my-requests', {
        params: { email }
      })
      setData({
        counselingRequests: res.data?.counselingRequests || [],
        interviewPracticeRequests: res.data?.interviewPracticeRequests || []
      })
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Failed to fetch requests'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <div className="card">
        <h2>My Meetings</h2>
        <p className="muted" style={{ marginTop: 8 }}>
          Enter your email to view your counseling and interview practice
          requests.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 12,
            flexWrap: 'wrap'
          }}
        >
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ flex: '1 1 300px' }}
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Searching…' : 'Find'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
        {loading && <p className="muted">Loading…</p>}

        {/* Counseling Requests */}
        {data.counselingRequests.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h3>Counseling Requests</h3>
            {data.counselingRequests.map((req) => (
              <div key={req._id} className="card" style={{ marginTop: 12 }}>
                <div>
                  <strong>Goal:</strong> {req.goal}
                </div>
                <div>
                  <strong>Status:</strong> {req.status}
                </div>
                <div className="muted">
                  Requested on:{' '}
                  {new Date(req.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Interview Practice Requests */}
        {data.interviewPracticeRequests.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h3>Interview Practice Requests</h3>
            {data.interviewPracticeRequests.map((req) => (
              <div key={req._id} className="card" style={{ marginTop: 12 }}>
                <div>
                  <strong>Role:</strong> {req.role}
                </div>
                <div>
                  <strong>Status:</strong> {req.status}
                </div>
                <div>
                  <strong>Meeting Time:</strong>{' '}
                  {req.meetingTime
                    ? new Date(req.meetingTime).toLocaleString()
                    : 'Not scheduled'}
                </div>
                {req.meetingLink && (
                  <div style={{ marginTop: 8 }}>
                    <a
                      className="btn"
                      href={req.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Meeting
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading &&
          !error &&
          data.counselingRequests.length === 0 &&
          data.interviewPracticeRequests.length === 0 && (
            <p className="muted" style={{ marginTop: 16 }}>
              No requests found for this email.
            </p>
          )}
      </div>
    </section>
  )
}

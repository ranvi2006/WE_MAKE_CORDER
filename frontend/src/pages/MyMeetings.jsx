import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import client from '../api/client'
import '../pages/css/MyMeeting.css'

export default function MyMeetings() {
  const { user, isUser } = useAuth()
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isUser()) return

    async function fetchMeetings() {
      try {
        setLoading(true)
        const res = await client.get('/api/users/my-meetings')
        setMeetings(res.data || [])
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            'Failed to fetch meetings'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchMeetings()
  }, [isUser])

  if (!isUser()) {
    return <Navigate to="/login" replace />
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
          <h2>My Meetings</h2>
          <p className="muted" style={{ marginTop: 10, maxWidth: 520 }}>
            Track your interview practice bookings, view their status, and join
            scheduled meetings — all in one place.
          </p>
        </div>

        <img
          src="/images/my-meetings-hero.png"
          alt="My meetings dashboard"
          style={{
            width: '100%',
            borderRadius: 16,
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Meetings List */}
      <div className="card" style={{ maxWidth: 900, margin: '0 auto' }}>
        <h3>Interview Practice Bookings</h3>

        {loading && <p className="muted" style={{ marginTop: 16 }}>Loading...</p>}

        {error && (
          <div className="error-message" style={{ marginTop: 16 }}>
            {error}
          </div>
        )}

        {!loading && !error && meetings.length === 0 && (
          <p className="muted" style={{ marginTop: 16 }}>
            You don't have any scheduled meetings yet.
          </p>
        )}

        {!loading && !error && meetings.length > 0 && (
          <div style={{ marginTop: 24 }}>
            {meetings.map((meeting) => (
              <div
                key={meeting._id}
                className="course-card"
                style={{
                  marginTop: 16,
                  padding: 20,
                  border: '1px solid #e5e7eb',
                }}
              >
                <h3 style={{ marginBottom: 16 }}>{meeting.interviewTitle}</h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 16,
                    marginTop: 16,
                  }}
                >
                  <div>
                    <strong>Mentor:</strong>{' '}
                    <span className="muted">
                      {meeting.mentorName || 'To be assigned'}
                    </span>
                  </div>

                  <div>
                    <strong>Date:</strong>{' '}
                    <span className="muted">
                      {meeting.date
                        ? new Date(meeting.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Not scheduled'}
                    </span>
                  </div>

                  <div>
                    <strong>Time:</strong>{' '}
                    <span className="muted">
                      {meeting.time || 'Not scheduled'}
                    </span>
                  </div>

                  <div>
                    <strong>Mode:</strong>{' '}
                    <span className="muted">{meeting.mode}</span>
                  </div>

                  <div>
                    <strong>Status:</strong>{' '}
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        background:
                          meeting.status === 'Completed'
                            ? '#d1fae5'
                            : meeting.status === 'Scheduled'
                            ? '#dbeafe'
                            : '#fef3c7',
                        color:
                          meeting.status === 'Completed'
                            ? '#065f46'
                            : meeting.status === 'Scheduled'
                            ? '#1e40af'
                            : '#92400e',
                      }}
                    >
                      {meeting.status}
                    </span>
                  </div>

                  <div>
                    <strong>Booking ID:</strong>{' '}
                    <span className="muted" style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {meeting.bookingId}
                    </span>
                  </div>
                </div>

                {meeting.meetingLink && (
                  <div style={{ marginTop: 20 }}>
                    <a
                      href={meeting.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                    >
                      Join Meeting
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

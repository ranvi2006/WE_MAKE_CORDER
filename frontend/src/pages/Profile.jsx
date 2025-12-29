import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import client from '../api/client'

export default function Profile() {
  const { user, isUser } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [interviewHistory, setInterviewHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isUser()) return

    async function fetchProfileData() {
      try {
        setLoading(true)
        const [profileRes, coursesRes, interviewRes] = await Promise.all([
          client.get('/api/users/profile'),
          client.get('/api/users/enrolled-courses'),
          client.get('/api/users/interview-practice')
        ])

        setProfileData(profileRes.data)
        setEnrolledCourses(coursesRes.data || [])
        setInterviewHistory(interviewRes.data || [])
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            'Failed to load profile data'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [isUser])

  if (!isUser()) {
    return <Navigate to="/login" replace />
  }

  if (loading) {
    return (
      <section>
        <div className="card" style={{ maxWidth: 900, margin: '0 auto' }}>
          <p className="muted">Loading profile...</p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {error && (
          <div className="error-message" style={{ marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* Profile Information */}
        <div className="card" style={{ marginBottom: 32 }}>
          <h2>Profile Information</h2>

          <div style={{ marginTop: 24 }}>
            <div className="form-row">
              <label>Name</label>
              <input
                type="text"
                value={profileData?.name || user?.name || ''}
                disabled
                style={{ background: '#f9fafb', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-row" style={{ marginTop: 16 }}>
              <label>Email</label>
              <input
                type="email"
                value={profileData?.email || user?.email || ''}
                disabled
                style={{ background: '#f9fafb', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-row" style={{ marginTop: 16 }}>
              <label>Phone Number</label>
              <input
                type="tel"
                value={profileData?.phone || user?.phone || ''}
                disabled
                style={{ background: '#f9fafb', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-row" style={{ marginTop: 16 }}>
              <label>Account Created</label>
              <input
                type="text"
                value={
                  profileData?.createdAt
                    ? new Date(profileData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'
                }
                disabled
                style={{ background: '#f9fafb', cursor: 'not-allowed' }}
              />
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="card" style={{ marginBottom: 32 }}>
          <h2>Enrolled Courses</h2>
          {enrolledCourses.length > 0 ? (
            <div style={{ marginTop: 24 }}>
              {enrolledCourses.map((course) => (
                <div
                  key={course._id}
                  className="course-card"
                  style={{ marginTop: 16 }}
                >
                  <h3>{course.title}</h3>
                  <p className="muted" style={{ marginTop: 8 }}>
                    {course.description}
                  </p>
                  <div
                    className="course-meta"
                    style={{
                      display: 'flex',
                      gap: 16,
                      marginTop: 12,
                      flexWrap: 'wrap'
                    }}
                  >
                    <span>
                      <strong>Level:</strong> {course.level}
                    </span>
                    <span>
                      <strong>Duration:</strong> {course.duration || 'N/A'}
                    </span>
                    <span>
                      <strong>Status:</strong> {course.status || 'Active'}
                    </span>
                    <span>
                      <strong>Enrolled:</strong>{' '}
                      {course.enrolledAt
                        ? new Date(course.enrolledAt).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 16 }}>
              You haven't enrolled in any courses yet.
            </p>
          )}
        </div>

        {/* Interview Practice History */}
        <div className="card">
          <h2>Interview Practice History</h2>
          {interviewHistory.length > 0 ? (
            <div style={{ marginTop: 24 }}>
              {interviewHistory.map((interview) => (
                <div
                  key={interview._id}
                  className="course-card"
                  style={{ marginTop: 16 }}
                >
                  <h3>{interview.title}</h3>
                  <div
                    style={{
                      display: 'flex',
                      gap: 16,
                      marginTop: 12,
                      flexWrap: 'wrap'
                    }}
                  >
                    <span>
                      <strong>Role:</strong> {interview.role}
                    </span>
                    <span>
                      <strong>Status:</strong> {interview.status}
                    </span>
                    <span>
                      <strong>Date & Time:</strong>{' '}
                      {interview.date
                        ? new Date(interview.date).toLocaleString()
                        : 'Not scheduled'}
                    </span>
                    {interview.experience && (
                      <span>
                        <strong>Experience:</strong> {interview.experience}
                      </span>
                    )}
                  </div>
                  {interview.meetingLink && (
                    <div style={{ marginTop: 12 }}>
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn"
                      >
                        Join Meeting
                      </a>
                    </div>
                  )}
                  <p className="muted" style={{ marginTop: 8, fontSize: '0.9rem' }}>
                    Requested on:{' '}
                    {new Date(interview.requestedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 16 }}>
              You haven't booked any interview practice sessions yet.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

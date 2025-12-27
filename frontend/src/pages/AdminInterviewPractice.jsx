import { useEffect, useState } from 'react'
import client from '../api/client'
import '../pages/css/AdminInterviewPractice.css'

export default function AdminInterviewPractice() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState({})
  const [updatingIds, setUpdatingIds] = useState(new Set())

  useEffect(() => {
    let mounted = true
    setLoading(true)

    client
      .get('/api/admin/interview-practice')
      .then((res) => {
        if (!mounted) return
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.requests || []
        setRequests(data)
      })
      .catch((err) => {
        if (!mounted) return
        setError(
          err?.response?.data?.message ||
            err.message ||
            'Failed to load interview practice requests'
        )
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  function startEdit(item) {
    const meetingDate = item.meetingTime
      ? new Date(item.meetingTime).toISOString().slice(0, 10)
      : ''
    const meetingClock = item.meetingTime
      ? new Date(item.meetingTime).toISOString().slice(11, 16)
      : ''

    setEditing((prev) => ({
      ...prev,
      [item._id]: {
        status: item.status || 'Pending',
        meetingDate,
        meetingClock,
        meetingLink: item.meetingLink || '',
        dirty: false
      }
    }))
  }

  function changeEdit(id, field, value) {
    setEditing((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
        dirty: true
      }
    }))
  }

  async function saveEdit(id) {
    const ed = editing[id]
    if (!ed) return

    let meetingTime = null
    if (ed.meetingDate) {
      const time = ed.meetingClock || '00:00'
      meetingTime = new Date(`${ed.meetingDate}T${time}:00`).toISOString()
    }

    setUpdatingIds((prev) => new Set(prev).add(id))
    try {
      const res = await client.put(`/api/admin/interview-practice/${id}`, {
        status: ed.status,
        meetingTime,
        meetingLink: ed.meetingLink
      })

      const updated = res.data || {}

      setRequests((prev) =>
        prev.map((r) =>
          r._id === id
            ? {
                ...r,
                status: updated.status ?? ed.status,
                meetingTime: updated.meetingTime ?? meetingTime,
                meetingLink: updated.meetingLink ?? ed.meetingLink
              }
            : r
        )
      )

      setEditing((prev) => ({
        ...prev,
        [id]: { ...prev[id], dirty: false }
      }))
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Failed to update interview request'
      )
    } finally {
      setUpdatingIds((prev) => {
        const copy = new Set(prev)
        copy.delete(id)
        return copy
      })
    }
  }

  function cancelEdit(id) {
    setEditing((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }

  const statusOptions = [
    'Pending',
    'Reviewed',
    'Scheduled',
    'Completed',
    'Closed'
  ]

  return (
    <section>
      {/* Header */}
      <div
        className="card"
        style={{
          marginBottom: 24,
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: 24,
          alignItems: 'center',
          backgroundImage:
            'linear-gradient(rgba(27,53,96,0.9), rgba(27,53,96,0.9)), url(/images/admin-interview-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#fff'
        }}
      >
        
        <div>
          <h2>Interview Practice Requests</h2>
          <p style={{ marginTop: 8, opacity: 0.9 }}>
            Schedule mock interviews, assign meeting links, and track
            interview practice progress.
          </p>
        </div>

        <img
          src="/images/admin-interview-header.png"
          alt="Interview scheduling"
          style={{
            width: '100%',
            borderRadius: 14,
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Table */}
      <div className="card">
        {loading && <p className="muted">Loading requests…</p>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <div className="admin-table">
            <div className="admin-row admin-head">
              <div>Name</div>
              <div>Email</div>
              <div>Role</div>
              <div>Experience</div>
              <div>Status</div>
              <div>Meeting</div>
              <div></div>
            </div>

            {requests.map((item) => {
              const ed = editing[item._id]
              const isUpdating = updatingIds.has(item._id)

              return (
                <div
                  key={item._id}
                  className="admin-row"
                  style={{ alignItems: 'start' }}
                >
                  <div>{item.name}</div>
                  <div>{item.email}</div>
                  <div>{item.role}</div>
                  <div>{item.experience}</div>

                  <div>
                    {ed ? (
                      <select
                        value={ed.status}
                        onChange={(e) =>
                          changeEdit(item._id, 'status', e.target.value)
                        }
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <strong>{item.status}</strong>
                    )}
                  </div>

                  <div>
                    {ed ? (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <input
                          type="date"
                          value={ed.meetingDate}
                          onChange={(e) =>
                            changeEdit(item._id, 'meetingDate', e.target.value)
                          }
                        />
                        <input
                          type="time"
                          value={ed.meetingClock}
                          onChange={(e) =>
                            changeEdit(item._id, 'meetingClock', e.target.value)
                          }
                        />
                        <input
                          placeholder="Meeting link"
                          value={ed.meetingLink}
                          onChange={(e) =>
                            changeEdit(item._id, 'meetingLink', e.target.value)
                          }
                        />
                      </div>
                    ) : (
                      <div>
                        <div>
                          {item.meetingTime
                            ? new Date(item.meetingTime).toLocaleString()
                            : 'Not scheduled'}
                        </div>
                        {item.meetingLink && (
                          <a
                            href={item.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Join
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    {ed ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn"
                          onClick={() => saveEdit(item._id)}
                          disabled={!ed.dirty || isUpdating}
                        >
                          {isUpdating ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={() => cancelEdit(item._id)}
                          disabled={isUpdating}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn"
                        onClick={() => startEdit(item)}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

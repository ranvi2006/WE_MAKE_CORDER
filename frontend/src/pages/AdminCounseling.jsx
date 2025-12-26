import { useEffect, useState } from 'react'
import client from '../api/client'

export default function AdminCounseling() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState({})
  const [updatingIds, setUpdatingIds] = useState(new Set())

  useEffect(() => {
    let mounted = true
    setLoading(true)

    client
      .get('/api/admin/counseling')
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
            'Failed to load counseling requests'
        )
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  function startEdit(item) {
    setEditing((prev) => ({
      ...prev,
      [item._id]: {
        status: item.status || 'Pending',
        notes: item.notes || '',
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

    setUpdatingIds((prev) => new Set(prev).add(id))
    try {
      const res = await client.put(`/api/admin/counseling/${id}`, {
        status: ed.status,
        notes: ed.notes
      })

      const updated = res.data || {}

      setRequests((prev) =>
        prev.map((r) =>
          r._id === id
            ? {
                ...r,
                status: updated.status ?? ed.status,
                notes: updated.notes ?? ed.notes
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
          'Failed to update request'
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

  const statusOptions = ['Pending', 'In Progress', 'Scheduled', 'Completed', 'Closed']

  return (
    <section>
      <div className="card">
        <h2>Counseling Requests</h2>

        <p className="muted" style={{ marginTop: 8 }}>
          View and manage counseling requests submitted by users.
        </p>

        {loading && <p className="muted">Loading requests…</p>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <div className="admin-table">
            <div className="admin-row" style={{ fontWeight: 600 }}>
              <div>Name</div>
              <div>Email</div>
              <div>Goal</div>
              <div>Status</div>
              <div>Created</div>
              <div>Notes</div>
              <div></div>
            </div>

            {requests.map((item) => {
              const ed = editing[item._id]
              const isUpdating = updatingIds.has(item._id)

              return (
                <div key={item._id} className="admin-row" style={{ alignItems: 'start' }}>
                  <div>{item.name}</div>
                  <div>{item.email}</div>
                  <div>{item.goal}</div>

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
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : '—'}
                  </div>

                  <div>
                    {ed ? (
                      <textarea
                        rows={2}
                        value={ed.notes}
                        onChange={(e) =>
                          changeEdit(item._id, 'notes', e.target.value)
                        }
                      />
                    ) : (
                      <div>{item.notes || '—'}</div>
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
                      <button className="btn" onClick={() => startEdit(item)}>
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
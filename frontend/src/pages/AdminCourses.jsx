import { useEffect, useState } from 'react'
import client from '../api/client'

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState({})
  const [updatingIds, setUpdatingIds] = useState(new Set())

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    duration: '',
    level: 'Beginner',
    published: false
  })

  useEffect(() => {
    let mounted = true
    setLoading(true)

    client
      .get('/api/admin/courses')
      .then((res) => {
        if (!mounted) return
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.courses || []
        setCourses(data)
      })
      .catch((err) => {
        if (!mounted) return
        setError(
          err?.response?.data?.message ||
            err.message ||
            'Failed to load courses'
        )
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  async function createCourse(e) {
    e.preventDefault()
    setError('')
    setCreating(true)

    try {
      const res = await client.post('/api/admin/courses', newCourse)
      setCourses((prev) => [res.data, ...prev])
      setNewCourse({
        title: '',
        description: '',
        duration: '',
        level: 'Beginner',
        published: false
      })
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Failed to create course'
      )
    } finally {
      setCreating(false)
    }
  }

  function startEdit(course) {
    setEditing((prev) => ({
      ...prev,
      [course._id]: { ...course, dirty: false }
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
      const res = await client.put(`/api/admin/courses/${id}`, {
        title: ed.title,
        description: ed.description,
        duration: ed.duration,
        level: ed.level,
        published: ed.published
      })

      const updated = res.data || {}

      setCourses((prev) =>
        prev.map((c) => (c._id === id ? { ...c, ...updated } : c))
      )

      setEditing((prev) => ({
        ...prev,
        [id]: { ...prev[id], dirty: false }
      }))
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Failed to update course'
      )
    } finally {
      setUpdatingIds((prev) => {
        const copy = new Set(prev)
        copy.delete(id)
        return copy
      })
    }
  }

  async function deleteCourse(id) {
    if (!window.confirm('Delete this course?')) return

    setUpdatingIds((prev) => new Set(prev).add(id))
    try {
      await client.delete(`/api/admin/courses/${id}`)
      setCourses((prev) => prev.filter((c) => c._id !== id))
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Failed to delete course'
      )
    } finally {
      setUpdatingIds((prev) => {
        const copy = new Set(prev)
        copy.delete(id)
        return copy
      })
    }
  }

  return (
    <section>
      <div className="card">
        <h2>Course Management</h2>
        <p className="muted" style={{ marginTop: 8 }}>
          Create, edit, publish, or delete courses.
        </p>

        {error && <div className="error-message">{error}</div>}

        {/* Create Course */}
        <form onSubmit={createCourse} style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              placeholder="Title"
              value={newCourse.title}
              onChange={(e) =>
                setNewCourse({ ...newCourse, title: e.target.value })
              }
              required
            />
            <input
              placeholder="Duration"
              value={newCourse.duration}
              onChange={(e) =>
                setNewCourse({ ...newCourse, duration: e.target.value })
              }
            />
            <select
              value={newCourse.level}
              onChange={(e) =>
                setNewCourse({ ...newCourse, level: e.target.value })
              }
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={newCourse.published}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, published: e.target.checked })
                }
              />
              Published
            </label>

            <button className="btn" type="submit" disabled={creating}>
              {creating ? 'Creating…' : 'Add Course'}
            </button>
          </div>

          <textarea
            placeholder="Description"
            value={newCourse.description}
            onChange={(e) =>
              setNewCourse({ ...newCourse, description: e.target.value })
            }
            style={{ marginTop: 8 }}
            rows={3}
          />
        </form>

        {/* Course List */}
        {loading && <p className="muted">Loading courses…</p>}

        {!loading && (
          <div className="admin-table">
            <div className="admin-row" style={{ fontWeight: 600 }}>
              <div>Title</div>
              <div>Duration</div>
              <div>Level</div>
              <div>Published</div>
              <div>Description</div>
              <div></div>
            </div>

            {courses.map((course) => {
              const ed = editing[course._id]
              const isUpdating = updatingIds.has(course._id)

              return (
                <div key={course._id} className="admin-row">
                  <div>
                    {ed ? (
                      <input
                        value={ed.title}
                        onChange={(e) =>
                          changeEdit(course._id, 'title', e.target.value)
                        }
                      />
                    ) : (
                      <strong>{course.title}</strong>
                    )}
                  </div>

                  <div>
                    {ed ? (
                      <input
                        value={ed.duration || ''}
                        onChange={(e) =>
                          changeEdit(course._id, 'duration', e.target.value)
                        }
                      />
                    ) : (
                      course.duration || '—'
                    )}
                  </div>

                  <div>
                    {ed ? (
                      <select
                        value={ed.level}
                        onChange={(e) =>
                          changeEdit(course._id, 'level', e.target.value)
                        }
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    ) : (
                      course.level
                    )}
                  </div>

                  <div>
                    <input
                      type="checkbox"
                      checked={ed ? ed.published : course.published}
                      onChange={(e) =>
                        ed
                          ? changeEdit(
                              course._id,
                              'published',
                              e.target.checked
                            )
                          : startEdit(course)
                      }
                    />
                  </div>

                  <div>
                    {ed ? (
                      <textarea
                        rows={2}
                        value={ed.description}
                        onChange={(e) =>
                          changeEdit(
                            course._id,
                            'description',
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      course.description
                    )}
                  </div>

                  <div>
                    {ed ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn"
                          onClick={() => saveEdit(course._id)}
                          disabled={!ed.dirty || isUpdating}
                        >
                          {isUpdating ? 'Saving…' : 'Save'}
                        </button>
                        <button onClick={() => setEditing({})}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn"
                          onClick={() => startEdit(course)}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCourse(course._id)}
                          style={{ background: '#dc2626' }}
                        >
                          Delete
                        </button>
                      </div>
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

import { useEffect, useState } from 'react'
import client from '../api/client'
import '../pages/css/Learning.css'

export default function Learning() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)

    client
      .get('/api/courses')
      .then((res) => {
        if (!mounted) return
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.courses || []
        const publishedCourses = data.filter((c) => c.published)
        setCourses(publishedCourses)
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
        }}
      >
        <div>
          <h2>Courses</h2>
          <p className="muted" style={{ marginTop: 10, maxWidth: 520 }}>
            Explore carefully curated courses designed to strengthen your
            fundamentals, improve interview readiness, and build confidence
            for real-world roles.
          </p>
        </div>

        <img
          src="/images/courses-hero.png"
          alt="Online learning"
          style={{
            width: '100%',
            borderRadius: 16,
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Content */}
      <div className="card">
        {loading && <p className="muted">Loading courses…</p>}

        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          courses.length === 0 ? (
            <p className="muted">No published courses available.</p>
          ) : (
            <div className="courses-grid">
              {courses.map((course) => (
                <article key={course._id} className="course-card">
                  <img
                    src="/images/ds-courses-hero.png"
                    alt="Course"
                    className="course-image"
                  />

                  <h3 style={{ marginTop: 12 }}>{course.title}</h3>

                  <p className="muted" style={{ marginTop: 8 }}>
                    {course.description}
                  </p>

                  <div className="course-meta">
                    {course.duration && <span>{course.duration}</span>}
                    {course.level && (
                      <span style={{ marginLeft: 8 }}>
                        • {course.level}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )
        )}
      </div>
    </section>
  )
}

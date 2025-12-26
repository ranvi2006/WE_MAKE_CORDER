import { useEffect, useState } from 'react'
import client from '../api/client'

export default function Learning(){
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    client.get('/api/courses')
      .then(res => {
        if (!mounted) return
        const data = Array.isArray(res.data) ? res.data : (res.data?.courses || [])
        const published = data.filter(c => c && c.published)
        setCourses(published)
      })
      .catch(err => {
        if (!mounted) return
        setError(err?.response?.data?.message || err.message || 'Failed to load courses')
      })
      .finally(() => mounted && setLoading(false))

    return () => { mounted = false }
  }, [])

  return (
    <section>
      <div className="card">
        <h2>Courses</h2>

        {loading && <p className="muted">Loading courses...</p>}

        {error && <p style={{color:'crimson'}}>{error}</p>}

        {!loading && !error && (
          courses.length === 0 ? (
            <p className="muted">No published courses available.</p>
          ) : (
            <div className="courses-grid">
              {courses.map((course) => (
                <article key={course.id || course.slug || course.title} className="course-card">
                  <h3>{course.title}</h3>
                  <p className="muted" style={{marginTop:8}}>{course.description}</p>
                  <div className="course-meta">
                    {course.duration && <span>{course.duration}</span>}
                    {course.level && <span style={{marginLeft:8}}>• {course.level}</span>}
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


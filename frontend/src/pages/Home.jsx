import { Link } from 'react-router-dom'
import client from '../api/client'

export default function Home(){
  // Example API usage (commented):
  // client.get('/courses').then(r => console.log(r.data))

  return (
    <section>
      <div className="hero card">
        <div>
          <h1 className="title">Practice Interviews. Get Guidance. Build Confidence.</h1>
          <p className="muted" style={{marginTop:12}}>
            We Make Corder pairs structured learning with mentoring — interview practice, one-on-one
            counseling, and hands-on resources to help you grow your skills and land the job you want.
          </p>

          <div className="hero-actions" style={{marginTop:18}}>
            <Link to="/counseling" className="btn" aria-label="Book Counseling">Book Counseling</Link>
            <Link to="/interview-practice" className="btn" aria-label="Interview Practice">Interview Practice</Link>
          </div>
        </div>
      </div>

      <div style={{marginTop:20}} className="card">
        <h3>Overview</h3>
        <p className="muted">Use this starter to build education experiences — courses, lessons, and dashboards.</p>
      </div>
    </section>
  )
}

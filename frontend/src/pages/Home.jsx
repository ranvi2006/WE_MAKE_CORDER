import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section>
      {/* Hero Section */}
      <div className="card hero">
        <div>
          <h1 className="title">
            Practice Interviews. Get Guidance. Build Confidence.
          </h1>

          <p className="muted" style={{ marginTop: 12 }}>
            We Make Corder helps students and professionals grow with
            one-on-one counseling, interview practice, and curated learning
            resources.
          </p>

          <div className="hero-actions" style={{ marginTop: 18 }}>
            <Link to="/counseling" className="btn">
              Book Counseling
            </Link>
            <Link to="/interview-practice" className="btn">
              Interview Practice
            </Link>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3>Why We Make Corder?</h3>
        <p className="muted" style={{ marginTop: 8 }}>
          We focus on real-world preparation. Our mentors help you identify
          gaps, practice interviews, and gain confidence before applying
          for jobs.
        </p>
      </div>
    </section>
  )
}

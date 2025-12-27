import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section>
      {/* Hero Section */}
      <div
        className="card hero"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: 32,
          alignItems: 'center',
        }}
      >
        {/* Text */}
        <div>
          <h1 className="title">
            Practice Interviews. <br />
            Get Guidance. <br />
            Build Confidence.
          </h1>

          <p className="muted" style={{ marginTop: 16, maxWidth: 520 }}>
            We Make Corder helps students and professionals grow with
            one-on-one counseling, interview practice, and curated learning
            resources designed for real-world success.
          </p>

          <div className="hero-actions" style={{ marginTop: 24 }}>
            <Link to="/counseling" className="btn">
              Book Counseling
            </Link>
            <Link to="/interview-practice" className="btn btn-outline">
              Interview Practice
            </Link>
          </div>
        </div>

        {/* Image */}
        <div>
          <img
            src="/images/hero-interview.png"
            alt="Interview preparation"
            style={{
              width: '100%',
              borderRadius: 16,
              objectFit: 'cover',
            }}
          />
        </div>
      </div>

      {/* Info Section */}
      <div
        className="card"
        style={{
          marginTop: 32,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          alignItems: 'center',
        }}
      >
        <div>
          <h3>Why We Make Corder?</h3>
          <p className="muted" style={{ marginTop: 10 }}>
            We focus on real-world preparation. Our mentors help you identify
            skill gaps, practice interviews, and build confidence before
            applying for jobs.
          </p>
        </div>

        <img
          src="/images/career-growth.png"
          alt="Career growth"
          style={{
            width: '100%',
            borderRadius: 14,
            objectFit: 'cover',
          }}
        />
      </div>
    </section>
  )
}

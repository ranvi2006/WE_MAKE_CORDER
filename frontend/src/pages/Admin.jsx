import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Admin() {
  const { admin, logout } = useAuth()

  return (
    <section>
      <div className="card">
        <h2>Admin Panel</h2>

        <p className="muted" style={{ marginTop: 8 }}>
          Welcome{admin?.name ? `, ${admin.name}` : ''}.  
          Use the links below to manage the platform.
        </p>

        {/* Admin Navigation */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginTop: 24
          }}
        >
          <Link className="btn" to="/admin/dashboard">
            Dashboard
          </Link>

          <Link className="btn" to="/admin/counseling">
            Counseling Requests
          </Link>

          <Link className="btn" to="/admin/interview-practice">
            Interview Practice
          </Link>

          <Link className="btn" to="/admin/courses">
            Courses
          </Link>
        </div>

        {/* Logout */}
        <div style={{ marginTop: 32 }}>
          <button
            onClick={logout}
            style={{
              background: '#dc2626',
              color: '#fff'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </section>
  )
}

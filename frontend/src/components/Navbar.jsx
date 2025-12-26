import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated, logout } = useAuth()

  const isAdmin = location.pathname.startsWith('/admin')

  const publicLinks = [
    { to: '/', label: 'Home' },
    { to: '/learning', label: 'Learning' },
    { to: '/counseling', label: 'Counseling' },
    { to: '/interview-practice', label: 'Interview Practice' },
    { to: '/my-meetings', label: 'My Meetings' }
  ]

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/counseling', label: 'Counseling' },
    { to: '/admin/interview-practice', label: 'Interview Practice' },
    { to: '/admin/courses', label: 'Courses' }
  ]

  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="brand">
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            We Make Corder
          </Link>
        </div>

        <button
          className="nav-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          <span className="sr-only">Menu</span>
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>

        <nav
          className={'nav-links' + (open ? ' open' : '')}
          onClick={() => setOpen(false)}
        >
          {/* Public links */}
          {!isAdmin &&
            publicLinks.map((l) => (
              <Link key={l.to} to={l.to} className="nav-link">
                {l.label}
              </Link>
            ))}

          {/* Admin links */}
          {isAdmin && isAuthenticated() &&
            adminLinks.map((l) => (
              <Link key={l.to} to={l.to} className="nav-link">
                {l.label}
              </Link>
            ))}

          {/* Auth actions */}
          {isAuthenticated() ? (
            <button
              className="btn"
              style={{ marginLeft: 12 }}
              onClick={logout}
            >
              Logout
            </button>
          ) : (
            <Link to="/admin/login" className="nav-link">
              Admin Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

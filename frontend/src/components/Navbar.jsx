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
    // { to: '/counseling', label: 'Counseling' },
    { to: '/interview-practice', label: 'Interview Practice' },
    { to: '/my-meetings', label: 'My Meetings' },
    { to: '/admin/login', label: 'Admin' }
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
        {/* Brand */}
        <Link to="/" className="brand">
          <img
            src="/images/CompanyLogo.jpg"
            alt="We Make Corder"
            className="brand-logo"
          />
        
        </Link>

        {/* Mobile Toggle */}
        <button
          className="nav-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>

        {/* Links */}
        <nav className={`nav-links ${open ? 'open' : ''}`}>
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

          {/* Logout */}
          {isAuthenticated() && (
            <button className="btn nav-logout" onClick={logout}>
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

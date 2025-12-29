import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ProfileDropdown from './ProfileDropdown'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { isUser, isAdminUser, logout } = useAuth()

  const isAdmin = location.pathname.startsWith('/admin')

  const publicLinks = [
    { to: '/', label: 'Home' },
    { to: '/learning', label: 'Learning' },
    { to: '/interview-practice', label: 'Interview Practice' },
    { to: '/my-meetings', label: 'My Meetings' }
  ]

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/counseling', label: 'Counseling' },
    { to: '/admin/interview-practice', label: 'Interview Practice' },
    { to: '/admin/courses', label: 'Courses' }
  ]

  function handleLinkClick() {
    setOpen(false)
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-brand" onClick={handleLinkClick}>
          <img src="/images/CompanyLogo.jpg" alt="We Make Corder" />
        </Link>

        {/* Mobile toggle */}
        <button
          className="navbar-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        {/* Navigation */}
        <nav className={`navbar-links ${open ? 'open' : ''}`}>
          {isAdmin && isAdminUser() ? (
            <>
              {adminLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="navbar-link"
                  onClick={handleLinkClick}
                >
                  {l.label}
                </Link>
              ))}

              <button
                className="navbar-logout"
                onClick={() => {
                  logout()
                  handleLinkClick()
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {publicLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="navbar-link"
                  onClick={handleLinkClick}
                >
                  {l.label}
                </Link>
              ))}

              {isUser() ? (
                <div className="navbar-profile" onClick={handleLinkClick}>
                  <ProfileDropdown />
                </div>
              ) : (
                <div className="navbar-auth">
                  <Link
                    to="/login"
                    className="btn-outline"
                    onClick={handleLinkClick}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                    onClick={handleLinkClick}
                  >
                    Register
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

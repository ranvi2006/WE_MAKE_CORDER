import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar(){
  const [open, setOpen] = useState(false)

  const links = [
    { to: '/', label: 'Home' },
    { to: '/learning', label: 'Learning' },
    { to: '/counseling', label: 'Counseling' },
    { to: '/interview-practice', label: 'Interview Practice' },
    { to: '/my-meetings', label: 'My Meetings' },
    { to: '/admin', label: 'Admin' }
  ]

  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="brand">We Make Corder</div>

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

        <nav className={"nav-links" + (open ? ' open' : '')} onClick={() => setOpen(false)}>
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="nav-link">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

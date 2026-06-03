import { Link, Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* ── Sticky Navbar ──────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          transition: 'all 0.3s ease',
          background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(248,250,252,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid #e2e8f0' : '1px solid transparent',
          boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <nav
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1.5rem',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link
            to="/home"
            id="nav-logo"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}
          >
            <div
              style={{
                width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
              }}
            >
              ◈
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
              Internship<span style={{ color: 'var(--accent)' }}>Hub</span>
            </span>
          </Link>

          {/* Center nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {[
              { label: 'Browse Internships', to: '/student/internships' },
              { label: 'For Companies',      to: '/register' },
            ].map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                style={{
                  padding: '0.4rem 0.875rem', borderRadius: '0.5rem',
                  color: '#475569', fontSize: '0.875rem', fontWeight: 500,
                  textDecoration: 'none', transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#0f172a'
                  e.currentTarget.style.background = '#f1f5f9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#475569'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Link
              id="nav-login"
              to="/login"
              style={{
                padding: '0.45rem 1.1rem', borderRadius: '999px',
                border: '1px solid #e2e8f0',
                color: '#475569', fontSize: '0.875rem', fontWeight: 500,
                textDecoration: 'none', transition: 'all 0.15s ease',
                background: '#ffffff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0f172a'
                e.currentTarget.style.borderColor = '#cbd5e1'
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#475569'
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Log in
            </Link>

            <Link
              id="nav-register"
              to="/register"
              style={{
                padding: '0.45rem 1.1rem', borderRadius: '999px',
                background: 'var(--accent)',
                color: '#fff', fontSize: '0.875rem', fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(79,70,229,0.3)',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-hover)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.35)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--accent)'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(79,70,229,0.3)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Page content ───────────────────────────────────────────────────── */}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

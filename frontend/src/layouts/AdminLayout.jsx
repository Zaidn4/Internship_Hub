import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin/dashboard',   icon: '◈',  label: 'Dashboard'         },
  { to: '/admin/users',       icon: '👥', label: 'Manage Users'       },
  { to: '/admin/internships', icon: '💼', label: 'Manage Internships' },
  { to: '/admin/companies',   icon: '🏢', label: 'Manage Companies'   },
]

const ACCENT = '#f59e0b'  // Amber for admin theme

export default function AdminLayout() {
  const { user, logout } = useAuth()

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AD'

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        style={{
          width: '260px',
          minHeight: '100vh',
          background: '#0f0f17',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'rgba(245,158,11,0.15)',
                border: '1px solid rgba(245,158,11,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', flexShrink: 0,
              }}
            >
              🛡️
            </div>
            <div>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2 }}>
                InternHub
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? ACCENT : 'var(--text-subtle)',
                background: isActive ? 'rgba(245,158,11,0.1)' : 'transparent',
                borderLeft: isActive ? `2px solid ${ACCENT}` : '2px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.style.background.includes('0.1)')) {
                  e.currentTarget.style.background = 'rgba(245,158,11,0.05)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.style.background.includes('0.1)')) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-subtle)'
                }
              }}
            >
              <span style={{ fontSize: '1rem', width: '1.25rem', textAlign: 'center' }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              style={{
                width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                background: 'rgba(245,158,11,0.15)',
                border: '1px solid rgba(245,158,11,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: ACCENT,
              }}
            >
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 500,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </p>
              <p style={{ color: '#f59e0b', fontSize: '0.7rem' }}>Administrator</p>
            </div>
          </div>
          <button
            id="admin-logout-btn"
            onClick={logout}
            style={{
              width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: 'none',
              background: 'rgba(248,113,113,0.1)', color: '#f87171',
              fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.18)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.1)')}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main style={{ marginLeft: '260px', flex: 1, minHeight: '100vh', padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  )
}

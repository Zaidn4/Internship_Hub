import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from '../components/common/NotificationBell'

const NAV_ITEMS = [
  { to: '/company/dashboard',    icon: '◈',  label: 'Dashboard'            },
  { to: '/company/internships',  icon: '📌', label: 'My Listings'          },
  { to: '/company/applications', icon: '📥', label: 'Applications Received' },
  { to: '/company/profile',      icon: '🏢', label: 'Company Profile'       },
]

export default function CompanyLayout() {
  const { user, logout } = useAuth()
  const companyName = user?.profile?.company_name ?? user?.name ?? 'Company'

  const initials = companyName
    .split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex min-h-screen" style={{ background: '#f8fafc' }}>
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        style={{
          width: '256px', minHeight: '100vh',
          background: '#ffffff', borderRight: '1px solid #e2e8f0',
          display: 'flex', flexDirection: 'column',
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40,
        }}
      >
        {/* Logo */}
        <div style={{ padding: '1.25rem 1rem 0.875rem', borderBottom: '1px solid #e2e8f0' }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
            }}>
              ◈
            </div>
            <div>
              <p style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                InternshipHub
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 500 }}>Company Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0.625rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.5625rem 0.75rem', borderRadius: '0.5rem',
                fontSize: '0.875rem', fontWeight: isActive ? 600 : 400,
                color: isActive ? '#4f46e5' : '#475569',
                background: isActive ? '#eef2ff' : 'transparent',
                textDecoration: 'none', transition: 'all 0.15s ease',
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.style.background.includes('eef2ff')) {
                  e.currentTarget.style.background = '#f8fafc'
                  e.currentTarget.style.color = '#0f172a'
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.style.background.includes('eef2ff')) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#475569'
                }
              }}
            >
              <span style={{ fontSize: '1rem', width: '1.25rem', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid #e2e8f0' }}>
          <div className="flex items-center gap-2 mb-2.5">
            {/* Avatar: show image if set, otherwise fall back to initials */}
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: user?.avatar_url ? 'transparent' : '#eef2ff',
              border: '1px solid #c7d2fe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5',
              overflow: 'hidden',
            }}>
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={companyName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                initials
              )}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ color: '#0f172a', fontSize: '0.8125rem', fontWeight: 600,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {companyName}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.7rem',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </p>
            </div>
            {/* Notification Bell */}
            <div style={{ flexShrink: 0 }}>
              <NotificationBell roleBase="/company" />
            </div>
          </div>
          <button
            id="company-logout-btn"
            onClick={logout}
            style={{
              width: '100%', padding: '0.45rem', borderRadius: '0.5rem', border: '1px solid #fecaca',
              background: '#fef2f2', color: '#dc2626',
              fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca' }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main style={{ marginLeft: '256px', flex: 1, minHeight: '100vh', padding: '2rem', background: '#f8fafc' }}>
        <Outlet />
      </main>
    </div>
  )
}

import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import StudentTopHeader from '../components/layout/StudentTopHeader'

export default function StudentLayout() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()

  // Defined inside the component so t() re-evaluates on language change
  const NAV_ITEMS = [
    { to: '/student/dashboard',    icon: '◈',  label: t('nav.dashboard')    },
    { to: '/student/internships',  icon: '🔍', label: t('nav.browse')       },
    { to: '/student/saved',        icon: '🔖', label: t('nav.saved')        },
    { to: '/student/applications', icon: '📋', label: t('nav.applications') },
    { to: '/student/feed',         icon: '📢', label: 'Community'           },
    { to: '/student/profile',      icon: '👤', label: t('nav.profile')      },
  ]

  return (
    <div className="flex min-h-screen" style={{ background: '#f8fafc' }}>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        style={{
          width: '256px',
          minHeight: '100vh',
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          zIndex: 40,
        }}
      >
        {/* Logo / Brand */}
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
              <p style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 500 }}>
                {t('nav.portal')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
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
        {/* ── No user footer here — moved to StudentTopHeader ── */}
      </aside>

      {/* ── Right column: TopHeader + page content ──────────────────────── */}
      <div style={{ marginLeft: '256px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Sticky top header */}
        <StudentTopHeader
          user={user}
          logout={logout}
          signOutLabel={t('nav.signout')}
        />

        {/* Page content */}
        <main style={{ flex: 1, padding: '2rem', background: '#f8fafc' }}>
          <Outlet />
        </main>

      </div>
    </div>
  )
}

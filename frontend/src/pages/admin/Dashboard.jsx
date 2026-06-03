import { useAuth } from '../../context/AuthContext'

const STATS = [
  { label: 'Total Users',        value: '—', icon: '👥', color: '#f59e0b' },
  { label: 'Total Internships',  value: '—', icon: '💼', color: '#60a5fa' },
  { label: 'Pending Approvals',  value: '—', icon: '⏳', color: '#f87171' },
]

const QUICK_LINKS = [
  { href: '/admin/users',       icon: '👥', label: 'Manage Users',       color: '#f59e0b' },
  { href: '/admin/internships', icon: '💼', label: 'Manage Internships',  color: '#60a5fa' },
  { href: '/admin/companies',   icon: '🏢', label: 'Manage Companies',    color: '#34d399' },
]

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="flex items-center gap-3 mb-2">
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Admin Control Panel
          </h1>
          <span
            style={{
              padding: '0.25rem 0.625rem', borderRadius: '0.375rem',
              background: 'rgba(245,158,11,0.12)', color: '#f59e0b',
              fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(245,158,11,0.25)',
            }}
          >
            ADMIN
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
          Signed in as <span style={{ color: 'var(--text-subtle)' }}>{user?.name}</span> · Full platform access
        </p>
      </div>

      {/* ── Stats row ───────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {STATS.map(({ label, value, icon, color }) => (
          <div
            key={label}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: '0.875rem',
              padding: '1.25rem 1.5rem',
              transition: 'border-color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${color}44`)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: '1.375rem' }}>{icon}</span>
              <span
                style={{
                  fontSize: '1.5rem', fontWeight: 700, color,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {value}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Admin quick-access grid ──────────────────────────────────────── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          borderRadius: '0.875rem',
          padding: '1.5rem',
        }}
      >
        <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem', marginBottom: '1rem' }}>
          Management Sections
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {QUICK_LINKS.map(({ href, icon, label, color }) => (
            <a
              key={href}
              href={href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                gap: '0.5rem', padding: '1.125rem 1.25rem',
                borderRadius: '0.625rem',
                background: `${color}0d`,
                border: `1px solid ${color}22`,
                color, textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${color}18`
                e.currentTarget.style.borderColor = `${color}40`
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${color}0d`
                e.currentTarget.style.borderColor = `${color}22`
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{icon}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

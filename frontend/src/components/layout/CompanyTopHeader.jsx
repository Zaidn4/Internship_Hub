import NotificationBell from '../common/NotificationBell'

/**
 * CompanyTopHeader
 *
 * Horizontal top bar that sits above all company pages.
 * Contains: Notification Bell | Avatar | Name / Email | Sign-out button
 *
 * Props:
 *   user       — the authenticated user object from AuthContext
 *   logout     — logout function from AuthContext
 *   companyName — resolved display name for the company
 */
export default function CompanyTopHeader({ user, logout, companyName }) {
  const initials = companyName
    ? companyName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??'

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        width: '100%',
        height: '64px',
        background: '#ffffff',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 1.5rem',
        gap: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* ── Notification Bell ───────────────────────────────────────────── */}
      <NotificationBell roleBase="/company" />

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div style={{ width: '1px', height: '28px', background: '#e2e8f0', flexShrink: 0 }} />

      {/* ── Avatar + Name / Email ───────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        {/* Avatar */}
        <div
          style={{
            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
            background: user?.avatar_url ? 'transparent' : '#fff7ed',
            border: '2px solid #fed7aa',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 700, color: '#ea580c',
            overflow: 'hidden',
          }}
        >
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

        {/* Name + Email (email hidden on small screens) */}
        <div style={{ minWidth: 0 }}>
          <p style={{
            color: '#0f172a', fontSize: '0.8125rem', fontWeight: 600,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            maxWidth: '160px',
          }}>
            {companyName}
          </p>
          <p
            className="hidden md:block"
            style={{
              color: '#94a3b8', fontSize: '0.7rem',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              maxWidth: '160px',
            }}
          >
            {user?.email}
          </p>
        </div>
      </div>

      {/* ── Sign-out icon button ─────────────────────────────────────────── */}
      <button
        id="company-logout-btn"
        onClick={logout}
        title="Sign out"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.4rem 0.75rem',
          borderRadius: '0.5rem',
          border: '1px solid #fecaca',
          background: 'transparent',
          color: '#ef4444',
          fontSize: '0.8rem', fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#fef2f2'
          e.currentTarget.style.borderColor = '#fca5a5'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.borderColor = '#fecaca'
        }}
      >
        {/* Arrow-right-from-bracket icon (pure SVG, no lib needed) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14" height="14"
          viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span className="hidden md:inline">Sign out</span>
      </button>
    </header>
  )
}

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_LABELS = {
  student: { icon: '🎓', label: 'Student', color: '#34d399' },
  company: { icon: '🏢', label: 'Company', color: '#60a5fa' },
  admin:   { icon: '🛡️', label: 'Admin',   color: '#f59e0b' },
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate          = useNavigate()
  const role              = ROLE_LABELS[user?.role] ?? ROLE_LABELS.student
  const profile           = user?.profile

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div
      style={{ background: 'var(--bg-page)' }}
      className="min-h-screen flex items-center justify-center px-4 py-12"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.14) 0%, transparent 70%)',
        }}
      />

      <div className="auth-card w-full max-w-lg p-8 relative text-center"
           style={{ animation: 'fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>

        {/* Avatar ring */}
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5"
          style={{
            background: 'rgba(99,102,241,0.12)',
            border: `2px solid ${role.color}33`,
            boxShadow: `0 0 24px ${role.color}22`,
          }}
        >
          <span style={{ fontSize: '2.25rem', lineHeight: 1 }}>{role.icon}</span>
        </div>

        {/* Name + role badge */}
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Welcome, {user?.name}!
        </h1>
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6"
          style={{ background: `${role.color}18`, color: role.color, border: `1px solid ${role.color}33` }}
        >
          {role.label}
        </span>

        {/* Profile card */}
        {profile && (
          <div
            className="rounded-xl p-5 mb-6 text-left space-y-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-3"
               style={{ color: 'var(--text-muted)' }}>
              Profile snapshot
            </p>

            {/* Student fields */}
            {user?.role === 'student' && (
              <>
                <ProfileRow label="University" value={profile.university ?? 'Not set'} />
                <ProfileRow label="Bio"        value={profile.bio        ?? 'Not set'} />
                <ProfileRow label="CV"         value={profile.cv_path    ?? 'Not uploaded'} />
              </>
            )}

            {/* Company fields */}
            {user?.role === 'company' && (
              <>
                <ProfileRow label="Company"     value={profile.company_name ?? 'Not set'} />
                <ProfileRow label="Description" value={profile.description  ?? 'Not set'} />
                <ProfileRow label="Website"     value={profile.website      ?? 'Not set'} />
              </>
            )}
          </div>
        )}

        {/* Email row */}
        <div
          className="rounded-xl p-4 mb-6 text-left"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
        >
          <ProfileRow label="Email" value={user?.email} />
        </div>

        {/* Logout */}
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="auth-btn"
          style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171',
                   border: '1px solid rgba(248,113,113,0.25)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(248,113,113,0.2)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(248,113,113,0.12)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs font-medium min-w-24 mt-0.5" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span className="text-sm" style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>
        {value}
      </span>
    </div>
  )
}

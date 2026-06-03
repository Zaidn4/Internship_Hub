import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { getStudentDashboardStats } from '../../services/dashboardService'

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:  { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', label: 'Pending'  },
  accepted: { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', label: 'Accepted' },
  rejected: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Rejected' },
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.875rem',
      padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ width: 36, height: 36, borderRadius: '0.5rem', background: '#f1f5f9', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: 48, height: 32, borderRadius: '0.375rem', background: '#f1f5f9', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
      <div style={{ width: 110, height: 12, borderRadius: '0.25rem', background: '#f1f5f9', animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
  )
}

// ── Custom PieChart tooltip ───────────────────────────────────────────────────
function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.625rem',
      padding: '0.625rem 0.875rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      fontSize: '0.8125rem',
    }}>
      <p style={{ color: '#64748b', marginBottom: '0.2rem' }}>{name}</p>
      <p style={{ color: '#0f172a', fontWeight: 700 }}>{value} application{value !== 1 ? 's' : ''}</p>
    </div>
  )
}

// ── Quick action link ─────────────────────────────────────────────────────────
function QuickAction({ to, icon, label, bg, border, color }) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.625rem 1rem', borderRadius: '0.5rem',
        background: bg, border: `1px solid ${border}`,
        color, fontSize: '0.875rem', fontWeight: 500,
        textDecoration: 'none', transition: 'filter 0.15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.96)')}
      onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
    >
      <span>{icon}</span> {label}
    </Link>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user }   = useAuth()
  const profile    = user?.profile
  const firstName  = user?.name?.split(' ')[0] ?? 'there'
  const university = profile?.university

  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStudentDashboardStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const statCards = stats
    ? [
        { label: 'Applications Sent', value: stats.total_applications, icon: '📋', color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
        { label: 'Pending Review',    value: stats.pending_count,      icon: '⏳', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
        { label: 'Accepted',          value: stats.accepted_count,     icon: '✅', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
      ]
    : []

  // Filter out zero slices for the pie (prevents ugly "0%" labels)
  const pieData = stats?.applications_by_status?.filter((d) => d.count > 0) ?? []
  const hasApplications = stats && stats.total_applications > 0

  return (
    <div style={{ maxWidth: '960px' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>
          Welcome back, {firstName} 👋
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          {university
            ? `Studying at ${university}`
            : 'Complete your profile to get personalised internship matches.'}
        </p>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {loading
          ? [1,2,3].map((n) => <SkeletonCard key={n} />)
          : statCards.map(({ label, value, icon, color, bg, border }) => (
            <div
              key={label}
              style={{
                background: '#ffffff', border: '1px solid #e2e8f0',
                borderRadius: '0.875rem', padding: '1.25rem 1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '0.5rem', background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem' }}>
                  {icon}
                </div>
                <span style={{ fontSize: '1.875rem', fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>
                  {value}
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.8125rem', fontWeight: 500 }}>{label}</p>
            </div>
          ))
        }
      </div>

      {/* ── Charts + Recent Applications row ───────────────────────────────── */}
      {!loading && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1rem', marginBottom: '1.5rem', alignItems: 'start' }}>

          {/* PieChart — Application status breakdown */}
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: '1rem', padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Status Breakdown</h2>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>All applications</p>

            {!hasApplications ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#94a3b8', fontSize: '0.8125rem' }}>
                No applications yet.<br />
                <Link to="/student/internships" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none', marginTop: '0.5rem', display: 'inline-block' }}>Browse listings →</Link>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="count"
                      nameKey="status"
                      cx="50%" cy="50%"
                      innerRadius={44}
                      outerRadius={72}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.status} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.5rem' }}>
                  {stats.applications_by_status.map(({ status, count }) => {
                    const cfg = STATUS_CFG[status.toLowerCase()] ?? { color: '#94a3b8', label: status }
                    return (
                      <div key={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                          <span style={{ color: '#64748b' }}>{cfg.label}</span>
                        </div>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{count}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Recent applications list */}
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: '1rem', padding: '1.25rem 1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>Recent Applications</h2>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Your 3 latest submissions</p>
              </div>
              <Link to="/student/applications" style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
                View all →
              </Link>
            </div>

            {stats.recent_applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                You haven't applied to any internships yet.
                <br />
                <Link to="/student/internships" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none', marginTop: '0.5rem', display: 'inline-block' }}>
                  Browse listings →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {stats.recent_applications.map((app) => {
                  const cfg = STATUS_CFG[app.status] ?? { color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0', label: app.status }
                  return (
                    <div key={app.id} style={{
                      display: 'flex', alignItems: 'center', gap: '0.875rem',
                      padding: '0.875rem 1rem', borderRadius: '0.75rem',
                      background: '#f8fafc', border: '1px solid #f1f5f9',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    >
                      {/* Icon */}
                      <div style={{
                        width: 36, height: 36, borderRadius: '0.5rem', flexShrink: 0,
                        background: '#eef2ff', border: '1px solid #c7d2fe',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem',
                      }}>🏢</div>

                      {/* Title + company */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {app.internship_title}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.1rem' }}>
                          {app.company_name} · {app.applied_at}
                        </p>
                      </div>

                      {/* Status badge */}
                      <span style={{
                        flexShrink: 0, padding: '0.2rem 0.625rem',
                        borderRadius: '999px', fontSize: '0.7rem',
                        fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
                        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                      }}>
                        {cfg.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Quick actions ───────────────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0',
        borderRadius: '1rem', padding: '1.5rem', marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <h2 style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.9375rem', marginBottom: '1rem' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <QuickAction to="/student/internships"  icon="🔍" label="Browse Internships" bg="#eef2ff" border="#c7d2fe" color="#4f46e5" />
          <QuickAction to="/student/profile"      icon="👤" label="Update Profile"     bg="#ecfdf5" border="#a7f3d0" color="#059669" />
          <QuickAction to="/student/applications" icon="📋" label="My Applications"    bg="#fffbeb" border="#fde68a" color="#d97706" />
        </div>
      </div>

      {/* ── Profile incomplete nudge ────────────────────────────────────────── */}
      {!university && (
        <div style={{
          background: '#eef2ff', border: '1px solid #c7d2fe',
          borderRadius: '0.875rem', padding: '1rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.875rem',
        }}>
          <span style={{ fontSize: '1.25rem' }}>💡</span>
          <div>
            <p style={{ color: '#0f172a', fontSize: '0.875rem', fontWeight: 600 }}>Complete your profile</p>
            <p style={{ color: '#64748b', fontSize: '0.8125rem' }}>Add your university, bio, and CV to stand out to companies.</p>
          </div>
          <Link
            to="/student/profile"
            style={{
              marginLeft: 'auto', padding: '0.5rem 1rem', borderRadius: '0.5rem',
              background: '#4f46e5', color: '#ffffff',
              fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none',
              whiteSpace: 'nowrap', flexShrink: 0, transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#4338ca')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#4f46e5')}
          >
            Set up →
          </Link>
        </div>
      )}
    </div>
  )
}

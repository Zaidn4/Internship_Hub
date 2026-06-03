import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { getCompanyDashboardStats } from '../../services/dashboardService'

// ── Colour palette for status bars ───────────────────────────────────────────
const STATUS_COLORS = {
  pending:  '#f59e0b',
  accepted: '#059669',
  rejected: '#dc2626',
}

// ── Skeleton shimmer card ─────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.875rem',
      padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ width: 32, height: 32, borderRadius: '0.5rem', background: '#f1f5f9', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: 48, height: 28, borderRadius: '0.375rem', background: '#f1f5f9', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
      <div style={{ width: 100, height: 12, borderRadius: '0.25rem', background: '#f1f5f9', animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
  )
}

// ── Custom bar chart tooltip ──────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.625rem',
      padding: '0.625rem 0.875rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      fontSize: '0.8125rem',
    }}>
      <p style={{ color: '#64748b', marginBottom: '0.2rem' }}>{label}</p>
      <p style={{ color: '#0f172a', fontWeight: 700 }}>{payload[0].value} applications</p>
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
        textDecoration: 'none', transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.96)')}
      onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
    >
      <span>{icon}</span> {label}
    </Link>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CompanyDashboard() {
  const { user }    = useAuth()
  const profile     = user?.profile
  const companyName = profile?.company_name ?? user?.name ?? 'Company'

  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCompanyDashboardStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const statCards = stats
    ? [
        { label: 'Active Listings',    value: stats.active_listings,    icon: '📌', color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
        { label: 'Total Applications', value: stats.total_applications, icon: '📥', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
        { label: 'Candidates Hired',   value: stats.hired_count,        icon: '🎉', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
      ]
    : []

  return (
    <div style={{ maxWidth: '960px' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>
          Welcome, {companyName} 👋
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          {profile?.description
            ? profile.description.slice(0, 120)
            : 'Manage your internship listings and review incoming applications.'}
        </p>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
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

      {/* ── Charts row ─────────────────────────────────────────────────────── */}
      {!loading && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '1.5rem', alignItems: 'start' }}>

          {/* Monthly bar chart */}
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: '1rem', padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              Applications Over Time
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1.25rem' }}>Last 6 months</p>

            {stats.applications_by_month.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                No application data yet — share your listings!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.applications_by_month} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {stats.applications_by_month.map((_, i) => (
                      <Cell key={i} fill={i === stats.applications_by_month.length - 1 ? '#4f46e5' : '#c7d2fe'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Status breakdown */}
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: '1rem', padding: '1.5rem', minWidth: '200px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
              By Status
            </h2>
            {stats.applications_by_status.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>No data yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.applications_by_status.map(({ status, count }) => {
                  const color = STATUS_COLORS[status] ?? '#94a3b8'
                  const total = stats.total_applications || 1
                  const pct   = Math.round((count / total) * 100)
                  return (
                    <div key={status}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#475569', textTransform: 'capitalize' }}>{status}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>{count}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, background: '#f1f5f9', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999, transition: 'width 0.5s ease' }} />
                      </div>
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
          <QuickAction to="/company/internships"  icon="📌" label="My Listings"          bg="#eef2ff" border="#c7d2fe" color="#4f46e5" />
          <QuickAction to="/company/applications" icon="📥" label="Review Applications"  bg="#ecfdf5" border="#a7f3d0" color="#059669" />
          <QuickAction to="/company/profile"      icon="🏢" label="Company Profile"      bg="#fffbeb" border="#fde68a" color="#d97706" />
        </div>
      </div>

      {/* ── Profile incomplete nudge ────────────────────────────────────────── */}
      {!profile?.description && (
        <div style={{
          background: '#eef2ff', border: '1px solid #c7d2fe',
          borderRadius: '0.875rem', padding: '1rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.875rem',
        }}>
          <span style={{ fontSize: '1.25rem' }}>💡</span>
          <div>
            <p style={{ color: '#0f172a', fontSize: '0.875rem', fontWeight: 600 }}>Complete your company profile</p>
            <p style={{ color: '#64748b', fontSize: '0.8125rem' }}>Add a description and website to attract the best candidates.</p>
          </div>
          <Link
            to="/company/profile"
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

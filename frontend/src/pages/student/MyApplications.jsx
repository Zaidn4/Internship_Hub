import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStudentApplications } from '../../services/applicationService'

// ── Shared style maps ────────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:  { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', border: 'rgba(251,191,36,0.3)',  label: 'Pending'  },
  accepted: { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', border: 'rgba(52,211,153,0.3)',  label: 'Accepted' },
  rejected: { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.3)', label: 'Rejected' },
}

const TYPE_STYLES = {
  'remote':  { bg: 'rgba(52,211,153,0.1)',  color: '#34d399', border: 'rgba(52,211,153,0.2)',  label: 'Remote'  },
  'on-site': { bg: 'rgba(96,165,250,0.1)',  color: '#60a5fa', border: 'rgba(96,165,250,0.2)',  label: 'On-site' },
  'hybrid':  { bg: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: 'rgba(167,139,250,0.2)', label: 'Hybrid'  },
}

// ── ApplicationRow sub-component ─────────────────────────────────────────────
function ApplicationRow({ application }) {
  const { internship, status, applied_at } = application

  const company     = internship?.company
  const statusStyle = STATUS_STYLES[status]  ?? STATUS_STYLES.pending
  const typeStyle   = TYPE_STYLES[internship?.type] ?? TYPE_STYLES['hybrid']

  const appliedDate = applied_at
    ? new Date(applied_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—'

  // Company initials avatar (first letter of company name)
  const initial = company?.company_name?.[0]?.toUpperCase() ?? '?'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem 1.25rem',
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${status === 'accepted' ? 'rgba(52,211,153,0.15)' : status === 'rejected' ? 'rgba(248,113,113,0.12)' : 'var(--border)'}`,
        borderRadius: '0.75rem',
        transition: 'border-color 0.2s ease, transform 0.2s ease',
        flexWrap: 'wrap',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        if (status === 'pending') e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor =
          status === 'accepted' ? 'rgba(52,211,153,0.15)'
          : status === 'rejected' ? 'rgba(248,113,113,0.12)'
          : 'var(--border)'
      }}
    >
      {/* ── Company avatar ────────────────────────────────────────────────────── */}
      <div
        style={{
          width: '44px', height: '44px', borderRadius: '0.625rem', flexShrink: 0,
          background: company?.avatar_url ? 'transparent' : 'rgba(96,165,250,0.12)',
          border: '1px solid rgba(96,165,250,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', fontWeight: 700, color: '#60a5fa',
          overflow: 'hidden',
        }}
      >
        {company?.avatar_url ? (
          <img
            src={company.avatar_url}
            alt={company.company_name ?? 'Company'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          initial
        )}
      </div>

      {/* ── Internship + company name ──────────────────────────────────────── */}
      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
        <p style={{
          color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9375rem',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: '0.2rem',
        }}>
          {internship?.title ?? 'Unknown Position'}
        </p>
        <p style={{
          color: 'var(--text-muted)', fontSize: '0.8rem',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {company?.company_name ?? '—'}
          {internship?.location && ` · ${internship.location}`}
        </p>
      </div>

      {/* ── Work type badge ────────────────────────────────────────────────── */}
      {internship?.type && (
        <span
          style={{
            flexShrink: 0,
            padding: '0.2rem 0.6rem', borderRadius: '999px',
            fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
            background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}`,
          }}
        >
          {typeStyle.label}
        </span>
      )}

      {/* ── Applied date ──────────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: '0.15rem' }}>Applied</p>
        <p style={{ color: 'var(--text-subtle, #a1a1b5)', fontSize: '0.8rem', fontWeight: 500 }}>
          {appliedDate}
        </p>
      </div>

      {/* ── Status badge ──────────────────────────────────────────────────── */}
      <span
        style={{
          flexShrink: 0,
          padding: '0.3rem 0.875rem', borderRadius: '999px',
          fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase',
          background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`,
          minWidth: '80px', textAlign: 'center',
        }}
      >
        {statusStyle.label}
      </span>
    </div>
  )
}

// ── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1rem 1.25rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 44, height: 44, borderRadius: '0.625rem', flexShrink: 0,
        background: 'rgba(255,255,255,0.06)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }} />
      {/* Title + company */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ height: '0.875rem', width: '220px', maxWidth: '70%', borderRadius: '0.3rem', background: 'rgba(255,255,255,0.07)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '0.72rem', width: '140px', maxWidth: '50%', borderRadius: '0.3rem', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
      {/* Type + date + status */}
      {[56, 72, 80].map((w, i) => (
        <div key={i} style={{
          height: '1.5rem', width: w, borderRadius: '999px', flexShrink: 0,
          background: 'rgba(255,255,255,0.05)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ))}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading]           = useState(true)
  const [fetchError, setFetchError]     = useState(null)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const data = await getStudentApplications()
      setApplications(data.data ?? [])
    } catch {
      setFetchError('Failed to load your applications. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchApplications() }, [fetchApplications])

  // Derived counts for the summary line
  const pendingCount  = applications.filter((a) => a.status === 'pending').length
  const acceptedCount = applications.filter((a) => a.status === 'accepted').length

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{
          fontSize: '1.625rem', fontWeight: 700,
          color: 'var(--text-primary)', marginBottom: '0.3rem',
        }}>
          My Applications
        </h1>
        {!loading && !fetchError && applications.length > 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {applications.length} application{applications.length !== 1 ? 's' : ''}
            {pendingCount > 0 && ` · ${pendingCount} awaiting review`}
            {acceptedCount > 0 && (
              <span style={{ color: '#34d399', fontWeight: 500 }}>
                {' '}· {acceptedCount} accepted 🎉
              </span>
            )}
          </p>
        )}
      </div>

      {/* ── Fetch error ─────────────────────────────────────────────────────── */}
      {fetchError && (
        <div
          className="alert-error"
          style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        >
          <span>⚠ {fetchError}</span>
          <button
            onClick={fetchApplications}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: 'inherit', textDecoration: 'underline',
              cursor: 'pointer', fontSize: 'inherit', padding: 0,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Loading skeletons ────────────────────────────────────────────────── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3, 4].map((n) => <SkeletonRow key={n} />)}
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {!loading && !fetchError && applications.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '5rem 2rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '1rem',
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>🗂️</div>
          <h2 style={{
            color: 'var(--text-primary)', fontWeight: 700,
            fontSize: '1.1rem', marginBottom: '0.625rem',
          }}>
            No applications yet
          </h2>
          <p style={{
            color: 'var(--text-muted)', fontSize: '0.9rem',
            maxWidth: '380px', margin: '0 auto 1.75rem',
            lineHeight: 1.65,
          }}>
            Start browsing open internships and apply to roles that excite you.
            Your application history will appear here.
          </p>
          <Link
            to="/student/internships"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem', borderRadius: '0.625rem',
              background: 'var(--accent)', color: '#fff',
              fontSize: '0.9rem', fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background  = 'var(--accent-hover, #4f46e5)'
              e.currentTarget.style.transform   = 'translateY(-1px)'
              e.currentTarget.style.boxShadow   = '0 6px 20px rgba(99,102,241,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent)'
              e.currentTarget.style.transform  = 'translateY(0)'
              e.currentTarget.style.boxShadow  = 'none'
            }}
          >
            🔍 Browse Internships
          </Link>
        </div>
      )}

      {/* ── Application list ─────────────────────────────────────────────────── */}
      {!loading && applications.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {applications.map((application) => (
            <ApplicationRow key={application.id} application={application} />
          ))}
        </div>
      )}
    </div>
  )
}

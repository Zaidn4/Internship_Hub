import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getInternship }           from '../../services/internshipService'
import { getApplications, updateApplicationStatus } from '../../services/applicationService'
import Toast from '../../components/common/Toast'

// ── Status badge config ──────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:  { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', border: 'rgba(251,191,36,0.3)',  label: 'Pending'  },
  accepted: { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', border: 'rgba(52,211,153,0.3)',  label: 'Accepted' },
  rejected: { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.3)', label: 'Rejected' },
}

// ── ApplicantRow sub-component ───────────────────────────────────────────────
function ApplicantRow({ application, onStatusChange }) {
  const [acting, setActing] = useState(null) // 'accepted' | 'rejected' | null

  const { student, status, cv_path, applied_at, id } = application

  const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES.pending

  const appliedDate = applied_at
    ? new Date(applied_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—'

  // Initials avatar from student name
  const initials = student?.name
    ? student.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const handleAction = async (newStatus) => {
    setActing(newStatus)
    try {
      await onStatusChange(id, newStatus)
    } finally {
      setActing(null)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem 1.25rem',
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
        transition: 'border-color 0.2s ease',
        flexWrap: 'wrap',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      {/* ── Avatar ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
          background: student?.avatar_url ? 'transparent' : 'rgba(99,102,241,0.15)',
          border: '1px solid rgba(99,102,241,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent)',
          overflow: 'hidden',
        }}
      >
        {student?.avatar_url ? (
          <img
            src={student.avatar_url}
            alt={student.name ?? 'Applicant'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          initials
        )}
      </div>

      {/* ── Student info ─────────────────────────────────────────────────────── */}
      <div style={{ flex: '1 1 180px', minWidth: 0 }}>
        <p style={{
          color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {student?.name ?? 'Unknown Student'}
        </p>
        <p style={{
          color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.15rem',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {student?.email}
        </p>
      </div>

      {/* ── University ──────────────────────────────────────────────────────── */}
      <div style={{ flex: '1 1 140px', minWidth: 0 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>University</p>
        <p style={{
          color: 'var(--text-subtle, #a1a1b5)', fontSize: '0.8125rem', fontWeight: 500,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {student?.university ?? '—'}
        </p>
      </div>

      {/* ── Applied date ────────────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Applied</p>
        <p style={{ color: 'var(--text-subtle, #a1a1b5)', fontSize: '0.8125rem', fontWeight: 500 }}>
          {appliedDate}
        </p>
      </div>

      {/* ── Status badge ────────────────────────────────────────────────────── */}
      <span
        style={{
          flexShrink: 0,
          padding: '0.275rem 0.75rem', borderRadius: '999px',
          fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
          background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`,
        }}
      >
        {statusStyle.label}
      </span>

      {/* ── CV link ─────────────────────────────────────────────────────────── */}
      {cv_path ? (
        <a
          href={`http://localhost:8000/storage/${cv_path}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flexShrink: 0,
            padding: '0.375rem 0.75rem', borderRadius: '0.45rem',
            border: '1px solid rgba(99,102,241,0.25)',
            background: 'rgba(99,102,241,0.08)', color: 'var(--accent)',
            fontSize: '0.78rem', fontWeight: 500,
            textDecoration: 'none', transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.16)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
        >
          View CV ↗
        </a>
      ) : (
        <span style={{ flexShrink: 0, color: 'var(--text-muted)', fontSize: '0.78rem' }}>No CV</span>
      )}

      {/* ── Accept / Reject actions (pending only) ───────────────────────────── */}
      {status === 'pending' && (
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          {/* Accept */}
          <button
            onClick={() => handleAction('accepted')}
            disabled={acting !== null}
            style={{
              padding: '0.375rem 0.875rem', borderRadius: '0.45rem', border: 'none',
              background: acting === 'accepted' ? 'rgba(52,211,153,0.2)' : 'rgba(52,211,153,0.1)',
              color: '#34d399',
              fontSize: '0.8rem', fontWeight: 600,
              cursor: acting !== null ? 'wait' : 'pointer',
              opacity: acting !== null && acting !== 'accepted' ? 0.45 : 1,
              transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', gap: '0.375rem',
            }}
            onMouseEnter={(e) => { if (!acting) e.currentTarget.style.background = 'rgba(52,211,153,0.2)' }}
            onMouseLeave={(e) => { if (!acting) e.currentTarget.style.background = 'rgba(52,211,153,0.1)' }}
          >
            {acting === 'accepted' && <MiniSpinner color="#34d399" />}
            ✓ Accept
          </button>

          {/* Reject */}
          <button
            onClick={() => handleAction('rejected')}
            disabled={acting !== null}
            style={{
              padding: '0.375rem 0.875rem', borderRadius: '0.45rem', border: 'none',
              background: acting === 'rejected' ? 'rgba(248,113,113,0.2)' : 'rgba(248,113,113,0.08)',
              color: '#f87171',
              fontSize: '0.8rem', fontWeight: 600,
              cursor: acting !== null ? 'wait' : 'pointer',
              opacity: acting !== null && acting !== 'rejected' ? 0.45 : 1,
              transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', gap: '0.375rem',
            }}
            onMouseEnter={(e) => { if (!acting) e.currentTarget.style.background = 'rgba(248,113,113,0.2)' }}
            onMouseLeave={(e) => { if (!acting) e.currentTarget.style.background = 'rgba(248,113,113,0.08)' }}
          >
            {acting === 'rejected' && <MiniSpinner color="#f87171" />}
            ✕ Reject
          </button>
        </div>
      )}
    </div>
  )
}

// Tiny inline spinner for action buttons
function MiniSpinner({ color }) {
  return (
    <span
      style={{
        width: '0.75rem', height: '0.75rem', flexShrink: 0,
        border: `2px solid ${color}33`,
        borderTopColor: color,
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin 0.7s linear infinite',
      }}
    />
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
      <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ height: '0.8rem', width: '140px', borderRadius: '0.3rem', background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '0.7rem', width: '200px', borderRadius: '0.3rem', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
      {[100, 80, 60].map((w, i) => (
        <div key={i} style={{ height: '0.75rem', width: w, borderRadius: '0.3rem', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
      ))}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ViewApplicants() {
  const { id: internshipId } = useParams()

  const [internshipTitle, setInternshipTitle] = useState('')
  const [applications, setApplications]       = useState([])
  const [loading, setLoading]                 = useState(true)
  const [fetchError, setFetchError]           = useState(null)
  const [toast, setToast]                     = useState(null)

  // ── Fetch internship + applications in parallel ───────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const [internshipRes, applicationsRes] = await Promise.all([
        getInternship(internshipId),
        getApplications(internshipId),
      ])
      setInternshipTitle(internshipRes.internship?.title ?? `Internship #${internshipId}`)
      setApplications(applicationsRes.data ?? [])
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        setFetchError('You do not have permission to view applicants for this internship.')
      } else {
        setFetchError('Failed to load applicants. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [internshipId])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Status change handler (optimistic local update) ───────────────────────
  const handleStatusChange = useCallback(async (applicationId, status) => {
    try {
      await updateApplicationStatus(applicationId, status)
      // Optimistically update local state — no refetch needed
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status } : app
        )
      )
      setToast({
        message: `Candidate ${status === 'accepted' ? 'accepted' : 'rejected'} successfully.`,
        type: 'success',
      })
    } catch (err) {
      setToast({
        message: err.response?.data?.message ?? 'Failed to update status. Please try again.',
        type: 'error',
      })
      throw err // Re-throw so ApplicantRow resets its spinner
    }
  }, [])

  // ── Derived stats ─────────────────────────────────────────────────────────
  const pendingCount  = applications.filter((a) => a.status === 'pending').length
  const acceptedCount = applications.filter((a) => a.status === 'accepted').length

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '960px' }}>
      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <Link
        to="/company/internships"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
          color: 'var(--text-muted)', fontSize: '0.8125rem',
          textDecoration: 'none', marginBottom: '1.25rem',
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        ← My Listings
      </Link>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{
          fontSize: '1.5rem', fontWeight: 700,
          color: 'var(--text-primary)', marginBottom: '0.3rem',
          lineHeight: 1.3,
        }}>
          {loading ? 'Loading…' : `Applicants for: ${internshipTitle}`}
        </h1>
        {!loading && !fetchError && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {applications.length} total
            {pendingCount > 0 && ` · ${pendingCount} pending review`}
            {acceptedCount > 0 && ` · ${acceptedCount} accepted`}
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
            onClick={fetchData}
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
          textAlign: 'center', padding: '4rem 2rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '1rem',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.05rem' }}>
            No applications yet
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Students haven't applied to this internship yet. Share the listing to attract candidates.
          </p>
        </div>
      )}

      {/* ── Applicant list ───────────────────────────────────────────────────── */}
      {!loading && applications.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {applications.map((application) => (
            <ApplicantRow
              key={application.id}
              application={application}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

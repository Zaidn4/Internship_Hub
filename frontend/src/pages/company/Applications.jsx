import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllInternships } from '../../services/internshipService'
import { getApplications, updateApplicationStatus } from '../../services/applicationService'
import { useAuth } from '../../context/AuthContext'
import Toast from '../../components/common/Toast'

const STATUS_STYLES = {
  pending:  { bg: '#fffbeb', color: '#d97706', border: '#fde68a',  label: 'Pending'  },
  accepted: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0',  label: 'Accepted' },
  rejected: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca',  label: 'Rejected' },
}

function SkeletonRow() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '1rem 1.25rem',
      background: '#ffffff', border: '1px solid #e2e8f0',
      borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#f1f5f9', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ height: '0.8rem', width: '140px', borderRadius: '0.3rem', background: '#f1f5f9', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '0.7rem', width: '200px', borderRadius: '0.3rem', background: '#f8fafc', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
      {[100, 80].map((w, i) => (
        <div key={i} style={{ height: '0.75rem', width: w, borderRadius: '0.3rem', background: '#f1f5f9', animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
      ))}
    </div>
  )
}

export default function CompanyApplications() {
  const { user } = useAuth()
  const companyId = user?.profile?.id

  const [applications, setApplications] = useState([])   // { internship, application }[]
  const [loading, setLoading]           = useState(true)
  const [fetchError, setFetchError]     = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [toast, setToast]               = useState(null)

  // ── Fetch all company's internships, then all their applications ──────────────
  const fetchAll = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    setFetchError(null)
    try {
      // 1. Get all internships → filter to this company's
      let allInternships = []
      let page = 1, lastPage = 1
      do {
        const data = await getAllInternships(page)
        allInternships = [...allInternships, ...data.data]
        lastPage = data.meta?.last_page ?? 1
        page++
      } while (page <= lastPage)

      const myInternships = allInternships.filter((i) => i.company?.id === companyId)

      // 2. For each internship, fetch its applications (in parallel)
      const results = await Promise.all(
        myInternships.map(async (internship) => {
          try {
            const res = await getApplications(internship.id)
            return (res.data ?? []).map((application) => ({ internship, application }))
          } catch {
            return []
          }
        })
      )

      setApplications(results.flat())
    } catch {
      setFetchError('Failed to load applications. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Status update ─────────────────────────────────────────────────────────────
  const handleStatusChange = useCallback(async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus(applicationId, newStatus)
      setApplications((prev) =>
        prev.map((item) =>
          item.application.id === applicationId
            ? { ...item, application: { ...item.application, status: newStatus } }
            : item
        )
      )
      setToast({ message: `Candidate ${newStatus === 'accepted' ? 'accepted' : 'rejected'} successfully.`, type: 'success' })
    } catch (err) {
      setToast({ message: err.response?.data?.message ?? 'Failed to update status.', type: 'error' })
    }
  }, [])

  // ── Filtered view ─────────────────────────────────────────────────────────────
  const filtered = filterStatus === 'all'
    ? applications
    : applications.filter((item) => item.application.status === filterStatus)

  const counts = {
    all:      applications.length,
    pending:  applications.filter((i) => i.application.status === 'pending').length,
    accepted: applications.filter((i) => i.application.status === 'accepted').length,
    rejected: applications.filter((i) => i.application.status === 'rejected').length,
  }

  return (
    <div style={{ maxWidth: '960px' }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
          Applications Received
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          {loading ? 'Loading…' : `${counts.all} total · ${counts.pending} pending · ${counts.accepted} accepted`}
        </p>
      </div>

      {/* ── Status filter tabs ─────────────────────────────────────────────── */}
      {!loading && !fetchError && (
        <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {(['all', 'pending', 'accepted', 'rejected']).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '0.4rem 1rem', borderRadius: '999px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500,
                border: filterStatus === status ? '1px solid #c7d2fe' : '1px solid #e2e8f0',
                background: filterStatus === status ? '#eef2ff' : '#ffffff',
                color: filterStatus === status ? '#4f46e5' : '#64748b',
                transition: 'all 0.15s ease',
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({counts[status]})
            </button>
          ))}
        </div>
      )}

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {fetchError && (
        <div className="alert-error" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>⚠ {fetchError}</span>
          <button onClick={fetchAll} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}>
            Retry
          </button>
        </div>
      )}

      {/* ── Loading ────────────────────────────────────────────────────────── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1,2,3,4].map((n) => <SkeletonRow key={n} />)}
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {!loading && !fetchError && filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: '#ffffff', border: '1px dashed #cbd5e1',
          borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h2 style={{ color: '#0f172a', fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.05rem' }}>
            {filterStatus === 'all' ? 'No applications yet' : `No ${filterStatus} applications`}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {filterStatus === 'all'
              ? 'Students haven\'t applied to your listings yet.'
              : 'Try switching to a different filter above.'}
          </p>
        </div>
      )}

      {/* ── Application rows ────────────────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(({ internship, application }) => {
            const s = STATUS_STYLES[application.status] ?? STATUS_STYLES.pending
            const initials = application.student?.name
              ? application.student.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
              : '?'
            const appliedDate = application.applied_at
              ? new Date(application.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'

            return (
              <div
                key={application.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem 1.25rem', flexWrap: 'wrap',
                  background: '#ffffff', border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.07)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)')}
              >
                {/* Avatar */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                  background: application.student?.avatar_url ? 'transparent' : '#eef2ff',
                  border: '1px solid #c7d2fe',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8125rem', fontWeight: 700, color: '#4f46e5',
                  overflow: 'hidden',
                }}>
                  {application.student?.avatar_url ? (
                    <img
                      src={application.student.avatar_url}
                      alt={application.student.name ?? 'Applicant'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    initials
                  )}
                </div>

                {/* Student info */}
                <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                  <p style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {application.student?.name ?? 'Unknown'}
                  </p>
                  <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {application.student?.email}
                  </p>
                </div>

                {/* Internship */}
                <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                  <p style={{ color: '#64748b', fontSize: '0.72rem' }}>Position</p>
                  <Link
                    to={`/company/internships/${internship.id}/applicants`}
                    style={{ color: '#4f46e5', fontSize: '0.8125rem', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}
                  >
                    {internship.title} ↗
                  </Link>
                </div>

                {/* Date */}
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <p style={{ color: '#64748b', fontSize: '0.72rem' }}>Applied</p>
                  <p style={{ color: '#475569', fontSize: '0.8125rem', fontWeight: 500 }}>{appliedDate}</p>
                </div>

                {/* Status badge */}
                <span style={{
                  flexShrink: 0, padding: '0.25rem 0.75rem', borderRadius: '999px',
                  fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
                  background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                }}>
                  {s.label}
                </span>

                {/* Actions for pending */}
                {application.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleStatusChange(application.id, 'accepted')}
                      style={{
                        padding: '0.35rem 0.75rem', borderRadius: '0.45rem',
                        border: '1px solid #a7f3d0', background: '#ecfdf5', color: '#059669',
                        fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#d1fae5' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#ecfdf5' }}
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => handleStatusChange(application.id, 'rejected')}
                      style={{
                        padding: '0.35rem 0.75rem', borderRadius: '0.45rem',
                        border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626',
                        fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2' }}
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

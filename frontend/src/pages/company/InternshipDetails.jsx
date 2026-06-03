import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getInternship } from '../../services/internshipService'
import DiscussionSection from '../../components/internships/DiscussionSection'

const TYPE_STYLES = {
  'remote':  { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', border: 'rgba(52,211,153,0.25)',  label: 'Remote'  },
  'on-site': { bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa', border: 'rgba(96,165,250,0.25)',  label: 'On-site' },
  'hybrid':  { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: 'rgba(167,139,250,0.25)', label: 'Hybrid'  },
}

export default function CompanyInternshipDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [internship, setInternship] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDetails = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getInternship(id)
      setInternship(data.data) // data wrapper from InternshipResource
    } catch (err) {
      setError('Failed to load internship details.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="spinner" style={{ width: '2rem', height: '2rem' }} />
      </div>
    )
  }

  if (error || !internship) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="alert-error flex items-center justify-between">
          <span>⚠ {error || 'Internship not found.'}</span>
          <button onClick={() => navigate(-1)} className="text-sm font-medium underline">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const typeStyle = TYPE_STYLES[internship.type] ?? TYPE_STYLES['hybrid']
  const deadline = internship.deadline
    ? new Date(internship.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null
  const isPastDeadline = internship.deadline && new Date(internship.deadline) < new Date()

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* ── Back Navigation ────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate('/company/dashboard')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500,
          marginBottom: '1.5rem', transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        ← Back to Dashboard
      </button>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* ── Main Content Area ────────────────────────────────────────────── */}
        <div style={{ flex: '1 1 600px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Header Card */}
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem',
            padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {/* Company Avatar */}
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
                background: internship.company?.avatar_url ? 'transparent' : 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)',
                overflow: 'hidden',
              }}>
                {internship.company?.avatar_url ? (
                  <img src={internship.company.avatar_url} alt={internship.company.company_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (internship.company?.company_name ?? 'C').charAt(0).toUpperCase()
                )}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.2, margin: '0 0 0.4rem 0' }}>
                  {internship.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>
                    {internship.company?.company_name ?? 'Unknown Company'}
                  </span>
                </div>
              </div>
            </div>

            {/* Meta tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <span style={{
                padding: '0.35rem 0.75rem', borderRadius: '999px',
                fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
                background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}`,
              }}>
                {typeStyle.label}
              </span>
              {internship.location && (
                <MetaChip icon="📍" text={internship.location} />
              )}
              {deadline && (
                <MetaChip icon="📅" text={`Deadline: ${deadline}`} color={isPastDeadline ? 'var(--error, #f87171)' : 'var(--text-muted)'} />
              )}
              {internship.salary && (
                <MetaChip icon="💰" text={`$${Number(internship.salary).toLocaleString()} / mo`} />
              )}
            </div>
          </div>

          {/* Description Card */}
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem',
            padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              About this Role
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
              {internship.description}
            </div>
          </div>

          {/* Discussion Section */}
          <DiscussionSection internshipId={internship.id} internship={internship} />
        </div>

        {/* ── Sidebar ────────────────────────────────────────────────────────── */}
        <div style={{ flex: '0 1 320px', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '1.5rem' }}>
          
          {/* Action Card */}
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem',
            padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Company View
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
              This is the public listing view. You can see comments left by students below and reply directly.
            </p>
          </div>

          {/* Skills Card */}
          {internship.skills?.length > 0 && (
            <div style={{
              background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem',
              padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
                Required Skills
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {internship.skills.map(skill => (
                  <span key={skill.id} style={{
                    padding: '0.35rem 0.75rem', borderRadius: '0.5rem',
                    background: 'rgba(99,102,241,0.06)', color: 'var(--accent)',
                    border: '1px solid rgba(99,102,241,0.15)',
                    fontSize: '0.8125rem', fontWeight: 500,
                  }}>
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function MetaChip({ icon, text, color = 'var(--text-muted)' }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color, fontWeight: 500 }}>
      <span style={{ opacity: 0.8 }}>{icon}</span>
      {text}
    </span>
  )
}

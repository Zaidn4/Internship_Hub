import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getInternship, applyToInternship, getSavedInternshipIds, toggleSavedInternship } from '../../services/internshipService'
import Toast from '../../components/common/Toast'
import DiscussionSection from '../../components/internships/DiscussionSection'

const TYPE_STYLES = {
  'remote':  { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', border: 'rgba(52,211,153,0.25)' },
  'on-site': { bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa', border: 'rgba(96,165,250,0.25)' },
  'hybrid':  { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: 'rgba(167,139,250,0.25)' },
}

export default function InternshipDetails() {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()

  const [internship, setInternship] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [toast, setToast] = useState(null)

  const fetchDetails = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [data, savedData] = await Promise.all([
        getInternship(id),
        getSavedInternshipIds()
      ])
      setInternship(data.data) // data wrapper from InternshipResource
      setIsSaved(savedData.saved_ids.includes(Number(id)))
    } catch (err) {
      setError(t('internshipDetails.messages.loadError'))
    } finally {
      setLoading(false)
    }
  }, [id, t])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  const handleApply = async () => {
    if (applying || applied || !internship) return
    setApplying(true)
    try {
      await applyToInternship(internship.id)
      setApplied(true)
      setToast({ message: t('internshipDetails.messages.applySuccess'), type: 'success' })
    } catch (err) {
      if (err.response?.status === 409) {
        setApplied(true)
        setToast({ message: t('internshipDetails.messages.alreadyApplied'), type: 'info' })
      } else {
        setToast({ message: err.response?.data?.message ?? t('internshipDetails.messages.applyError'), type: 'error' })
      }
    } finally {
      setApplying(false)
    }
  }

  const handleToggleSave = async () => {
    // Optimistic UI update
    const previousState = isSaved
    setIsSaved(!isSaved)

    try {
      await toggleSavedInternship(internship.id)
    } catch (err) {
      // Revert on error
      setIsSaved(previousState)
      setToast({ message: t('internshipDetails.messages.saveError'), type: 'error' })
    }
  }

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
          <span>{error || t('internshipDetails.messages.notFound')}</span>
          <button onClick={() => navigate(-1)} className="text-sm font-medium underline">
            {t('internshipDetails.buttons.goBack')}
          </button>
        </div>
      </div>
    )
  }

  const typeStyle = TYPE_STYLES[internship.type] ?? TYPE_STYLES['hybrid']
  const typeLabel = t(`internshipDetails.type.${internship.type}`, { defaultValue: t('internshipDetails.type.hybrid') })
  const deadline = internship.deadline
    ? new Date(internship.deadline).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })
    : null
  const isPastDeadline = internship.deadline && new Date(internship.deadline) < new Date()

  const applyBtnStyle = applied
    ? { bg: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', label: t('internshipDetails.buttons.applied'), cursor: 'default' }
    : isPastDeadline
      ? { bg: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)', label: t('internshipDetails.buttons.closed'), cursor: 'not-allowed' }
      : applying
        ? { bg: 'rgba(99,102,241,0.15)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,0.3)', label: t('internshipDetails.buttons.applying'), cursor: 'wait' }
        : { bg: 'var(--accent)', color: '#ffffff', border: '1px solid var(--accent)', label: t('internshipDetails.buttons.apply'), cursor: 'pointer' }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* ── Back Navigation ────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate('/student/internships')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500,
          marginBottom: '1.5rem', transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        {t('internshipDetails.buttons.backToBoard')}
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
                    {internship.company?.company_name ?? t('internshipDetails.company.unknown')}
                  </span>
                  {internship.company?.website && (
                    <>
                      <span style={{ color: 'var(--border)' }}>|</span>
                      <a href={internship.company.website} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: '0.875rem', textDecoration: 'none' }}>
                        {t('internshipDetails.company.visitWebsite')}
                      </a>
                    </>
                  )}
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
                {typeLabel}
              </span>
              {internship.location && (
                <MetaChip icon="📍" text={internship.location} />
              )}
              {deadline && (
                <MetaChip icon="📅" text={t('internshipDetails.meta.deadline', { date: deadline })} color={isPastDeadline ? 'var(--error, #f87171)' : 'var(--text-muted)'} />
              )}
              {internship.salary && (
                <MetaChip icon="💰" text={t('internshipDetails.meta.perMonth', { amount: Number(internship.salary).toLocaleString() })} />
              )}
            </div>
          </div>

          {/* Description Card */}
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem',
            padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              {t('internshipDetails.sections.about')}
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
            <button
              onClick={handleToggleSave}
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: '0.625rem',
                border: isSaved ? '1px solid var(--accent)' : '1px solid #cbd5e1', 
                background: isSaved ? 'rgba(99,102,241,0.1)' : 'transparent', 
                color: isSaved ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                marginBottom: '0.75rem',
              }}
              onMouseEnter={(e) => {
                if (!isSaved) {
                  e.currentTarget.style.background = '#f8fafc'
                  e.currentTarget.style.color = '#334155'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaved) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-muted)'
                }
              }}
            >
              {isSaved ? t('internshipDetails.buttons.saved') : t('internshipDetails.buttons.saveForLater')}
            </button>

            <button
              onClick={handleApply}
              disabled={applying || applied || isPastDeadline}
              style={{
                width: '100%', padding: '0.85rem 1rem', borderRadius: '0.625rem',
                border: applyBtnStyle.border, background: applyBtnStyle.bg, color: applyBtnStyle.color,
                fontSize: '0.9375rem', fontWeight: 600, cursor: applyBtnStyle.cursor,
                transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                if (!applying && !applied && !isPastDeadline) {
                  e.currentTarget.style.background = 'var(--accent-hover, #4f46e5)'
                  e.currentTarget.style.transform  = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow  = '0 6px 20px rgba(99,102,241,0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (!applying && !applied && !isPastDeadline) {
                  e.currentTarget.style.background = applyBtnStyle.bg
                  e.currentTarget.style.transform  = 'translateY(0)'
                  e.currentTarget.style.boxShadow  = 'none'
                }
              }}
            >
              {applying && (
                <span style={{
                  width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#ffffff', borderRadius: '50%',
                  display: 'inline-block', animation: 'spin 0.7s linear infinite', flexShrink: 0,
                }} />
              )}
              {applyBtnStyle.label}
            </button>
            
            {isPastDeadline && (
              <p style={{ color: 'var(--error, #f87171)', fontSize: '0.8125rem', textAlign: 'center', marginTop: '0.75rem', fontWeight: 500 }}>
                {t('internshipDetails.messages.applicationsClosed')}
              </p>
            )}
            {applied && (
              <p style={{ color: '#34d399', fontSize: '0.8125rem', textAlign: 'center', marginTop: '0.75rem', fontWeight: 500 }}>
                {t('internshipDetails.messages.appliedSuccessMsg')}
              </p>
            )}
          </div>

          {/* Skills Card */}
          {internship.skills?.length > 0 && (
            <div style={{
              background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem',
              padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
                {t('internshipDetails.sections.skills')}
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

      <Toast toast={toast} onDismiss={() => setToast(null)} />
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

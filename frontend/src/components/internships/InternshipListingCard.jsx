import { useState } from 'react'
import { Link } from 'react-router-dom'

const TYPE_STYLES = {
  'remote':  { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', border: 'rgba(52,211,153,0.25)',  label: 'Remote'  },
  'on-site': { bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa', border: 'rgba(96,165,250,0.25)',  label: 'On-site' },
  'hybrid':  { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: 'rgba(167,139,250,0.25)', label: 'Hybrid'  },
}

/**
 * InternshipListingCard — student-facing card variant.
 *
 * Props:
 *   internship  — internship object from the API (includes nested company)
 *   onApply(id) — async fn called when student clicks Apply Now;
 *                 resolves on success, throws on error so the card
 *                 can manage its own button state independently.
 *   alreadyApplied — boolean — pre-sets the Applied ✓ state on mount
 */
export default function InternshipListingCard({
  internship,
  onApply,
  alreadyApplied = false,
  isSaved = false,
  onToggleSave
}) {
  const [applying, setApplying] = useState(false)
  const [applied, setApplied]   = useState(alreadyApplied)

  const typeStyle = TYPE_STYLES[internship.type] ?? TYPE_STYLES['hybrid']

  const deadline = internship.deadline
    ? new Date(internship.deadline).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : null

  const isPastDeadline = internship.deadline && new Date(internship.deadline) < new Date()

  const handleApply = async () => {
    if (applying || applied || isPastDeadline) return
    setApplying(true)
    try {
      await onApply(internship.id)
      setApplied(true)
    } finally {
      setApplying(false)
    }
  }

  // Determine apply button appearance
  const applyBtnStyle = applied
    ? { bg: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', label: 'Applied ✓', cursor: 'default' }
    : isPastDeadline
      ? { bg: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)', label: 'Closed', cursor: 'not-allowed' }
      : applying
        ? { bg: 'rgba(99,102,241,0.15)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,0.3)', label: 'Applying…', cursor: 'wait' }
        : { bg: 'rgba(99,102,241,0.12)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,0.25)', label: 'Apply Now', cursor: 'pointer' }

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${applied ? 'rgba(52,211,153,0.2)' : 'var(--border)'}`,
        borderRadius: '0.875rem',
        padding: '1.375rem',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: '0.875rem',
        transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!applied) {
          e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'
          e.currentTarget.style.transform   = 'translateY(-2px)'
          e.currentTarget.style.boxShadow   = '0 8px 32px rgba(0,0,0,0.2)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = applied ? 'rgba(52,211,153,0.2)' : 'var(--border)'
        e.currentTarget.style.transform   = 'translateY(0)'
        e.currentTarget.style.boxShadow   = 'none'
      }}
    >
      {/* ── Company + type badge row ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', minWidth: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '0.5rem',
              flexShrink: 0,
              background: internship.company?.avatar_url ? 'transparent' : 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--accent)',
              overflow: 'hidden',
            }}
          >
            {internship.company?.avatar_url ? (
              <img
                src={internship.company.avatar_url}
                alt={internship.company.company_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              (internship.company?.company_name ?? 'C').charAt(0).toUpperCase()
            )}
          </div>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              margin: 0,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {internship.company?.company_name ?? 'Unknown Company'}
          </p>
        </div>

        <span
          style={{
            padding: '0.2rem 0.6rem', borderRadius: '999px', flexShrink: 0,
            fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
            background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}`,
          }}
        >
          {typeStyle.label}
        </span>
      </div>

      {/* ── Title ──────────────────────────────────────────────────────────── */}
      <h3
        style={{
          color: 'var(--text-primary)', fontWeight: 700,
          fontSize: '1.0625rem', lineHeight: 1.35, margin: 0,
        }}
      >
        {internship.title}
      </h3>

      {/* ── Description excerpt ──────────────────────────────────────────── */}
      <p
        style={{
          color: 'var(--text-muted)', fontSize: '0.8125rem', lineHeight: 1.65,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          margin: 0,
        }}
      >
        {internship.description}
      </p>

      {/* ── Meta chips ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {internship.location && (
          <MetaChip icon="📍" text={internship.location} />
        )}
        {deadline && (
          <MetaChip
            icon="📅"
            text={deadline}
            color={isPastDeadline ? 'var(--error, #f87171)' : 'var(--text-muted)'}
          />
        )}
        {internship.salary && (
          <MetaChip icon="💰" text={`$${Number(internship.salary).toLocaleString()}/mo`} />
        )}
      </div>

      {/* ── Skills tags ────────────────────────────────────────────── */}
      {internship.skills?.length > 0 && (
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
          {internship.skills.slice(0, 3).map((skill) => (
            <span
              key={skill.id}
              style={{
                padding: '0.2rem 0.6rem', borderRadius: '0.375rem',
                fontSize: '0.7rem', fontWeight: 500,
                background: 'rgba(99,102,241,0.09)',
                color: 'var(--accent)',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              {skill.name}
            </span>
          ))}
          {internship.skills.length > 3 && (
            <span
              style={{
                padding: '0.2rem 0.6rem', borderRadius: '0.375rem',
                fontSize: '0.7rem', fontWeight: 600,
                background: 'rgba(99,102,241,0.15)',
                color: 'var(--accent)',
                border: '1px solid rgba(99,102,241,0.25)',
              }}
            >
              +{internship.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* ── Action buttons ─────────────────────────────────────────────────── */}
      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Link
          to={`/student/internships/${internship.id}`}
          style={{
            flex: 1,
            padding: '0.65rem 0',
            borderRadius: '0.55rem',
            border: '1px solid rgba(99,102,241,0.2)',
            background: 'transparent',
            color: 'var(--accent)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(99,102,241,0.06)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          Details
        </Link>

        <button
          id={`apply-btn-${internship.id}`}
          onClick={handleApply}
          disabled={applying || applied || isPastDeadline}
          style={{
            flex: 1,
            padding: '0.65rem 0',
            borderRadius: '0.55rem',
            border: applyBtnStyle.border,
            background: applyBtnStyle.bg,
            color: applyBtnStyle.color,
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: applyBtnStyle.cursor,
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
          }}
          onMouseEnter={(e) => {
            if (!applying && !applied && !isPastDeadline) {
              e.currentTarget.style.background = 'rgba(99,102,241,0.22)'
              e.currentTarget.style.boxShadow  = '0 4px 16px rgba(99,102,241,0.25)'
            }
          }}
          onMouseLeave={(e) => {
            if (!applying && !applied && !isPastDeadline) {
              e.currentTarget.style.background = applyBtnStyle.bg
              e.currentTarget.style.boxShadow  = 'none'
            }
          }}
        >
          {applying && (
            <span
              style={{
                width: '0.75rem', height: '0.75rem',
                border: '2px solid rgba(99,102,241,0.3)',
                borderTopColor: 'var(--accent)',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.7s linear infinite',
                flexShrink: 0,
              }}
            />
          )}
          {applied ? 'Applied' : (isPastDeadline ? 'Closed' : 'Apply')}
        </button>

        {/* Bookmark Button */}
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleSave(internship.id);
            }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '0.55rem',
              background: isSaved ? 'rgba(99,102,241,0.1)' : 'transparent',
              border: isSaved ? '1px solid var(--accent)' : '1px solid var(--border)',
              cursor: 'pointer',
              fontSize: '1.25rem',
              color: isSaved ? 'var(--accent)' : '#cbd5e1',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!isSaved) {
                e.currentTarget.style.background = '#f8fafc'
                e.currentTarget.style.color = '#94a3b8'
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaved) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#cbd5e1'
              }
            }}
            title={isSaved ? "Remove from saved" : "Save for later"}
          >
            {isSaved ? '🔖' : '📑'}
          </button>
        )}
      </div>
    </div>
  )
}

function MetaChip({ icon, text, color = 'var(--text-muted)' }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color }}>
      <span>{icon}</span>
      {text}
    </span>
  )
}

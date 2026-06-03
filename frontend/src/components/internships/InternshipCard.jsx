import { useState } from 'react'
import { Link } from 'react-router-dom'

const TYPE_STYLES = {
  'remote':   { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0',  label: 'Remote'   },
  'on-site':  { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe',  label: 'On-site'  },
  'hybrid':   { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe',  label: 'Hybrid'   },
}

/**
 * InternshipCard — displays a single internship listing.
 *
 * Props:
 *   internship  — the internship object from the API
 *   onDelete(id) — called after the user confirms deletion
 *   onEdit(internship) — called when user clicks Edit (future use)
 */
export default function InternshipCard({ internship, onDelete, onEdit }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting]     = useState(false)

  const typeStyle = TYPE_STYLES[internship.type] ?? TYPE_STYLES['hybrid']

  const deadline = internship.deadline
    ? new Date(internship.deadline).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : null

  const isPastDeadline = internship.deadline && new Date(internship.deadline) < new Date()

  const handleDeleteClick = () => {
    if (!confirming) { setConfirming(true); return }
    // Second click = confirmed
    setDeleting(true)
    onDelete(internship.id).finally(() => {
      setDeleting(false)
      setConfirming(false)
    })
  }

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '0.875rem',
        padding: '1.375rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.09)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Top row — title + type badge */}
      <div className="flex items-start justify-between gap-3">
        <h3
          style={{
            color: 'var(--text-primary)', fontWeight: 600,
            fontSize: '1rem', lineHeight: 1.4, flex: 1,
          }}
        >
          {internship.title}
        </h3>
        <span
          style={{
            padding: '0.25rem 0.625rem', borderRadius: '999px', flexShrink: 0,
            fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em',
            textTransform: 'uppercase',
            background: typeStyle.bg, color: typeStyle.color,
            border: `1px solid ${typeStyle.border}`,
          }}
        >
          {typeStyle.label}
        </span>
      </div>

      {/* Description excerpt */}
      <p
        style={{
          color: 'var(--text-muted)', fontSize: '0.8125rem', lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}
      >
        {internship.description}
      </p>

      {/* Meta row */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {internship.location && (
          <MetaChip icon="📍" text={internship.location} />
        )}
        {deadline && (
          <MetaChip
            icon="📅"
            text={deadline}
            color={isPastDeadline ? 'var(--error)' : 'var(--text-muted)'}
          />
        )}
        {internship.salary && (
          <MetaChip icon="💰" text={`$${Number(internship.salary).toLocaleString()}/mo`} />
        )}
      </div>

      {/* Skills */}
      {internship.skills?.length > 0 && (
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {internship.skills.slice(0, 3).map((skill) => (
            <span
              key={skill.id}
              style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '0.375rem',
                fontSize: '0.7rem', fontWeight: 500,
                background: '#eef2ff',
                color: '#4f46e5',
                border: '1px solid #c7d2fe',
              }}
            >
              {skill.name}
            </span>
          ))}
          {internship.skills.length > 3 && (
            <span
              style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '0.375rem',
                fontSize: '0.7rem', fontWeight: 600,
                background: '#e0e7ff',
                color: '#4338ca',
                border: '1px solid #a5b4fc',
              }}
            >
              +{internship.skills.length - 3}
            </span>
          )}
        </div>
      )}


      {/* Action bar */}
      <div className="flex flex-wrap gap-2 items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
        {/* Details — secondary CTA */}
        <Link
          to={`/company/internships/${internship.id}`}
          style={{
            padding: '0.375rem 0.75rem', borderRadius: '0.45rem',
            border: '1px solid var(--border)',
            background: 'var(--bg-page)', color: 'var(--text-subtle)',
            fontSize: '0.75rem', fontWeight: 500,
            textDecoration: 'none', transition: 'all 0.15s ease',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0' }}
        >
          👁 Details
        </Link>

        {/* View Applicants — primary CTA */}
        <Link
          to={`/company/internships/${internship.id}/applicants`}
          style={{
            padding: '0.375rem 0.75rem', borderRadius: '0.45rem',
            border: '1px solid rgba(99,102,241,0.25)',
            background: 'rgba(99,102,241,0.1)', color: 'var(--accent)',
            fontSize: '0.75rem', fontWeight: 600,
            textDecoration: 'none', transition: 'all 0.15s ease',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)';  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)' }}
        >
          👥 Applicants
        </Link>

        <button
          onClick={() => onEdit(internship)}
          style={{
            padding: '0.375rem 0.75rem', borderRadius: '0.45rem',
            border: '1px solid #bfdbfe',
            background: '#eff6ff', color: '#2563eb',
            fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.borderColor = '#93c5fd' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe' }}
        >
          Edit
        </button>

        {/* Delete — two-step confirm */}
        <button
          onClick={handleDeleteClick}
          disabled={deleting}
          style={{
            padding: '0.375rem 0.75rem', borderRadius: '0.45rem',
            border: confirming ? '1px solid #fca5a5' : '1px solid #fecaca',
            background: confirming ? '#fee2e2' : '#fef2f2',
            color: '#dc2626',
            fontSize: '0.75rem', fontWeight: confirming ? 600 : 500,
            cursor: deleting ? 'not-allowed' : 'pointer',
            opacity: deleting ? 0.6 : 1,
            transition: 'all 0.15s ease',
            minWidth: '80px',
          }}
          onMouseEnter={(e) => { if (!deleting) { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5' } }}
          onMouseLeave={(e) => { if (!deleting) { e.currentTarget.style.background = confirming ? '#fee2e2' : '#fef2f2'; e.currentTarget.style.borderColor = confirming ? '#fca5a5' : '#fecaca' } }}
        >
          {deleting ? '…' : confirming ? 'Yes, delete' : 'Delete'}
        </button>

        {/* Cancel confirm */}
        {confirming && !deleting && (
          <button
            onClick={() => setConfirming(false)}
            style={{
              padding: '0.375rem 0.75rem', borderRadius: '0.45rem',
              border: '1px solid #e2e8f0',
              background: '#f8fafc', color: '#64748b',
              fontSize: '0.75rem', cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0' }}
          >
            Cancel
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

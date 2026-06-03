/**
 * ConfirmationModal
 *
 * A reusable, premium confirmation dialog with a dark backdrop.
 *
 * Props:
 *   isOpen    — controls visibility
 *   onClose   — called when backdrop or Cancel is clicked
 *   onConfirm — called when the destructive action button is clicked
 *   title     — bold heading text
 *   message   — supporting body text
 *   confirmLabel — text for the confirm button (default "Delete")
 */
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
}) {
  if (!isOpen) return null

  return (
    /* ── Backdrop ───────────────────────────────────────────────────────── */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          padding: '2rem',
          width: '100%',
          maxWidth: '420px',
          margin: '1rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.12)',
          animation: 'modalPop 0.18s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Icon */}
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: '#fef2f2', border: '1px solid #fecaca',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', marginBottom: '1.25rem',
        }}>
          🗑️
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.0625rem', fontWeight: 800, color: '#0f172a',
          marginBottom: '0.5rem', letterSpacing: '-0.01em',
        }}>
          {title}
        </h3>

        {/* Message */}
        <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.75rem' }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          {/* Cancel */}
          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.375rem',
              borderRadius: '0.625rem',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#475569',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0' }}
          >
            Cancel
          </button>

          {/* Confirm (destructive) */}
          <button
            onClick={onConfirm}
            style={{
              padding: '0.6rem 1.375rem',
              borderRadius: '0.625rem',
              border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(220,38,38,0.35)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(220,38,38,0.45)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(220,38,38,0.35)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      {/* Pop-in keyframe injected once */}
      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  )
}

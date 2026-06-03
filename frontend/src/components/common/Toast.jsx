import { useEffect } from 'react'

const TOAST_STYLES = {
  success: {
    border:     '1px solid #bbf7d0',
    borderLeft: '4px solid #059669',
    iconColor:  '#059669',
    icon:       '✓',
  },
  warning: {
    border:     '1px solid #fde68a',
    borderLeft: '4px solid #d97706',
    iconColor:  '#d97706',
    icon:       '⚠',
  },
  error: {
    border:     '1px solid #fecaca',
    borderLeft: '4px solid #dc2626',
    iconColor:  '#dc2626',
    icon:       '⚠',
  },
}

/**
 * Shared Toast notification component.
 *
 * Props:
 *   toast      — { message: string, type: 'success' | 'warning' | 'error' } | null
 *   onDismiss  — () => void  called when auto-dismiss fires
 *
 * Dismisses automatically after 3.5 s. Renders nothing when toast is null.
 */
export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [toast, onDismiss])

  if (!toast) return null

  const s = TOAST_STYLES[toast.type] ?? TOAST_STYLES.success

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.75rem',
        zIndex: 300,
        background: '#ffffff',
        border: s.border,
        borderLeft: s.borderLeft,
        borderRadius: '0.625rem',
        padding: '0.875rem 1.25rem',
        color: '#0f172a',
        fontSize: '0.875rem',
        fontWeight: 500,
        maxWidth: '360px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)',
        animation: 'fadeInUp 0.3s cubic-bezier(0.16,1,0.3,1) both',
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        cursor: 'pointer',
      }}
      onClick={onDismiss}
    >
      <span style={{ fontSize: '1rem', flexShrink: 0, color: s.iconColor }}>{s.icon}</span>
      <span>{toast.message}</span>
    </div>
  )
}

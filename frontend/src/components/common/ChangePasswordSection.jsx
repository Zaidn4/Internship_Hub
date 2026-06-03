import { useState } from 'react'
import api from '../../services/api'
import Toast from './Toast'

/**
 * ChangePasswordSection — shared "Security" card for Student and Company profiles.
 *
 * Renders a standalone white card with three password inputs.
 * Calls PUT /api/user/password and shows a success/error toast.
 * Extracted as a shared component so both profile pages stay DRY.
 */
export default function ChangePasswordSection() {
  const [form, setForm] = useState({
    current_password:      '',
    password:              '',
    password_confirmation: '',
  })
  const [errors, setErrors]   = useState({})
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Quick client-side match check before hitting the API
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: ['Passwords do not match.'] })
      return
    }

    setSaving(true)
    setErrors({})

    try {
      await api.put('/user/password', form)
      // Clear the form on success
      setForm({ current_password: '', password: '', password_confirmation: '' })
      setToast({ message: 'Password changed successfully! 🔒', type: 'success' })
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {})
      } else {
        setToast({ message: err.response?.data?.message ?? 'Failed to update password.', type: 'error' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0',
        borderRadius: '1rem', padding: '1.625rem',
        marginBottom: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {/* Section header */}
        <div style={{ marginBottom: '1.375rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem', letterSpacing: '-0.01em' }}>
            Security
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.8125rem' }}>
            Update your password to keep your account secure.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          {/* Current password */}
          <PasswordField
            id="cp-current"
            name="current_password"
            label="Current password"
            value={form.current_password}
            onChange={handleChange}
            error={errors.current_password?.[0]}
            autoComplete="current-password"
          />

          {/* New password */}
          <PasswordField
            id="cp-new"
            name="password"
            label="New password"
            hint="Must be at least 8 characters."
            value={form.password}
            onChange={handleChange}
            error={errors.password?.[0]}
            autoComplete="new-password"
          />

          {/* Confirm new password */}
          <PasswordField
            id="cp-confirm"
            name="password_confirmation"
            label="Confirm new password"
            value={form.password_confirmation}
            onChange={handleChange}
            error={errors.password_confirmation?.[0]}
            autoComplete="new-password"
          />

          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              id="change-password-btn"
              type="submit"
              disabled={saving}
              className="auth-btn"
              style={{ width: 'auto', padding: '0.6875rem 1.75rem' }}
            >
              {saving && <span className="spinner" />}
              {saving ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  )
}

// ── Private sub-component (module-level so it never remounts on parent re-render)
function PasswordField({ id, name, label, hint, value, onChange, error, autoComplete }) {
  return (
    <div>
      <label
        htmlFor={id}
        style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#475569', marginBottom: '0.4rem' }}
      >
        {label}
      </label>
      <input
        id={id}
        type="password"
        name={name}
        value={value}
        onChange={onChange}
        placeholder="••••••••"
        autoComplete={autoComplete}
        className={`auth-input${error ? ' error' : ''}`}
      />
      {hint && !error && (
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>{hint}</p>
      )}
      {error && (
        <p className="field-error" role="alert"><span>✕</span> {error}</p>
      )}
    </div>
  )
}

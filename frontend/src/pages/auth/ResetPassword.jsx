import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../services/api'

export default function ResetPassword() {
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()

  // Extract token + email automatically from the URL
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [form, setForm] = useState({
    password:              '',
    password_confirmation: '',
  })
  const [errors, setErrors]         = useState({})
  const [globalError, setGlobalError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]       = useState(false)

  // Redirect to login after a short delay on success
  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => navigate('/login'), 3000)
    return () => clearTimeout(t)
  }, [success, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
    if (globalError) setGlobalError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic client-side check
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: ['Passwords do not match.'] })
      return
    }

    setSubmitting(true)
    setErrors({})
    setGlobalError('')

    try {
      await api.post('/reset-password', {
        token,
        email,
        password:              form.password,
        password_confirmation: form.password_confirmation,
      })
      setSuccess(true)
    } catch (err) {
      const data = err.response?.data
      if (err.response?.status === 422 && data?.errors) {
        setErrors(data.errors)
      } else {
        setGlobalError(data?.errors?.email?.[0] ?? data?.message ?? 'This reset link is invalid or has expired.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Missing token guard
  if (!token || !email) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>Invalid reset link</h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            This link is missing required parameters. Please request a new one.
          </p>
          <Link to="/forgot-password" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
            Request new link →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
      {/* Soft indigo bloom */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(199,210,254,0.5) 0%, transparent 65%)',
      }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.125rem', boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            }}>◈</div>
            <span style={{ fontWeight: 700, fontSize: '1.125rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
              Internship<span style={{ color: '#4f46e5' }}>Hub</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff', border: '1px solid #e2e8f0',
          borderRadius: '1.25rem', padding: '2.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08)',
        }}>
          {success ? (
            /* ── Success state ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#ecfdf5', border: '2px solid #a7f3d0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', margin: '0 auto 1.25rem',
              }}>
                ✅
              </div>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                Password updated!
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                Your password has been reset successfully. Redirecting you to sign in…
              </p>
              <Link
                to="/login"
                style={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}
              >
                Sign in now →
              </Link>
            </div>
          ) : (
            /* ── Reset form ── */
            <>
              <div style={{ marginBottom: '1.75rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>
                  Set a new password
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Resetting for <strong style={{ color: '#0f172a' }}>{email}</strong>
                </p>
              </div>

              {globalError && (
                <div className="alert-error" role="alert" style={{ marginBottom: '1.25rem' }}>
                  ⚠&nbsp; {globalError}
                  {globalError.includes('expired') || globalError.includes('invalid') ? (
                    <span> — <Link to="/forgot-password" style={{ color: 'inherit', fontWeight: 600 }}>Request a new link</Link></span>
                  ) : null}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                <div>
                  <label htmlFor="reset-password" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#475569', marginBottom: '0.4rem' }}>
                    New password
                  </label>
                  <input
                    id="reset-password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    required
                    className={`auth-input${errors.password ? ' error' : ''}`}
                  />
                  {errors.password && (
                    <p className="field-error" role="alert"><span>✕</span> {errors.password[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="reset-password-confirm" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#475569', marginBottom: '0.4rem' }}>
                    Confirm new password
                  </label>
                  <input
                    id="reset-password-confirm"
                    type="password"
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    className={`auth-input${errors.password_confirmation ? ' error' : ''}`}
                  />
                  {errors.password_confirmation && (
                    <p className="field-error" role="alert"><span>✕</span> {errors.password_confirmation[0]}</p>
                  )}
                </div>

                {/* Password strength hint */}
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '-0.375rem' }}>
                  Must be at least 8 characters.
                </p>

                <button
                  id="reset-submit"
                  type="submit"
                  disabled={submitting}
                  className="auth-btn"
                >
                  {submitting && <span className="spinner" />}
                  {submitting ? 'Updating password…' : 'Reset password'}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b', marginTop: '1.5rem' }}>
                <Link
                  to="/login"
                  style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => (e.target.style.color = '#4338ca')}
                  onMouseLeave={(e) => (e.target.style.color = '#4f46e5')}
                >
                  ← Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

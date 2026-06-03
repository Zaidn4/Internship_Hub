import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function ForgotPassword() {
  const [email, setEmail]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [sent, setSent]             = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post('/forgot-password', { email })
      setSent(true)
    } catch (err) {
      const msg =
        err.response?.data?.errors?.email?.[0] ??
        err.response?.data?.message ??
        'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
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
          {sent ? (
            /* ── Success state ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#ecfdf5', border: '2px solid #a7f3d0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', margin: '0 auto 1.25rem',
              }}>
                ✉️
              </div>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                Check your inbox
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                If an account exists for <strong style={{ color: '#0f172a' }}>{email}</strong>, we've sent a password reset link.
                Check your email (and spam folder) — the link expires in 60 minutes.
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                📋 <strong>Local dev tip:</strong> The link is in{' '}
                <code style={{ background: '#f1f5f9', padding: '0.1rem 0.35rem', borderRadius: '0.3rem', fontSize: '0.78rem', color: '#4f46e5' }}>
                  backend/storage/logs/laravel.log
                </code>
              </p>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  color: '#4f46e5', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#4338ca')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#4f46e5')}
              >
                ← Back to sign in
              </Link>
            </div>
          ) : (
            /* ── Request form ── */
            <>
              <div style={{ marginBottom: '1.75rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>
                  Forgot your password?
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="alert-error" role="alert" style={{ marginBottom: '1.25rem' }}>
                  ⚠&nbsp; {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                <div>
                  <label htmlFor="forgot-email" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#475569', marginBottom: '0.4rem' }}>
                    Email address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) setError('') }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className={`auth-input${error ? ' error' : ''}`}
                  />
                </div>

                <button
                  id="forgot-submit"
                  type="submit"
                  disabled={submitting}
                  className="auth-btn"
                >
                  {submitting && <span className="spinner" />}
                  {submitting ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
                Remember your password?{' '}
                <Link
                  to="/login"
                  style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => (e.target.style.color = '#4338ca')}
                  onMouseLeave={(e) => (e.target.style.color = '#4f46e5')}
                >
                  Sign in →
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

function AuthLayout({ children }) {
  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', overflow: 'hidden', background: '#0f172a' }}>

      {/* Left branding panel */}
      <div style={{
        display: 'none',
        flex: '0 0 45%',
        height: '100%',
        background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #4f46e5 100%)',
        padding: '3rem',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="auth-left-panel"
      >
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '360px', height: '360px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'absolute', bottom: '-120px', left: '-60px', width: '440px', height: '440px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem',
          }}>◈</div>
          <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
            Internship<span style={{ color: '#a5b4fc' }}>Hub</span>
          </span>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Secure access<br />to your account.
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(165,180,252,0.85)', lineHeight: 1.7, maxWidth: '340px' }}>
            Enter your email and we'll send you a secure link to reset your password.
          </p>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'rgba(165,180,252,0.5)', position: 'relative', zIndex: 1 }}>
          © 2025 InternshipHub. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: '#f8fafc',
        position: 'relative',
        overflowY: 'auto',
      }}>
        <div aria-hidden="true" style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '300px', pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(99,102,241,0.12) 0%, transparent 70%)',
        }} />

        <div style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
          {children}
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .auth-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

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
    <AuthLayout>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.125rem', boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
          }}>◈</div>
          <span style={{ fontWeight: 700, fontSize: '1.125rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
            Internship<span style={{ color: '#4f46e5' }}>Hub</span>
          </span>
        </Link>
      </div>

      {/* Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '1.25rem',
        padding: '2.25rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.08)',
      }}>
        {sent ? (
          /* Success state */
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
          /* Request form */
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
                  id="forgot-email" type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError('') }}
                  placeholder="you@example.com" autoComplete="email" required
                  className={`auth-input${error ? ' error' : ''}`}
                />
              </div>

              <button id="forgot-submit" type="submit" disabled={submitting} className="auth-btn">
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
              <Link to="/login"
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
    </AuthLayout>
  )
}

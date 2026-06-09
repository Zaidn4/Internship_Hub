import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/* ── Shared background wrapper ───────────────────────────────────────────── */
function AuthLayout({ children }) {
  return (
    <div style={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      overflow: 'hidden',
      background: '#0f172a',
    }}>

      {/* ── Left Panel — branding ───────────────────────────────────────── */}
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
        {/* Decorative circles */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '360px', height: '360px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'absolute', bottom: '-120px', left: '-60px', width: '440px', height: '440px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
          <div style={{ position: 'absolute', top: '40%', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(139,92,246,0.2)' }} />
        </div>

        {/* Logo */}
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

        {/* Headline copy */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Connect talent<br />with opportunity.
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(165,180,252,0.85)', lineHeight: 1.7, maxWidth: '340px' }}>
            Join thousands of students and companies using InternshipHub to find the perfect match.
          </p>

          {/* Feature pills */}
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { icon: '🎓', text: 'Browse hundreds of verified internships' },
              { icon: '🏢', text: 'Connect with top companies directly' },
              { icon: '🔔', text: 'Get notified on application updates' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem', flexShrink: 0,
                }}>{icon}</span>
                <span style={{ fontSize: '0.875rem', color: 'rgba(199,210,254,0.9)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ fontSize: '0.75rem', color: 'rgba(165,180,252,0.5)', position: 'relative', zIndex: 1 }}>
          © 2025 InternshipHub. All rights reserved.
        </p>
      </div>

      {/* ── Right Panel — form ──────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: '#f8fafc',
        position: 'relative',
        overflowY: 'auto',
      }}>
        {/* Soft top glow */}
        <div aria-hidden="true" style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '300px', pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(99,102,241,0.12) 0%, transparent 70%)',
        }} />

        <div style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
          {children}
        </div>
      </div>

      {/* ── CSS for left panel responsive show ─────────────────────────── */}
      <style>{`
        @media (min-width: 900px) {
          .auth-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

/* ── Login Page ──────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm]             = useState({ email: '', password: '' })
  const [error, setError]           = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      {/* Logo (mobile only — hidden on desktop since left panel shows it) */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.125rem', boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
          }}>◈</div>
          <span style={{ fontWeight: 700, fontSize: '1.125rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
            Internship<span style={{ color: '#4f46e5' }}>Hub</span>
          </span>
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '1.25rem',
        padding: '2.25rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.08)',
      }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>
            Welcome back
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Sign in to your InternshipHub account
          </p>
        </div>

        {error && (
          <div className="alert-error" role="alert" style={{ marginBottom: '1.25rem' }}>
            ⚠&nbsp; {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <div>
            <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#475569', marginBottom: '0.4rem' }}>
              Email address
            </label>
            <input
              id="login-email" type="email" name="email"
              value={form.email} onChange={handleChange}
              placeholder="you@example.com" autoComplete="email" required
              className={`auth-input${error ? ' error' : ''}`}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label htmlFor="login-password" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#475569' }}>
                Password
              </label>
              <Link to="/forgot-password"
                style={{ fontSize: '0.78rem', color: '#64748b', textDecoration: 'none', transition: 'color 0.15s ease' }}
                onMouseEnter={(e) => (e.target.style.color = '#4f46e5')}
                onMouseLeave={(e) => (e.target.style.color = '#64748b')}
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password" type="password" name="password"
              value={form.password} onChange={handleChange}
              placeholder="••••••••" autoComplete="current-password" required
              className={`auth-input${error ? ' error' : ''}`}
            />
          </div>

          <button id="login-submit" type="submit" disabled={submitting} className="auth-btn" style={{ marginTop: '0.375rem' }}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register"
            style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => (e.target.style.color = '#4338ca')}
            onMouseLeave={(e) => (e.target.style.color = '#4f46e5')}
          >
            Create one →
          </Link>
        </p>
      </div>

      <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>
        By signing in you agree to our Terms &amp; Privacy Policy.
      </p>
    </AuthLayout>
  )
}

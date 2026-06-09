import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const INITIAL_FORM = {
  name:                  '',
  email:                 '',
  password:              '',
  password_confirmation: '',
  role:                  'student',
  company_name:          '',
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate      = useNavigate()

  const [form, setForm]               = useState(INITIAL_FORM)
  const [errors, setErrors]           = useState({})
  const [globalError, setGlobalError] = useState('')
  const [submitting, setSubmitting]   = useState(false)

  const isCompany = form.role === 'company'

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
    if (globalError) setGlobalError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    setGlobalError('')

    const payload = {
      name:                  form.name,
      email:                 form.email,
      password:              form.password,
      password_confirmation: form.password_confirmation,
      role:                  form.role,
      ...(isCompany && { company_name: form.company_name }),
    }

    try {
      await register(payload)
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      if (err.response?.status === 422 && data?.errors) {
        setErrors(data.errors)
      } else {
        setGlobalError(data?.message ?? 'Registration failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const fieldError = (name) =>
    errors[name] ? (
      <p className="field-error" role="alert">
        <span>✕</span> {errors[name][0]}
      </p>
    ) : null

  return (
    /* ── Master container — locked to viewport, no scroll ── */
    <div style={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      overflow: 'hidden',
      background: '#0f172a',
    }}>

      {/* ── Left Panel — branding ─────────────────────────────────────────── */}
      <div style={{
        display: 'none',
        flex: '0 0 42%',
        height: '100%',
        background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #4f46e5 100%)',
        padding: '2.5rem',
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
          <div style={{ position: 'absolute', top: '40%', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(139,92,246,0.15)' }} />
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

        {/* Headline + features */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Start your<br />career journey.
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(165,180,252,0.85)', lineHeight: 1.7, maxWidth: '340px' }}>
            Create your free account and connect with top companies looking for talent like you.
          </p>

          <div style={{ marginTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { icon: '✅', text: 'Free forever for students' },
              { icon: '⚡', text: 'Apply to internships in seconds' },
              { icon: '📊', text: 'Track all your applications in one place' },
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

        <p style={{ fontSize: '0.75rem', color: 'rgba(165,180,252,0.5)', position: 'relative', zIndex: 1 }}>
          © 2025 InternshipHub. All rights reserved.
        </p>
      </div>

      {/* ── Right Panel — form, centered, no outer scroll ─────────────────── */}
      <div style={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        position: 'relative',
        overflowY: 'auto',   /* internal scroll only if viewport is very short */
        padding: '1.5rem',
      }}>
        {/* Soft top glow */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '260px', pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(99,102,241,0.10) 0%, transparent 70%)',
        }} />

        <div style={{ width: '100%', maxWidth: '460px', position: 'relative' }}>

          {/* ── White form card ───────────────────────────────────────────── */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '1.25rem',
            padding: '1.75rem 2rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.08)',
          }}>
            {/* Card header */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
                Create your account
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Join InternshipHub — it&apos;s completely free.
              </p>
            </div>

            {globalError && (
              <div className="alert-error" role="alert" style={{ marginBottom: '1rem' }}>
                ⚠&nbsp; {globalError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

              {/* Role selector */}
              <div>
                <label htmlFor="register-role" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#475569', marginBottom: '0.3rem' }}>
                  I am a…
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    id="register-role" name="role" value={form.role} onChange={handleChange}
                    className="auth-input"
                    style={{ cursor: 'pointer', paddingRight: '2.5rem', paddingTop: '0.6rem', paddingBottom: '0.6rem' }}
                  >
                    <option value="student">🎓  Student — looking for internships</option>
                    <option value="company">🏢  Company — posting internships</option>
                  </select>
                  <span aria-hidden="true" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', fontSize: '0.7rem' }}>▼</span>
                </div>
              </div>

              {/* Company name */}
              {isCompany && (
                <div className="slide-down">
                  <label htmlFor="register-company-name" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#475569', marginBottom: '0.3rem' }}>
                    Company name <span style={{ color: '#4f46e5' }}>*</span>
                  </label>
                  <input
                    id="register-company-name" type="text" name="company_name"
                    value={form.company_name} onChange={handleChange}
                    placeholder="e.g. Acme Corp" autoComplete="organization"
                    className={`auth-input${errors.company_name ? ' error' : ''}`}
                    style={{ paddingTop: '0.6rem', paddingBottom: '0.6rem' }}
                  />
                  {fieldError('company_name')}
                </div>
              )}

              {/* Full name */}
              <div>
                <label htmlFor="register-name" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#475569', marginBottom: '0.3rem' }}>
                  Full name
                </label>
                <input
                  id="register-name" type="text" name="name"
                  value={form.name} onChange={handleChange}
                  placeholder="Jane Doe" autoComplete="name"
                  className={`auth-input${errors.name ? ' error' : ''}`}
                  style={{ paddingTop: '0.6rem', paddingBottom: '0.6rem' }}
                />
                {fieldError('name')}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="register-email" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#475569', marginBottom: '0.3rem' }}>
                  Email address
                </label>
                <input
                  id="register-email" type="email" name="email"
                  value={form.email} onChange={handleChange}
                  placeholder="you@example.com" autoComplete="email"
                  className={`auth-input${errors.email ? ' error' : ''}`}
                  style={{ paddingTop: '0.6rem', paddingBottom: '0.6rem' }}
                />
                {fieldError('email')}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="register-password" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#475569', marginBottom: '0.3rem' }}>
                  Password
                </label>
                <input
                  id="register-password" type="password" name="password"
                  value={form.password} onChange={handleChange}
                  placeholder="Min. 8 characters" autoComplete="new-password"
                  className={`auth-input${errors.password ? ' error' : ''}`}
                  style={{ paddingTop: '0.6rem', paddingBottom: '0.6rem' }}
                />
                {fieldError('password')}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="register-password-confirm" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#475569', marginBottom: '0.3rem' }}>
                  Confirm password
                </label>
                <input
                  id="register-password-confirm" type="password" name="password_confirmation"
                  value={form.password_confirmation} onChange={handleChange}
                  placeholder="••••••••" autoComplete="new-password"
                  className={`auth-input${errors.password_confirmation ? ' error' : ''}`}
                  style={{ paddingTop: '0.6rem', paddingBottom: '0.6rem' }}
                />
                {fieldError('password_confirmation')}
              </div>

              <button
                id="register-submit" type="submit" disabled={submitting}
                className="auth-btn"
                style={{ marginTop: '0.25rem', padding: '0.7rem 1.5rem' }}
              >
                {submitting && <span className="spinner" />}
                {submitting ? 'Creating account…' : 'Create free account'}
              </button>
            </form>

            {/* Divider + sign-in link */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.1rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
              Already have an account?{' '}
              <Link to="/login"
                style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}
                onMouseEnter={(e) => (e.target.style.color = '#4338ca')}
                onMouseLeave={(e) => (e.target.style.color = '#4f46e5')}
              >
                Sign in →
              </Link>
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            By registering you agree to our Terms &amp; Privacy Policy.
          </p>
        </div>
      </div>

      {/* Show left panel on desktop */}
      <style>{`
        @media (min-width: 900px) {
          .auth-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

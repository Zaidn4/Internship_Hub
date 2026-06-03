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
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
      {/* Soft light mesh background */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(199,210,254,0.5) 0%, transparent 65%)',
      }} />

      <div style={{ width: '100%', maxWidth: '480px', position: 'relative' }}>
        {/* Logo mark */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.125rem', boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
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
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08)',
        }}>
          {/* Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>
              Create your account
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Join InternshipHub — it&apos;s completely free.
            </p>
          </div>

          {/* Global error */}
          {globalError && (
            <div className="alert-error" role="alert" style={{ marginBottom: '1.25rem' }}>
              ⚠&nbsp; {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

            {/* Role selector */}
            <div>
              <label htmlFor="register-role" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#475569', marginBottom: '0.4rem' }}>
                I am a…
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="register-role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="auth-input"
                  style={{ cursor: 'pointer', paddingRight: '2.5rem' }}
                >
                  <option value="student">🎓  Student — looking for internships</option>
                  <option value="company">🏢  Company — posting internships</option>
                </select>
                <span aria-hidden="true" style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  color: '#94a3b8', pointerEvents: 'none', fontSize: '0.7rem',
                }}>▼</span>
              </div>
            </div>

            {/* Company name (animated in) */}
            {isCompany && (
              <div className="slide-down">
                <label htmlFor="register-company-name" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#475569', marginBottom: '0.4rem' }}>
                  Company name <span style={{ color: '#4f46e5' }}>*</span>
                </label>
                <input
                  id="register-company-name"
                  type="text"
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                  autoComplete="organization"
                  className={`auth-input${errors.company_name ? ' error' : ''}`}
                />
                {fieldError('company_name')}
              </div>
            )}

            {/* Full name */}
            <div>
              <label htmlFor="register-name" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#475569', marginBottom: '0.4rem' }}>
                Full name
              </label>
              <input
                id="register-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                autoComplete="name"
                className={`auth-input${errors.name ? ' error' : ''}`}
              />
              {fieldError('name')}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#475569', marginBottom: '0.4rem' }}>
                Email address
              </label>
              <input
                id="register-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className={`auth-input${errors.email ? ' error' : ''}`}
              />
              {fieldError('email')}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#475569', marginBottom: '0.4rem' }}>
                Password
              </label>
              <input
                id="register-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                className={`auth-input${errors.password ? ' error' : ''}`}
              />
              {fieldError('password')}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="register-password-confirm" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#475569', marginBottom: '0.4rem' }}>
                Confirm password
              </label>
              <input
                id="register-password-confirm"
                type="password"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`auth-input${errors.password_confirmation ? ' error' : ''}`}
              />
              {fieldError('password_confirmation')}
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={submitting}
              className="auth-btn"
              style={{ marginTop: '0.375rem' }}
            >
              {submitting && <span className="spinner" />}
              {submitting ? 'Creating account…' : 'Create free account'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s ease' }}
              onMouseEnter={(e) => (e.target.style.color = '#4338ca')}
              onMouseLeave={(e) => (e.target.style.color = '#4f46e5')}
            >
              Sign in →
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          By registering you agree to our Terms &amp; Privacy Policy.
        </p>
      </div>
    </div>
  )
}

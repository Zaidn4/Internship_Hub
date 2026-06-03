import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import AvatarUpload from '../../components/common/AvatarUpload'
import Toast from '../../components/common/Toast'
import ChangePasswordSection from '../../components/common/ChangePasswordSection'

const INITIAL = {
  company_name: '',
  website:      '',
  description:  '',
}

// ── Field must live OUTSIDE CompanyProfile so React never remounts it ─────────
// Defining a component inside a parent body causes React to treat it as a new
// component type on every render → input loses focus after every keystroke.
function Field({ label, icon, name, type = 'text', placeholder, textarea, value, onChange, error }) {
  const labelStyle = {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    fontSize: '0.8rem', fontWeight: 600, color: '#64748b',
    marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em',
  }
  return (
    <div>
      <label htmlFor={`company-${name}`} style={labelStyle}>
        {icon && <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>{icon}</span>}
        {label}
      </label>
      {textarea ? (
        <textarea
          id={`company-${name}`}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={6}
          className={`auth-input${error ? ' error' : ''}`}
          style={{ resize: 'vertical', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', minHeight: '140px' }}
        />
      ) : (
        <input
          id={`company-${name}`}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`auth-input${error ? ' error' : ''}`}
          style={{ width: '100%', boxSizing: 'border-box' }}
        />
      )}
      {error && (
        <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '0.3rem' }}>✕ {error}</p>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CompanyProfile() {
  const { user, updateUser } = useAuth()
  const profile = user?.profile

  const [form, setForm]     = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState(null)

  // Prefill from existing profile in AuthContext
  useEffect(() => {
    if (profile) {
      setForm({
        company_name: profile.company_name ?? '',
        website:      profile.website      ?? '',
        description:  profile.description  ?? '',
      })
    }
  }, [profile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const res = await api.put('/company/profile', form)
      if (res.data?.user) updateUser(res.data.user)
      setToast({ message: 'Company profile saved! ✓', type: 'success' })
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {})
      } else {
        setToast({ message: err.response?.data?.message ?? 'Failed to save. Please try again.', type: 'error' })
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Shared style tokens ─────────────────────────────────────────────────────
  const card = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  }

  const accentLabel = {
    fontSize: '0.72rem', fontWeight: 700, color: '#6366f1',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem',
  }

  const divider = {
    borderTop: '1px solid #f1f5f9',
    marginBottom: '1.25rem',
    paddingTop: '1.25rem',
  }

  return (
    <div style={{ width: '100%' }}>
      {/* ── Page-level 2-col grid ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* ══════════════════════════════════════════════════════════════════
            LEFT COLUMN — Logo / Avatar + Security
        ══════════════════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Avatar / Logo card */}
          <div style={card}>
            <AvatarUpload user={user} onSuccess={updateUser} />
          </div>

          {/* Company quick-stats card */}
          <div style={card}>
            <p style={accentLabel}>Company snapshot</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{
                  width: '32px', height: '32px', borderRadius: '0.5rem', flexShrink: 0,
                  background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem',
                }}>🏢</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>Company Name</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {form.company_name || <span style={{ color: '#cbd5e1' }}>Not set</span>}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{
                  width: '32px', height: '32px', borderRadius: '0.5rem', flexShrink: 0,
                  background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem',
                }}>🌐</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>Website</p>
                  {form.website ? (
                    <a
                      href={form.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4f46e5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', textDecoration: 'none' }}
                    >
                      {form.website.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    <p style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Not set</p>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Change Password */}
          <ChangePasswordSection />

        </div>

        {/* ══════════════════════════════════════════════════════════════════
            RIGHT COLUMN — Main profile form
        ══════════════════════════════════════════════════════════════════ */}
        <div style={card}>
          {/* Card header */}
          <div style={{ marginBottom: '1.25rem', paddingBottom: '1.125rem', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.9375rem', letterSpacing: '-0.01em', marginBottom: '0.2rem' }}>
              Company Profile
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.5 }}>
              Update your company information visible to students and recruiters.
            </p>
          </div>

          <form id="company-profile-form" onSubmit={handleSubmit} noValidate>

            {/* ── Section: Identity ──────────────────────────────────────── */}
            <p style={accentLabel}>Identity</p>

            {/* Row 1: Company Name + Website */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <Field
                label="Company Name"
                icon="🏢"
                name="company_name"
                placeholder="e.g. Acme Corp"
                value={form.company_name}
                onChange={handleChange}
                error={errors.company_name?.[0]}
              />
              <Field
                label="Website"
                icon="🌐"
                name="website"
                type="url"
                placeholder="https://acme.com"
                value={form.website}
                onChange={handleChange}
                error={errors.website?.[0]}
              />
            </div>

            {/* ── Section: About ─────────────────────────────────────────── */}
            <div style={divider}>
              <p style={accentLabel}>About the company</p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <Field
                label="Description"
                icon="📝"
                name="description"
                placeholder="Tell students about your company, culture, and the type of work you do…"
                textarea
                value={form.description}
                onChange={handleChange}
                error={errors.description?.[0]}
              />
              <p style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '0.25rem', textAlign: 'right' }}>
                {form.description.length} / 5000
              </p>
            </div>

            {/* ── Submit ─────────────────────────────────────────────────── */}
            <div style={{ paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                id="company-profile-save"
                type="submit"
                disabled={saving}
                className="auth-btn"
                style={{ width: 'auto', padding: '0.65rem 2.5rem' }}
              >
                {saving && <span className="spinner" />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>

      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

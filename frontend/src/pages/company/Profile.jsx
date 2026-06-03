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
function Field({ label, name, type = 'text', placeholder, textarea, value, onChange, error }) {
  return (
    <div>
      <label
        htmlFor={`company-${name}`}
        style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#475569', marginBottom: '0.4rem' }}
      >
        {label}
      </label>
      {textarea ? (
        <textarea
          id={`company-${name}`}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          className={`auth-input${error ? ' error' : ''}`}
          style={{ resize: 'vertical', fontFamily: 'inherit' }}
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

  return (
    <div style={{ maxWidth: '680px' }}>

      {/* ── Avatar header ─────────────────────────────────────────────────── */}
      <AvatarUpload user={user} onSuccess={updateUser} />

      {/* ── Section title ───────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
          Company Profile
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Update your company information visible to students.
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0',
        borderRadius: '1rem', padding: '1.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <Field
            label="Company Name"
            name="company_name"
            placeholder="Acme Corp"
            value={form.company_name}
            onChange={handleChange}
            error={errors.company_name?.[0]}
          />
          <Field
            label="Website"
            name="website"
            type="url"
            placeholder="https://acme.com"
            value={form.website}
            onChange={handleChange}
            error={errors.website?.[0]}
          />
          <Field
            label="Description"
            name="description"
            placeholder="Tell students about your company…"
            textarea
            value={form.description}
            onChange={handleChange}
            error={errors.description?.[0]}
          />

          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              id="company-profile-save"
              type="submit"
              disabled={saving}
              className="auth-btn"
              style={{ width: 'auto', padding: '0.6875rem 1.75rem' }}
            >
              {saving && <span className="spinner" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* ── Change Password ────────────────────────────────────── */}
      <ChangePasswordSection />
    </div>
  )
}

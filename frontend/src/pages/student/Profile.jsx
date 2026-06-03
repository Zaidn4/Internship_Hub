import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { updateProfile } from '../../services/profileService'
import { getSkills, syncStudentSkills } from '../../services/skillService'
import AvatarUpload from '../../components/common/AvatarUpload'
import SkillPicker from '../../components/common/SkillPicker'
import Toast from '../../components/common/Toast'
import ChangePasswordSection from '../../components/common/ChangePasswordSection'

const CV_BASE_URL = 'http://localhost:8000/storage/'

// ── Shared sub-components ─────────────────────────────────────────────────────

function SectionCard({ title, subtitle, children }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '1rem',
      padding: '1.625rem',
      marginBottom: '1.25rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ marginBottom: '1.375rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
        <h2 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem', letterSpacing: '-0.01em' }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ color: '#64748b', fontSize: '0.8125rem', lineHeight: 1.5 }}>{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  )
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#475569', marginBottom: '0.4rem' }}
    >
      {children}
    </label>
  )
}

function TextInput({ id, value, onChange, placeholder, maxLength }) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="auth-input"
    />
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function StudentProfile() {
  const { user, refreshUser } = useAuth()
  const profile = user?.profile

  const [university, setUniversity] = useState(profile?.university ?? '')
  const [bio, setBio]               = useState(profile?.bio ?? '')
  const [cvFile, setCvFile]         = useState(null)
  const [cvPath, setCvPath]         = useState(profile?.cv_path ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast]           = useState(null)

  const [skillsAll, setSkillsAll]           = useState([])
  const [skillsLoading, setSkillsLoading]   = useState(true)
  const [selectedSkills, setSelectedSkills] = useState(
    () => (profile?.skills ?? []).map((s) => s.id)
  )

  const fileInputRef = useRef(null)

  useEffect(() => {
    getSkills()
      .then(setSkillsAll)
      .catch(() => {})
      .finally(() => setSkillsLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData()
    if (university.trim()) formData.append('university', university.trim())
    if (bio.trim())        formData.append('bio',        bio.trim())
    if (cvFile)            formData.append('cv',         cvFile)

    try {
      const [profileData] = await Promise.all([
        updateProfile(formData),
        syncStudentSkills(selectedSkills),
      ])

      if (profileData.profile?.cv_path) setCvPath(profileData.profile.cv_path)

      setCvFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''

      await refreshUser()
      setToast({ message: 'Profile updated successfully! 🎉', type: 'success' })
    } catch (err) {
      const errors  = err.response?.data?.errors
      const message = err.response?.data?.message
      const firstError = errors
        ? Object.values(errors)[0]?.[0]
        : message ?? 'Failed to save profile. Please try again.'
      setToast({ message: firstError, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileChange = (e) => {
    setCvFile(e.target.files?.[0] ?? null)
  }


  return (
    <div style={{ maxWidth: '700px' }}>

      {/* ── Avatar + name header ────────────────────────────────────── */}
      <AvatarUpload user={user} onSuccess={refreshUser} />

      <form id="profile-form" onSubmit={handleSubmit}>

        {/* ── Personal Information ──────────────────────────────────────────── */}
        <SectionCard
          title="Personal Information"
          subtitle="This information helps companies understand your background."
        >
          <div style={{ marginBottom: '1.125rem' }}>
            <FieldLabel htmlFor="university">University / Institution</FieldLabel>
            <TextInput
              id="university"
              value={university}
              onChange={setUniversity}
              placeholder="e.g. University of Manchester"
              maxLength={255}
            />
          </div>

          <div style={{ marginBottom: '1.125rem' }}>
            <FieldLabel htmlFor="bio">Bio</FieldLabel>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell companies a little about yourself, your skills, and what you're looking for…"
              rows={4}
              maxLength={2000}
              className="auth-input"
              style={{ resize: 'vertical', minHeight: '100px', maxHeight: '320px', lineHeight: 1.6, fontFamily: 'inherit' }}
            />
            <p style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '0.35rem', textAlign: 'right' }}>
              {bio.length} / 2000
            </p>
          </div>

          <div>
            <SkillPicker
              label="Your Skills"
              skills={skillsAll}
              selected={selectedSkills}
              onChange={setSelectedSkills}
              loading={skillsLoading}
            />
          </div>
        </SectionCard>

        {/* ── CV / Resume ───────────────────────────────────────────────────── */}
        <SectionCard
          title="CV / Resume"
          subtitle="Upload a PDF. Your CV is snapshotted on application — updates won't affect past submissions."
        >
          {/* Current CV status */}
          {cvPath ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.875rem 1rem', borderRadius: '0.75rem',
              background: '#ecfdf5', border: '1px solid #a7f3d0',
              marginBottom: '1.125rem',
            }}>
              <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>📄</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#059669', fontWeight: 600, fontSize: '0.8125rem' }}>CV Uploaded ✓</p>
                <p style={{ color: '#64748b', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {cvPath.split('/').pop()}
                </p>
              </div>
              <a
                href={`${CV_BASE_URL}${cvPath}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flexShrink: 0, padding: '0.35rem 0.75rem', borderRadius: '0.45rem',
                  border: '1px solid #a7f3d0', background: '#d1fae5', color: '#059669',
                  fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#a7f3d0' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#d1fae5' }}
              >
                View ↗
              </a>
            </div>
          ) : (
            <div style={{
              padding: '0.875rem 1rem', borderRadius: '0.75rem',
              background: '#f8fafc', border: '1px dashed #cbd5e1',
              marginBottom: '1.125rem', color: '#64748b', fontSize: '0.8125rem',
              display: 'flex', alignItems: 'center', gap: '0.625rem',
            }}>
              <span>📭</span> No CV uploaded yet.
            </div>
          )}

          {/* File picker */}
          <div>
            <FieldLabel htmlFor="cv-upload">
              {cvPath ? 'Replace CV (PDF, max 2 MB)' : 'Upload CV (PDF, max 2 MB)'}
            </FieldLabel>

            <input
              ref={fileInputRef}
              id="cv-upload"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '0.575rem 1.1rem', borderRadius: '0.55rem',
                  border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569',
                  fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0' }}
              >
                📎 Choose PDF file
              </button>

              {cvFile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 500 }}>
                    ✓ {cvFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setCvFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.875rem', padding: '0 0.2rem', lineHeight: 1 }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>No file chosen</span>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ── Submit ────────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
          <button
            id="save-profile-btn"
            type="submit"
            disabled={submitting}
            className="auth-btn"
            style={{ width: 'auto', padding: '0.75rem 2rem' }}
          >
            {submitting && <span className="spinner" />}
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* ── Change Password ────────────────────────────────────────────────── */}
      <ChangePasswordSection />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

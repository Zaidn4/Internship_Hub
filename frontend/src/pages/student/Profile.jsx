import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { updateProfile } from '../../services/profileService'
import { getSkills, syncStudentSkills } from '../../services/skillService'
import AvatarUpload from '../../components/common/AvatarUpload'
import SkillPicker from '../../components/common/SkillPicker'
import Toast from '../../components/common/Toast'
import ChangePasswordSection from '../../components/common/ChangePasswordSection'

const CV_BASE_URL = 'http://localhost:8000/storage/'

// ── Shared field label ────────────────────────────────────────────────────────

function FieldLabel({ htmlFor, icon, children }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}
    >
      {icon && <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>{icon}</span>}
      {children}
    </label>
  )
}

function TextInput({ id, value, onChange, placeholder, maxLength, type = 'text' }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="auth-input"
      style={{ width: '100%', boxSizing: 'border-box' }}
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

  const [phone,        setPhone]        = useState(profile?.phone         ?? '')
  const [linkedinLink, setLinkedinLink] = useState(profile?.linkedin_link ?? '')
  const [githubLink,   setGithubLink]   = useState(profile?.github_link   ?? '')
  const [languages,    setLanguages]    = useState(profile?.languages      ?? '')

  const [skillsAll, setSkillsAll]           = useState([])
  const [skillsLoading, setSkillsLoading]   = useState(true)
  const [selectedSkills, setSelectedSkills] = useState(
    () => (profile?.skills ?? []).map((s) => s.id)
  )

  const fileInputRef = useRef(null)

  useEffect(() => {
    if (profile) {
      setUniversity(profile.university || '')
      setBio(profile.bio || '')
      setCvPath(profile.cv_path || null)
      setPhone(profile.phone || '')
      setLinkedinLink(profile.linkedin_link || '')
      setGithubLink(profile.github_link || '')
      setLanguages(profile.languages || '')
      setSelectedSkills((profile.skills || []).map((s) => s.id))
    }
  }, [profile])

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
    if (university.trim())   formData.append('university',    university.trim())
    if (bio.trim())          formData.append('bio',           bio.trim())
    if (cvFile)              formData.append('cv',            cvFile)
    formData.append('phone',         phone.trim())
    formData.append('linkedin_link', linkedinLink.trim())
    formData.append('github_link',   githubLink.trim())
    formData.append('languages',     languages.trim())

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

  const handleFileChange = (e) => setCvFile(e.target.files?.[0] ?? null)

  // ─────────────────────────────────────────────────────────────────────────

  const card = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  }

  const sectionTitle = {
    color: '#0f172a', fontWeight: 700, fontSize: '0.9375rem',
    letterSpacing: '-0.01em', marginBottom: '0.2rem',
  }

  const sectionSub = {
    color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.5,
  }

  const divider = {
    borderTop: '1px solid #f1f5f9', marginBottom: '1.25rem', paddingTop: '1.25rem',
  }

  return (
    <div style={{ width: '100%' }}>
      {/* ── Page-level 2-col grid ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* ══════════════════════════════════════════════════════════════════
            LEFT COLUMN — Identity, CV, Security
        ══════════════════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Avatar Card */}
          <div style={card}>
            <AvatarUpload user={user} onSuccess={refreshUser} />
          </div>

          {/* CV / Resume Card */}
          <div style={card}>
            <p style={sectionTitle}>CV / Resume</p>
            <p style={{ ...sectionSub, marginBottom: '1rem' }}>
              Upload a PDF. Snapshotted on application.
            </p>

            {cvPath ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.75rem', borderRadius: '0.75rem',
                background: '#ecfdf5', border: '1px solid #a7f3d0',
                marginBottom: '1rem',
              }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>📄</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#059669', fontWeight: 600, fontSize: '0.8rem' }}>CV Uploaded ✓</p>
                  <p style={{ color: '#64748b', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cvPath.split('/').pop()}
                  </p>
                </div>
                <a
                  href={`${CV_BASE_URL}${cvPath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flexShrink: 0, padding: '0.3rem 0.65rem', borderRadius: '0.4rem',
                    border: '1px solid #a7f3d0', background: '#d1fae5', color: '#059669',
                    fontSize: '0.72rem', fontWeight: 600, textDecoration: 'none',
                  }}
                >
                  View ↗
                </a>
              </div>
            ) : (
              <div style={{
                padding: '0.75rem', borderRadius: '0.75rem',
                background: '#f8fafc', border: '1px dashed #cbd5e1',
                marginBottom: '1rem', color: '#94a3b8', fontSize: '0.8rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span>📭</span> No CV uploaded yet.
              </div>
            )}

            <input
              ref={fileInputRef}
              id="cv-upload"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%', padding: '0.5rem', borderRadius: '0.5rem',
                border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569',
                fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc' }}
            >
              📎 {cvPath ? 'Replace PDF' : 'Upload PDF'}
            </button>
            {cvFile && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  ✓ {cvFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => { setCvFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0 0.25rem', fontSize: '0.875rem', lineHeight: 1, flexShrink: 0 }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Change Password Card */}
          <ChangePasswordSection />

        </div>

        {/* ══════════════════════════════════════════════════════════════════
            RIGHT COLUMN — Main profile form
        ══════════════════════════════════════════════════════════════════ */}
        <div style={card}>

          {/* Card header */}
          <div style={{ marginBottom: '1.25rem', paddingBottom: '1.125rem', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={sectionTitle}>Profile Information</h2>
            <p style={sectionSub}>Update your personal and professional details. This is what companies see.</p>
          </div>

          <form id="profile-form" onSubmit={handleSubmit}>

            {/* ── Section: Personal ──────────────────────────────────────── */}
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
              Personal
            </p>

            {/* Row 1: University + Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <FieldLabel htmlFor="university" icon="🎓">University</FieldLabel>
                <TextInput
                  id="university"
                  value={university}
                  onChange={setUniversity}
                  placeholder="e.g. University of Manchester"
                  maxLength={255}
                />
              </div>
              <div>
                <FieldLabel htmlFor="phone" icon="📞">Phone</FieldLabel>
                <TextInput
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  placeholder="+44 7700 900000"
                  maxLength={30}
                />
              </div>
            </div>

            {/* Row 2: Languages (full width) */}
            <div style={{ marginBottom: '1rem' }}>
              <FieldLabel htmlFor="languages" icon="🌐">Languages</FieldLabel>
              <TextInput
                id="languages"
                value={languages}
                onChange={setLanguages}
                placeholder="e.g. English, French, Spanish"
                maxLength={255}
              />
            </div>

            {/* Row 3: Bio (full width) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <FieldLabel htmlFor="bio" icon="📝">Bio</FieldLabel>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell companies about yourself, your skills, and what you're looking for…"
                rows={4}
                maxLength={2000}
                className="auth-input"
                style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: '100px', maxHeight: '220px', lineHeight: 1.6, fontFamily: 'inherit' }}
              />
              <p style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '0.25rem', textAlign: 'right' }}>
                {bio.length} / 2000
              </p>
            </div>

            {/* ── Section: Online Presence ───────────────────────────────── */}
            <div style={divider}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
                Online Presence
              </p>
            </div>

            {/* Row 4: LinkedIn + GitHub */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <FieldLabel htmlFor="linkedin-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#0077b5"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.27c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.27h-3v-5.5c0-1.38-.02-3.16-1.93-3.16-1.93 0-2.23 1.51-2.23 3.06v5.6h-3v-10h2.88v1.36h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.6v5.6z"/></svg>
                  LinkedIn
                </FieldLabel>
                <TextInput
                  id="linkedin-link"
                  type="url"
                  value={linkedinLink}
                  onChange={setLinkedinLink}
                  placeholder="https://linkedin.com/in/yourname"
                  maxLength={255}
                />
              </div>
              <div>
                <FieldLabel htmlFor="github-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#1e293b"><path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.31 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.41 1.02.01 2.04.14 3 .41 2.28-1.55 3.29-1.23 3.29-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58C20.56 22.3 24 17.81 24 12.5 24 5.87 18.63.5 12 .5z"/></svg>
                  GitHub
                </FieldLabel>
                <TextInput
                  id="github-link"
                  type="url"
                  value={githubLink}
                  onChange={setGithubLink}
                  placeholder="https://github.com/yourhandle"
                  maxLength={255}
                />
              </div>
            </div>

            {/* ── Section: Skills ────────────────────────────────────────── */}
            <div style={divider}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
                Skills
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <SkillPicker
                label="Your Skills"
                skills={skillsAll}
                selected={selectedSkills}
                onChange={setSelectedSkills}
                loading={skillsLoading}
              />
            </div>

            {/* ── Submit ─────────────────────────────────────────────────── */}
            <div style={{
              paddingTop: '1.25rem',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button
                id="save-profile-btn"
                type="submit"
                disabled={submitting}
                className="auth-btn"
                style={{ width: 'auto', padding: '0.65rem 2.5rem' }}
              >
                {submitting && <span className="spinner" />}
                {submitting ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>

      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
